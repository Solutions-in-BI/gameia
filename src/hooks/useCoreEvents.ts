/**
 * Hook central para registro de eventos do Gameia
 * Motor de eventos para análise de padrões e automação
 */

import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useOrganization } from "./useOrganization";
import type {
  CoreEventType,
  CoreEventMetadata,
  CreateCoreEventParams,
  CoreEventStats,
  TeamEventStats,
  CORE_EVENT_TYPES,
} from "@/types/coreEvents";

export { CORE_EVENT_TYPES } from "@/types/coreEvents";
export type { CoreEventType, CoreEventMetadata, CoreEventStats, TeamEventStats };

interface UseCoreEventsReturn {
  // Método principal de registro
  recordEvent: (params: CreateCoreEventParams) => Promise<string | null>;
  
  // Métodos específicos por categoria
  recordGameCompleted: (
    gameType: string,
    score: number,
    xpEarned: number,
    coinsEarned: number,
    skillIds?: string[],
    metadata?: CoreEventMetadata
  ) => Promise<string | null>;
  
  recordTrainingCompleted: (
    trainingId: string,
    xpEarned: number,
    coinsEarned: number,
    skillIds?: string[],
    metadata?: CoreEventMetadata
  ) => Promise<string | null>;
  
  recordTestCompleted: (
    testId: string,
    score: number,
    targetScore: number,
    xpEarned: number,
    skillIds?: string[],
    metadata?: CoreEventMetadata
  ) => Promise<string | null>;
  
  recordStreakMaintained: (
    streakDays: number,
    xpEarned: number,
    coinsEarned: number
  ) => Promise<string | null>;
  
  recordStreakBroken: (
    previousStreak: number
  ) => Promise<string | null>;
  
  recordGoalAchieved: (
    goalId: string,
    goalType: string,
    xpEarned: number,
    coinsEarned: number,
    skillIds?: string[]
  ) => Promise<string | null>;
  
  recordGoalFailed: (
    goalId: string,
    goalType: string,
    targetValue: number,
    achievedValue: number
  ) => Promise<string | null>;
  
  recordFeedbackGiven: (
    recipientId: string,
    feedbackType: 'peer' | 'manager' | 'self' | '360',
    xpEarned: number,
    skillIds?: string[]
  ) => Promise<string | null>;
  
  recordFeedbackReceived: (
    evaluatorId: string,
    feedbackType: 'peer' | 'manager' | 'self' | '360',
    assessmentCycleId?: string
  ) => Promise<string | null>;
  
  // Consultas
  getUserEventStats: (days?: number) => Promise<CoreEventStats[]>;
  getTeamEventStats: (teamId: string, days?: number) => Promise<TeamEventStats[]>;
}

