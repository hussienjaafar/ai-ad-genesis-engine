
import express from 'express';
import CreateBusinessController from '../controllers/business/createBusinessController';
import GetBusinessController from '../controllers/business/getBusinessController';
import UpdateBusinessController from '../controllers/business/updateBusinessController';
import OfferingsController from '../controllers/business/offeringsController';
import PlatformCredentialsController from '../controllers/business/platformCredentialsController';
import ContentController from '../controllers/contentController';
import authorize from '../middleware/auth';
import checkRole from '../middleware/roles';
import { validateBody } from '../middleware/validate';
import { createBusinessSchema, updateBusinessSchema, offeringsSchema } from '../schemas/businessSchema';

const router = express.Router();

// List all businesses - admin only
router.get('/', authorize, checkRole('admin'), GetBusinessController.getAll);

// Create business - admin only
router.post('/', 
  authorize, 
  checkRole('admin'), 
  validateBody(createBusinessSchema),
  CreateBusinessController.create
);

// Get a single business - any authenticated user
router.get('/:id', authorize, GetBusinessController.getById);

// Update business - admin or owner
router.put('/:id', 
  authorize, 
  validateBody(updateBusinessSchema),
  UpdateBusinessController.update
);

// Add offerings to a business - admin or owner
router.post('/:id/offerings', 
  authorize, 
  validateBody(offeringsSchema),
  OfferingsController.addOfferings
);

// Store platform credentials - admin or owner
router.post('/:id/platforms/:platform', 
  authorize, 
  PlatformCredentialsController.storePlatformCredentials
);

// Generate content for a business - admin or client owner only
router.post('/:id/content/generate', 
  authorize, 
  checkRole('admin', 'clientOwner'), 
  ContentController.generateContent
);

// Get content for a business
router.get('/:id/content', authorize, ContentController.getContentForBusiness);

export default router;
