import { useCallback, useMemo } from "react";
import { PlayerAchievement, PlayerStats } from "@/types/achievements";
import { ACHIEVEMENTS, ACHIEVEMENTS_STORAGE_KEY, PLAYER_STATS_STORAGE_KEY } from "@/constants/achievements";
import { useLocalStorage } from "./useLocalStorage";

/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║                         useAchievements                                    ║
 * ╠═══════════════════════════════════════════════════════════════════════════╣
 * ║ Hook que gerencia o sistema de conquistas.                                ║
 * ║                                                                           ║
 * ║ RESPONSABILIDADES:                                                        ║
 * ║ - Manter estatísticas do jogador (jogos, recordes)                       ║
 * ║ - Verificar condições de desbloqueio                                     ║
 * ║ - Persistir conquistas desbloqueadas                                     ║
 * ║                                                                           ║
 * ║ COMO FUNCIONA:                                                            ║
 * ║ 1. Jogador termina uma partida                                           ║
 * ║ 2. Componente chama checkAndUnlock({ game, score, moves... })           ║
 * ║ 3. Hook verifica TODAS as conquistas não desbloqueadas                   ║
 * ║ 4. Se condição atendida → desbloqueia e salva                           ║
 * ║ 5. Retorna lista de IDs desbloqueados (para mostrar toast)              ║
 * ║                                                                           ║
 * ║ USO:                                                                      ║
 * ║ const { checkAndUnlock, getProgress } = useAchievements();               ║
 * ║ const unlocked = checkAndUnlock({ game: "snake", score: 150 });         ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */

