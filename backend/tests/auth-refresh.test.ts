
import request from 'supertest';
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import authRoutes from '../src/routes/auth';
import UserModel from '../src/models/User';
import jwt from 'jsonwebtoken';
import RefreshTokenModel from '../src/models/RefreshToken';
import authorize from '../src/middleware/auth';

// Mock JWT secret for tests
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.JWT_ACCESS_EXPIRE = '2s'; // Very short expiration for testing refresh
process.env.JWT_REFRESH_EXPIRE = '1d';

// Create an Express instance for testing
const app = express();
app.use(cors({
  origin: 'http://localhost:8080',
  credentials: true
}));
app.use(cookieParser());
app.use(express.json());

// Setup test routes
app.use('/api/auth', authRoutes);
app.get('/api/protected', authorize, (req, res) => {
  res.json({ message: 'Protected route accessed successfully', user: req.user });
});

describe('Auth Refresh Flow', () => {
  let refreshTokenCookie: string;
  let accessToken: string;
  
  beforeEach(async () => {
    // Clean up database collections
    await UserModel.deleteMany({});
    await RefreshTokenModel.deleteMany({});

    // Register a test user
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'refresh-test@example.com',
        password: 'Password123',
      });
    
    // Extract cookies from response
    const cookies = registerResponse.headers['set-cookie'];
    refreshTokenCookie = cookies.find((c: string) => c.startsWith('refreshToken='));
    accessToken = registerResponse.body.accessToken;
  });

  it('should automatically refresh token when accessing protected route with expired token', async () => {
    // Wait for the access token to expire
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    // Try to access protected route without valid access token
    const response = await request(app)
      .get('/api/protected')
      .set('Cookie', refreshTokenCookie)
      // Important: don't send the expired accessToken
      .set('Authorization', 'Bearer invalid-or-expired');
    
    // Should get a successful response because the token was refreshed
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', 'Protected route accessed successfully');
    expect(response.body).toHaveProperty('user');
    expect(response.body.user).toHaveProperty('email', 'refresh-test@example.com');
  });

  it('should fail when no refresh token cookie is present', async () => {
    const response = await request(app)
      .get('/api/protected')
      // No token in the request
      .set('Authorization', 'Bearer invalid-token');
    
    expect(response.status).toBe(401);
  });
});
