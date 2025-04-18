
import { Schema, model, Document, Types } from 'mongoose';

export interface IUsageRecord extends Document {
  businessId: Types.ObjectId;
  date: Date;
  tokensRequested: number;
  tokensConsumed: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * @swagger
 * components:
 *   schemas:
 *     UsageRecord:
 *       type: object
 *       required:
 *         - businessId
 *         - date
 *         - tokensRequested
 *         - tokensConsumed
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated MongoDB ObjectId
 *         businessId:
 *           type: string
 *           format: objectId
 *           description: Reference to the business
 *         date:
 *           type: string
 *           format: date
 *           description: Date of usage (UTC midnight)
 *         tokensRequested:
 *           type: number
 *           description: Sum of tokens in request
 *         tokensConsumed:
 *           type: number
 *           description: Sum of tokens returned
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */
const usageRecordSchema = new Schema<IUsageRecord>(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: 'Business',
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    tokensRequested: {
      type: Number,
      required: true,
      default: 0,
    },
    tokensConsumed: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes
usageRecordSchema.index({ businessId: 1, date: 1 });

const UsageRecordModel = model<IUsageRecord>('UsageRecord', usageRecordSchema);

export default UsageRecordModel;
