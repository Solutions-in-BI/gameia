/**
 * Hook para gerenciar missões diárias
 * Gera missões automaticamente e gerencia progresso/completude
 */

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface DailyMission {
  id: string;
  user_id: string;
  mission_date: string;
  mission_type: string;
  target_game_type: string | null;
  target_skill_id: string | null;
  target_value: number;
  current_value: number;
  xp_reward: number;
  coins_reward: number;
  is_completed: boolean;
  completed_at: string | null;
  is_bonus: boolean;
  title: string;
  description: string | null;
  icon: string;
}

interface UseDailyMissions {
  missions: DailyMission[];
  isLoading: boolean;
  completedCount: number;
  totalCount: number;
  bonusMission: DailyMission | null;
  totalXpAvailable: number;
  totalCoinsAvailable: number;
  updateProgress: (missionType: string, increment?: number, gameType?: string) => Promise<void>;
  claimMission: (missionId: string) => Promise<{ success: boolean; xp?: number; coins?: number }>;
  refetch: () => Promise<void>;
}

export function useDailyMissions(): UseDailyMissions {
  const { user } = useAuth();
  const [missions, setMissions] = useState<DailyMission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMissions = useCallback(async () => {
    if (!user) {
      setMissions([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      // Call the generate function which returns existing or creates new
      const { data, error } = await supabase.rpc("generate_daily_missions", {
        p_user_id: user.id,
      });

      if (error) {
        // If the function doesn't exist yet, try fetching directly
        console.warn("RPC not available, fetching directly:", error);
        const today = new Date().toISOString().split("T")[0];
        const { data: directData, error: directError } = await supabase
          .from("daily_missions")
          .select("*")
          .eq("user_id", user.id)
          .eq("mission_date", today)
          .order("is_bonus", { ascending: true });

        if (directError) throw directError;
        setMissions((directData as DailyMission[]) || []);
      } else {
        setMissions((data as DailyMission[]) || []);
      }
    } catch (err) {
      console.error("Erro ao buscar missões diárias:", err);
      setMissions([]);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchMissions();
  }, [fetchMissions]);

  const updateProgress = useCallback(
    async (missionType: string, increment = 1, gameType?: string) => {
      if (!user) return;

      try {
        // Try RPC first
        const { error: rpcError } = await supabase.rpc("update_mission_progress", {
          p_mission_type: missionType,
          p_increment: increment,
          p_game_type: gameType || null,
        });

        if (rpcError) {
          // Fallback to direct update
          const today = new Date().toISOString().split("T")[0];
          
          // Get matching missions
          const { data: matchingMissions } = await supabase
            .from("daily_missions")
            .select("id, current_value, target_value")
            .eq("user_id", user.id)
            .eq("mission_date", today)
            .eq("mission_type", missionType)
            .eq("is_completed", false);

          if (matchingMissions) {
            for (const mission of matchingMissions) {
              if (!gameType || !mission) {
                const newValue = Math.min(
                  (mission.current_value || 0) + increment,
                  mission.target_value
                );
                await supabase
                  .from("daily_missions")
                  .update({ current_value: newValue })
                  .eq("id", mission.id);
              }
            }
          }
        }

        // Refetch to get updated state
        await fetchMissions();
      } catch (err) {
        console.error("Erro ao atualizar progresso:", err);
      }
    },
    [user, fetchMissions]
  );

  const claimMission = useCallback(
    async (missionId: string): Promise<{ success: boolean; xp?: number; coins?: number }> => {
      if (!user) return { success: false };

      const mission = missions.find((m) => m.id === missionId);
      if (!mission) return { success: false };

      if (mission.is_completed) {
        toast.error("Missão já completada!");
        return { success: false };
      }

      if (mission.current_value < mission.target_value) {
        toast.error("Missão ainda não concluída!");
        return { success: false };
      }

      try {
        // Try RPC first
        const { data: rpcResult, error: rpcError } = await supabase.rpc(
          "complete_daily_mission",
          { p_mission_id: missionId }
        );

        if (rpcError) {
          // Fallback to direct operations
          // 1. Mark mission as complete
          await supabase
            .from("daily_missions")
            .update({ is_completed: true, completed_at: new Date().toISOString() })
            .eq("id", missionId);

          // 2. Award XP and coins
          const { data: stats } = await supabase
            .from("user_stats")
            .select("xp, coins")
            .eq("user_id", user.id)
            .single();

          if (stats) {
            await supabase
              .from("user_stats")
              .update({
                xp: (stats.xp || 0) + mission.xp_reward,
                coins: (stats.coins || 0) + mission.coins_reward,
              })
              .eq("user_id", user.id);
          }

          // 3. Log event
          await supabase.from("gamification_events").insert({
            user_id: user.id,
            event_type: "mission_complete",
            source_id: missionId,
            source_type: "daily_mission",
            xp_earned: mission.xp_reward,
            coins_earned: mission.coins_reward,
          });
        }

        toast.success(
          mission.is_bonus ? "🌟 Missão Bônus Completa!" : "✅ Missão Completa!",
          {
            description: `+${mission.xp_reward} XP, +${mission.coins_reward} Moedas`,
          }
        );

        await fetchMissions();
        return {
          success: true,
          xp: mission.xp_reward,
          coins: mission.coins_reward,
        };
      } catch (err) {
        console.error("Erro ao completar missão:", err);
        toast.error("Erro ao completar missão");
        return { success: false };
      }
    },
    [user, missions, fetchMissions]
  );

  // Computed values
  const completedCount = missions.filter((m) => m.is_completed).length;
  const totalCount = missions.length;
  const bonusMission = missions.find((m) => m.is_bonus) || null;
  const totalXpAvailable = missions
    .filter((m) => !m.is_completed)
    .reduce((sum, m) => sum + m.xp_reward, 0);
  const totalCoinsAvailable = missions
    .filter((m) => !m.is_completed)
    .reduce((sum, m) => sum + m.coins_reward, 0);

  return {
    missions,
    isLoading,
    completedCount,
    totalCount,
    bonusMission,
    totalXpAvailable,
    totalCoinsAvailable,
    updateProgress,
    claimMission,
    refetch: fetchMissions,
  };
}
