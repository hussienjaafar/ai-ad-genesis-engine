
import dotenv from 'dotenv';
dotenv.config();

import { connectToDatabase } from '../lib/mongoose';
import UserModel from '../models/User';
import BusinessModel from '../models/Business';

const seedAdminUser = async () => {
  try {
    await connectToDatabase();
    console.log('Connected to MongoDB for seeding');

    // Check if admin already exists
    const existingAdmin = await UserModel.findOne({ email: 'admin@example.com' });
    
    if (existingAdmin) {
      console.log('Admin user already exists, skipping...');
    } else {
      // Create admin user
      const adminUser = new UserModel({
        email: 'admin@example.com',
        passwordHash: 'Pass123!',  // Will be hashed by pre-save hook
        role: 'admin',
      });
      
      await adminUser.save();
      console.log('Admin user created successfully');
    }

    // Seed a sample business
    const existingBusiness = await BusinessModel.findOne({ name: 'Demo Business' });
    
    if (existingBusiness) {
      console.log('Demo business already exists, skipping...');
    } else {
      const demoBusiness = new BusinessModel({
        name: 'Demo Business',
        businessType: 'retail',
        description: 'A demo business for testing purposes',
        contact: {
          email: 'demo@example.com',
          phone: '555-123-4567',
        },
        status: 'active',
        onboardingStep: 3,
        offerings: ['Product A', 'Service B', 'Consultation'],
        brandVoice: {
          tone: 'Professional',
          style: 'Informative',
        },
      });
      
      await demoBusiness.save();
      console.log('Demo business created successfully');
    }

    console.log('Seeding completed');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedAdminUser();
