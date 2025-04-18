
import { Request, Response } from 'express';
import AuthService from '../../services/authService';

export async function logoutController(req: Request, res: Response): Promise<Response> {
  try {
    const refreshToken = req.cookies.refreshToken;
    
    if (refreshToken) {
      await AuthService.revokeToken(refreshToken);
    }

    res.clearCookie('refreshToken', AuthService.COOKIE_OPTIONS);
    return res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({ error: 'Failed to logout' });
  }
}
