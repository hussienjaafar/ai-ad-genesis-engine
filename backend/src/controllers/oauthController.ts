
import { Request, Response } from 'express';
import axios from 'axios';
import crypto from 'crypto';
import { encrypt } from '../lib/crypto';
import { generateSecureRandomString } from '../lib/crypto';
import BusinessService from '../services/businessService';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { setWithExpiry, get, del } from '../lib/redis';
import pLimit from 'p-limit';

// Rate limiter for API calls
const limiter = pLimit(5); // Max 5 concurrent requests

export class OAuthController {
  /**
   * Initialize Meta (Facebook) OAuth flow
   */
  static async metaInit(req: Request, res: Response) {
    try {
      // Generate state for CSRF protection
      const state = generateSecureRandomString();
      const sessionId = req.sessionID || generateSecureRandomString();
      
      // Store state in Redis with session ID as key (10 minute expiry)
      const redisKey = `oauth:meta:state:${sessionId}`;
      await setWithExpiry(redisKey, state, 10 * 60); // 10 minutes
      
      // Business ID for which we're connecting
      const businessId = req.query.businessId as string;
      if (!businessId) {
        return res.status(400).json({ error: 'Business ID is required' });
      }
      
      // Store business ID in session cookie
      res.cookie('oauth_business_id', businessId, { 
        httpOnly: true, 
        secure: process.env.NODE_ENV === 'production',
        maxAge: 10 * 60 * 1000 // 10 minutes
      });
      
      // Set state in cookie for clients without session support
      res.cookie('oauth_state', state, { 
        httpOnly: true, 
        secure: process.env.NODE_ENV === 'production',
        maxAge: 10 * 60 * 1000 // 10 minutes
      });
      
      // Build authorization URL - use API_BASE_URL if set
      const baseUrl = process.env.API_BASE_URL || `${req.protocol}://${req.get('host')}`;
      const redirectUri = `${baseUrl}/api/oauth/meta/callback`;
      
      const authUrl = new URL('https://www.facebook.com/v17.0/dialog/oauth');
      authUrl.searchParams.append('client_id', process.env.FB_APP_ID || '');
      authUrl.searchParams.append('redirect_uri', redirectUri);
      authUrl.searchParams.append('state', state);
      authUrl.searchParams.append('scope', 'ads_management,ads_read');
      authUrl.searchParams.append('response_type', 'code');
      
      // Redirect to Meta authorization page
      res.redirect(authUrl.toString());
    } catch (error) {
      console.error('Meta OAuth init error:', error);
      res.status(500).json({ error: 'Failed to initialize Meta OAuth flow' });
    }
  }
  
  /**
   * Handle Meta (Facebook) OAuth callback
   */
  static async metaCallback(req: Request, res: Response) {
    try {
      // Verify state for CSRF protection
      const { state, code } = req.query;
      const sessionId = req.sessionID || '';
      const storedState = await get(`oauth:meta:state:${sessionId}`);
      const fallbackState = req.cookies.oauth_state;
      const businessId = req.cookies.oauth_business_id;
      
      // Try Redis state first, fall back to cookie
      const validState = storedState || fallbackState;
      
      if (!state || !validState || state !== validState) {
        return res.status(400).json({ error: 'Invalid state parameter' });
      }
      
      // Clean up state
      if (storedState) {
        await del(`oauth:meta:state:${sessionId}`);
      }
      
      // Clear cookies
      res.clearCookie('oauth_state');
      res.clearCookie('oauth_business_id');
      
      if (!code) {
        return res.status(400).json({ error: 'Authorization code not provided' });
      }
      
      // Exchange code for access token
      const baseUrl = process.env.API_BASE_URL || `${req.protocol}://${req.get('host')}`;
      const redirectUri = `${baseUrl}/api/oauth/meta/callback`;
      
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
      
      // Get user's ad accounts with pagination support
      let adAccountsResponse;
      let adAccount;
      let nextPageUrl = `https://graph.facebook.com/v17.0/me/adaccounts?access_token=${longLivedToken}&fields=id,name,account_id`;
      
      // Use the first page only for now
      adAccountsResponse = await limiter(() => axios.get(nextPageUrl));
      
      // Take the first ad account for now (could be expanded to let user choose)
      adAccount = adAccountsResponse.data.data[0];
      
      // Calculate expiry date
      const expiresAt = new Date();
      expiresAt.setSeconds(expiresAt.getSeconds() + longLivedExpiry);
      
      // Encrypt the token
      const encryptedToken = encrypt(longLivedToken);
      
      // Store token in database
      await BusinessService.storePlatformCredentials(businessId, 'adPlatforms.facebook', {
        accountId: adAccount.account_id,
        accountName: adAccount.name,
        token: encryptedToken,
        expiresAt: expiresAt.toISOString(),
        isConnected: true,
        lastSynced: new Date().toISOString(),
        needsReauth: false
      });
      
      // Redirect back to integration page
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:8080'}/platforms?success=facebook`);
    } catch (error) {
      console.error('Meta OAuth callback error:', error);
      res.status(500).json({ error: 'Failed to complete Meta OAuth flow' });
    }
  }
  
