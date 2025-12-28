import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface SubscriptionPlan {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price_monthly: number;
  price_yearly: number;
  features: string[];
  limits: Record<string, any>;
  is_active: boolean;
  display_order: number;
}

export interface UserSubscription {
  id: string;
  user_id: string;
  plan_id: string;
  organization_id: string | null;
  status: 'active' | 'canceled' | 'expired' | 'trial';
  billing_cycle: 'monthly' | 'yearly';
  started_at: string;
  expires_at: string | null;
  canceled_at: string | null;
  stripe_subscription_id: string | null;
  stripe_customer_id: string | null;
  plan?: SubscriptionPlan;
}

export function useSubscription() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch all available plans
  const { data: plans = [], isLoading: plansLoading } = useQuery({
    queryKey: ['subscription-plans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (error) throw error;
      return data as SubscriptionPlan[];
    },
  });

  // Fetch user's current subscription
  const { data: subscription, isLoading: subscriptionLoading } = useQuery({
    queryKey: ['user-subscription', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from('user_subscriptions')
        .select(`
          *,
          plan:subscription_plans(*)
        `)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle();

      if (error) throw error;
      return data as UserSubscription | null;
    },
    enabled: !!user?.id,
  });

  // Subscribe to a plan (mock - ready for Stripe integration)
  const subscribeMutation = useMutation({
    mutationFn: async ({ planId, billingCycle }: { planId: string; billingCycle: 'monthly' | 'yearly' }) => {
      if (!user?.id) throw new Error('User not authenticated');

      // Cancel any existing subscription first
      if (subscription) {
        await supabase
          .from('user_subscriptions')
          .update({ status: 'canceled', canceled_at: new Date().toISOString() })
          .eq('id', subscription.id);
      }

      // Create new subscription
      const { data, error } = await supabase
        .from('user_subscriptions')
        .insert({
          user_id: user.id,
          plan_id: planId,
          billing_cycle: billingCycle,
          status: 'active',
          expires_at: new Date(Date.now() + (billingCycle === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000).toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-subscription'] });
      toast.success('Assinatura ativada com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao processar assinatura: ' + error.message);
    },
  });

  // Cancel subscription
  const cancelMutation = useMutation({
    mutationFn: async () => {
      if (!subscription) throw new Error('No active subscription');

      const { error } = await supabase
        .from('user_subscriptions')
        .update({ 
          status: 'canceled', 
          canceled_at: new Date().toISOString() 
        })
        .eq('id', subscription.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-subscription'] });
      toast.success('Assinatura cancelada');
    },
    onError: (error) => {
      toast.error('Erro ao cancelar: ' + error.message);
    },
  });

  // Get current plan
  const currentPlan = subscription?.plan || plans.find(p => p.slug === 'free');

  // Check if user has access to a feature
  const hasFeature = (feature: string): boolean => {
    if (!currentPlan) return false;
    return currentPlan.features.includes(feature);
  };

  // Check plan limits
  const checkLimit = (limitKey: string): number => {
    if (!currentPlan?.limits) return 0;
    return currentPlan.limits[limitKey] ?? 0;
  };

  return {
    plans,
    subscription,
    currentPlan,
    isLoading: plansLoading || subscriptionLoading,
    subscribe: subscribeMutation.mutate,
    cancelSubscription: cancelMutation.mutate,
    isSubscribing: subscribeMutation.isPending,
    isCanceling: cancelMutation.isPending,
    hasFeature,
    checkLimit,
  };
}
