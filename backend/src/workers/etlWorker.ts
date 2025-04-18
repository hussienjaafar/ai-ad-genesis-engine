import cron from 'node-cron';
import { MongoClient, ObjectId } from 'mongodb';
import axios from 'axios';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { decrypt } from '../lib/crypto';
import prom from 'prom-client';
import pLimit from 'p-limit';
import mongoose from 'mongoose';
import ContentModel from '../models/Content';
import ExperimentModel from '../models/Experiment';
import experimentService from '../services/experimentService';

// Alert service import for notification
import alertService from '../services/alertService';

// Prometheus metrics
const etlJobsTotal = new prom.Counter({
  name: 'etl_jobs_total',
  help: 'Number of ETL jobs executed',
});

const etlJobFailures = new prom.Counter({
  name: 'etl_job_failures_total',
  help: 'Number of ETL job failures',
  labelValues: ['platform'],
});

const etlPagesFetched = new prom.Counter({
  name: 'etl_pages_fetched_total',
  help: 'Number of pages fetched during ETL process',
  labelValues: ['platform'],
});

const etlRetryTotal = new prom.Counter({
  name: 'etl_retry_total',
  help: 'Number of retries during ETL process',
  labelValues: ['platform'],
});

// Global rate limiter - 5 requests per second
const globalLimiter = pLimit(5);

// Business-specific concurrency limiters
const businessLimiters = new Map();

/**
 * Get or create a per-business rate limiter
 */
function getBusinessLimiter(businessId: string) {
  if (!businessLimiters.has(businessId)) {
    businessLimiters.set(businessId, pLimit(3)); // 3 concurrent requests per business
  }
  return businessLimiters.get(businessId);
}

/**
 * Makes an HTTP request with exponential backoff retry
 * @param fn - Function that makes the actual request
 * @param retries - Number of retries remaining
 * @param platform - Platform name for metrics
 * @returns Result of the request
 */
async function requestWithRetry<T>(fn: () => Promise<T>, retries = 5, platform: string): Promise<T> {
  try {
    return await globalLimiter(() => fn());
  } catch (error: any) {
    // Check if we should retry (5xx errors or rate limit)
    const shouldRetry = 
      (error.response?.status >= 500 && error.response?.status < 600) || 
      (error.response?.data?.error?.code === 17) || // Facebook rate limit code
      (error.response?.data?.error?.errors?.[0]?.reason === 'rateLimitExceeded'); // Google rate limit
    
    if (shouldRetry && retries > 0) {
      // Log retry attempt
      etlRetryTotal.inc({ platform });
      console.log(`Retrying ${platform} request, ${retries} attempts remaining`);
      
      // Calculate delay with exponential backoff + jitter
      const delay = Math.min(
        1000 * Math.pow(2, 5 - retries) + Math.random() * 1000,
        30000 // Max 30 seconds
      );
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Retry
      return requestWithRetry(fn, retries - 1, platform);
    }
    
    // Special handling for Meta rate limit errors after all retries
    if (error.response?.data?.error?.code === 17 && retries === 0) {
      // If this is a Meta rate limit error and we're out of retries
      if (error.businessId) {
        console.error(`Rate limit persisted for business ${error.businessId} after max retries`);
        
        // Mark business as having an error
        const client = new MongoClient(process.env.MONGODB_URI as string);
        try {
          await client.connect();
          const db = client.db();
          
          await db.collection('businesses').updateOne(
            { _id: new ObjectId(error.businessId) },
            { 
              $set: { 
                'integrations.adPlatforms.facebook.status': 'error',
                'integrations.adPlatforms.facebook.lastErrorMessage': 'Rate limit exceeded after multiple retries',
                'integrations.adPlatforms.facebook.lastErrorTime': new Date().toISOString()
              }
            }
          );
          
          // Send alert
          await alertService.send({
            level: 'error',
            message: `Meta rate limit persisted for business ${error.businessId} after max retries`,
            source: 'ETL',
            businessId: error.businessId,
            details: error.response?.data
          });
        } catch (dbError) {
          console.error('Failed to update business status:', dbError);
        } finally {
          await client.close();
        }
      }
    }
    
    // No more retries or shouldn't retry
    etlJobFailures.inc({ platform });
    throw error;
  }
}

