
import { Schema, model, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

// Define the interface
export interface IUser extends Document {
  email: string;
  passwordHash: string;
  role: 'admin' | 'client' | 'staff';
  resetToken?: string;
  resetExpires?: Date;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  verifyPassword(plainPassword: string): Promise<boolean>;
}

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - email
 *         - passwordHash
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated MongoDB ObjectId
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *         role:
 *           type: string
 *           enum: [admin, client, staff]
 *           description: User's role in the system
 *         isDeleted:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */
const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['admin', 'client', 'staff'],
      default: 'client',
    },
    resetToken: String,
    resetExpires: Date,
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Create index on email field
userSchema.index({ email: 1 }, { unique: true });

// Password hashing pre-save hook
userSchema.pre('save', async function save(next) {
  if (!this.isModified('passwordHash')) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    return next();
  } catch (err) {
    return next(err as Error);
  }
});

// Password verification method
userSchema.methods.verifyPassword = async function verifyPassword(
  plainPassword: string
): Promise<boolean> {
  return bcrypt.compare(plainPassword, this.passwordHash);
};

const UserModel = model<IUser>('User', userSchema);

export default UserModel;
