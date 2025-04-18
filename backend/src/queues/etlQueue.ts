
import { Queue, QueueScheduler, Worker } from 'bullmq';
import { runEtl } from '../workers/etlWorker';
import { analyzePatterns } from '../services/patternAnalyzer';

// Redis connection config
const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
};

// Create ETL queue
export const etlQueue = new Queue('etl-queue', { connection });

// Create pattern analysis queue
export const patternQueue = new Queue('pattern-queue', { connection });

// Create queue schedulers to manage delayed jobs
export const etlScheduler = new QueueScheduler('etl-queue', { connection });
export const patternScheduler = new QueueScheduler('pattern-queue', { connection });

// ETL worker processor
export const setupEtlWorker = () => {
  const worker = new Worker(
    'etl-queue',
    async (job) => {
      console.log(`Processing ETL job: ${job.id}`);
      await runEtl();
      console.log(`ETL job completed: ${job.id}`);
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

// Function to run ETL job manually
export const runEtlManually = async () => {
  await etlQueue.add('etl-manual', {}, { 
    priority: 1,
    removeOnComplete: true
  });
  console.log('ETL job manually triggered');
};