/**
 * Fetch Meta Ads insights with pagination support
 */
async function fetchMetaInsights(token: string, accountId: string, yesterday: string, businessId: string): Promise<any[]> {
  let allResults: any[] = [];
  let nextPageUrl = `https://graph.facebook.com/v17.0/act_${accountId}/insights?access_token=${token}&fields=ad_id,impressions,clicks,spend,inline_link_clicks,actions&level=ad&time_range={"since":"${yesterday}","until":"${yesterday}"}`;
  
  const businessLimiter = getBusinessLimiter(businessId);
  
  while (nextPageUrl) {
    try {
      const response = await businessLimiter(() => requestWithRetry(
        () => axios.get(nextPageUrl),
        5,
        'facebook'
      ));
      
      etlPagesFetched.inc({ platform: 'facebook' });
      
      allResults = [...allResults, ...response.data.data];
      
      // Check for next page
      if (response.data.paging && response.data.paging.next) {
        nextPageUrl = response.data.paging.next;
      } else {
        nextPageUrl = '';
      }
      
      // Simple delay between requests (200ms) to avoid overwhelming the API
      await new Promise(resolve => setTimeout(resolve, 200));
    } catch (error: any) {
      // Add businessId to error object for special handling
      error.businessId = businessId;
      throw error;
    }
  }
  
  return allResults;
}

/**
 * Fetch Google Ads reports with pagination support
 */
async function fetchGoogleAdsReports(refreshToken: string, clientId: string, clientSecret: string, yesterday: string, businessId: string): Promise<any[]> {
  const oauth2Client = new OAuth2Client(clientId, clientSecret);
  
  oauth2Client.setCredentials({
    refresh_token: refreshToken
  });
  
  // Get fresh access token
  await oauth2Client.getAccessToken();
  
  // TODO: Implement actual Google Ads API client
  // This is just a placeholder for the pagination pattern
  let allResults: any[] = [];
  let pageToken = '';
  
  const businessLimiter = getBusinessLimiter(businessId);
  
  do {
    const response = await businessLimiter(() => requestWithRetry(
      async () => {
        // Mock Google Ads API call
        // In reality, this would use the Google Ads API client
        return { data: { results: [], nextPageToken: '' } };
      },
      5,
      'google'
    ));
    
    etlPagesFetched.inc({ platform: 'google' });
    
    allResults = [...allResults, ...response.data.results];
    pageToken = response.data.nextPageToken;
    
    // Simple delay between requests
    await new Promise(resolve => setTimeout(resolve, 200));
    
  } while (pageToken);
  
  return allResults;
}

/**
 * Process ad performance data into standard format
 */
function processAdPerformance(data: any[], platform: string, businessId: string, date: string, contentMap: Map<string, any>): any[] {
  if (platform === 'facebook') {
    return data.map(item => {
      // Find leads action if exists
      const leadsAction = item.actions?.find((action: any) => action.action_type === 'lead');
      
      // Check if this ad has associated content with insight
      const contentInfo = contentMap.get(item.ad_id);
      const generatedFromInsightId = contentInfo?.generatedFromInsightId;
      const contentId = contentInfo?.contentId;

      // Check if this content is part of an active experiment
      let experimentInfo = null;
      if (contentInfo?.experimentInfo) {
        experimentInfo = {
          experimentId: contentInfo.experimentInfo.experimentId,
          variant: contentInfo.experimentInfo.variant
        };
      }
      
      return {
        businessId,
        platform,
        date,
        adId: item.ad_id,
        metrics: {
          impressions: parseInt(item.impressions) || 0,
          clicks: parseInt(item.clicks) || 0,
          spend: parseFloat(item.spend) || 0,
          leads: leadsAction ? parseInt(leadsAction.value) : 0
        },
        // Add the insight ID if available
        generatedFromInsightId: generatedFromInsightId || null,
        contentId: contentId || null,
        // Add experiment data if available
        experimentId: experimentInfo?.experimentId || null,
        variant: experimentInfo?.variant || null
      };
    });
  }
  
  // Placeholder for Google Ads data processing
  return [];
}

