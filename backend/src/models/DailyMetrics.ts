
import { Schema, model, Document, Types } from 'mongoose';

export interface IDailyMetrics extends Document {
  businessId: Types.ObjectId;
  date: string; // YYYY-MM-DD format
  impressions: number;
  clicks: number;
  conversions: number;
  spend: number;
  ctr: number;
  cpc: number;
  conversionRate: number;
  lastUpdated: Date;
}

/**
 * @swagger
 * components:
 *   schemas:
 *     DailyMetrics:
 *       type: object
 *       required:
 *         - businessId
 *         - date
 *       properties:
 *         businessId:
 *           type: string
 *           format: objectId
 *           description: The business ID this metrics belong to
 *         date:
 *           type: string
 *           format: date
 *           description: The date in YYYY-MM-DD format
 *         impressions:
 *           type: number
 *           description: Total impressions for the day
 *         clicks:
 *           type: number
 *           description: Total clicks for the day
 *         conversions:
 *           type: number
 *           description: Total conversions for the day
 *         spend:
 *           type: number
 *           description: Total ad spend for the day
 *         ctr:
 *           type: number
 *           description: Click-through rate (clicks/impressions)
 *         cpc:
 *           type: number
 *           description: Cost per click (spend/clicks)
 *         conversionRate:
 *           type: number
 *           description: Conversion rate (conversions/clicks)
 *         lastUpdated:
 *           type: string
 *           format: date-time
 *           description: When this record was last updated
 */
const dailyMetricsSchema = new Schema<IDailyMetrics>(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: 'Business',
      required: true
    },
    date: {
      type: String, // YYYY-MM-DD format
      required: true
    },
    impressions: {
      type: Number,
      default: 0
    },
    clicks: {
      type: Number,
      default: 0
    },
    conversions: {
      type: Number,
      default: 0
    },
    spend: {
      type: Number,
      default: 0
    },
    ctr: {
      type: Number,
      default: 0
    },
    cpc: {
      type: Number,
      default: 0
    },
    conversionRate: {
      type: Number,
      default: 0
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

// Create compound index for efficient lookups
dailyMetricsSchema.index({ businessId: 1, date: 1 }, { unique: true });

const DailyMetricsModel = model<IDailyMetrics>('DailyMetrics', dailyMetricsSchema);

export default DailyMetricsModel;
