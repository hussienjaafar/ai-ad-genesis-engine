
import { Types } from 'mongoose';
import PerformanceInsightModel from '../models/PerformanceInsight';

export class InsightService {
  /**
   * Get the element text from an insight
   * 
   * @param insightId - The ID of the insight to retrieve the element from
   * @returns The element text or null if not found
   */
  public static async getElementSnippet(insightId: string): Promise<string | null> {
    if (!Types.ObjectId.isValid(insightId)) {
      throw new Error('Invalid insight ID');
    }

    try {
      const insight = await PerformanceInsightModel.findOne(
        { 
          "patternInsights._id": new Types.ObjectId(insightId) 
        },
        { 
          "patternInsights.$": 1 
        }
      );

      if (!insight || !insight.patternInsights || insight.patternInsights.length === 0) {
        return null;
      }

      return insight.patternInsights[0].element;
    } catch (error) {
      console.error('Error retrieving insight element:', error);
      throw new Error('Failed to retrieve insight element');
    }
  }
}

export default InsightService;
