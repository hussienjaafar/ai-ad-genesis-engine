
import { Schema, model, Document, Types } from 'mongoose';

export interface IPerformanceInsight extends Document {
  businessId: Types.ObjectId;
  primaryCategory: string;
  metrics: Record<string, any>;
  patternInsights: string[];
  topPerformers?: Record<string, any>;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * @swagger
 * components:
 *   schemas:
 *     PerformanceInsight:
 *       type: object
 *       required:
 *         - businessId
 *         - primaryCategory
 *         - metrics
 *         - patternInsights
 *       properties:
 *         businessId:
 *           type: string
 *         primaryCategory:
 *           type: string
 *         metrics:
 *           type: object
 *         patternInsights:
 *           type: array
 *           items:
 *             type: string
 */
const performanceInsightSchema = new Schema<IPerformanceInsight>(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: 'Business',
      required: true,
    },
    primaryCategory: {
      type: String,
      required: true,
    },
    metrics: {
      type: Schema.Types.Mixed,
      required: true,
    },
    patternInsights: {
      type: [String],
      required: true,
    },
    topPerformers: Schema.Types.Mixed,
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Create compound index
performanceInsightSchema.index({ businessId: 1, primaryCategory: 1 }, { sparse: true });

const PerformanceInsightModel = model<IPerformanceInsight>('PerformanceInsight', performanceInsightSchema);

export default PerformanceInsightModel;
