import { useEffect, useRef } from "react";

/**
 * ===========================================
 * HOOK: useGameLoop
 * ===========================================
 * 
 * Hook para criar um loop de jogo com velocidade variável.
 * 
 * @example
 * useGameLoop({
 *   callback: moveSnake,
 *   speed: 150, // ms entre cada chamada
 *   enabled: isPlaying && !isGameOver,
 * });
 */

interface UseGameLoopProps {
  callback: () => void;
  speed: number;
  enabled: boolean;
}

export function useGameLoop({ callback, speed, enabled }: UseGameLoopProps) {
  const savedCallback = useRef(callback);

  // Atualiza a referência do callback quando ele muda
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!enabled) return;

    const tick = () => {
      savedCallback.current();
    };

    const intervalId = setInterval(tick, speed);

    // Cleanup quando desabilita ou velocidade muda
    return () => clearInterval(intervalId);
  }, [speed, enabled]);
}
