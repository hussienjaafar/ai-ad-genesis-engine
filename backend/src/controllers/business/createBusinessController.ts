
import { Request, Response } from 'express';
import BusinessService from '../../services/businessService';

export class CreateBusinessController {
  public static async create(req: Request, res: Response): Promise<Response> {
    try {
      const { name, businessType, description, contact, offerings, brandVoice } = req.body;

      if (!name || !businessType || !contact?.email) {
        return res.status(400).json({
          error: 'Missing required fields',
          requiredFields: ['name', 'businessType', 'contact.email'],
        });
      }

      const business = await BusinessService.create({
        name,
        businessType,
        description,
        contact,
        offerings,
        brandVoice,
      });

      return res.status(201).json(business);
    } catch (error: any) {
      console.error('Create business error:', error);
      return res.status(500).json({ error: 'Failed to create business' });
    }
  }
}

export default CreateBusinessController;
