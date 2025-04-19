
import mongoose from 'mongoose';
import MediaAssetModel from '../src/models/MediaAsset';
import MetaVideoService from '../src/services/MetaVideoService';
import GoogleImageService from '../src/services/GoogleImageService';
import BusinessModel from '../src/models/Business';

// Mock the external API calls
jest.mock('axios');
jest.mock('../src/lib/crypto', () => ({
  decryptToken: jest.fn().mockResolvedValue('mock-token')
}));

describe('Media Retrieval Services', () => {
  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/test');
    }
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    await MediaAssetModel.deleteMany({});
    await BusinessModel.deleteMany({});
  });

  describe('MetaVideoService', () => {
    test('should retrieve and save video assets from Meta API', async () => {
      // Mock business with Meta integration
      const business = await BusinessModel.create({
        name: 'Test Business',
        businessType: 'ecommerce',
        contact: { email: 'test@example.com' },
        status: 'active',
        onboardingStep: 5,
        integrations: {
          adPlatforms: {
            facebook: {
              accountId: '123456',
              token: 'encrypted-token',
              isConnected: true,
              needsReauth: false
            }
          }
        }
      });

      // Mock axios response for fetching videos
      const axios = require('axios');
      axios.get.mockResolvedValueOnce({
        data: {
          data: [
            {
              id: 'video1',
              name: 'Test Video 1',
              created_time: '2023-01-01T12:00:00Z',
              source: 'https://example.com/video1.mp4',
              picture: 'https://example.com/thumbnail1.jpg'
            },
            {
              id: 'video2',
              name: 'Test Video 2',
              created_time: '2023-01-02T12:00:00Z',
              source: 'https://example.com/video2.mp4',
              picture: 'https://example.com/thumbnail2.jpg'
            }
          ],
          paging: { next: null }
        }
      });

      // Call the service method
      const savedCount = await MetaVideoService.retrieveVideosForBusiness(business._id.toString());

      // Assertions
      expect(savedCount).toBe(2);
      
      // Verify database has the assets
      const assets = await MediaAssetModel.find({ businessId: business._id }).lean();
      expect(assets).toHaveLength(2);
      expect(assets[0].assetType).toBe('video');
      expect(assets[0].platform).toBe('meta');
      expect(assets[0].processingStatus).toBe('pending');
    });
  });

  describe('GoogleImageService', () => {
    test('should retrieve and save image assets from Google Ads API', async () => {
      // Mock the GoogleAdsApi
      jest.mock('google-ads-api', () => {
        const mockCustomer = {
          query: jest.fn().mockResolvedValue([
            {
              asset: {
                id: 'image1',
                name: 'Test Image 1',
                imageAsset: {
                  fullSizeImageUrl: 'https://example.com/image1.jpg',
                  mimeType: 'image/jpeg',
                  fileSize: 12345,
                  fullSizeImageWidthPixels: 800,
                  fullSizeImageHeightPixels: 600
                }
              }
            },
            {
              asset: {
                id: 'image2',
                name: 'Test Image 2',
                imageAsset: {
                  fullSizeImageUrl: 'https://example.com/image2.jpg',
                  mimeType: 'image/jpeg',
                  fileSize: 23456,
                  fullSizeImageWidthPixels: 1024,
                  fullSizeImageHeightPixels: 768
                }
              }
            }
          ])
        };
        
        return {
          GoogleAdsApi: jest.fn().mockImplementation(() => ({
            Customer: jest.fn().mockReturnValue(mockCustomer)
          }))
        };
      });

      // Mock business with Google integration
      const business = await BusinessModel.create({
        name: 'Test Business',
        businessType: 'ecommerce',
        contact: { email: 'test@example.com' },
        status: 'active',
        onboardingStep: 5,
        integrations: {
          adPlatforms: {
            google: {
              accountId: '123456',
              token: 'encrypted-token',
              isConnected: true,
              needsReauth: false
            }
          }
        }
      });

      // Call the service method with a mock implementation
      const originalFetchImageAssets = GoogleImageService['fetchImageAssets'];
      GoogleImageService['fetchImageAssets'] = jest.fn().mockResolvedValue([
        {
          assetId: 'image1',
          assetName: 'Test Image 1',
          url: 'https://example.com/image1.jpg',
          mimeType: 'image/jpeg',
          fileSize: 12345,
          width: 800,
          height: 600,
          creationTime: '2023-01-01T12:00:00Z'
        },
        {
          assetId: 'image2',
          assetName: 'Test Image 2',
          url: 'https://example.com/image2.jpg',
          mimeType: 'image/jpeg',
          fileSize: 23456,
          width: 1024,
          height: 768,
          creationTime: '2023-01-02T12:00:00Z'
        }
      ]);

      const savedCount = await GoogleImageService.retrieveImagesForBusiness(business._id.toString());
      
      // Restore original method
      GoogleImageService['fetchImageAssets'] = originalFetchImageAssets;

      // Assertions
      expect(savedCount).toBe(2);
      
      // Verify database has the assets
      const assets = await MediaAssetModel.find({ businessId: business._id }).lean();
      expect(assets).toHaveLength(2);
      expect(assets[0].assetType).toBe('image');
      expect(assets[0].platform).toBe('google');
      expect(assets[0].processingStatus).toBe('pending');
    });
  });
});
