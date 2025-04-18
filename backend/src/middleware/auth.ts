
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { IUser } from '../models/User';
import BusinessModel from '../models/Business';
import mongoose from 'mongoose';

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

/**
 * Middleware to verify that the user has ownership of the business or is an agency admin with access
 */
export const verifyBusinessOwnership = async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => {
  try {
    const { businessId } = req.params;
    
    if (!businessId) {
      return res.status(400).json({ error: 'Business ID is required' });
    }

    if (!mongoose.Types.ObjectId.isValid(businessId)) {
      return res.status(400).json({ error: 'Invalid Business ID format' });
    }

    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // For super admin, always allow access
    if (req.user.role === 'admin') {
      return next();
    }

    const business = await BusinessModel.findById(businessId);
    
    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }

    // Check if user is the owner
    if (business.userId.toString() === req.user.id) {
      return next();
    }

    // If user is an agency admin, check if business is in their client list
    if (req.user.role === 'agencyAdmin') {
      const Agency = mongoose.model('Agency');
      const agency = await Agency.findOne({ adminId: req.user.id });
      
      if (agency && agency.clientBusinessIds.some(id => id.toString() === businessId)) {
        return next();
      }
    }

    // User doesn't have ownership or agency access
    return res.status(403).json({ error: 'Access denied: You do not have permission to access this business' });
  } catch (error) {
    console.error('Error verifying business ownership:', error);
    return res.status(500).json({ error: 'Server error while checking permissions' });
  }
};

export default authorize;
