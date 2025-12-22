import { useCallback, useMemo, useState, useEffect } from "react";
import { PlayerAchievement, PlayerStats } from "@/types/achievements";
import { ACHIEVEMENTS } from "@/constants/achievements";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║                         useAchievements                                    ║
 * ╠═══════════════════════════════════════════════════════════════════════════╣
 * ║ Hook que gerencia o sistema de conquistas POR USUÁRIO.                    ║
 * ║                                                                           ║
 * ║ RESPONSABILIDADES:                                                        ║
 * ║ - Manter estatísticas do jogador (jogos, recordes)                       ║
 * ║ - Verificar condições de desbloqueio                                     ║
 * ║ - Persistir conquistas no banco de dados por usuário                     ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */

const DEFAULT_STATS: PlayerStats = {
  totalGamesPlayed: 0,
  memoryGamesPlayed: 0,
  memoryBestMoves: {},
  memoryBestTime: {},
  snakeGamesPlayed: 0,
  snakeBestScore: 0,
  snakeMaxLength: 1,
  dinoGamesPlayed: 0,
  dinoBestScore: 0,
};

export function useAchievements() {
  const { user, isAuthenticated } = useAuth();
  const [unlockedAchievements, setUnlockedAchievements] = useState<PlayerAchievement[]>([]);
  const [stats, setStats] = useState<PlayerStats>(DEFAULT_STATS);
  const [isLoading, setIsLoading] = useState(true);

  // ═══════════════════════════════════════════════════════════════════════════
  // CARREGAR DADOS DO BANCO
  // ═══════════════════════════════════════════════════════════════════════════

  useEffect(() => {
    if (!user) {
      setUnlockedAchievements([]);
      setStats(DEFAULT_STATS);
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      
      // Busca conquistas do usuário
      const { data: achievements } = await supabase
        .from("user_achievements")
        .select("achievement_id, unlocked_at")
        .eq("user_id", user.id);
      
      if (achievements) {
        setUnlockedAchievements(
          achievements.map(a => ({
            achievementId: a.achievement_id,
            unlockedAt: a.unlocked_at
          }))
        );
      }

      // Busca estatísticas do usuário
      const { data: userStats } = await supabase
        .from("user_stats")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      
      if (userStats) {
        setStats({
          totalGamesPlayed: userStats.total_games_played,
          memoryGamesPlayed: userStats.memory_games_played,
          memoryBestMoves: (userStats.memory_best_moves as Record<string, number>) || {},
          memoryBestTime: (userStats.memory_best_time as Record<string, number>) || {},
          snakeGamesPlayed: userStats.snake_games_played,
          snakeBestScore: userStats.snake_best_score,
          snakeMaxLength: userStats.snake_max_length,
          dinoGamesPlayed: userStats.dino_games_played,
          dinoBestScore: userStats.dino_best_score,
        });
      }
      
      setIsLoading(false);
    };

    fetchData();
  }, [user]);

  // ═══════════════════════════════════════════════════════════════════════════
  // HELPERS
  // ═══════════════════════════════════════════════════════════════════════════

  const unlockedIds = useMemo(
    () => new Set(unlockedAchievements.map(a => a.achievementId)),
    [unlockedAchievements]
  );

  /**
   * Desbloqueia uma conquista no banco de dados
   */
  const unlockAchievement = useCallback(async (achievementId: string) => {
    if (!user || unlockedIds.has(achievementId)) return false;
    
    const { error } = await supabase
      .from("user_achievements")
      .insert({
        user_id: user.id,
        achievement_id: achievementId
      });
    
    if (!error) {
      setUnlockedAchievements(prev => [
        ...prev,
        { achievementId, unlockedAt: new Date().toISOString() }
      ]);
      return true;
    }
    return false;
  }, [user, unlockedIds]);

  /**
   * Salva estatísticas no banco de dados
   */
  const saveStats = useCallback(async (newStats: PlayerStats) => {
    if (!user) return;

    const statsData = {
      user_id: user.id,
      total_games_played: newStats.totalGamesPlayed,
      memory_games_played: newStats.memoryGamesPlayed,
      memory_best_moves: newStats.memoryBestMoves,
      memory_best_time: newStats.memoryBestTime,
      snake_games_played: newStats.snakeGamesPlayed,
      snake_best_score: newStats.snakeBestScore,
      snake_max_length: newStats.snakeMaxLength,
      dino_games_played: newStats.dinoGamesPlayed,
      dino_best_score: newStats.dinoBestScore,
    };

    await supabase
      .from("user_stats")
      .upsert(statsData, { onConflict: "user_id" });
  }, [user]);

  // ═══════════════════════════════════════════════════════════════════════════
  // VERIFICAÇÃO E DESBLOQUEIO
  // ═══════════════════════════════════════════════════════════════════════════

  const checkAndUnlock = useCallback(async (event: {
    game: "memory" | "snake" | "dino" | "tetris";
    score?: number;
    moves?: number;
    time?: number;
    difficulty?: string;
  }) => {
    if (!isAuthenticated || !user) return [];

    const newlyUnlocked: string[] = [];
    
    // Atualiza estatísticas
    const updatedStats = { ...stats };
    updatedStats.totalGamesPlayed++;
    
    if (event.game === "memory") {
      updatedStats.memoryGamesPlayed++;
      if (event.moves && event.difficulty) {
        const currentBest = updatedStats.memoryBestMoves[event.difficulty];
        if (!currentBest || event.moves < currentBest) {
          updatedStats.memoryBestMoves = { ...updatedStats.memoryBestMoves, [event.difficulty]: event.moves };
        }
      }
      if (event.time && event.difficulty) {
        const currentBest = updatedStats.memoryBestTime[event.difficulty];
        if (!currentBest || event.time < currentBest) {
          updatedStats.memoryBestTime = { ...updatedStats.memoryBestTime, [event.difficulty]: event.time };
        }
      }
    }
    
    if (event.game === "snake") {
      updatedStats.snakeGamesPlayed++;
      if (event.score && event.score > updatedStats.snakeBestScore) {
        updatedStats.snakeBestScore = event.score;
      }
    }

    if (event.game === "dino") {
      updatedStats.dinoGamesPlayed++;
      if (event.score && event.score > updatedStats.dinoBestScore) {
        updatedStats.dinoBestScore = event.score;
      }
    }
    
    setStats(updatedStats);
    await saveStats(updatedStats);

    // Verifica cada conquista
    for (const achievement of ACHIEVEMENTS) {
      if (unlockedIds.has(achievement.id)) continue;
      
      const { condition } = achievement;
      let shouldUnlock = false;

      switch (condition.type) {
        case "games_played":
          if (!condition.game) {
            shouldUnlock = updatedStats.totalGamesPlayed >= condition.value;
          } else if (condition.game === event.game) {
            let count = 0;
            if (event.game === "memory") count = updatedStats.memoryGamesPlayed;
            else if (event.game === "snake") count = updatedStats.snakeGamesPlayed;
            else if (event.game === "dino") count = updatedStats.dinoGamesPlayed;
            shouldUnlock = count >= condition.value;
          }
          break;

        case "moves":
          if (condition.game === "memory" && event.game === "memory" && event.moves) {
            if (!condition.difficulty || condition.difficulty === event.difficulty) {
              shouldUnlock = event.moves <= condition.value;
            }
          }
          break;

        case "time":
          if (condition.game === "memory" && event.game === "memory" && event.time) {
            shouldUnlock = event.time <= condition.value;
          }
          break;

        case "score":
          if (condition.game === "snake" && event.game === "snake" && event.score) {
            shouldUnlock = event.score >= condition.value;
          }
          if (condition.game === "dino" && event.game === "dino" && event.score) {
            shouldUnlock = event.score >= condition.value;
          }
          break;
      }

      if (shouldUnlock) {
        const wasUnlocked = await unlockAchievement(achievement.id);
        if (wasUnlocked) {
          newlyUnlocked.push(achievement.id);
        }
      }
    }

    return newlyUnlocked;
  }, [stats, unlockedIds, unlockAchievement, saveStats, isAuthenticated, user]);

  // ═══════════════════════════════════════════════════════════════════════════
  // FUNÇÕES DE CONSULTA
  // ═══════════════════════════════════════════════════════════════════════════

  const getProgress = useCallback(() => {
    const total = ACHIEVEMENTS.length;
    const unlocked = unlockedAchievements.length;
    return {
      total,
      unlocked,
      percentage: Math.round((unlocked / total) * 100),
    };
  }, [unlockedAchievements.length]);

  const getAchievementsWithStatus = useCallback(() => {
    return ACHIEVEMENTS.map(achievement => ({
      ...achievement,
      isUnlocked: unlockedIds.has(achievement.id),
      unlockedAt: unlockedAchievements.find(a => a.achievementId === achievement.id)?.unlockedAt,
    }));
  }, [unlockedIds, unlockedAchievements]);

  return {
    stats,
    unlockedAchievements,
    unlockAchievement,
    checkAndUnlock,
    getProgress,
    getAchievementsWithStatus,
    isUnlocked: (id: string) => unlockedIds.has(id),
    isLoading,
    isAuthenticated,
  };
}
