
import { Schema, model, Document, Types } from 'mongoose';

export interface IRefreshToken extends Document {
  userId: Types.ObjectId;
  token: string;
  expiresAt: Date;
  ip: string;
  userAgent: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * @swagger
 * components:
 *   schemas:
 *     RefreshToken:
 *       type: object
 *       required:
 *         - userId
 *         - token
 *         - expiresAt
 *       properties:
 *         userId:
 *           type: string
 *         token:
 *           type: string
 *         expiresAt:
 *           type: string
 *           format: date-time
 *         ip:
 *           type: string
 *         userAgent:
 *           type: string
 */
const refreshTokenSchema = new Schema<IRefreshToken>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    ip: String,
    userAgent: String,
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Create TTL index on expiresAt field
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const RefreshTokenModel = model<IRefreshToken>('RefreshToken', refreshTokenSchema);

export default RefreshTokenModel;
