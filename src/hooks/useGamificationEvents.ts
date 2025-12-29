/**
 * Hook centralizador para eventos de gamificação
 * Orquestra atualizações de missões diárias e insígnias
 */

import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useOrganization } from "./useOrganization";

export type GamificationEventType = 
  | "game_played"
  | "quiz_completed"
  | "decision_made"
  | "sales_session"
  | "streak_claimed"
  | "feedback_given"
  | "training_completed";

interface TrackEventParams {
  eventType: GamificationEventType;
  gameType?: string;
  xpEarned?: number;
  coinsEarned?: number;
  metadata?: Record<string, unknown>;
}

export function useGamificationEvents() {
  const { user } = useAuth();
  const { currentOrg } = useOrganization();

  /**
   * Track a gamification event and update missions/insignias
   */
  const trackEvent = useCallback(async ({
    eventType,
    gameType,
    xpEarned = 0,
    coinsEarned = 0,
    metadata = {}
  }: TrackEventParams): Promise<void> => {
    if (!user) return;

    try {
      // 1. Insert gamification event record
      await supabase.from("gamification_events").insert([{
        user_id: user.id,
        event_type: eventType,
        source_type: gameType || null,
        xp_earned: xpEarned,
        coins_earned: coinsEarned,
        metadata: metadata as Record<string, never>
      }]);

      // 2. Update mission progress via RPC
      await supabase.rpc("update_mission_progress_for_event", {
        p_user_id: user.id,
        p_event_type: eventType,
        p_game_type: gameType || null,
        p_increment: 1
      });

      // 3. Update XP-based missions if XP was earned
      if (xpEarned > 0) {
        await supabase.rpc("update_xp_mission_progress", {
          p_user_id: user.id,
          p_xp_earned: xpEarned
        });
      }

      console.log(`[Gamification] Event tracked: ${eventType}`, { gameType, xpEarned, coinsEarned });
    } catch (error) {
      console.error("[Gamification] Error tracking event:", error);
    }
  }, [user]);

  /**
   * Track a game completion event
   */
  const trackGameCompleted = useCallback((
    gameType: string,
    xpEarned: number,
    coinsEarned: number,
    score?: number
  ) => {
    return trackEvent({
      eventType: "game_played",
      gameType,
      xpEarned,
      coinsEarned,
      metadata: { score }
    });
  }, [trackEvent]);

  /**
   * Track a quiz completion event
   */
  const trackQuizCompleted = useCallback((
    xpEarned: number,
    coinsEarned: number,
    correctAnswers: number,
    totalQuestions: number
  ) => {
    return trackEvent({
      eventType: "quiz_completed",
      gameType: "quiz",
      xpEarned,
      coinsEarned,
      metadata: { correctAnswers, totalQuestions, accuracy: (correctAnswers / totalQuestions) * 100 }
    });
  }, [trackEvent]);

  /**
   * Track streak claim event
   */
  const trackStreakClaimed = useCallback((xpEarned: number, coinsEarned: number, streakDay: number) => {
    return trackEvent({
      eventType: "streak_claimed",
      xpEarned,
      coinsEarned,
      metadata: { streakDay }
    });
  }, [trackEvent]);

  /**
   * Track training completion event
   */
  const trackTrainingCompleted = useCallback((
    trainingId: string,
    xpEarned: number,
    coinsEarned: number
  ) => {
    return trackEvent({
      eventType: "training_completed",
      gameType: "training",
      xpEarned,
      coinsEarned,
      metadata: { trainingId }
    });
  }, [trackEvent]);

  return {
    trackEvent,
    trackGameCompleted,
    trackQuizCompleted,
    trackStreakClaimed,
    trackTrainingCompleted
  };
}
