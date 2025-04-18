
import { Request, Response } from 'express';
import crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import { google } from 'googleapis';
import { encrypt } from '../../lib/crypto';
import { generateSecureRandomString } from '../../lib/crypto';
import BusinessService from '../../services/businessService';
import { handleOAuthInit, getRedirectUri } from './oauthUtils';
import { setWithExpiry, get, del } from '../../lib/redis';

export class GoogleOAuthController {
  static async init(req: Request, res: Response) {
    try {
      const sessionId = req.sessionID || generateSecureRandomString();
      const { state, businessId } = await handleOAuthInit(req, sessionId, 'oauth:google');
      
      // Generate code verifier and challenge for PKCE
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
      
      // Store in cookies
      res.cookie('oauth_state', state, { 
        httpOnly: true, 
        secure: process.env.NODE_ENV === 'production',
        maxAge: 10 * 60 * 1000
      });
      
      res.cookie('oauth_code_verifier', codeVerifier, { 
        httpOnly: true, 
        secure: process.env.NODE_ENV === 'production',
        maxAge: 10 * 60 * 1000
      });
      
      res.cookie('oauth_business_id', businessId, { 
        httpOnly: true, 
        secure: process.env.NODE_ENV === 'production',
        maxAge: 10 * 60 * 1000
      });
      
      // Create OAuth client and generate auth URL
      const redirectUri = getRedirectUri(req, 'google');
      
      const oauth2Client = new OAuth2Client(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        redirectUri
      );
      
      // Check if business already has Google connection
      const business = await BusinessService.getBusinessById(businessId);
      const hasGoogleConnection = business?.integrations?.adPlatforms?.google?.isConnected;
      
      const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: [
          'https://www.googleapis.com/auth/adwords',
          'https://www.googleapis.com/auth/userinfo.email'
        ],
        state,
        prompt: hasGoogleConnection ? 'select_account' : 'consent',
        code_challenge_method: 'S256',
        code_challenge: codeChallenge
      });
      
      res.redirect(authUrl);
    } catch (error) {
      console.error('Google OAuth init error:', error);
      res.status(500).json({ error: 'Failed to initialize Google OAuth flow' });
    }
  }

  static async callback(req: Request, res: Response) {
    try {
      // Verify state parameter
      const { state, code } = req.query;
      const sessionId = req.sessionID || '';
      const storedState = await get(`oauth:google:state:${sessionId}`);
      const fallbackState = req.cookies.oauth_state;
      
      const validState = storedState || fallbackState;
      
      if (!state || !validState || state !== validState) {
        return res.status(400).json({ error: 'Invalid state parameter' });
      }
      
      // Get code verifier
      const storedVerifier = await get(`oauth:google:verifier:${sessionId}`);
      const fallbackVerifier = req.cookies.oauth_code_verifier;
      const codeVerifier = storedVerifier || fallbackVerifier;
      
      const businessId = req.cookies.oauth_business_id;
      
      // Clean up Redis and cookies
      if (storedState) await del(`oauth:google:state:${sessionId}`);
      if (storedVerifier) await del(`oauth:google:verifier:${sessionId}`);
      
      res.clearCookie('oauth_state');
      res.clearCookie('oauth_code_verifier');
      res.clearCookie('oauth_business_id');
      
      if (!code) {
        return res.status(400).json({ error: 'Authorization code not provided' });
      }
      
      // Exchange code for tokens
      const redirectUri = getRedirectUri(req, 'google');
      
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
      
      // Get user info
      oauth2Client.setCredentials(tokens);
      const userInfoClient = google.oauth2({
        auth: oauth2Client,
        version: 'v2'
      });
      
      const userInfo = await userInfoClient.userinfo.get();
      
      // Store tokens
      const encryptedRefreshToken = refresh_token ? encrypt(refresh_token) : null;
      
      await BusinessService.storePlatformCredentials(businessId, 'adPlatforms.google', {
        accountId: userInfo.data.email,
        accountName: userInfo.data.email,
        token: encryptedRefreshToken,
        expiresAt: expiry_date ? new Date(expiry_date).toISOString() : null,
        isConnected: true,
        lastSynced: new Date().toISOString(),
        needsReauth: false
      });
      
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:8080'}/platforms?success=google`);
    } catch (error) {
      console.error('Google OAuth callback error:', error);
      res.status(500).json({ error: 'Failed to complete Google OAuth flow' });
    }
  }
}
