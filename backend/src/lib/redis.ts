
import Redis from 'ioredis';

// Create Redis client
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  // If not in production, allow Redis connection failures (useful for local development)
  lazyConnect: process.env.NODE_ENV !== 'production',
});

// Connect to Redis
redis.on('error', (err) => {
  console.error('Redis connection error:', err);
  // In development mode, we don't want to crash the server if Redis is not available
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
});

// Helper function to store a value with expiry
export async function setWithExpiry(key: string, value: string, expirySeconds: number = 600): Promise<void> {
  try {
    await redis.set(key, value, 'EX', expirySeconds);
  } catch (error) {
    console.error('Redis setWithExpiry error:', error);
    // In development, fail gracefully
    if (process.env.NODE_ENV === 'production') {
      throw error;
    }
  }
}

// Helper function to get a value
export async function get(key: string): Promise<string | null> {
  try {
    return await redis.get(key);
  } catch (error) {
    console.error('Redis get error:', error);
    // In development, fail gracefully
    if (process.env.NODE_ENV === 'production') {
      throw error;
    }
    return null;
  }
}

// Helper function to delete a key
export async function del(key: string): Promise<void> {
  try {
    await redis.del(key);
  } catch (error) {
    console.error('Redis del error:', error);
    // In development, fail gracefully
    if (process.env.NODE_ENV === 'production') {
      throw error;
    }
  }
}

export default redis;
