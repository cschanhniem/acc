import { D1Database } from '@cloudflare/workers-types';
import { nanoid } from 'nanoid';
import { User, QueryResult } from './types';
import { SUBSCRIPTION_PLANS, SubscriptionQuota, SubscriptionTier } from '@aicontractcheck/shared';

export class SubscriptionModel {
  constructor(private db: D1Database) {}

  async getQuota(userId: string): QueryResult<SubscriptionQuota> {
    try {
      // Get user subscription info
      const user = await this.db.prepare(
        'SELECT subscription_tier, subscription_ends_at FROM users WHERE id = ?'
      ).bind(userId).first<User>();

      if (!user) {
        return { success: false, error: 'User not found' };
      }

      // Get usage for current month
      const today = new Date();
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      
      const usage = await this.db.prepare(`
        SELECT COUNT(*) as count 
        FROM contracts 
        WHERE user_id = ? 
        AND uploaded_at >= ?
      `).bind(userId, firstDayOfMonth.toISOString()).first<{ count: number }>();

      // Get plan limits
      const plan = SUBSCRIPTION_PLANS[user.subscription_tier as SubscriptionTier];
      
      // Calculate next reset date
      const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);

      return {
        success: true,
        data: {
          used: usage?.count || 0,
          limit: plan.limits.monthlyContracts,
          resetDate: nextMonth.toISOString(),
        },
      };
    } catch (error) {
      console.error('Error getting quota:', error);
      return { success: false, error: 'Failed to get quota' };
    }
  }

  async checkQuota(userId: string): Promise<boolean> {
    const quotaResult = await this.getQuota(userId);
    if (!quotaResult.success) {
      return false;
    }

    return quotaResult.data.used < quotaResult.data.limit;
  }

  async validateSubscription(userId: string): QueryResult<boolean> {
    try {
      const user = await this.db.prepare(`
        SELECT subscription_tier, subscription_ends_at 
        FROM users 
        WHERE id = ?
      `).bind(userId).first<User>();

      if (!user) {
        return { success: false, error: 'User not found' };
      }

      // Free tier is always valid
      if (user.subscription_tier === 'free') {
        return { success: true, data: true };
      }

      // Check if subscription is expired
      if (!user.subscription_ends_at) {
        return { success: true, data: false };
      }

      const expiryDate = new Date(user.subscription_ends_at);
      const isValid = expiryDate > new Date();

      return { success: true, data: isValid };
    } catch (error) {
      console.error('Error validating subscription:', error);
      return { success: false, error: 'Failed to validate subscription' };
    }
  }

  async updateTier(
    userId: string, 
    tier: SubscriptionTier, 
    expiresAt: string | null
  ): QueryResult<User> {
    try {
      await this.db.prepare(`
        UPDATE users 
        SET subscription_tier = ?, subscription_ends_at = ?
        WHERE id = ?
      `).bind(tier, expiresAt, userId).run();

      const user = await this.db.prepare(
        'SELECT * FROM users WHERE id = ?'
      ).bind(userId).first<User>();

      if (!user) {
        return { success: false, error: 'User not found after update' };
      }

      return { success: true, data: user };
    } catch (error) {
      console.error('Error updating subscription tier:', error);
      return { success: false, error: 'Failed to update subscription tier' };
    }
  }

  async getPlanFeatures(userId: string): QueryResult<typeof SUBSCRIPTION_PLANS[SubscriptionTier]['limits']['features']> {
    try {
      const user = await this.db.prepare(
        'SELECT subscription_tier FROM users WHERE id = ?'
      ).bind(userId).first<User>();

      if (!user) {
        return { success: false, error: 'User not found' };
      }

      const plan = SUBSCRIPTION_PLANS[user.subscription_tier as SubscriptionTier];
      return { success: true, data: plan.limits.features };
    } catch (error) {
      console.error('Error getting plan features:', error);
      return { success: false, error: 'Failed to get plan features' };
    }
  }
}
