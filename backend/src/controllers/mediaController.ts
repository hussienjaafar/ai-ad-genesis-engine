import { Request, Response } from 'express';
import mongoose from 'mongoose';
import MediaAssetModel from '../models/MediaAsset';
import { runMediaRetrievalManually } from '../queues/mediaRetrievalQueue';
import logger from '../lib/logger';

export class MediaController {
  /**
   * Get all media assets for a business
   */
  public static async getMediaAssets(req: Request, res: Response): Promise<void> {
    try {
      const { businessId } = req.params;
      const { 
        type, 
        platform, 
        status,
        page = 1,
        limit = 20,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;
      
      // Build query
      const query: any = { 
        businessId: new mongoose.Types.ObjectId(businessId),
      };
      
      // Add optional filters if provided
      if (type) query.assetType = type;
      if (platform) query.platform = platform;
      if (status) query.processingStatus = status;
      
      // Count total matching documents (for pagination)
      const totalAssets = await MediaAssetModel.countDocuments(query);
      
      // Pagination
      const skip = (Number(page) - 1) * Number(limit);
      
      // Sort direction
      const sortDirection = sortOrder === 'asc' ? 1 : -1;
      const sortOptions: any = {};
      sortOptions[sortBy as string] = sortDirection;
      
      // Execute query with pagination and projection
      const assets = await MediaAssetModel.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(Number(limit))
        .select({
          _id: 1,
          businessId: 1,
          assetType: 1,
          platform: 1,
          assetId: 1,
          url: 1,
          processingStatus: 1,
          metadata: 1,
          createdAt: 1,
          updatedAt: 1,
          lastProcessedAt: 1,
          // Omit large fields like transcript to keep response size small
        });
      
      // Get stats for filters
      const stats = await MediaController.getMediaStats(businessId);
      
      res.status(200).json({
        assets,
        pagination: {
          total: totalAssets,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(totalAssets / Number(limit)),
        },
        stats
      });
    } catch (error) {
      logger.error('Error retrieving media assets:', error);
      res.status(500).json({ error: 'Failed to retrieve media assets' });
    }
  }
  
  /**
   * Get media stats for filtering UI
   */
  private static async getMediaStats(businessId: string) {
    // Get counts by asset type
    const typeStats = await MediaAssetModel.aggregate([
      { $match: { businessId: new mongoose.Types.ObjectId(businessId) } },
      { $group: { _id: '$assetType', count: { $sum: 1 } } }
    ]);
    
    // Get counts by platform
    const platformStats = await MediaAssetModel.aggregate([
      { $match: { businessId: new mongoose.Types.ObjectId(businessId) } },
      { $group: { _id: '$platform', count: { $sum: 1 } } }
    ]);
    
    // Get counts by status
    const statusStats = await MediaAssetModel.aggregate([
      { $match: { businessId: new mongoose.Types.ObjectId(businessId) } },
      { $group: { _id: '$processingStatus', count: { $sum: 1 } } }
    ]);
    
    return {
      types: typeStats.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {}),
      platforms: platformStats.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {}),
      statuses: statusStats.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {})
    };
  }
  
  /**
   * Get a specific media asset by ID
   */
  public static async getMediaAsset(req: Request, res: Response): Promise<void> {
    try {
      const { businessId, mediaId } = req.params;
      
      const asset = await MediaAssetModel.findOne({
        _id: mediaId,
        businessId: businessId
      });
      
      if (!asset) {
        res.status(404).json({ error: 'Media asset not found' });
        return;
      }
      
      res.status(200).json(asset);
    } catch (error) {
      logger.error('Error retrieving media asset:', error);
      res.status(500).json({ error: 'Failed to retrieve media asset' });
    }
  }
  
  /**
   * Manually trigger media retrieval for a business
   */
  public static async triggerMediaRetrieval(req: Request, res: Response): Promise<void> {
    try {
      const { businessId } = req.params;
      const { platform } = req.body;
      
      await runMediaRetrievalManually(businessId, platform);
      
      res.status(200).json({ 
        message: 'Media retrieval job queued successfully',
        businessId,
        platform: platform || 'all'
      });
    } catch (error) {
      logger.error('Error triggering media retrieval:', error);
      res.status(500).json({ error: 'Failed to trigger media retrieval' });
    }
  }
}

export default MediaController;
