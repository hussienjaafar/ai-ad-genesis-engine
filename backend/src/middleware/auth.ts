
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { IUser } from '../models/User';

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
      };
    }
  }
}

export const authorize = (req: Request, res: Response, next: NextFunction): void | Response => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized - Missing or invalid token format' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized - Token not provided' });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('JWT_SECRET not set in environment variables');
      return res.status(500).json({ error: 'Internal server error' });
    }

    // Verify token
    const decoded = jwt.verify(token, jwtSecret) as any;

    // Check if token is about to expire
    const expirationTime = decoded.exp * 1000; // Convert to milliseconds
    const currentTime = Date.now();
    const timeToExpire = expirationTime - currentTime;
    
    // If token expires within 2 minutes (120000 ms), add refresh header
    if (timeToExpire < 120000) {
      res.setHeader('x-token-refresh', 'true');
    }

    // Attach user to request object
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ error: 'Unauthorized - Invalid token' });
    } else if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ error: 'Unauthorized - Token expired' });
    }

    return res.status(401).json({ error: 'Unauthorized' });
  }
};

export default authorize;
