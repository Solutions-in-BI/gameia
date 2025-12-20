/**
 * ===========================================
 * CONSTANTES DO SISTEMA DE CONQUISTAS
 * ===========================================
 * 
 * Define todas as conquistas disponíveis no jogo.
 * Para adicionar uma nova conquista, basta adicionar aqui!
 */

import { Achievement } from "@/types/achievements";

/** Chave do localStorage para dados de conquistas */
export const ACHIEVEMENTS_STORAGE_KEY = "playerAchievements";
export const PLAYER_STATS_STORAGE_KEY = "playerStats";

/** Lista de todas as conquistas do jogo */
export const ACHIEVEMENTS: Achievement[] = [
  // ============ CONQUISTAS GERAIS ============
  {
    id: "first_game",
    name: "Primeiro Passo",
    description: "Complete seu primeiro jogo",
    icon: "🎮",
    category: "general",
    condition: { type: "games_played", value: 1 },
  },
  {
    id: "veteran",
    name: "Veterano",
    description: "Complete 10 jogos",
    icon: "⭐",
    category: "general",
    condition: { type: "games_played", value: 10 },
  },
  {
    id: "master_gamer",
    name: "Mestre dos Games",
    description: "Complete 50 jogos",
    icon: "👑",
    category: "general",
    condition: { type: "games_played", value: 50 },
  },

  // ============ CONQUISTAS MEMÓRIA ============
  {
    id: "memory_beginner",
    name: "Boa Memória",
    description: "Complete o modo Fácil",
    icon: "🧠",
    category: "memory",
    condition: { type: "games_played", game: "memory", value: 1 },
  },
  {
    id: "memory_perfect_easy",
    name: "Perfeição Fácil",
    description: "Complete Fácil em menos de 8 movimentos",
    icon: "💯",
    category: "memory",
    condition: { type: "moves", game: "memory", difficulty: "easy", value: 8 },
  },
  {
    id: "memory_perfect_medium",
    name: "Perfeição Média",
    description: "Complete Médio em menos de 12 movimentos",
    icon: "🏆",
    category: "memory",
    condition: { type: "moves", game: "memory", difficulty: "medium", value: 12 },
  },
  {
    id: "memory_perfect_hard",
    name: "Memória Fotográfica",
    description: "Complete Difícil em menos de 18 movimentos",
    icon: "📸",
    category: "memory",
    condition: { type: "moves", game: "memory", difficulty: "hard", value: 18 },
  },
  {
    id: "memory_speed_demon",
    name: "Velocista",
    description: "Complete qualquer modo em menos de 30 segundos",
    icon: "⚡",
    category: "memory",
    condition: { type: "time", game: "memory", value: 30 },
  },

  // ============ CONQUISTAS SNAKE ============
  {
    id: "snake_first",
    name: "Primeira Mordida",
    description: "Jogue Snake pela primeira vez",
    icon: "🐍",
    category: "snake",
    condition: { type: "games_played", game: "snake", value: 1 },
  },
  {
    id: "snake_50",
    name: "Cobra Crescendo",
    description: "Alcance 50 pontos no Snake",
    icon: "🌱",
    category: "snake",
    condition: { type: "score", game: "snake", value: 50 },
  },
  {
    id: "snake_100",
    name: "Serpente Mestre",
    description: "Alcance 100 pontos no Snake",
    icon: "🔥",
    category: "snake",
    condition: { type: "score", game: "snake", value: 100 },
  },
  {
    id: "snake_200",
    name: "Rei das Cobras",
    description: "Alcance 200 pontos no Snake",
    icon: "👑",
    category: "snake",
    condition: { type: "score", game: "snake", value: 200 },
  },
  {
    id: "snake_300",
    name: "Lenda Serpente",
    description: "Alcance 300 pontos no Snake",
    icon: "🌟",
    category: "snake",
    condition: { type: "score", game: "snake", value: 300 },
  },
];

/** Conquistas agrupadas por categoria */
export const ACHIEVEMENTS_BY_CATEGORY = {
  general: ACHIEVEMENTS.filter(a => a.category === "general"),
  memory: ACHIEVEMENTS.filter(a => a.category === "memory"),
  snake: ACHIEVEMENTS.filter(a => a.category === "snake"),
};
