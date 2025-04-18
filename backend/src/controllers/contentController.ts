
import { Request, Response } from 'express';
import ContentGenerationService from '../services/contentGenerationService';
import { Types } from 'mongoose';

export class ContentController {
  /**
   * @swagger
   * /api/businesses/{id}/content/generate:
   *   post:
   *     summary: Generate content for a business
   *     tags: [Content]
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
   *             required:
   *               - contentType
   *               - params
   *             properties:
   *               contentType:
   *                 type: string
   *               params:
   *                 type: object
   *     responses:
   *       201:
   *         description: Content generated successfully
   *       400:
   *         description: Bad request
   *       404:
   *         description: Business not found
   */
  public static async generateContent(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const { contentType, params } = req.body;

      if (!Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'Invalid business ID' });
      }

      if (!contentType) {
        return res.status(400).json({ error: 'Content type is required' });
      }

      if (!params || typeof params !== 'object') {
        return res.status(400).json({ error: 'Valid params object is required' });
      }

      const content = await ContentGenerationService.generateContent(id, contentType, params);

      return res.status(201).json(content);
    } catch (error: any) {
      console.error('Content generation error:', error);
      return res.status(500).json({ error: 'Failed to generate content' });
    }
  }

  /**
   * @swagger
   * /api/businesses/{id}/content:
   *   get:
   *     summary: Get content for a business
   *     tags: [Content]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *       - in: query
   *         name: contentType
   *         schema:
   *           type: string
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
   *         description: Content list retrieved successfully
   *       400:
   *         description: Bad request
   */
  public static async getContentForBusiness(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const contentType = req.query.contentType as string;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      if (!Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'Invalid business ID' });
      }

      const result = await ContentGenerationService.getContentForBusiness(id, contentType, limit, page);

      return res.json(result);
    } catch (error: any) {
      console.error('Get content error:', error);
      return res.status(500).json({ error: 'Failed to retrieve content' });
    }
  }

  /**
   * @swagger
   * /api/content/{id}:
   *   get:
   *     summary: Get content by ID
   *     tags: [Content]
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
   *         description: Content retrieved successfully
   *       404:
   *         description: Content not found
   */
  public static async getContentById(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;

      if (!Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'Invalid content ID' });
      }

      const content = await ContentGenerationService.getContentById(id);
      
      if (!content) {
        return res.status(404).json({ error: 'Content not found' });
      }

      return res.json(content);
    } catch (error: any) {
      console.error('Get content by ID error:', error);
      return res.status(500).json({ error: 'Failed to retrieve content' });
    }
  }
}

export default ContentController;
