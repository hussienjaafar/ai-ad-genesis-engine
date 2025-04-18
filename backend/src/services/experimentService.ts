
import { mongoose } from '../lib/mongoose';
import ExperimentModel, { ExperimentDocument } from '../models/Experiment';
import ExperimentResultModel from '../models/ExperimentResult';
import ExperimentDailyStatsModel from '../models/ExperimentDailyStats';
import * as ss from 'simple-statistics';
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
   * Verify if a user has access to an experiment via business ownership or agency relationship
   */
  async verifyExperimentAccess(experimentId: string, userId: string | undefined): Promise<boolean> {
    if (!userId) return false;
    
    try {
      // First get the experiment to find its businessId
      const experiment = await ExperimentModel.findById(experimentId);
      if (!experiment) return false;
      
      const businessId = experiment.businessId;
      
      // Check direct business ownership
      const Business = mongoose.model('Business');
      const business = await Business.findOne({ 
        _id: businessId,
        userId: userId
      });
      
      if (business) return true;
      
      // Check agency relationship
      const Agency = mongoose.model('Agency');
      const agency = await Agency.findOne({ 
        adminId: userId,
        clientBusinessIds: businessId
      });
      
      return !!agency;
    } catch (error) {
      console.error('Error verifying experiment access:', error);
      return false;
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
      
      // Calculate statistical significance using chi-squared test
      // Create a contingency table for the chi-squared test
      const table = [
        [originalConversions, originalImpressions - originalConversions],
        [variantConversions, variantImpressions - variantConversions]
      ];
      
      let pValue = 1.0;
      let isSignificant = false;
      
      try {
        if (originalImpressions > 0 && variantImpressions > 0) {
          // Use simple-statistics for chi-squared test
          const observed = [originalConversions, variantConversions];
          const expected = [
            (originalConversions + variantConversions) * originalImpressions / (originalImpressions + variantImpressions),
            (originalConversions + variantConversions) * variantImpressions / (originalImpressions + variantImpressions)
          ];
          
          const chiSquared = ss.chiSquaredGoodnessOfFit(observed, expected).chiSquared;
          pValue = 1 - ss.chiSquaredDistributionTable(chiSquared, 1);
          isSignificant = pValue < 0.05;
        }
      } catch (error) {
        console.error('Error calculating statistical significance:', error);
      }
      
      // Calculate confidence intervals using simple-statistics
      let confidenceInterval = { lower: 0, upper: 0 };
      
      try {
        if (originalImpressions > 0 && variantImpressions > 0) {
          // Calculate standard error for the difference in proportions
          const originalSE = Math.sqrt(originalCR * (1 - originalCR) / originalImpressions);
          const variantSE = Math.sqrt(variantCR * (1 - variantCR) / variantImpressions);
          const diffSE = Math.sqrt(Math.pow(originalSE, 2) + Math.pow(variantSE, 2));
          
          // Calculate the absolute difference in conversion rates
          const absoluteDiff = variantCR - originalCR;
          
          // Calculate 95% confidence interval using z-score of 1.96
          confidenceInterval = {
            lower: absoluteDiff - 1.96 * diffSE,
            upper: absoluteDiff + 1.96 * diffSE
          };
          
          // Convert to relative (percentage) confidence interval if original rate is not zero
          if (originalCR > 0) {
            confidenceInterval = {
              lower: (confidenceInterval.lower / originalCR) * 100,
              upper: (confidenceInterval.upper / originalCR) * 100
            };
          }
        }
      } catch (error) {
        console.error('Error calculating confidence interval:', error);
      }
      
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
   * Get experiment results
   */
  async getResults(experimentId: string): Promise<any> {
    try {
      return await ExperimentResultModel.findOne({ experimentId: new mongoose.Types.ObjectId(experimentId) });
    } catch (error) {
      console.error('Error getting experiment results:', error);
      throw error;
    }
  }
}

export default new ExperimentService();