  /**
   * Initialize Google OAuth flow
   */
  static async googleInit(req: Request, res: Response) {
    try {
      // Create OAuth client
      const baseUrl = process.env.API_BASE_URL || `${req.protocol}://${req.get('host')}`;
      const redirectUri = `${baseUrl}/api/oauth/google/callback`;
      
      const oauth2Client = new OAuth2Client(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        redirectUri
      );
      
      // Generate state for CSRF protection
      const state = generateSecureRandomString();
      const sessionId = req.sessionID || generateSecureRandomString();
      
      // Store state in Redis with session ID as key
      const redisKey = `oauth:google:state:${sessionId}`;
      await setWithExpiry(redisKey, state, 10 * 60); // 10 minutes
      
      // Generate code verifier and challenge
      const codeVerifier = generateSecureRandomString();
      const codeChallenge = crypto
        .createHash('sha256')
        .update(codeVerifier)
        .digest('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
      
      // Store code verifier in Redis
      await setWithExpiry(`oauth:google:verifier:${sessionId}`, codeVerifier, 10 * 60);
      
      // Business ID for which we're connecting
      const businessId = req.query.businessId as string;
      if (!businessId) {
        return res.status(400).json({ error: 'Business ID is required' });
      }
      
      // Store state in cookie as fallback
      res.cookie('oauth_state', state, { 
        httpOnly: true, 
        secure: process.env.NODE_ENV === 'production',
        maxAge: 10 * 60 * 1000 // 10 minutes
      });
      
      // Store code verifier in cookie as fallback
      res.cookie('oauth_code_verifier', codeVerifier, { 
        httpOnly: true, 
        secure: process.env.NODE_ENV === 'production',
        maxAge: 10 * 60 * 1000 // 10 minutes
      });
      
      res.cookie('oauth_business_id', businessId, { 
        httpOnly: true, 
        secure: process.env.NODE_ENV === 'production',
        maxAge: 10 * 60 * 1000 // 10 minutes
      });
      
      // Check if business already has a Google connection
      const business = await BusinessService.getBusinessById(businessId);
      const hasGoogleConnection = business?.integrations?.adPlatforms?.google?.isConnected;

      // Generate auth URL
      const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: [
          'https://www.googleapis.com/auth/adwords',
          'https://www.googleapis.com/auth/userinfo.email'
        ],
        state,
        prompt: hasGoogleConnection ? 'select_account' : 'consent', // Force to get refresh token if new connection
        code_challenge_method: 'S256',
        code_challenge: codeChallenge
      });
      
      // Redirect to Google authorization page
      res.redirect(authUrl);
    } catch (error) {
      console.error('Google OAuth init error:', error);
      res.status(500).json({ error: 'Failed to initialize Google OAuth flow' });
    }
  }
  
  /**
   * Handle Google OAuth callback
   */
  static async googleCallback(req: Request, res: Response) {
    try {
      // Verify state for CSRF protection
      const { state, code } = req.query;
      const sessionId = req.sessionID || '';
      const storedState = await get(`oauth:google:state:${sessionId}`);
      const fallbackState = req.cookies.oauth_state;
      
      // Try Redis state first, fall back to cookie
      const validState = storedState || fallbackState;
      
      if (!state || !validState || state !== validState) {
        return res.status(400).json({ error: 'Invalid state parameter' });
      }
      
      // Get code verifier
      const storedVerifier = await get(`oauth:google:verifier:${sessionId}`);
      const fallbackVerifier = req.cookies.oauth_code_verifier;
      const codeVerifier = storedVerifier || fallbackVerifier;
      
      const businessId = req.cookies.oauth_business_id;
      
      // Clean up state and verifier
      if (storedState) {
        await del(`oauth:google:state:${sessionId}`);
      }
      if (storedVerifier) {
        await del(`oauth:google:verifier:${sessionId}`);
      }
      
      // Clear cookies
      res.clearCookie('oauth_state');
      res.clearCookie('oauth_code_verifier');
      res.clearCookie('oauth_business_id');
      
      if (!code) {
        return res.status(400).json({ error: 'Authorization code not provided' });
      }
      
      // Exchange code for tokens
      const baseUrl = process.env.API_BASE_URL || `${req.protocol}://${req.get('host')}`;
      const redirectUri = `${baseUrl}/api/oauth/google/callback`;
      
      const oauth2Client = new OAuth2Client(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        redirectUri
      );
      
      const { tokens } = await oauth2Client.getToken({
        code: code as string,
        codeVerifier
      });
      
      const { access_token, refresh_token, expiry_date } = tokens;
      
      // Get user info to identify account
      oauth2Client.setCredentials(tokens);
      const userInfoClient = google.oauth2({
        auth: oauth2Client,
        version: 'v2'
      });
      
      const userInfo = await userInfoClient.userinfo.get();
      
      // Encrypt tokens
      const encryptedRefreshToken = refresh_token ? encrypt(refresh_token) : null;
      
      // Store tokens in database
      await BusinessService.storePlatformCredentials(businessId, 'adPlatforms.google', {
        accountId: userInfo.data.email,
        accountName: userInfo.data.email,
        token: encryptedRefreshToken,
        expiresAt: expiry_date ? new Date(expiry_date).toISOString() : null,
        isConnected: true,
        lastSynced: new Date().toISOString(),
        needsReauth: false
      });
      
      // Redirect back to integration page
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:8080'}/platforms?success=google`);
    } catch (error) {
      console.error('Google OAuth callback error:', error);
      res.status(500).json({ error: 'Failed to complete Google OAuth flow' });
    }
  }
}

export default OAuthController;
