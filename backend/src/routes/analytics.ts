
import express from 'express';
import { AnalyticsController } from '../controllers/analyticsController';
import { isAuthenticated } from '../middleware/auth';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Analytics
 *   description: Analytics endpoints for performance data and insights
 */

/**
 * @swagger
 * /businesses/{id}/analytics/performance:
 *   get:
 *     summary: Get aggregated performance metrics for a business
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Business ID
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 30
 *         description: Number of days to include (default 30)
 *     responses:
 *       200:
 *         description: Successful response with performance metrics
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Business not found
 */
router.get('/businesses/:id/analytics/performance', isAuthenticated, AnalyticsController.getPerformanceMetrics);

/**
 * @swagger
 * /businesses/{id}/analytics/insights:
 *   get:
 *     summary: Get performance insights for a business
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Business ID
 *     responses:
 *       200:
 *         description: Successful response with performance insights
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Business not found or no insights available
 */
router.get('/businesses/:id/analytics/insights', isAuthenticated, AnalyticsController.getPerformanceInsights);

export default router;
