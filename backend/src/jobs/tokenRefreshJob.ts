
import cron from 'node-cron';
import { MongoClient } from 'mongodb';
import { decrypt } from '../lib/crypto';

/**
 * Job to check for expiring OAuth tokens and mark them for refresh
 */
export const startTokenRefreshJob = () => {
  // Run daily at 2 AM
  cron.schedule('0 2 * * *', async () => {
    console.log('Running token refresh check job...');
    
    try {
      const client = new MongoClient(process.env.MONGODB_URI as string);
      await client.connect();
      
      const db = client.db();
      const businessCollection = db.collection('businesses');
      
      // Find businesses with Meta tokens expiring in the next 15 days
      const fifteenDaysFromNow = new Date();
      fifteenDaysFromNow.setDate(fifteenDaysFromNow.getDate() + 15);
      
      const expiringTokens = await businessCollection.find({
        'integrations.adPlatforms.facebook.expiresAt': { $lt: fifteenDaysFromNow.toISOString() },
        'integrations.adPlatforms.facebook.isConnected': true,
        'integrations.adPlatforms.facebook.needsReauth': false
      }).toArray();
      
      console.log(`Found ${expiringTokens.length} businesses with expiring Meta tokens`);
      
      // Mark tokens as needing reauth
      const updatePromises = expiringTokens.map(business => 
        businessCollection.updateOne(
          { _id: business._id },
          { 
            $set: { 
              'integrations.adPlatforms.facebook.needsReauth': true 
            }
          }
        )
      );
      
      await Promise.all(updatePromises);
      
      // TODO: Send in-app notifications
      
      await client.close();
      console.log('Token refresh check job completed');
    } catch (error) {
      console.error('Error in token refresh job:', error);
    }
  });
};
