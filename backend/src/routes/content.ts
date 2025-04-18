
import express from 'express';
import ContentController from '../controllers/contentController';
import authorize from '../middleware/auth';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Content
 *   description: Content management endpoints
 */

// Get content by ID
router.get('/:id', authorize, ContentController.getContentById);

export default router;
