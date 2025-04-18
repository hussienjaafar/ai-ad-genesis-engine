
import express from 'express';
import experimentController from '../controllers/experimentController';
import authorize, { verifyBusinessOwnership } from '../middleware/auth';

const router = express.Router();

// Create a new experiment - already covered by global middleware
router.post('/businesses/:businessId/experiments', experimentController.createExperiment);

// Get all experiments for a business - already covered by global middleware
router.get('/businesses/:businessId/experiments', experimentController.getExperiments);

// Get a specific experiment - needs explicit checks
router.get('/experiments/:id', authorize, experimentController.getExperimentById);

// Update experiment status - needs explicit checks
router.patch('/experiments/:id/status', authorize, experimentController.updateStatus);

// Get experiment results - needs explicit checks
router.get('/businesses/:businessId/experiments/:expId/results', experimentController.getResults);

export default router;
