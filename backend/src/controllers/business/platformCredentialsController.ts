
import { Request, Response } from 'express';
import BusinessService from '../../services/businessService';
import { Types } from 'mongoose';

export class PlatformCredentialsController {
  public static async storePlatformCredentials(req: Request, res: Response): Promise<Response> {
    try {
      const { id, platform } = req.params;
      const credentials = req.body;

      if (!Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'Invalid business ID' });
      }

      const validPlatforms = ['meta', 'google', 'linkedin', 'tiktok'];
      if (!validPlatforms.includes(platform)) {
        return res.status(400).json({ 
          error: 'Invalid platform',
          validPlatforms
        });
      }

      const business = await BusinessService.storePlatformCredentials(id, platform, credentials);
      
      if (!business) {
        return res.status(404).json({ error: 'Business not found' });
      }

      return res.json({
        message: `${platform} credentials stored successfully`,
        businessId: business._id,
        platform
      });
    } catch (error: any) {
      console.error('Store platform credentials error:', error);
      return res.status(500).json({ error: 'Failed to store platform credentials' });
    }
  }
}

export default PlatformCredentialsController;
