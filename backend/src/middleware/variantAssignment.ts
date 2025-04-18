
import { Request, Response, NextFunction } from 'express';
import { mongoose } from '../lib/mongoose';
import ExperimentModel from '../models/Experiment';
import experimentService from '../services/experimentService';

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

    // Generate or extract userId (could be from cookie, header, etc.)
    const userId = req.headers['x-user-id'] as string || req.cookies?.userId || 'anonymous';

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

    // Determine which variant to show
    const variant = experimentService.assignVariant(experiment, userId);

    // Attach experiment info to the request
    req.experimentId = experiment._id.toString();
    req.variant = variant;

    // Forward the assigned variant in case it's needed by frontend
    res.setHeader('X-Experiment-Id', experiment._id.toString());
    res.setHeader('X-Experiment-Variant', variant);

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
