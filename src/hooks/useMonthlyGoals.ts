/**
 * Hook para gerenciar metas mensais
 * Permite criar, acompanhar e completar metas do mês
 */

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";
import { startOfMonth, endOfMonth, isWithinInterval, differenceInDays } from "date-fns";

export type MonthlyGoalType =
  | "reach_level"
  | "unlock_insignias"
  | "complete_trail"
  | "max_streak"
  | "skill_mastery"
  | "games_played"
  | "xp_earned"
  | "missions_completed";

export interface MonthlyGoal {
  id: string;
  user_id: string;
  goal_month: string;
  goal_type: MonthlyGoalType;
  title: string;
  description: string | null;
  target_value: number;
  current_value: number;
  xp_reward: number;
  coins_reward: number;
  insignia_reward_id: string | null;
  status: "active" | "completed" | "failed" | "abandoned";
  completed_at: string | null;
  icon: string;
}

export interface GoalTemplate {
  goal_type: MonthlyGoalType;
  title: string;
  description: string;
  icon: string;
  target_value: number;
  xp_reward: number;
  coins_reward: number;
}

interface UseMonthlyGoals {
  goals: MonthlyGoal[];
  isLoading: boolean;
  activeGoalsCount: number;
  completedGoalsCount: number;
  daysRemaining: number;
  availableTemplates: GoalTemplate[];
  createGoal: (template: GoalTemplate) => Promise<boolean>;
  updateGoalProgress: (goalId: string, newValue: number) => Promise<void>;
  completeGoal: (goalId: string) => Promise<{ success: boolean; xp?: number; coins?: number }>;
  abandonGoal: (goalId: string) => Promise<void>;
  refetch: () => Promise<void>;
}

// Templates de metas sugeridas
const GOAL_TEMPLATES: GoalTemplate[] = [
  {
    goal_type: "reach_level",
    title: "Subir de Nível",
    description: "Alcançar o próximo nível global",
    icon: "trending-up",
    target_value: 1,
    xp_reward: 300,
    coins_reward: 100,
  },
  {
    goal_type: "unlock_insignias",
    title: "Colecionador de Insígnias",
    description: "Desbloquear 3 novas insígnias",
    icon: "award",
    target_value: 3,
    xp_reward: 250,
    coins_reward: 75,
  },
  {
    goal_type: "max_streak",
    title: "Sequência Épica",
    description: "Manter streak de 14 dias",
    icon: "flame",
    target_value: 14,
    xp_reward: 400,
    coins_reward: 150,
  },
  {
    goal_type: "games_played",
    title: "Maratona de Jogos",
    description: "Jogar 30 partidas no mês",
    icon: "gamepad-2",
    target_value: 30,
    xp_reward: 200,
    coins_reward: 80,
  },
  {
    goal_type: "xp_earned",
    title: "Mestre do XP",
    description: "Ganhar 1000 XP no mês",
    icon: "zap",
    target_value: 1000,
    xp_reward: 350,
    coins_reward: 120,
  },
  {
    goal_type: "missions_completed",
    title: "Missões Perfeitas",
    description: "Completar 50 missões diárias",
    icon: "check-circle",
    target_value: 50,
    xp_reward: 500,
    coins_reward: 200,
  },
];

