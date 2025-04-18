
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

  // Calculate chi-squared statistic
  let chiSquared = 0;
  for (let i = 0; i < 2; i++) {
    for (let j = 0; j < 2; j++) {
      const diff = table[i][j] - expected[i][j];
      chiSquared += (diff * diff) / expected[i][j];
    }
  }

  // Calculate p-value using chi-squared approximation (with 1 degree of freedom)
  // This is a simplified implementation - for production, consider a more robust stats library
  return 1 - chiSquaredCDF(chiSquared, 1);
}

/**
 * Cumulative distribution function (CDF) for chi-squared distribution
 */
function chiSquaredCDF(x: number, df: number): number {
  // Lower incomplete gamma function approximation
  // This is a simplified approximation - for production, use a proper stats library
  
  if (x <= 0) return 0;
  
  let a = df / 2;
  let y = a;
  let s = y;
  
  // Series expansion
  for (let i = 1; i < 10; i++) {
    y = y * x / (2 * (a + i));
    s += y;
    if (y / s < 1e-10) break;
  }
  
  return 1 - Math.exp(-x/2) * Math.pow(x/2, a) / s;
}
