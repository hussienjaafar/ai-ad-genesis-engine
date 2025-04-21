
import { Request, Response } from 'express';
import BusinessService from '../../services/businessService';
import { Types } from 'mongoose';

export class OfferingsController {
  public static async addOfferings(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const { offerings } = req.body;

      if (!Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'Invalid business ID' });
      }

      if (!Array.isArray(offerings) || offerings.length === 0) {
        return res.status(400).json({ error: 'Offerings must be a non-empty array' });
      }

      const business = await BusinessService.addOfferings(id, offerings);
      
      if (!business) {
        return res.status(404).json({ error: 'Business not found' });
      }

      return res.json(business);
    } catch (error: any) {
      console.error('Add offerings error:', error);
      return res.status(500).json({ error: 'Failed to add offerings' });
    }
  }
}

export default OfferingsController;
