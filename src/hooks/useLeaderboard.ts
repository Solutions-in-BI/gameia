import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { LeaderboardEntry, NewLeaderboardEntry } from "@/types/leaderboard";

/**
 * ===========================================
 * HOOK: useLeaderboard
 * ===========================================
 * 
 * Gerencia o ranking online com Lovable Cloud.
 * Suporta realtime updates.
 * 
 * @example
 * const { entries, addScore, isLoading } = useLeaderboard("snake");
 */

export function useLeaderboard(gameType: "memory" | "snake", difficulty?: string) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /** Busca os melhores scores */
  const fetchLeaderboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      let query = supabase
        .from("leaderboard")
        .select("*")
        .eq("game_type", gameType)
        .order("score", { ascending: gameType === "memory" }) // Memory: menos movimentos = melhor
        .limit(10);

      if (difficulty) {
        query = query.eq("difficulty", difficulty);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      setEntries(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar ranking");
    } finally {
      setIsLoading(false);
    }
  }, [gameType, difficulty]);

  /** Adiciona um novo score ao ranking */
  const addScore = useCallback(async (entry: NewLeaderboardEntry) => {
    try {
      const { error: insertError } = await supabase
        .from("leaderboard")
        .insert([entry]);

      if (insertError) throw insertError;
      
      // Recarrega o ranking
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
          event: "INSERT",
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
    isLoading,
    error,
    addScore,
    refresh: fetchLeaderboard,
  };
}
