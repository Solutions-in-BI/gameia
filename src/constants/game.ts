/**
 * ===========================================
 * CONSTANTES E CONFIGURAÇÕES DOS JOGOS
 * ===========================================
 * 
 * Centralizar configurações facilita:
 * - Ajustar valores sem mexer na lógica
 * - Entender rapidamente como o jogo funciona
 * - Testar diferentes configurações
 */

import { DifficultyConfig } from "@/types/game";

// ============ JOGO DA MEMÓRIA ============

/** Emojis disponíveis para as cartas */
export const MEMORY_EMOJIS = [
  "🎮", "🎯", "🎲", "🎪", "🎨", "🎭", 
  "🎵", "🎸", "🚀", "⚡", "🔥", "💎", 
  "🌟", "🎁", "🎈", "🍀"
];

/** Configurações de cada dificuldade */
export const DIFFICULTY_CONFIGS: DifficultyConfig[] = [
  { value: "easy", label: "Fácil", pairs: 6, gridCols: "grid-cols-3 md:grid-cols-4" },
  { value: "medium", label: "Médio", pairs: 8, gridCols: "grid-cols-4" },
  { value: "hard", label: "Difícil", pairs: 12, gridCols: "grid-cols-4 md:grid-cols-6" },
];

/** Tempo de delay para virar cartas (ms) */
export const CARD_FLIP_DELAY = {
  match: 500,    // Quando encontra um par
  noMatch: 1000, // Quando não encontra
};

/** Chave do localStorage para recordes */
export const MEMORY_STORAGE_KEY = "memoryGameBestScores";

// ============ JOGO DA COBRA (SNAKE) ============

/** Tamanho do grid do Snake (20x20) */
export const SNAKE_GRID_SIZE = 20;

/** Velocidade inicial (ms entre movimentos) */
export const SNAKE_INITIAL_SPEED = 150;

/** Quanto acelera a cada comida (ms) */
export const SNAKE_SPEED_INCREMENT = 5;

/** Velocidade máxima (menor = mais rápido) */
export const SNAKE_MIN_SPEED = 50;

/** Pontos por comida */
export const SNAKE_POINTS_PER_FOOD = 10;

/** Posição inicial da cobra */
export const SNAKE_INITIAL_POSITION = { x: 10, y: 10 };

/** Direção inicial */
export const SNAKE_INITIAL_DIRECTION = "RIGHT" as const;

/** Chave do localStorage para recorde */
export const SNAKE_STORAGE_KEY = "snakeBestScore";

// ============ MAPEAMENTO DE TECLAS ============

/** Teclas que controlam cada direção */
export const DIRECTION_KEYS: Record<string, "UP" | "DOWN" | "LEFT" | "RIGHT"> = {
  ArrowUp: "UP",
  ArrowDown: "DOWN",
  ArrowLeft: "LEFT",
  ArrowRight: "RIGHT",
  w: "UP",
  W: "UP",
  s: "DOWN",
  S: "DOWN",
  a: "LEFT",
  A: "LEFT",
  d: "RIGHT",
  D: "RIGHT",
};

/** Direções opostas (não pode inverter) */
export const OPPOSITE_DIRECTIONS: Record<string, string> = {
  UP: "DOWN",
  DOWN: "UP",
  LEFT: "RIGHT",
  RIGHT: "LEFT",
};
