
import express from 'express';
import authRoutes from './auth';
import businessRoutes from './business';
import contentRoutes from './content';
import oauthRoutes from './oauth';
import analyticsRoutes from './analytics';
import experimentRoutes from './experiments';
import agencyRoutes from './agency';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/businesses', businessRoutes);
router.use('/content', contentRoutes);
router.use('/oauth', oauthRoutes);
router.use('/', analyticsRoutes);
router.use('/', experimentRoutes);
router.use('/agencies', agencyRoutes);

export default router;
