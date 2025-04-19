
import express from 'express';
import authRoutes from './auth';
import businessRoutes from './business';
import contentRoutes from './content';
import chatRoutes from './chat';
import oauthRoutes from './oauth';
import analyticsRoutes from './analytics';
import experimentRoutes from './experiments';
import agencyRoutes from './agency';
import billingRoutes from './billing';
import mediaRoutes from './media';
import authorize, { verifyBusinessOwnership } from '../middleware/auth';

const router = express.Router();

router.use('/auth', authRoutes);

// Apply business ownership middleware to all business-scoped routes
router.use('/businesses/:businessId', authorize, verifyBusinessOwnership);
router.use('/businesses', businessRoutes);
router.use('/businesses', chatRoutes);

// Apply authorization to all content routes
router.use('/content', authorize, contentRoutes);

router.use('/oauth', oauthRoutes);

// Apply authorization to all analytics routes
router.use('/', authorize, analyticsRoutes);

// Apply authorization to all experiment routes
router.use('/', authorize, experimentRoutes);

// Apply authorization to all media routes
router.use('/businesses', authorize, mediaRoutes);

// Agency routes need authorization
router.use('/agencies', authorize, agencyRoutes);

// Billing routes need authorization
router.use('/billing', authorize, billingRoutes);

export default router;
