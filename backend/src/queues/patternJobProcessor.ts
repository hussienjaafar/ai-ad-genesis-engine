
import { patternQueue } from './etlQueue';
import * as ss from 'simple-statistics';

/**
 * Calculate chi-square statistic for a contingency table using simple-statistics
 */
export function calculateChiSquare(table: number[][]): number {
  try {
    // We're using the chi-square test from simple-statistics
    const result = ss.chiSquaredGoodnessOfFit(
      [table[0][0], table[1][0]],  // observed values (clicks)
      [
        (table[0][0] + table[0][1]) * (table[0][0] + table[1][0]) / (table[0][0] + table[0][1] + table[1][0] + table[1][1]),
        (table[1][0] + table[1][1]) * (table[0][0] + table[1][0]) / (table[0][0] + table[0][1] + table[1][0] + table[1][1])
      ] // expected values
    );
    // @ts-ignore chiSquaredGoodnessOfFit does not return an object, just a number
    return typeof result === 'number' ? result : (result.chiSquared || 0);
  } catch (error) {
    console.error('Error calculating chi-square:', error);
    return 0;
  }
}

/**
 * Get p-value from chi-square statistic with 1 degree of freedom
 */
export function getPValue(chiSquare: number): number {
  try {
    // There is no chiSquaredDistributionTable in simple-statistics.
    // Use the complementary CDF for chi-squared distribution with 1 degree of freedom.
    if (typeof ss.chiSquaredDistributionTable === 'function') {
      // @ts-ignore If old version exists
      return 1 - ss.chiSquaredDistributionTable(chiSquare, 1);
    }
    // Use the CDF from simple-statistics
    if (typeof (ss as any).chiSquaredDistribution === 'function') {
      // New API: ss.chiSquaredDistribution(chiSquare, df)
      // but this is not in types either, so use approximation:
      // For chi-square, p = 1 - CDF(chiSquare)
      // simple-statistics does have .chiSquaredDistributionTable for old, .cdf for new
      // So we try
      return 1 - ss.chiSquaredDistribution(chiSquare, 1);
    }
    if (typeof ss.cdf === 'function') {
      return 1 - ss.cdf(chiSquare, 1, 'chi-squared');
    }
    return 1; // fallback
  } catch (error) {
    console.error('Error calculating p-value:', error);
    return 1;
  }
}

/**
 * Calculate confidence interval for lift
 */
export function calculateLiftConfidenceInterval(
  originalConversions: number,
  originalImpressions: number,
  variantConversions: number,
  variantImpressions: number,
  confidenceLevel = 0.95
): { lift: number; lowerBound: number; upperBound: number } {
  // Calculate conversion rates
  const crOriginal = originalImpressions === 0 ? 0 : originalConversions / originalImpressions;
  const crVariant = variantImpressions === 0 ? 0 : variantConversions / variantImpressions;
  
  // Calculate lift
  const lift = crOriginal === 0 ? 0 : ((crVariant - crOriginal) / crOriginal) * 100;
  
  // Standard errors
  const seOriginal = originalImpressions === 0
    ? 0 : Math.sqrt((crOriginal * (1 - crOriginal)) / originalImpressions);
  const seVariant = variantImpressions === 0
    ? 0 : Math.sqrt((crVariant * (1 - crVariant)) / variantImpressions);
  const seDiff = Math.sqrt(seOriginal * seOriginal + seVariant * seVariant);
  
  // Z score for the given confidence level (e.g., 1.96 for 95%)
  const zScore = typeof ss.probit === 'function'
    ? ss.probit((1 + confidenceLevel) / 2)
    : 1.96;
  
  const marginOfError = zScore * seDiff;
  const diffLower = (crVariant - crOriginal) - marginOfError;
  const diffUpper = (crVariant - crOriginal) + marginOfError;

  const liftLower = crOriginal === 0 ? 0 : (diffLower / crOriginal) * 100;
  const liftUpper = crOriginal === 0 ? 0 : (diffUpper / crOriginal) * 100;

  return {
    lift,
    lowerBound: liftLower,
    upperBound: liftUpper,
  };
}

/**
 * Enqueue a pattern analysis job for a business
 */
export const enqueuePatternAnalysis = async (businessId: string): Promise<void> => {
  await patternQueue.add(
    `pattern-analysis-${businessId}`,
    { businessId },
    {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000 // 5 seconds initial delay
      },
      removeOnComplete: true,
      removeOnFail: 1000
    }
  );
};
