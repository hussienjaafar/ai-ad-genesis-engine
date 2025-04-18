
import { Request } from 'express';
import { generateSecureRandomString } from '../../lib/crypto';
import { setWithExpiry } from '../../lib/redis';

export const handleOAuthInit = async (req: Request, sessionId: string, redisKeyPrefix: string) => {
  const state = generateSecureRandomString();
  const businessId = req.query.businessId as string;
  
  if (!businessId) {
    throw new Error('Business ID is required');
  }
  
  // Store state in Redis with session ID as key (10 minute expiry)
  const redisKey = `${redisKeyPrefix}:state:${sessionId}`;
  await setWithExpiry(redisKey, state, 10 * 60); // 10 minutes
  
  return { state, businessId };
};

export const getRedirectUri = (req: Request, platform: string) => {
  // Use PUBLIC_URL in production, fallback to request-based URL in development
  const baseUrl = process.env.NODE_ENV === 'production' && process.env.PUBLIC_URL
    ? process.env.PUBLIC_URL
    : process.env.API_BASE_URL || `${req.protocol}://${req.get('host')}`;
    
  return `${baseUrl}/api/oauth/${platform}/callback`;
};
