
import { Request, Response } from 'express';
import AuthService from '../../services/authService';

export async function refreshController(req: Request, res: Response): Promise<Response> {
  try {
    const refreshToken = req.cookies.refreshToken;
    
    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token is required' });
    }

    const ip = req.ip;
    const userAgent = req.get('user-agent') || '';

    const tokens = await AuthService.refresh(refreshToken, ip, userAgent);

    res.cookie('refreshToken', tokens.refreshToken, AuthService.COOKIE_OPTIONS);
    
    return res.json({ 
      accessToken: tokens.accessToken 
    });
  } catch (error: any) {
    console.error('Token refresh error:', error);
    return res.status(401).json({ error: 'Invalid or expired refresh token' });
  }
}
