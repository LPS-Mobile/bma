// src/hooks/useSubscription.ts
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export type SubscriptionTier = 'free_trial' | 'builder' | 'live_trader' | 'automation_pro';

export interface Subscription {
  id: string;
  user_id: string;
  tier: SubscriptionTier;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionLimits {
  maxBots: number;
  maxIndicators: number;
  hasBacktesting: boolean;
  canExport: boolean;
  canLiveDeploy: boolean;
  canUseAdvancedPlatforms: boolean;
  maxLicenses: number;
}

const TIER_LIMITS: Record<SubscriptionTier, SubscriptionLimits> = {
  free_trial: {
    maxBots: 1,
    maxIndicators: 2,
    hasBacktesting: true, // Sandbox only
    canExport: false,
    canLiveDeploy: false,
    canUseAdvancedPlatforms: false,
    maxLicenses: 0,
  },
  builder: {
    maxBots: -1, // Unlimited
    maxIndicators: -1,
    hasBacktesting: true,
    canExport: true,
    canLiveDeploy: false,
    canUseAdvancedPlatforms: false,
    maxLicenses: 5,
  },
  live_trader: {
    maxBots: -1,
    maxIndicators: -1,
    hasBacktesting: true,
    canExport: true,
    canLiveDeploy: true,
    canUseAdvancedPlatforms: false,
    maxLicenses: 20,
  },
  automation_pro: {
    maxBots: -1,
    maxIndicators: -1,
    hasBacktesting: true,
    canExport: true,
    canLiveDeploy: true,
    canUseAdvancedPlatforms: true,
    maxLicenses: -1, // Unlimited
  },
};

/**
 * Hook to fetch user's subscription
 */
export function useSubscription() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      setLoading(true);
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        // No user, set free trial
        setSubscription({
          id: 'temp',
          user_id: 'temp',
          tier: 'free_trial',
          stripe_customer_id: null,
          stripe_subscription_id: null,
          status: 'trialing',
          current_period_start: null,
          current_period_end: null,
          cancel_at_period_end: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        // No subscription found, create free trial
        const { data: newSub, error: createError } = await supabase
          .from('subscriptions')
          .insert({
            user_id: user.id,
            tier: 'free_trial',
            status: 'trialing',
          })
          .select()
          .single();

        if (createError) throw createError;
        setSubscription(newSub);
      } else {
        setSubscription(data);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to fetch subscription'
      );
    } finally {
      setLoading(false);
    }
  };

  const refresh = () => fetchSubscription();

  const limits = subscription ? TIER_LIMITS[subscription.tier] : TIER_LIMITS.free_trial;

  return { subscription, limits, loading, error, refresh };
}

/**
 * Hook for subscription limit checks
 */
export function useSubscriptionLimits() {
  const { subscription, limits, loading } = useSubscription();

  const canCreateBot = async (): Promise<boolean> => {
    if (limits.maxBots === -1) return true; // Unlimited

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return false;

    const { count } = await supabase
      .from('bots')
      .select('id', { count: 'exact' })
      .eq('user_id', user.id);

    return (count || 0) < limits.maxBots;
  };

  const canExport = (): boolean => {
    return limits.canExport;
  };

  const canLiveDeploy = (): boolean => {
    return limits.canLiveDeploy;
  };

  const canCreateLicense = async (botId: string): Promise<boolean> => {
    if (limits.maxLicenses === -1) return true; // Unlimited
    if (limits.maxLicenses === 0) return false; // No licenses allowed

    const supabase = createClient();

    const { count } = await supabase
      .from('licenses')
      .select('id', { count: 'exact' })
      .eq('bot_id', botId)
      .eq('is_active', true);

    return (count || 0) < limits.maxLicenses;
  };

  const getRemainingBots = async (): Promise<number | null> => {
    if (limits.maxBots === -1) return null; // Unlimited

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return 0;

    const { count } = await supabase
      .from('bots')
      .select('id', { count: 'exact' })
      .eq('user_id', user.id);

    return limits.maxBots - (count || 0);
  };

  return {
    subscription,
    limits,
    loading,
    canCreateBot,
    canExport,
    canLiveDeploy,
    canCreateLicense,
    getRemainingBots,
  };
}

/**
 * Get subscription tier display info
 */
export function getTierInfo(tier: SubscriptionTier) {
  const info = {
    free_trial: {
      name: 'Free Trial',
      price: 0,
      color: 'gray',
      badge: '🆓',
    },
    builder: {
      name: 'Builder',
      price: 49,
      color: 'blue',
      badge: '🔨',
    },
    live_trader: {
      name: 'Live Trader',
      price: 99,
      color: 'green',
      badge: '📈',
    },
    automation_pro: {
      name: 'Automation Pro',
      price: 199,
      color: 'purple',
      badge: '⚡',
    },
  };

  return info[tier];
}

/**
 * Get upgrade recommendations based on feature needed
 */
export function getUpgradeRecommendation(
  currentTier: SubscriptionTier,
  feature: 'export' | 'live_deploy' | 'advanced_platforms' | 'more_licenses'
): SubscriptionTier | null {
  const recommendations: Record<string, SubscriptionTier> = {
    export: 'builder',
    live_deploy: 'live_trader',
    advanced_platforms: 'automation_pro',
    more_licenses: 'builder',
  };

  const recommended = recommendations[feature];
  const tiers: SubscriptionTier[] = ['free_trial', 'builder', 'live_trader', 'automation_pro'];
  
  const currentIndex = tiers.indexOf(currentTier);
  const recommendedIndex = tiers.indexOf(recommended);

  // Only recommend if it's an upgrade
  return recommendedIndex > currentIndex ? recommended : null;
}