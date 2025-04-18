
import cron from 'node-cron';
import { MongoClient } from 'mongodb';
import { decrypt } from '../lib/crypto';
import alertService from '../services/alertService';
import prom from 'prom-client';

// Prometheus metrics
const tokenMonitorJobRuns = new prom.Counter({
  name: 'token_monitor_job_runs_total',
  help: 'Number of times the token monitor job has run',
});

const tokenExpiringCounter = new prom.Counter({
  name: 'token_expiring_soon_total',
  help: 'Number of tokens found expiring within threshold window',
  labelValues: ['platform', 'days_left'],
});

/**
 * Job to check for expiring OAuth tokens and alert about them
 * Now checks 10 days before expiration (instead of 7) as per new requirements
 */
export const startTokenMonitorJob = () => {
  // Run daily at 2 AM
  cron.schedule('0 2 * * *', async () => {
    console.log('Running token expiry monitor job...');
    tokenMonitorJobRuns.inc();
    
    try {
      const client = new MongoClient(process.env.MONGODB_URI as string);
      await client.connect();
      
      const db = client.db();
      const businessCollection = db.collection('businesses');
      
      // Find businesses with Meta tokens expiring in the next 10 days
      const tenDaysFromNow = new Date();
      tenDaysFromNow.setDate(tenDaysFromNow.getDate() + 10);
      
      const expiringTokens = await businessCollection.find({
        'integrations.adPlatforms.facebook.expiresAt': { $lt: tenDaysFromNow.toISOString() },
        'integrations.adPlatforms.facebook.isConnected': true,
        'integrations.adPlatforms.facebook.needsReauth': false
      }).toArray();
      
      console.log(`Found ${expiringTokens.length} businesses with expiring Meta tokens`);
      
      if (expiringTokens.length > 0) {
        tokenExpiringCounter.inc({ platform: 'facebook', days_left: '10' }, expiringTokens.length);
      }
      
      // Mark tokens as needing reauth
      const updatePromises = expiringTokens.map(async business => {
        // Calculate days until expiration for the alert
        const expiryDate = new Date(business.integrations.adPlatforms.facebook.expiresAt);
        const now = new Date();
        const daysLeft = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 3600 * 24));
        
        // Send alert for each expiring token
        await alertService.send({
          level: 'warning',
          message: `Meta token expiring in ${daysLeft} days for business ${business.name}`,
          source: 'tokenMonitor',
          businessId: business._id.toString(),
          details: {
            accountId: business.integrations.adPlatforms.facebook.accountId,
            accountName: business.integrations.adPlatforms.facebook.accountName,
            daysUntilExpiry: daysLeft,
            expiryDate: business.integrations.adPlatforms.facebook.expiresAt
          }
        });
        
        // Update the business record
        return businessCollection.updateOne(
          { _id: business._id },
          { 
            $set: { 
              'integrations.adPlatforms.facebook.needsReauth': true 
            }
          }
        );
      });
      
      await Promise.all(updatePromises);
      
      await client.close();
      console.log('Token expiry monitor job completed');
    } catch (error) {
      console.error('Error in token expiry monitor job:', error);
    }
  });
};
