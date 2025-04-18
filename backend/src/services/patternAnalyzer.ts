
import { MongoClient, ObjectId } from 'mongodb';

interface PerformanceData {
  businessId: string;
  platform: string;
  date: string;
  adId: string;
  metrics: {
    impressions: number;
    clicks: number;
    spend: number;
    leads: number;
  };
}

interface ContentElement {
  type: string;
  value: string;
  metadata?: Record<string, any>;
}

interface Content {
  _id: ObjectId;
  businessId: string;
  contentType: string;
  platform: string;
  adId?: string;
  title: string;
  parsedContent: ContentElement[];
  rawContent: string;
}

interface PatternInsight {
  element: string;
  elementType: string;
  performance: {
    withElement: {
      impressions: number;
      clicks: number;
      ctr: number;
      sampleSize: number;
    };
    withoutElement: {
      impressions: number;
      clicks: number;
      ctr: number;
      sampleSize: number;
    };
    uplift: number;
    confidence: number;
  };
}

/**
 * Calculate chi-square statistic for a contingency table
 */
function calculateChiSquare(table: number[][]): number {
  // Expected values calculation
  const rowSums = table.map(row => row.reduce((sum, cell) => sum + cell, 0));
  const colSums = [0, 0];
  for (let i = 0; i < table.length; i++) {
    colSums[0] += table[i][0];
    colSums[1] += table[i][1];
  }
  const total = rowSums.reduce((sum, val) => sum + val, 0);
  
  let chiSquare = 0;
  for (let i = 0; i < table.length; i++) {
    for (let j = 0; j < table[i].length; j++) {
      const expected = (rowSums[i] * colSums[j]) / total;
      if (expected > 0) {
        chiSquare += Math.pow(table[i][j] - expected, 2) / expected;
      }
    }
  }
  
  return chiSquare;
}

/**
 * Get p-value from chi-square statistic (1 degree of freedom)
 */
function getPValue(chiSquare: number): number {
  // This is an approximation for 1 degree of freedom
  return 1 - Math.exp(-0.5 * chiSquare);
}

/**
 * Analyze patterns in ad performance
 */
export async function analyzePatterns(businessId: string): Promise<PatternInsight[]> {
  const client = new MongoClient(process.env.MONGODB_URI as string);
  await client.connect();
  
  try {
    const db = client.db();
    const performanceCollection = db.collection('performanceData');
    const contentCollection = db.collection('content');
    
    // Get all performance data for this business
    const performanceData = await performanceCollection
      .find<PerformanceData>({ businessId })
      .toArray();
    
    // Get all content for this business
    const contentData = await contentCollection
      .find<Content>({ businessId })
      .toArray();
    
    // Create a map of adId to performance
    const adPerformance = performanceData.reduce((map, item) => {
      map[item.adId] = item.metrics;
      return map;
    }, {} as Record<string, any>);
    
    // Extract content elements to analyze
    const elements: Record<string, Set<string>> = {};
    const adContentElements: Record<string, Set<string>> = {};
    
    // Map content elements to ads
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
    
    // Calculate insights
    const insights: PatternInsight[] = [];
    
    for (const [elementKey, adsWithElement] of Object.entries(elements)) {
      // Skip elements that appear in less than 3 ads (not enough data)
      if (adsWithElement.size < 3) continue;
      
      const [elementType, elementValue] = elementKey.split(':', 2);
      
      let withClicks = 0;
      let withImpressions = 0;
      let withoutClicks = 0;
      let withoutImpressions = 0;
      
      // Calculate metrics for ads with this element
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
      
      // Calculate CTR
      const withCtr = withImpressions > 0 ? withClicks / withImpressions : 0;
      const withoutCtr = withoutImpressions > 0 ? withoutClicks / withoutImpressions : 0;
      
      // Calculate uplift
      const uplift = withoutCtr > 0 ? (withCtr - withoutCtr) / withoutCtr : 0;
      
      // Only consider elements with at least 15% uplift
      if (uplift < 0.15) continue;
      
      // Calculate statistical significance
      const contingencyTable = [
        [withClicks, withImpressions - withClicks],
        [withoutClicks, withoutImpressions - withoutClicks]
      ];
      
      const chiSquare = calculateChiSquare(contingencyTable);
      const pValue = getPValue(chiSquare);
      const confidenceLevel = 1 - pValue;
      
      // Only consider results with p < 0.05 (95% confidence)
      if (pValue >= 0.05) continue;
      
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
          confidence: confidenceLevel
        }
      });
    }
    
    // Sort by uplift and take top 5
    insights.sort((a, b) => b.performance.uplift - a.performance.uplift);
    const topInsights = insights.slice(0, 5);
    
    // Store insights in database
    if (topInsights.length > 0) {
      const insightCollection = db.collection('performanceInsights');
      
      await insightCollection.updateOne(
        { businessId },
        {
          $set: {
            businessId,
            patternInsights: topInsights,
            createdAt: new Date(),
            primaryCategory: 'content_patterns'
          }
        },
        { upsert: true }
      );
    }
    
    return topInsights;
    
  } finally {
    await client.close();
  }
}

/**
 * Run pattern analysis after ETL completion
 */
export async function runPatternAnalysis(): Promise<void> {
  const client = new MongoClient(process.env.MONGODB_URI as string);
  await client.connect();
  
  try {
    const db = client.db();
    const businessCollection = db.collection('businesses');
    
    // Find businesses with connected platforms
    const businesses = await businessCollection.find({
      $or: [
        { 'integrations.adPlatforms.facebook.isConnected': true },
        { 'integrations.adPlatforms.google.isConnected': true }
      ]
    }).toArray();
    
    console.log(`Running pattern analysis for ${businesses.length} businesses`);
    
    for (const business of businesses) {
      try {
        await analyzePatterns(business._id.toString());
        console.log(`Completed pattern analysis for business ${business._id}`);
      } catch (error) {
        console.error(`Error analyzing patterns for business ${business._id}:`, error);
      }
    }
    
  } finally {
    await client.close();
  }
}
