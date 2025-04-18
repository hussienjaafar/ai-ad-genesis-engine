
import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../src/server';
import ContentModel from '../src/models/Content';
import BusinessModel from '../src/models/Business';
import UserModel from '../src/models/User';
import jwt from 'jsonwebtoken';
import AIProvider from '../src/services/aiProvider';

// Mock the AI provider to avoid making actual API calls during tests
jest.mock('../src/services/aiProvider', () => ({
  generateCompletion: jest.fn().mockResolvedValue(`{
    "title": "Test Video: Product Features",
    "intro": "Introducing our amazing product!",
    "mainContent": "Our product solves all your problems with ease.",
    "callToAction": "Buy now and save 20%!",
    "visualNotes": "Show product in use with happy customers."
  }`)
}));

describe('Content API', () => {
  let adminToken: string;
  let clientToken: string;
  let staffToken: string;
  let businessId: string;
  let adminId: string;
  let clientId: string;
  let staffId: string;

  beforeAll(async () => {
    // Create test users
    const adminUser = await UserModel.create({
      email: 'admin@test.com',
      password: 'password123',
      role: 'admin'
    });
    adminId = adminUser._id.toString();
    
    const clientUser = await UserModel.create({
      email: 'client@test.com',
      password: 'password123',
      role: 'clientOwner'
    });
    clientId = clientUser._id.toString();
    
    const staffUser = await UserModel.create({
      email: 'staff@test.com',
      password: 'password123',
      role: 'staff'
    });
    staffId = staffUser._id.toString();

    // Create test business
    const business = await BusinessModel.create({
      name: 'Test Business',
      industry: 'technology',
      description: 'A test business for content generation',
      offerings: ['Software Development', 'IT Consulting'],
      status: 'active',
      userId: clientId,
    });
    businessId = business._id.toString();
    
    // Generate test tokens
    const jwtSecret = process.env.JWT_SECRET || 'test-secret';
    adminToken = jwt.sign({ id: adminId, email: 'admin@test.com', role: 'admin' }, jwtSecret, { expiresIn: '1h' });
    clientToken = jwt.sign({ id: clientId, email: 'client@test.com', role: 'clientOwner' }, jwtSecret, { expiresIn: '1h' });
    staffToken = jwt.sign({ id: staffId, email: 'staff@test.com', role: 'staff' }, jwtSecret, { expiresIn: '1h' });
  });

  afterAll(async () => {
    await UserModel.deleteMany({});
    await BusinessModel.deleteMany({});
    await ContentModel.deleteMany({});
    await mongoose.connection.close();
  });

  describe('POST /api/businesses/:id/content/generate', () => {
    it('should generate video script content successfully as admin', async () => {
      const response = await request(app)
        .post(`/api/businesses/${businessId}/content/generate`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          contentType: 'videoScript',
          params: {
            tone: 'professional',
            duration: '30 seconds',
            targetAudience: 'business professionals'
          }
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('contentId');
      expect(response.body).toHaveProperty('parsedContent');
      expect(response.body.parsedContent).toHaveProperty('title');
      expect(response.body.parsedContent).toHaveProperty('mainContent');
      expect(response.body.parsedContent).toHaveProperty('callToAction');

      // Verify record was created in database
      const contentId = response.body.contentId;
      const content = await ContentModel.findById(contentId);
      expect(content).not.toBeNull();
      expect(content?.contentType).toBe('videoScript');
      expect(content?.businessId.toString()).toBe(businessId);
    });

    it('should generate content successfully as client owner', async () => {
      const response = await request(app)
        .post(`/api/businesses/${businessId}/content/generate`)
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          contentType: 'facebook',
          params: {
            tone: 'casual',
            product: 'Software Development'
          }
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('contentId');
    });

    it('should reject content generation request from staff role', async () => {
      const response = await request(app)
        .post(`/api/businesses/${businessId}/content/generate`)
        .set('Authorization', `Bearer ${staffToken}`)
        .send({
          contentType: 'google',
          params: {
            tone: 'professional',
            product: 'IT Consulting'
          }
        });

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Forbidden');
    });

    it('should reject request with invalid content type', async () => {
      const response = await request(app)
        .post(`/api/businesses/${businessId}/content/generate`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          contentType: 'invalidType',
          params: {
            tone: 'professional'
          }
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Invalid content type');
    });
  });
});
