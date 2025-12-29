/**
 * Hook para gerenciar streak diário
 * OTIMIZADO: Usa React Query para cache e evita refetches desnecessários
 */

import { useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

// Recompensas por dia de streak
const STREAK_REWARDS = [
  { day: 1, coins: 10, xp: 5 },
  { day: 2, coins: 15, xp: 10 },
  { day: 3, coins: 25, xp: 15 },
  { day: 4, coins: 35, xp: 20 },
  { day: 5, coins: 50, xp: 30 },
  { day: 6, coins: 75, xp: 40 },
  { day: 7, coins: 100, xp: 50 },
];

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastPlayedAt: string | null;
  lastClaimedAt: string | null;
}

interface UseStreak {
  streak: StreakData;
  canClaimToday: boolean;
  isAtRisk: boolean;
  isLoading: boolean;
  claimDailyReward: () => Promise<boolean>;
  recordPlay: () => Promise<void>;
  getTodayReward: () => { coins: number; xp: number };
}

const DEFAULT_STREAK: StreakData = {
  currentStreak: 0,
  longestStreak: 0,
  lastPlayedAt: null,
  lastClaimedAt: null,
};

// Helpers
const isSameDay = (date1: Date, date2: Date): boolean => {
  return date1.toDateString() === date2.toDateString();
};

const isYesterday = (date: Date): boolean => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return isSameDay(date, yesterday);
};

export function useStreak(): UseStreak {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  // Query principal
  const { data: streak = DEFAULT_STREAK, isLoading } = useQuery({
    queryKey: ['streak', user?.id],
    queryFn: async (): Promise<StreakData> => {
      if (!user?.id) return DEFAULT_STREAK;

      const { data, error } = await supabase
        .from("user_streaks")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        // Cria registro inicial
        await supabase.from("user_streaks").insert({ user_id: user.id });
        return DEFAULT_STREAK;
      }

      const lastPlayed = data.last_played_at ? new Date(data.last_played_at) : null;
      const today = new Date();

      // Verifica se perdeu o streak
      let currentStreak = data.current_streak;
      if (lastPlayed && !isSameDay(lastPlayed, today) && !isYesterday(lastPlayed)) {
        currentStreak = 0;
        await supabase
          .from("user_streaks")
          .update({ current_streak: 0 })
          .eq("user_id", user.id);
      }

      return {
        currentStreak,
        longestStreak: data.longest_streak,
        lastPlayedAt: data.last_played_at,
        lastClaimedAt: data.last_claimed_at,
      };
    },
    enabled: !!user?.id && isAuthenticated,
    staleTime: 60000, // 1 min
    gcTime: 300000,
  });

  // Computed values
  const canClaimToday = useMemo(() => {
    if (!streak.lastClaimedAt) return true;
    const lastClaimed = new Date(streak.lastClaimedAt);
    return !isSameDay(lastClaimed, new Date());
  }, [streak.lastClaimedAt]);

  const isAtRisk = useMemo(() => {
    if (!streak.lastPlayedAt || streak.currentStreak === 0) return false;
    const lastPlayed = new Date(streak.lastPlayedAt);
    const today = new Date();
    return !isSameDay(lastPlayed, today);
  }, [streak.lastPlayedAt, streak.currentStreak]);

  const getTodayReward = useCallback(() => {
    const dayIndex = Math.min(streak.currentStreak, 6);
    return STREAK_REWARDS[dayIndex];
  }, [streak.currentStreak]);

  // Mutation para registrar que jogou
  const recordPlayMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("No user");

      const today = new Date();
      const lastPlayed = streak.lastPlayedAt ? new Date(streak.lastPlayedAt) : null;

      // Já jogou hoje
      if (lastPlayed && isSameDay(lastPlayed, today)) return;

      let newStreak = streak.currentStreak;

      if (lastPlayed && isYesterday(lastPlayed)) {
        newStreak++;
      } else if (!lastPlayed || !isSameDay(lastPlayed, today)) {
        newStreak = 1;
      }

      const longestStreak = Math.max(newStreak, streak.longestStreak);

      await supabase
        .from("user_streaks")
        .update({
          current_streak: newStreak,
          longest_streak: longestStreak,
          last_played_at: today.toISOString(),
        })
        .eq("user_id", user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['streak', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['user-data', user?.id] });
    },
  });

  // Mutation para resgatar recompensa diária
  const claimRewardMutation = useMutation({
    mutationFn: async (): Promise<boolean> => {
      if (!user?.id || !canClaimToday) return false;

      const reward = getTodayReward();
      const today = new Date();

      // Atualiza streak
      await supabase
        .from("user_streaks")
        .update({ last_claimed_at: today.toISOString() })
        .eq("user_id", user.id);

      // Busca stats atuais e atualiza
      const { data: currentStats } = await supabase
        .from("user_stats")
        .select("xp, coins")
        .eq("user_id", user.id)
        .maybeSingle();

      const newXP = (currentStats?.xp || 0) + reward.xp;
      const newCoins = (currentStats?.coins || 0) + reward.coins;

      await supabase
        .from("user_stats")
        .upsert({
          user_id: user.id,
          xp: newXP,
          coins: newCoins,
        }, { onConflict: "user_id" });

      // Track gamification event
      await supabase.from("gamification_events").insert({
        user_id: user.id,
        event_type: "streak_claimed",
        xp_earned: reward.xp,
        coins_earned: reward.coins,
        metadata: { streakDay: streak.currentStreak }
      });

      // Update streak mission progress
      try {
        await supabase.rpc("update_mission_progress_for_event", {
          p_user_id: user.id,
          p_event_type: "streak_claimed",
          p_game_type: null,
          p_increment: 1
        });
      } catch {
        // ignore if rpc not exists
      }

      return true;
    },
    onSuccess: (success) => {
      if (success) {
        const reward = getTodayReward();
        toast.success("🎁 Recompensa Resgatada!", {
          description: `+${reward.coins} moedas e +${reward.xp} XP`,
        });
      }
      queryClient.invalidateQueries({ queryKey: ['streak', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['user-data', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['daily-missions', user?.id] });
    },
  });

  return {
    streak,
    canClaimToday,
    isAtRisk,
    isLoading,
    claimDailyReward: () => claimRewardMutation.mutateAsync(),
    recordPlay: () => recordPlayMutation.mutateAsync(),
    getTodayReward,
  };
}
