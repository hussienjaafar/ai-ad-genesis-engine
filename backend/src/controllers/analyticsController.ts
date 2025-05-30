
import { Request, Response } from 'express';
import { Types } from 'mongoose';
import PerformanceInsightModel from '../models/PerformanceInsight';
import { connectToDatabase } from '../lib/mongoose';

export class AnalyticsController {
  /**
   * Get aggregated performance metrics for a business
   */
  static async getPerformanceMetrics(req: Request, res: Response) {
    try {
      const businessId = req.params.id;
      const days = parseInt(req.query.days as string) || 30;
      
      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      await connectToDatabase();
      
      // Aggregate metrics using the mongoose connection
      const db = mongoose.connection.db;
      const performanceCollection = db.collection('performanceData');
      
      // Aggregate metrics
      const metrics = await performanceCollection.aggregate([
        {
          $match: {
            businessId,
            date: {
              $gte: startDate.toISOString().split('T')[0],
              $lte: endDate.toISOString().split('T')[0]
            }
          }
        },
        {
          $group: {
            _id: {
              date: "$date",
              platform: "$platform"
            },
            impressions: { $sum: "$metrics.impressions" },
            clicks: { $sum: "$metrics.clicks" },
            spend: { $sum: "$metrics.spend" },
            leads: { $sum: "$metrics.leads" }
          }
        },
        {
          $sort: { "_id.date": 1 }
        }
      ]).toArray();
      
      // Transform data for frontend
      const transformedData = metrics.map(item => ({
        date: item._id.date,
        platform: item._id.platform,
        metrics: {
          impressions: item.impressions,
          clicks: item.clicks,
          spend: item.spend,
          leads: item.leads,
          ctr: item.impressions > 0 ? item.clicks / item.impressions : 0,
          cpl: item.leads > 0 ? item.spend / item.leads : 0
        }
      }));
      
      // Calculate totals
      const totals = {
        impressions: 0,
        clicks: 0,
        spend: 0,
        leads: 0
      };
      
      metrics.forEach(item => {
        totals.impressions += item.impressions;
        totals.clicks += item.clicks;
        totals.spend += item.spend;
        totals.leads += item.leads;
      });
      
      totals['ctr'] = totals.impressions > 0 ? totals.clicks / totals.impressions : 0;
      totals['cpl'] = totals.leads > 0 ? totals.spend / totals.leads : 0;
      
      res.status(200).json({
        data: transformedData,
        totals,
        timeframe: {
          start: startDate.toISOString().split('T')[0],
          end: endDate.toISOString().split('T')[0],
          days
        }
      });
      
    } catch (error) {
      console.error('Error fetching performance metrics:', error);
      res.status(500).json({ error: 'Failed to fetch performance metrics' });
    }
  }
  
  /**
   * Get performance insights for a business
   */
  static async getPerformanceInsights(req: Request, res: Response) {
    try {
      const businessId = req.params.id;
      
      await connectToDatabase();
      
      // Get latest insights using the PerformanceInsight model
      const insights = await PerformanceInsightModel
        .findOne({ businessId: new Types.ObjectId(businessId) }, { sort: { createdAt: -1 } })
        .lean();
      
      if (!insights) {
        return res.status(404).json({ error: 'No insights available for this business' });
      }
      
      // Sort patternInsights by uplift in descending order
      if (insights.patternInsights) {
        insights.patternInsights.sort((a, b) => b.performance?.uplift - a.performance?.uplift);
      }
      
      res.status(200).json(insights);
      
    } catch (error) {
      console.error('Error fetching performance insights:', error);
      res.status(500).json({ error: 'Failed to fetch performance insights' });
    }
  }
}

export default AnalyticsController;
