
import { MongoClient } from 'mongodb';
import { Content, PerformanceData } from '../types/performanceTypes';

export async function getBusinessData(businessId: string, client: MongoClient) {
  const db = client.db();
  const performanceCollection = db.collection('performanceData');
  const contentCollection = db.collection('content');
  
  const performanceData = await performanceCollection
    .find<PerformanceData>({ businessId })
    .toArray();
  
  const contentData = await contentCollection
    .find<Content>({ businessId })
    .toArray();
    
  return { performanceData, contentData };
}

export async function savePatternInsights(businessId: string, insights: any[], client: MongoClient) {
  const db = client.db();
  const insightCollection = db.collection('performanceInsights');
  
  await insightCollection.updateOne(
    { businessId },
    {
      $set: {
        businessId,
        patternInsights: insights,
        createdAt: new Date(),
        primaryCategory: 'content_patterns'
      }
    },
    { upsert: true }
  );
}
