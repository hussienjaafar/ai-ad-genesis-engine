
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import path from 'path';
import { connectToDatabase } from './lib/mongoose';
import apiRoutes from './routes';
import setupSwagger from './lib/swagger';
import { startTokenRefreshJob } from './jobs/tokenRefreshJob';
import { startTokenMonitorJob } from './jobs/tokenMonitorJob';
import { scheduleEtlJob, setupEtlWorker, setupPatternWorker } from './queues/etlQueue';
import { scheduleMediaRetrievalJob, setupMediaRetrievalWorker } from './queues/mediaRetrievalQueue';
import { initializeMediaProcessingWorkers } from './queues/mediaProcessingQueue';

// Validate encryption key
if (process.env.NODE_ENV === 'production' && (!process.env.OAUTH_ENCRYPTION_KEY || process.env.OAUTH_ENCRYPTION_KEY.length !== 32)) {
  console.error('ERROR: OAUTH_ENCRYPTION_KEY must be exactly 32 characters in length.');
  process.exit(1);
}

// Validate PUBLIC_URL in production
if (process.env.NODE_ENV === 'production' && !process.env.PUBLIC_URL) {
  console.error('ERROR: PUBLIC_URL environment variable must be set in production.');
  process.exit(1);
}

export const app = express();
const port = process.env.PORT || 4000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : 'http://localhost:8080',
  credentials: true
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Serve static legal pages
app.use('/legal', express.static(path.join(__dirname, '../public/legal')));

// Setup Swagger docs
setupSwagger(app);

// Routes
app.use('/api', apiRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
    },
  });
});

// Start server only if not being imported for testing
if (process.env.NODE_ENV !== 'test') {
  const startServer = async () => {
    try {
      await connectToDatabase();
      console.log('Connected to MongoDB');
      
      // Start token refresh cron job
      startTokenRefreshJob();
      
      // Start token expiry monitor job
      startTokenMonitorJob();
      
      // Initialize ETL BullMQ workers
      const etlWorker = setupEtlWorker();
      const patternWorker = setupPatternWorker();
      
      // Schedule ETL job
      await scheduleEtlJob();
      
      // Initialize Media Retrieval worker
      const mediaRetrievalWorker = setupMediaRetrievalWorker();
      
      // Schedule Media Retrieval job
      await scheduleMediaRetrievalJob();
      
      // Initialize Media Processing workers
      const mediaProcessingWorkers = initializeMediaProcessingWorkers();
      
      console.log('BullMQ workers and schedulers initialized');
      
      app.listen(port, () => {
        console.log(`Server running on port ${port}`);
        console.log(`API Documentation available at http://localhost:${port}/docs`);
      });
    } catch (error) {
      console.error('Failed to start server:', error);
      process.exit(1);
    }
  };

  startServer();
}
