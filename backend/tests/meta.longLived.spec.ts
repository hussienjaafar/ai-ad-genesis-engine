
import axios from 'axios';
import { MetaOAuthController } from '../src/controllers/oauth/metaController';
import BusinessService from '../src/services/businessService';
import * as redis from '../src/lib/redis';
import * as crypto from '../src/lib/crypto';

// Mock dependencies
jest.mock('axios');
jest.mock('../src/lib/redis');
jest.mock('../src/lib/crypto');
jest.mock('../src/services/businessService');
jest.mock('../src/services/alertService', () => ({
  send: jest.fn().mockResolvedValue(undefined)
}));

describe('Meta OAuth Long-lived Token Exchange', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock environment variables
    process.env.FB_APP_ID = 'mock-app-id';
    process.env.FB_APP_SECRET = 'mock-app-secret';
    process.env.FRONTEND_URL = 'http://localhost:3000';
  });
  
  afterEach(() => {
    jest.resetAllMocks();
  });
  
  it('should exchange short-lived token for long-lived token and set correct expiry date', async () => {
    // Mock request and response
    const req = {
      query: {
        code: 'mock-code',
        state: 'mock-state'
      },
      cookies: {
        oauth_state: 'mock-state',
        oauth_business_id: 'mock-business-id'
      },
      sessionID: 'mock-session-id',
      protocol: 'http',
      get: jest.fn().mockReturnValue('localhost:4000')
    } as any;
    
    const res = {
      redirect: jest.fn(),
      clearCookie: jest.fn()
    } as any;
    
    // Mock Redis get & del
    (redis.get as jest.Mock).mockResolvedValue('mock-state');
    (redis.del as jest.Mock).mockResolvedValue(undefined);
    
    // Mock short-lived token response
    (axios.get as jest.Mock).mockImplementation((url) => {
      if (url.includes('oauth/access_token') && !url.includes('fb_exchange_token')) {
        return Promise.resolve({
          data: {
            access_token: 'mock-short-lived-token',
            expires_in: 3600 // 1 hour
          }
        });
      }
      
      if (url.includes('oauth/access_token') && url.includes('fb_exchange_token')) {
        return Promise.resolve({
          data: {
            access_token: 'mock-long-lived-token',
            expires_in: 5184000 // 60 days
          }
        });
      }
      
      if (url.includes('me/adaccounts')) {
        return Promise.resolve({
          data: {
            data: [{
              id: 'act_123456789',
              name: 'Test Ad Account',
              account_id: '123456789'
            }]
          }
        });
      }
      
      return Promise.reject(new Error('Unexpected URL'));
    });
    
    // Mock encrypt function
    (crypto.encrypt as jest.Mock).mockReturnValue('encrypted-token');
    
    // Mock BusinessService.storePlatformCredentials
    (BusinessService.storePlatformCredentials as jest.Mock).mockResolvedValue(undefined);
    
    // Call the callback method
    await MetaOAuthController.callback(req, res);
    
    // Verify token exchange and storage
    expect(axios.get).toHaveBeenCalledTimes(3);
    
    // Check that it called the long-lived token endpoint
    expect(axios.get).toHaveBeenCalledWith(
      expect.stringContaining('oauth/access_token'),
      expect.objectContaining({
        params: expect.objectContaining({
          grant_type: 'fb_exchange_token',
          fb_exchange_token: 'mock-short-lived-token'
        })
      })
    );
    
    // Verify token storage
    expect(BusinessService.storePlatformCredentials).toHaveBeenCalledWith(
      'mock-business-id',
      'adPlatforms.facebook',
      expect.objectContaining({
        token: 'encrypted-token',
        isConnected: true
      })
    );
    
    // Verify the expiresAt date is approximately 60 days in the future
    const call = (BusinessService.storePlatformCredentials as jest.Mock).mock.calls[0][2];
    const expiresAt = new Date(call.expiresAt);
    const now = new Date();
    const daysDiff = (expiresAt.getTime() - now.getTime()) / (1000 * 3600 * 24);
    
    // Should be approximately 60 days (allow 1 day margin for test execution time)
    expect(daysDiff).toBeGreaterThanOrEqual(59);
    expect(daysDiff).toBeLessThanOrEqual(60);
    
    // Verify redirect
    expect(res.redirect).toHaveBeenCalledWith(
      'http://localhost:3000/platforms?success=facebook'
    );
    
    // Verify cookies cleared
    expect(res.clearCookie).toHaveBeenCalledWith('oauth_state');
    expect(res.clearCookie).toHaveBeenCalledWith('oauth_business_id');
  });
});
