
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import { app } from '../src/server';
import BusinessModel from '../src/models/Business';
import UserModel from '../src/models/User';
import StripeService from '../src/services/billing/stripe';
import jwt from 'jsonwebtoken';

// Mock the Stripe service
jest.mock('../src/services/billing/stripe', () => ({
  getOrCreateCustomer: jest.fn().mockResolvedValue('cus_mock123456'),
  createOrUpdateSubscription: jest.fn().mockResolvedValue({
    subscriptionId: 'sub_mock123456',
    clientSecret: 'pi_mock_secret'
  }),
  getSubscriptionDetails: jest.fn().mockResolvedValue({
    status: 'active',
    planId: 'price_mock123',
    currentPeriodEnd: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
    cancelAtPeriodEnd: false
  }),
  getPlans: jest.fn().mockResolvedValue([
    {
      id: 'price_basic123',
      name: 'Basic Plan',
      description: 'For small businesses',
      price: 49,
      tokens: 500000
    },
    {
      id: 'price_pro123',
      name: 'Pro Plan',
      description: 'For growing businesses',
      price: 99,
      tokens: 1500000
    }
  ]),
  cancelSubscription: jest.fn().mockResolvedValue(undefined),
  handleWebhook: jest.fn().mockResolvedValue({ status: 'success', businessId: 'mockBusinessId' })
}));

describe('Billing API', () => {
  let mongoServer: MongoMemoryServer;
  let adminToken: string;
  let clientToken: string;
  let businessId: string;
  let userId: string;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);

    // Create test users
    const adminUser = await UserModel.create({
      email: 'admin@test.com',
      password: 'password123',
      role: 'admin'
    });

    const clientUser = await UserModel.create({
      email: 'client@test.com',
      password: 'password123',
      role: 'clientOwner'
    });
    userId = clientUser._id.toString();

    // Create test business
    const business = await BusinessModel.create({
      name: 'Test Business',
      businessType: 'technology',
      contact: { email: 'business@test.com' },
      status: 'active',
      onboardingStep: 4,
      settings: {
        quotaTokens: 100000,
        billingStatus: 'active',
        planId: 'price_mock123',
        stripeCustomerId: 'cus_mock123',
        stripeSubscriptionId: 'sub_mock123'
      }
    });
    businessId = business._id.toString();

    // Generate test tokens
    const jwtSecret = process.env.JWT_SECRET || 'test-secret';
    adminToken = jwt.sign({ id: adminUser._id, email: 'admin@test.com', role: 'admin' }, jwtSecret, { expiresIn: '1h' });
    clientToken = jwt.sign({ id: clientUser._id, email: 'client@test.com', role: 'clientOwner' }, jwtSecret, { expiresIn: '1h' });
  });

  afterAll(async () => {
    await UserModel.deleteMany({});
    await BusinessModel.deleteMany({});
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  describe('GET /api/businesses/:id/billing', () => {
    it('should return billing details for a business', async () => {
      const response = await request(app)
        .get(`/api/businesses/${businessId}/billing`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('usage');
      expect(response.body).toHaveProperty('subscription');
      expect(response.body.subscription).toHaveProperty('status');
      expect(response.body.subscription).toHaveProperty('planId');
      expect(response.body.subscription).toHaveProperty('currentPeriodEnd');
    });

    it('should handle invalid business ID', async () => {
      const response = await request(app)
        .get(`/api/businesses/invalid-id/billing`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/businesses/:id/billing/subscribe', () => {
    it('should subscribe a business to a plan', async () => {
      const response = await request(app)
        .post(`/api/businesses/${businessId}/billing/subscribe`)
        .set('Authorization', `Bearer ${clientToken}`)
        .send({ planId: 'price_pro123' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('subscriptionId');
      expect(response.body).toHaveProperty('clientSecret');
      expect(StripeService.createOrUpdateSubscription).toHaveBeenCalledWith(
        businessId,
        'price_pro123'
      );
    });

    it('should reject request without plan ID', async () => {
      const response = await request(app)
        .post(`/api/businesses/${businessId}/billing/subscribe`)
        .set('Authorization', `Bearer ${clientToken}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Plan ID is required');
    });
  });

  describe('GET /api/billing/plans', () => {
    it('should return available plans', async () => {
      const response = await request(app)
        .get(`/api/billing/plans`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('name');
      expect(response.body[0]).toHaveProperty('price');
      expect(response.body[0]).toHaveProperty('tokens');
    });
  });

  describe('POST /api/businesses/:id/billing/cancel', () => {
    it('should cancel a subscription', async () => {
      const response = await request(app)
        .post(`/api/businesses/${businessId}/billing/cancel`)
        .set('Authorization', `Bearer ${clientToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status');
      expect(response.body.status).toBe('subscription_canceled');
      expect(StripeService.cancelSubscription).toHaveBeenCalledWith(businessId);
    });
  });
});
