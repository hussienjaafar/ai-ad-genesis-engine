
import express from 'express';
import authRoutes from './auth';
import businessRoutes from './business';
import contentRoutes from './content';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/businesses', businessRoutes);
router.use('/content', contentRoutes);

export default router;
