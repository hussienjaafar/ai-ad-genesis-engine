
import { Request, Response } from 'express';
import BusinessService from '../../services/businessService';
import { Types } from 'mongoose';

export class GetBusinessController {
  public static async getById(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      
      if (!Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'Invalid business ID' });
      }

      const business = await BusinessService.getById(id);
      
      if (!business) {
        return res.status(404).json({ error: 'Business not found' });
      }

      return res.json(business);
    } catch (error: any) {
      console.error('Get business error:', error);
      return res.status(500).json({ error: 'Failed to retrieve business' });
    }
  }

  public static async getAll(req: Request, res: Response): Promise<Response> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await BusinessService.getAll(limit, page);

      return res.json(result);
    } catch (error: any) {
      console.error('List businesses error:', error);
      return res.status(500).json({ error: 'Failed to retrieve businesses' });
    }
  }
}

export default GetBusinessController;
