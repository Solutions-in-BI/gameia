/**
 * ===========================================
 * CONQUISTAS DO SISTEMA EMPRESARIAL
 * ===========================================
 * 
 * Conquistas focadas em trilhas e progressão empresarial.
 * Conquistas de jogos recreativos foram REMOVIDAS.
 * 
 * Jogos recreativos (Snake, Dino, Tetris, Memory) são apenas
 * para diversão e NÃO geram XP, moedas ou conquistas.
 */

import { Achievement } from "@/types/achievements";

/** @deprecated Conquistas agora são baseadas em trilhas no banco */
export const ACHIEVEMENTS_STORAGE_KEY = "playerAchievements";
export const PLAYER_STATS_STORAGE_KEY = "playerStats";

/**
 * Conquistas Gerais e Empresariais
 * (Jogos recreativos não geram conquistas - apenas diversão)
 */
export const ACHIEVEMENTS: Achievement[] = [
  // ============ CONQUISTAS GERAIS (Progressão) ============
  {
    id: "first_steps",
    name: "Primeiros Passos",
    description: "Complete sua primeira missão de treinamento",
    icon: "👶",
    category: "general",
    condition: { type: "games_played", value: 1 },
  },
  {
    id: "dedicated_learner",
    name: "Aprendiz Dedicado",
    description: "Complete 10 missões de treinamento",
    icon: "📚",
    category: "general",
    condition: { type: "games_played", value: 10 },
  },
  {
    id: "training_champion",
    name: "Campeão do Treinamento",
    description: "Complete 50 missões de treinamento",
    icon: "🏆",
    category: "general",
    condition: { type: "games_played", value: 50 },
  },
  
  // ============ CONQUISTAS DE STREAK ============
  {
    id: "streak_starter",
    name: "Início de Sequência",
    description: "Mantenha uma sequência de 3 dias",
    icon: "🔥",
    category: "general",
    condition: { type: "streak", value: 3 },
  },
  {
    id: "week_warrior",
    name: "Guerreiro da Semana",
    description: "Mantenha uma sequência de 7 dias",
    icon: "⚔️",
    category: "general",
    condition: { type: "streak", value: 7 },
  },
  {
    id: "consistency_king",
    name: "Rei da Consistência",
    description: "Mantenha uma sequência de 30 dias",
    icon: "👑",
    category: "general",
    condition: { type: "streak", value: 30 },
  },
];

/** Conquistas organizadas por categoria */
export const ACHIEVEMENTS_BY_CATEGORY = {
  general: ACHIEVEMENTS.filter(a => a.category === "general"),
};
