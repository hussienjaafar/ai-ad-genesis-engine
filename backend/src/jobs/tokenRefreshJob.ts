
import cron from 'node-cron';
import { MongoClient } from 'mongodb';
import { decrypt } from '../lib/crypto';
import prom from 'prom-client';

// Prometheus metrics
const tokenRefreshJobRuns = new prom.Counter({
  name: 'token_refresh_job_runs_total',
  help: 'Number of times the token refresh job has run',
});

const tokenExpiringCounter = new prom.Counter({
  name: 'token_expiring_total',
  help: 'Number of tokens found expiring soon',
  labelValues: ['platform'],
});

/**
 * Job to check for expiring OAuth tokens and mark them for refresh
 */
export const startTokenRefreshJob = () => {
  // Run daily at 2 AM
  cron.schedule('0 2 * * *', async () => {
    console.log('Running token refresh check job...');
    tokenRefreshJobRuns.inc();
    
    try {
      const client = new MongoClient(process.env.MONGODB_URI as string);
      await client.connect();
      
      const db = client.db();
      const businessCollection = db.collection('businesses');
      
      // Find businesses with Meta tokens expiring in the next 7 days
      // Changed from 15 days to 7 days as per requirement
      const sevenDaysFromNow = new Date();
      sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
      
      const expiringTokens = await businessCollection.find({
        'integrations.adPlatforms.facebook.expiresAt': { $lt: sevenDaysFromNow.toISOString() },
        'integrations.adPlatforms.facebook.isConnected': true,
        'integrations.adPlatforms.facebook.needsReauth': false
      }).toArray();
      
      console.log(`Found ${expiringTokens.length} businesses with expiring Meta tokens`);
      
      if (expiringTokens.length > 0) {
        tokenExpiringCounter.inc({ platform: 'facebook' }, expiringTokens.length);
      }
      
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
      // We could use a notification service here
      
      await client.close();
      console.log('Token refresh check job completed');
    } catch (error) {
      console.error('Error in token refresh job:', error);
    }
  });
};
