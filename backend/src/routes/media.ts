
import express from 'express';
import MediaController from '../controllers/mediaController';
import authorize, { verifyBusinessOwnership } from '../middleware/auth';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Media
 *   description: Media asset management endpoints
 */

/**
 * @swagger
 * /businesses/{id}/media:
 *   get:
 *     summary: Get all media assets for a business
 *     tags: [Media]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Business ID
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [video, image]
 *         description: Filter by asset type
 *       - in: query
 *         name: platform
 *         schema:
 *           type: string
 *         description: Filter by platform
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, processing, complete, failed]
 *         description: Filter by processing status
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of media assets
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 assets:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/MediaAsset'
 *                 pagination:
 *                   type: object
 *                 stats:
 *                   type: object
 */
router.get('/:businessId/media', authorize, verifyBusinessOwnership, MediaController.getMediaAssets);

/**
 * @swagger
 * /businesses/{id}/media/{mediaId}:
 *   get:
 *     summary: Get a specific media asset by ID
 *     tags: [Media]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Business ID
 *       - in: path
 *         name: mediaId
 *         schema:
 *           type: string
 *         required: true
 *         description: Media asset ID
 *     responses:
 *       200:
 *         description: Media asset details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MediaAsset'
 */
router.get('/:businessId/media/:mediaId', authorize, verifyBusinessOwnership, MediaController.getMediaAsset);

/**
 * @swagger
 * /businesses/{id}/media/retrieve:
 *   post:
 *     summary: Trigger manual retrieval of media assets
 *     tags: [Media]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Business ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               platform:
 *                 type: string
 *                 description: Specific platform to retrieve from (optional)
 *     responses:
 *       200:
 *         description: Media retrieval job queued successfully
 */
router.post('/:businessId/media/retrieve', authorize, verifyBusinessOwnership, MediaController.triggerMediaRetrieval);

export default router;
