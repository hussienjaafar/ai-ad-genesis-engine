
import { calculateChiSquare, getPValue, calculateLiftConfidenceInterval } from '../src/queues/patternJobProcessor';
import * as ss from 'simple-statistics';

describe('Statistical Functions', () => {
  describe('Chi-Square Test', () => {
    it('should calculate chi-square correctly for a 2x2 contingency table', () => {
      // Example: Test if a coin is fair
      // [heads, tails] for two different coins
      const table = [
        [55, 45], // observed: 55 heads, 45 tails
        [40, 60]  // expected: 40 heads, 60 tails
      ];
      
      const result = calculateChiSquare(table);
      expect(result).toBeGreaterThan(0);
      
      // Manual chi-square calculation for verification
      // For a 2x2 table:
      // χ² = (n(ad-bc)²)/((a+b)(c+d)(a+c)(b+d))
      const a = table[0][0]; // 55
      const b = table[0][1]; // 45
      const c = table[1][0]; // 40
      const d = table[1][1]; // 60
      const n = a + b + c + d;
      const manualResult = (n * Math.pow(a*d - b*c, 2)) / 
        ((a+b) * (c+d) * (a+c) * (b+d));
      
      // Should be close to our function result
      expect(Math.abs(result - manualResult)).toBeLessThan(0.1);
    });
    
    it('should return 0 for identical distributions', () => {
      const table = [
        [50, 50],
        [50, 50]
      ];
      
      const result = calculateChiSquare(table);
      expect(result).toBeCloseTo(0, 1);
    });
  });
  
  describe('P-Value Calculation', () => {
    it('should return small p-value for significant differences', () => {
      // Using a pre-calculated chi-square value that should be significant
      const chiSquare = 10.83; // This corresponds to p < 0.001 with df=1
      
      const pValue = getPValue(chiSquare);
      expect(pValue).toBeLessThan(0.005);
    });
    
    it('should return p-value close to 1 for no difference', () => {
      const chiSquare = 0.01; // Very small chi-square value
      
      const pValue = getPValue(chiSquare);
      expect(pValue).toBeGreaterThan(0.9);
    });
  });
  
  describe('Confidence Interval Calculation', () => {
    it('should calculate lift and confidence interval correctly', () => {
      // Example case: 
      // Original: 100 conversions from 1000 impressions (10%)
      // Variant: 150 conversions from 1000 impressions (15%)
      // Expected lift: 50%
      
      const result = calculateLiftConfidenceInterval(100, 1000, 150, 1000);
      
      // Verify the lift calculation
      expect(result.lift).toBeCloseTo(50, 1); // 50% lift
      
      // Confidence interval should contain the true lift
      expect(result.lowerBound).toBeLessThan(50);
      expect(result.upperBound).toBeGreaterThan(50);
      
      // For these sample sizes, we can estimate the CI
      // The 95% CI should be approximately (25%, 75%)
      expect(result.lowerBound).toBeGreaterThan(15);
      expect(result.upperBound).toBeLessThan(85);
    });
    
    it('should handle zero conversions in original gracefully', () => {
      // Edge case: no conversions in original
      const result = calculateLiftConfidenceInterval(0, 1000, 10, 1000);
      
      // Cannot calculate lift when original CR is 0, but should not error
      expect(result.lift).not.toBeNaN();
    });
  });
  
  describe('Integration with simple-statistics', () => {
    it('should use simple-statistics correctly', () => {
      // Test that the library is loaded and working correctly
      // Calculate mean
      const mean = ss.mean([1, 2, 3, 4, 5]);
      expect(mean).toBe(3);
      
      // Calculate standard deviation
      const stdDev = ss.standardDeviation([1, 2, 3, 4, 5]);
      expect(stdDev).toBeCloseTo(1.414, 3);
    });
  });
});
