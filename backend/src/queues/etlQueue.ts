
import { Queue, QueueScheduler, Worker } from 'bullmq';
import { runEtl } from '../workers/etlWorker';
import { analyzePatterns } from '../services/patternAnalyzer';
import pLimit from 'p-limit';

// Redis connection config
const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
};

// Create ETL queue
export const etlQueue = new Queue('etl-queue', { 
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

// Create pattern analysis queue
export const patternQueue = new Queue('pattern-queue', { 
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

// Create queue schedulers to manage delayed jobs
export const etlScheduler = new QueueScheduler('etl-queue', { connection });
export const patternScheduler = new QueueScheduler('pattern-queue', { connection });

// ETL worker processor with concurrency limit
export const setupEtlWorker = () => {
  const worker = new Worker(
    'etl-queue',
    async (job) => {
      console.log(`Processing ETL job: ${job.id}`);
      
      // Use pLimit to process businesses concurrently but limit to 3
      const businessIds = job.data.businessIds || [];
      if (businessIds.length > 0) {
        const limit = pLimit(3); // Process up to 3 businesses concurrently
        
        const promises = businessIds.map(businessId => 
          limit(() => runEtl(businessId))
        );
        
        await Promise.allSettled(promises);
        console.log(`Completed ETL job ${job.id} for ${businessIds.length} businesses`);
      } else {
        // Legacy behavior - just run ETL without concurrency
        await runEtl();
        console.log(`Completed ETL job ${job.id}`);
      }
    },
    { 
      connection,
      concurrency: 1, // Only one ETL job at a time
      limiter: {
        max: 1,
        duration: 60000, // 1 minute
      }
    }
  );

  worker.on('completed', (job) => {
    console.log(`ETL job ${job.id} completed successfully`);
  });

  worker.on('failed', (job, err) => {
    console.error(`ETL job ${job?.id} failed with error:`, err);
  });

  return worker;
};

// Pattern analysis worker processor
export const setupPatternWorker = () => {
  const worker = new Worker(
    'pattern-queue',
    async (job) => {
      const { businessId } = job.data;
      console.log(`Processing pattern analysis for business: ${businessId}`);
      await analyzePatterns(businessId);
      console.log(`Pattern analysis completed for business: ${businessId}`);
    },
    { 
      connection,
      concurrency: 5, // 5 concurrent pattern analysis jobs
      limiter: {
        max: 10, // At most 10 jobs
        duration: 10000, // In 10 seconds
      }
    }
  );

  worker.on('completed', (job) => {
    console.log(`Pattern analysis job ${job.id} completed successfully`);
  });

  worker.on('failed', (job, err) => {
    console.error(`Pattern analysis job ${job?.id} failed with error:`, err);
  });

  return worker;
};

// Schedule ETL job based on cron setting
export const scheduleEtlJob = async () => {
  const cronSchedule = process.env.CRON_ETL_SCHEDULE || '0 3 * * *'; // Default to 3 AM daily
  
  // Remove any existing recurring jobs
  await etlQueue.obliterate({ force: true });
  
  // Add the recurring job
  await etlQueue.add('etl-daily', {}, { 
    repeat: { 
      pattern: cronSchedule 
    },
    removeOnComplete: true,
    removeOnFail: 1000
  });
  
  console.log(`ETL job scheduled with cron pattern: ${cronSchedule}`);
};

// Function to run ETL job manually with parallel business processing
export const runEtlManually = async (businessIds?: string[]) => {
  await etlQueue.add('etl-manual', { 
    businessIds
  }, { 
    priority: 1,
    removeOnComplete: true
  });
  console.log('ETL job manually triggered');
};

// Create a DailyMetrics model for pre-aggregated analytics data
import mongoose from 'mongoose';
import { IDailyMetrics } from '../models/DailyMetrics';

// Function to update daily metrics during ETL
export const updateDailyMetrics = async (
  businessId: string,
  date: string,
  metrics: {
    impressions: number;
    clicks: number;
    conversions: number;
    spend: number;
    ctr: number;
    cpc: number;
    conversionRate: number;
  }
) => {
  const DailyMetricsModel = mongoose.model<IDailyMetrics>('DailyMetrics');
  
  await DailyMetricsModel.updateOne(
    { businessId, date },
    { 
      $set: { ...metrics } 
    },
    { upsert: true }
  );
};
