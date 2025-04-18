
import { Schema, model, Document, Types } from 'mongoose';

export interface IAgency extends Document {
  name: string;
  ownerUserId: Types.ObjectId;
  clientBusinessIds: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * @swagger
 * components:
 *   schemas:
 *     Agency:
 *       type: object
 *       required:
 *         - name
 *         - ownerUserId
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated MongoDB ObjectId
 *         name:
 *           type: string
 *           description: Agency name
 *         ownerUserId:
 *           type: string
 *           format: objectId
 *           description: User ID of agency admin
 *         clientBusinessIds:
 *           type: array
 *           items:
 *             type: string
 *             format: objectId
 *           description: Array of business IDs that belong to this agency
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */
const agencySchema = new Schema<IAgency>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    ownerUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    clientBusinessIds: [{
      type: Schema.Types.ObjectId,
      ref: 'Business',
    }],
  },
  {
    timestamps: true,
  }
);

const AgencyModel = model<IAgency>('Agency', agencySchema);

export default AgencyModel;
