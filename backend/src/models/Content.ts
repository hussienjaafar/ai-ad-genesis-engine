
import { Schema, model, Document, Types } from 'mongoose';

export interface IContentRevision {
  revisionContent: Record<string, any>;
  timestamp: Date;
  sessionId: string;
  rawContent: string;
}

export interface IContent extends Document {
  businessId: Types.ObjectId;
  contentType: string;
  params: Record<string, any>;
  parsedContent: Record<string, any>;
  status: string;
  rawPrompt?: string;
  rawResponse?: string;
  metadata?: Record<string, any>;
  generatedFrom?: {
    insightId?: Types.ObjectId;
    elementText?: string;
  };
  revisions?: IContentRevision[];
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * @swagger
 * components:
 *   schemas:
 *     ContentRevision:
 *       type: object
 *       properties:
 *         revisionContent:
 *           type: object
 *         timestamp:
 *           type: string
 *           format: date-time
 *         sessionId:
 *           type: string
 *         rawContent:
 *           type: string
 *     Content:
 *       type: object
 *       required:
 *         - businessId
 *         - contentType
 *         - params
 *         - parsedContent
 *         - status
 *       properties:
 *         businessId:
 *           type: string
 *         contentType:
 *           type: string
 *         params:
 *           type: object
 *         parsedContent:
 *           type: object
 *         status:
 *           type: string
 *         generatedFrom:
 *           type: object
 *           properties:
 *             insightId:
 *               type: string
 *             elementText:
 *               type: string
 *         revisions:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ContentRevision'
 */
const contentSchema = new Schema<IContent>(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: 'Business',
      required: true,
    },
    contentType: {
      type: String,
      required: true,
    },
    params: {
      type: Schema.Types.Mixed,
      required: true,
    },
    parsedContent: {
      type: Schema.Types.Mixed,
      required: true,
    },
    status: {
      type: String,
      required: true,
      default: 'draft',
    },
    rawPrompt: String,
    rawResponse: String,
    metadata: Schema.Types.Mixed,
    generatedFrom: {
      insightId: {
        type: Schema.Types.ObjectId,
        ref: 'PerformanceInsight',
      },
      elementText: String,
    },
    revisions: [
      {
        revisionContent: Schema.Types.Mixed,
        timestamp: {
          type: Date,
          default: Date.now
        },
        sessionId: String,
        rawContent: String
      }
    ],
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Create compound index
contentSchema.index({ businessId: 1, contentType: 1, createdAt: -1 });

const ContentModel = model<IContent>('Content', contentSchema);

export default ContentModel;
