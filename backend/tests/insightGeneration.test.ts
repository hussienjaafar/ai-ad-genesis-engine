
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import ContentGenerationService from '../src/services/contentGenerationService';
import ContentModel from '../src/models/Content';
import BusinessModel from '../src/models/Business';
import PerformanceInsightModel from '../src/models/PerformanceInsight';
import AIProvider from '../src/services/aiProvider';

// Mock the AI provider to avoid making actual API calls during tests
jest.mock('../src/services/aiProvider', () => ({
  generateCompletion: jest.fn().mockResolvedValue(`{
    "headline": "Test Headline Using Insight",
    "primaryText": "Test content that incorporates the winning element",
    "callToAction": "Learn More"
  }`)
}));

describe('Insight-Driven Content Generation', () => {
  let mongoServer: MongoMemoryServer;
  let businessId: mongoose.Types.ObjectId;
  let insightId: mongoose.Types.ObjectId;
  
  beforeAll(async () => {
    // Set up the MongoDB memory server
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
    
    // Create test business
    const business = await BusinessModel.create({
      name: 'Test Business',
      industry: 'technology',
      description: 'A test business',
      status: 'active'
    });
    businessId = business._id;
    
    // Create test insight
    const insightData = {
      businessId,
      patternInsights: [
        {
          element: 'Save 20% with our limited time offer',
          elementType: 'headline',
          performance: {
            withElement: {
              impressions: 10000,
              clicks: 500,
              ctr: 0.05,
              sampleSize: 10
            },
            withoutElement: {
              impressions: 10000,
              clicks: 300,
              ctr: 0.03,
              sampleSize: 10
            },
            uplift: 0.67,
            confidence: 0.95
          }
        }
      ],
      primaryCategory: 'content_patterns',
      createdAt: new Date()
    };
    
    const insight = await PerformanceInsightModel.create(insightData);
    insightId = insight.patternInsights[0]._id;
  });
  
  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
  });
  
  afterEach(async () => {
    await ContentModel.deleteMany({});
  });
  
  it('should generate content based on an insight and save the insightId reference', async () => {
    // Generate content using the insight
    const content = await ContentGenerationService.generateContent(
      businessId.toString(),
      'facebook',
      { tone: 'professional' },
      insightId.toString()
    );
    
    // Verify content was created
    expect(content).toBeDefined();
    expect(content.contentType).toBe('facebook');
    
    // Verify the generated content has the insight reference
    expect(content.generatedFrom).toBeDefined();
    expect(content.generatedFrom?.insightId?.toString()).toBe(insightId.toString());
    expect(content.generatedFrom?.elementText).toBe('Save 20% with our limited time offer');
    
    // Verify the AI was called with the insight element
    expect(AIProvider.generateCompletion).toHaveBeenCalled();
    const callArgs = (AIProvider.generateCompletion as jest.Mock).mock.calls[0];
    expect(callArgs[1]).toContain('Save 20% with our limited time offer');
  });
  
  it('should generate content without insight if insightId is invalid', async () => {
    const invalidInsightId = new mongoose.Types.ObjectId().toString();
    
    // Generate content using an invalid insight ID
    const content = await ContentGenerationService.generateContent(
      businessId.toString(),
      'facebook',
      { tone: 'casual' },
      invalidInsightId
    );
    
    // Verify content was created without insight reference
    expect(content).toBeDefined();
    expect(content.contentType).toBe('facebook');
    expect(content.generatedFrom).toBeUndefined();
  });
});
