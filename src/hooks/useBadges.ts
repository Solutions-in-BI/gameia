import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

interface BadgeCategory {
  id: string;
  category_key: string;
  name: string;
  description: string | null;
  icon: string;
  color: string;
  display_order: number;
}

interface Badge {
  id: string;
  badge_key: string;
  category_id: string;
  name: string;
  description: string | null;
  icon: string;
  rarity: string;
  xp_reward: number;
  coins_reward: number;
  is_secret: boolean;
  category?: BadgeCategory;
}

interface BadgeRequirement {
  id: string;
  badge_id: string;
  requirement_type: string;
  requirement_key: string;
  requirement_operator: string;
  requirement_value: any;
  is_required: boolean;
}

interface UserBadge {
  id: string;
  badge_id: string;
  unlocked_at: string;
  is_displayed: boolean;
  badge?: Badge;
}

interface UserStats {
  coins: number;
  xp: number;
  level: number;
  total_games_played: number;
}

interface UserStreak {
  current_streak: number;
  longest_streak: number;
}

export function useBadges() {
  const { user, profile } = useAuth();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [categories, setCategories] = useState<BadgeCategory[]>([]);
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch all badges and categories
  useEffect(() => {
    const fetchBadgeData = async () => {
      setIsLoading(true);
      try {
        const [categoriesRes, badgesRes, userBadgesRes] = await Promise.all([
          supabase.from('badge_categories').select('*').order('display_order'),
          supabase.from('badges').select('*').eq('is_active', true),
          user ? supabase.from('user_badges').select('*').eq('user_id', user.id) : Promise.resolve({ data: [] })
        ]);

        if (categoriesRes.error) throw categoriesRes.error;
        if (badgesRes.error) throw badgesRes.error;

        setCategories(categoriesRes.data || []);
        setBadges(badgesRes.data || []);
        setUserBadges((userBadgesRes as any).data || []);
      } catch (error) {
        console.error('Error fetching badge data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBadgeData();
  }, [user]);

  // Check if user meets badge requirements
  const checkBadgeRequirements = useCallback(async (badgeId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      // Get requirements for this badge
      const { data: requirements, error } = await supabase
        .from('badge_requirements')
        .select('*')
        .eq('badge_id', badgeId);

      if (error) throw error;
      if (!requirements || requirements.length === 0) return false;

      // Get user data for checking
      const [statsRes, streakRes, friendsRes] = await Promise.all([
        supabase.from('user_stats').select('*').eq('user_id', user.id).maybeSingle(),
        supabase.from('user_streaks').select('*').eq('user_id', user.id).maybeSingle(),
        supabase.from('friendships').select('id').or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`).eq('status', 'accepted')
      ]);

      const stats: UserStats = statsRes.data || { coins: 0, xp: 0, level: 1, total_games_played: 0 };
      const streak: UserStreak = streakRes.data || { current_streak: 0, longest_streak: 0 };
      const friendsCount = friendsRes.data?.length || 0;
      
      // Calculate days since registration
      const daysSinceReg = profile?.created_at 
        ? Math.floor((Date.now() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24))
        : 0;

      // Check each requirement
      for (const req of requirements as BadgeRequirement[]) {
        let currentValue: number | string | null = null;

        // Get the current value based on requirement type and key
        switch (req.requirement_type) {
          case 'time':
            if (req.requirement_key === 'days_since_registration') {
              currentValue = daysSinceReg;
            }
            break;
          case 'stats':
            currentValue = (stats as any)[req.requirement_key] ?? 0;
            break;
          case 'streak':
            currentValue = (streak as any)[req.requirement_key] ?? 0;
            break;
          case 'social':
            if (req.requirement_key === 'friends_count') {
              currentValue = friendsCount;
            }
            break;
        }

        if (currentValue === null) continue;

        // Check if requirement is met based on operator
        const targetValue = typeof req.requirement_value === 'object' 
          ? Number(req.requirement_value) 
          : Number(req.requirement_value);

        let isMet = false;
        switch (req.requirement_operator) {
          case '>=':
            isMet = Number(currentValue) >= targetValue;
            break;
          case '>':
            isMet = Number(currentValue) > targetValue;
            break;
          case '<=':
            isMet = Number(currentValue) <= targetValue;
            break;
          case '<':
            isMet = Number(currentValue) < targetValue;
            break;
          case '=':
            isMet = currentValue === targetValue;
            break;
        }

        if (req.is_required && !isMet) {
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Error checking badge requirements:', error);
      return false;
    }
  }, [user, profile]);

  // Unlock a badge for the user
  const unlockBadge = useCallback(async (badgeId: string): Promise<boolean> => {
    if (!user) return false;

    // Check if already unlocked
    if (userBadges.some(ub => ub.badge_id === badgeId)) {
      return false;
    }

    try {
      const { error } = await supabase.from('user_badges').insert({
        user_id: user.id,
        badge_id: badgeId
      });

      if (error) throw error;

      // Get badge details for toast
      const badge = badges.find(b => b.id === badgeId);
      if (badge) {
        toast.success(`🏆 Nova Insígnia Desbloqueada!`, {
          description: `${badge.icon} ${badge.name}`
        });

        // Apply badge rewards
        if (badge.xp_reward > 0 || badge.coins_reward > 0) {
          const { data: stats } = await supabase
            .from('user_stats')
            .select('xp, coins')
            .eq('user_id', user.id)
            .single();

          await supabase.from('user_stats').upsert({
            user_id: user.id,
            xp: (stats?.xp || 0) + badge.xp_reward,
            coins: (stats?.coins || 0) + badge.coins_reward,
            updated_at: new Date().toISOString()
          }, { onConflict: 'user_id' });

          // Record transactions
          if (badge.xp_reward > 0) {
            await supabase.from('reward_transactions').insert({
              user_id: user.id,
              transaction_type: 'xp',
              source_type: 'badge',
              source_id: badgeId,
              amount: badge.xp_reward
            });
          }
          if (badge.coins_reward > 0) {
            await supabase.from('reward_transactions').insert({
              user_id: user.id,
              transaction_type: 'coins',
              source_type: 'badge',
              source_id: badgeId,
              amount: badge.coins_reward
            });
          }
        }
      }

      // Update local state
      setUserBadges(prev => [...prev, { 
        id: crypto.randomUUID(), 
        badge_id: badgeId, 
        unlocked_at: new Date().toISOString(),
        is_displayed: false 
      }]);

      return true;
    } catch (error) {
      console.error('Error unlocking badge:', error);
      return false;
    }
  }, [user, userBadges, badges]);

  // Check and unlock eligible badges
  const checkAndUnlockBadges = useCallback(async () => {
    if (!user) return;

    for (const badge of badges) {
      // Skip if already unlocked
      if (userBadges.some(ub => ub.badge_id === badge.id)) continue;

      // Check requirements
      const isMet = await checkBadgeRequirements(badge.id);
      if (isMet) {
        await unlockBadge(badge.id);
      }
    }
  }, [user, badges, userBadges, checkBadgeRequirements, unlockBadge]);

  // Get badges by category
  const getBadgesByCategory = useCallback((categoryKey: string): Badge[] => {
    const category = categories.find(c => c.category_key === categoryKey);
    if (!category) return [];
    return badges.filter(b => b.category_id === category.id);
  }, [badges, categories]);

  // Check if badge is unlocked
  const isBadgeUnlocked = useCallback((badgeId: string): boolean => {
    return userBadges.some(ub => ub.badge_id === badgeId);
  }, [userBadges]);

  // Get rarity color - using centralized color system
  const getRarityColor = useCallback((rarity: string): string => {
    switch (rarity) {
      case 'common': return 'text-muted-foreground border-border/30 bg-muted/10';
      case 'uncommon': return 'text-gameia-success border-gameia-success/30 bg-gameia-success/10';
      case 'rare': return 'text-gameia-info border-gameia-info/30 bg-gameia-info/10';
      case 'epic': return 'text-secondary-foreground border-secondary/30 bg-secondary/10';
      case 'legendary': return 'text-primary border-primary/30 bg-primary/10';
      default: return 'text-muted-foreground border-border/30 bg-muted/10';
    }
  }, []);

  return {
    badges,
    categories,
    userBadges,
    isLoading,
    checkBadgeRequirements,
    unlockBadge,
    checkAndUnlockBadges,
    getBadgesByCategory,
    isBadgeUnlocked,
    getRarityColor
  };
}
