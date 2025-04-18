import { Request, Response } from 'express';
import AuthService, { COOKIE_OPTIONS } from '../services/authService';
import UserModel from '../models/User';

export class AuthController {
  /**
   * @swagger
   * /api/auth/register:
   *   post:
   *     summary: Register a new user
   *     tags: [Authentication]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - email
   *               - password
   *             properties:
   *               email:
   *                 type: string
   *                 format: email
   *               password:
   *                 type: string
   *                 minLength: 6
   *               role:
   *                 type: string
   *                 enum: [admin, client, staff]
   *     responses:
   *       200:
   *         description: User registered successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 accessToken:
   *                   type: string
   *                 refreshToken:
   *                   type: string
   *       400:
   *         description: Bad request
   */
  public static async register(req: Request, res: Response): Promise<Response> {
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

      res.cookie('refreshToken', tokens.refreshToken, COOKIE_OPTIONS);
      
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

  /**
   * @swagger
   * /api/auth/login:
   *   post:
   *     summary: Login with email and password
   *     tags: [Authentication]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - email
   *               - password
   *             properties:
   *               email:
   *                 type: string
   *                 format: email
   *               password:
   *                 type: string
   *     responses:
   *       200:
   *         description: Login successful
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 accessToken:
   *                   type: string
   *                 refreshToken:
   *                   type: string
   *       401:
   *         description: Authentication failed
   */
  public static async login(req: Request, res: Response): Promise<Response> {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      const ip = req.ip;
      const userAgent = req.get('user-agent') || '';

      const tokens = await AuthService.login(email, password, ip, userAgent);

      res.cookie('refreshToken', tokens.refreshToken, COOKIE_OPTIONS);
      
      return res.json({ 
        accessToken: tokens.accessToken 
      });
    } catch (error: any) {
      console.error('Login error:', error);
      return res.status(401).json({ error: 'Invalid email or password' });
    }
  }

  /**
   * @swagger
   * /api/auth/refresh:
   *   post:
   *     summary: Refresh access token using refresh token
   *     tags: [Authentication]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - refreshToken
   *             properties:
   *               refreshToken:
   *                 type: string
   *     responses:
   *       200:
   *         description: Tokens refreshed successfully
   *       401:
   *         description: Invalid or expired refresh token
   */
  public static async refresh(req: Request, res: Response): Promise<Response> {
    try {
      const refreshToken = req.cookies.refreshToken;
      
      if (!refreshToken) {
        return res.status(400).json({ error: 'Refresh token is required' });
      }

      const ip = req.ip;
      const userAgent = req.get('user-agent') || '';

      const tokens = await AuthService.refresh(refreshToken, ip, userAgent);

      res.cookie('refreshToken', tokens.refreshToken, COOKIE_OPTIONS);
      
      return res.json({ 
        accessToken: tokens.accessToken 
      });
    } catch (error: any) {
      console.error('Token refresh error:', error);
      return res.status(401).json({ error: 'Invalid or expired refresh token' });
    }
  }

  /**
   * @swagger
   * /api/auth/logout:
   *   post:
   *     summary: Logout by invalidating refresh token
   *     tags: [Authentication]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - refreshToken
   *             properties:
   *               refreshToken:
   *                 type: string
   *     responses:
   *       200:
   *         description: Logged out successfully
   *       401:
   *         description: Unauthorized
   */
  public static async logout(req: Request, res: Response): Promise<Response> {
    try {
      const refreshToken = req.cookies.refreshToken;
      
      if (refreshToken) {
        await AuthService.revokeToken(refreshToken);
      }

      res.clearCookie('refreshToken', COOKIE_OPTIONS);
      return res.json({ message: 'Logged out successfully' });
    } catch (error) {
      console.error('Logout error:', error);
      return res.status(500).json({ error: 'Failed to logout' });
    }
  }

  /**
   * @swagger
   * /api/auth/me:
   *   get:
   *     summary: Get current user profile
   *     tags: [Authentication]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: User profile retrieved successfully
   *       401:
   *         description: Unauthorized
   */
  public static async me(req: Request, res: Response): Promise<Response> {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const user = await UserModel.findById(req.user.id).select('-passwordHash');
      
      if (!user || user.isDeleted) {
        return res.status(404).json({ error: 'User not found' });
      }

      return res.json({
        id: user._id,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      });
    } catch (error) {
      console.error('Get user profile error:', error);
      return res.status(500).json({ error: 'Failed to retrieve user profile' });
    }
  }
}

export default AuthController;
