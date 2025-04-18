
import * as ss from 'simple-statistics';
import { Content, PerformanceData, PatternInsight } from '../types/performanceTypes';

export function calculatePatternMetrics(
  elements: Record<string, Set<string>>,
  adPerformance: Record<string, any>
): PatternInsight[] {
  const insights: PatternInsight[] = [];

  for (const [elementKey, adsWithElement] of Object.entries(elements)) {
    if (adsWithElement.size < 3) continue;

    const [elementType, elementValue] = elementKey.split(':', 2);
    
    let withClicks = 0;
    let withImpressions = 0;
    let withoutClicks = 0;
    let withoutImpressions = 0;
    
    for (const adId of Object.keys(adPerformance)) {
      const hasElement = adsWithElement.has(adId);
      const metrics = adPerformance[adId];
      
      if (!metrics) continue;
      
      if (hasElement) {
        withClicks += metrics.clicks;
        withImpressions += metrics.impressions;
      } else {
        withoutClicks += metrics.clicks;
        withoutImpressions += metrics.impressions;
      }
    }

    const withCtr = withImpressions > 0 ? withClicks / withImpressions : 0;
    const withoutCtr = withoutImpressions > 0 ? withoutClicks / withoutImpressions : 0;
    const uplift = withoutCtr > 0 ? (withCtr - withoutCtr) / withoutCtr : 0;

    if (uplift < 0.15) continue;

    const contingencyTable = [
      [withClicks, withImpressions - withClicks],
      [withoutClicks, withoutImpressions - withoutClicks]
    ];
    
    const chiSquare = calculateChiSquare(contingencyTable);
    const pValue = getPValue(chiSquare);
    const confidenceLevel = 1 - pValue;

    if (pValue >= 0.05) continue;

    const confidenceInterval = calculateConfidenceInterval(uplift, withImpressions, withoutImpressions);

    insights.push({
      element: elementValue,
      elementType,
      performance: {
        withElement: {
          impressions: withImpressions,
          clicks: withClicks,
          ctr: withCtr,
          sampleSize: adsWithElement.size
        },
        withoutElement: {
          impressions: withoutImpressions,
          clicks: withoutClicks,
          ctr: withoutCtr,
          sampleSize: Object.keys(adPerformance).length - adsWithElement.size
        },
        uplift,
        confidence: confidenceLevel,
        confidenceInterval
      }
    });
  }

  return insights.sort((a, b) => b.performance.uplift - a.performance.uplift).slice(0, 5);
}

function calculateChiSquare(table: number[][]) {
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

function getPValue(chiSquare: number): number {
  return 1 - ss.chiSquaredDistributionTable(chiSquare, 1);
}

function calculateConfidenceInterval(
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
