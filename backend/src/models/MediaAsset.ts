
import { Schema, model, Document, Types } from 'mongoose';

export interface IMediaAsset extends Document {
  businessId: Types.ObjectId;
  assetType: 'video' | 'image';
  platform: string;
  assetId: string;
  url: string;
  processingStatus: 'pending' | 'processing' | 'complete' | 'failed';
  metadata: {
    name?: string;
    createdTime?: string;
    duration?: number;
    width?: number;
    height?: number;
    fileSize?: number;
    format?: string;
    [key: string]: any;
  };
  transcript?: string;
  detectedText?: string[];
  labels?: Array<{ name: string; confidence: number }>;
  toneAnalysis?: {
    sentiment: 'positive' | 'negative' | 'neutral' | 'mixed';
    sentimentScore?: {
      positive?: number;
      negative?: number;
      neutral?: number;
      mixed?: number;
    };
    emotions?: {
      joy?: number;
      sadness?: number;
      anger?: number;
      fear?: number;
      surprise?: number;
      disgust?: number;
    };
    tones?: Array<{
      name: string;
      score: number;
    }>;
  };
  createdAt: Date;
  updatedAt: Date;
  lastProcessedAt?: Date;
  failureReason?: string;
  processingAttempts: number;
}

/**
 * @swagger
 * components:
 *   schemas:
 *     MediaAsset:
 *       type: object
 *       required:
 *         - businessId
 *         - assetType
 *         - platform
 *         - assetId
 *         - url
 *       properties:
 *         businessId:
 *           type: string
 *           description: ID of the business that owns this asset
 *         assetType:
 *           type: string
 *           enum: [video, image]
 *           description: Type of media asset
 *         platform:
 *           type: string
 *           description: Platform source (meta, google, etc)
 *         assetId:
 *           type: string
 *           description: Original ID from the platform
 *         url:
 *           type: string
 *           description: URL to access the media
 *         processingStatus:
 *           type: string
 *           enum: [pending, processing, complete, failed]
 *           description: Current status of processing
 *         metadata:
 *           type: object
 *           description: Platform-specific metadata
 *         transcript:
 *           type: string
 *           description: Transcript of audio (for videos)
 *         detectedText:
 *           type: array
 *           items:
 *             type: string
 *           description: Text detected in the image/video
 *         labels:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               confidence:
 *                 type: number
 *           description: Objects/concepts detected in the asset
 *         toneAnalysis:
 *           type: object
 *           description: Analysis of tone and sentiment
 */
const mediaAssetSchema = new Schema<IMediaAsset>(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: 'Business',
      required: true,
      index: true,
    },
    assetType: {
      type: String,
      enum: ['video', 'image'],
      required: true,
      index: true,
    },
    platform: {
      type: String,
      required: true,
      index: true,
    },
    assetId: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    processingStatus: {
      type: String,
      enum: ['pending', 'processing', 'complete', 'failed'],
      default: 'pending',
      index: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    transcript: String,
    detectedText: [String],
    labels: [{
      name: String,
      confidence: Number,
    }],
    toneAnalysis: {
      sentiment: String,
      sentimentScore: Schema.Types.Mixed,
      emotions: Schema.Types.Mixed,
      tones: [{
        name: String,
        score: Number,
      }],
    },
    lastProcessedAt: Date,
    failureReason: String,
    processingAttempts: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Create compound indexes for efficient queries
mediaAssetSchema.index({ businessId: 1, assetType: 1, processingStatus: 1 });
mediaAssetSchema.index({ businessId: 1, platform: 1, assetId: 1 }, { unique: true });

const MediaAssetModel = model<IMediaAsset>('MediaAsset', mediaAssetSchema);

export default MediaAssetModel;
