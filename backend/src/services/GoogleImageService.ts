
import { GoogleAdsApi, enums } from 'google-ads-api';
import { Types } from 'mongoose';
import BusinessModel from '../models/Business';
import MediaAssetModel from '../models/MediaAsset';
import { decryptToken } from '../lib/crypto';
import logger from '../lib/logger';

interface GoogleImageAsset {
  assetId: string;
  assetName: string;
  url: string;
  mimeType?: string;
  fileSize?: number;
  width?: number;
  height?: number;
  creationTime?: string;
}

export class GoogleImageService {
  /**
   * Retrieves all image assets for a specific business from Google Ads API
   */
  public static async retrieveImagesForBusiness(businessId: string): Promise<number> {
    try {
      const business = await BusinessModel.findById(businessId);
      
      if (!business || !business.integrations?.adPlatforms?.google) {
        logger.warn(`No Google Ads integration found for business ${businessId}`);
        return 0;
      }
      
      const { accountId, token, needsReauth } = business.integrations.adPlatforms.google;
      
      if (needsReauth || !token) {
        logger.warn(`Google Ads token needs reauthorization for business ${businessId}`);
        return 0;
      }
      
      // Decrypt the refresh token
      const refreshToken = await decryptToken(token);
      
      // Initialize Google Ads API client
      const client = new GoogleAdsApi({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN!,
      });
      
      const customer = client.Customer({
        customer_id: accountId,
        refresh_token: refreshToken,
      });
      
      // Fetch image assets
      const imageAssets = await this.fetchImageAssets(customer);
      
      logger.info(`Retrieved ${imageAssets.length} images from Google Ads for business ${businessId}`);
      
      // Upsert the images into MediaAsset collection
      const savedCount = await this.saveImageAssets(businessId, imageAssets);
      
      // Update business lastSynced timestamp
      await BusinessModel.findByIdAndUpdate(businessId, {
        'integrations.adPlatforms.google.lastSynced': new Date().toISOString()
      });
      
      return savedCount;
    } catch (error) {
      logger.error(`Error retrieving images from Google Ads for business ${businessId}:`, error);
      throw error;
    }
  }
  
  /**
   * Fetches all image assets from Google Ads API
   */
  private static async fetchImageAssets(customer: any): Promise<GoogleImageAsset[]> {
    try {
      // Define the query to fetch image assets
      const query = `
        SELECT
          asset.id,
          asset.name,
          asset.image_asset.full_size_image_url,
          asset.image_asset.file_size,
          asset.image_asset.mime_type,
          asset.image_asset.full_size_image_width_pixels,
          asset.image_asset.full_size_image_height_pixels
        FROM asset
        WHERE asset.type = 'IMAGE'
        LIMIT 5000
      `;
      
      const response = await customer.query(query);
      
      if (!response || !Array.isArray(response)) {
        return [];
      }
      
      // Map response to GoogleImageAsset objects
      return response.map(item => {
        if (!item.asset || !item.asset.imageAsset) {
          return null;
        }
        
        return {
          assetId: item.asset.id,
          assetName: item.asset.name,
          url: item.asset.imageAsset.fullSizeImageUrl,
          mimeType: item.asset.imageAsset.mimeType,
          fileSize: item.asset.imageAsset.fileSize,
          width: item.asset.imageAsset.fullSizeImageWidthPixels,
          height: item.asset.imageAsset.fullSizeImageHeightPixels,
          // Google Ads API doesn't provide creation time directly in asset query
          // We'll use current time as fallback
          creationTime: new Date().toISOString(),
        };
      }).filter(Boolean) as GoogleImageAsset[];
    } catch (error) {
      logger.error('Error fetching images from Google Ads:', error);
      throw error;
    }
  }
  
  /**
   * Saves image assets to the MediaAsset collection
   */
  private static async saveImageAssets(businessId: string, images: GoogleImageAsset[]): Promise<number> {
    const operations = images.map(image => ({
      updateOne: {
        filter: {
          businessId: new Types.ObjectId(businessId),
          platform: 'google',
          assetId: image.assetId,
        },
        update: {
          $set: {
            assetType: 'image',
            url: image.url,
            metadata: {
              name: image.assetName,
              createdTime: image.creationTime,
              width: image.width,
              height: image.height,
              fileSize: image.fileSize,
              format: image.mimeType,
              // Store raw data for potential future use
              rawData: image,
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
      logger.error('Error saving image assets:', error);
      throw error;
    }
  }
}

export default GoogleImageService;
