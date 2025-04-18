
import { Request, Response } from 'express';
import AuthService from '../../services/authService';

export async function registerController(req: Request, res: Response): Promise<Response> {
  try {
    const { email, password, role } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    const ip = req.ip;
    const userAgent = req.get('user-agent') || '';

    const tokens = await AuthService.register(
      { email, password, role },
      ip,
      userAgent
    );

    res.cookie('refreshToken', tokens.refreshToken, AuthService.COOKIE_OPTIONS);
    
    return res.status(201).json({ 
      accessToken: tokens.accessToken 
    });
  } catch (error: any) {
    if (error.message === 'User with this email already exists') {
      return res.status(409).json({ error: error.message });
    }
    
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Failed to register user' });
  }
}
