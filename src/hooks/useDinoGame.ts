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
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║                           useDinoGame                                      ║
 * ╠═══════════════════════════════════════════════════════════════════════════╣
 * ║ Hook que encapsula TODA a lógica do Dino Runner.                          ║
 * ║                                                                           ║
 * ║ CONCEITOS DE FÍSICA SIMULADA:                                             ║
 * ║ - Gravidade: força constante puxando para baixo                          ║
 * ║ - Velocidade: acumula com gravidade, aplicada à posição                  ║
 * ║ - Pulo: aplica velocidade negativa (para cima)                           ║
 * ║                                                                           ║
 * ║ GAME LOOP:                                                                ║
 * ║ 1. Atualiza posição do dino (física)                                     ║
 * ║ 2. Move obstáculos para a esquerda                                       ║
 * ║ 3. Remove obstáculos fora da tela                                        ║
 * ║ 4. Gera novos obstáculos                                                 ║
 * ║ 5. Verifica colisões                                                      ║
 * ║ 6. Incrementa pontuação                                                   ║
 * ║                                                                           ║
 * ║ USO:                                                                      ║
 * ║ const { dinoY, obstacles, jump, score } = useDinoGame();                 ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */

export function useDinoGame() {
  // ═══════════════════════════════════════════════════════════════════════════
  // ESTADO DO JOGO
  // ═══════════════════════════════════════════════════════════════════════════
  
  /** Jogo está rodando? */
  const [isPlaying, setIsPlaying] = useState(false);
  
  /** Jogador morreu? */
  const [isGameOver, setIsGameOver] = useState(false);
  
  /** Pontuação atual (incrementa a cada frame) */
  const [score, setScore] = useState(0);
  
  /**
   * Velocidade dos obstáculos (pixels por frame).
   * Aumenta a cada 100 pontos para dificultar.
   */
  const [speed, setSpeed] = useState(INITIAL_SPEED);
  
  // ═══════════════════════════════════════════════════════════════════════════
  // ESTADO DO DINOSSAURO
  // ═══════════════════════════════════════════════════════════════════════════
  
  /**
   * Posição Y do dinossauro (vertical).
   * Y = 0 é o topo da tela. Maior Y = mais embaixo.
   * GROUND_Y - DINO_HEIGHT = posição no chão
   */
  const [dinoY, setDinoY] = useState(GROUND_Y - DINO_HEIGHT);
  
  /** Indica se está no ar (animação diferente) */
  const [isJumping, setIsJumping] = useState(false);
  
  /**
   * Velocidade vertical atual.
   * - Negativa: subindo
   * - Positiva: descendo
   * - Zero: parado no chão
   * 
   * Usamos Ref porque muda a cada frame e não precisa re-render.
   */
  const velocityRef = useRef(0);
  
  // ═══════════════════════════════════════════════════════════════════════════
  // OBSTÁCULOS
  // ═══════════════════════════════════════════════════════════════════════════
  
  /**
   * Array de obstáculos na tela.
   * Cada obstáculo tem: x (posição), type, width, height
   */
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  
  // ═══════════════════════════════════════════════════════════════════════════
  // PERSISTÊNCIA E REFS
  // ═══════════════════════════════════════════════════════════════════════════
  
  /** Recorde salvo no localStorage */
  const [bestScore, setBestScore] = useLocalStorage(DINO_STORAGE_KEY, 0);
  
  /** Referência para cancelar o game loop */
  const gameLoopRef = useRef<number | null>(null);
  
  /** Último score em que aumentamos a velocidade (evita duplicar) */
  const lastScoreCheckRef = useRef(0);

  // ═══════════════════════════════════════════════════════════════════════════
  // GERAÇÃO DE OBSTÁCULOS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Cria um novo obstáculo.
   * 
   * Tipos disponíveis:
   * - small: cacto pequeno
   * - large: cacto grande
   * - double: dois cactos juntos
   * 
   * @param startX - Posição X inicial (geralmente fora da tela à direita)
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

  // ═══════════════════════════════════════════════════════════════════════════
  // CONTROLES DO JOGO
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Inicia uma nova partida.
   */
  const startGame = useCallback(() => {
    if (isPlaying) return;
    
    // Reseta todo o estado
    setIsPlaying(true);
    setIsGameOver(false);
    setScore(0);
    setSpeed(INITIAL_SPEED);
    setDinoY(GROUND_Y - DINO_HEIGHT);
    setIsJumping(false);
    velocityRef.current = 0;
    lastScoreCheckRef.current = 0;
    
    // Gera obstáculos iniciais fora da tela
    const initialObstacles: Obstacle[] = [];
    let x = DINO_CANVAS_WIDTH + 100;
    for (let i = 0; i < 3; i++) {
      initialObstacles.push(generateObstacle(x));
      x += MIN_OBSTACLE_GAP + Math.random() * (MAX_OBSTACLE_GAP - MIN_OBSTACLE_GAP);
    }
    setObstacles(initialObstacles);
  }, [isPlaying, generateObstacle]);

  /**
   * Faz o dinossauro pular.
   * 
   * FÍSICA DO PULO:
   * 1. Aplica velocidade negativa (para cima)
   * 2. Gravidade reduz essa velocidade a cada frame
   * 3. Quando velocidade fica positiva, começa a cair
   * 4. Para quando atinge o chão
   */
  const jump = useCallback(() => {
    // Se não está jogando, inicia o jogo
    if (!isPlaying && !isGameOver) {
      startGame();
      return;
    }
    
    if (isGameOver) return;
    
    // Só pode pular se estiver no chão (ou muito perto)
    if (!isJumping && dinoY >= GROUND_Y - DINO_HEIGHT - 1) {
      setIsJumping(true);
      velocityRef.current = -JUMP_FORCE; // Negativo = para cima
    }
  }, [isPlaying, isGameOver, isJumping, dinoY, startGame]);

  /**
   * Finaliza o jogo (colisão detectada).
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
   * Reinicia para o estado inicial (sem começar automaticamente).
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

  // ═══════════════════════════════════════════════════════════════════════════
  // DETECÇÃO DE COLISÃO
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Verifica se o dinossauro colidiu com um obstáculo.
   * Usa hitbox reduzida para ser mais justo com o jogador.
   * 
   * AABB Collision Detection (Axis-Aligned Bounding Box):
   * Dois retângulos colidem se:
   * - Direita de A > Esquerda de B
   * - Esquerda de A < Direita de B
   * - Baixo de A > Topo de B
   * - Topo de A < Baixo de B
   */
  const checkCollision = useCallback((obstacle: Obstacle, currentDinoY: number): boolean => {
    // Hitbox do dino (reduzida para ser mais justo)
    const dinoLeft = DINO_X;
    const dinoRight = DINO_X + DINO_WIDTH - 10;
    const dinoTop = currentDinoY + 5;
    const dinoBottom = currentDinoY + DINO_HEIGHT;
    
    // Hitbox do obstáculo
    const obstacleLeft = obstacle.x;
    const obstacleRight = obstacle.x + obstacle.width;
    const obstacleTop = GROUND_Y - obstacle.height;
    const obstacleBottom = GROUND_Y;
    
    // Verifica sobreposição
    return (
      dinoRight > obstacleLeft &&
      dinoLeft < obstacleRight &&
      dinoBottom > obstacleTop &&
      dinoTop < obstacleBottom
    );
  }, []);

  // ═══════════════════════════════════════════════════════════════════════════
  // GAME LOOP PRINCIPAL
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Loop principal do jogo.
   * 
   * Usa requestAnimationFrame para sincronizar com a taxa de
   * atualização do monitor (~60fps).
   * 
   * A cada frame:
   * 1. Atualiza física do dinossauro
   * 2. Move obstáculos
   * 3. Gera novos obstáculos
   * 4. Atualiza pontuação
   * 5. Aumenta velocidade periodicamente
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
      
      // Limita a taxa de atualização
      if (deltaTime >= GAME_LOOP_INTERVAL) {
        lastTime = currentTime;
        
        // ═══ FÍSICA DO DINOSSAURO ═══
        setDinoY(prevY => {
          // Aplica velocidade à posição
          let newY = prevY + velocityRef.current;
          // Aplica gravidade à velocidade
          velocityRef.current += GRAVITY;
          
          // Limita ao chão
          if (newY >= GROUND_Y - DINO_HEIGHT) {
            newY = GROUND_Y - DINO_HEIGHT;
            velocityRef.current = 0;
            setIsJumping(false);
          }
          
          return newY;
        });
        
        // ═══ MOVIMENTO DOS OBSTÁCULOS ═══
        setObstacles(prevObstacles => {
          const currentSpeed = speed;
          
          // Move todos para a esquerda
          let newObstacles = prevObstacles.map(obs => ({
            ...obs,
            x: obs.x - currentSpeed,
          }));
          
          // Remove os que saíram da tela
          newObstacles = newObstacles.filter(obs => obs.x + obs.width > -50);
          
          // Gera novo obstáculo se necessário
          const lastObstacle = newObstacles[newObstacles.length - 1];
          if (!lastObstacle || lastObstacle.x < DINO_CANVAS_WIDTH - 100) {
            const gap = MIN_OBSTACLE_GAP + Math.random() * (MAX_OBSTACLE_GAP - MIN_OBSTACLE_GAP);
            const newX = lastObstacle 
              ? lastObstacle.x + lastObstacle.width + gap 
              : DINO_CANVAS_WIDTH + 100;
            newObstacles.push(generateObstacle(newX));
          }
          
          return newObstacles;
        });
        
        // ═══ PONTUAÇÃO ═══
        setScore(prev => prev + POINTS_PER_FRAME);
        
        // ═══ AUMENTO DE VELOCIDADE ═══
        setScore(prev => {
          const currentScore = Math.floor(prev);
          if (currentScore > 0 && currentScore % 100 === 0 && currentScore !== lastScoreCheckRef.current) {
            lastScoreCheckRef.current = currentScore;
            setSpeed(s => Math.min(MAX_SPEED, s + SPEED_INCREMENT));
          }
          return prev;
        });
      }
      
      // Agenda próximo frame
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };
    
    gameLoopRef.current = requestAnimationFrame(gameLoop);
    
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [isPlaying, isGameOver, speed, generateObstacle]);

  // ═══════════════════════════════════════════════════════════════════════════
  // VERIFICAÇÃO DE COLISÕES
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Verifica colisões a cada mudança de posição.
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

  // ═══════════════════════════════════════════════════════════════════════════
  // CONTROLES DE TECLADO
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Captura teclas de pulo: Espaço, Seta para cima, W
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowUp" || e.key === "w" || e.key === "W") {
        e.preventDefault(); // Evita scroll da página
        jump();
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [jump]);

  // ═══════════════════════════════════════════════════════════════════════════
  // RETORNO DO HOOK
  // ═══════════════════════════════════════════════════════════════════════════

  return {
    // ═══ ESTADO ═══
    isPlaying,
    isGameOver,
    score: Math.floor(score),
    bestScore,
    dinoY,
    isJumping,
    obstacles,
    speed,
    
    // ═══ AÇÕES ═══
    jump,
    startGame,
    resetGame,
  };
}
