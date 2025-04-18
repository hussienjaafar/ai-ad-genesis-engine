
import { Request, Response } from 'express';
import BusinessService from '../services/businessService';
import { Types } from 'mongoose';

export class BusinessController {
  /**
   * @swagger
   * /api/businesses:
   *   post:
   *     summary: Create a new business
   *     tags: [Businesses]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/Business'
   *     responses:
   *       201:
   *         description: Business created successfully
   *       400:
   *         description: Bad request
   *       401:
   *         description: Unauthorized
   */
  public static async create(req: Request, res: Response): Promise<Response> {
    try {
      const { name, businessType, description, contact, offerings, brandVoice } = req.body;

      // Validate required fields
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
        // The onboardingStep and status fields will be set to defaults in the service
      });

      return res.status(201).json(business);
    } catch (error: any) {
      console.error('Create business error:', error);
      return res.status(500).json({ error: 'Failed to create business' });
    }
  }

  /**
   * @swagger
   * /api/businesses/{id}:
   *   get:
   *     summary: Get a business by ID
   *     tags: [Businesses]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Business found
   *       404:
   *         description: Business not found
   */
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

  /**
   * @swagger
   * /api/businesses/{id}:
   *   put:
   *     summary: Update a business
   *     tags: [Businesses]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/Business'
   *     responses:
   *       200:
   *         description: Business updated successfully
   *       404:
   *         description: Business not found
   */
  public static async update(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const updates = req.body;

      if (!Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'Invalid business ID' });
      }

      // Prevent updating certain fields directly
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

  /**
   * @swagger
   * /api/businesses/{id}/offerings:
   *   post:
   *     summary: Add offerings to a business
   *     tags: [Businesses]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               offerings:
   *                 type: array
   *                 items:
   *                   type: string
   *     responses:
   *       200:
   *         description: Offerings added successfully
   *       404:
   *         description: Business not found
   */
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

  /**
   * @swagger
   * /api/businesses/{id}/platforms/{platform}:
   *   post:
   *     summary: Store platform credentials for a business
   *     tags: [Businesses]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *       - in: path
   *         name: platform
   *         required: true
   *         schema:
   *           type: string
   *           enum: [meta, google, linkedin, tiktok]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *     responses:
   *       200:
   *         description: Platform credentials stored successfully
   *       404:
   *         description: Business not found
   */
  public static async storePlatformCredentials(req: Request, res: Response): Promise<Response> {
    try {
      const { id, platform } = req.params;
      const credentials = req.body;

      if (!Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'Invalid business ID' });
      }

      const validPlatforms = ['meta', 'google', 'linkedin', 'tiktok'];
      if (!validPlatforms.includes(platform)) {
        return res.status(400).json({ 
          error: 'Invalid platform',
          validPlatforms
        });
      }

      const business = await BusinessService.storePlatformCredentials(id, platform, credentials);
      
      if (!business) {
        return res.status(404).json({ error: 'Business not found' });
      }

      return res.json({
        message: `${platform} credentials stored successfully`,
        businessId: business._id,
        platform
      });
    } catch (error: any) {
      console.error('Store platform credentials error:', error);
      return res.status(500).json({ error: 'Failed to store platform credentials' });
    }
  }

  /**
   * @swagger
   * /api/businesses:
   *   get:
   *     summary: Get list of businesses
   *     tags: [Businesses]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           default: 1
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 10
   *     responses:
   *       200:
   *         description: List of businesses
   */
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

export default BusinessController;
