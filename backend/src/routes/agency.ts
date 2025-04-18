
import express from 'express';
import agencyController from '../controllers/agencyController';
import authorize from '../middleware/auth';
import { verifyAgencyOwnership } from '../middleware/ownership';

const router = express.Router();

// Create a new agency (admin only can create agencies)
router.post('/', authorize, agencyController.createAgency);

// List all agencies
router.get('/', authorize, agencyController.getAgencies);

// Get a specific agency by ID
router.get('/:agencyId', authorize, verifyAgencyOwnership, agencyController.getAgencyById);

// Update agency
router.put('/:agencyId', authorize, verifyAgencyOwnership, agencyController.updateAgency);

// Delete agency
router.delete('/:agencyId', authorize, verifyAgencyOwnership, agencyController.deleteAgency);

// Add client business to agency
router.post('/:agencyId/clients', authorize, verifyAgencyOwnership, agencyController.addClientBusiness);

// Remove client business from agency
router.delete('/:agencyId/clients/:businessId', authorize, verifyAgencyOwnership, agencyController.removeClientBusiness);

export default router;
