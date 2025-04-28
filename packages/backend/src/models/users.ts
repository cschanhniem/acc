import { D1Database } from '@cloudflare/workers-types';
import { nanoid } from 'nanoid';
import { User, QueryResult } from './types';

export class UserModel {
  constructor(private db: D1Database) {}

  async create(user: Omit<User, 'id' | 'created_at'>): QueryResult<User> {
    const id = nanoid();
    try {
      await this.db.prepare(`
        INSERT INTO users (
          id, email, name, password_hash, subscription_tier, subscription_ends_at,
          stripe_customer_id, stripe_subscription_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        id,
        user.email,
        user.name,
        user.password_hash, // Added password_hash
        user.subscription_tier,
        user.subscription_ends_at,
        user.stripe_customer_id,
        user.stripe_subscription_id
      ).run();

      const result = await this.findById(id);
      return result;
    } catch (error) {
      console.error('Error creating user:', error);
      return { success: false, error: 'Failed to create user' };
    }
  }

  async findById(id: string): QueryResult<User> {
    try {
      const result = await this.db.prepare(
        'SELECT * FROM users WHERE id = ?'
      ).bind(id).first<User>();

      if (!result) {
        return { success: false, error: 'User not found' };
      }

      return { success: true, data: result };
    } catch (error) {
      console.error('Error finding user:', error);
      return { success: false, error: 'Failed to find user' };
    }
  }

  async findByEmail(email: string): QueryResult<User> {
    try {
      const result = await this.db.prepare(
        'SELECT * FROM users WHERE email = ?'
      ).bind(email).first<User>();

      if (!result) {
        return { success: false, error: 'User not found' };
      }

      return { success: true, data: result };
    } catch (error) {
      console.error('Error finding user:', error);
      return { success: false, error: 'Failed to find user' };
    }
  }

  async updateSubscription(
    id: string, 
    tier: User['subscription_tier'], 
    expiresAt: string | null,
    stripeSubscriptionId?: string,
  ): QueryResult<User> {
    try {
      await this.db.prepare(`
        UPDATE users 
        SET subscription_tier = ?, 
            subscription_ends_at = ?,
            stripe_subscription_id = ?
        WHERE id = ?
      `).bind(tier, expiresAt, stripeSubscriptionId, id).run();

      return this.findById(id);
    } catch (error) {
      console.error('Error updating subscription:', error);
      return { success: false, error: 'Failed to update subscription' };
    }
  }

  async updateStripeCustomerId(id: string, customerId: string): QueryResult<User> {
    try {
      await this.db.prepare(`
        UPDATE users 
        SET stripe_customer_id = ?
        WHERE id = ?
      `).bind(customerId, id).run();

      return this.findById(id);
    } catch (error) {
      console.error('Error updating Stripe customer ID:', error);
      return { success: false, error: 'Failed to update Stripe customer ID' };
    }
  }

  async listExpiredSubscriptions(): Promise<User[]> {
    try {
      const results = await this.db.prepare(`
        SELECT * FROM users 
        WHERE subscription_tier != 'free' 
        AND subscription_ends_at < datetime('now')
      `).all<User>();

      return results.results;
    } catch (error) {
      console.error('Error listing expired subscriptions:', error);
      return [];
    }
  }

  async getUsageStats(userId: string, startDate: string): QueryResult<{ count: number }> {
    try {
      const result = await this.db.prepare(`
        SELECT COUNT(*) as count 
        FROM contracts 
        WHERE user_id = ? 
        AND uploaded_at >= ?
      `).bind(userId, startDate).first<{ count: number }>();

      if (!result) {
        return { success: false, error: 'Failed to get usage stats' };
      }

      return { success: true, data: result };
    } catch (error) {
      console.error('Error getting usage stats:', error);
      return { success: false, error: 'Failed to get usage stats' };
    }
  }
}