/**
 * Get content to ad mappings, including insight source and experiment information
 */
async function getContentAdMappings(businessId: string): Promise<Map<string, any>> {
  try {
    // Make sure we use mongoose connection rather than new MongoClient
    const contentItems = await ContentModel.find({ 
      businessId: new mongoose.Types.ObjectId(businessId),
      'metadata.adId': { $exists: true }
    }).lean();
    
    // Find active experiments for this business
    const activeExperiments = await ExperimentModel.find({
      businessId: new mongoose.Types.ObjectId(businessId),
      status: 'active',
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() }
    }).lean();

    // Create mapping of contentIds to their experiment info
    const experimentMapping = new Map();
    for (const experiment of activeExperiments) {
      experimentMapping.set(experiment.contentIdOriginal, {
        experimentId: experiment._id.toString(),
        variant: 'original'
      });
      experimentMapping.set(experiment.contentIdVariant, {
        experimentId: experiment._id.toString(),
        variant: 'variant'
      });
    }
    
    const contentMap = new Map();
    
    for (const content of contentItems) {
      if (content.metadata?.adId) {
        const contentId = content._id.toString();
        const experimentInfo = experimentMapping.get(contentId) || null;
        
        contentMap.set(content.metadata.adId, {
          contentId,
          generatedFromInsightId: content.generatedFrom?.insightId?.toString() || null,
          experimentInfo
        });
      }
    }
    
    return contentMap;
  } catch (error) {
    console.error('Error getting content-ad mappings:', error);
    return new Map();
  }
}

/**
 * Run experiment result updates after ETL job completes
 */
async function updateExperimentResults() {
  try {
    // Find all active experiments
    const activeExperiments = await ExperimentModel.find({
      status: 'active',
      startDate: { $lte: new Date() }
    });
    
    console.log(`Updating results for ${activeExperiments.length} active experiments`);
    
    for (const experiment of activeExperiments) {
      try {
        await experimentService.computeResults(experiment._id.toString());
        console.log(`Updated results for experiment ${experiment._id}`);
        
        // If experiment has ended, mark it as completed
        if (experiment.endDate < new Date()) {
          await ExperimentModel.findByIdAndUpdate(
            experiment._id,
            { status: 'completed' }
          );
          console.log(`Experiment ${experiment._id} marked as completed (end date reached)`);
        }
      } catch (error) {
        console.error(`Error updating results for experiment ${experiment._id}:`, error);
      }
    }
  } catch (error) {
    console.error('Error updating experiment results:', error);
  }
}

/**
 * Main ETL function to extract, transform and load ad performance data
 */
