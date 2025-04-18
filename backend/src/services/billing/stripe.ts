
import Stripe from 'stripe';
import { Types } from 'mongoose';
import BusinessModel from '../../models/Business';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || '';
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';

// Initialize Stripe
const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

export class StripeService {
  /**
   * Create or retrieve a Stripe customer for a business
   */
  static async getOrCreateCustomer(businessId: string): Promise<string> {
    const business = await BusinessModel.findById(businessId);
    if (!business) {
      throw new Error('Business not found');
    }

    // Check if business already has a customer ID
    if (business.settings?.stripeCustomerId) {
      return business.settings.stripeCustomerId;
    }

    // Create a new customer
    const customer = await stripe.customers.create({
      email: business.contact.email,
      name: business.name,
      metadata: {
        businessId: businessId,
      },
    });

    // Update business with customer ID
    await BusinessModel.findByIdAndUpdate(businessId, {
      'settings.stripeCustomerId': customer.id,
    });

    return customer.id;
  }

  /**
   * Create or update a subscription for a business
   */
  static async createOrUpdateSubscription(
    businessId: string,
    planId: string
  ): Promise<{ subscriptionId: string; clientSecret: string }> {
    const customerId = await this.getOrCreateCustomer(businessId);

    // Check for existing subscription
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'active',
    });

    let subscription;
    if (subscriptions.data.length > 0) {
      // Update existing subscription
      subscription = await stripe.subscriptions.update(
        subscriptions.data[0].id,
        { items: [{ price: planId }] }
      );
    } else {
      // Create new subscription
      subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: planId }],
        payment_behavior: 'default_incomplete',
        expand: ['latest_invoice.payment_intent'],
      });
    }

    // Update business with subscription details
    await BusinessModel.findByIdAndUpdate(businessId, {
      'settings.stripeSubscriptionId': subscription.id,
      'settings.planId': planId,
      'settings.billingStatus': 'active',
    });

    // Get client secret for frontend
    const invoice = subscription.latest_invoice as Stripe.Invoice;
    const paymentIntent = invoice.payment_intent as Stripe.PaymentIntent;
    
    return {
      subscriptionId: subscription.id,
      clientSecret: paymentIntent.client_secret || ''
    };
  }

  /**
   * Cancel a subscription
   */
  static async cancelSubscription(businessId: string): Promise<void> {
    const business = await BusinessModel.findById(businessId);
    if (!business || !business.settings?.stripeSubscriptionId) {
      throw new Error('No active subscription found');
    }

    await stripe.subscriptions.update(
      business.settings.stripeSubscriptionId,
      { cancel_at_period_end: true }
    );

    await BusinessModel.findByIdAndUpdate(businessId, {
      'settings.billingStatus': 'canceling',
    });
  }

  /**
   * Handle webhook events from Stripe
   */
  static async handleWebhook(
    signature: string,
    rawBody: string
  ): Promise<{ status: string; businessId?: string }> {
    try {
      const event = stripe.webhooks.constructEvent(
        rawBody,
        signature,
        STRIPE_WEBHOOK_SECRET
      );

      let businessId: string | undefined;
      let subscription: Stripe.Subscription;
      let subscriptionStatus: string = 'active';

      switch (event.type) {
        case 'invoice.paid':
          const invoice = event.data.object as Stripe.Invoice;
          subscription = await stripe.subscriptions.retrieve(
            invoice.subscription as string
          );
          businessId = await this.getBusinessIdFromSubscription(subscription);
          break;

        case 'invoice.payment_failed':
          const failedInvoice = event.data.object as Stripe.Invoice;
          subscription = await stripe.subscriptions.retrieve(
            failedInvoice.subscription as string
          );
          businessId = await this.getBusinessIdFromSubscription(subscription);
          subscriptionStatus = 'past_due';
          break;

        case 'customer.subscription.deleted':
          subscription = event.data.object as Stripe.Subscription;
          businessId = await this.getBusinessIdFromSubscription(subscription);
          subscriptionStatus = 'canceled';
          break;
      }

      // Update business billing status
      if (businessId) {
        await BusinessModel.findByIdAndUpdate(businessId, {
          'settings.billingStatus': subscriptionStatus,
        });
      }

      return { status: 'success', businessId };
    } catch (error: any) {
      console.error('Webhook error:', error.message);
      return { status: 'error' };
    }
  }

  /**
   * Retrieve business ID from a Stripe subscription
   */
  private static async getBusinessIdFromSubscription(
    subscription: Stripe.Subscription
  ): Promise<string> {
    const customer = await stripe.customers.retrieve(
      subscription.customer as string
    );
    
    if (customer.deleted) {
      throw new Error('Customer has been deleted');
    }
    
    return customer.metadata.businessId;
  }

  /**
   * Get subscription details for a business
   */
  static async getSubscriptionDetails(businessId: string): Promise<{
    status: string;
    planId: string;
    currentPeriodEnd: number;
    cancelAtPeriodEnd: boolean;
  }> {
    const business = await BusinessModel.findById(businessId);
    if (!business || !business.settings?.stripeSubscriptionId) {
      throw new Error('No active subscription found');
    }

    const subscription = await stripe.subscriptions.retrieve(
      business.settings.stripeSubscriptionId
    );

    return {
      status: subscription.status,
      planId: subscription.items.data[0].price.id,
      currentPeriodEnd: subscription.current_period_end,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    };
  }

  /**
   * Get available plans
   */
  static async getPlans(): Promise<Array<{
    id: string;
    name: string;
    description: string;
    price: number;
    tokens: number;
  }>> {
    const prices = await stripe.prices.list({
      active: true,
      expand: ['data.product'],
    });

    return prices.data.map(price => {
      const product = price.product as Stripe.Product;
      return {
        id: price.id,
        name: product.name,
        description: product.description || '',
        price: price.unit_amount ? price.unit_amount / 100 : 0,
        tokens: parseInt(product.metadata.tokens || '0'),
      };
    });
  }
}

export default StripeService;
