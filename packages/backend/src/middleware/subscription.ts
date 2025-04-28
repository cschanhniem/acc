import type { Context } from 'hono';
import { SubscriptionModel } from '../models/subscriptions';
import { 
  SUBSCRIPTION_PLANS, 
  SubscriptionTier,
  ApiErrorResponse, 
  ApiError 
} from '@aicontractcheck/shared';

type AppBindings = { Bindings: Env };

type HandlerResponse = Response | void;
type NextFunction = () => Promise<HandlerResponse> | HandlerResponse;

const createError = <T extends ApiErrorResponse>(error: T) => error;

export const subscriptionCheck = async (c: Context<AppBindings>, next: NextFunction) => {
  try {
    const userId = c.get('userId');
    if (!userId) {
      return c.json(createError({
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      }), 401);
    }

    const subscriptions = new SubscriptionModel(c.env.DB);

    // Check if subscription is valid
    const validationResult = await subscriptions.validateSubscription(userId);
    if (!validationResult.success) {
      return c.json(createError({
        error: 'Failed to validate subscription',
        code: 'SUBSCRIPTION_ERROR'
      }), 500);
    }

    if (!validationResult.data) {
      return c.json(createError({
        error: 'Your subscription has expired',
        code: 'SUBSCRIPTION_EXPIRED'
      }), 403);
    }

    // Check quota
    const withinQuota = await subscriptions.checkQuota(userId);
    if (!withinQuota) {
      return c.json(createError({
        error: 'Monthly usage quota exceeded',
        code: 'QUOTA_EXCEEDED'
      }), 403);
    }

    return next();
  } catch (error) {
    console.error('Error checking subscription:', error);
    return c.json(createError({
      error: 'Failed to validate subscription status',
      code: 'SUBSCRIPTION_ERROR'
    }), 500);
  }
};

export const requireFeature = (feature: keyof typeof SUBSCRIPTION_PLANS[SubscriptionTier]['limits']['features']) => {
  return async (c: Context<AppBindings>, next: NextFunction) => {
    try {
      const userId = c.get('userId');
      if (!userId) {
        return c.json(createError({
          error: 'Authentication required',
          code: 'AUTH_REQUIRED'
        }), 401);
      }

      const subscriptions = new SubscriptionModel(c.env.DB);
      const featuresResult = await subscriptions.getPlanFeatures(userId);

      if (!featuresResult.success || !featuresResult.data) {
        return c.json(createError({
          error: 'Failed to validate feature access',
          code: 'FEATURE_ERROR'
        }), 500);
      }

      if (!featuresResult.data[feature]) {
        return c.json(createError({
          error: 'This feature is not available in your current plan',
          code: 'FEATURE_UNAVAILABLE',
          requiredFeature: feature
        }), 403);
      }

      return next();
    } catch (error) {
      console.error('Error checking feature access:', error);
      return c.json(createError({
        error: 'Failed to validate feature access',
        code: 'FEATURE_ERROR'
      }), 500);
    }
  };
};

export const checkFileSize = (fileSize: number) => {
  return async (c: Context<AppBindings>, next: NextFunction) => {
    try {
      const userId = c.get('userId');
      if (!userId) {
        return c.json(createError({
          error: 'Authentication required',
          code: 'AUTH_REQUIRED'
        }), 401);
      }

      const user = await c.env.DB.prepare(
        'SELECT subscription_tier FROM users WHERE id = ?'
      ).bind(userId).first<{ subscription_tier: SubscriptionTier }>();

      if (!user) {
        return c.json(createError({
          error: 'User not found',
          code: 'USER_NOT_FOUND'
        }), 404);
      }

      const maxFileSize = SUBSCRIPTION_PLANS[user.subscription_tier].limits.maxFileSize;
      if (fileSize > maxFileSize) {
        return c.json(createError({
          error: 'File size exceeds plan limit',
          code: 'FILE_SIZE_LIMIT',
          maxSize: maxFileSize,
          currentSize: fileSize,
          allowedPlan: Object.entries(SUBSCRIPTION_PLANS)
            .find(([_, plan]) => plan.limits.maxFileSize >= fileSize)?.[0]
        }), 413);
      }

      return next();
    } catch (error) {
      console.error('Error checking file size limit:', error);
      return c.json(createError({
        error: 'Failed to validate file size',
        code: 'FILE_SIZE_ERROR'
      }), 500);
    }
  };
};
