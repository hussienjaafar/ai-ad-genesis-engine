
import { Request, Response } from 'express';
import { agencyService } from '../services/agencyService';
import { mongoose } from '../lib/mongoose';

export const AgencyController = {
  async createAgency(req: Request, res: Response): Promise<void> {
    try {
      const { name } = req.body;
      
      if (!req.user) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }
      
      const ownerUserId: string = req.user.id;
      
      if (!name) {
        res.status(400).json({ error: 'Agency name is required' });
        return;
      }

      const agency = await agencyService.createAgency({
        name,
        ownerUserId: new mongoose.Types.ObjectId(ownerUserId),
      });

      res.status(201).json(agency);
    } catch (error: unknown) {
      console.error('Error creating agency:', error);
      res.status(500).json({ error: 'Failed to create agency' });
    }
  },

  async updateAgencyClients(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { action, clientBusinessIds } = req.body;

      if (!action || !clientBusinessIds || !Array.isArray(clientBusinessIds)) {
        res.status(400).json({ error: 'Invalid request body. Required: action (add/remove) and clientBusinessIds array' });
        return;
      }

      if (action !== 'add' && action !== 'remove') {
        res.status(400).json({ error: 'Invalid action. Must be add or remove' });
        return;
      }

      const agency = await agencyService.updateAgencyClients(id, action, clientBusinessIds);

      if (!agency) {
        res.status(404).json({ error: 'Agency not found' });
        return;
      }

      res.json(agency);
    } catch (error: unknown) {
      console.error('Error updating agency clients:', error);
      res.status(500).json({ error: 'Failed to update agency clients' });
    }
  },

  async getAgencies(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const agencies = await agencyService.getAgencies(req.user.id);
      res.json(agencies);
    } catch (error: unknown) {
      console.error('Error fetching agencies:', error);
      res.status(500).json({ error: 'Failed to fetch agencies' });
    }
  },

  async getAgencyOverview(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const overview = await agencyService.getOverview(id);
      res.json(overview);
    } catch (error: unknown) {
      console.error('Error fetching agency overview:', error);
      res.status(500).json({ error: 'Failed to fetch agency overview' });
    }
  }
};

export default AgencyController;
