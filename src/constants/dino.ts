/**
 * ===========================================
 * CONSTANTES DO JOGO DINO RUNNER
 * ===========================================
 * 
 * Configurações do jogo do dinossauro.
 * Similar ao jogo do Chrome quando está offline.
 */

// ============ DIMENSÕES ============

/** Largura do canvas */
export const DINO_CANVAS_WIDTH = 800;

/** Altura do canvas */
export const DINO_CANVAS_HEIGHT = 200;

/** Posição Y do chão */
export const GROUND_Y = 160;

// ============ DINOSSAURO ============

/** Largura do dino */
export const DINO_WIDTH = 44;

/** Altura do dino */
export const DINO_HEIGHT = 47;

/** Posição X do dino (fixo) */
export const DINO_X = 50;

/** Força do pulo */
export const JUMP_FORCE = 15;

/** Gravidade */
export const GRAVITY = 0.8;

// ============ OBSTÁCULOS ============

/** Largura do cacto pequeno */
export const CACTUS_WIDTH = 25;

/** Altura do cacto pequeno */
export const CACTUS_HEIGHT = 50;

/** Largura do cacto grande */
export const CACTUS_LARGE_WIDTH = 35;

/** Altura do cacto grande */
export const CACTUS_LARGE_HEIGHT = 70;

/** Distância mínima entre obstáculos */
export const MIN_OBSTACLE_GAP = 300;

/** Distância máxima entre obstáculos */
export const MAX_OBSTACLE_GAP = 600;

// ============ VELOCIDADE ============

/** Velocidade inicial do jogo */
export const INITIAL_SPEED = 6;

/** Incremento de velocidade a cada 100 pontos */
export const SPEED_INCREMENT = 0.5;

/** Velocidade máxima */
export const MAX_SPEED = 20;

/** Intervalo do game loop (ms) - ~60fps */
export const GAME_LOOP_INTERVAL = 16;

// ============ PONTUAÇÃO ============

/** Pontos por frame sobrevivido */
export const POINTS_PER_FRAME = 0.15;

/** Chave do localStorage para recorde */
export const DINO_STORAGE_KEY = "dinoBestScore";

// ============ TIPOS DE OBSTÁCULOS ============

export type ObstacleType = "small" | "large" | "double";

export interface Obstacle {
  x: number;
  type: ObstacleType;
  width: number;
  height: number;
}
