
import { Types } from 'mongoose';
import UsageRecordModel from '../models/UsageRecord';
import BusinessModel from '../models/Business';
import { startOfDay, startOfMonth, endOfMonth } from 'date-fns';
import * as redis from '../lib/redis';

// Define key prefixes for Redis operations
const TOKEN_RESERVATION_PREFIX = 'token_reservation:';
const QUOTA_WARNING_PREFIX = 'quota_warning:';

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
    
    // Clear any token reservations after successful recording
    const reservationKey = `${TOKEN_RESERVATION_PREFIX}${businessId.toString()}`;
    await redis.del(reservationKey);
  }

  /**
   * Reserve estimated tokens to prevent race conditions
   */
  static async reserveTokens(
    businessId: string | Types.ObjectId,
    estimatedTokens: number
  ): Promise<void> {
    if (!Types.ObjectId.isValid(businessId)) {
      throw new Error('Invalid business ID');
    }
    
    const reservationKey = `${TOKEN_RESERVATION_PREFIX}${businessId.toString()}`;
    
    // Get current reservation
    const currentReservation = await redis.get(reservationKey);
    const currentTokens = currentReservation ? parseInt(currentReservation) : 0;
    
    // Add new reservation
    await redis.setWithExpiry(reservationKey, (currentTokens + estimatedTokens).toString(), 300); // 5 minute expiry
  }

  /**
   * Mark that a business is approaching its quota limit
   */
  static async markQuotaNearlyReached(businessId: string | Types.ObjectId): Promise<void> {
    if (!Types.ObjectId.isValid(businessId)) {
      throw new Error('Invalid business ID');
    }
    
    const warningKey = `${QUOTA_WARNING_PREFIX}${businessId.toString()}`;
    
    // Set a warning flag that expires at the end of the month
    const currentMonth = new Date();
    const lastDay = endOfMonth(currentMonth);
    const ttlSeconds = Math.floor((lastDay.getTime() - currentMonth.getTime()) / 1000);
    
    await redis.setWithExpiry(warningKey, 'warned', ttlSeconds);
    
    // Also update business model to indicate warning has been issued
    await BusinessModel.updateOne(
      { _id: businessId },
      { 
        $set: { 
          'settings.quotaWarningIssued': true,
          'settings.quotaWarningDate': new Date()
        } 
      }
    );
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
    
    // Also account for any token reservations in progress
    const reservationKey = `${TOKEN_RESERVATION_PREFIX}${businessId.toString()}`;
    const reservedTokensStr = await redis.get(reservationKey);
    const reservedTokens = reservedTokensStr ? parseInt(reservedTokensStr) : 0;
    
    // Total used is actual used plus any reserved tokens
    const effectiveUsed = totalUsed + reservedTokens;
    const remaining = Math.max(0, quotaLimit - effectiveUsed);
    
    return {
      hasQuota: effectiveUsed < quotaLimit,
      used: effectiveUsed,
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
    isApproachingQuota: boolean;
  }> {
    // Check if warning has been issued for this business
    const warningKey = `${QUOTA_WARNING_PREFIX}${businessId.toString()}`;
    const warningIssued = await redis.get(warningKey);
    
    const quotaInfo = await this.checkQuota(businessId);
    
    return {
      currentUsage: quotaInfo.used,
      quota: quotaInfo.limit,
      percentUsed: (quotaInfo.used / quotaInfo.limit) * 100,
      isApproachingQuota: Boolean(warningIssued) || quotaInfo.used >= quotaInfo.limit * 0.9
    };
  }

  /**
   * Reset quota warning for a business (typically done after upgrading plan)
   */
  static async resetQuotaWarning(businessId: string | Types.ObjectId): Promise<void> {
    if (!Types.ObjectId.isValid(businessId)) {
      throw new Error('Invalid business ID');
    }
    
    const warningKey = `${QUOTA_WARNING_PREFIX}${businessId.toString()}`;
    await redis.del(warningKey);
    
    await BusinessModel.updateOne(
      { _id: businessId },
      { 
        $set: { 
          'settings.quotaWarningIssued': false 
        },
        $unset: { 
          'settings.quotaWarningDate': "" 
        }
      }
    );
  }
}

// Helper function to get end of day
function endOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
}

export default UsageService;
