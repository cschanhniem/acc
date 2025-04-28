export type SubscriptionTier = 'free' | 'basic' | 'pro' | 'enterprise';

export interface SubscriptionLimits {
  monthlyContracts: number;
  maxFileSize: number; // in bytes
  features: {
    batchAnalysis: boolean;
    priorityQueue: boolean;
    exportFormats: string[];
    aiModel: 'gpt-3.5-turbo' | 'gpt-4';
  };
}

export interface SubscriptionPlan {
  tier: SubscriptionTier;
  name: string;
  description: string;
  price: number; // in cents
  limits: SubscriptionLimits;
}

export const SUBSCRIPTION_PLANS: Record<SubscriptionTier, SubscriptionPlan> = {
  free: {
    tier: 'free',
    name: 'Free',
    description: 'Basic contract analysis for individuals',
    price: 0,
    limits: {
      monthlyContracts: 3,
      maxFileSize: 5 * 1024 * 1024, // 5MB
      features: {
        batchAnalysis: false,
        priorityQueue: false,
        exportFormats: ['pdf'],
        aiModel: 'gpt-3.5-turbo',
      },
    },
  },
  basic: {
    tier: 'basic',
    name: 'Basic',
    description: 'Perfect for freelancers and small businesses',
    price: 2900, // $29/month
    limits: {
      monthlyContracts: 25,
      maxFileSize: 10 * 1024 * 1024, // 10MB
      features: {
        batchAnalysis: false,
        priorityQueue: false,
        exportFormats: ['pdf', 'docx'],
        aiModel: 'gpt-3.5-turbo',
      },
    },
  },
  pro: {
    tier: 'pro',
    name: 'Professional',
    description: 'Advanced features for growing businesses',
    price: 9900, // $99/month
    limits: {
      monthlyContracts: 100,
      maxFileSize: 25 * 1024 * 1024, // 25MB
      features: {
        batchAnalysis: true,
        priorityQueue: true,
        exportFormats: ['pdf', 'docx', 'xlsx'],
        aiModel: 'gpt-4',
      },
    },
  },
  enterprise: {
    tier: 'enterprise',
    name: 'Enterprise',
    description: 'Custom solutions for large organizations',
    price: 49900, // $499/month
    limits: {
      monthlyContracts: 1000,
      maxFileSize: 100 * 1024 * 1024, // 100MB
      features: {
        batchAnalysis: true,
        priorityQueue: true,
        exportFormats: ['pdf', 'docx', 'xlsx', 'json'],
        aiModel: 'gpt-4',
      },
    },
  },
} as const;

export interface SubscriptionQuota {
  used: number;
  limit: number;
  resetDate: string;
}

export interface SubscriptionStatus {
  tier: SubscriptionTier;
  active: boolean;
  expiresAt: string | null;
  quota: SubscriptionQuota;
}

// Helper type for feature keys
export type FeatureKey = keyof typeof SUBSCRIPTION_PLANS[SubscriptionTier]['limits']['features'];
