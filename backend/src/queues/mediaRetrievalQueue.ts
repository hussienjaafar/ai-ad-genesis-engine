import { Queue, QueueScheduler, Worker } from 'bullmq';
import { Types } from 'mongoose';
import MetaVideoService from '../services/MetaVideoService';
import GoogleImageService from '../services/GoogleImageService';
import BusinessModel from '../models/Business';
import { mediaProcessingQueue } from './mediaProcessingQueue';
import MediaAssetModel from '../models/MediaAsset';
import logger from '../lib/logger';

// Redis connection config from existing setup
const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
};

// Create Media Retrieval queue
export const mediaRetrievalQueue = new Queue('media-retrieval-queue', { 
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 60000, // 1 minute initial delay
    },
    removeOnComplete: true,
    removeOnFail: 1000
  }
});

// Create queue scheduler to manage delayed jobs
export const mediaRetrievalScheduler = new QueueScheduler('media-retrieval-queue', { connection });

// Media Retrieval worker processor with concurrency limit
export const setupMediaRetrievalWorker = () => {
  const worker = new Worker(
    'media-retrieval-queue',
    async (job) => {
      const { businessId, platform } = job.data;
      logger.info(`Processing media retrieval job for business ${businessId}, platform: ${platform || 'all'}`);
      
      try {
        // If specific platform is provided, only retrieve assets for that platform
        if (platform) {
          await retrieveAssetsByPlatform(businessId, platform);
        } else {
          // Otherwise retrieve all platforms
          await retrieveAllPlatformAssets(businessId);
        }
        
        // Queue processing jobs for the newly retrieved assets
        await queueProcessingJobs(businessId);
        
        logger.info(`Completed media retrieval job for business ${businessId}`);
        return { success: true };
      } catch (error) {
        logger.error(`Error in media retrieval job for business ${businessId}:`, error);
        throw error;
      }
    },
    { 
      connection,
      concurrency: 5, // Process up to 5 retrieval jobs concurrently
      limiter: {
        max: 10, // At most 10 jobs
        duration: 60000, // In 1 minute
      }
    }
  );

  worker.on('completed', (job) => {
    logger.info(`Media retrieval job ${job.id} completed successfully`);
  });

  worker.on('failed', (job, err) => {
    logger.error(`Media retrieval job ${job?.id} failed with error:`, err);
  });

  return worker;
};

/**
 * Retrieve assets from all connected platforms for a business
 */
async function retrieveAllPlatformAssets(businessId: string): Promise<void> {
  const business = await BusinessModel.findById(businessId);
  
  if (!business) {
    throw new Error(`Business ${businessId} not found`);
  }
  
  const platforms = business.integrations?.adPlatforms || {};
  const retrievalPromises = [];
  
  // Check if Meta is connected
  if (platforms.facebook && platforms.facebook.isConnected && !platforms.facebook.needsReauth) {
    retrievalPromises.push(MetaVideoService.retrieveVideosForBusiness(businessId));
  }
  
  // Check if Google is connected
  if (platforms.google && platforms.google.isConnected && !platforms.google.needsReauth) {
    retrievalPromises.push(GoogleImageService.retrieveImagesForBusiness(businessId));
  }
  
  // Wait for all retrievals to complete
  if (retrievalPromises.length > 0) {
    await Promise.allSettled(retrievalPromises);
  }
}

/**
 * Retrieve assets for a specific platform
 */
async function retrieveAssetsByPlatform(businessId: string, platform: string): Promise<void> {
  switch (platform.toLowerCase()) {
    case 'meta':
    case 'facebook':
      await MetaVideoService.retrieveVideosForBusiness(businessId);
      break;
      
    case 'google':
      await GoogleImageService.retrieveImagesForBusiness(businessId);
      break;
      
    default:
      logger.warn(`Unknown platform ${platform} requested for retrieval`);
      break;
  }
}

/**
 * Queue processing jobs for newly retrieved assets
 */
async function queueProcessingJobs(businessId: string): Promise<void> {
  // Find all pending assets for this business
  const pendingAssets = await MediaAssetModel.find({ 
    businessId: new Types.ObjectId(businessId), 
    processingStatus: 'pending' 
  }).lean();
  
  if (pendingAssets.length === 0) {
    logger.info(`No pending assets to process for business ${businessId}`);
    return;
  }
  
  logger.info(`Queuing processing jobs for ${pendingAssets.length} assets`);
  
  // Queue a processing job for each asset
  for (const asset of pendingAssets) {
    const jobType = asset.assetType === 'video' ? 'transcription' : 'imageAnalysis';
    
    await mediaProcessingQueue.add(jobType, {
      assetId: asset._id.toString(),
      businessId: businessId,
      assetType: asset.assetType,
      url: asset.url
    }, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 30000, // 30 seconds initial delay
      }
    });
  }
  
  // Mark assets as processing
  await MediaAssetModel.updateMany(
    { 
      businessId: new Types.ObjectId(businessId), 
      processingStatus: 'pending' 
    },
    { 
      $set: { processingStatus: 'processing' },
      $currentDate: { lastProcessedAt: true }
    }
  );
}

// Schedule media retrieval job based on cron setting
export const scheduleMediaRetrievalJob = async () => {
  const cronSchedule = process.env.CRON_MEDIA_RETRIEVAL_SCHEDULE || '0 4 * * *'; // Default to 4 AM daily
  
  // Remove any existing recurring jobs
  await mediaRetrievalQueue.obliterate({ force: true });
  
  // Add the recurring job
  await mediaRetrievalQueue.add('media-retrieval-daily', {}, { 
    repeat: { 
      pattern: cronSchedule 
    },
    removeOnComplete: true,
    removeOnFail: 1000
  });
  
  logger.info(`Media retrieval job scheduled with cron pattern: ${cronSchedule}`);
};

// Function to run media retrieval job manually for a specific business
export const runMediaRetrievalManually = async (businessId: string, platform?: string) => {
  await mediaRetrievalQueue.add('media-retrieval-manual', { 
    businessId,
    platform
  }, { 
    priority: 1,
    removeOnComplete: true
  });
  logger.info(`Media retrieval job manually triggered for business ${businessId}`);
};
