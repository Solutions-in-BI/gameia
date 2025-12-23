/**
 * Hook para gerenciar sistema de níveis
 */

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";
import { 
  calculateLevel, 
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
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  const [xp, setXP] = useState(0);
  const [level, setLevel] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Busca XP e Level do usuário
  const fetchLevel = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from("user_stats")
        .select("xp, level")
        .eq("user_id", user.id)
        .maybeSingle();
      
      if (error) throw error;
      
      if (data) {
        setXP(data.xp || 0);
        setLevel(data.level || 1);
      }
    } catch (err) {
      console.error("Erro ao buscar nível:", err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchLevel();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated, fetchLevel]);

  // Adiciona XP
  const addXP = useCallback(async (amount: number, reason?: string): Promise<boolean> => {
    if (!user || amount <= 0) return false;
    
    try {
      const newXP = xp + amount;
      const newLevel = calculateLevel(newXP);
      const leveledUp = newLevel > level;
      
      const { error } = await supabase
        .from("user_stats")
        .update({ xp: newXP, level: newLevel })
        .eq("user_id", user.id);
      
      if (error) throw error;
      
      setXP(newXP);
      setLevel(newLevel);
      
      // Notifica level up
      if (leveledUp) {
        const info = getLevelInfo(newLevel, newXP);
        toast({
          title: `🎉 Level Up! Nível ${newLevel}`,
          description: `Você agora é ${info.icon} ${info.title}!`,
        });
      } else if (reason) {
        toast({
          title: `+${amount} XP`,
          description: reason,
        });
      }
      
      return leveledUp;
    } catch (err) {
      console.error("Erro ao adicionar XP:", err);
      return false;
    }
  }, [user, xp, level, toast]);

  // Adiciona XP de jogo (completar + bônus de score)
  const addGameXP = useCallback(async (score: number) => {
    const gameXP = XP_REWARDS.GAME_COMPLETED;
    const scoreBonus = Math.floor(score * XP_REWARDS.SCORE_BONUS);
    const totalXP = gameXP + scoreBonus;
    
    await addXP(totalXP);
  }, [addXP]);

  const progress = getLevelProgress(xp, level);
  const levelInfo = getLevelInfo(level, xp);

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
