
import { 
  calculateChiSquare, 
  getPValue, 
  calculateLiftConfidenceInterval,
  calculateConfidenceInterval
} from '../src/utils/statisticsUtils';
import * as ss from 'simple-statistics';

describe('Statistical Functions', () => {
  describe('Chi-Square Test', () => {
    it('should calculate chi-square correctly for a 2x2 contingency table', () => {
      // Example: Control vs Treatment
      // [conversions, non-conversions]
      const table = [
        [100, 900], // Control: 100 conversions out of 1000 impressions
        [150, 850]  // Treatment: 150 conversions out of 1000 impressions
      ];
      
      const result = calculateChiSquare(table);
      expect(result).toBeGreaterThan(0);
      
      // Manual chi-square calculation for verification
      // For a 2x2 table:
      // χ² = (n(ad-bc)²)/((a+b)(c+d)(a+c)(b+d))
      // where:
      // a = control conversions, b = control non-conversions
      // c = treatment conversions, d = treatment non-conversions
      const a = table[0][0];
      const b = table[0][1];
      const c = table[1][0];
      const d = table[1][1];
      const n = a + b + c + d;
      const manualResult = (n * Math.pow(a*d - b*c, 2)) / 
        ((a+b) * (c+d) * (a+c) * (b+d));
      
      // Should be close to our function result
      expect(Math.abs(result - manualResult)).toBeLessThan(0.1);
    });
    
    it('should return valid chi-square for identical distributions', () => {
      const table = [
        [50, 50],
        [50, 50]
      ];
      
      const result = calculateChiSquare(table);
      expect(result).toBeCloseTo(0, 5);
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
    it('should calculate proportion confidence interval correctly', () => {
      // Example: 100 conversions from 1000 impressions (10%)
      const ci = calculateConfidenceInterval(100, 1000);
      
      // For 95% CI of a 10% conversion rate with 1000 trials
      // The confidence interval should be approximately (8.2%, 12.1%)
      expect(ci.lower).toBeGreaterThan(0.08);
      expect(ci.lower).toBeLessThan(0.085);
      expect(ci.upper).toBeGreaterThan(0.115);
      expect(ci.upper).toBeLessThan(0.125);
    });
    
    it('should handle edge cases gracefully', () => {
      // Zero trials
      expect(calculateConfidenceInterval(0, 0)).toEqual({ lower: 0, upper: 0 });
      
      // 100% conversion rate
      const ci = calculateConfidenceInterval(100, 100);
      expect(ci.lower).toBeGreaterThan(0.95);
      expect(ci.upper).toBe(1);
    });
  });
  
  describe('Lift Confidence Interval', () => {
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
      expect(result.lift).toBe(0);
      expect(result.lowerBound).toBe(0);
      expect(result.upperBound).toBe(0);
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
