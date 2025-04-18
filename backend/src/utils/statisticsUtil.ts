
import * as ss from 'simple-statistics';

/**
 * Calculate the p-value for A/B test using the Chi-squared test
 * 
 * @param conversionA Number of conversions in variant A
 * @param impressionA Number of impressions in variant A
 * @param conversionB Number of conversions in variant B
 * @param impressionB Number of impressions in variant B
 * @returns p-value (lower values indicate higher significance)
 */
export function calculatePValue(
  conversionA: number,
  impressionA: number,
  conversionB: number,
  impressionB: number
): number {
  // Prevent division by zero
  if (impressionA === 0 || impressionB === 0) {
    return 1.0;
  }

  try {
    // Calculate non-conversions
    const nonConversionA = impressionA - conversionA;
    const nonConversionB = impressionB - conversionB;

    // Create contingency table
    const table = [
      [conversionA, nonConversionA],
      [conversionB, nonConversionB]
    ];

    // Calculate row and column totals
    const rowTotals = [table[0][0] + table[0][1], table[1][0] + table[1][1]];
    const colTotals = [table[0][0] + table[1][0], table[0][1] + table[1][1]];
    const total = rowTotals[0] + rowTotals[1];

    // Calculate expected values
    const expected = [
      [rowTotals[0] * colTotals[0] / total, rowTotals[0] * colTotals[1] / total],
      [rowTotals[1] * colTotals[0] / total, rowTotals[1] * colTotals[1] / total]
    ];

    // Calculate observed values
    const observed = [conversionA, conversionB];
    const expectedConversions = [expected[0][0], expected[1][0]];

    // Use simple-statistics to calculate chi-squared goodness of fit
    const result = ss.chiSquaredGoodnessOfFit(observed, expectedConversions);

    // Calculate p-value from chi-squared value with 1 degree of freedom
    return 1 - ss.chiSquaredDistributionTable(result.chiSquared, 1);
  } catch (error) {
    console.error('Error calculating p-value:', error);
    return 1; // Default to no significance in case of error
  }
}

/**
 * Calculate confidence interval for a proportion
 * 
 * @param successes Number of successes (e.g., conversions)
 * @param trials Number of trials (e.g., impressions)
 * @param confidenceLevel Confidence level (default: 0.95 for 95% CI)
 * @returns Object with lower and upper bounds
 */
export function calculateConfidenceInterval(
  successes: number,
  trials: number,
  confidenceLevel = 0.95
): { lower: number; upper: number } {
  if (trials === 0) {
    return { lower: 0, upper: 0 };
  }
  
  try {
    const proportion = successes / trials;
    
    // Z-score for the given confidence level
    const zScore = ss.probit((1 + confidenceLevel) / 2);
    
    // Standard error
    const standardError = Math.sqrt((proportion * (1 - proportion)) / trials);
    
    // Margin of error
    const marginOfError = zScore * standardError;
    
    return {
      lower: Math.max(0, proportion - marginOfError),
      upper: Math.min(1, proportion + marginOfError)
    };
  } catch (error) {
    console.error('Error calculating confidence interval:', error);
    return { lower: 0, upper: 0 };
  }
}

/**
 * Calculate confidence interval for lift between two variants
 * 
 * @param conversionA Number of conversions in variant A
 * @param impressionA Number of impressions in variant A
 * @param conversionB Number of conversions in variant B
 * @param impressionB Number of impressions in variant B
 * @param confidenceLevel Confidence level (default: 0.95 for 95% CI)
 * @returns Object with lift percentage and confidence interval bounds
 */
export function calculateLiftConfidenceInterval(
  conversionA: number,
  impressionA: number,
  conversionB: number,
  impressionB: number,
  confidenceLevel = 0.95
): { lift: number; lowerBound: number; upperBound: number } {
  if (impressionA === 0 || impressionB === 0) {
    return { lift: 0, lowerBound: 0, upperBound: 0 };
  }
  
  try {
    // Calculate conversion rates
    const rateA = conversionA / impressionA;
    const rateB = conversionB / impressionB;
    
    // Calculate lift
    const lift = rateA === 0 ? 0 : ((rateB - rateA) / rateA) * 100;
    
    // Standard errors for each rate
    const seA = Math.sqrt((rateA * (1 - rateA)) / impressionA);
    const seB = Math.sqrt((rateB * (1 - rateB)) / impressionB);
    
    // Standard error for the difference
    const seDiff = Math.sqrt(Math.pow(seA, 2) + Math.pow(seB, 2));
    
    // Z-score for the given confidence level
    const zScore = ss.probit((1 + confidenceLevel) / 2);
    
    // Margin of error for the difference
    const marginOfError = zScore * seDiff;
    
    // Calculate confidence interval for the difference in rates
    const diffLowerBound = (rateB - rateA) - marginOfError;
    const diffUpperBound = (rateB - rateA) + marginOfError;
    
    // Convert to lift confidence interval
    const liftLowerBound = rateA === 0 ? 0 : (diffLowerBound / rateA) * 100;
    const liftUpperBound = rateA === 0 ? 0 : (diffUpperBound / rateA) * 100;
    
    return {
      lift,
      lowerBound: liftLowerBound,
      upperBound: liftUpperBound
    };
  } catch (error) {
    console.error('Error calculating lift confidence interval:', error);
    return { lift: 0, lowerBound: 0, upperBound: 0 };
  }
}
