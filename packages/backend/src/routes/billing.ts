import { Hono } from 'hono';
import type { Context } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { StripeService } from '../services/stripe';
import { UserModel } from '../models/users';
import { 
  SUBSCRIPTION_PLANS, 
  SubscriptionTier,
  ApiErrorResponse 
} from '@aicontractcheck/shared';

type AppBindings = { Bindings: Env };
const billing = new Hono<AppBindings>();

const PRICE_IDS: Record<SubscriptionTier, string> = {
  free: '',
  basic: 'price_basic',
  pro: 'price_pro',
  enterprise: 'price_enterprise'
};

const createError = <T extends ApiErrorResponse>(error: T) => error;

const subscribeSchema = z.object({
  tier: z.enum(['basic', 'pro', 'enterprise'] as const),
});

// Create a subscription
billing.post('/subscribe', zValidator('json', subscribeSchema), async (c: Context<AppBindings>) => {
  const userId = c.get('userId');
  if (!userId) {
    return c.json(createError({
      error: 'Authentication required',
      code: 'AUTH_REQUIRED'
    }), 401);
  }

  try {
    const { tier } = await c.req.json();
    const stripe = new StripeService(c.env.STRIPE_SECRET_KEY);
    const users = new UserModel(c.env.DB);

    // Get or create customer
    const user = await users.findById(userId);
    if (!user.success || !user.data) {
      return c.json(createError({
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      }), 404);
    }

    let stripeCustomerId = user.data.stripe_customer_id;
    if (!stripeCustomerId) {
      stripeCustomerId = await stripe.createCustomer(user.data.email, user.data.name);
      await users.updateStripeCustomerId(userId, stripeCustomerId);
    }

    // Create subscription
    const subscription = await stripe.createSubscription(
      stripeCustomerId,
      PRICE_IDS[tier],
      tier
    );

    return c.json({
      clientSecret: (subscription.latest_invoice as any).payment_intent.client_secret,
      subscriptionId: subscription.id,
    });
  } catch (error) {
    console.error('Error creating subscription:', error);
    return c.json(createError({
      error: 'Failed to create subscription',
      code: 'SUBSCRIPTION_ERROR'
    }), 500);
  }
});

// Cancel subscription
billing.post('/cancel', async (c: Context<AppBindings>) => {
  const userId = c.get('userId');
  if (!userId) {
    return c.json(createError({
      error: 'Authentication required',
      code: 'AUTH_REQUIRED'
    }), 401);
  }

  try {
    const users = new UserModel(c.env.DB);
    const user = await users.findById(userId);
    if (!user.success || !user.data || !user.data.stripe_subscription_id) {
      return c.json(createError({
        error: 'No active subscription found',
        code: 'SUBSCRIPTION_ERROR'
      }), 404);
    }

    const stripe = new StripeService(c.env.STRIPE_SECRET_KEY);
    await stripe.cancelSubscription(user.data.stripe_subscription_id);

    await users.updateSubscription(userId, 'free', null);

    return c.json({ message: 'Subscription cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    return c.json(createError({
      error: 'Failed to cancel subscription',
      code: 'SUBSCRIPTION_ERROR'
    }), 500);
  }
});

// Get billing portal URL
billing.post('/portal', async (c: Context<AppBindings>) => {
  const userId = c.get('userId');
  if (!userId) {
    return c.json(createError({
      error: 'Authentication required',
      code: 'AUTH_REQUIRED'
    }), 401);
  }

  try {
    const users = new UserModel(c.env.DB);
    const user = await users.findById(userId);
    if (!user.success || !user.data || !user.data.stripe_customer_id) {
      return c.json(createError({
        error: 'Customer not found',
        code: 'USER_NOT_FOUND'
      }), 404);
    }

    const stripe = new StripeService(c.env.STRIPE_SECRET_KEY);
    const session = await stripe.createBillingPortalSession(
      user.data.stripe_customer_id,
      c.env.FRONTEND_URL + '/settings'
    );

    return c.json({ url: session.url });
  } catch (error) {
    console.error('Error creating billing portal session:', error);
    return c.json(createError({
      error: 'Failed to create billing portal session',
      code: 'SUBSCRIPTION_ERROR'
    }), 500);
  }
});

// Webhook handler
billing.post('/webhook', async (c: Context<AppBindings>) => {
  const signature = c.req.header('stripe-signature');
  if (!signature) {
    return c.json(createError({
      error: 'Missing signature',
      code: 'AUTH_REQUIRED'
    }), 400);
  }

  try {
    const stripe = new StripeService(c.env.STRIPE_SECRET_KEY);
    const event = await stripe.handleWebhook(
      await c.req.text(),
      signature,
      c.env.STRIPE_WEBHOOK_SECRET
    );

    const users = new UserModel(c.env.DB);

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as any;
        const customer = await stripe.getCustomer(subscription.customer as string);
        const user = await users.findByEmail(customer.email);

        if (user.success && user.data) {
          await users.updateSubscription(
            user.data.id,
            subscription.metadata.tierLevel as SubscriptionTier,
            new Date(subscription.current_period_end * 1000).toISOString()
          );
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as any;
        const customer = await stripe.getCustomer(subscription.customer as string);
        const user = await users.findByEmail(customer.email);

        if (user.success && user.data) {
          await users.updateSubscription(user.data.id, 'free', null);
        }
        break;
      }
    }

    return c.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return c.json(createError({
      error: 'Failed to process webhook',
      code: 'SUBSCRIPTION_ERROR'
    }), 500);
  }
});

export { billing };
