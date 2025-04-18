
import { Types } from 'mongoose';
import UsageRecordModel from '../models/UsageRecord';
import BusinessModel from '../models/Business';
import { startOfDay, startOfMonth, endOfMonth } from 'date-fns';

export class UsageService {
  /**
   * Record token usage for a business
   */
  static async recordUsage(
    businessId: string | Types.ObjectId, 
    tokensRequested: number, 
    tokensConsumed: number
  ): Promise<void> {
    if (!Types.ObjectId.isValid(businessId)) {
      throw new Error('Invalid business ID');
    }
    
    const today = startOfDay(new Date());
    
    // Try to update existing record for today
    const result = await UsageRecordModel.updateOne(
      { 
        businessId, 
        date: today 
      },
      { 
        $inc: { 
          tokensRequested, 
          tokensConsumed 
        } 
      },
      { 
        upsert: true 
      }
    );
    
    if (result.matchedCount === 0 && !result.upsertedId) {
      throw new Error('Failed to record usage');
    }
  }

  /**
   * Check if a business has exceeded its quota
   */
  static async checkQuota(businessId: string | Types.ObjectId): Promise<{
    hasQuota: boolean;
    used: number;
    limit: number;
    remaining: number;
  }> {
    if (!Types.ObjectId.isValid(businessId)) {
      throw new Error('Invalid business ID');
    }

    // Get business and its quota settings
    const business = await BusinessModel.findById(businessId);
    if (!business) {
      throw new Error('Business not found');
    }

    // Default quota if not set (100,000 tokens)
    const quotaLimit = business.settings?.quotaTokens || 100000;

    // Calculate current month's usage
    const currentMonth = new Date();
    const firstDay = startOfMonth(currentMonth);
    const lastDay = endOfMonth(currentMonth);

    const usage = await UsageRecordModel.aggregate([
      {
        $match: {
          businessId: new Types.ObjectId(businessId),
          date: { $gte: firstDay, $lte: lastDay }
        }
      },
      {
        $group: {
          _id: null,
          totalTokensConsumed: { $sum: "$tokensConsumed" }
        }
      }
    ]);

    const totalUsed = usage.length > 0 ? usage[0].totalTokensConsumed : 0;
    const remaining = Math.max(0, quotaLimit - totalUsed);
    
    return {
      hasQuota: totalUsed < quotaLimit,
      used: totalUsed,
      limit: quotaLimit,
      remaining
    };
  }

  /**
   * Get usage statistics for a business over a date range
   */
  static async getUsage(
    businessId: string | Types.ObjectId,
    startDate: Date,
    endDate: Date
  ): Promise<Array<{
    date: Date;
    tokensRequested: number;
    tokensConsumed: number;
  }>> {
    if (!Types.ObjectId.isValid(businessId)) {
      throw new Error('Invalid business ID');
    }

    return UsageRecordModel.find({
      businessId,
      date: { $gte: startOfDay(startDate), $lte: endOfDay(endDate) }
    }).sort({ date: 1 });
  }

  /**
   * Get current month's usage summary for a business
   */
  static async getMonthlyUsage(businessId: string | Types.ObjectId): Promise<{
    currentUsage: number;
    quota: number;
    percentUsed: number;
  }> {
    const quotaInfo = await this.checkQuota(businessId);
    
    return {
      currentUsage: quotaInfo.used,
      quota: quotaInfo.limit,
      percentUsed: (quotaInfo.used / quotaInfo.limit) * 100
    };
  }
}

// Helper function to get end of day
function endOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
}

export default UsageService;
