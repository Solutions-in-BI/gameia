/**
 * Hook para gerenciar títulos do usuário
 * 
 * Responsável por:
 * - Buscar títulos desbloqueados
 * - Verificar e desbloquear novos títulos
 * - Selecionar título ativo
 */

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { GAME_TITLES, GameTitle, getTitleById } from "@/constants/titles";
import { useToast } from "./use-toast";

export interface UnlockedTitle {
  id: string;
  title_id: string;
  unlocked_at: string;
  title?: GameTitle;
}

export function useTitles() {
  const { user, profile, updateProfile } = useAuth();
  const { toast } = useToast();
  const [unlockedTitles, setUnlockedTitles] = useState<UnlockedTitle[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Busca títulos desbloqueados
  const fetchUnlockedTitles = useCallback(async () => {
    if (!user) {
      setUnlockedTitles([]);
      setIsLoading(false);
      return;
    }

    const { data } = await supabase
      .from("user_titles")
      .select("*")
      .eq("user_id", user.id);

    if (data) {
      setUnlockedTitles(
        data.map(t => ({
          ...t,
          title: getTitleById(t.title_id),
        }))
      );
    }
    setIsLoading(false);
  }, [user]);

  useEffect(() => {
    fetchUnlockedTitles();
  }, [fetchUnlockedTitles]);

  // Desbloqueia um título
  const unlockTitle = async (titleId: string): Promise<boolean> => {
    if (!user) return false;

    // Verifica se já possui
    if (unlockedTitles.some(t => t.title_id === titleId)) {
      return false;
    }

    const { error } = await supabase
      .from("user_titles")
      .insert({ user_id: user.id, title_id: titleId });

    if (!error) {
      const title = getTitleById(titleId);
      if (title) {
        toast({
          title: "🎖️ Novo Título Desbloqueado!",
          description: `Você ganhou o título "${title.name}"`,
        });
      }
      await fetchUnlockedTitles();
      return true;
    }
    return false;
  };

  // Seleciona título ativo
  const selectTitle = async (titleId: string | null) => {
    if (!user) return;

    // Verifica se possui o título (ou se está removendo)
    if (titleId && !unlockedTitles.some(t => t.title_id === titleId)) {
      toast({
        title: "Título não desbloqueado",
        description: "Você precisa desbloquear este título primeiro",
        variant: "destructive",
      });
      return;
    }

    await updateProfile({ selected_title: titleId });
    toast({
      title: titleId ? "Título selecionado!" : "Título removido",
    });
  };

  // Verifica títulos baseado nas estatísticas
  const checkAndUnlockTitles = async (stats: {
    totalGames?: number;
    snakeScore?: number;
    dinoScore?: number;
    tetrisScore?: number;
    memoryGames?: number;
    achievementsCount?: number;
    topRanks?: Record<string, number>;
  }) => {
    if (!user) return;

    const newlyUnlocked: string[] = [];

    for (const title of GAME_TITLES) {
      // Skip se já desbloqueou
      if (unlockedTitles.some(t => t.title_id === title.id)) continue;

      let shouldUnlock = false;

      switch (title.requirement.type) {
        case "games":
          if (title.requirement.game === "memory") {
            shouldUnlock = (stats.memoryGames || 0) >= title.requirement.value;
          } else {
            shouldUnlock = (stats.totalGames || 0) >= title.requirement.value;
          }
          break;

        case "score":
          if (title.requirement.game === "snake") {
            shouldUnlock = (stats.snakeScore || 0) >= title.requirement.value;
          } else if (title.requirement.game === "dino") {
            shouldUnlock = (stats.dinoScore || 0) >= title.requirement.value;
          } else if (title.requirement.game === "tetris") {
            shouldUnlock = (stats.tetrisScore || 0) >= title.requirement.value;
          }
          break;

        case "rank":
          if (stats.topRanks) {
            if (title.requirement.game) {
              const rank = stats.topRanks[title.requirement.game];
              shouldUnlock = rank !== undefined && rank <= title.requirement.value;
            } else {
              // Qualquer jogo
              shouldUnlock = Object.values(stats.topRanks).some(
                r => r <= title.requirement.value
              );
            }
          }
          break;

        case "achievement":
          shouldUnlock = (stats.achievementsCount || 0) >= title.requirement.value;
          break;
      }

      if (shouldUnlock) {
        const success = await unlockTitle(title.id);
        if (success) newlyUnlocked.push(title.id);
      }
    }

    return newlyUnlocked;
  };

  // Retorna todos os títulos com status de desbloqueado
  const getAllTitlesWithStatus = () => {
    return GAME_TITLES.map(title => ({
      ...title,
      isUnlocked: unlockedTitles.some(t => t.title_id === title.id),
      unlockedAt: unlockedTitles.find(t => t.title_id === title.id)?.unlocked_at,
    }));
  };

  return {
    unlockedTitles,
    isLoading,
    selectedTitle: profile?.selected_title ? getTitleById(profile.selected_title) : null,
    unlockTitle,
    selectTitle,
    checkAndUnlockTitles,
    getAllTitlesWithStatus,
    refresh: fetchUnlockedTitles,
  };
}
