
import { Schema, model, Document, Types } from 'mongoose';

export interface IBusiness extends Document {
  name: string;
  businessType: string;
  description?: string;
  contact: {
    email: string;
    phone?: string;
    address?: string;
  };
  status: string;
  onboardingStep: number;
  offerings?: string[];
  brandVoice?: {
    tone: string;
    style: string;
    examples?: string[];
  };
  integrations?: Record<string, any>;
  settings?: Record<string, any>;
  targetAudience?: {
    demographics?: Record<string, any>;
    interests?: string[];
    behaviors?: string[];
  };
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * @swagger
 * components:
 *   schemas:
 *     Business:
 *       type: object
 *       required:
 *         - name
 *         - businessType
 *         - contact.email
 *         - status
 *         - onboardingStep
 *       properties:
 *         name:
 *           type: string
 *         businessType:
 *           type: string
 *         description:
 *           type: string
 *         status:
 *           type: string
 *         onboardingStep:
 *           type: number
 */
const businessSchema = new Schema<IBusiness>(
  {
    name: {
      type: String,
      required: true,
      index: true,
    },
    businessType: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    contact: {
      email: {
        type: String,
        required: true,
      },
      phone: String,
      address: String,
    },
    status: {
      type: String,
      required: true,
      default: 'pending',
    },
    onboardingStep: {
      type: Number,
      required: true,
      default: 1,
    },
    offerings: [String],
    brandVoice: {
      tone: String,
      style: String,
      examples: [String],
    },
    integrations: {
      type: Schema.Types.Mixed,
    },
    settings: {
      type: Schema.Types.Mixed,
    },
    targetAudience: {
      demographics: Schema.Types.Mixed,
      interests: [String],
      behaviors: [String],
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Create indexes
businessSchema.index({ businessType: 1 });
businessSchema.index({ name: 'text', 'contact.email': 'text' });

const BusinessModel = model<IBusiness>('Business', businessSchema);

export default BusinessModel;
