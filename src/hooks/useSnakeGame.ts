import { useState, useCallback, useRef } from "react";
import { Position, Direction } from "@/types/game";
import {
  SNAKE_GRID_SIZE,
  SNAKE_INITIAL_SPEED,
  SNAKE_SPEED_INCREMENT,
  SNAKE_MIN_SPEED,
  SNAKE_POINTS_PER_FOOD,
  SNAKE_INITIAL_POSITION,
  SNAKE_INITIAL_DIRECTION,
  SNAKE_STORAGE_KEY,
} from "@/constants/game";
import { useLocalStorage } from "./useLocalStorage";
import { useGameLoop } from "./useGameLoop";
import { useKeyboardControls } from "./useKeyboardControls";

/**
 * ===========================================
 * HOOK: useSnakeGame
 * ===========================================
 * 
 * Hook que encapsula toda a lógica do jogo Snake.
 */

export function useSnakeGame() {
  // Estado do jogo
  const [snake, setSnake] = useState<Position[]>([SNAKE_INITIAL_POSITION]);
  const [food, setFood] = useState<Position>({ x: 15, y: 10 });
  const [direction, setDirection] = useState<Direction>(SNAKE_INITIAL_DIRECTION);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [speed, setSpeed] = useState(SNAKE_INITIAL_SPEED);

  // Ref para direção (evita problemas de closure no game loop)
  const directionRef = useRef<Direction>(SNAKE_INITIAL_DIRECTION);

  // Recorde persistido
  const [bestScore, setBestScore] = useLocalStorage(SNAKE_STORAGE_KEY, 0);

  /**
   * Gera nova posição de comida (não pode ser na cobra)
   */
  const generateFood = useCallback((currentSnake: Position[]): Position => {
    let newFood: Position;
    do {
      newFood = {
        x: Math.floor(Math.random() * SNAKE_GRID_SIZE),
        y: Math.floor(Math.random() * SNAKE_GRID_SIZE),
      };
    } while (currentSnake.some(seg => seg.x === newFood.x && seg.y === newFood.y));
    return newFood;
  }, []);

  /**
   * Reinicia o jogo
   */
  const resetGame = useCallback(() => {
    const initialSnake = [SNAKE_INITIAL_POSITION];
    setSnake(initialSnake);
    setFood(generateFood(initialSnake));
    setDirection(SNAKE_INITIAL_DIRECTION);
    directionRef.current = SNAKE_INITIAL_DIRECTION;
    setScore(0);
    setSpeed(SNAKE_INITIAL_SPEED);
    setIsGameOver(false);
    setIsPlaying(false);
  }, [generateFood]);

  /**
   * Finaliza o jogo
   */
  const endGame = useCallback(() => {
    setIsGameOver(true);
    setIsPlaying(false);
    if (score > bestScore) {
      setBestScore(score);
    }
  }, [score, bestScore, setBestScore]);

  /**
   * Move a cobra (chamado a cada tick do game loop)
   */
  const moveSnake = useCallback(() => {
    setSnake(prevSnake => {
      const head = prevSnake[0];
      const dir = directionRef.current;

      // Calcula nova posição da cabeça
      let newHead: Position;
      switch (dir) {
        case "UP":    newHead = { x: head.x, y: head.y - 1 }; break;
        case "DOWN":  newHead = { x: head.x, y: head.y + 1 }; break;
        case "LEFT":  newHead = { x: head.x - 1, y: head.y }; break;
        case "RIGHT": newHead = { x: head.x + 1, y: head.y }; break;
      }

      // Colisão com parede
      if (
        newHead.x < 0 || 
        newHead.x >= SNAKE_GRID_SIZE || 
        newHead.y < 0 || 
        newHead.y >= SNAKE_GRID_SIZE
      ) {
        setTimeout(endGame, 0);
        return prevSnake;
      }

      // Colisão consigo mesma
      if (prevSnake.some(seg => seg.x === newHead.x && seg.y === newHead.y)) {
        setTimeout(endGame, 0);
        return prevSnake;
      }

      // Nova cobra com a cabeça na frente
      const newSnake = [newHead, ...prevSnake];

      // Verifica se comeu
      if (newHead.x === food.x && newHead.y === food.y) {
        setScore(s => s + SNAKE_POINTS_PER_FOOD);
        setFood(generateFood(newSnake));
        setSpeed(s => Math.max(SNAKE_MIN_SPEED, s - SNAKE_SPEED_INCREMENT));
        return newSnake; // Não remove a cauda (cobra cresce)
      }

      // Remove a cauda (cobra se move)
      newSnake.pop();
      return newSnake;
    });
  }, [food, generateFood, endGame]);

  /**
   * Atualiza direção
   */
  const changeDirection = useCallback((newDirection: Direction) => {
    directionRef.current = newDirection;
    setDirection(newDirection);
  }, []);

  /**
   * Inicia o jogo
   */
  const startGame = useCallback(() => {
    if (!isPlaying && !isGameOver) {
      setIsPlaying(true);
    }
  }, [isPlaying, isGameOver]);

  // Game loop
  useGameLoop({
    callback: moveSnake,
    speed,
    enabled: isPlaying && !isGameOver,
  });

  // Controles de teclado
  useKeyboardControls({
    currentDirection: direction,
    onDirectionChange: changeDirection,
    onStart: startGame,
    enabled: !isGameOver,
  });

  return {
    // Estado
    snake,
    food,
    direction,
    isPlaying,
    isGameOver,
    score,
    bestScore,
    gridSize: SNAKE_GRID_SIZE,
    
    // Ações
    changeDirection,
    startGame,
    resetGame,
  };
}
