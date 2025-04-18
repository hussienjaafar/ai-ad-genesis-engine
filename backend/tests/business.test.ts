
import request from 'supertest';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import businessRoutes from '../src/routes/business';
import UserModel from '../src/models/User';
import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';

// Mock JWT secret for tests
process.env.JWT_SECRET = 'test-jwt-secret';

// Create an Express instance for testing
const app = express();
app.use(cors());
app.use(bodyParser.json());

// Mock middleware for testing
app.use((req: any, res, next) => {
  req.user = {
    id: new Types.ObjectId().toString(),
    email: 'admin@example.com',
    role: 'admin',
  };
  next();
});

app.use('/api/businesses', businessRoutes);

describe('Business API', () => {
  describe('POST /api/businesses', () => {
    it('should create a new business successfully', async () => {
      const businessData = {
        name: 'Test Business',
        businessType: 'e-commerce',
        contact: {
          email: 'business@example.com',
          phone: '555-123-4567',
        },
      };

      const response = await request(app)
        .post('/api/businesses')
        .send(businessData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('_id');
      expect(response.body.name).toBe(businessData.name);
      expect(response.body.businessType).toBe(businessData.businessType);
      expect(response.body.contact.email).toBe(businessData.contact.email);
    });

    it('should return 400 if required fields are missing', async () => {
      // Missing name
      const invalidData = {
        businessType: 'e-commerce',
        contact: {
          email: 'business@example.com',
        },
      };

      const response = await request(app)
        .post('/api/businesses')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Missing required fields');
    });
  });

  describe('POST /api/businesses/:id/offerings', () => {
    let businessId: string;

    beforeEach(async () => {
      // Create a test business
      const businessResponse = await request(app)
        .post('/api/businesses')
        .send({
          name: 'Offering Test Business',
          businessType: 'retail',
          contact: {
            email: 'offerings@example.com',
          },
        });

      businessId = businessResponse.body._id;
    });

    it('should add offerings to a business', async () => {
      const offeringsData = {
        offerings: ['Product A', 'Service B', 'Consultation'],
      };

      const response = await request(app)
        .post(`/api/businesses/${businessId}/offerings`)
        .send(offeringsData);

      expect(response.status).toBe(200);
      expect(response.body.offerings).toEqual(expect.arrayContaining(offeringsData.offerings));
    });

    it('should return 400 if offerings is not an array', async () => {
      const response = await request(app)
        .post(`/api/businesses/${businessId}/offerings`)
        .send({ offerings: 'Not an array' });

      expect(response.status).toBe(400);
    });
  });
});
