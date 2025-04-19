
import axios from 'axios';
import { Types } from 'mongoose';
import BusinessModel from '../models/Business';
import MediaAssetModel from '../models/MediaAsset';
import { decryptToken } from '../lib/crypto';
import logger from '../lib/logger';

interface MetaVideoAsset {
  id: string;
  name?: string;
  title?: string;
  permalink_url?: string;
  picture?: string;
  source?: string;
  created_time?: string;
  updated_time?: string;
  [key: string]: any;
}

export class MetaVideoService {
  /**
   * Retrieves all video assets for a specific business from Meta Ads API
   */
  public static async retrieveVideosForBusiness(businessId: string): Promise<number> {
    try {
      const business = await BusinessModel.findById(businessId);
      
      if (!business || !business.integrations?.adPlatforms?.facebook) {
        logger.warn(`No Meta integration found for business ${businessId}`);
        return 0;
      }
      
      const { accountId, token, needsReauth } = business.integrations.adPlatforms.facebook;
      
      if (needsReauth || !token) {
        logger.warn(`Meta token needs reauthorization for business ${businessId}`);
        return 0;
      }
      
      // Decrypt the token
      const accessToken = await decryptToken(token);
      
      // Get all video assets for the ad account
      const videos = await this.fetchVideoAssets(accountId, accessToken);
      
      logger.info(`Retrieved ${videos.length} videos from Meta for business ${businessId}`);
      
      // Upsert the videos into MediaAsset collection
      const savedCount = await this.saveVideoAssets(businessId, videos);
      
      // Update business lastSynced timestamp
      await BusinessModel.findByIdAndUpdate(businessId, {
        'integrations.adPlatforms.facebook.lastSynced': new Date().toISOString()
      });
      
      return savedCount;
    } catch (error) {
      logger.error(`Error retrieving videos from Meta for business ${businessId}:`, error);
      throw error;
    }
  }
  
  /**
   * Fetches all video assets from Meta Ads API
   */
  private static async fetchVideoAssets(accountId: string, accessToken: string): Promise<MetaVideoAsset[]> {
    try {
      const videos: MetaVideoAsset[] = [];
      let url = `https://graph.facebook.com/v17.0/act_${accountId}/advideos`;
      let hasNextPage = true;
      
      // Fields to retrieve from the API
      const fields = 'id,title,description,created_time,updated_time,picture,source,permalink_url,thumbnails,width,height,length';
      
      while (hasNextPage) {
        const response = await axios.get(url, {
          params: {
            access_token: accessToken,
            fields,
            limit: 100,
          },
          timeout: 30000, // 30 seconds timeout
        });
        
        const data = response.data;
        
        if (data.data && Array.isArray(data.data)) {
          videos.push(...data.data);
        }
        
        // Check if there's a next page
        if (data.paging && data.paging.next) {
          url = data.paging.next;
        } else {
          hasNextPage = false;
        }
      }
      
      return videos;
    } catch (error) {
      logger.error('Error fetching videos from Meta:', error);
      throw error;
    }
  }
  
  /**
   * Saves video assets to the MediaAsset collection
   */
  private static async saveVideoAssets(businessId: string, videos: MetaVideoAsset[]): Promise<number> {
    const operations = videos.map(video => ({
      updateOne: {
        filter: {
          businessId: new Types.ObjectId(businessId),
          platform: 'meta',
          assetId: video.id,
        },
        update: {
          $set: {
            assetType: 'video',
            url: video.source || video.permalink_url || '',
            metadata: {
              name: video.title || video.name || `Video ${video.id}`,
              createdTime: video.created_time,
              updatedTime: video.updated_time,
              thumbnailUrl: video.picture,
              width: video.width,
              height: video.height,
              duration: video.length,
              description: video.description,
              permalinkUrl: video.permalink_url,
              // Store original API response for potential future use
              rawData: video,
            },
            processingStatus: 'pending',
          },
          $setOnInsert: {
            createdAt: new Date(),
            processingAttempts: 0,
          },
        },
        upsert: true,
      },
    }));
    
    if (operations.length === 0) return 0;
    
    try {
      const result = await MediaAssetModel.bulkWrite(operations);
      return result.upsertedCount + result.modifiedCount;
    } catch (error) {
      logger.error('Error saving video assets:', error);
      throw error;
    }
  }
}

export default MetaVideoService;
