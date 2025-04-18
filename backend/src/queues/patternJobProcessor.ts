
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
    
    return result.chiSquared;
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
    // Calculate p-value using simple-statistics
    return 1 - ss.chiSquaredDistributionTable(chiSquare, 1);
  } catch (error) {
    console.error('Error calculating p-value:', error);
    return 1; // Default to no significance
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
  const crOriginal = originalConversions / originalImpressions;
  const crVariant = variantConversions / variantImpressions;
  
  // Calculate lift
  const lift = ((crVariant - crOriginal) / crOriginal) * 100;
  
  // Calculate standard errors
  const seOriginal = Math.sqrt((crOriginal * (1 - crOriginal)) / originalImpressions);
  const seVariant = Math.sqrt((crVariant * (1 - crVariant)) / variantImpressions);
  
  // Combined standard error for the difference
  const seDiff = Math.sqrt(seOriginal * seOriginal + seVariant * seVariant);
  
  // Z score for the given confidence level (e.g., 1.96 for 95% confidence)
  const zScore = ss.probit((1 + confidenceLevel) / 2);
  
  // Confidence interval for the difference in rates
  const marginOfError = zScore * seDiff;
  const diffLower = (crVariant - crOriginal) - marginOfError;
  const diffUpper = (crVariant - crOriginal) + marginOfError;
  
  // Convert to lift percentage
  const liftLower = (diffLower / crOriginal) * 100;
  const liftUpper = (diffUpper / crOriginal) * 100;
  
  return {
    lift,
    lowerBound: liftLower,
    upperBound: liftUpper,
  };
}

/**
 * Enqueue a pattern analysis job for a business
 */
export const enqueuePatternAnalysis = async (businessId: string) => {
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