export function useCoreEvents(): UseCoreEventsReturn {
  const { user } = useAuth();
  const { currentOrg } = useOrganization();

  /**
   * Registra um evento central
   */
  const recordEvent = useCallback(async ({
    eventType,
    teamId = null,
    skillIds = [],
    xpEarned = 0,
    coinsEarned = 0,
    score = null,
    metadata = {},
  }: CreateCoreEventParams): Promise<string | null> => {
    if (!user?.id) {
      console.warn("[CoreEvents] Usuário não autenticado");
      return null;
    }

    try {
      const { data, error } = await supabase.rpc("record_core_event", {
        p_user_id: user.id,
        p_event_type: eventType,
        p_team_id: teamId,
        p_organization_id: currentOrg?.id || null,
        p_skill_ids: skillIds,
        p_xp_earned: xpEarned,
        p_coins_earned: coinsEarned,
        p_score: score,
        p_metadata: metadata as Record<string, never>,
      });

      if (error) {
        console.error("[CoreEvents] Erro ao registrar evento:", error);
        return null;
      }

      console.log(`[CoreEvents] Evento registrado: ${eventType}`, { 
        eventId: data, 
        xpEarned, 
        coinsEarned 
      });
      
      return data;
    } catch (error) {
      console.error("[CoreEvents] Erro inesperado:", error);
      return null;
    }
  }, [user?.id, currentOrg?.id]);

  /**
   * Registra conclusão de jogo
   */
  const recordGameCompleted = useCallback(async (
    gameType: string,
    score: number,
    xpEarned: number,
    coinsEarned: number,
    skillIds: string[] = [],
    metadata: CoreEventMetadata = {}
  ) => {
    return recordEvent({
      eventType: "JOGO_CONCLUIDO",
      score,
      xpEarned,
      coinsEarned,
      skillIds,
      metadata: {
        ...metadata,
        game_type: gameType,
        finished_at: new Date().toISOString(),
      },
    });
  }, [recordEvent]);

  /**
   * Registra conclusão de treinamento
   */
  const recordTrainingCompleted = useCallback(async (
    trainingId: string,
    xpEarned: number,
    coinsEarned: number,
    skillIds: string[] = [],
    metadata: CoreEventMetadata = {}
  ) => {
    return recordEvent({
      eventType: "TREINAMENTO_CONCLUIDO",
      xpEarned,
      coinsEarned,
      skillIds,
      metadata: {
        ...metadata,
        training_id: trainingId,
        completed_at: new Date().toISOString(),
      },
    });
  }, [recordEvent]);

  /**
   * Registra teste cognitivo realizado
   */
  const recordTestCompleted = useCallback(async (
    testId: string,
    score: number,
    targetScore: number,
    xpEarned: number,
    skillIds: string[] = [],
    metadata: CoreEventMetadata = {}
  ) => {
    const passed = score >= targetScore;
    
    return recordEvent({
      eventType: passed ? "TESTE_REALIZADO" : "TESTE_FALHOU_META",
      score,
      xpEarned: passed ? xpEarned : 0,
      skillIds,
      metadata: {
        ...metadata,
        test_id: testId,
        target_score: targetScore,
        achieved_score: score,
        passed,
      },
    });
  }, [recordEvent]);

  /**
   * Registra streak mantido
   */
  const recordStreakMaintained = useCallback(async (
    streakDays: number,
    xpEarned: number,
    coinsEarned: number
  ) => {
    return recordEvent({
      eventType: "STREAK_MANTIDO",
      xpEarned,
      coinsEarned,
      metadata: {
        streak_days: streakDays,
      },
    });
  }, [recordEvent]);

  /**
   * Registra streak quebrado
   */
  const recordStreakBroken = useCallback(async (previousStreak: number) => {
    return recordEvent({
      eventType: "STREAK_QUEBRADO",
      metadata: {
        previous_streak: previousStreak,
        broken_at: new Date().toISOString(),
      },
    });
  }, [recordEvent]);

  /**
   * Registra meta atingida
   */
  const recordGoalAchieved = useCallback(async (
    goalId: string,
    goalType: string,
    xpEarned: number,
    coinsEarned: number,
    skillIds: string[] = []
  ) => {
    return recordEvent({
      eventType: "META_ATINGIDA",
      xpEarned,
      coinsEarned,
      skillIds,
      metadata: {
        goal_id: goalId,
        goal_type: goalType,
        achieved_at: new Date().toISOString(),
      },
    });
  }, [recordEvent]);

  /**
   * Registra meta não atingida
   */
  const recordGoalFailed = useCallback(async (
    goalId: string,
    goalType: string,
    targetValue: number,
    achievedValue: number
  ) => {
    return recordEvent({
      eventType: "META_FALHOU",
      metadata: {
        goal_id: goalId,
        goal_type: goalType,
        target_value: targetValue,
        achieved_value: achievedValue,
        failed_at: new Date().toISOString(),
      },
    });
  }, [recordEvent]);

  /**
   * Registra feedback dado
   */
  const recordFeedbackGiven = useCallback(async (
    recipientId: string,
    feedbackType: 'peer' | 'manager' | 'self' | '360',
    xpEarned: number,
    skillIds: string[] = []
  ) => {
    return recordEvent({
      eventType: "FEEDBACK_DADO",
      xpEarned,
      skillIds,
      metadata: {
        recipient_id: recipientId,
        feedback_type: feedbackType,
      },
    });
  }, [recordEvent]);

  /**
   * Registra feedback recebido
   */
  const recordFeedbackReceived = useCallback(async (
    evaluatorId: string,
    feedbackType: 'peer' | 'manager' | 'self' | '360',
    assessmentCycleId?: string
  ) => {
    return recordEvent({
      eventType: "FEEDBACK_RECEBIDO",
      metadata: {
        evaluator_id: evaluatorId,
        feedback_type: feedbackType,
        assessment_cycle_id: assessmentCycleId,
      },
    });
  }, [recordEvent]);

  /**
   * Busca estatísticas de eventos do usuário
   */
  const getUserEventStats = useCallback(async (days: number = 30): Promise<CoreEventStats[]> => {
    if (!user?.id) return [];

    try {
      const { data, error } = await supabase.rpc("get_user_event_stats", {
        p_user_id: user.id,
        p_days: days,
      });

      if (error) {
        console.error("[CoreEvents] Erro ao buscar stats:", error);
        return [];
      }

      return (data || []) as CoreEventStats[];
    } catch (error) {
      console.error("[CoreEvents] Erro inesperado:", error);
      return [];
    }
  }, [user?.id]);

  /**
   * Busca estatísticas de eventos da equipe
   */
  const getTeamEventStats = useCallback(async (
    teamId: string,
    days: number = 30
  ): Promise<TeamEventStats[]> => {
    try {
      const { data, error } = await supabase.rpc("get_team_event_stats", {
        p_team_id: teamId,
        p_days: days,
      });

      if (error) {
        console.error("[CoreEvents] Erro ao buscar stats de equipe:", error);
        return [];
      }

      return (data || []) as TeamEventStats[];
    } catch (error) {
      console.error("[CoreEvents] Erro inesperado:", error);
      return [];
    }
  }, []);

  return {
    recordEvent,
    recordGameCompleted,
    recordTrainingCompleted,
    recordTestCompleted,
    recordStreakMaintained,
    recordStreakBroken,
    recordGoalAchieved,
    recordGoalFailed,
    recordFeedbackGiven,
    recordFeedbackReceived,
    getUserEventStats,
    getTeamEventStats,
  };
}
