
import request from 'supertest';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import authRoutes from '../src/routes/auth';
import UserModel from '../src/models/User';
import jwt from 'jsonwebtoken';

// Mock JWT secret for tests
process.env.JWT_SECRET = 'test-jwt-secret';

// Create an Express instance for testing
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use('/api/auth', authRoutes);

describe('Auth API', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'Password123',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');

      // Check that user was created in the database
      const user = await UserModel.findOne({ email: userData.email });
      expect(user).toBeTruthy();
      expect(user?.email).toBe(userData.email);
    });

    it('should return 400 if required fields are missing', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ email: 'test@example.com' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 409 if user already exists', async () => {
      // First create a user
      await UserModel.create({
        email: 'existing@example.com',
        passwordHash: 'hashedpassword',
        role: 'client',
      });

      // Try to register with the same email
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'existing@example.com',
          password: 'newpassword',
        });

      expect(response.status).toBe(409);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create a test user before each test
      const user = new UserModel({
        email: 'logintest@example.com',
        passwordHash: 'Password123', // Will be hashed by pre-save hook
        role: 'client',
      });
      await user.save();
    });

    it('should login successfully with correct credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'logintest@example.com',
          password: 'Password123',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
    });

    it('should return 401 with incorrect password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'logintest@example.com',
          password: 'wrongpassword',
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return user profile with valid token', async () => {
      // Create a test user
      const user = new UserModel({
        email: 'profiletest@example.com',
        passwordHash: 'somepassword',
        role: 'client',
      });
      await user.save();

      // Create a test token
      const token = jwt.sign(
        { id: user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET as string,
        { expiresIn: '15m' }
      );

      // Make request with token
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('email', 'profiletest@example.com');
      expect(response.body).toHaveProperty('role', 'client');
    });

    it('should return 401 with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
    });
  });
});
