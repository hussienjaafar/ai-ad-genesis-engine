
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/server';
import AuthService from '../src/services/authService';
import BusinessModel from '../src/models/Business';
import UserModel from '../src/models/User';

describe('Business Ownership Middleware', () => {
  let testUser1: any;
  let testUser2: any;
  let testBusiness1: any;
  let testBusiness2: any;
  let accessToken1: string;
  let accessToken2: string;

  beforeAll(async () => {
    // Clear relevant collections
    await UserModel.deleteMany({});
    await BusinessModel.deleteMany({});

    // Create test users
    testUser1 = await UserModel.create({
      email: 'owner@test.com',
      passwordHash: 'password123', // Will be hashed by pre-save hook
      role: 'client'
    });

    testUser2 = await UserModel.create({
      email: 'other@test.com',
      passwordHash: 'password123', // Will be hashed by pre-save hook
      role: 'client'
    });

    // Generate tokens for users
    const tokens1 = await AuthService.generateTokens(testUser1);
    accessToken1 = tokens1.accessToken;

    const tokens2 = await AuthService.generateTokens(testUser2);
    accessToken2 = tokens2.accessToken;

    // Create businesses owned by the users
    testBusiness1 = await BusinessModel.create({
      name: 'Owner Business',
      userId: testUser1._id,
      businessType: 'retail',
      contact: { email: 'business1@test.com' },
      status: 'active',
      onboardingStep: 1
    });

    testBusiness2 = await BusinessModel.create({
      name: 'Other Business',
      userId: testUser2._id,
      businessType: 'service',
      contact: { email: 'business2@test.com' },
      status: 'active',
      onboardingStep: 1
    });
  });

  afterAll(async () => {
    await UserModel.deleteMany({});
    await BusinessModel.deleteMany({});
    await mongoose.connection.close();
  });

  describe('Business Access Control', () => {
    it('should allow owner to access their business', async () => {
      const response = await request(app)
        .get(`/api/businesses/${testBusiness1._id}`)
        .set('Authorization', `Bearer ${accessToken1}`);

      expect(response.status).toBe(200);
      expect(response.body._id).toBe(testBusiness1._id.toString());
    });

    it('should deny access to a business for non-owners', async () => {
      const response = await request(app)
        .get(`/api/businesses/${testBusiness1._id}`)
        .set('Authorization', `Bearer ${accessToken2}`);

      expect(response.status).toBe(403);
      expect(response.body.error).toContain('Access denied');
    });

    it('should deny business update for non-owners', async () => {
      const response = await request(app)
        .put(`/api/businesses/${testBusiness1._id}`)
        .set('Authorization', `Bearer ${accessToken2}`)
        .send({ name: 'Updated By Non-Owner' });

      expect(response.status).toBe(403);
      expect(response.body.error).toContain('Access denied');
    });

    it('should allow business update for owners', async () => {
      const newName = 'Updated By Owner';
      const response = await request(app)
        .put(`/api/businesses/${testBusiness1._id}`)
        .set('Authorization', `Bearer ${accessToken1}`)
        .send({ name: newName });

      expect(response.status).toBe(200);
      expect(response.body.name).toBe(newName);
    });

    it('should handle invalid business IDs properly', async () => {
      // Test with invalid MongoDB ObjectId format
      const response1 = await request(app)
        .get('/api/businesses/invalid-id')
        .set('Authorization', `Bearer ${accessToken1}`);

      expect(response1.status).toBe(400);
      expect(response1.body.error).toContain('Invalid Business ID format');

      // Test with valid format but non-existent ID
      const nonExistentId = new mongoose.Types.ObjectId();
      const response2 = await request(app)
        .get(`/api/businesses/${nonExistentId}`)
        .set('Authorization', `Bearer ${accessToken1}`);

      expect(response2.status).toBe(404);
      expect(response2.body.error).toContain('not found');
    });
  });
});
