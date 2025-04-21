
import express from 'express';
import experimentController from '../controllers/experimentController';
import authorize from '../middleware/auth';

const router = express.Router();

// Create a new experiment
router.post('/businesses/:businessId/experiments', authorize, experimentController.createExperiment);

// Get all experiments for a business
router.get('/businesses/:businessId/experiments', authorize, experimentController.getExperiments);

// Get a specific experiment
router.get('/experiments/:id', authorize, experimentController.getExperimentById);

// Update experiment status
router.patch('/experiments/:id/status', authorize, experimentController.updateStatus);

// Get experiment results
router.get('/businesses/:businessId/experiments/:expId/results', authorize, experimentController.getResults);

export default router;
