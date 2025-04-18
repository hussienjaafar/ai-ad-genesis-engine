
import { Request, Response } from 'express';
import AuthService from '../../services/authService';

export async function loginController(req: Request, res: Response): Promise<Response> {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const ip = req.ip;
    const userAgent = req.get('user-agent') || '';

    const tokens = await AuthService.login(email, password, ip, userAgent);

    res.cookie('refreshToken', tokens.refreshToken, AuthService.COOKIE_OPTIONS);
    
    return res.json({ 
      accessToken: tokens.accessToken 
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(401).json({ error: 'Invalid email or password' });
  }
}
