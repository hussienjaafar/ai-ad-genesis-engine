import { Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import { encrypt, generateSecureRandomString } from '../../lib/crypto';
import BusinessService from '../../services/businessService';
import { handleOAuthInit, getRedirectUri } from './oauthUtils';
import { get, del } from '../../lib/redis';
import alertService from '../../services/alertService';
import pLimit from 'p-limit';

// Rate limiter for API calls
const limiter = pLimit(5);

export class GoogleOAuthController {
  static async init(req: Request, res: Response) {
    try {
      const sessionId = req.sessionID || generateSecureRandomString();
      const { state, businessId } = await handleOAuthInit(req, sessionId, 'oauth:google');
      
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
      
      // Generate code verifier and challenge for PKCE
      const codeVerifier = generateSecureRandomString();
      await get(`oauth:google:verifier:${sessionId}`, codeVerifier, 10 * 60); // 10 minutes
      
      const codeChallenge = crypto.createHash('sha256')
        .update(codeVerifier)
        .digest('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
      
      // Initialize OAuth client
      const redirectUri = getRedirectUri(req, 'google');
      const oAuth2Client = new OAuth2Client(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        redirectUri
      );
      
      // Generate authentication URL
      // Expanded scope to include openid, profile, email and https://www.googleapis.com/auth/adwords
      const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: [
          'openid',
          'profile',
          'email',
          'https://www.googleapis.com/auth/adwords'
        ],
        state,
        code_challenge: codeChallenge,
        code_challenge_method: 'S256',
        include_granted_scopes: true,
        prompt: 'consent'
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
      const { state, code, error, error_description } = req.query;
      const sessionId = req.sessionID || '';
      const storedState = await get(`oauth:google:state:${sessionId}`);
      const fallbackState = req.cookies.oauth_state;
      const businessId = req.cookies.oauth_business_id;
      
      const validState = storedState || fallbackState;
      
      // Clean up state in Redis regardless of outcome
      if (storedState) {
        await del(`oauth:google:state:${sessionId}`);
      }
      
      // Clean up cookies
      res.clearCookie('oauth_state');
      res.clearCookie('oauth_business_id');
      
      // Handle error from Google OAuth
      if (error) {
        console.error(`Google OAuth error: ${error}`, { error_description });
        return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:8080'}/platforms?error=google&error_reason=${error}&error_description=${encodeURIComponent(error_description as string || '')}`);
      }
      
      if (!state || !validState || state !== validState) {
        return res.status(400).json({ error: 'Invalid state parameter' });
      }
      
      if (!code) {
        return res.status(400).json({ error: 'Authorization code not provided' });
      }
      
      // Exchange code for access token
      const redirectUri = getRedirectUri(req, 'google');
      const oAuth2Client = new OAuth2Client(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        redirectUri
      );
      
      const { tokens } = await oAuth2Client.getToken(code as string);
      const { access_token, refresh_token, expiry_date } = tokens;
      
      if (!access_token) {
        return res.status(500).json({ error: 'Failed to retrieve access token from Google' });
      }
      
      // Get user's email address
      oAuth2Client.setCredentials(tokens);
      const userInfoResponse = await oAuth2Client.request({
        url: 'https://www.googleapis.com/oauth2/v1/userinfo?alt=json'
      });
      
      const userEmail = userInfoResponse.data.email;
      
      // Get Google Ads accounts
      const adsAccountsResponse = await limiter(() => oAuth2Client.request({
        url: `https://www.googleapis.com/ads/v12/customers`,
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': 'application/json',
          'developer-token': 'YOUR_DEVELOPER_TOKEN' // Replace with your actual developer token
        }
      }));
      
      const adsAccount = adsAccountsResponse.data.resourceNames[0];
      
      // Calculate expiry date and store tokens
      const expiresAt = new Date(expiry_date as number);
      
      const encryptedToken = encrypt(access_token);
      const encryptedRefreshToken = refresh_token ? encrypt(refresh_token) : null;
      
      await BusinessService.storePlatformCredentials(businessId, 'adPlatforms.google', {
        accountId: adsAccount,
        accountName: userEmail,
        token: encryptedToken,
        refreshToken: encryptedRefreshToken,
        expiresAt: expiresAt.toISOString(),
        isConnected: true,
        lastSynced: new Date().toISOString(),
        needsReauth: false
      });
      
      // Alert when a business successfully connects with Google
      await alertService.send({
        level: 'info',
        message: `Business ${businessId} successfully connected Google Ads Account ${adsAccount}`,
        source: 'oauth:google',
        businessId,
        details: {
          accountName: userEmail,
          expiresAt: expiresAt.toISOString()
        }
      });
      
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:8080'}/platforms?success=google`);
    } catch (error) {
      console.error('Google OAuth callback error:', error);
      res.status(500).json({ error: 'Failed to complete Google OAuth flow' });
    }
  }
}
