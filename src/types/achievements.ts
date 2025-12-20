/**
 * ===========================================
 * TIPOS DO SISTEMA DE CONQUISTAS
 * ===========================================
 * 
 * Define todas as interfaces relacionadas a conquistas.
 * Sistema local que persiste no localStorage.
 */

/** Categorias de conquistas */
export type AchievementCategory = "memory" | "snake" | "general";

/** Definição de uma conquista */
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  /** Condição para desbloquear (verificada pelo hook) */
  condition: AchievementCondition;
}

/** Condições possíveis para desbloquear conquistas */
export interface AchievementCondition {
  type: "score" | "moves" | "time" | "games_played" | "streak" | "custom";
  game?: "memory" | "snake";
  difficulty?: "easy" | "medium" | "hard";
  value: number;
}

/** Estado de uma conquista do jogador */
export interface PlayerAchievement {
  achievementId: string;
  unlockedAt: string; // ISO date string
}

/** Estatísticas do jogador para verificar conquistas */
export interface PlayerStats {
  // Geral
  totalGamesPlayed: number;
  
  // Memory
  memoryGamesPlayed: number;
  memoryBestMoves: Record<string, number>; // { easy: 10, medium: 15, hard: 20 }
  memoryBestTime: Record<string, number>;
  
  // Snake
  snakeGamesPlayed: number;
  snakeBestScore: number;
  snakeMaxLength: number;
}
