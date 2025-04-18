
import * as ss from 'simple-statistics';

export function calculateChiSquare(table: number[][]): number {
  const rowSums = table.map(row => row.reduce((a, b) => a + b, 0));
  const colSums = table[0].map((_, i) => table.reduce((sum, row) => sum + row[i], 0));
  const total = rowSums.reduce((a, b) => a + b, 0);

  const expected = table.map((row, i) => 
    row.map((_, j) => (rowSums[i] * colSums[j]) / total)
  );

  return ss.chiSquaredGoodnessOfFit(
    [table[0][0], table[1][0]],
    [expected[0][0], expected[1][0]]
  ).chiSquared;
}

export function getPValue(chiSquare: number): number {
  return 1 - ss.chiSquaredDistributionTable(chiSquare, 1);
}

export function calculateConfidenceInterval(
  uplift: number,
  impressionsA: number,
  impressionsB: number
): { lower: number; upper: number } {
  const standardError = Math.sqrt((1/impressionsA) + (1/impressionsB));
  const z = 1.96; // 95% confidence level
  
  return {
    lower: uplift - z * standardError,
    upper: uplift + z * standardError
  };
}
