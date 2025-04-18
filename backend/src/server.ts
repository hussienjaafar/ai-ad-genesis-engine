
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { connectToDatabase } from './lib/mongoose';

// Import routes
import apiRoutes from './routes';
import setupSwagger from './lib/swagger';

// Initialize Express app
const app = express();
const port = process.env.PORT || 4000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

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

// Start server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectToDatabase();
    console.log('Connected to MongoDB');

    // Start Express server
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
