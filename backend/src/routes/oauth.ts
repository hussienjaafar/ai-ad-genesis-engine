
import express from 'express';
import { OAuthController } from '../controllers/oauthController';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: OAuth
 *   description: OAuth integration endpoints for advertising platforms
 */

/**
 * @swagger
 * /oauth/meta/init:
 *   get:
 *     summary: Initialize Meta (Facebook) OAuth flow
 *     tags: [OAuth]
 *     responses:
 *       302:
 *         description: Redirects to Meta authorization URL
 */
router.get('/meta/init', OAuthController.metaInit);

/**
 * @swagger
 * /oauth/meta/callback:
 *   get:
 *     summary: Handle Meta OAuth callback
 *     tags: [OAuth]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: Authorization code from Meta
 *       - in: query
 *         name: state
 *         required: true
 *         schema:
 *           type: string
 *         description: State parameter for security validation
 *     responses:
 *       302:
 *         description: Redirects to platform integration page on success
 */
router.get('/meta/callback', OAuthController.metaCallback);

/**
 * @swagger
 * /oauth/google/init:
 *   get:
 *     summary: Initialize Google Ads OAuth flow
 *     tags: [OAuth]
 *     responses:
 *       302:
 *         description: Redirects to Google authorization URL
 */
router.get('/google/init', OAuthController.googleInit);

/**
 * @swagger
 * /oauth/google/callback:
 *   get:
 *     summary: Handle Google OAuth callback
 *     tags: [OAuth]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: Authorization code from Google
 *       - in: query
 *         name: state
 *         required: true
 *         schema:
 *           type: string
 *         description: State parameter for security validation
 *     responses:
 *       302:
 *         description: Redirects to platform integration page on success
 */
router.get('/google/callback', OAuthController.googleCallback);

export default router;
