/**
 * useRewardEngine - Motor de recompensas unificado
 * Centraliza cálculo e aplicação de XP/moedas para todas as experiências
 */

import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

// ============ TIPOS ============

export type RewardRuleType = 'fixed' | 'conditional' | 'progressive';
export type RewardMetric = 'accuracy' | 'completion' | 'score' | 'streak' | 'time';
export type SourceType = 'training' | 'cognitive_test' | 'game' | 'challenge' | 'module' | 'quiz';

export interface RewardRule {
  type: RewardRuleType;
  metric?: RewardMetric;
  target?: number; // ex: 0.8 para 80%
  baseReward: { xp: number; coins: number };
  bonusReward?: { xp: number; coins: number };
  failReward?: { xp: number; coins: number };
}

export interface RewardConfig {
  sourceType: SourceType;
  sourceId: string;
  rules: RewardRule[];
  skills?: string[];
  title?: string;
}

export interface PerformanceData {
  score?: number; // 0-100
  accuracy?: number; // 0-1
  completion?: number; // 0-1
  timeSpent?: number; // segundos
  streak?: number;
}

export interface RewardResult {
  xpEarned: number;
  coinsEarned: number;
  targetMet: boolean;
  targetScore?: number;
  performanceScore?: number;
  bonusApplied: boolean;
  message: string;
}

export interface RewardPreview {
  baseXp: number;
  baseCoins: number;
  bonusXp?: number;
  bonusCoins?: number;
  hasCondition: boolean;
  conditionText?: string;
  targetPercent?: number;
}

// ============ CONSTANTES ============

export const DEFAULT_REWARD_RULES: Record<SourceType, RewardRule> = {
  training: {
    type: 'fixed',
    baseReward: { xp: 100, coins: 50 }
  },
  module: {
    type: 'fixed',
    baseReward: { xp: 25, coins: 10 }
  },
  cognitive_test: {
    type: 'conditional',
    metric: 'accuracy',
    target: 0.7,
    baseReward: { xp: 0, coins: 0 },
    bonusReward: { xp: 100, coins: 0 },
    failReward: { xp: 0, coins: 0 }
  },
  game: {
    type: 'progressive',
    metric: 'score',
    baseReward: { xp: 10, coins: 5 }
  },
  challenge: {
    type: 'conditional',
    metric: 'completion',
    target: 1,
    baseReward: { xp: 0, coins: 0 },
    bonusReward: { xp: 200, coins: 100 }
  },
  quiz: {
    type: 'conditional',
    metric: 'accuracy',
    target: 0.6,
    baseReward: { xp: 20, coins: 10 },
    bonusReward: { xp: 50, coins: 25 }
  }
};

// ============ HOOK ============

