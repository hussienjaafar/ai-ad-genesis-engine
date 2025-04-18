
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import UsageService from '../src/services/usageService';
import UsageRecordModel from '../src/models/UsageRecord';
import BusinessModel from '../src/models/Business';
import { startOfMonth, endOfMonth } from 'date-fns';

describe('Usage Service', () => {
  let mongoServer: MongoMemoryServer;
  let businessId: mongoose.Types.ObjectId;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);

    // Create test business with quota settings
    const business = await BusinessModel.create({
      name: 'Test Business',
      businessType: 'technology',
      contact: { email: 'test@example.com' },
      status: 'active',
      onboardingStep: 1,
      settings: {
        quotaTokens: 100000
      }
    });
    businessId = business._id;
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  afterEach(async () => {
    await UsageRecordModel.deleteMany({});
  });

  describe('recordUsage', () => {
    it('should create a new usage record if none exists for today', async () => {
      await UsageService.recordUsage(businessId.toString(), 100, 50);
      
      const records = await UsageRecordModel.find({ businessId });
      expect(records).toHaveLength(1);
      expect(records[0].tokensRequested).toBe(100);
      expect(records[0].tokensConsumed).toBe(50);
    });

    it('should update existing usage record for today', async () => {
      // Create initial record
      await UsageService.recordUsage(businessId.toString(), 100, 50);
      
      // Add more usage
      await UsageService.recordUsage(businessId.toString(), 200, 100);
      
      const records = await UsageRecordModel.find({ businessId });
      expect(records).toHaveLength(1);
      expect(records[0].tokensRequested).toBe(300); // 100 + 200
      expect(records[0].tokensConsumed).toBe(150);  // 50 + 100
    });

    it('should throw an error for invalid business ID', async () => {
      await expect(UsageService.recordUsage('invalid-id', 100, 50))
        .rejects.toThrow('Invalid business ID');
    });
  });

  describe('checkQuota', () => {
    it('should return correct quota information when under limit', async () => {
      // Add some usage
      await UsageService.recordUsage(businessId.toString(), 20000, 15000);
      
      const quotaInfo = await UsageService.checkQuota(businessId.toString());
      expect(quotaInfo.hasQuota).toBe(true);
      expect(quotaInfo.used).toBe(15000);
      expect(quotaInfo.limit).toBe(100000);
      expect(quotaInfo.remaining).toBe(85000);
    });

    it('should return hasQuota=false when quota is exceeded', async () => {
      // Add usage that exceeds quota
      await UsageService.recordUsage(businessId.toString(), 120000, 110000);
      
      const quotaInfo = await UsageService.checkQuota(businessId.toString());
      expect(quotaInfo.hasQuota).toBe(false);
      expect(quotaInfo.used).toBe(110000);
      expect(quotaInfo.remaining).toBe(0);
    });

    it('should throw an error for invalid business ID', async () => {
      await expect(UsageService.checkQuota('invalid-id'))
        .rejects.toThrow('Invalid business ID');
    });

    it('should throw an error for non-existent business', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      await expect(UsageService.checkQuota(nonExistentId.toString()))
        .rejects.toThrow('Business not found');
    });
  });

  describe('getUsage', () => {
    it('should return usage data within date range', async () => {
      // Create usage records for different dates
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      // Manually create records for specific dates
      await UsageRecordModel.create({
        businessId,
        date: today,
        tokensRequested: 100,
        tokensConsumed: 50
      });
      
      await UsageRecordModel.create({
        businessId,
        date: yesterday,
        tokensRequested: 200,
        tokensConsumed: 100
      });
      
      const startDate = new Date(yesterday);
      startDate.setDate(startDate.getDate() - 1); // day before yesterday
      
      const endDate = new Date(today);
      
      const usage = await UsageService.getUsage(businessId.toString(), startDate, endDate);
      
      expect(usage).toHaveLength(2);
      expect(usage[0].date.toDateString()).toBe(yesterday.toDateString());
      expect(usage[1].date.toDateString()).toBe(today.toDateString());
    });
  });

  describe('getMonthlyUsage', () => {
    it('should return monthly usage summary', async () => {
      // Create usage records for the current month
      await UsageService.recordUsage(businessId.toString(), 30000, 25000);
      
      const monthlyUsage = await UsageService.getMonthlyUsage(businessId.toString());
      
      expect(monthlyUsage.currentUsage).toBe(25000);
      expect(monthlyUsage.quota).toBe(100000);
      expect(monthlyUsage.percentUsed).toBe(25);
    });
  });
});
