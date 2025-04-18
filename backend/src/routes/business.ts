
import express from 'express';
import BusinessController from '../controllers/businessController';
import ContentController from '../controllers/contentController';
import authorize from '../middleware/auth';
import checkRole from '../middleware/roles';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Businesses
 *   description: Business management endpoints
 */

// List all businesses - admin only
router.get('/', authorize, checkRole('admin'), BusinessController.getAll);

// Create business - admin only
router.post('/', authorize, checkRole('admin'), BusinessController.create);

// Get a single business - any authenticated user
router.get('/:id', authorize, BusinessController.getById);

// Update business - admin or owner
router.put('/:id', authorize, BusinessController.update);

// Add offerings to a business - admin or owner
router.post('/:id/offerings', authorize, BusinessController.addOfferings);

// Store platform credentials - admin or owner
router.post('/:id/platforms/:platform', authorize, BusinessController.storePlatformCredentials);

/**
 * @swagger
 * tags:
 *   name: Content
 *   description: Content generation endpoints
 */

// Generate content for a business - admin or client owner only
router.post('/:id/content/generate', authorize, checkRole('admin', 'clientOwner'), ContentController.generateContent);

// Get content for a business
router.get('/:id/content', authorize, ContentController.getContentForBusiness);

export default router;
