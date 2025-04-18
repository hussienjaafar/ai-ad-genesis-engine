
import express from 'express';
import { rateLimit } from 'express-rate-limit';
import AuthController from '../controllers/authController';
import authorize from '../middleware/auth';

const router = express.Router();

// Rate limiting for login attempts
const loginLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 requests per minute
  message: { error: 'Too many login attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User authentication endpoints
 */

// Public routes
router.post('/register', AuthController.register);
router.post('/login', loginLimiter, AuthController.login);
router.post('/refresh', AuthController.refresh);

// Protected routes
router.post('/logout', authorize, AuthController.logout);
router.get('/me', authorize, AuthController.me);

export default router;
