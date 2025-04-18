
import express from 'express';
import authRoutes from './auth';
import businessRoutes from './business';
import contentRoutes from './content';
import oauthRoutes from './oauth';
import analyticsRoutes from './analytics';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/businesses', businessRoutes);
router.use('/content', contentRoutes);
router.use('/oauth', oauthRoutes);
router.use('/', analyticsRoutes);

export default router;
