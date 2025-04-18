
import { PatternInsight } from '../types/performanceTypes';
import { analyzePattern } from './metrics/patternMetrics';

export function calculatePatternMetrics(
  elements: Record<string, Set<string>>,
  adPerformance: Record<string, any>
): PatternInsight[] {
  const insights: PatternInsight[] = [];

  for (const [elementKey, adsWithElement] of Object.entries(elements)) {
    if (adsWithElement.size < 3) continue;

    const [elementType, elementValue] = elementKey.split(':', 2);
    
    const patternInsight = analyzePattern(elementValue, elementType, adsWithElement, adPerformance);
    
    if (patternInsight) {
      insights.push(patternInsight);
    }
  }

  return insights.sort((a, b) => b.performance.uplift - a.performance.uplift).slice(0, 5);
}
