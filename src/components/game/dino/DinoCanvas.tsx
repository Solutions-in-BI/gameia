import { useRef, useEffect } from "react";
import {
  DINO_CANVAS_WIDTH,
  DINO_CANVAS_HEIGHT,
  GROUND_Y,
  DINO_X,
  DINO_WIDTH,
  DINO_HEIGHT,
  Obstacle,
} from "@/constants/dino";

/**
 * ===========================================
 * COMPONENTE: DinoCanvas
 * ===========================================
 * 
 * Canvas que renderiza o jogo do dinossauro.
 */

interface DinoCanvasProps {
  dinoY: number;
  isJumping: boolean;
  obstacles: Obstacle[];
  isPlaying: boolean;
  isGameOver: boolean;
}

export function DinoCanvas({ 
  dinoY, 
  isJumping, 
  obstacles, 
  isPlaying,
  isGameOver 
}: DinoCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Limpa o canvas
    ctx.fillStyle = "#1a1a2e";
    ctx.fillRect(0, 0, DINO_CANVAS_WIDTH, DINO_CANVAS_HEIGHT);

    // Desenha o chão
    ctx.strokeStyle = "#4a4a6a";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, GROUND_Y);
    ctx.lineTo(DINO_CANVAS_WIDTH, GROUND_Y);
    ctx.stroke();

    // Desenha linhas decorativas no chão
    ctx.strokeStyle = "#3a3a5a";
    ctx.lineWidth = 1;
    for (let i = 0; i < DINO_CANVAS_WIDTH; i += 20) {
      const offset = (frameRef.current * 3) % 20;
      ctx.beginPath();
      ctx.moveTo(i - offset, GROUND_Y + 5);
      ctx.lineTo(i - offset + 10, GROUND_Y + 5);
      ctx.stroke();
    }

    // Desenha o dinossauro
    drawDino(ctx, DINO_X, dinoY, isJumping, frameRef.current);

    // Desenha obstáculos
    obstacles.forEach(obstacle => {
      drawObstacle(ctx, obstacle);
    });

    // Incrementa frame para animação
    if (isPlaying && !isGameOver) {
      frameRef.current++;
    }
  }, [dinoY, isJumping, obstacles, isPlaying, isGameOver]);

  return (
    <canvas
      ref={canvasRef}
      width={DINO_CANVAS_WIDTH}
      height={DINO_CANVAS_HEIGHT}
      className="w-full max-w-full rounded-xl border-2 border-border bg-background"
      style={{ imageRendering: "pixelated" }}
    />
  );
}

/**
 * Desenha o dinossauro
 */
function drawDino(
  ctx: CanvasRenderingContext2D, 
  x: number, 
  y: number, 
  isJumping: boolean,
  frame: number
) {
  ctx.fillStyle = "#10b981"; // Verde primário
  
  // Corpo principal
  ctx.fillRect(x + 10, y + 5, 25, 30);
  
  // Cabeça
  ctx.fillRect(x + 20, y, 20, 20);
  
  // Olho
  ctx.fillStyle = "#1a1a2e";
  ctx.fillRect(x + 32, y + 5, 4, 4);
  
  // Boca
  ctx.fillRect(x + 35, y + 12, 8, 2);
  
  ctx.fillStyle = "#10b981";
  
  // Bracinhos
  ctx.fillRect(x + 5, y + 15, 8, 4);
  
  // Cauda
  ctx.fillRect(x, y + 10, 12, 8);
  ctx.fillRect(x - 5, y + 12, 8, 4);
  
  // Pernas (animadas)
  if (isJumping) {
    // Pernas esticadas
    ctx.fillRect(x + 12, y + 35, 6, 12);
    ctx.fillRect(x + 24, y + 35, 6, 12);
  } else {
    // Pernas alternando
    const legOffset = Math.floor(frame / 5) % 2 === 0;
    if (legOffset) {
      ctx.fillRect(x + 12, y + 35, 6, 12);
      ctx.fillRect(x + 24, y + 38, 6, 9);
    } else {
      ctx.fillRect(x + 12, y + 38, 6, 9);
      ctx.fillRect(x + 24, y + 35, 6, 12);
    }
  }
}

/**
 * Desenha um obstáculo (cacto)
 */
function drawObstacle(ctx: CanvasRenderingContext2D, obstacle: Obstacle) {
  const y = GROUND_Y - obstacle.height;
  
  ctx.fillStyle = "#ef4444"; // Vermelho
  
  if (obstacle.type === "small") {
    // Cacto pequeno
    ctx.fillRect(obstacle.x + 8, y, 9, obstacle.height);
    ctx.fillRect(obstacle.x, y + 15, 8, 6);
    ctx.fillRect(obstacle.x + 17, y + 10, 8, 6);
  } else if (obstacle.type === "large") {
    // Cacto grande
    ctx.fillRect(obstacle.x + 12, y, 11, obstacle.height);
    ctx.fillRect(obstacle.x, y + 20, 12, 8);
    ctx.fillRect(obstacle.x + 23, y + 15, 12, 8);
    ctx.fillRect(obstacle.x + 5, y + 35, 8, 6);
  } else {
    // Cacto duplo
    ctx.fillRect(obstacle.x + 8, y, 9, obstacle.height);
    ctx.fillRect(obstacle.x, y + 15, 8, 6);
    ctx.fillRect(obstacle.x + 43, y, 9, obstacle.height);
    ctx.fillRect(obstacle.x + 52, y + 12, 8, 6);
  }
}
