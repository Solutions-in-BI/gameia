/**
 * ===========================================
 * TIPOS DO SISTEMA DE RANKING
 * ===========================================
 * 
 * Define interfaces para o ranking online.
 * Sincroniza com a tabela 'leaderboard' no banco.
 */

/** Entrada no ranking */
export interface LeaderboardEntry {
  id: string;
  player_name: string;
  game_type: string;
  score: number;
  difficulty?: string | null; // Para memory: easy, medium, hard
  created_at: string;
}

/** Dados para criar nova entrada */
export interface NewLeaderboardEntry {
  player_name: string;
  game_type: "memory" | "snake" | "dino";
  score: number;
  difficulty?: string;
}
