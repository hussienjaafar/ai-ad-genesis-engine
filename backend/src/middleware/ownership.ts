
import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';

/**
 * Middleware to verify agency admin can only access their own agencies
 */
export const verifyAgencyOwnership = async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => {
  try {
    const { agencyId } = req.params;
    
    if (!agencyId) {
      return res.status(400).json({ error: 'Agency ID is required' });
    }

    if (!mongoose.Types.ObjectId.isValid(agencyId)) {
      return res.status(400).json({ error: 'Invalid Agency ID format' });
    }

    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // For super admin, always allow access
    if (req.user.role === 'admin') {
      return next();
    }

    const Agency = mongoose.model('Agency');
    const agency = await Agency.findById(agencyId);
    
    if (!agency) {
      return res.status(404).json({ error: 'Agency not found' });
    }

    // Check if user is the agency admin
    if (agency.adminId.toString() === req.user.id) {
      return next();
    }

    // User doesn't have ownership
    return res.status(403).json({ error: 'Access denied: You do not have permission to access this agency' });
  } catch (error) {
    console.error('Error verifying agency ownership:', error);
    return res.status(500).json({ error: 'Server error while checking permissions' });
  }
};

/**
 * Middleware to verify clients can only access their own business data
 */
export const verifyClientAccess = async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => {
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

    const Business = mongoose.model('Business');
    const business = await Business.findById(businessId);
    
    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }

    // Check if user is the business owner
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

    // User doesn't have ownership
    return res.status(403).json({ error: 'Access denied: You do not have permission to access this business' });
  } catch (error) {
    console.error('Error verifying client access:', error);
    return res.status(500).json({ error: 'Server error while checking permissions' });
  }
};