async function runEtl() {
  console.log('Starting ETL job...');
  etlJobsTotal.inc();
  
  try {
    const client = new MongoClient(process.env.MONGODB_URI as string);
    await client.connect();
    
    const db = client.db();
    const businessCollection = db.collection('businesses');
    const performanceDataCollection = db.collection('performanceData');
    
    // Get yesterday's date in YYYY-MM-DD format
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    // Find businesses with connected ad platforms
    const businesses = await businessCollection.find({
      $or: [
        { 'integrations.adPlatforms.facebook.isConnected': true },
        { 'integrations.adPlatforms.google.isConnected': true }
      ]
    }).toArray();
    
    console.log(`Processing ${businesses.length} businesses with connected platforms`);
    
    // Process each business
    for (const business of businesses) {
      const businessId = business._id.toString();
      const allPerformanceData = [];
      
      // Get content to ad mappings for this business to attach insight IDs and experiment data
      const contentAdMap = await getContentAdMappings(businessId);
      
      // Process Meta/Facebook data if connected
      if (business.integrations?.adPlatforms?.facebook?.isConnected && 
          !business.integrations?.adPlatforms?.facebook?.needsReauth) {
        try {
          console.log(`Processing Meta data for business ${businessId}`);
          
          const encryptedToken = business.integrations.adPlatforms.facebook.token;
          const token = decrypt(encryptedToken);
          const accountId = business.integrations.adPlatforms.facebook.accountId;
          
          const insights = await fetchMetaInsights(token, accountId, yesterdayStr, businessId);
          const processedData = processAdPerformance(insights, 'facebook', businessId, yesterdayStr, contentAdMap);
          
          allPerformanceData.push(...processedData);
          
          // Update last synced timestamp and clear any error status
          await businessCollection.updateOne(
            { _id: business._id },
            { 
              $set: { 
                'integrations.adPlatforms.facebook.lastSynced': new Date().toISOString(),
                'integrations.adPlatforms.facebook.status': 'active',
                'integrations.adPlatforms.facebook.lastErrorMessage': null
              }
            }
          );
          
          console.log(`Successfully processed ${processedData.length} Facebook ads for business ${businessId}`);
        } catch (error) {
          console.error(`Error processing Meta data for business ${businessId}:`, error);
          etlJobFailures.inc({ platform: 'facebook' });
        }
      }
      
      // Process Google data if connected
      if (business.integrations?.adPlatforms?.google?.isConnected && 
          !business.integrations?.adPlatforms?.google?.needsReauth) {
        try {
          console.log(`Processing Google Ads data for business ${businessId}`);
          
          const encryptedToken = business.integrations.adPlatforms.google.token;
          const refreshToken = decrypt(encryptedToken);
          
          const googleReports = await fetchGoogleAdsReports(
            refreshToken,
            process.env.GOOGLE_CLIENT_ID || '',
            process.env.GOOGLE_CLIENT_SECRET || '',
            yesterdayStr,
            businessId
          );
          
          const processedData = processAdPerformance(googleReports, 'google', businessId, yesterdayStr, contentAdMap);
          allPerformanceData.push(...processedData);
          
          // Update last synced timestamp
          await businessCollection.updateOne(
            { _id: business._id },
            { $set: { 'integrations.adPlatforms.google.lastSynced': new Date().toISOString() } }
          );
          
          console.log(`Successfully processed ${processedData.length} Google ads for business ${businessId}`);
        } catch (error) {
          console.error(`Error processing Google data for business ${businessId}:`, error);
          etlJobFailures.inc({ platform: 'google' });
        }
      }
      
      // Bulk upsert performance data
      if (allPerformanceData.length > 0) {
        console.log(`Upserting ${allPerformanceData.length} performance records for business ${businessId}`);
        
        const bulkOps = allPerformanceData.map(data => ({
          updateOne: {
            filter: { 
              businessId: data.businessId,
              platform: data.platform,
              adId: data.adId,
              date: data.date
            },
            update: { $set: data },
            upsert: true
          }
        }));
        
        await performanceDataCollection.bulkWrite(bulkOps);
      }
    }
    
    await client.close();
    
    // After ETL job completes, update experiment results
    await updateExperimentResults();
    
    console.log('ETL job completed successfully');
  } catch (error) {
    console.error('ETL job failed:', error);
  }
}

/**
 * Start the ETL cron job
 */
export function startEtlJob() {
  const cronSchedule = process.env.CRON_ETL_SCHEDULE || '0 3 * * *'; // Default to 3 AM daily
  console.log(`Setting up ETL cron job with schedule: ${cronSchedule}`);
  
  cron.schedule(cronSchedule, runEtl);
}

/**
 * Run ETL job manually
 */
export function runEtlManually() {
  return runEtl();
}
