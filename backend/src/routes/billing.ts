
import express from 'express';
import BillingController from '../controllers/billingController';
import authorize from '../middleware/auth';
import checkRole from '../middleware/roles';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Billing
 *   description: Billing and subscription management endpoints
 */

/**
 * @swagger
 * /businesses/{id}/billing:
 *   get:
 *     summary: Get billing details for a business
 *     tags: [Billing]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: Business ID
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Billing details including usage and subscription information
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Business not found
 */
router.get('/:id/billing', authorize, BillingController.getBillingDetails);

/**
 * @swagger
 * /businesses/{id}/billing/usage:
 *   get:
 *     summary: Get usage history for a business
 *     tags: [Billing]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: Business ID
 *         required: true
 *         schema:
 *           type: string
 *       - name: days
 *         in: query
 *         description: Number of days of history to retrieve
 *         required: false
 *         schema:
 *           type: integer
 *           default: 30
 *     responses:
 *       200:
 *         description: Usage history
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Business not found
 */
router.get('/:id/billing/usage', authorize, BillingController.getUsageHistory);

/**
 * @swagger
 * /businesses/{id}/billing/subscribe:
 *   post:
 *     summary: Subscribe a business to a plan
 *     tags: [Billing]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: Business ID
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - planId
 *             properties:
 *               planId:
 *                 type: string
 *                 description: Stripe price ID
 *     responses:
 *       200:
 *         description: Subscription created or updated
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Business not found
 */
router.post('/:id/billing/subscribe', authorize, checkRole('admin', 'clientOwner'), BillingController.subscribe);

/**
 * @swagger
 * /businesses/{id}/billing/cancel:
 *   post:
 *     summary: Cancel a business subscription
 *     tags: [Billing]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: Business ID
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Subscription canceled
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Business not found
 */
router.post('/:id/billing/cancel', authorize, checkRole('admin', 'clientOwner'), BillingController.cancelSubscription);

/**
 * @swagger
 * /billing/plans:
 *   get:
 *     summary: Get available subscription plans
 *     tags: [Billing]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of available plans
 *       403:
 *         description: Forbidden
 */
router.get('/plans', authorize, BillingController.getAvailablePlans);

/**
 * @swagger
 * /billing/webhook:
 *   post:
 *     summary: Handle Stripe webhook events
 *     tags: [Billing]
 *     description: Endpoint for Stripe to send webhook events
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Webhook processed successfully
 *       400:
 *         description: Invalid webhook payload
 */
router.post('/webhook', express.raw({ type: 'application/json' }), BillingController.handleWebhook);

export default router;
