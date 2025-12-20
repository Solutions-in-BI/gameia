import { useState, useCallback, useEffect, useRef } from "react";
import {
  GROUND_Y,
  DINO_X,
  DINO_WIDTH,
  DINO_HEIGHT,
  JUMP_FORCE,
  GRAVITY,
  INITIAL_SPEED,
  SPEED_INCREMENT,
  MAX_SPEED,
  GAME_LOOP_INTERVAL,
  POINTS_PER_FRAME,
  MIN_OBSTACLE_GAP,
  MAX_OBSTACLE_GAP,
  CACTUS_WIDTH,
  CACTUS_HEIGHT,
  CACTUS_LARGE_WIDTH,
  CACTUS_LARGE_HEIGHT,
  DINO_CANVAS_WIDTH,
  DINO_STORAGE_KEY,
  Obstacle,
  ObstacleType,
} from "@/constants/dino";
import { useLocalStorage } from "./useLocalStorage";

/**
 * ===========================================
 * HOOK: useDinoGame
 * ===========================================
 * 
 * Gerencia toda a lógica do jogo Dino Runner.
 */

export function useDinoGame() {
  // Estado do jogo
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [speed, setSpeed] = useState(INITIAL_SPEED);
  
  // Estado do dinossauro
  const [dinoY, setDinoY] = useState(GROUND_Y - DINO_HEIGHT);
  const [isJumping, setIsJumping] = useState(false);
  const velocityRef = useRef(0);
  
  // Obstáculos
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  
  // Recorde
  const [bestScore, setBestScore] = useLocalStorage(DINO_STORAGE_KEY, 0);
  
  // Refs para o game loop
  const gameLoopRef = useRef<number | null>(null);
  const lastScoreCheckRef = useRef(0);

  /**
   * Gera um novo obstáculo
   */
  const generateObstacle = useCallback((startX: number): Obstacle => {
    const types: ObstacleType[] = ["small", "large", "double"];
    const type = types[Math.floor(Math.random() * types.length)];
    
    let width: number;
    let height: number;
    
    switch (type) {
      case "small":
        width = CACTUS_WIDTH;
        height = CACTUS_HEIGHT;
        break;
      case "large":
        width = CACTUS_LARGE_WIDTH;
        height = CACTUS_LARGE_HEIGHT;
        break;
      case "double":
        width = CACTUS_WIDTH * 2 + 10;
        height = CACTUS_HEIGHT;
        break;
    }
    
    return { x: startX, type, width, height };
  }, []);

  /**
   * Inicia o jogo
   */
  const startGame = useCallback(() => {
    if (isPlaying) return;
    
    setIsPlaying(true);
    setIsGameOver(false);
    setScore(0);
    setSpeed(INITIAL_SPEED);
    setDinoY(GROUND_Y - DINO_HEIGHT);
    setIsJumping(false);
    velocityRef.current = 0;
    lastScoreCheckRef.current = 0;
    
    // Gera obstáculos iniciais
    const initialObstacles: Obstacle[] = [];
    let x = DINO_CANVAS_WIDTH + 100;
    for (let i = 0; i < 3; i++) {
      initialObstacles.push(generateObstacle(x));
      x += MIN_OBSTACLE_GAP + Math.random() * (MAX_OBSTACLE_GAP - MIN_OBSTACLE_GAP);
    }
    setObstacles(initialObstacles);
  }, [isPlaying, generateObstacle]);

  /**
   * Faz o dinossauro pular
   */
  const jump = useCallback(() => {
    if (!isPlaying && !isGameOver) {
      startGame();
      return;
    }
    
    if (isGameOver) return;
    
    // Só pode pular se estiver no chão
    if (!isJumping && dinoY >= GROUND_Y - DINO_HEIGHT - 1) {
      setIsJumping(true);
      velocityRef.current = -JUMP_FORCE;
    }
  }, [isPlaying, isGameOver, isJumping, dinoY, startGame]);

  /**
   * Finaliza o jogo
   */
  const endGame = useCallback(() => {
    setIsGameOver(true);
    setIsPlaying(false);
    
    const finalScore = Math.floor(score);
    if (finalScore > bestScore) {
      setBestScore(finalScore);
    }
  }, [score, bestScore, setBestScore]);

  /**
   * Reinicia o jogo
   */
  const resetGame = useCallback(() => {
    setIsPlaying(false);
    setIsGameOver(false);
    setScore(0);
    setSpeed(INITIAL_SPEED);
    setDinoY(GROUND_Y - DINO_HEIGHT);
    setIsJumping(false);
    velocityRef.current = 0;
    setObstacles([]);
  }, []);

  /**
   * Verifica colisão entre dino e obstáculo
   */
  const checkCollision = useCallback((obstacle: Obstacle, currentDinoY: number): boolean => {
    const dinoLeft = DINO_X;
    const dinoRight = DINO_X + DINO_WIDTH - 10; // Hitbox menor para ser mais justo
    const dinoTop = currentDinoY + 5; // Hitbox menor
    const dinoBottom = currentDinoY + DINO_HEIGHT;
    
    const obstacleLeft = obstacle.x;
    const obstacleRight = obstacle.x + obstacle.width;
    const obstacleTop = GROUND_Y - obstacle.height;
    const obstacleBottom = GROUND_Y;
    
    return (
      dinoRight > obstacleLeft &&
      dinoLeft < obstacleRight &&
      dinoBottom > obstacleTop &&
      dinoTop < obstacleBottom
    );
  }, []);

  /**
   * Game loop principal
   */
  useEffect(() => {
    if (!isPlaying || isGameOver) {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
      return;
    }

    let lastTime = performance.now();
    
    const gameLoop = (currentTime: number) => {
      const deltaTime = currentTime - lastTime;
      
      if (deltaTime >= GAME_LOOP_INTERVAL) {
        lastTime = currentTime;
        
        // Atualiza posição do dinossauro (pulo/gravidade)
        setDinoY(prevY => {
          let newY = prevY + velocityRef.current;
          velocityRef.current += GRAVITY;
          
          // Limita ao chão
          if (newY >= GROUND_Y - DINO_HEIGHT) {
            newY = GROUND_Y - DINO_HEIGHT;
            velocityRef.current = 0;
            setIsJumping(false);
          }
          
          return newY;
        });
        
        // Atualiza obstáculos
        setObstacles(prevObstacles => {
          const currentSpeed = speed;
          let newObstacles = prevObstacles.map(obs => ({
            ...obs,
            x: obs.x - currentSpeed,
          }));
          
          // Remove obstáculos que saíram da tela
          newObstacles = newObstacles.filter(obs => obs.x + obs.width > -50);
          
          // Adiciona novos obstáculos
          const lastObstacle = newObstacles[newObstacles.length - 1];
          if (!lastObstacle || lastObstacle.x < DINO_CANVAS_WIDTH - 100) {
            const gap = MIN_OBSTACLE_GAP + Math.random() * (MAX_OBSTACLE_GAP - MIN_OBSTACLE_GAP);
            const newX = lastObstacle ? lastObstacle.x + lastObstacle.width + gap : DINO_CANVAS_WIDTH + 100;
            newObstacles.push(generateObstacle(newX));
          }
          
          return newObstacles;
        });
        
        // Atualiza pontuação
        setScore(prev => prev + POINTS_PER_FRAME);
        
        // Aumenta velocidade a cada 100 pontos
        setScore(prev => {
          const currentScore = Math.floor(prev);
          if (currentScore > 0 && currentScore % 100 === 0 && currentScore !== lastScoreCheckRef.current) {
            lastScoreCheckRef.current = currentScore;
            setSpeed(s => Math.min(MAX_SPEED, s + SPEED_INCREMENT));
          }
          return prev;
        });
      }
      
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };
    
    gameLoopRef.current = requestAnimationFrame(gameLoop);
    
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [isPlaying, isGameOver, speed, generateObstacle]);

  /**
   * Verifica colisões
   */
  useEffect(() => {
    if (!isPlaying || isGameOver) return;
    
    for (const obstacle of obstacles) {
      if (checkCollision(obstacle, dinoY)) {
        endGame();
        break;
      }
    }
  }, [obstacles, dinoY, isPlaying, isGameOver, checkCollision, endGame]);

  /**
   * Controles de teclado
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowUp" || e.key === "w" || e.key === "W") {
        e.preventDefault();
        jump();
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [jump]);

  return {
    // Estado
    isPlaying,
    isGameOver,
    score: Math.floor(score),
    bestScore,
    dinoY,
    isJumping,
    obstacles,
    speed,
    
    // Ações
    jump,
    startGame,
    resetGame,
  };
}
