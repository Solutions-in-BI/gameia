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
  };
}
