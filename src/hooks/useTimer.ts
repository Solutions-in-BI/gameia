import { useState, useEffect, useCallback } from "react";

/**
 * ===========================================
 * HOOK: useTimer
 * ===========================================
 * 
 * Hook para controlar um timer (cronômetro).
 * 
 * @example
 * const { time, isRunning, start, stop, reset } = useTimer();
 * 
 * start();  // Começa a contar
 * stop();   // Para
 * reset();  // Volta para 0
 */
export function useTimer() {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  // Efeito que incrementa o tempo a cada segundo
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning) {
      interval = setInterval(() => {
        setTime((prev) => prev + 1);
      }, 1000);
    }

    // Cleanup: limpa o interval quando para ou desmonta
    return () => clearInterval(interval);
  }, [isRunning]);

  const start = useCallback(() => setIsRunning(true), []);
  const stop = useCallback(() => setIsRunning(false), []);
  const reset = useCallback(() => {
    setTime(0);
    setIsRunning(false);
  }, []);

  return { time, isRunning, start, stop, reset };
}
