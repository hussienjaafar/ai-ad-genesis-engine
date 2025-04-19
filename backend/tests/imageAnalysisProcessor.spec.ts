
import mongoose from 'mongoose';
import ImageAnalysisProcessor from '../src/workers/imageAnalysisProcessor';
import MediaAssetModel from '../src/models/MediaAsset';

// Mock AWS Rekognition client
jest.mock('@aws-sdk/client-rekognition', () => {
  const mockRekognitionClient = {
    send: jest.fn().mockImplementation(command => {
      if (command.constructor.name === 'DetectTextCommand') {
        return Promise.resolve({
          TextDetections: [
            { Type: 'LINE', DetectedText: 'Hello World' },
            { Type: 'LINE', DetectedText: 'Testing OCR' },
            { Type: 'WORD', DetectedText: 'Hello' },
            { Type: 'WORD', DetectedText: 'World' }
          ]
        });
      } else if (command.constructor.name === 'DetectLabelsCommand') {
        return Promise.resolve({
          Labels: [
            { Name: 'Person', Confidence: 98.5 },
            { Name: 'Car', Confidence: 87.3 },
            { Name: 'Building', Confidence: 72.1 }
          ]
        });
      }
    })
  };
  
  return {
    RekognitionClient: jest.fn(() => mockRekognitionClient),
    DetectTextCommand: jest.fn(),
    DetectLabelsCommand: jest.fn()
  };
});

// Mock axios and fs modules
jest.mock('axios', () => ({
  __esModule: true,
  default: {
    get: jest.fn().mockResolvedValue({
      status: 200,
      data: Buffer.from('mock image data')
    })
  }
}));

jest.mock('fs', () => ({
  createWriteStream: jest.fn().mockReturnValue({
    on: jest.fn(),
    write: jest.fn(),
    end: jest.fn()
  }),
  promises: {
    unlink: jest.fn().mockResolvedValue(undefined),
    readFile: jest.fn().mockResolvedValue(Buffer.from('mock image data'))
  },
  __esModule: true
}));

jest.mock('stream', () => ({
  pipeline: jest.fn(),
  __esModule: true
}));

describe('ImageAnalysisProcessor', () => {
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
  });

  test('should process image and update with detected text and labels', async () => {
    // Create a test image asset
    const asset = await MediaAssetModel.create({
      businessId: new mongoose.Types.ObjectId(),
      assetType: 'image',
      platform: 'google',
      assetId: 'test-image-1',
      url: 'https://example.com/image.jpg',
      processingStatus: 'pending',
    });

    // Mock the downloadImage method
    const downloadImageSpy = jest.spyOn(ImageAnalysisProcessor as any, 'downloadImage')
      .mockResolvedValue('/tmp/test-image.jpg');
    
    // Call the process method
    const result = await ImageAnalysisProcessor.process(asset._id.toString());

    // Assertions
    expect(result.success).toBe(true);
    
    // Check if the asset was updated in the database
    const updatedAsset = await MediaAssetModel.findById(asset._id);
    expect(updatedAsset).toBeDefined();
    expect(updatedAsset?.detectedText).toHaveLength(2); // Should have 2 lines of text
    expect(updatedAsset?.labels).toHaveLength(3); // Should have 3 labels
    expect(updatedAsset?.processingStatus).toBe('complete');
    
    // Verify mocks were called
    expect(downloadImageSpy).toHaveBeenCalled();
  });

  test('should handle errors during processing', async () => {
    // Create a test image asset
    const asset = await MediaAssetModel.create({
      businessId: new mongoose.Types.ObjectId(),
      assetType: 'image',
      platform: 'google',
      assetId: 'test-image-error',
      url: 'https://example.com/image-error.jpg',
      processingStatus: 'pending',
    });

    // Mock the downloadImage method to throw an error
    jest.spyOn(ImageAnalysisProcessor as any, 'downloadImage')
      .mockRejectedValue(new Error('Download failed'));
    
    // Call the process method and expect it to throw
    await expect(ImageAnalysisProcessor.process(asset._id.toString()))
      .rejects.toThrow('Download failed');
    
    // Check if the asset was marked as failed
    const updatedAsset = await MediaAssetModel.findById(asset._id);
    expect(updatedAsset).toBeDefined();
    expect(updatedAsset?.processingStatus).toBe('failed');
    expect(updatedAsset?.failureReason).toBeDefined();
  });
});
