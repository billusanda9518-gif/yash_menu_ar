'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { PLANS, type PlanLimits } from '@/lib/constants';
import type { Subscription, SubscriptionPlan } from '@/lib/types';

interface UseSubscriptionReturn {
  subscription: Subscription | null;
  plan: SubscriptionPlan;
  limits: PlanLimits;
  loading: boolean;
  isFreePlan: boolean;
  isProPlan: boolean;
  isEnterprisePlan: boolean;
  canCreateRestaurant: (currentCount: number) => boolean;
  canCreateDish: (currentCount: number) => boolean;
  refresh: () => Promise<void>;
}

export function useSubscription(): UseSubscriptionReturn {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  // Memoize the Supabase client so it's stable across renders
  const supabase = useMemo(() => createClient(), []);

  const fetchSubscription = useCallback(async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setSubscription(null);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching subscription:', error.message);
        setSubscription(null);
      } else {
        setSubscription(data as Subscription);
      }
    } catch (err) {
      console.error('Failed to fetch subscription:', err);
      setSubscription(null);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  const plan: SubscriptionPlan = subscription?.plan ?? 'free';
  const limits = PLANS[plan];

  const isFreePlan = plan === 'free';
  const isProPlan = plan === 'pro';
  const isEnterprisePlan = plan === 'enterprise';

  const canCreateRestaurant = useCallback(
    (currentCount: number) => currentCount < limits.max_restaurants,
    [limits.max_restaurants],
  );

  const canCreateDish = useCallback(
    (currentCount: number) => currentCount < limits.max_dishes,
    [limits.max_dishes],
  );

  return {
    subscription,
    plan,
    limits,
    loading,
    isFreePlan,
    isProPlan,
    isEnterprisePlan,
    canCreateRestaurant,
    canCreateDish,
    refresh: fetchSubscription,
  };
}
