
import { Queue, QueueScheduler, Worker } from 'bullmq';
import { Types } from 'mongoose';
import MediaAssetModel from '../models/MediaAsset';
import TranscriptionProcessor from '../workers/transcriptionProcessor';
import ImageAnalysisProcessor from '../workers/imageAnalysisProcessor';
import ToneAnalysisProcessor from '../workers/toneAnalysisProcessor';
import logger from '../lib/logger';

// Redis connection config from existing setup
const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
};

// Create Media Processing queue
export const mediaProcessingQueue = new Queue('media-processing-queue', { 
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
export const mediaProcessingScheduler = new QueueScheduler('media-processing-queue', { connection });

// Set up workers for different types of processing

// 1. Transcription worker
export const setupTranscriptionWorker = () => {
  const worker = new Worker(
    'media-processing-queue',
    async (job) => {
      const { assetId, businessId } = job.data;
      logger.info(`Processing transcription job for asset ${assetId}`);
      
      try {
        const result = await TranscriptionProcessor.process(assetId);
        
        // If transcription successful, queue tone analysis job
        if (result.success && result.transcript) {
          await mediaProcessingQueue.add('toneAnalysis', {
            assetId,
            businessId,
            transcript: result.transcript
          });
        }
        
        return result;
      } catch (error) {
        logger.error(`Error in transcription job for asset ${assetId}:`, error);
        await markAssetAsFailed(assetId, error.message || 'Transcription failed');
        throw error;
      }
    },
    { 
      connection,
      concurrency: 3, // Process up to 3 transcription jobs concurrently
      limiter: {
        max: 5, // At most 5 jobs
        duration: 60000, // In 1 minute
      }
    }
  );

  worker.on('completed', (job) => {
    logger.info(`Transcription job ${job.id} completed successfully`);
  });

  worker.on('failed', (job, err) => {
    logger.error(`Transcription job ${job?.id} failed with error:`, err);
  });
  
  return worker;
};

// 2. Image Analysis worker
export const setupImageAnalysisWorker = () => {
  const worker = new Worker(
    'media-processing-queue',
    async (job) => {
      const { assetId } = job.data;
      logger.info(`Processing image analysis job for asset ${assetId}`);
      
      try {
        const result = await ImageAnalysisProcessor.process(assetId);
        return result;
      } catch (error) {
        logger.error(`Error in image analysis job for asset ${assetId}:`, error);
        await markAssetAsFailed(assetId, error.message || 'Image analysis failed');
        throw error;
      }
    },
    { 
      connection,
      concurrency: 3, // Process up to 3 image analysis jobs concurrently
      limiter: {
        max: 5,
        duration: 60000,
      }
    }
  );

  worker.on('completed', (job) => {
    logger.info(`Image analysis job ${job.id} completed successfully`);
  });

  worker.on('failed', (job, err) => {
    logger.error(`Image analysis job ${job?.id} failed with error:`, err);
  });
  
  return worker;
};

// 3. Tone Analysis worker
export const setupToneAnalysisWorker = () => {
  const worker = new Worker(
    'media-processing-queue',
    async (job) => {
      const { assetId, transcript } = job.data;
      logger.info(`Processing tone analysis job for asset ${assetId}`);
      
      try {
        const result = await ToneAnalysisProcessor.process(assetId, transcript);
        return result;
      } catch (error) {
        logger.error(`Error in tone analysis job for asset ${assetId}:`, error);
        // Don't mark the asset as failed since transcription was successful
        throw error;
      }
    },
    { 
      connection,
      concurrency: 3, // Process up to 3 tone analysis jobs concurrently
      limiter: {
        max: 10,
        duration: 60000,
      }
    }
  );

  worker.on('completed', (job) => {
    logger.info(`Tone analysis job ${job.id} completed successfully`);
  });

  worker.on('failed', (job, err) => {
    logger.error(`Tone analysis job ${job?.id} failed with error:`, err);
  });
  
  return worker;
};

/**
 * Mark an asset as failed
 */
async function markAssetAsFailed(assetId: string, reason: string): Promise<void> {
  try {
    await MediaAssetModel.findByIdAndUpdate(
      assetId,
      {
        $set: {
          processingStatus: 'failed',
          failureReason: reason,
        },
        $currentDate: { lastProcessedAt: true },
        $inc: { processingAttempts: 1 }
      }
    );
  } catch (error) {
    logger.error(`Error marking asset ${assetId} as failed:`, error);
  }
}

/**
 * Initialize all media processing workers
 */
export const initializeMediaProcessingWorkers = () => {
  const transcriptionWorker = setupTranscriptionWorker();
  const imageAnalysisWorker = setupImageAnalysisWorker();
  const toneAnalysisWorker = setupToneAnalysisWorker();
  
  logger.info('Media processing workers initialized');
  
  return {
    transcriptionWorker,
    imageAnalysisWorker,
    toneAnalysisWorker
  };
};
