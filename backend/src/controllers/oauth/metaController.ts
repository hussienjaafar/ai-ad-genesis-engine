
import { Request, Response } from 'express';
import axios from 'axios';
import { encrypt } from '../../lib/crypto';
import BusinessService from '../../services/businessService';
import { handleOAuthInit, getRedirectUri } from './oauthUtils';
import { get, del } from '../../lib/redis';
import pLimit from 'p-limit';
import alertService from '../../services/alertService';

// Rate limiter for API calls
const limiter = pLimit(5);

export class MetaOAuthController {
  static async init(req: Request, res: Response) {
    try {
      const sessionId = req.sessionID || generateSecureRandomString();
      const { state, businessId } = await handleOAuthInit(req, sessionId, 'oauth:meta');
      
      // Store business ID and state in cookies
      res.cookie('oauth_business_id', businessId, { 
        httpOnly: true, 
        secure: process.env.NODE_ENV === 'production',
        maxAge: 10 * 60 * 1000 // 10 minutes
      });
      
      res.cookie('oauth_state', state, { 
        httpOnly: true, 
        secure: process.env.NODE_ENV === 'production',
        maxAge: 10 * 60 * 1000 // 10 minutes
      });
      
      // Build authorization URL
      const redirectUri = getRedirectUri(req, 'meta');
      
      const authUrl = new URL('https://www.facebook.com/v17.0/dialog/oauth');
      authUrl.searchParams.append('client_id', process.env.FB_APP_ID || '');
      authUrl.searchParams.append('redirect_uri', redirectUri);
      authUrl.searchParams.append('state', state);
      authUrl.searchParams.append('scope', 'ads_management,ads_read');
      authUrl.searchParams.append('response_type', 'code');
      
      res.redirect(authUrl.toString());
    } catch (error) {
      console.error('Meta OAuth init error:', error);
      res.status(500).json({ error: 'Failed to initialize Meta OAuth flow' });
    }
  }

  static async callback(req: Request, res: Response) {
    try {
      // Verify state parameter
      const { state, code, error, error_reason, error_description } = req.query;
      const sessionId = req.sessionID || '';
      const storedState = await get(`oauth:meta:state:${sessionId}`);
      const fallbackState = req.cookies.oauth_state;
      const businessId = req.cookies.oauth_business_id;
      
      const validState = storedState || fallbackState;
      
      // Clean up state in Redis regardless of outcome
      if (storedState) {
        await del(`oauth:meta:state:${sessionId}`);
      }
      
      // Clean up cookies
      res.clearCookie('oauth_state');
      res.clearCookie('oauth_business_id');
      
      // Handle error from Meta OAuth
      if (error) {
        console.error(`Meta OAuth error: ${error}`, { error_reason, error_description });
        return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:8080'}/platforms?error=${error}&error_reason=${error_reason}&error_description=${encodeURIComponent(error_description as string || '')}`);
      }
      
      if (!state || !validState || state !== validState) {
        return res.status(400).json({ error: 'Invalid state parameter' });
      }
      
      if (!code) {
        return res.status(400).json({ error: 'Authorization code not provided' });
      }
      
      // Exchange code for access token
      const redirectUri = getRedirectUri(req, 'meta');
      
      const tokenResponse = await limiter(() => axios.get('https://graph.facebook.com/v17.0/oauth/access_token', {
        params: {
          client_id: process.env.FB_APP_ID,
          client_secret: process.env.FB_APP_SECRET,
          redirect_uri: redirectUri,
          code
        }
      }));
      
      const { access_token } = tokenResponse.data;
      
      // Get long-lived token
      const longLivedTokenResponse = await limiter(() => axios.get('https://graph.facebook.com/v17.0/oauth/access_token', {
        params: {
          grant_type: 'fb_exchange_token',
          client_id: process.env.FB_APP_ID,
          client_secret: process.env.FB_APP_SECRET,
          fb_exchange_token: access_token
        }
      }));
      
      const { access_token: longLivedToken, expires_in: longLivedExpiry } = longLivedTokenResponse.data;
      
      // Get user's ad accounts
      const adAccountsResponse = await limiter(() => 
        axios.get(`https://graph.facebook.com/v17.0/me/adaccounts?access_token=${longLivedToken}&fields=id,name,account_id`)
      );
      
      const adAccount = adAccountsResponse.data.data[0];
      
      // Calculate expiry date and store tokens
      const expiresAt = new Date();
      expiresAt.setSeconds(expiresAt.getSeconds() + longLivedExpiry);
      
      const encryptedToken = encrypt(longLivedToken);
      
      await BusinessService.storePlatformCredentials(businessId, 'adPlatforms.facebook', {
        accountId: adAccount.account_id,
        accountName: adAccount.name,
        token: encryptedToken,
        expiresAt: expiresAt.toISOString(),
        isConnected: true,
        lastSynced: new Date().toISOString(),
        needsReauth: false
      });
      
      // Alert when a business successfully connects with Meta
      await alertService.send({
        level: 'info',
        message: `Business ${businessId} successfully connected Meta Ad Account ${adAccount.account_id}`,
        source: 'oauth:meta',
        businessId,
        details: {
          accountName: adAccount.name,
          expiresAt: expiresAt.toISOString()
        }
      });
      
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:8080'}/platforms?success=facebook`);
    } catch (error) {
      console.error('Meta OAuth callback error:', error);
      res.status(500).json({ error: 'Failed to complete Meta OAuth flow' });
    }
  }
}

function generateSecureRandomString() {
  const crypto = require('crypto');
  return crypto.randomBytes(32).toString('hex');
}
