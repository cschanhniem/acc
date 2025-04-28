import Stripe from 'stripe';
import { SUBSCRIPTION_PLANS, SubscriptionTier } from '@aicontractcheck/shared';

export class StripeService {
  private stripe: Stripe;

  constructor(apiKey: string) {
    this.stripe = new Stripe(apiKey, {
      apiVersion: '2023-10-16',
      typescript: true,
    });
  }

  async createCustomer(email: string, name: string): Promise<string> {
    const customer = await this.stripe.customers.create({
      email,
      name,
      metadata: {
        tierLevel: 'free'
      }
    });
    return customer.id;
  }

  async createSubscription(
    customerId: string, 
    priceId: string,
    tier: SubscriptionTier
  ): Promise<Stripe.Subscription> {
    return await this.stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      metadata: {
        tierLevel: tier
      },
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
    });
  }

  async cancelSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    return await this.stripe.subscriptions.cancel(subscriptionId);
  }

  async updateSubscription(
    subscriptionId: string,
    priceId: string,
    tier: SubscriptionTier
  ): Promise<Stripe.Subscription> {
    const subscription = await this.stripe.subscriptions.retrieve(subscriptionId);
    
    return await this.stripe.subscriptions.update(subscriptionId, {
      items: [{
        id: subscription.items.data[0].id,
        price: priceId,
      }],
      metadata: {
        tierLevel: tier
      },
      proration_behavior: 'create_prorations',
    });
  }

  async getUpcomingInvoice(
    customerId: string,
    subscriptionId?: string,
    newPriceId?: string
  ): Promise<Stripe.Invoice> {
    const params: Stripe.InvoiceRetrieveUpcomingParams = {
      customer: customerId,
    };

    if (subscriptionId && newPriceId) {
      const subscription = await this.stripe.subscriptions.retrieve(subscriptionId);
      params.subscription = subscriptionId;
      params.subscription_items = [{
        id: subscription.items.data[0].id,
        price: newPriceId,
      }];
    }

    return await this.stripe.invoices.retrieveUpcoming(params);
  }

  async handleWebhook(
    body: string,
    signature: string,
    webhookSecret: string
  ): Promise<Stripe.Event> {
    try {
      return this.stripe.webhooks.constructEvent(
        body,
        signature,
        webhookSecret
      );
    } catch (err) {
      console.error('Error verifying webhook signature:', err);
      throw new Error('Invalid webhook signature');
    }
  }

  async getSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    return await this.stripe.subscriptions.retrieve(subscriptionId);
  }

  async getCustomer(customerId: string): Promise<Stripe.Customer> {
    return await this.stripe.customers.retrieve(customerId) as Stripe.Customer;
  }

  async updateCustomer(
    customerId: string,
    data: Partial<Stripe.CustomerUpdateParams>
  ): Promise<Stripe.Customer> {
    return await this.stripe.customers.update(customerId, data);
  }

  async createBillingPortalSession(
    customerId: string,
    returnUrl: string
  ): Promise<Stripe.BillingPortal.Session> {
    return await this.stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });
  }
}
