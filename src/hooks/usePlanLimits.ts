import { useCallback, useMemo } from 'react';
import { useSubscription } from './useSubscription';
import { useOrganization } from './useOrganization';

export interface PlanLimits {
  maxMembers: number;
  maxGames: number;
  hasAnalytics: boolean;
  hasApiAccess: boolean;
  hasSso: boolean;
  hasSalesSimulator: boolean;
  hasAiScenarios: boolean;
  hasCustomBranding: boolean;
}

export interface LimitCheckResult {
  allowed: boolean;
  current: number;
  limit: number;
  percentage: number;
  planName: string;
  upgradeRequired: boolean;
}

export function usePlanLimits() {
  const { currentPlan, subscription, isLoading: subscriptionLoading } = useSubscription();
  const { members, isLoading: orgLoading } = useOrganization();

  const isLoading = subscriptionLoading || orgLoading;

  // Extract limits from current plan
  const limits = useMemo((): PlanLimits => {
    const planLimits = currentPlan?.limits || {};
    const planSlug = currentPlan?.slug || 'free';
    
    return {
      maxMembers: planLimits.max_members ?? 5,
      maxGames: planLimits.max_games ?? 3,
      hasAnalytics: planLimits.analytics ?? false,
      hasApiAccess: planLimits.api_access ?? false,
      hasSso: planLimits.sso ?? false,
      // Feature gates based on plan tier
      hasSalesSimulator: ['starter', 'business', 'enterprise'].includes(planSlug),
      hasAiScenarios: ['business', 'enterprise'].includes(planSlug),
      hasCustomBranding: ['business', 'enterprise'].includes(planSlug),
    };
  }, [currentPlan]);

  // Check if member limit is reached
  const checkMemberLimit = useCallback((): LimitCheckResult => {
    const currentCount = members.length;
    const maxLimit = limits.maxMembers;
    const isUnlimited = maxLimit === -1;
    
    return {
      allowed: isUnlimited || currentCount < maxLimit,
      current: currentCount,
      limit: isUnlimited ? Infinity : maxLimit,
      percentage: isUnlimited ? 0 : Math.min((currentCount / maxLimit) * 100, 100),
      planName: currentPlan?.name || 'Gratuito',
      upgradeRequired: !isUnlimited && currentCount >= maxLimit,
    };
  }, [members.length, limits.maxMembers, currentPlan?.name]);

  // Check if a specific feature is available
  const checkFeature = useCallback((feature: keyof PlanLimits): boolean => {
    return !!limits[feature];
  }, [limits]);

  // Check if user can access a specific game/feature
  const canAccessGame = useCallback((gameType: string): { allowed: boolean; reason?: string } => {
    const premiumGames = ['sales_simulator', 'ai_scenarios', 'decision_advanced'];
    const businessOnlyGames = ['ai_scenarios', 'cold_outreach_advanced'];
    
    if (businessOnlyGames.includes(gameType)) {
      if (!limits.hasAiScenarios) {
        return { 
          allowed: false, 
          reason: 'Este jogo requer o plano Business ou superior' 
        };
      }
    }
    
    if (premiumGames.includes(gameType)) {
      if (!limits.hasSalesSimulator) {
        return { 
          allowed: false, 
          reason: 'Este jogo requer o plano Starter ou superior' 
        };
      }
    }
    
    return { allowed: true };
  }, [limits]);

  // Get plan tier level (for comparison)
  const getPlanTier = useCallback((): number => {
    const tierMap: Record<string, number> = {
      'free': 0,
      'starter': 1,
      'business': 2,
      'enterprise': 3,
    };
    return tierMap[currentPlan?.slug || 'free'] ?? 0;
  }, [currentPlan?.slug]);

  // Check if user has minimum required plan
  const hasMinimumPlan = useCallback((requiredPlan: 'free' | 'starter' | 'business' | 'enterprise'): boolean => {
    const tierMap: Record<string, number> = {
      'free': 0,
      'starter': 1,
      'business': 2,
      'enterprise': 3,
    };
    const currentTier = getPlanTier();
    const requiredTier = tierMap[requiredPlan];
    return currentTier >= requiredTier;
  }, [getPlanTier]);

  // Get usage stats for dashboard
  const getUsageStats = useCallback(() => {
    const memberCheck = checkMemberLimit();
    
    return {
      members: {
        used: memberCheck.current,
        limit: memberCheck.limit === Infinity ? 'Ilimitado' : memberCheck.limit,
        percentage: memberCheck.percentage,
        isNearLimit: memberCheck.percentage >= 80,
        isAtLimit: memberCheck.percentage >= 100,
      },
      features: {
        analytics: limits.hasAnalytics,
        apiAccess: limits.hasApiAccess,
        sso: limits.hasSso,
        salesSimulator: limits.hasSalesSimulator,
        aiScenarios: limits.hasAiScenarios,
        customBranding: limits.hasCustomBranding,
      },
      planName: currentPlan?.name || 'Gratuito',
      planSlug: currentPlan?.slug || 'free',
    };
  }, [checkMemberLimit, limits, currentPlan]);

  return {
    limits,
    isLoading,
    currentPlan,
    subscription,
    checkMemberLimit,
    checkFeature,
    canAccessGame,
    getPlanTier,
    hasMinimumPlan,
    getUsageStats,
  };
}
