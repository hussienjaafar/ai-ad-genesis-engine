
import { Request, Response, NextFunction } from 'express';
import { mongoose } from '../lib/mongoose';
import ExperimentModel from '../models/Experiment';
import experimentService from '../services/experimentService';
import crypto from 'crypto';

/**
 * Calculate a deterministic hash from string input
 * This ensures the same user will always get the same variant
 */
function calculateHash(input: string): number {
  const hash = crypto.createHash('md5').update(input).digest('hex');
  // Convert first 8 chars of hash to number (0-99)
  return parseInt(hash.substring(0, 8), 16) % 100;
}

/**
 * Middleware to assign a variant for active experiments
 * Should be used on routes that track impressions, clicks, or conversions
 */
export const assignVariant = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Extract businessId from request parameters or body
    const businessId = req.params.businessId || req.body.businessId;
    if (!businessId) {
      return next();
    }

    // Generate or extract userId from cookie, header, or query param
    let userId = req.cookies?.userId || req.headers['x-user-id'] as string || req.query.userId as string;
    
    // If no userId found, check for a fp_cookie (first party cookie)
    if (!userId && req.cookies?.fp_cookie) {
      userId = req.cookies.fp_cookie;
    }
    
    // If still no userId, generate an anonymous one
    if (!userId) {
      userId = 'anonymous-' + Math.random().toString(36).substring(2, 15);
      
      // Set a first-party cookie to maintain user identity for variant consistency
      res.cookie('fp_cookie', userId, {
        maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });
    }

    // Find active experiments for this business
    const activeExperiments = await ExperimentModel.find({
      businessId: new mongoose.Types.ObjectId(businessId),
      status: 'active',
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() }
    });

    if (activeExperiments.length === 0) {
      return next();
    }

    // For now, we'll handle just the first active experiment
    // In a more complex system, you could handle multiple concurrent experiments
    const experiment = activeExperiments[0];

    // Determine which variant to show based on deterministic hash
    const combinedId = userId + ':' + experiment._id.toString();
    const bucket = calculateHash(combinedId);
    const variant = bucket < experiment.split.original ? 'original' : 'variant';

    // Attach experiment info to the request
    req.experimentId = experiment._id.toString();
    req.variant = variant;

    // Forward the assigned variant in case it's needed by frontend
    res.setHeader('X-Experiment-Id', experiment._id.toString());
    res.setHeader('X-Experiment-Variant', variant);
    
    // Store the variant in a cookie for front-end usage
    res.cookie(`exp_${experiment._id.toString()}`, variant, {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      httpOnly: false, // Accessible from frontend JS
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });

    next();
  } catch (error) {
    console.error('Error in variant assignment middleware:', error);
    // Don't fail the request if variant assignment fails
    next();
  }
};

// Extend the Express Request interface
declare global {
  namespace Express {
    interface Request {
      experimentId?: string;
      variant?: 'original' | 'variant';
    }
  }
}
