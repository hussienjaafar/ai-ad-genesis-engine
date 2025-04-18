
import { Schema, model, Document, Types } from 'mongoose';
import crypto from 'crypto';

export interface IRefreshToken extends Document {
  userId: Types.ObjectId;
  tokenHash: string; // Store hash instead of plaintext token
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
 *         - tokenHash
 *         - expiresAt
 *       properties:
 *         userId:
 *           type: string
 *         tokenHash:
 *           type: string
 *           description: SHA-256 hash of the token for security
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
    tokenHash: {
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

// Static method to hash a token
refreshTokenSchema.statics.hashToken = function(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
};

const RefreshTokenModel = model<IRefreshToken>('RefreshToken', refreshTokenSchema);

export default RefreshTokenModel;
