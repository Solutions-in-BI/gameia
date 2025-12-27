import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

interface GameConfig {
  id: string;
  game_type: string;
  display_name: string;
  xp_base_reward: number;
  xp_multiplier: number;
  coins_base_reward: number;
  coins_multiplier: number;
  skill_categories: string[];
  difficulty_multipliers: any;
  streak_bonus_config: any;
}

interface RewardResult {
  xp: number;
  coins: number;
  skills: Record<string, number>;
  bonuses: { type: string; amount: number }[];
}

export function useGameRewards() {
  const { user } = useAuth();

  // Calculate rewards based on game config and performance
  const calculateRewards = useCallback(async (
    gameType: string,
    baseScore: number,
    difficulty?: string,
    streakDays?: number,
    bonusMultiplier?: number
  ): Promise<RewardResult | null> => {
    try {
      // Get game configuration
      const { data: config, error } = await supabase
        .from('game_configurations')
        .select('*')
        .eq('game_type', gameType)
        .eq('is_active', true)
        .maybeSingle();

      if (error) throw error;

      if (!config) {
        // Fallback defaults if no config found
        return {
          xp: Math.round(baseScore * 0.1),
          coins: Math.round(baseScore * 0.05),
          skills: {},
          bonuses: []
        };
      }

      const gameConfig = config as GameConfig;
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
      if (streakDays && gameConfig.streak_bonus_config?.enabled) {
        const streakBonus = Math.min(
          streakDays * (gameConfig.streak_bonus_config.bonus_per_day || 5),
          gameConfig.streak_bonus_config.max_bonus || 50
        );
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
      const xp = Math.round((gameConfig.xp_base_reward + baseScore * scoreMultiplier) * xpMultiplier);
      const coins = Math.round((gameConfig.coins_base_reward + baseScore * 0.05) * coinsMultiplier);

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
  }, []);

  // Apply rewards to user account
  const applyRewards = useCallback(async (
    gameType: string,
    rewards: RewardResult,
    sourceId?: string
  ) => {
    if (!user) return false;

    try {
      // Update user_stats
      const { data: currentStats, error: statsError } = await supabase
        .from('user_stats')
        .select('xp, coins, level')
        .eq('user_id', user.id)
        .single();

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

      const leveledUp = newLevel > (currentStats?.level || 1);

      // Update or insert user stats
      const { error: updateError } = await supabase
        .from('user_stats')
        .upsert({
          user_id: user.id,
          xp: newXP,
          coins: newCoins,
          level: newLevel,
          total_games_played: (currentStats as any)?.total_games_played + 1 || 1,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

      if (updateError) throw updateError;

      // Record XP transaction
      await supabase.from('reward_transactions').insert({
        user_id: user.id,
        transaction_type: 'xp',
        source_type: gameType,
        source_id: sourceId,
        amount: rewards.xp,
        metadata: { bonuses: rewards.bonuses }
      });

      // Record coins transaction
      await supabase.from('reward_transactions').insert({
        user_id: user.id,
        transaction_type: 'coins',
        source_type: gameType,
        source_id: sourceId,
        amount: rewards.coins,
        metadata: {}
      });

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
          const newLevel = Math.floor(newTotalXP / 100);

          await supabase.from('user_skill_levels').upsert({
            user_id: user.id,
            skill_id: skillConfig.id,
            current_level: newLevel,
            current_xp: newTotalXP % 100,
            total_xp: newTotalXP,
            last_practiced: new Date().toISOString()
          }, { onConflict: 'user_id,skill_id' });
        }
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
  }, [user]);

  return {
    calculateRewards,
    applyRewards
  };
}
