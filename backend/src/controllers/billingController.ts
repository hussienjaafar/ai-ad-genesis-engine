
import { Request, Response } from 'express';
import { Types } from 'mongoose';
import UsageService from '../services/usageService';
import StripeService from '../services/billing/stripe';
import BusinessModel from '../models/Business';
import { subDays } from 'date-fns';

export class BillingController {
  /**
   * Get billing details for a business
   */
  static async getBillingDetails(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      if (!Types.ObjectId.isValid(id)) {
        res.status(400).json({ error: 'Invalid business ID' });
        return;
      }

      // Get current usage
      const usageData = await UsageService.getMonthlyUsage(id);

      // Get subscription details
      let subscriptionData = null;
      try {
        subscriptionData = await StripeService.getSubscriptionDetails(id);
      } catch (error) {
        // No active subscription, fall back to default values
        subscriptionData = {
          status: 'none',
          planId: 'free',
          currentPeriodEnd: 0,
          cancelAtPeriodEnd: false
        };
      }

      // Get business settings
      const business = await BusinessModel.findById(id, 'settings.billingStatus settings.planId settings.quotaTokens');

      const result = {
        usage: usageData,
        subscription: {
          ...subscriptionData,
          billingStatus: business?.settings?.billingStatus || 'none',
          planName: business?.settings?.planId || 'Free Tier'
        }
      };

      res.status(200).json(result);
    } catch (error: any) {
      console.error('Error getting billing details:', error);
      res.status(500).json({ error: error.message || 'Error retrieving billing information' });
    }
  }

  /**
   * Subscribe a business to a plan
   */
  static async subscribe(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { planId } = req.body;
      
      if (!planId) {
        res.status(400).json({ error: 'Plan ID is required' });
        return;
      }

      if (!Types.ObjectId.isValid(id)) {
        res.status(400).json({ error: 'Invalid business ID' });
        return;
      }

      // Create or update subscription
      const subscriptionResult = await StripeService.createOrUpdateSubscription(id, planId);

      // Get plan details to update business quota
      const plans = await StripeService.getPlans();
      const selectedPlan = plans.find(plan => plan.id === planId);

      if (selectedPlan) {
        await BusinessModel.findByIdAndUpdate(id, {
          'settings.quotaTokens': selectedPlan.tokens,
          'settings.planName': selectedPlan.name
        });
      }

      res.status(200).json(subscriptionResult);
    } catch (error: any) {
      console.error('Error subscribing to plan:', error);
      res.status(500).json({ error: error.message || 'Error processing subscription' });
    }
  }

  /**
   * Cancel a business subscription
   */
  static async cancelSubscription(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      if (!Types.ObjectId.isValid(id)) {
        res.status(400).json({ error: 'Invalid business ID' });
        return;
      }

      await StripeService.cancelSubscription(id);
      res.status(200).json({ status: 'subscription_canceled' });
    } catch (error: any) {
      console.error('Error canceling subscription:', error);
      res.status(500).json({ error: error.message || 'Error canceling subscription' });
    }
  }

  /**
   * Get usage history for a business
   */
  static async getUsageHistory(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const days = parseInt(req.query.days as string) || 30;
      
      if (!Types.ObjectId.isValid(id)) {
        res.status(400).json({ error: 'Invalid business ID' });
        return;
      }

      const startDate = subDays(new Date(), days);
      const endDate = new Date();

      const usageHistory = await UsageService.getUsage(id, startDate, endDate);
      res.status(200).json(usageHistory);
    } catch (error: any) {
      console.error('Error getting usage history:', error);
      res.status(500).json({ error: error.message || 'Error retrieving usage history' });
    }
  }

  /**
   * Get available plans
   */
  static async getAvailablePlans(req: Request, res: Response): Promise<void> {
    try {
      const plans = await StripeService.getPlans();
      res.status(200).json(plans);
    } catch (error: any) {
      console.error('Error getting available plans:', error);
      res.status(500).json({ error: error.message || 'Error retrieving plans' });
    }
  }

  /**
   * Handle Stripe webhooks
   */
  static async handleWebhook(req: Request, res: Response): Promise<void> {
    try {
      const signature = req.headers['stripe-signature'] as string;
      
      if (!signature) {
        res.status(400).json({ error: 'Missing Stripe signature' });
        return;
      }

      const result = await StripeService.handleWebhook(signature, req.body);
      res.status(200).json(result);
    } catch (error: any) {
      console.error('Webhook error:', error);
      res.status(400).json({ error: error.message || 'Webhook processing failed' });
    }
  }
}

export default BillingController;
