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
    id: "getting_started",
    name: "Esquentando",
    description: "Complete 5 jogos",
    icon: "🔥",
    category: "general",
    condition: { type: "games_played", value: 5 },
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
    id: "dedicated",
    name: "Dedicado",
    description: "Complete 25 jogos",
    icon: "💪",
    category: "general",
    condition: { type: "games_played", value: 25 },
  },
  {
    id: "master_gamer",
    name: "Mestre dos Games",
    description: "Complete 50 jogos",
    icon: "👑",
    category: "general",
    condition: { type: "games_played", value: 50 },
  },
  {
    id: "legend",
    name: "Lenda Viva",
    description: "Complete 100 jogos",
    icon: "🏆",
    category: "general",
    condition: { type: "games_played", value: 100 },
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
    id: "memory_fan",
    name: "Fã da Memória",
    description: "Complete 5 jogos de memória",
    icon: "💜",
    category: "memory",
    condition: { type: "games_played", game: "memory", value: 5 },
  },
  {
    id: "memory_addict",
    name: "Viciado em Memória",
    description: "Complete 20 jogos de memória",
    icon: "🎯",
    category: "memory",
    condition: { type: "games_played", game: "memory", value: 20 },
  },
  {
    id: "memory_perfect_easy",
    name: "Perfeição Fácil",
    description: "Complete Fácil em 8 movimentos ou menos",
    icon: "💯",
    category: "memory",
    condition: { type: "moves", game: "memory", difficulty: "easy", value: 8 },
  },
  {
    id: "memory_good_easy",
    name: "Eficiente",
    description: "Complete Fácil em 10 movimentos ou menos",
    icon: "✨",
    category: "memory",
    condition: { type: "moves", game: "memory", difficulty: "easy", value: 10 },
  },
  {
    id: "memory_perfect_medium",
    name: "Perfeição Média",
    description: "Complete Médio em 12 movimentos ou menos",
    icon: "🎖️",
    category: "memory",
    condition: { type: "moves", game: "memory", difficulty: "medium", value: 12 },
  },
  {
    id: "memory_good_medium",
    name: "Mente Afiada",
    description: "Complete Médio em 16 movimentos ou menos",
    icon: "🧩",
    category: "memory",
    condition: { type: "moves", game: "memory", difficulty: "medium", value: 16 },
  },
  {
    id: "memory_perfect_hard",
    name: "Memória Fotográfica",
    description: "Complete Difícil em 18 movimentos ou menos",
    icon: "📸",
    category: "memory",
    condition: { type: "moves", game: "memory", difficulty: "hard", value: 18 },
  },
  {
    id: "memory_good_hard",
    name: "Desafiador",
    description: "Complete Difícil em 24 movimentos ou menos",
    icon: "🎪",
    category: "memory",
    condition: { type: "moves", game: "memory", difficulty: "hard", value: 24 },
  },
  {
    id: "memory_speed_demon",
    name: "Velocista",
    description: "Complete qualquer modo em 30 segundos ou menos",
    icon: "⚡",
    category: "memory",
    condition: { type: "time", game: "memory", value: 30 },
  },
  {
    id: "memory_lightning",
    name: "Relâmpago",
    description: "Complete qualquer modo em 20 segundos ou menos",
    icon: "🌩️",
    category: "memory",
    condition: { type: "time", game: "memory", value: 20 },
  },
  {
    id: "memory_flash",
    name: "Flash",
    description: "Complete qualquer modo em 15 segundos ou menos",
    icon: "💨",
    category: "memory",
    condition: { type: "time", game: "memory", value: 15 },
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
    id: "snake_fan",
    name: "Fã de Cobras",
    description: "Jogue Snake 5 vezes",
    icon: "💚",
    category: "snake",
    condition: { type: "games_played", game: "snake", value: 5 },
  },
  {
    id: "snake_addict",
    name: "Viciado em Snake",
    description: "Jogue Snake 20 vezes",
    icon: "🎮",
    category: "snake",
    condition: { type: "games_played", game: "snake", value: 20 },
  },
  {
    id: "snake_20",
    name: "Primeiro Lanche",
    description: "Alcance 20 pontos no Snake",
    icon: "🍎",
    category: "snake",
    condition: { type: "score", game: "snake", value: 20 },
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
    id: "snake_80",
    name: "Serpente Habilidosa",
    description: "Alcance 80 pontos no Snake",
    icon: "🐲",
    category: "snake",
    condition: { type: "score", game: "snake", value: 80 },
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
    id: "snake_150",
    name: "Cobra Gigante",
    description: "Alcance 150 pontos no Snake",
    icon: "🦎",
    category: "snake",
    condition: { type: "score", game: "snake", value: 150 },
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
    id: "snake_250",
    name: "Anaconda",
    description: "Alcance 250 pontos no Snake",
    icon: "🌊",
    category: "snake",
    condition: { type: "score", game: "snake", value: 250 },
  },
  {
    id: "snake_300",
    name: "Lenda Serpente",
    description: "Alcance 300 pontos no Snake",
    icon: "🌟",
    category: "snake",
    condition: { type: "score", game: "snake", value: 300 },
  },
  {
    id: "snake_400",
    name: "Deus das Cobras",
    description: "Alcance 400 pontos no Snake",
    icon: "⚡",
    category: "snake",
    condition: { type: "score", game: "snake", value: 400 },
  },
  {
    id: "snake_500",
    name: "Impossível!",
    description: "Alcance 500 pontos no Snake",
    icon: "🏆",
    category: "snake",
    condition: { type: "score", game: "snake", value: 500 },
  },
];

/** Conquistas agrupadas por categoria */
export const ACHIEVEMENTS_BY_CATEGORY = {
  general: ACHIEVEMENTS.filter(a => a.category === "general"),
  memory: ACHIEVEMENTS.filter(a => a.category === "memory"),
  snake: ACHIEVEMENTS.filter(a => a.category === "snake"),
};
