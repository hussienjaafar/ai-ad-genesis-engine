
import mongoose from 'mongoose';
import { agencyService } from '../src/services/agencyService';
import AgencyModel from '../src/models/Agency';
import { connectToDatabase } from '../src/lib/mongoose';

// Mock the mongoose connection
jest.mock('../src/lib/mongoose', () => ({
  connectToDatabase: jest.fn(),
  mongoose: {
    connect: jest.fn(),
    connection: {
      db: {
        collection: jest.fn().mockReturnValue({
          aggregate: jest.fn().mockReturnValue({
            toArray: jest.fn().mockResolvedValue([])
          })
        })
      }
    },
    Types: {
      ObjectId: jest.fn((id) => id)
    }
  }
}));

// Mock the Agency model
jest.mock('../src/models/Agency');

describe('Agency Service', () => {
  beforeAll(async () => {
    // Setup
  });

  afterAll(async () => {
    jest.clearAllMocks();
  });

  it('should create a new agency', async () => {
    const mockAgencyData = {
      name: 'Test Agency',
      ownerUserId: new mongoose.Types.ObjectId('111111111111')
    };
    
    const mockCreatedAgency = {
      _id: 'agency123',
      name: 'Test Agency',
      ownerUserId: '111111111111',
      clientBusinessIds: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    (AgencyModel.create as jest.Mock).mockResolvedValue(mockCreatedAgency);
    
    const result = await agencyService.createAgency(mockAgencyData);
    
    expect(AgencyModel.create).toHaveBeenCalledWith({
      ...mockAgencyData,
      clientBusinessIds: []
    });
    expect(result).toEqual(mockCreatedAgency);
  });

  it('should update agency clients', async () => {
    const agencyId = 'agency123';
    const clientBusinessIds = ['business1', 'business2'];
    const action = 'add';
    
    const mockUpdatedAgency = {
      _id: agencyId,
      name: 'Test Agency',
      ownerUserId: '111111111111',
      clientBusinessIds: clientBusinessIds,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    (AgencyModel.findByIdAndUpdate as jest.Mock).mockResolvedValue(mockUpdatedAgency);
    
    const result = await agencyService.updateAgencyClients(agencyId, action, clientBusinessIds);
    
    expect(AgencyModel.findByIdAndUpdate).toHaveBeenCalled();
    expect(result).toEqual(mockUpdatedAgency);
  });

  it('should get an agency by id', async () => {
    const agencyId = 'agency123';
    
    const mockAgency = {
      _id: agencyId,
      name: 'Test Agency',
      ownerUserId: '111111111111',
      clientBusinessIds: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    (AgencyModel.findById as jest.Mock).mockResolvedValue(mockAgency);
    
    const result = await agencyService.getAgency(agencyId);
    
    expect(AgencyModel.findById).toHaveBeenCalledWith(agencyId);
    expect(result).toEqual(mockAgency);
  });

  it('should get agencies by owner user id', async () => {
    const ownerUserId = '111111111111';
    
    const mockAgencies = [
      {
        _id: 'agency123',
        name: 'Test Agency 1',
        ownerUserId,
        clientBusinessIds: [],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: 'agency456',
        name: 'Test Agency 2',
        ownerUserId,
        clientBusinessIds: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    (AgencyModel.find as jest.Mock).mockResolvedValue(mockAgencies);
    
    const result = await agencyService.getAgencies(ownerUserId);
    
    expect(AgencyModel.find).toHaveBeenCalled();
    expect(result).toEqual(mockAgencies);
  });

  it('should get agency overview', async () => {
    const agencyId = 'agency123';
    
    const mockAgency = {
      _id: agencyId,
      name: 'Test Agency',
      ownerUserId: '111111111111',
      clientBusinessIds: ['business1', 'business2'],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const mockPerformanceData = [
      {
        _id: 'business1',
        businessName: 'Business 1',
        spend: 100,
        impressions: 1000,
        clicks: 50
      },
      {
        _id: 'business2',
        businessName: 'Business 2',
        spend: 200,
        impressions: 2000,
        clicks: 100
      }
    ];
    
    const mockExperiments = [
      {
        id: 'exp1',
        name: 'Experiment 1',
        businessId: 'business1',
        businessName: 'Business 1',
        status: 'active',
        lift: 5.2,
        confidence: 95,
        startDate: new Date()
      }
    ];
    
    (AgencyModel.findById as jest.Mock).mockResolvedValue(mockAgency);
    
    const mockAggregate = {
      toArray: jest.fn()
    };
    
    mockAggregate.toArray
      .mockResolvedValueOnce(mockPerformanceData)
      .mockResolvedValueOnce(mockExperiments);
    
    (mongoose.connection.db.collection('performancedata').aggregate as jest.Mock).mockReturnValue(mockAggregate);
    (mongoose.connection.db.collection('experimentresults').aggregate as jest.Mock).mockReturnValue(mockAggregate);
    
    const result = await agencyService.getOverview(agencyId);
    
    expect(AgencyModel.findById).toHaveBeenCalledWith(agencyId);
    expect(result).toMatchObject({
      aggregatedKPIs: {
        totalSpend: 300,
        totalImpressions: 3000,
        totalClicks: 150
      },
      clientBreakdown: expect.any(Array),
      activeExperiments: expect.any(Array)
    });
  });
});
