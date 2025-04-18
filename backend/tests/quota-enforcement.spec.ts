
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import UsageService from '../src/services/usageService';
import AIProvider from '../src/services/aiProvider';
import BusinessModel from '../src/models/Business';
import { setupRedisServer, teardownRedisServer } from './utils/redisTestHelper';

// Mock redis for testing
jest.mock('../src/lib/redis', () => ({
  setWithExpiry: jest.fn().mockResolvedValue(true),
  get: jest.fn().mockImplementation((key) => {
    if (key.includes('quota_warning')) return Promise.resolve(null);
    if (key.includes('token_reservation')) return Promise.resolve(null);
    return Promise.resolve(null);
  }),
  del: jest.fn().mockResolvedValue(true),
}));

// Mock the AIProvider's axios call to avoid actual API calls
jest.mock('axios', () => ({
  post: jest.fn().mockResolvedValue({
    data: {
      choices: [{ message: { content: 'Mocked AI response' } }]
    }
  })
}));

describe('Usage Quota Enforcement', () => {
  let mongoServer: MongoMemoryServer;
  let businessId: mongoose.Types.ObjectId;
  let businessIdLimited: mongoose.Types.ObjectId;

  beforeAll(async () => {
    // Setup MongoDB memory server
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);

    // Setup Redis mock server
    await setupRedisServer();

    // Create test businesses with different quotas
    const business = await BusinessModel.create({
      name: 'Normal Quota Business',
      businessType: 'technology',
      contact: { email: 'normal@example.com' },
      status: 'active',
      onboardingStep: 1,
      settings: {
        quotaTokens: 100000 // 100K tokens
      }
    });
    businessId = business._id;

    const limitedBusiness = await BusinessModel.create({
      name: 'Limited Quota Business',
      businessType: 'technology',
      contact: { email: 'limited@example.com' },
      status: 'active',
      onboardingStep: 1,
      settings: {
        quotaTokens: 100 // Very limited quota
      }
    });
    businessIdLimited = limitedBusiness._id;
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
    await teardownRedisServer();
  });

  describe('Quota Check and Enforcement', () => {
    it('should detect when a business has sufficient quota', async () => {
      const quotaInfo = await UsageService.checkQuota(businessId.toString());
      expect(quotaInfo.hasQuota).toBe(true);
      expect(quotaInfo.limit).toBe(100000);
    });

    it('should record usage and subtract from quota', async () => {
      await UsageService.recordUsage(businessId.toString(), 500, 300);
      const quotaInfo = await UsageService.checkQuota(businessId.toString());
      expect(quotaInfo.used).toBe(300);
      expect(quotaInfo.remaining).toBe(99700);
    });

    it('should allow AI requests when quota is sufficient', async () => {
      const provider = new AIProvider();
      const result = await provider.generateCompletion(
        'System prompt',
        'User prompt',
        businessId.toString()
      );
      
      expect(result).toBe('Mocked AI response');
    });

    it('should detect when quota is nearly reached', async () => {
      // Record usage close to the limit
      await UsageService.recordUsage(businessIdLimited.toString(), 80, 80);
      
      // Mock redis to return quota warning
      const redisMock = require('../src/lib/redis');
      redisMock.get.mockImplementation((key) => {
        if (key.includes('quota_warning')) return Promise.resolve('warned');
        return Promise.resolve(null);
      });
      
      const quotaInfo = await UsageService.getMonthlyUsage(businessIdLimited.toString());
      expect(quotaInfo.isApproachingQuota).toBe(true);
      expect(quotaInfo.percentUsed).toBeGreaterThan(80);
    });

    it('should reject AI requests when quota is exceeded', async () => {
      // Record usage that exceeds the quota
      await UsageService.recordUsage(businessIdLimited.toString(), 30, 30);
      
      // Try to generate a completion - should be rejected
      const provider = new AIProvider();
      
      await expect(async () => {
        await provider.generateCompletion(
          'System prompt',
          'User prompt',
          businessIdLimited.toString()
        );
      }).rejects.toThrow('quota exceeded');
    });

    it('should reserve tokens atomically', async () => {
      const reservationAmount = 200;
      await UsageService.reserveTokens(businessId.toString(), reservationAmount);
      
      // Mock the redis.get call to return our reservation
      const redisMock = require('../src/lib/redis');
      redisMock.get.mockImplementation((key) => {
        if (key.includes('token_reservation')) return Promise.resolve(String(reservationAmount));
        return Promise.resolve(null);
      });
      
      // Check that the reservation is accounted for
      const quotaInfo = await UsageService.checkQuota(businessId.toString());
      expect(quotaInfo.used).toBeGreaterThanOrEqual(300 + reservationAmount); // Previous + reservation
    });

    it('should reset quota warnings when requested', async () => {
      await UsageService.resetQuotaWarning(businessIdLimited.toString());
      
      // Mock redis to return null for quota warning
      const redisMock = require('../src/lib/redis');
      redisMock.get.mockImplementation(() => Promise.resolve(null));
      
      const quotaInfo = await UsageService.getMonthlyUsage(businessIdLimited.toString());
      expect(quotaInfo.isApproachingQuota).toBe(false);
    });
  });
});
