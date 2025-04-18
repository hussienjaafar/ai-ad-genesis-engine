
import request from 'supertest';
import { app } from '../src/server';
import * as redis from '../src/lib/redis';

// Mock Redis functions
jest.mock('../src/lib/redis', () => ({
  setWithExpiry: jest.fn(),
  get: jest.fn(),
  del: jest.fn()
}));

describe('OAuth State Parameter Validation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Meta OAuth Flow', () => {
    it('should return 400 when state parameter is invalid', async () => {
      // Mock Redis get function to return a different state than what's passed in the request
      (redis.get as jest.Mock).mockResolvedValue('stored-state-value');

      const response = await request(app)
        .get('/api/oauth/meta/callback')
        .query({
          state: 'different-state-value', 
          code: 'test-code'
        })
        .set('Cookie', ['oauth_business_id=123']);

      expect(response.status).toBe(400);
      expect(response.body.error).toEqual('Invalid state parameter');
    });

    it('should proceed when state parameter is valid', async () => {
      // Mock Redis get function to return the same state that's passed in the request
      const validState = 'valid-state-value';
      (redis.get as jest.Mock).mockResolvedValue(validState);

      // We'll mock the response to avoid making actual API calls
      const mockResponse = {
        status: 302, // Indicates redirect
        redirect: true
      };
      
      // Mock axios for this test
      jest.mock('axios', () => ({
        get: jest.fn().mockResolvedValue({
          data: {
            access_token: 'test-token',
            expires_in: 3600
          }
        })
      }));

      const response = await request(app)
        .get('/api/oauth/meta/callback')
        .query({
          state: validState, 
          code: 'test-code'
        })
        .set('Cookie', ['oauth_business_id=123']);

      // This response will not actually work in a test environment because of missing
      // dependencies, but we can test that it gets past the state validation check
      expect(response.status).not.toBe(400);
    });
  });

  describe('Google OAuth Flow', () => {
    it('should return 400 when state parameter is invalid', async () => {
      // Mock Redis get function to return a different state than what's passed in the request
      (redis.get as jest.Mock).mockResolvedValue('stored-state-value');

      const response = await request(app)
        .get('/api/oauth/google/callback')
        .query({
          state: 'different-state-value', 
          code: 'test-code'
        })
        .set('Cookie', ['oauth_business_id=123']);

      expect(response.status).toBe(400);
      expect(response.body.error).toEqual('Invalid state parameter');
    });
  });
});