/**
 * Estatísticas iniciais do jogador.
 * Usadas quando não há dados salvos.
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
  // ═══════════════════════════════════════════════════════════════════════════
  // PERSISTÊNCIA
  // ═══════════════════════════════════════════════════════════════════════════
  
  /**
   * Lista de conquistas desbloqueadas.
   * Formato: [{ achievementId: "first_win", unlockedAt: "2024-01-15T..." }, ...]
   */
  const [unlockedAchievements, setUnlockedAchievements] = useLocalStorage<PlayerAchievement[]>(
    ACHIEVEMENTS_STORAGE_KEY,
    []
  );
  
  /**
   * Estatísticas acumuladas do jogador.
   * Usadas para verificar conquistas baseadas em progresso.
   */
  const [stats, setStats] = useLocalStorage<PlayerStats>(
    PLAYER_STATS_STORAGE_KEY,
    DEFAULT_STATS
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // HELPERS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Set de IDs já desbloqueados para busca O(1).
   * Recalcula apenas quando unlockedAchievements muda.
   */
  const unlockedIds = useMemo(
    () => new Set(unlockedAchievements.map(a => a.achievementId)),
    [unlockedAchievements]
  );

  /**
   * Desbloqueia uma conquista específica.
   * 
   * @param achievementId - ID da conquista (ex: "first_win")
   * @returns true se desbloqueou, false se já estava desbloqueada
   */
  const unlockAchievement = useCallback((achievementId: string) => {
    // Já desbloqueada? Ignora
    if (unlockedIds.has(achievementId)) return false;
    
    // Adiciona à lista com timestamp
    setUnlockedAchievements(prev => [
      ...prev,
      { achievementId, unlockedAt: new Date().toISOString() }
    ]);
    return true;
  }, [unlockedIds, setUnlockedAchievements]);

  // ═══════════════════════════════════════════════════════════════════════════
  // VERIFICAÇÃO E DESBLOQUEIO
  // ═══════════════════════════════════════════════════════════════════════════

  /** 
   * Verifica e desbloqueia conquistas baseado em um evento de jogo.
   * 
   * ALGORITMO:
   * 1. Atualiza estatísticas do jogador
   * 2. Para cada conquista NÃO desbloqueada:
   *    - Verifica se a condição foi atendida
   *    - Se sim, desbloqueia
   * 3. Retorna array de IDs desbloqueados
   * 
   * @param event - Dados do evento (jogo, score, moves, time, difficulty)
   * @returns Array de IDs das conquistas desbloqueadas
   */
  const checkAndUnlock = useCallback((event: {
    game: "memory" | "snake" | "dino";
    score?: number;
    moves?: number;
    time?: number;
    difficulty?: string;
  }) => {
    const newlyUnlocked: string[] = [];
    
    // ═══ ATUALIZA ESTATÍSTICAS ═══
    setStats(prev => {
      const updated = { ...prev };
      updated.totalGamesPlayed++;
      
      if (event.game === "memory") {
        updated.memoryGamesPlayed++;
        // Atualiza melhor score de movimentos
        if (event.moves && event.difficulty) {
          const currentBest = updated.memoryBestMoves[event.difficulty];
          if (!currentBest || event.moves < currentBest) {
            updated.memoryBestMoves = { ...updated.memoryBestMoves, [event.difficulty]: event.moves };
          }
        }
        // Atualiza melhor tempo
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

      if (event.game === "dino") {
        updated.dinoGamesPlayed++;
        if (event.score && event.score > updated.dinoBestScore) {
          updated.dinoBestScore = event.score;
        }
      }
      
      return updated;
    });

    // ═══ VERIFICA CADA CONQUISTA ═══
    ACHIEVEMENTS.forEach(achievement => {
      // Já desbloqueada? Pula
      if (unlockedIds.has(achievement.id)) return;
      
      const { condition } = achievement;
      let shouldUnlock = false;

      /**
       * TIPOS DE CONDIÇÃO:
       * - games_played: jogou X vezes (geral ou por jogo)
       * - moves: completou em X movimentos ou menos
       * - time: completou em X segundos ou menos
       * - score: atingiu X pontos
       */
      switch (condition.type) {
        case "games_played":
          if (!condition.game) {
            // Condição geral (qualquer jogo conta)
            shouldUnlock = stats.totalGamesPlayed + 1 >= condition.value;
          } else if (condition.game === event.game) {
            // Condição específica de um jogo
            let count = 0;
            if (event.game === "memory") count = stats.memoryGamesPlayed + 1;
            else if (event.game === "snake") count = stats.snakeGamesPlayed + 1;
            else if (event.game === "dino") count = stats.dinoGamesPlayed + 1;
            shouldUnlock = count >= condition.value;
          }
          break;

        case "moves":
          // Apenas para Memory: completar em poucos movimentos
          if (condition.game === "memory" && event.game === "memory" && event.moves) {
            if (!condition.difficulty || condition.difficulty === event.difficulty) {
              shouldUnlock = event.moves <= condition.value;
            }
          }
          break;

        case "time":
          // Completar em pouco tempo
          if (condition.game === "memory" && event.game === "memory" && event.time) {
            shouldUnlock = event.time <= condition.value;
          }
          break;

        case "score":
          // Atingir pontuação mínima
          if (condition.game === "snake" && event.game === "snake" && event.score) {
            shouldUnlock = event.score >= condition.value;
          }
          if (condition.game === "dino" && event.game === "dino" && event.score) {
            shouldUnlock = event.score >= condition.value;
          }
          break;
      }

      // Desbloqueia se condição atendida
      if (shouldUnlock) {
        const wasUnlocked = unlockAchievement(achievement.id);
        if (wasUnlocked) {
          newlyUnlocked.push(achievement.id);
        }
      }
    });

    return newlyUnlocked;
  }, [stats, unlockedIds, unlockAchievement, setStats]);

  // ═══════════════════════════════════════════════════════════════════════════
  // FUNÇÕES DE CONSULTA
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Retorna progresso geral das conquistas.
   * Usado para mostrar barra de progresso.
   */
  const getProgress = useCallback(() => {
    const total = ACHIEVEMENTS.length;
    const unlocked = unlockedAchievements.length;
    return {
      total,
      unlocked,
      percentage: Math.round((unlocked / total) * 100),
    };
  }, [unlockedAchievements.length]);

  /**
   * Retorna lista de conquistas com status de desbloqueio.
   * Usada para renderizar a lista de conquistas.
   */
  const getAchievementsWithStatus = useCallback(() => {
    return ACHIEVEMENTS.map(achievement => ({
      ...achievement,
      isUnlocked: unlockedIds.has(achievement.id),
      unlockedAt: unlockedAchievements.find(a => a.achievementId === achievement.id)?.unlockedAt,
    }));
  }, [unlockedIds, unlockedAchievements]);

  // ═══════════════════════════════════════════════════════════════════════════
  // RETORNO DO HOOK
  // ═══════════════════════════════════════════════════════════════════════════

  return {
    /** Estatísticas do jogador */
    stats,
    /** Lista de conquistas desbloqueadas */
    unlockedAchievements,
    /** Desbloqueia uma conquista manualmente */
    unlockAchievement,
    /** Verifica e desbloqueia conquistas baseado em evento */
    checkAndUnlock,
    /** Retorna progresso (total, unlocked, percentage) */
    getProgress,
    /** Retorna conquistas com status */
    getAchievementsWithStatus,
    /** Verifica se uma conquista específica está desbloqueada */
    isUnlocked: (id: string) => unlockedIds.has(id),
  };
}
