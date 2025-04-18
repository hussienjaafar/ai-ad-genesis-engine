
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import ExperimentModel from '../src/models/Experiment';
import ExperimentResultModel from '../src/models/ExperimentResult';
import experimentService from '../src/services/experimentService';
import { ObjectId } from 'mongodb';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

beforeEach(async () => {
  // Clear all collections before each test
  await ExperimentModel.deleteMany({});
  await ExperimentResultModel.deleteMany({});
});

describe('Experiment Service', () => {
  it('should create an experiment and initialize results', async () => {
    // Arrange
    const businessId = new mongoose.Types.ObjectId();
    const experimentData = {
      businessId,
      name: 'Test Experiment',
      contentIdOriginal: '123456',
      contentIdVariant: '789012',
      split: { original: 50, variant: 50 },
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      status: 'active' as const
    };

    // Act
    const experiment = await experimentService.createExperiment(experimentData);

    // Assert
    expect(experiment).toBeDefined();
    expect(experiment.name).toBe('Test Experiment');
    
    // Check if results were initialized
    const results = await ExperimentResultModel.findOne({ experimentId: experiment._id });
    expect(results).toBeDefined();
  });

  it('should assign variants consistently', async () => {
    // Arrange
    const businessId = new mongoose.Types.ObjectId();
    const experimentData = {
      businessId,
      name: 'Consistency Test',
      contentIdOriginal: '123456',
      contentIdVariant: '789012',
      split: { original: 50, variant: 50 },
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      status: 'active' as const
    };
    
    const experiment = await experimentService.createExperiment(experimentData);
    
    // Act & Assert - Same user should get same variant
    const userId1 = 'user123';
    const variant1a = experimentService.assignVariant(experiment, userId1);
    const variant1b = experimentService.assignVariant(experiment, userId1);
    expect(variant1a).toBe(variant1b);
    
    // Different users may get different variants
    const userId2 = 'user456';
    const variant2 = experimentService.assignVariant(experiment, userId2);
    // No assertion on equality, as it's random but consistent per user
  });
  
  it('should compute experiment results', async () => {
    // Arrange
    const businessId = new mongoose.Types.ObjectId();
    const experimentId = new mongoose.Types.ObjectId();
    
    // Create an experiment
    const experiment = await ExperimentModel.create({
      _id: experimentId,
      businessId,
      name: 'Results Test',
      contentIdOriginal: '123456',
      contentIdVariant: '789012',
      split: { original: 50, variant: 50 },
      startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      status: 'active'
    });
    
    // Insert mock performance data into the database
    await mongoose.connection.db.collection('performanceData').insertMany([
      {
        businessId: businessId.toString(),
        experimentId: experimentId.toString(),
        variant: 'original',
        date: new Date().toISOString().split('T')[0],
        metrics: {
          impressions: 1000,
          clicks: 100,
          leads: 10
        }
      },
      {
        businessId: businessId.toString(),
        experimentId: experimentId.toString(),
        variant: 'variant',
        date: new Date().toISOString().split('T')[0],
        metrics: {
          impressions: 1000,
          clicks: 120,
          leads: 12
        }
      }
    ]);
    
    // Act
    const results = await experimentService.computeResults(experimentId.toString());
    
    // Assert
    expect(results).toBeDefined();
    expect(results.results.original.impressions).toBe(1000);
    expect(results.results.variant.impressions).toBe(1000);
    expect(results.results.original.conversions).toBe(10);
    expect(results.results.variant.conversions).toBe(12);
    
    // Check conversion rates
    expect(results.results.original.conversionRate).toBe(0.01); // 10/1000
    expect(results.results.variant.conversionRate).toBe(0.012); // 12/1000
    
    // Check lift calculation
    expect(results.lift).toBe(20); // ((0.012 - 0.01) / 0.01) * 100 = 20%
  });
  
  it('should update experiment status', async () => {
    // Arrange
    const experimentData = {
      businessId: new mongoose.Types.ObjectId(),
      name: 'Status Test',
      contentIdOriginal: '123456',
      contentIdVariant: '789012',
      split: { original: 50, variant: 50 },
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      status: 'active' as const
    };
    
    const experiment = await experimentService.createExperiment(experimentData);
    
    // Act
    const updatedExperiment = await experimentService.updateExperimentStatus(
      experiment._id.toString(), 
      'completed'
    );
    
    // Assert
    expect(updatedExperiment?.status).toBe('completed');
  });
});
