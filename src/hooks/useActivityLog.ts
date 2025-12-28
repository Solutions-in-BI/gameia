/**
 * Hook para registrar atividades de usuários nos módulos
 */

import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export type ActivityType = 
  | "game_played"
  | "quiz_completed"
  | "decision_made"
  | "sales_session"
  | "badge_earned"
  | "level_up"
  | "streak_recorded"
  | "trail_progress"
  | "training_completed";

export type GameType = 
  | "snake"
  | "dino"
  | "tetris"
  | "memory"
  | "quiz"
  | "decision"
  | "sales"
  | "ai_scenario";

interface LogActivityParams {
  activityType: ActivityType;
  gameType?: GameType;
  xpEarned?: number;
  coinsEarned?: number;
  score?: number;
  metadata?: Record<string, string | number | boolean | null>;
}

export function useActivityLog() {
  const { user } = useAuth();

  const logActivity = useCallback(
    async ({
      activityType,
      gameType,
      xpEarned = 0,
      coinsEarned = 0,
      score = 0,
      metadata = {},
    }: LogActivityParams) => {
      if (!user?.id) return null;

      try {
        const { data, error } = await supabase.rpc("log_user_activity", {
          p_user_id: user.id,
          p_activity_type: activityType,
          p_game_type: gameType || null,
          p_xp_earned: xpEarned,
          p_coins_earned: coinsEarned,
          p_score: score,
          p_metadata: metadata,
        });

        if (error) {
          console.error("Error logging activity:", error);
          return null;
        }

        return data;
      } catch (error) {
        console.error("Error logging activity:", error);
        return null;
      }
    },
    [user?.id]
  );

  const logGamePlayed = useCallback(
    (gameType: GameType, score: number, xpEarned = 0, coinsEarned = 0) => {
      return logActivity({
        activityType: "game_played",
        gameType,
        score,
        xpEarned,
        coinsEarned,
        metadata: { finished_at: new Date().toISOString() },
      });
    },
    [logActivity]
  );

  const logQuizCompleted = useCallback(
    (score: number, correctAnswers: number, totalQuestions: number, xpEarned = 0) => {
      return logActivity({
        activityType: "quiz_completed",
        gameType: "quiz",
        score,
        xpEarned,
        metadata: { correctAnswers, totalQuestions, accuracy: (correctAnswers / totalQuestions) * 100 },
      });
    },
    [logActivity]
  );

  const logDecisionMade = useCallback(
    (score: number, isOptimal: boolean, responseTime: number, xpEarned = 0) => {
      return logActivity({
        activityType: "decision_made",
        gameType: "decision",
        score,
        xpEarned,
        metadata: { isOptimal, responseTime },
      });
    },
    [logActivity]
  );

  const logSalesSession = useCallback(
    (score: number, rapport: number, saleClosed: boolean, xpEarned = 0) => {
      return logActivity({
        activityType: "sales_session",
        gameType: "sales",
        score,
        xpEarned,
        metadata: { rapport, saleClosed },
      });
    },
    [logActivity]
  );

  return {
    logActivity,
    logGamePlayed,
    logQuizCompleted,
    logDecisionMade,
    logSalesSession,
  };
}
