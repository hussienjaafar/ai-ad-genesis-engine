
import express from 'express';
import AgencyController from '../controllers/agencyController';
import authorize from '../middleware/auth';
import checkRole from '../middleware/roles';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Agencies
 *   description: Agency management endpoints
 */

/**
 * @swagger
 * /agencies:
 *   post:
 *     summary: Create a new agency
 *     tags: [Agencies]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Agency created successfully
 *       400:
 *         description: Invalid request body
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 */
router.post('/', authorize, checkRole('agencyAdmin'), AgencyController.createAgency);

/**
 * @swagger
 * /agencies:
 *   get:
 *     summary: Get all agencies for the authenticated user
 *     tags: [Agencies]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of agencies
 *       401:
 *         description: Unauthorized
 */
router.get('/', authorize, AgencyController.getAgencies);

/**
 * @swagger
 * /agencies/{id}/clients:
 *   put:
 *     summary: Add or remove clients from an agency
 *     tags: [Agencies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Agency ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - action
 *               - clientBusinessIds
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [add, remove]
 *               clientBusinessIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Agency clients updated successfully
 *       400:
 *         description: Invalid request body
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Agency not found
 */
router.put('/:id/clients', authorize, checkRole('agencyAdmin'), AgencyController.updateAgencyClients);

/**
 * @swagger
 * /agencies/{id}/overview:
 *   get:
 *     summary: Get agency overview with aggregated KPIs and experiments
 *     tags: [Agencies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Agency ID
 *     responses:
 *       200:
 *         description: Agency overview data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Agency not found
 */
router.get('/:id/overview', authorize, checkRole('agencyAdmin'), AgencyController.getAgencyOverview);

export default router;
