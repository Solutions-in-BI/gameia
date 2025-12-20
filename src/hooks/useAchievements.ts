import { useCallback, useMemo } from "react";
import { PlayerAchievement, PlayerStats } from "@/types/achievements";
import { ACHIEVEMENTS, ACHIEVEMENTS_STORAGE_KEY, PLAYER_STATS_STORAGE_KEY } from "@/constants/achievements";
import { useLocalStorage } from "./useLocalStorage";

/**
 * ===========================================
 * HOOK: useAchievements
 * ===========================================
 * 
 * Gerencia conquistas e estatísticas do jogador.
 * Persiste dados localmente no localStorage.
 * 
 * @example
 * const { unlockAchievement, checkAndUnlock, getProgress } = useAchievements();
 * 
 * // Quando jogador termina um jogo de memória:
 * checkAndUnlock({ game: "memory", moves: 8, time: 25, difficulty: "easy" });
 */

const DEFAULT_STATS: PlayerStats = {
  totalGamesPlayed: 0,
  memoryGamesPlayed: 0,
  memoryBestMoves: {},
  memoryBestTime: {},
  snakeGamesPlayed: 0,
  snakeBestScore: 0,
  snakeMaxLength: 1,
};

export function useAchievements() {
  const [unlockedAchievements, setUnlockedAchievements] = useLocalStorage<PlayerAchievement[]>(
    ACHIEVEMENTS_STORAGE_KEY,
    []
  );
  
  const [stats, setStats] = useLocalStorage<PlayerStats>(
    PLAYER_STATS_STORAGE_KEY,
    DEFAULT_STATS
  );

  /** IDs das conquistas já desbloqueadas */
  const unlockedIds = useMemo(
    () => new Set(unlockedAchievements.map(a => a.achievementId)),
    [unlockedAchievements]
  );

  /** Desbloqueia uma conquista específica */
  const unlockAchievement = useCallback((achievementId: string) => {
    if (unlockedIds.has(achievementId)) return false;
    
    setUnlockedAchievements(prev => [
      ...prev,
      { achievementId, unlockedAt: new Date().toISOString() }
    ]);
    return true;
  }, [unlockedIds, setUnlockedAchievements]);

  /** 
   * Verifica e desbloqueia conquistas baseado em um evento
   * Retorna array de conquistas desbloqueadas
   */
  const checkAndUnlock = useCallback((event: {
    game: "memory" | "snake";
    score?: number;
    moves?: number;
    time?: number;
    difficulty?: string;
  }) => {
    const newlyUnlocked: string[] = [];
    
    // Atualiza estatísticas
    setStats(prev => {
      const updated = { ...prev };
      updated.totalGamesPlayed++;
      
      if (event.game === "memory") {
        updated.memoryGamesPlayed++;
        if (event.moves && event.difficulty) {
          const currentBest = updated.memoryBestMoves[event.difficulty];
          if (!currentBest || event.moves < currentBest) {
            updated.memoryBestMoves = { ...updated.memoryBestMoves, [event.difficulty]: event.moves };
          }
        }
        if (event.time && event.difficulty) {
          const currentBest = updated.memoryBestTime[event.difficulty];
          if (!currentBest || event.time < currentBest) {
            updated.memoryBestTime = { ...updated.memoryBestTime, [event.difficulty]: event.time };
          }
        }
      }
      
      if (event.game === "snake") {
        updated.snakeGamesPlayed++;
        if (event.score && event.score > updated.snakeBestScore) {
          updated.snakeBestScore = event.score;
        }
      }
      
      return updated;
    });

    // Verifica cada conquista
    ACHIEVEMENTS.forEach(achievement => {
      if (unlockedIds.has(achievement.id)) return;
      
      const { condition } = achievement;
      let shouldUnlock = false;

      switch (condition.type) {
        case "games_played":
          if (!condition.game) {
            // Geral - qualquer jogo conta
            shouldUnlock = stats.totalGamesPlayed + 1 >= condition.value;
          } else if (condition.game === event.game) {
            const count = event.game === "memory" 
              ? stats.memoryGamesPlayed + 1 
              : stats.snakeGamesPlayed + 1;
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
          break;
      }

      if (shouldUnlock) {
        const wasUnlocked = unlockAchievement(achievement.id);
        if (wasUnlocked) {
          newlyUnlocked.push(achievement.id);
        }
      }
    });

    return newlyUnlocked;
  }, [stats, unlockedIds, unlockAchievement, setStats]);

  /** Retorna progresso das conquistas */
  const getProgress = useCallback(() => {
    const total = ACHIEVEMENTS.length;
    const unlocked = unlockedAchievements.length;
    return {
      total,
      unlocked,
      percentage: Math.round((unlocked / total) * 100),
    };
  }, [unlockedAchievements.length]);

  /** Retorna conquistas com status de desbloqueio */
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
  };
}
