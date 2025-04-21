
import { Request, Response } from 'express';
import BusinessService from '../../services/businessService';
import { Types } from 'mongoose';

export class UpdateBusinessController {
  public static async update(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const updates = req.body;

      if (!Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'Invalid business ID' });
      }

      delete updates._id;
      delete updates.isDeleted;

      const business = await BusinessService.update(id, updates);
      
      if (!business) {
        return res.status(404).json({ error: 'Business not found' });
      }

      return res.json(business);
    } catch (error: any) {
      console.error('Update business error:', error);
      return res.status(500).json({ error: 'Failed to update business' });
    }
  }
}

export default UpdateBusinessController;
