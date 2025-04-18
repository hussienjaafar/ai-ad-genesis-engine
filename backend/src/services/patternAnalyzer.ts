
import { MongoClient } from 'mongodb';
import { patternQueue } from '../queues/etlQueue';
import { Content, PerformanceData, PatternInsight } from '../types/performanceTypes';
import { getBusinessData, savePatternInsights } from '../utils/dbUtils';
import { calculatePatternMetrics } from './patternCalculationService';

export async function analyzePatterns(businessId: string): Promise<PatternInsight[]> {
  const client = new MongoClient(process.env.MONGODB_URI as string);
  await client.connect();
  
  try {
    const { performanceData, contentData } = await getBusinessData(businessId, client);
    
    const adPerformance = performanceData.reduce((map, item) => {
      map[item.adId] = item.metrics;
      return map;
    }, {} as Record<string, any>);
    
    const elements: Record<string, Set<string>> = {};
    const adContentElements: Record<string, Set<string>> = {};
    
    for (const content of contentData) {
      if (!content.adId) continue;
      
      adContentElements[content.adId] = new Set();
      
      for (const element of content.parsedContent) {
        const elementKey = `${element.type}:${element.value}`;
        
        if (!elements[elementKey]) {
          elements[elementKey] = new Set();
        }
        
        elements[elementKey].add(content.adId);
        adContentElements[content.adId].add(elementKey);
      }
    }
    
    const insights = calculatePatternMetrics(elements, adPerformance);
    
    if (insights.length > 0) {
      await savePatternInsights(businessId, insights, client);
    }
    
    return insights;
    
  } finally {
    await client.close();
  }
}

export async function enqueuePatternAnalysisJobs(): Promise<void> {
  const client = new MongoClient(process.env.MONGODB_URI as string);
  await client.connect();
  
  try {
    const db = client.db();
    const businessCollection = db.collection('businesses');
    
    const businesses = await businessCollection.find({
      $or: [
        { 'integrations.adPlatforms.facebook.isConnected': true },
        { 'integrations.adPlatforms.google.isConnected': true }
      ]
    }).toArray();
    
    console.log(`Enqueuing pattern analysis for ${businesses.length} businesses`);
    
    for (const business of businesses) {
      await patternQueue.add(
        `pattern-analysis-${business._id}`,
        { businessId: business._id.toString() },
        {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 5000
          }
        }
      );
      console.log(`Enqueued pattern analysis job for business ${business._id}`);
    }
    
  } finally {
    await client.close();
  }
}
