
import { Types } from 'mongoose';
import AgencyModel, { IAgency } from '../models/Agency';
import { calculateEngagementMetrics } from './metrics/engagementMetrics';
import { mongoose } from '../lib/mongoose';
import { PerformanceMetrics } from '../types/performanceTypes';

interface AgencyOverview {
  aggregatedKPIs: {
    totalSpend: number;
    avgCTR: number;
    totalImpressions: number;
    totalClicks: number;
  };
  clientBreakdown: {
    businessId: string;
    businessName: string;
    spend: number;
    impressions: number;
    clicks: number;
  }[];
  activeExperiments: {
    id: string;
    name: string;
    businessId: string;
    businessName: string;
    status: string;
    lift: number;
    confidence: number;
    startDate: Date;
  }[];
}

export const agencyService = {
  async createAgency(agencyData: Pick<IAgency, 'name' | 'ownerUserId'>): Promise<IAgency> {
    return await AgencyModel.create({
      ...agencyData,
      clientBusinessIds: []
    });
  },

  async updateAgencyClients(
    agencyId: string, 
    action: 'add' | 'remove', 
    clientBusinessIds: string[]
  ): Promise<IAgency | null> {
    const update = action === 'add'
      ? { $addToSet: { clientBusinessIds: { $each: clientBusinessIds.map(id => new mongoose.Types.ObjectId(id)) } } }
      : { $pull: { clientBusinessIds: { $in: clientBusinessIds.map(id => new mongoose.Types.ObjectId(id)) } } };
    
    return await AgencyModel.findByIdAndUpdate(agencyId, update, { new: true });
  },

  async getAgency(agencyId: string): Promise<IAgency | null> {
    return await AgencyModel.findById(agencyId);
  },

  async getAgencies(ownerUserId: string): Promise<IAgency[]> {
    return await AgencyModel.find({ ownerUserId: new mongoose.Types.ObjectId(ownerUserId) });
  },

  async getOverview(agencyId: string): Promise<AgencyOverview> {
    const agency = await AgencyModel.findById(agencyId);
    if (!agency) {
      throw new Error('Agency not found');
    }

    // Get all businesses
    const businessIds = agency.clientBusinessIds;
    
    // Aggregate KPIs from performance data
    const performanceData = await mongoose.connection.db.collection('performancedata').aggregate([
      {
        $match: {
          businessId: { $in: businessIds }
        }
      },
      {
        $group: {
          _id: '$businessId',
          businessName: { $first: '$businessName' },
          spend: { $sum: '$spend' },
          impressions: { $sum: '$impressions' },
          clicks: { $sum: '$clicks' }
        }
      }
    ]).toArray();

    // Get active experiments
    const experiments = await mongoose.connection.db.collection('experimentresults').aggregate([
      {
        $match: {
          businessId: { $in: businessIds.map(id => id.toString()) },
          status: 'active'
        }
      },
      {
        $lookup: {
          from: 'businesses',
          localField: 'businessId',
          foreignField: '_id',
          as: 'business'
        }
      },
      {
        $unwind: '$business'
      },
      {
        $project: {
          id: '$_id',
          name: 1,
          businessId: 1,
          businessName: '$business.name',
          status: 1,
          lift: 1,
          confidence: 1,
          startDate: 1
        }
      }
    ]).toArray();

    // Calculate aggregated metrics
    const totalSpend = performanceData.reduce((sum, business) => sum + (business.spend || 0), 0);
    const totalImpressions = performanceData.reduce((sum, business) => sum + (business.impressions || 0), 0);
    const totalClicks = performanceData.reduce((sum, business) => sum + (business.clicks || 0), 0);
    
    const engagementMetrics = calculateEngagementMetrics(totalClicks, totalImpressions, performanceData.length);
    const avgCTR = engagementMetrics.ctr * 100; // Convert to percentage

    return {
      aggregatedKPIs: {
        totalSpend,
        avgCTR,
        totalImpressions,
        totalClicks
      },
      clientBreakdown: performanceData.map(business => ({
        businessId: business._id.toString(),
        businessName: business.businessName || 'Unknown Business',
        spend: business.spend || 0,
        impressions: business.impressions || 0,
        clicks: business.clicks || 0
      })),
      activeExperiments: experiments.map(exp => ({
        id: exp.id.toString(),
        name: exp.name,
        businessId: exp.businessId,
        businessName: exp.businessName,
        status: exp.status,
        lift: exp.lift || 0,
        confidence: exp.confidence || 0,
        startDate: exp.startDate
      }))
    };
  }
};
