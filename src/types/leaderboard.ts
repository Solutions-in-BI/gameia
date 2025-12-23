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
  user_id?: string | null;
  game_type: string;
  score: number;
  difficulty?: string | null; // Para memory: easy, medium, hard
  created_at: string;
  // Dados do perfil (opcional, preenchido ao buscar)
  profile?: {
    avatar_url: string | null;
    selected_title: string | null;
  } | null;
  // Moldura equipada do inventário (opcional)
  equipped_frame_rarity?: "common" | "rare" | "epic" | "legendary" | null;
}

/** Dados para criar nova entrada */
export interface NewLeaderboardEntry {
  player_name: string;
  user_id?: string;
  game_type: "memory" | "snake" | "dino" | "tetris";
  score: number;
  difficulty?: string;
}