export function useRewardEngine() {
  const { user } = useAuth();

  /**
   * Calcula recompensa baseada nas regras e performance
   */
  const calculateReward = useCallback((
    config: RewardConfig,
    performance: PerformanceData
  ): RewardResult => {
    let totalXp = 0;
    let totalCoins = 0;
    let targetMet = true;
    let bonusApplied = false;
    let targetScore: number | undefined;
    let performanceScore: number | undefined;

    for (const rule of config.rules) {
      switch (rule.type) {
        case 'fixed':
          totalXp += rule.baseReward.xp;
          totalCoins += rule.baseReward.coins;
          break;

        case 'conditional': {
          const metricValue = getMetricValue(performance, rule.metric);
          performanceScore = metricValue !== undefined ? metricValue * 100 : undefined;
          targetScore = rule.target !== undefined ? rule.target * 100 : undefined;

          if (rule.target !== undefined && metricValue !== undefined) {
            if (metricValue >= rule.target) {
              // Meta atingida
              totalXp += rule.baseReward.xp + (rule.bonusReward?.xp || 0);
              totalCoins += rule.baseReward.coins + (rule.bonusReward?.coins || 0);
              bonusApplied = true;
            } else {
              // Meta não atingida
              targetMet = false;
              totalXp += rule.failReward?.xp || 0;
              totalCoins += rule.failReward?.coins || 0;
            }
          }
          break;
        }

        case 'progressive': {
          const score = performance.score || 0;
          performanceScore = score;
          // Escala progressiva baseada no score
          const multiplier = Math.min(score / 100, 2); // max 2x
          totalXp += Math.round(rule.baseReward.xp * multiplier);
          totalCoins += Math.round(rule.baseReward.coins * multiplier);
          break;
        }
      }
    }

    const message = targetMet 
      ? bonusApplied 
        ? `Parabéns! Meta atingida! +${totalXp} XP${totalCoins > 0 ? ` +${totalCoins} moedas` : ''}`
        : `+${totalXp} XP${totalCoins > 0 ? ` +${totalCoins} moedas` : ''}`
      : `Meta não atingida (${performanceScore?.toFixed(0)}% < ${targetScore?.toFixed(0)}%). Tente novamente!`;

    return {
      xpEarned: totalXp,
      coinsEarned: totalCoins,
      targetMet,
      targetScore,
      performanceScore,
      bonusApplied,
      message
    };
  }, []);

  /**
   * Aplica recompensa ao usuário e registra no histórico
   */
  const applyReward = useCallback(async (
    config: RewardConfig,
    result: RewardResult
  ): Promise<boolean> => {
    if (!user) return false;

    try {
      // Registrar atividade
      if (result.xpEarned > 0 || result.coinsEarned > 0) {
        const { error: statsError } = await supabase.rpc('log_user_activity', {
          p_user_id: user.id,
          p_activity_type: `${config.sourceType}_complete`,
          p_game_type: config.sourceType,
          p_xp_earned: result.xpEarned,
          p_coins_earned: result.coinsEarned,
          p_score: result.performanceScore || 0,
          p_metadata: {
            source_id: config.sourceId,
            target_met: result.targetMet,
            bonus_applied: result.bonusApplied
          }
        });

        if (statsError) {
          console.error('Erro ao registrar atividade:', statsError);
        }

        // Atualizar stats: buscar e atualizar manualmente
        const { data: currentStats } = await supabase
          .from('user_stats')
          .select('xp, coins')
          .eq('user_id', user.id)
          .single();

        if (currentStats) {
          await supabase
            .from('user_stats')
            .update({
              xp: (currentStats.xp || 0) + result.xpEarned,
              coins: (currentStats.coins || 0) + result.coinsEarned
            })
            .eq('user_id', user.id);
        }
      }

      // Registrar no histórico de recompensas
      const { error: historyError } = await supabase
        .from('reward_history')
        .insert({
          user_id: user.id,
          source_type: config.sourceType,
          source_id: config.sourceId,
          xp_earned: result.xpEarned,
          coins_earned: result.coinsEarned,
          performance_score: result.performanceScore,
          target_score: result.targetScore,
          target_met: result.targetMet,
          metadata: {
            title: config.title,
            skills: config.skills,
            bonus_applied: result.bonusApplied
          }
        });

      if (historyError) {
        console.error('Erro ao registrar histórico:', historyError);
      }

      // Registrar evento de gamificação
      await supabase.from('gamification_events').insert({
        user_id: user.id,
        event_type: result.targetMet ? 'reward_earned' : 'reward_missed',
        source_type: config.sourceType,
        source_id: config.sourceId,
        xp_earned: result.xpEarned,
        coins_earned: result.coinsEarned,
        metadata: {
          target_met: result.targetMet,
          performance: result.performanceScore
        }
      });

      return true;
    } catch (error) {
      console.error('Erro ao aplicar recompensa:', error);
      return false;
    }
  }, [user]);

  /**
   * Calcula e aplica recompensa em uma única chamada
   */
  const processReward = useCallback(async (
    config: RewardConfig,
    performance: PerformanceData,
    showToast: boolean = true
  ): Promise<RewardResult | null> => {
    const result = calculateReward(config, performance);
    const success = await applyReward(config, result);

    if (success && showToast) {
      if (result.targetMet && result.xpEarned > 0) {
        toast.success(result.message, {
          icon: result.bonusApplied ? '🎯' : '✨'
        });
      } else if (!result.targetMet) {
        toast.info(result.message, {
          icon: '💪'
        });
      }
    }

    return success ? result : null;
  }, [calculateReward, applyReward]);

  /**
   * Gera preview de recompensa para exibir antes de iniciar
   */
  const getRewardPreview = useCallback((rules: RewardRule[]): RewardPreview => {
    let baseXp = 0;
    let baseCoins = 0;
    let bonusXp = 0;
    let bonusCoins = 0;
    let hasCondition = false;
    let conditionText: string | undefined;
    let targetPercent: number | undefined;

    for (const rule of rules) {
      baseXp += rule.baseReward.xp;
      baseCoins += rule.baseReward.coins;

      if (rule.type === 'conditional' && rule.target !== undefined) {
        hasCondition = true;
        targetPercent = rule.target * 100;
        bonusXp += rule.bonusReward?.xp || 0;
        bonusCoins += rule.bonusReward?.coins || 0;

        const metricLabel = getMetricLabel(rule.metric);
        conditionText = `${metricLabel} ≥ ${targetPercent.toFixed(0)}%`;
      }
    }

    return {
      baseXp,
      baseCoins,
      bonusXp: bonusXp > 0 ? bonusXp : undefined,
      bonusCoins: bonusCoins > 0 ? bonusCoins : undefined,
      hasCondition,
      conditionText,
      targetPercent
    };
  }, []);

  /**
   * Busca histórico de recompensas do usuário
   */
  const getRewardHistory = useCallback(async (
    sourceType?: SourceType,
    limit: number = 20
  ) => {
    if (!user) return [];

    let query = supabase
      .from('reward_history')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (sourceType) {
      query = query.eq('source_type', sourceType);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Erro ao buscar histórico:', error);
      return [];
    }

    return data || [];
  }, [user]);

  return {
    calculateReward,
    applyReward,
    processReward,
    getRewardPreview,
    getRewardHistory,
    DEFAULT_REWARD_RULES
  };
}

// ============ HELPERS ============

function getMetricValue(
  performance: PerformanceData,
  metric?: RewardMetric
): number | undefined {
  if (!metric) return undefined;

  switch (metric) {
    case 'accuracy':
      return performance.accuracy;
    case 'completion':
      return performance.completion;
    case 'score':
      return performance.score !== undefined ? performance.score / 100 : undefined;
    case 'streak':
      return performance.streak !== undefined ? Math.min(performance.streak / 7, 1) : undefined;
    case 'time':
      // Tempo menor = melhor (invertido)
      return performance.timeSpent !== undefined 
        ? Math.max(0, 1 - (performance.timeSpent / 600)) // 10 min = 0%
        : undefined;
    default:
      return undefined;
  }
}

function getMetricLabel(metric?: RewardMetric): string {
  switch (metric) {
    case 'accuracy':
      return 'Acerto';
    case 'completion':
      return 'Conclusão';
    case 'score':
      return 'Score';
    case 'streak':
      return 'Sequência';
    case 'time':
      return 'Tempo';
    default:
      return 'Meta';
  }
}
