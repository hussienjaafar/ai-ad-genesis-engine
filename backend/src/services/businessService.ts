
import { Types } from 'mongoose';
import BusinessModel, { IBusiness } from '../models/Business';

export class BusinessService {
  public static async create(businessData: Partial<IBusiness>): Promise<IBusiness> {
    const business = new BusinessModel({
      ...businessData,
      status: businessData.status || 'pending',
      onboardingStep: businessData.onboardingStep || 1,
    });

    return business.save();
  }

  public static async getById(id: string): Promise<IBusiness | null> {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error('Invalid business ID');
    }
    
    return BusinessModel.findOne({ _id: id, isDeleted: false });
  }

  public static async update(id: string, updates: Partial<IBusiness>): Promise<IBusiness | null> {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error('Invalid business ID');
    }

    return BusinessModel.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );
  }

  public static async addOfferings(id: string, offerings: string[]): Promise<IBusiness | null> {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error('Invalid business ID');
    }

    return BusinessModel.findByIdAndUpdate(
      id,
      { $addToSet: { offerings: { $each: offerings } } },
      { new: true, runValidators: true }
    );
  }

  public static async storePlatformCredentials(
    id: string,
    platform: string,
    credentials: Record<string, any>
  ): Promise<IBusiness | null> {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error('Invalid business ID');
    }

    const updateQuery: any = {};
    updateQuery[`integrations.${platform}`] = credentials;

    return BusinessModel.findByIdAndUpdate(
      id,
      { $set: updateQuery },
      { new: true, runValidators: true }
    );
  }

  public static async getAll(limit = 10, page = 1): Promise<{ businesses: IBusiness[]; total: number; pages: number }> {
    const skip = (page - 1) * limit;
    
    const [businesses, total] = await Promise.all([
      BusinessModel.find({ isDeleted: false })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      BusinessModel.countDocuments({ isDeleted: false }),
    ]);

    return {
      businesses,
      total,
      pages: Math.ceil(total / limit),
    };
  }
}

export default BusinessService;
