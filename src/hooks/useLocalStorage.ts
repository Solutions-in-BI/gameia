import { useState, useEffect, useCallback } from "react";

/**
 * ===========================================
 * HOOK: useLocalStorage
 * ===========================================
 * 
 * Hook customizado para persistir dados no localStorage.
 * Funciona como useState, mas salva automaticamente.
 * 
 * @example
 * const [score, setScore] = useLocalStorage("bestScore", 0);
 * setScore(100); // Salva automaticamente no localStorage
 * 
 * @param key - Chave única no localStorage
 * @param initialValue - Valor inicial se não existir dados salvos
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  // Inicializa o estado
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      // Tenta recuperar do localStorage
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // Se der erro, usa o valor inicial
      console.warn(`Erro ao ler localStorage[${key}]:`, error);
      return initialValue;
    }
  });

  // Função para atualizar o valor
  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      // Permite passar função (como setState normal)
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      setStoredValue(valueToStore);
      localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.warn(`Erro ao salvar localStorage[${key}]:`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue] as const;
}
