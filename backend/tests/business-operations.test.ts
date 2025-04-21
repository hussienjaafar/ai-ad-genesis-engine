
import request from 'supertest';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import businessRoutes from '../src/routes/business';
import { Types } from 'mongoose';
import { validateBody } from '../src/middleware/validate';
import { createBusinessSchema } from '../src/schemas/businessSchema';

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

describe('Business API Operations', () => {
  describe('POST /api/businesses', () => {
    it('should create a new business with valid data', async () => {
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

    it('should reject incomplete business data', async () => {
      const invalidData = {
        businessType: 'e-commerce',
      };

      const response = await request(app)
        .post('/api/businesses')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('PUT /api/businesses/:id', () => {
    let businessId: string;

    beforeEach(async () => {
      // Create a test business
      const businessResponse = await request(app)
        .post('/api/businesses')
        .send({
          name: 'Update Test Business',
          businessType: 'retail',
          contact: {
            email: 'update@example.com',
          },
        });

      businessId = businessResponse.body._id;
    });

    it('should update business details', async () => {
      const updatedData = {
        name: 'Updated Business Name',
        description: 'New description for testing',
      };

      const response = await request(app)
        .put(`/api/businesses/${businessId}`)
        .send(updatedData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('name', updatedData.name);
      expect(response.body).toHaveProperty('description', updatedData.description);
    });

    it('should reject invalid business ID', async () => {
      const response = await request(app)
        .put('/api/businesses/invalid-id')
        .send({ name: 'Invalid Update' });

      expect(response.status).toBe(400);
    });
  });
});
