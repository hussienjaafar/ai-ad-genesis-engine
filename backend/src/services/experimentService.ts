
import { mongoose } from '../lib/mongoose';
import ExperimentModel, { ExperimentDocument } from '../models/Experiment';
import ExperimentResultModel from '../models/ExperimentResult';
import ExperimentDailyStatsModel from '../models/ExperimentDailyStats';
import * as ss from 'simple-statistics';
import { calculateLiftConfidenceInterval } from '../queues/patternJobProcessor';
import alertService from './alertService';
import crypto from 'crypto';

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
    const combinedId = userId + ':' + experiment._id.toString();
    const hash = crypto.createHash('md5').update(combinedId).digest('hex');
    // Convert first 8 chars of hash to number (0-99)
    const bucket = parseInt(hash.substring(0, 8), 16) % 100;
    
    // Assign based on split percentages
    return bucket < experiment.split.original ? 'original' : 'variant';
  }

  /**
   * Update daily experiment stats
   * This should be called by the ETL process
   */
  async updateDailyStats(
    experimentId: string, 
    date: string,
    originalImpressions: number,
    originalClicks: number,
    originalConversions: number,
    variantImpressions: number,
    variantClicks: number,
    variantConversions: number
  ): Promise<void> {
    try {
      await ExperimentDailyStatsModel.findOneAndUpdate(
        { 
          experimentId: new mongoose.Types.ObjectId(experimentId),
          date 
        },
        {
          $set: {
            original: {
              impressions: originalImpressions,
              clicks: originalClicks,
              conversions: originalConversions
            },
            variant: {
              impressions: variantImpressions,
              clicks: variantClicks,
              conversions: variantConversions
            }
          }
        },
        { upsert: true, new: true }
      );
    } catch (error) {
      console.error(`Error updating daily stats for experiment ${experimentId}:`, error);
      throw error;
    }
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
      
      // Get experiment date range
      const startDate = experiment.startDate;
      const endDate = experiment.endDate > new Date() ? new Date() : experiment.endDate;
      
      // Use daily stats collection for incremental computation
      const dailyStats = await ExperimentDailyStatsModel.find({
        experimentId: new mongoose.Types.ObjectId(experimentId),
        date: {
          $gte: startDate.toISOString().split('T')[0],
          $lte: endDate.toISOString().split('T')[0]
        }
      });
      
      // If no daily stats, fall back to the raw performance data
      if (dailyStats.length === 0) {
        // Query performance data with the experiment tag
        const performanceData = await mongoose.connection.db.collection('performanceData').aggregate([
          {
            $match: {
              experimentId: experimentId,
              date: {
                $gte: startDate.toISOString().split('T')[0],
                $lte: endDate.toISOString().split('T')[0]
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
        
        // Update the daily stats collection for future incremental computation
        await this.updateDailyStats(
          experimentId,
          endDate.toISOString().split('T')[0],
          originalData.impressions,
          originalData.clicks,
          originalData.conversions,
          variantData.impressions,
          variantData.clicks,
          variantData.conversions
        );
      }
      
      // Aggregate metrics from daily stats
      let originalImpressions = 0;
      let originalClicks = 0;
      let originalConversions = 0;
      let variantImpressions = 0;
      let variantClicks = 0;
      let variantConversions = 0;
      
      // Sum up metrics from daily stats
      dailyStats.forEach(stat => {
        originalImpressions += stat.original.impressions;
        originalClicks += stat.original.clicks;
        originalConversions += stat.original.conversions;
        variantImpressions += stat.variant.impressions;
        variantClicks += stat.variant.clicks;
        variantConversions += stat.variant.conversions;
      });
      
      // Calculate conversion rates
      const originalCR = originalImpressions === 0 ? 0 : originalConversions / originalImpressions;
      const variantCR = variantImpressions === 0 ? 0 : variantConversions / variantImpressions;
      
      // Calculate lift
      const lift = originalCR === 0 ? 0 : ((variantCR - originalCR) / originalCR) * 100;
      
      // Calculate statistical significance (p-value) using simple-statistics
      const pValue = originalImpressions === 0 || variantImpressions === 0 ? 1.0 : 
        this.calculatePValue(
          originalConversions, originalImpressions,
          variantConversions, variantImpressions
        );
      
      // Calculate confidence intervals for lift
      const confidenceInterval = calculateLiftConfidenceInterval(
        originalConversions, originalImpressions,
        variantConversions, variantImpressions
      );
      
      const isSignificant = pValue < 0.05;
      
      // Update results in database
      const results = await ExperimentResultModel.findOneAndUpdate(
        { experimentId: new mongoose.Types.ObjectId(experimentId) },
        {
          results: {
            original: {
              impressions: originalImpressions,
              clicks: originalClicks,
              conversions: originalConversions,
              conversionRate: originalCR
            },
            variant: {
              impressions: variantImpressions,
              clicks: variantClicks,
              conversions: variantConversions,
              conversionRate: variantCR
            }
          },
          lift,
          pValue,
          confidenceInterval,
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
   * Calculate p-value using simple-statistics library
   */
  private calculatePValue(
    conversionA: number,
    impressionA: number,
    conversionB: number,
    impressionB: number
  ): number {
    // Prevent division by zero
    if (impressionA === 0 || impressionB === 0) {
      return 1.0;
    }

    try {
      // Create contingency table
      const table = [
        [conversionA, impressionA - conversionA],
        [conversionB, impressionB - conversionB]
      ];

      // Calculate chi-squared value
      const chiSquared = ss.chiSquaredGoodnessOfFit(
        [conversionA, conversionB],
        [
          (conversionA + conversionB) * impressionA / (impressionA + impressionB),
          (conversionA + conversionB) * impressionB / (impressionA + impressionB)
        ]
      ).chiSquared;

      // Calculate p-value from chi-squared with 1 degree of freedom
      return 1 - ss.chiSquaredDistributionTable(chiSquared, 1);
    } catch (error) {
      console.error('Error calculating p-value:', error);
      return 1.0; // Default to no significance
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
