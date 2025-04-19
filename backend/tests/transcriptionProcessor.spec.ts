
import mongoose from 'mongoose';
import TranscriptionProcessor from '../src/workers/transcriptionProcessor';
import MediaAssetModel from '../src/models/MediaAsset';

// Mock AWS SDK
jest.mock('@aws-sdk/client-transcribe', () => {
  const mockTranscribeClient = {
    send: jest.fn().mockImplementation(command => {
      if (command.constructor.name === 'StartTranscriptionJobCommand') {
        return Promise.resolve({});
      } else if (command.constructor.name === 'GetTranscriptionJobCommand') {
        return Promise.resolve({
          TranscriptionJob: {
            TranscriptionJobStatus: 'COMPLETED',
            Transcript: {
              TranscriptFileUri: 'https://example.com/transcript.json'
            }
          }
        });
      }
    })
  };
  
  return {
    TranscribeClient: jest.fn(() => mockTranscribeClient),
    StartTranscriptionJobCommand: jest.fn(),
    GetTranscriptionJobCommand: jest.fn()
  };
});

// Mock axios and fs modules
jest.mock('axios', () => ({
  get: jest.fn().mockResolvedValue({
    data: {
      results: {
        transcripts: [{ transcript: 'This is a test transcript.' }]
      }
    }
  }),
  __esModule: true,
  default: {
    get: jest.fn().mockResolvedValue({
      data: {
        results: {
          transcripts: [{ transcript: 'This is a test transcript.' }]
        }
      }
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
    unlink: jest.fn().mockResolvedValue(undefined)
  },
  __esModule: true
}));

jest.mock('stream', () => ({
  pipeline: jest.fn(),
  __esModule: true
}));

describe('TranscriptionProcessor', () => {
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

  test('should process video and update with transcript', async () => {
    // Create a test video asset
    const asset = await MediaAssetModel.create({
      businessId: new mongoose.Types.ObjectId(),
      assetType: 'video',
      platform: 'meta',
      assetId: 'test-video-1',
      url: 'https://example.com/video.mp4',
      processingStatus: 'pending',
    });

    // Mock the downloadVideo method
    const downloadVideoSpy = jest.spyOn(TranscriptionProcessor as any, 'downloadVideo')
      .mockResolvedValue('/tmp/test-video.mp4');
    
    // Mock the uploadToS3 method
    const uploadToS3Spy = jest.spyOn(TranscriptionProcessor as any, 'uploadToS3')
      .mockResolvedValue('s3://bucket/test-video.mp4');
    
    // Call the process method
    const result = await TranscriptionProcessor.process(asset._id.toString());

    // Assertions
    expect(result.success).toBe(true);
    expect(result.transcript).toBeDefined();
    
    // Check if the asset was updated in the database
    const updatedAsset = await MediaAssetModel.findById(asset._id);
    expect(updatedAsset).toBeDefined();
    expect(updatedAsset?.transcript).toBeDefined();
    expect(updatedAsset?.processingStatus).toBe('complete');
    
    // Verify mocks were called
    expect(downloadVideoSpy).toHaveBeenCalled();
    expect(uploadToS3Spy).toHaveBeenCalled();
  });

  test('should handle errors during processing', async () => {
    // Create a test video asset
    const asset = await MediaAssetModel.create({
      businessId: new mongoose.Types.ObjectId(),
      assetType: 'video',
      platform: 'meta',
      assetId: 'test-video-error',
      url: 'https://example.com/video-error.mp4',
      processingStatus: 'pending',
    });

    // Mock the downloadVideo method to throw an error
    jest.spyOn(TranscriptionProcessor as any, 'downloadVideo')
      .mockRejectedValue(new Error('Download failed'));
    
    // Call the process method and expect it to throw
    await expect(TranscriptionProcessor.process(asset._id.toString()))
      .rejects.toThrow('Download failed');
    
    // Check if the asset was marked as failed
    const updatedAsset = await MediaAssetModel.findById(asset._id);
    expect(updatedAsset).toBeDefined();
    expect(updatedAsset?.processingStatus).toBe('failed');
    expect(updatedAsset?.failureReason).toBeDefined();
  });
});
