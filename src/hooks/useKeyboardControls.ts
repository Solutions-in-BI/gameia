import { useEffect, useCallback } from "react";
import { Direction } from "@/types/game";
import { DIRECTION_KEYS, OPPOSITE_DIRECTIONS } from "@/constants/game";

/**
 * ===========================================
 * HOOK: useKeyboardControls
 * ===========================================
 * 
 * Hook para controles de teclado do Snake.
 * Escuta teclas e chama callback com a nova direção.
 * 
 * @example
 * useKeyboardControls({
 *   currentDirection: "RIGHT",
 *   onDirectionChange: (dir) => setDirection(dir),
 *   onStart: () => startGame(),
 *   enabled: !isGameOver,
 * });
 */

interface UseKeyboardControlsProps {
  currentDirection: Direction;
  onDirectionChange: (direction: Direction) => void;
  onStart?: () => void;
  enabled?: boolean;
}

export function useKeyboardControls({
  currentDirection,
  onDirectionChange,
  onStart,
  enabled = true,
}: UseKeyboardControlsProps) {
  
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;

    const newDirection = DIRECTION_KEYS[event.key];
    
    if (newDirection) {
      // Não permite inverter direção (ex: direita -> esquerda)
      const isOpposite = OPPOSITE_DIRECTIONS[newDirection] === currentDirection;
      
      if (!isOpposite) {
        onDirectionChange(newDirection);
        onStart?.();
      }
    }
    
    // Espaço também inicia o jogo
    if (event.key === " ") {
      onStart?.();
    }
  }, [currentDirection, onDirectionChange, onStart, enabled]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}
