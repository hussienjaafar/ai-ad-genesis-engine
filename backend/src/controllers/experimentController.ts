
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import experimentService from '../services/experimentService';

class ExperimentController {
  /**
   * Create a new experiment
   */
  async createExperiment(req: Request, res: Response) {
    try {
      const { businessId } = req.params;
      const {
        name,
        contentIdOriginal,
        contentIdVariant,
        split = { original: 50, variant: 50 },
        startDate,
        endDate
      } = req.body;

      if (!name || !contentIdOriginal || !contentIdVariant || !startDate || !endDate) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Validate split
      if (split.original + split.variant !== 100) {
        return res.status(400).json({ 
          error: 'Split percentages must add up to 100%' 
        });
      }

      const experiment = await experimentService.createExperiment({
        businessId: new mongoose.Types.ObjectId(businessId),
        name,
        contentIdOriginal,
        contentIdVariant,
        split,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        status: 'active'
      });

      res.status(201).json(experiment);
    } catch (error: any) {
      console.error('Error creating experiment:', error);
      res.status(500).json({ error: error.message || 'Failed to create experiment' });
    }
  }

  /**
   * Get all experiments for a business
   */
  async getExperiments(req: Request, res: Response) {
    try {
      const { businessId } = req.params;
      const experiments = await experimentService.getExperimentsByBusiness(businessId);
      res.status(200).json(experiments);
    } catch (error: any) {
      console.error('Error fetching experiments:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch experiments' });
    }
  }

  /**
   * Get experiment by ID
   */
  async getExperimentById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const experiment = await experimentService.getExperimentById(id);
      
      if (!experiment) {
        return res.status(404).json({ error: 'Experiment not found' });
      }
      
      res.status(200).json(experiment);
    } catch (error: any) {
      console.error('Error fetching experiment:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch experiment' });
    }
  }

  /**
   * Update experiment status
   */
  async updateStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      if (!['active', 'completed', 'paused'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }
      
      const experiment = await experimentService.updateExperimentStatus(id, status);
      
      if (!experiment) {
        return res.status(404).json({ error: 'Experiment not found' });
      }
      
      res.status(200).json(experiment);
    } catch (error: any) {
      console.error('Error updating experiment status:', error);
      res.status(500).json({ error: error.message || 'Failed to update experiment status' });
    }
  }

  /**
   * Get experiment results
   */
  async getResults(req: Request, res: Response) {
    try {
      const { expId } = req.params;
      const results = await experimentService.getResults(expId);
      
      if (!results) {
        return res.status(404).json({ error: 'Results not found' });
      }
      
      res.status(200).json(results);
    } catch (error: any) {
      console.error('Error fetching experiment results:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch experiment results' });
    }
  }
}

export default new ExperimentController();
