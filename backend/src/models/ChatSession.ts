
import { Schema, model, Document, Types } from 'mongoose';

export interface IChatMessage {
  role: 'user' | 'assistant' | 'system';
  message: string;
  timestamp: Date;
}

export interface IChatSession extends Document {
  sessionId: string;
  businessId: Types.ObjectId;
  contentType: 'videoScript' | 'metaAdCopy' | 'googleAdCopy' | 'transcript';
  originalContentId?: Types.ObjectId;
  mediaId?: Types.ObjectId;
  insightId?: Types.ObjectId;
  history: IChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * @swagger
 * components:
 *   schemas:
 *     ChatMessage:
 *       type: object
 *       required:
 *         - role
 *         - message
 *         - timestamp
 *       properties:
 *         role:
 *           type: string
 *           enum: [user, assistant, system]
 *         message:
 *           type: string
 *         timestamp:
 *           type: string
 *           format: date-time
 *     ChatSession:
 *       type: object
 *       required:
 *         - businessId
 *         - contentType
 *         - history
 *       properties:
 *         sessionId:
 *           type: string
 *         businessId:
 *           type: string
 *         contentType:
 *           type: string
 *           enum: [videoScript, metaAdCopy, googleAdCopy, transcript]
 *         originalContentId:
 *           type: string
 *         mediaId:
 *           type: string
 *         insightId:
 *           type: string
 *         history:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ChatMessage'
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */
const chatSessionSchema = new Schema<IChatSession>(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
    },
    businessId: {
      type: Schema.Types.ObjectId,
      ref: 'Business',
      required: true,
    },
    contentType: {
      type: String,
      required: true,
      enum: ['videoScript', 'metaAdCopy', 'googleAdCopy', 'transcript'],
    },
    originalContentId: {
      type: Schema.Types.ObjectId,
      ref: 'Content',
    },
    mediaId: {
      type: Schema.Types.ObjectId,
      ref: 'MediaAsset',
    },
    insightId: {
      type: Schema.Types.ObjectId,
      ref: 'PerformanceInsight',
    },
    history: [
      {
        role: {
          type: String,
          required: true,
          enum: ['user', 'assistant', 'system'],
        },
        message: {
          type: String,
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

// Create compound indexes
chatSessionSchema.index({ businessId: 1, createdAt: -1 });
chatSessionSchema.index({ sessionId: 1 }, { unique: true });

const ChatSessionModel = model<IChatSession>('ChatSession', chatSessionSchema);

export default ChatSessionModel;
