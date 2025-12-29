/**
 * Hook para gerenciar sistema de níveis
 * OTIMIZADO: Usa React Query para cache e useUserData para dados centralizados
 */

import { useCallback } from "react";
import { useUserData } from "./useUserData";
import { 
  getLevelInfo, 
  getLevelProgress, 
  XP_REWARDS,
  LevelInfo 
} from "@/constants/levels";

interface UseLevel {
  level: number;
  xp: number;
  progress: number;
  levelInfo: LevelInfo;
  isLoading: boolean;
  addXP: (amount: number, reason?: string) => Promise<boolean>;
  addGameXP: (score: number) => Promise<void>;
}

export function useLevel(): UseLevel {
  const { 
    xp, 
    level, 
    isLoading, 
    addXP: addXPBase, 
    addGameXP: addGameXPBase 
  } = useUserData();

  const progress = getLevelProgress(xp, level);
  const levelInfo = getLevelInfo(level, xp);

  // Wrapper que retorna boolean para compatibilidade
  const addXP = useCallback(async (amount: number, reason?: string): Promise<boolean> => {
    try {
      await addXPBase(amount, reason);
      return true;
    } catch {
      return false;
    }
  }, [addXPBase]);

  // Adiciona XP de jogo (completar + bônus de score)
  const addGameXP = useCallback(async (score: number) => {
    const gameXP = XP_REWARDS.GAME_COMPLETED;
    const scoreBonus = Math.floor(score * XP_REWARDS.SCORE_BONUS);
    const totalXP = gameXP + scoreBonus;
    await addXPBase(totalXP);
  }, [addXPBase]);

  return {
    level,
    xp,
    progress,
    levelInfo,
    isLoading,
    addXP,
    addGameXP,
  };
}
