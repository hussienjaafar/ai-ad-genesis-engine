
import { calculateChiSquare, getPValue, calculateConfidenceInterval } from '../../utils/statisticsUtils';
import { calculateEngagementMetrics, calculateUplift } from './engagementMetrics';
import { PatternInsight } from '../../types/performanceTypes';

export function analyzePattern(
  elementValue: string,
  elementType: string,
  adsWithElement: Set<string>,
  adPerformance: Record<string, any>,
): PatternInsight | null {
  let withClicks = 0;
  let withImpressions = 0;
  let withoutClicks = 0;
  let withoutImpressions = 0;
  
  for (const [adId, metrics] of Object.entries(adPerformance)) {
    if (!metrics) continue;
    
    if (adsWithElement.has(adId)) {
      withClicks += metrics.clicks;
      withImpressions += metrics.impressions;
    } else {
      withoutClicks += metrics.clicks;
      withoutImpressions += metrics.impressions;
    }
  }

  const withMetrics = calculateEngagementMetrics(withClicks, withImpressions, adsWithElement.size);
  const withoutMetrics = calculateEngagementMetrics(
    withoutClicks, 
    withoutImpressions, 
    Object.keys(adPerformance).length - adsWithElement.size
  );
  
  const uplift = calculateUplift(withMetrics.ctr, withoutMetrics.ctr);
  
  if (uplift < 0.15) return null;

  const contingencyTable = [
    [withClicks, withImpressions - withClicks],
    [withoutClicks, withoutImpressions - withoutClicks]
  ];
  
  const chiSquare = calculateChiSquare(contingencyTable);
  const pValue = getPValue(chiSquare);
  
  if (pValue >= 0.05) return null;

  return {
    element: elementValue,
    elementType,
    performance: {
      withElement: withMetrics,
      withoutElement: withoutMetrics,
      uplift,
      confidence: 1 - pValue,
      confidenceInterval: calculateConfidenceInterval(uplift, withImpressions, withoutImpressions)
    }
  };
}
