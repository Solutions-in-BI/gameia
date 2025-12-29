/**
 * Hook unificado para dados do usuário
 * Agrupa level, streak, coins, inventory em uma única query com cache
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";
import { 
  calculateLevel, 
  getLevelInfo, 
  getLevelProgress, 
  XP_REWARDS,
  LevelInfo 
} from "@/constants/levels";

interface UserStats {
  xp: number;
  level: number;
  coins: number;
  total_games_played: number;
}

interface UserStreak {
  current_streak: number;
  longest_streak: number;
  last_played_at: string | null;
  last_claimed_at: string | null;
}

interface UserData {
  stats: UserStats;
  streak: UserStreak;
}

const DEFAULT_STATS: UserStats = {
  xp: 0,
  level: 1,
  coins: 0,
  total_games_played: 0,
};

const DEFAULT_STREAK: UserStreak = {
  current_streak: 0,
  longest_streak: 0,
  last_played_at: null,
  last_claimed_at: null,
};

export function useUserData() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query principal - busca stats e streak juntos
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['user-data', user?.id],
    queryFn: async (): Promise<UserData> => {
      if (!user?.id) throw new Error("No user");
      
      const [statsRes, streakRes] = await Promise.all([
        supabase
          .from("user_stats")
          .select("xp, level, coins, total_games_played")
          .eq("user_id", user.id)
          .maybeSingle(),
        supabase
          .from("user_streaks")
          .select("current_streak, longest_streak, last_played_at, last_claimed_at")
          .eq("user_id", user.id)
          .maybeSingle(),
      ]);

      return {
        stats: statsRes.data || DEFAULT_STATS,
        streak: streakRes.data || DEFAULT_STREAK,
      };
    },
    enabled: !!user?.id && isAuthenticated,
    staleTime: 30000, // 30s antes de considerar stale
    gcTime: 300000,   // 5min no cache
    refetchOnWindowFocus: false,
  });

  // Mutation para adicionar XP
  const addXPMutation = useMutation({
    mutationFn: async ({ amount, reason }: { amount: number; reason?: string }) => {
      if (!user?.id || amount <= 0) throw new Error("Invalid");
      
      const currentXP = data?.stats.xp || 0;
      const currentLevel = data?.stats.level || 1;
      const newXP = currentXP + amount;
      const newLevel = calculateLevel(newXP);
      const leveledUp = newLevel > currentLevel;

      const { error } = await supabase
        .from("user_stats")
        .update({ xp: newXP, level: newLevel })
        .eq("user_id", user.id);

      if (error) throw error;

      return { newXP, newLevel, leveledUp, amount, reason };
    },
    onSuccess: ({ newLevel, leveledUp, amount, reason }) => {
      // Invalidate cache
      queryClient.invalidateQueries({ queryKey: ['user-data', user?.id] });

      // Notifica level up
      if (leveledUp) {
        const info = getLevelInfo(newLevel, data?.stats.xp || 0);
        toast({
          title: `🎉 Level Up! Nível ${newLevel}`,
          description: `Você agora é ${info.icon} ${info.title}!`,
        });
      } else if (reason) {
        toast({
          title: `+${amount} XP`,
          description: reason,
        });
      }
    },
  });

  // Mutation para adicionar coins
  const addCoinsMutation = useMutation({
    mutationFn: async (amount: number) => {
      if (!user?.id) throw new Error("No user");

      const currentCoins = data?.stats.coins || 0;
      const newCoins = currentCoins + amount;

      const { error } = await supabase
        .from("user_stats")
        .update({ coins: newCoins })
        .eq("user_id", user.id);

      if (error) throw error;
      return newCoins;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-data', user?.id] });
    },
  });

  // Valores derivados
  const stats = data?.stats || DEFAULT_STATS;
  const streak = data?.streak || DEFAULT_STREAK;
  const progress = getLevelProgress(stats.xp, stats.level);
  const levelInfo = getLevelInfo(stats.level, stats.xp);

  // Função helper para adicionar XP de jogo
  const addGameXP = async (score: number) => {
    const gameXP = XP_REWARDS.GAME_COMPLETED;
    const scoreBonus = Math.floor(score * XP_REWARDS.SCORE_BONUS);
    const totalXP = gameXP + scoreBonus;
    await addXPMutation.mutateAsync({ amount: totalXP });
  };

  return {
    // Stats
    xp: stats.xp,
    level: stats.level,
    coins: stats.coins,
    totalGamesPlayed: stats.total_games_played,
    
    // Level info
    progress,
    levelInfo,
    
    // Streak
    currentStreak: streak.current_streak,
    longestStreak: streak.longest_streak,
    lastPlayedAt: streak.last_played_at,
    lastClaimedAt: streak.last_claimed_at,
    
    // Estado
    isLoading,
    
    // Ações
    addXP: (amount: number, reason?: string) => addXPMutation.mutateAsync({ amount, reason }),
    addCoins: (amount: number) => addCoinsMutation.mutateAsync(amount),
    addGameXP,
    refetch,
    
    // Para invalidação externa
    invalidate: () => queryClient.invalidateQueries({ queryKey: ['user-data', user?.id] }),
  };
}
