/**
 * Hook para gerenciar streak diário
 * Refatorado para evitar dependências circulares com useLevel/useMarketplace
 */

import { useState, useEffect, useCallback, useRef } from "react";
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

export function useStreak(): UseStreak {
  // All useState hooks MUST come first, before any other hooks
  const [streak, setStreak] = useState<StreakData>({
    currentStreak: 0,
    longestStreak: 0,
    lastPlayedAt: null,
    lastClaimedAt: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  
  // Now call other hooks
  const { user, isAuthenticated } = useAuth();

  // Verifica se é o mesmo dia
  const isSameDay = (date1: Date, date2: Date): boolean => {
    return date1.toDateString() === date2.toDateString();
  };

  // Verifica se é o dia anterior
  const isYesterday = (date: Date): boolean => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return isSameDay(date, yesterday);
  };

  // Busca streak do usuário
  const fetchStreak = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from("user_streaks")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      
      if (error) throw error;
      
      if (data) {
        const lastPlayed = data.last_played_at ? new Date(data.last_played_at) : null;
        const today = new Date();
        
        // Verifica se perdeu o streak (não jogou ontem)
        let currentStreak = data.current_streak;
        if (lastPlayed && !isSameDay(lastPlayed, today) && !isYesterday(lastPlayed)) {
          // Perdeu o streak
          currentStreak = 0;
          await supabase
            .from("user_streaks")
            .update({ current_streak: 0 })
            .eq("user_id", user.id);
        }
        
        setStreak({
          currentStreak,
          longestStreak: data.longest_streak,
          lastPlayedAt: data.last_played_at,
          lastClaimedAt: data.last_claimed_at,
        });
      } else {
        // Cria registro inicial
        await supabase
          .from("user_streaks")
          .insert({ user_id: user.id });
      }
    } catch (err) {
      console.error("Erro ao buscar streak:", err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchStreak();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated, fetchStreak]);

  // Verifica se pode resgatar hoje
  const canClaimToday = useCallback((): boolean => {
    if (!streak.lastClaimedAt) return true;
    const lastClaimed = new Date(streak.lastClaimedAt);
    return !isSameDay(lastClaimed, new Date());
  }, [streak.lastClaimedAt]);

  // Verifica se streak está em risco
  const isAtRisk = useCallback((): boolean => {
    if (!streak.lastPlayedAt || streak.currentStreak === 0) return false;
    const lastPlayed = new Date(streak.lastPlayedAt);
    const today = new Date();
    return !isSameDay(lastPlayed, today);
  }, [streak.lastPlayedAt, streak.currentStreak]);

  // Pega recompensa do dia
  const getTodayReward = useCallback(() => {
    const dayIndex = Math.min(streak.currentStreak, 6);
    return STREAK_REWARDS[dayIndex];
  }, [streak.currentStreak]);

  // Registra que jogou
  const recordPlay = useCallback(async () => {
    if (!user) return;
    
    try {
      const today = new Date();
      const lastPlayed = streak.lastPlayedAt ? new Date(streak.lastPlayedAt) : null;
      
      // Já jogou hoje
      if (lastPlayed && isSameDay(lastPlayed, today)) return;
      
      let newStreak = streak.currentStreak;
      
      // Se jogou ontem, incrementa streak
      if (lastPlayed && isYesterday(lastPlayed)) {
        newStreak++;
      } else if (!lastPlayed || !isSameDay(lastPlayed, today)) {
        // Primeira vez ou perdeu streak
        newStreak = lastPlayed ? 1 : 1;
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
      
      setStreak(prev => ({
        ...prev,
        currentStreak: newStreak,
        longestStreak,
        lastPlayedAt: today.toISOString(),
      }));
    } catch (err) {
      console.error("Erro ao registrar play:", err);
    }
  }, [user, streak]);

  // Resgata recompensa diária - aplica diretamente via supabase
  const claimDailyReward = useCallback(async (): Promise<boolean> => {
    if (!user || !canClaimToday()) return false;
    
    try {
      const reward = getTodayReward();
      const today = new Date();
      
      // Atualiza streak
      await supabase
        .from("user_streaks")
        .update({
          last_claimed_at: today.toISOString(),
        })
        .eq("user_id", user.id);
      
      // Busca stats atuais e atualiza diretamente
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
      
      setStreak(prev => ({
        ...prev,
        lastClaimedAt: today.toISOString(),
      }));
      
      // Track gamification event for streak missions
      await supabase.from("gamification_events").insert({
        user_id: user.id,
        event_type: "streak_claimed",
        xp_earned: reward.xp,
        coins_earned: reward.coins,
        metadata: { streakDay: streak.currentStreak }
      });

      // Update streak mission progress
      await supabase.rpc("update_mission_progress_for_event", {
        p_user_id: user.id,
        p_event_type: "streak_claimed",
        p_game_type: null,
        p_increment: 1
      });
      
      toast.success("🎁 Recompensa Resgatada!", {
        description: `+${reward.coins} moedas e +${reward.xp} XP`,
      });
      
      return true;
    } catch (err) {
      console.error("Erro ao resgatar recompensa:", err);
      return false;
    }
  }, [user, canClaimToday, getTodayReward, streak.currentStreak]);

  return {
    streak,
    canClaimToday: canClaimToday(),
    isAtRisk: isAtRisk(),
    isLoading,
    claimDailyReward,
    recordPlay,
    getTodayReward,
  };
}