export function useMonthlyGoals(): UseMonthlyGoals {
  const { user } = useAuth();
  const [goals, setGoals] = useState<MonthlyGoal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Memoize month dates to prevent infinite re-renders
  const [currentMonthStr] = useState(() => {
    const now = new Date();
    return startOfMonth(now).toISOString().split("T")[0];
  });
  
  const monthEnd = endOfMonth(new Date());
  const daysRemaining = differenceInDays(monthEnd, new Date()) + 1;

  const fetchGoals = useCallback(async () => {
    if (!user) {
      setGoals([]);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("monthly_goals")
        .select("*")
        .eq("user_id", user.id)
        .eq("goal_month", currentMonthStr)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setGoals((data as MonthlyGoal[]) || []);
    } catch (err) {
      console.error("Erro ao buscar metas mensais:", err);
      setGoals([]);
    } finally {
      setIsLoading(false);
    }
  }, [user, currentMonthStr]);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const createGoal = useCallback(
    async (template: GoalTemplate): Promise<boolean> => {
      if (!user) return false;

      // Check if goal type already exists for this month
      const existingGoal = goals.find(
        (g) => g.goal_type === template.goal_type && g.status !== "abandoned"
      );
      if (existingGoal) {
        toast.error("Você já tem uma meta deste tipo este mês!");
        return false;
      }

      // Max 3 active goals
      const activeGoals = goals.filter((g) => g.status === "active");
      if (activeGoals.length >= 3) {
        toast.error("Você já tem 3 metas ativas! Complete ou abandone uma.");
        return false;
      }

      try {
        const { error } = await supabase.from("monthly_goals").insert({
          user_id: user.id,
          goal_month: currentMonthStr,
          goal_type: template.goal_type,
          title: template.title,
          description: template.description,
          target_value: template.target_value,
          xp_reward: template.xp_reward,
          coins_reward: template.coins_reward,
          icon: template.icon,
        });

        if (error) throw error;

        toast.success("Meta criada!", {
          description: `${template.title} adicionada às suas metas do mês`,
        });

        await fetchGoals();
        return true;
      } catch (err) {
        console.error("Erro ao criar meta:", err);
        toast.error("Erro ao criar meta");
        return false;
      }
    },
    [user, goals, currentMonthStr, fetchGoals]
  );

  const updateGoalProgress = useCallback(
    async (goalId: string, newValue: number) => {
      if (!user) return;

      const goal = goals.find((g) => g.id === goalId);
      if (!goal || goal.status !== "active") return;

      const clampedValue = Math.min(newValue, goal.target_value);

      try {
        await supabase
          .from("monthly_goals")
          .update({ current_value: clampedValue })
          .eq("id", goalId);

        await fetchGoals();
      } catch (err) {
        console.error("Erro ao atualizar progresso:", err);
      }
    },
    [user, goals, fetchGoals]
  );

  const completeGoal = useCallback(
    async (goalId: string): Promise<{ success: boolean; xp?: number; coins?: number }> => {
      if (!user) return { success: false };

      const goal = goals.find((g) => g.id === goalId);
      if (!goal) return { success: false };

      if (goal.status === "completed") {
        toast.error("Meta já completada!");
        return { success: false };
      }

      if (goal.current_value < goal.target_value) {
        toast.error("Meta ainda não atingida!");
        return { success: false };
      }

      try {
        // 1. Mark goal as complete
        await supabase
          .from("monthly_goals")
          .update({
            status: "completed",
            completed_at: new Date().toISOString(),
          })
          .eq("id", goalId);

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
              xp: (stats.xp || 0) + goal.xp_reward,
              coins: (stats.coins || 0) + goal.coins_reward,
            })
            .eq("user_id", user.id);
        }

        // 3. Log event
        await supabase.from("gamification_events").insert({
          user_id: user.id,
          event_type: "goal_complete",
          source_id: goalId,
          source_type: "monthly_goal",
          xp_earned: goal.xp_reward,
          coins_earned: goal.coins_reward,
        });

        toast.success("🏆 Meta Mensal Alcançada!", {
          description: `${goal.title}: +${goal.xp_reward} XP, +${goal.coins_reward} Moedas`,
        });

        await fetchGoals();
        return {
          success: true,
          xp: goal.xp_reward,
          coins: goal.coins_reward,
        };
      } catch (err) {
        console.error("Erro ao completar meta:", err);
        toast.error("Erro ao completar meta");
        return { success: false };
      }
    },
    [user, goals, fetchGoals]
  );

  const abandonGoal = useCallback(
    async (goalId: string) => {
      if (!user) return;

      try {
        await supabase
          .from("monthly_goals")
          .update({ status: "abandoned" })
          .eq("id", goalId);

        toast.info("Meta abandonada");
        await fetchGoals();
      } catch (err) {
        console.error("Erro ao abandonar meta:", err);
      }
    },
    [user, fetchGoals]
  );

  // Filter available templates (exclude already active/completed ones)
  const availableTemplates = GOAL_TEMPLATES.filter(
    (template) =>
      !goals.some(
        (g) => g.goal_type === template.goal_type && g.status !== "abandoned"
      )
  );

  const activeGoalsCount = goals.filter((g) => g.status === "active").length;
  const completedGoalsCount = goals.filter((g) => g.status === "completed").length;

  return {
    goals,
    isLoading,
    activeGoalsCount,
    completedGoalsCount,
    daysRemaining,
    availableTemplates,
    createGoal,
    updateGoalProgress,
    completeGoal,
    abandonGoal,
    refetch: fetchGoals,
  };
}
