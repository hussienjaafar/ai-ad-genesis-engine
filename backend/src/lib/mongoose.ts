
import mongoose from 'mongoose';

// Configure Mongoose
mongoose.set('strictQuery', false);

const connectToDatabase = async (): Promise<typeof mongoose> => {
  const mongoUri = process.env.MONGODB_URI;
  
  if (!mongoUri) {
    throw new Error('MONGODB_URI environment variable is not set');
  }

  try {
    return await mongoose.connect(mongoUri, {
      maxPoolSize: 20,
      connectTimeoutMS: 10000,
    });
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error;
  }
};

export { mongoose, connectToDatabase };
