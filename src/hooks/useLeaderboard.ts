import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { LeaderboardEntry, NewLeaderboardEntry } from "@/types/leaderboard";

/**
 * ===========================================
 * HOOK: useLeaderboard
 * ===========================================
 * 
 * Gerencia o ranking online com Lovable Cloud.
 * Suporta realtime updates e posição do jogador.
 */

interface UserRankInfo {
  entry: LeaderboardEntry;
  position: number;
}

export function useLeaderboard(gameType: "memory" | "snake" | "dino", difficulty?: string) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<UserRankInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /** Busca os melhores scores */
  const fetchLeaderboard = useCallback(async (userId?: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Busca top 10
      let query = supabase
        .from("leaderboard")
        .select("*")
        .eq("game_type", gameType)
        .order("score", { ascending: gameType === "memory" })
        .limit(10);

      if (difficulty) {
        query = query.eq("difficulty", difficulty);
      }

      const { data, error: fetchError } = await query;
      if (fetchError) throw fetchError;
      setEntries(data || []);

      // Busca posição do usuário se logado
      if (userId) {
        await fetchUserRank(userId, data || []);
      } else {
        setUserRank(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar ranking");
    } finally {
      setIsLoading(false);
    }
  }, [gameType, difficulty]);

  /** Busca a posição do usuário no ranking */
  const fetchUserRank = async (userId: string, topEntries: LeaderboardEntry[]) => {
    try {
      // Verifica se usuário já está no top 10
      const inTop10 = topEntries.find(e => e.user_id === userId);
      if (inTop10) {
        const position = topEntries.findIndex(e => e.user_id === userId) + 1;
        setUserRank({ entry: inTop10, position });
        return;
      }

      // Busca entrada do usuário
      let userQuery = supabase
        .from("leaderboard")
        .select("*")
        .eq("game_type", gameType)
        .eq("user_id", userId);

      if (difficulty) {
        userQuery = userQuery.eq("difficulty", difficulty);
      }

      const { data: userData } = await userQuery.maybeSingle();
      
      if (!userData) {
        setUserRank(null);
        return;
      }

      // Conta quantos scores são melhores
      let countQuery = supabase
        .from("leaderboard")
        .select("id", { count: "exact", head: true })
        .eq("game_type", gameType);

      if (difficulty) {
        countQuery = countQuery.eq("difficulty", difficulty);
      }

      // Para memory: conta quantos tem menos movimentos
      // Para outros: conta quantos tem mais pontos
      if (gameType === "memory") {
        countQuery = countQuery.lt("score", userData.score);
      } else {
        countQuery = countQuery.gt("score", userData.score);
      }

      const { count } = await countQuery;
      const position = (count || 0) + 1;

      setUserRank({ entry: userData, position });
    } catch (err) {
      console.error("Erro ao buscar posição:", err);
    }
  };

  /** Adiciona ou atualiza um score no ranking */
  const addScore = useCallback(async (entry: NewLeaderboardEntry) => {
    try {
      // Se não tem user_id, não pode salvar (precisa estar logado)
      if (!entry.user_id) {
        return { 
          success: false, 
          error: "Faça login para salvar seu score no ranking" 
        };
      }

      // Para Snake/Dino: mantém o maior score
      // Para Memory: mantém o menor score (menos movimentos = melhor)
      const isMemory = entry.game_type === "memory";
      
      // Busca score existente do usuário
      let existingQuery = supabase
        .from("leaderboard")
        .select("score")
        .eq("user_id", entry.user_id)
        .eq("game_type", entry.game_type);
      
      if (entry.difficulty) {
        existingQuery = existingQuery.eq("difficulty", entry.difficulty);
      } else {
        existingQuery = existingQuery.is("difficulty", null);
      }
      
      const { data: existing } = await existingQuery.maybeSingle();
      
      // Se já existe, verifica se o novo score é melhor
      if (existing) {
        const shouldUpdate = isMemory 
          ? entry.score < existing.score  // Memory: menos movimentos = melhor
          : entry.score > existing.score; // Snake/Dino: mais pontos = melhor
        
        if (!shouldUpdate) {
          return { success: true, message: "Score anterior era melhor" };
        }
      }
      
      // Upsert: insere ou atualiza
      const { error: upsertError } = await supabase
        .from("leaderboard")
        .upsert([entry], { 
          onConflict: "user_id,game_type,difficulty",
          ignoreDuplicates: false 
        });

      if (upsertError) throw upsertError;
      
      await fetchLeaderboard();
      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err.message : "Erro ao salvar score" 
      };
    }
  }, [fetchLeaderboard]);

  // Carrega ao montar e configura realtime
  useEffect(() => {
    fetchLeaderboard();

    // Subscribe para updates em tempo real
    const channel = supabase
      .channel(`leaderboard-${gameType}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "leaderboard",
          filter: `game_type=eq.${gameType}`,
        },
        () => {
          fetchLeaderboard();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [gameType, difficulty, fetchLeaderboard]);

  return {
    entries,
    userRank,
    isLoading,
    error,
    addScore,
    refresh: fetchLeaderboard,
  };
}
