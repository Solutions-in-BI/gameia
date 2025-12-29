/**
 * Hook para gerenciar recompensas de jogos
 * Conectado ao backend para persistir XP, coins, atividades e streaks
 */

import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useOrganization } from "./useOrganization";
import { useGamificationEvents } from "./useGamificationEvents";
import { toast } from "sonner";

interface GameConfig {
  id: string;
  game_type: string;
  display_name: string;
  xp_base_reward: number | null;
  xp_multiplier: number | null;
  coins_base_reward: number | null;
  coins_multiplier: number | null;
  skill_categories: string[] | null;
  difficulty_multipliers: Record<string, number> | null;
  streak_bonus_config: Record<string, unknown> | null;
}

interface RewardResult {
  xp: number;
  coins: number;
  skills: Record<string, number>;
  bonuses: { type: string; amount: number }[];
}

interface GameResult {
  gameType: string;
  score: number;
  difficulty?: string;
  timeSpentSeconds?: number;
  metadata?: Record<string, unknown>;
}

export function useGameRewards() {
  const { user } = useAuth();
  const { currentOrg } = useOrganization();
  const { trackGameCompleted, trackQuizCompleted } = useGamificationEvents();

  /**
   * Calculate rewards based on game config and performance
   */
  const calculateRewards = useCallback(async (
    gameType: string,
    baseScore: number,
    difficulty?: string,
    streakDays?: number,
    bonusMultiplier?: number
  ): Promise<RewardResult | null> => {
    try {
      // Get game configuration (org-specific or global)
      const { data: configs, error } = await supabase
        .from('game_configurations')
        .select('*')
        .eq('game_type', gameType)
        .eq('is_active', true)
        .or(`organization_id.is.null,organization_id.eq.${currentOrg?.id || 'null'}`);

      if (error) throw error;

      // Prefer org-specific config
      const config = configs?.find(c => c.organization_id === currentOrg?.id) 
        || configs?.find(c => !c.organization_id);

      if (!config) {
        // Fallback defaults if no config found
        return {
          xp: Math.round(baseScore * 0.1),
          coins: Math.round(baseScore * 0.05),
          skills: {},
          bonuses: []
        };
      }

      const gameConfig = config as unknown as GameConfig;
      let xpMultiplier = gameConfig.xp_multiplier || 1;
      let coinsMultiplier = gameConfig.coins_multiplier || 1;
      const bonuses: { type: string; amount: number }[] = [];

      // Apply difficulty multiplier
      if (difficulty && gameConfig.difficulty_multipliers) {
        const diffMult = gameConfig.difficulty_multipliers[difficulty] || 1;
        xpMultiplier *= diffMult;
        coinsMultiplier *= diffMult;
        if (diffMult > 1) {
          bonuses.push({ type: 'difficulty', amount: Math.round((diffMult - 1) * 100) });
        }
      }

      // Apply streak bonus
      const streakConfig = gameConfig.streak_bonus_config as { enabled?: boolean; bonus_per_day?: number; max_bonus?: number } | null;
      if (streakDays && streakDays > 0 && streakConfig?.enabled) {
        const bonusPerDay = Number(streakConfig.bonus_per_day) || 5;
        const maxBonus = Number(streakConfig.max_bonus) || 50;
        const streakBonus = Math.min(streakDays * bonusPerDay, maxBonus);
        xpMultiplier *= (1 + streakBonus / 100);
        if (streakBonus > 0) {
          bonuses.push({ type: 'streak', amount: streakBonus });
        }
      }

      // Apply custom bonus multiplier
      if (bonusMultiplier && bonusMultiplier > 1) {
        xpMultiplier *= bonusMultiplier;
        coinsMultiplier *= bonusMultiplier;
      }

      // Calculate final rewards
      const scoreMultiplier = Math.max(0.1, Math.log10(baseScore + 1) / 2);
      const baseXp = (gameConfig.xp_base_reward || 10);
      const baseCoins = (gameConfig.coins_base_reward || 5);
      const xp = Math.round((baseXp + baseScore * scoreMultiplier) * xpMultiplier);
      const coins = Math.round((baseCoins + baseScore * 0.05) * coinsMultiplier);

      // Calculate skill points
      const skills: Record<string, number> = {};
      if (gameConfig.skill_categories) {
        gameConfig.skill_categories.forEach(skill => {
          skills[skill] = Math.round(xp * 0.1);
        });
      }

      return { xp, coins, skills, bonuses };
    } catch (error) {
      console.error('Error calculating rewards:', error);
      return null;
    }
  }, [currentOrg?.id]);

  /**
   * Get current user streak
   */
  const getCurrentStreak = useCallback(async (): Promise<number> => {
    if (!user) return 0;

    try {
      const { data, error } = await supabase
        .from('user_streaks')
        .select('current_streak')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data?.current_streak || 0;
    } catch (error) {
      console.error('Error getting streak:', error);
      return 0;
    }
  }, [user]);

  /**
   * Update user streak after activity
   */
  const updateStreak = useCallback(async (): Promise<number> => {
    if (!user) return 0;

    try {
      const today = new Date().toISOString().split('T')[0];

      // Get current streak data
      const { data: streak, error: fetchError } = await supabase
        .from('user_streaks')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

      const lastPlayed = streak?.last_played_at 
        ? new Date(streak.last_played_at).toISOString().split('T')[0]
        : null;

      let newStreak = 1;
      let longestStreak = streak?.longest_streak || 1;

      if (lastPlayed) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        if (lastPlayed === today) {
          // Already played today, keep current streak
          newStreak = streak?.current_streak || 1;
        } else if (lastPlayed === yesterdayStr) {
          // Played yesterday, increment streak
          newStreak = (streak?.current_streak || 0) + 1;
        }
        // Otherwise, streak resets to 1
      }

      longestStreak = Math.max(longestStreak, newStreak);

      const { error: upsertError } = await supabase
        .from('user_streaks')
        .upsert({
          user_id: user.id,
          organization_id: currentOrg?.id || null,
          current_streak: newStreak,
          longest_streak: longestStreak,
          last_played_at: new Date().toISOString(),
          total_active_days: (streak?.total_active_days || 0) + (lastPlayed === today ? 0 : 1),
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

      if (upsertError) throw upsertError;

      return newStreak;
    } catch (error) {
      console.error('Error updating streak:', error);
      return 0;
    }
  }, [user, currentOrg?.id]);

  /**
   * Register activity in the log
   */
  const logActivity = useCallback(async (
    activityType: string,
    gameType: string,
    xpEarned: number,
    coinsEarned: number,
    metadata?: Record<string, unknown>
  ): Promise<void> => {
    if (!user) return;

    try {
      await supabase.from('user_activity_log').insert([{
        user_id: user.id,
        organization_id: currentOrg?.id || null,
        activity_type: activityType,
        game_type: gameType,
        xp_earned: xpEarned,
        coins_earned: coinsEarned,
        metadata: (metadata || {}) as unknown as Record<string, never>
      }]);
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  }, [user, currentOrg?.id]);

  /**
   * Apply rewards to user account
   */
  const applyRewards = useCallback(async (
    gameType: string,
    rewards: RewardResult,
    sourceId?: string
  ): Promise<boolean> => {
    if (!user) return false;

    try {
      // Get current stats
      const { data: currentStats, error: statsError } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (statsError && statsError.code !== 'PGRST116') throw statsError;

      const newXP = (currentStats?.xp || 0) + rewards.xp;
      const newCoins = (currentStats?.coins || 0) + rewards.coins;

      // Calculate new level
      const { data: levelConfigs } = await supabase
        .from('level_configurations')
        .select('level, xp_required')
        .order('level', { ascending: false });

      let newLevel = 1;
      if (levelConfigs) {
        for (const config of levelConfigs) {
          if (newXP >= config.xp_required) {
            newLevel = config.level;
            break;
          }
        }
      }

      const currentLevel = currentStats?.level || 1;
      const leveledUp = newLevel > currentLevel;

      // Update game-specific stats
      const gameStats: Record<string, unknown> = {};
      const gameKey = gameType.toLowerCase();
      
      if (gameKey === 'snake') {
        gameStats.snake_games_played = (currentStats?.snake_games_played || 0) + 1;
      } else if (gameKey === 'memory') {
        gameStats.memory_games_played = (currentStats?.memory_games_played || 0) + 1;
      } else if (gameKey === 'dino') {
        gameStats.dino_games_played = (currentStats?.dino_games_played || 0) + 1;
      } else if (gameKey === 'tetris') {
        gameStats.tetris_games_played = (currentStats?.tetris_games_played || 0) + 1;
      }

      // Upsert user stats
      const { error: updateError } = await supabase
        .from('user_stats')
        .upsert({
          user_id: user.id,
          xp: newXP,
          coins: newCoins,
          level: newLevel,
          total_games_played: (currentStats?.total_games_played || 0) + 1,
          ...gameStats,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

      if (updateError) throw updateError;

      // Record XP transaction
      await supabase.from('reward_transactions').insert({
        user_id: user.id,
        transaction_type: 'xp',
        source_type: gameType,
        source_id: sourceId || null,
        amount: rewards.xp,
        metadata: { bonuses: rewards.bonuses }
      });

      // Record coins transaction
      if (rewards.coins > 0) {
        await supabase.from('reward_transactions').insert({
          user_id: user.id,
          transaction_type: 'coins',
          source_type: gameType,
          source_id: sourceId || null,
          amount: rewards.coins,
          metadata: {}
        });
      }

      // Update skills
      for (const [skillKey, xpGained] of Object.entries(rewards.skills)) {
        const { data: skillConfig } = await supabase
          .from('skill_configurations')
          .select('id')
          .eq('skill_key', skillKey)
          .maybeSingle();

        if (skillConfig) {
          const { data: existingSkill } = await supabase
            .from('user_skill_levels')
            .select('*')
            .eq('user_id', user.id)
            .eq('skill_id', skillConfig.id)
            .maybeSingle();

          const newTotalXP = (existingSkill?.total_xp || 0) + xpGained;
          const newSkillLevel = Math.floor(newTotalXP / 100);

          await supabase.from('user_skill_levels').upsert({
            user_id: user.id,
            skill_id: skillConfig.id,
            organization_id: currentOrg?.id || null,
            current_level: newSkillLevel,
            current_xp: newTotalXP % 100,
            total_xp: newTotalXP,
            is_unlocked: true,
            last_practiced: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }, { onConflict: 'user_id,skill_id' });
        }
      }

      // Log activity
      await logActivity('game_played', gameType, rewards.xp, rewards.coins, {
        score: rewards.xp,
        bonuses: rewards.bonuses
      });

      // Update streak
      await updateStreak();

      // Track gamification event for missions/insignias
      if (gameType === 'quiz') {
        await trackQuizCompleted(rewards.xp, rewards.coins, 0, 0);
      } else {
        await trackGameCompleted(gameType, rewards.xp, rewards.coins);
      }

      // Show reward toast
      toast.success(`+${rewards.xp} XP | +${rewards.coins} 🪙`, {
        description: rewards.bonuses.length > 0 
          ? `Bônus: ${rewards.bonuses.map(b => `${b.type} +${b.amount}%`).join(', ')}`
          : undefined
      });

      if (leveledUp) {
        toast.success(`🎉 Level Up! Você alcançou o nível ${newLevel}!`);
      }

      return true;
    } catch (error) {
      console.error('Error applying rewards:', error);
      toast.error('Erro ao aplicar recompensas');
      return false;
    }
  }, [user, currentOrg?.id, logActivity, updateStreak, trackGameCompleted, trackQuizCompleted]);

  /**
   * Complete game flow: calculate + apply rewards
   */
  const completeGame = useCallback(async (result: GameResult): Promise<RewardResult | null> => {
    if (!user) return null;

    try {
      // Get streak for bonus calculation
      const streak = await getCurrentStreak();

      // Calculate rewards
      const rewards = await calculateRewards(
        result.gameType,
        result.score,
        result.difficulty,
        streak
      );

      if (!rewards) return null;

      // Apply rewards
      const success = await applyRewards(result.gameType, rewards);

      if (!success) return null;

      return rewards;
    } catch (error) {
      console.error('Error completing game:', error);
      return null;
    }
  }, [user, calculateRewards, applyRewards, getCurrentStreak]);

  return {
    calculateRewards,
    applyRewards,
    completeGame,
    getCurrentStreak,
    updateStreak,
    logActivity
  };
}
