/**
 * ===========================================
 * TIPOS CENTRALIZADOS DOS JOGOS
 * ===========================================
 * 
 * Este arquivo contém todas as definições de tipos
 * usadas nos jogos. Centralizar tipos facilita:
 * - Reutilização entre componentes
 * - Manutenção (mudou aqui, muda em todo lugar)
 * - Documentação clara do que cada coisa é
 */

// ============ TIPOS GERAIS ============

/** Tipos de jogos disponíveis no menu */
export type GameType = "menu" | "memory" | "snake";

/** Posição em um grid 2D (usado no Snake) */
export interface Position {
  x: number;
  y: number;
}

// ============ JOGO DA MEMÓRIA ============

/** Níveis de dificuldade do jogo da memória */
export type Difficulty = "easy" | "medium" | "hard";

/** Representa uma carta no jogo da memória */
export interface Card {
  id: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
}

/** Configuração de uma dificuldade */
export interface DifficultyConfig {
  value: Difficulty;
  label: string;
  pairs: number;
  gridCols: string;
}

/** Recordes salvos por dificuldade */
export type BestScores = Record<Difficulty, number | null>;

// ============ JOGO DA COBRA (SNAKE) ============

/** Direções possíveis no Snake */
export type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";

/** Estado do jogo Snake */
export interface SnakeGameState {
  snake: Position[];
  food: Position;
  direction: Direction;
  isPlaying: boolean;
  isGameOver: boolean;
  score: number;
  speed: number;
}
