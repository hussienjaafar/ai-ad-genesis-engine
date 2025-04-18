
import Redis from 'ioredis-mock';

/**
 * Setup a mock Redis server for testing
 */
export async function setupRedisServer(): Promise<void> {
  // Create a mock Redis instance
  const mockRedis = new Redis();
  
  // Replace the real Redis implementation with our mock
  jest.mock('../../src/lib/redis', () => {
    return {
      setWithExpiry: async (key: string, value: string, expirySeconds: number): Promise<void> => {
        await mockRedis.set(key, value, 'EX', expirySeconds);
      },
      get: async (key: string): Promise<string | null> => {
        return await mockRedis.get(key);
      },
      del: async (key: string): Promise<void> => {
        await mockRedis.del(key);
      },
      default: mockRedis
    };
  });
}

/**
 * Teardown the mock Redis server after testing
 */
export async function teardownRedisServer(): Promise<void> {
  try {
    const mockRedis = require('../../src/lib/redis').default;
    if (mockRedis && typeof mockRedis.disconnect === 'function') {
      await mockRedis.disconnect();
    }
  } catch (error) {
    // Ignore errors during teardown
  }
}
