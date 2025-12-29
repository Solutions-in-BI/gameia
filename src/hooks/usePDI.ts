import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useOrganization } from "@/hooks/useOrganization";
import { toast } from "sonner";

export interface DevelopmentPlan {
  id: string;
  organization_id: string;
  user_id: string;
  manager_id: string | null;
  title: string;
  period_start: string | null;
  period_end: string | null;
  status: string;
  overall_progress: number;
  xp_on_completion: number;
  created_at: string;
  updated_at: string;
}

export interface DevelopmentGoal {
  id: string;
  plan_id: string;
  skill_id: string | null;
  title: string;
  description: string | null;
  success_criteria: string[] | null;
  target_date: string | null;
  priority: string;
  status: string;
  progress: number;
  evidence_urls: string[] | null;
  manager_notes: string | null;
  xp_reward: number;
  created_at: string;
}

export interface GoalCheckIn {
  id: string;
  goal_id: string;
  user_id: string;
  progress_update: string | null;
  blockers: string | null;
  new_progress: number | null;
  checked_by: string | null;
  created_at: string;
}

export function usePDI() {
  const { user } = useAuth();
  const { currentOrg } = useOrganization();
  const queryClient = useQueryClient();

  const { data: plans = [], isLoading: plansLoading } = useQuery({
    queryKey: ["development-plans", currentOrg?.id],
    queryFn: async () => {
      if (!currentOrg?.id) return [];
      const { data, error } = await supabase
        .from("development_plans")
        .select("*")
        .eq("organization_id", currentOrg.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as DevelopmentPlan[];
    },
    enabled: !!currentOrg?.id,
  });

  const { data: myPlans = [], isLoading: myPlansLoading } = useQuery({
    queryKey: ["my-development-plans", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("development_plans")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as DevelopmentPlan[];
    },
    enabled: !!user?.id,
  });

  const getGoalsForPlan = async (planId: string): Promise<DevelopmentGoal[]> => {
    const { data, error } = await supabase
      .from("development_goals")
      .select("*")
      .eq("plan_id", planId)
      .order("created_at", { ascending: true });

    if (error) throw error;
    return data as DevelopmentGoal[];
  };

  const createPlan = useMutation({
    mutationFn: async (plan: Partial<DevelopmentPlan>) => {
      const { data, error } = await supabase
        .from("development_plans")
        .insert({
          title: plan.title!,
          user_id: plan.user_id || user?.id!,
          organization_id: currentOrg?.id,
          manager_id: plan.manager_id,
          period_start: plan.period_start,
          period_end: plan.period_end,
          status: plan.status,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["development-plans"] });
      queryClient.invalidateQueries({ queryKey: ["my-development-plans"] });
      toast.success("PDI criado com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao criar PDI");
    },
  });

  const updatePlan = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<DevelopmentPlan> & { id: string }) => {
      const { data, error } = await supabase
        .from("development_plans")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["development-plans"] });
      queryClient.invalidateQueries({ queryKey: ["my-development-plans"] });
      toast.success("PDI atualizado com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao atualizar PDI");
    },
  });

  const createGoal = useMutation({
    mutationFn: async (goal: Partial<DevelopmentGoal>) => {
      const { data, error } = await supabase
        .from("development_goals")
        .insert({
          plan_id: goal.plan_id,
          title: goal.title!,
          description: goal.description,
          skill_id: goal.skill_id,
          target_date: goal.target_date,
          priority: goal.priority,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["development-goals"] });
      toast.success("Meta criada com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao criar meta");
    },
  });

  const updateGoal = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<DevelopmentGoal> & { id: string }) => {
      const { data, error } = await supabase
        .from("development_goals")
        .update({
          title: updates.title,
          description: updates.description,
          progress: updates.progress,
          status: updates.status,
          priority: updates.priority,
          target_date: updates.target_date,
          manager_notes: updates.manager_notes,
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["development-goals"] });
      toast.success("Meta atualizada com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao atualizar meta");
    },
  });

  const addCheckIn = useMutation({
    mutationFn: async (checkIn: Partial<GoalCheckIn>) => {
      const { data, error } = await supabase
        .from("goal_check_ins")
        .insert({
          ...checkIn,
          user_id: user?.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Update goal progress if new_progress is provided
      if (checkIn.goal_id && checkIn.new_progress !== undefined) {
        await supabase
          .from("development_goals")
          .update({ progress: checkIn.new_progress })
          .eq("id", checkIn.goal_id);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["development-goals"] });
      queryClient.invalidateQueries({ queryKey: ["goal-check-ins"] });
      toast.success("Check-in registrado com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao registrar check-in");
    },
  });

  // Buscar sugestões de metas PDI baseadas em eventos
  const { data: pdiSuggestions = [], isLoading: suggestionsLoading, refetch: refetchSuggestions } = useQuery({
    queryKey: ["pdi-suggestions", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase.rpc("get_pdi_suggestions_for_user", {
        p_user_id: user.id,
      });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  // Sugerir metas a partir de uma avaliação
  const suggestGoalsFromAssessment = useMutation({
    mutationFn: async (assessmentCycleId: string) => {
      if (!user?.id) throw new Error("Usuário não autenticado");
      const { data, error } = await supabase.rpc("suggest_pdi_goals_from_assessment", {
        p_user_id: user.id,
        p_assessment_cycle_id: assessmentCycleId,
      });
      if (error) throw error;
      return data as {
        success: boolean;
        plan_id: string;
        suggestions: Array<{
          skill_id: string;
          skill_name: string;
          category: string;
          current_score: number;
          suggested_goal: string;
          suggested_description: string;
          priority: string;
          xp_reward: number;
        }>;
        suggestions_count: number;
      };
    },
    onSuccess: (result) => {
      if (result.success && result.suggestions_count > 0) {
        toast.success(`${result.suggestions_count} sugestão(ões) de meta encontrada(s)!`);
        queryClient.invalidateQueries({ queryKey: ["pdi-suggestions"] });
      }
    },
    onError: () => {
      toast.error("Erro ao gerar sugestões de metas");
    },
  });

  // Criar meta PDI a partir de uma sugestão
  const createGoalFromSuggestion = useMutation({
    mutationFn: async ({
      planId,
      skillId,
      title,
      description,
      priority = "medium",
      xpReward = 100,
      targetDate,
      originAssessmentId,
    }: {
      planId: string;
      skillId: string;
      title: string;
      description: string;
      priority?: string;
      xpReward?: number;
      targetDate?: string;
      originAssessmentId?: string;
    }) => {
      const { data, error } = await supabase.rpc("create_pdi_goal_from_suggestion", {
        p_plan_id: planId,
        p_skill_id: skillId,
        p_title: title,
        p_description: description,
        p_priority: priority,
        p_xp_reward: xpReward,
        p_target_date: targetDate || null,
        p_origin_assessment_id: originAssessmentId || null,
      });
      if (error) throw error;
      return data as string; // goal_id
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["development-goals"] });
      queryClient.invalidateQueries({ queryKey: ["development-plans"] });
      queryClient.invalidateQueries({ queryKey: ["pdi-suggestions"] });
      toast.success("Meta criada a partir da sugestão!");
    },
    onError: () => {
      toast.error("Erro ao criar meta");
    },
  });

  return {
    plans,
    plansLoading,
    myPlans,
    myPlansLoading,
    getGoalsForPlan,
    createPlan,
    updatePlan,
    createGoal,
    updateGoal,
    addCheckIn,
    // Novas funcionalidades de sugestões
    pdiSuggestions,
    suggestionsLoading,
    refetchSuggestions,
    suggestGoalsFromAssessment,
    createGoalFromSuggestion,
    hasPendingSuggestions: pdiSuggestions.length > 0,
  };
}
