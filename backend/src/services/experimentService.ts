
import { mongoose } from '../lib/mongoose';
import ExperimentModel, { ExperimentDocument } from '../models/Experiment';
import ExperimentResultModel from '../models/ExperimentResult';
import { calculatePValue } from '../utils/statisticsUtil';
import alertService from './alertService';

class ExperimentService {
  /**
   * Create a new experiment
   */
  async createExperiment(data: Partial<ExperimentDocument>): Promise<ExperimentDocument> {
    try {
      // Validate that the split adds up to 100%
      if (data.split && (data.split.original + data.split.variant !== 100)) {
        throw new Error('Split percentages must add up to 100%');
      }

      const experiment = new ExperimentModel(data);
      await experiment.save();
      
      // Create an empty result document to track metrics
      await ExperimentResultModel.create({
        experimentId: experiment._id,
        lastUpdated: new Date()
      });
      
      return experiment;
    } catch (error) {
      console.error('Error creating experiment:', error);
      throw error;
    }
  }

  /**
   * Get all experiments for a business
   */
  async getExperimentsByBusiness(businessId: string): Promise<ExperimentDocument[]> {
    try {
      return await ExperimentModel.find({ businessId: new mongoose.Types.ObjectId(businessId) })
        .sort({ createdAt: -1 });
    } catch (error) {
      console.error('Error fetching experiments:', error);
      throw error;
    }
  }

  /**
   * Get a specific experiment
   */
  async getExperimentById(id: string): Promise<ExperimentDocument | null> {
    try {
      return await ExperimentModel.findById(id);
    } catch (error) {
      console.error('Error fetching experiment:', error);
      throw error;
    }
  }

  /**
   * Update experiment status
   */
  async updateExperimentStatus(id: string, status: 'active' | 'completed' | 'paused'): Promise<ExperimentDocument | null> {
    try {
      return await ExperimentModel.findByIdAndUpdate(
        id,
        { status },
        { new: true }
      );
    } catch (error) {
      console.error('Error updating experiment status:', error);
      throw error;
    }
  }

  /**
   * Determine which variant to show based on a consistent hash
   * This ensures the same user sees the same variant
   */
  assignVariant(experiment: ExperimentDocument, userId: string): 'original' | 'variant' {
    // Calculate a hash value from the userId and experimentId
    // This ensures consistent assignment for the same user
    const combined = userId + experiment._id.toString();
    let hash = 0;
    
    for (let i = 0; i < combined.length; i++) {
      hash = ((hash << 5) - hash) + combined.charCodeAt(i);
      hash = hash & hash; // Convert to 32bit integer
    }
    
    // Normalize to 0-99 range
    const bucket = Math.abs(hash % 100);
    
    // Assign based on split percentages
    return bucket < experiment.split.original ? 'original' : 'variant';
  }

  /**
   * Compute experiment results
   */
  async computeResults(experimentId: string): Promise<any> {
    try {
      const experiment = await ExperimentModel.findById(experimentId);
      if (!experiment) {
        throw new Error('Experiment not found');
      }
      
      // Query performance data with the experiment tag
      const performanceData = await mongoose.connection.db.collection('performanceData').aggregate([
        {
          $match: {
            experimentId: experimentId,
            date: {
              $gte: experiment.startDate,
              $lte: experiment.endDate
            }
          }
        },
        {
          $group: {
            _id: '$variant',
            impressions: { $sum: '$metrics.impressions' },
            clicks: { $sum: '$metrics.clicks' },
            conversions: { $sum: '$metrics.leads' }
          }
        }
      ]).toArray();
      
      // Extract metrics for each variant
      const originalData = performanceData.find(item => item._id === 'original') || { 
        impressions: 0, clicks: 0, conversions: 0 
      };
      const variantData = performanceData.find(item => item._id === 'variant') || { 
        impressions: 0, clicks: 0, conversions: 0 
      };
      
      // Calculate conversion rates
      const originalCR = originalData.conversions / originalData.impressions || 0;
      const variantCR = variantData.conversions / variantData.impressions || 0;
      
      // Calculate lift
      const lift = originalCR === 0 ? 0 : ((variantCR - originalCR) / originalCR) * 100;
      
      // Calculate statistical significance (p-value)
      const pValue = calculatePValue(
        originalData.conversions, originalData.impressions,
        variantData.conversions, variantData.impressions
      );
      
      const isSignificant = pValue < 0.05;
      
      // Update results in database
      const results = await ExperimentResultModel.findOneAndUpdate(
        { experimentId: new mongoose.Types.ObjectId(experimentId) },
        {
          results: {
            original: {
              impressions: originalData.impressions,
              clicks: originalData.clicks,
              conversions: originalData.conversions,
              conversionRate: originalCR
            },
            variant: {
              impressions: variantData.impressions,
              clicks: variantData.clicks,
              conversions: variantData.conversions,
              conversionRate: variantCR
            }
          },
          lift,
          pValue,
          isSignificant,
          lastUpdated: new Date()
        },
        { new: true, upsert: true }
      );
      
      // If experiment is complete and significant, send an alert
      if (isSignificant && experiment.status === 'completed') {
        await alertService.send({
          level: 'info',
          message: `Experiment "${experiment.name}" completed with significant results: ${lift.toFixed(1)}% lift`,
          source: 'experiments',
          businessId: experiment.businessId.toString()
        });
      }
      
      return results;
    } catch (error) {
      console.error('Error computing experiment results:', error);
      throw error;
    }
  }

  /**
   * Get experiment results
   */
  async getResults(experimentId: string): Promise<any> {
    try {
      // First compute the latest results
      await this.computeResults(experimentId);
      
      // Then return them
      return await ExperimentResultModel.findOne({ experimentId: new mongoose.Types.ObjectId(experimentId) });
    } catch (error) {
      console.error('Error getting experiment results:', error);
      throw error;
    }
  }
}

export default new ExperimentService();
