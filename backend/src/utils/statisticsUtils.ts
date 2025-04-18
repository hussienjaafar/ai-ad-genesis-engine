
import * as ss from 'simple-statistics';

/**
 * Calculate chi-square value from a 2x2 contingency table
 */
export function calculateChiSquare(table: number[][]): number {
  const rowSums = table.map(row => row.reduce((a, b) => a + b, 0));
  const colSums = table[0].map((_, i) => table.reduce((sum, row) => sum + row[i], 0));
  const total = rowSums.reduce((a, b) => a + b, 0);

  const expected = table.map((row, i) => 
    row.map((_, j) => (rowSums[i] * colSums[j]) / total)
  );

  let chiSquare = 0;
  for (let i = 0; i < table.length; i++) {
    for (let j = 0; j < table[i].length; j++) {
      const diff = table[i][j] - expected[i][j];
      chiSquare += Math.pow(diff, 2) / expected[i][j];
    }
  }

  return chiSquare;
}

/**
 * Calculate p-value from chi-square statistic with given degrees of freedom
 */
export function getPValue(chiSquare: number, degreesOfFreedom: number = 1): number {
  return 1 - ss.chiSquaredDistributionTable(chiSquare, degreesOfFreedom);
}

/**
 * Calculate confidence interval for the uplift between two conversion rates
 *
 * @param conversionA Number of conversions in variant A
 * @param impressionA Number of impressions in variant A
 * @param conversionB Number of conversions in variant B
 * @param impressionB Number of impressions in variant B
 * @param confidenceLevel Desired confidence level (default: 0.95 for 95% CI)
 */
export function calculateLiftConfidenceInterval(
  conversionA: number,
  impressionA: number,
  conversionB: number,
  impressionB: number,
  confidenceLevel: number = 0.95
): { 
  lift: number; 
  lowerBound: number; 
  upperBound: number 
} {
  // Prevent division by zero
  if (impressionA === 0 || impressionB === 0) {
    return { lift: 0, lowerBound: 0, upperBound: 0 };
  }
  
  // Calculate rates
  const rateA = conversionA / impressionA;
  const rateB = conversionB / impressionB;
  
  // Calculate lift (percentage change)
  const lift = rateA === 0 ? 0 : ((rateB - rateA) / rateA) * 100;
  
  // Calculate standard errors
  const seA = rateA === 0 || rateA === 1 ? 0 : Math.sqrt((rateA * (1 - rateA)) / impressionA);
  const seB = rateB === 0 || rateB === 1 ? 0 : Math.sqrt((rateB * (1 - rateB)) / impressionB);
  
  // Combined standard error for the difference
  const seDiff = Math.sqrt(Math.pow(seA, 2) + Math.pow(seB, 2));
  
  // Z-score for the given confidence level
  const zScore = ss.probit((1 + confidenceLevel) / 2);
  
  // Calculate CI for the difference in rates
  const diffLower = (rateB - rateA) - zScore * seDiff;
  const diffUpper = (rateB - rateA) + zScore * seDiff;
  
  // Convert to lift percentage CI
  const lowerBound = rateA === 0 ? 0 : (diffLower / rateA) * 100;
  const upperBound = rateA === 0 ? 0 : (diffUpper / rateA) * 100;
  
  return { lift, lowerBound, upperBound };
}

/**
 * Calculate confidence interval for a proportion
 * 
 * @param successes Number of successes (e.g., conversions)
 * @param trials Number of trials (e.g., impressions)
 * @param confidenceLevel Desired confidence level (default: 0.95 for 95% CI)
 */
export function calculateConfidenceInterval(
  successes: number,
  trials: number,
  confidenceLevel: number = 0.95
): { lower: number; upper: number } {
  if (trials === 0) {
    return { lower: 0, upper: 0 };
  }
  
  const proportion = successes / trials;
  
  // Wilson score interval is more accurate than normal approximation,
  // especially for small samples or extreme proportions
  const z = ss.probit((1 + confidenceLevel) / 2);
  const z2 = z * z;
  
  const numeratorLower = proportion + z2/(2*trials) - z * Math.sqrt((proportion * (1-proportion) + z2/(4*trials))/trials);
  const numeratorUpper = proportion + z2/(2*trials) + z * Math.sqrt((proportion * (1-proportion) + z2/(4*trials))/trials);
  const denominator = 1 + z2/trials;
  
  return {
    lower: Math.max(0, numeratorLower / denominator),
    upper: Math.min(1, numeratorUpper / denominator)
  };
}
