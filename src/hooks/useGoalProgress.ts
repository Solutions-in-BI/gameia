/**
 * Hook para gerenciar progresso automático de metas do PDI
 * Conecta eventos da plataforma ao sistema de PDI
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useOrganization } from "@/hooks/useOrganization";

interface ProgressEvent {
  goal_id: string;
  source_type: "training" | "module" | "game" | "challenge" | "cognitive_test" | "manual_checkin" | "manager_adjustment";
  source_id?: string;
  source_name?: string;
  progress_before: number;
  progress_after: number;
  progress_delta: number;
  xp_earned?: number;
  metadata?: Record<string, unknown>;
  created_at?: string;
}

interface LinkedAction {
  id: string;
  goal_id: string;
  action_type: string;
  action_id: string | null;
  action_name: string;
  priority: number;
  expected_progress_impact: number;
  suggested_at: string;
  completed_at: string | null;
  dismissed_at: string | null;
}

export function useGoalProgress(goalId?: string) {
  const { user } = useAuth();
  const { currentOrg } = useOrganization();
  const queryClient = useQueryClient();

  // Buscar histórico de progresso de uma meta específica
  const { data: progressHistory = [], isLoading: historyLoading } = useQuery({
    queryKey: ["goal-progress-history", goalId],
    queryFn: async () => {
      if (!goalId) return [];
      
      const { data, error } = await supabase
        .from("goal_progress_events")
        .select("*")
        .eq("goal_id", goalId)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as ProgressEvent[];
    },
    enabled: !!goalId,
  });

  // Buscar ações pendentes para uma meta
  const { data: pendingActions = [], isLoading: actionsLoading } = useQuery({
    queryKey: ["goal-pending-actions", goalId],
    queryFn: async () => {
      if (!goalId) return [];
      
      const { data, error } = await supabase
        .from("pdi_linked_actions")
        .select("*")
        .eq("goal_id", goalId)
        .is("completed_at", null)
        .is("dismissed_at", null)
        .order("priority", { ascending: true });

      if (error) throw error;
      return data as LinkedAction[];
    },
    enabled: !!goalId,
  });

  // Disparar atualização de progresso via Edge Function
  const triggerProgressUpdate = useMutation({
    mutationFn: async (params: {
      source_type: "training" | "module" | "game" | "challenge" | "cognitive_test";
      source_id: string;
      source_name?: string;
      event_type: string;
      score?: number;
      skill_ids?: string[];
    }) => {
      if (!user?.id) throw new Error("User not authenticated");

      const { data, error } = await supabase.functions.invoke("update-pdi-progress", {
        body: {
          user_id: user.id,
          organization_id: currentOrg?.id,
          ...params,
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ["my-pdi-plans"] });
      queryClient.invalidateQueries({ queryKey: ["goal-progress-history"] });
      queryClient.invalidateQueries({ queryKey: ["goal-pending-actions"] });
    },
  });

  // Adicionar ação sugerida para uma meta
  const addLinkedAction = useMutation({
    mutationFn: async (params: {
      goal_id: string;
      action_type: string;
      action_id?: string;
      action_name: string;
      priority?: number;
      expected_progress_impact?: number;
    }) => {
      if (!user?.id) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("pdi_linked_actions")
        .insert({
          ...params,
          user_id: user.id,
          organization_id: currentOrg?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goal-pending-actions"] });
    },
  });

  // Dispensar uma ação sugerida
  const dismissAction = useMutation({
    mutationFn: async (actionId: string) => {
      const { error } = await supabase
        .from("pdi_linked_actions")
        .update({ dismissed_at: new Date().toISOString() })
        .eq("id", actionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goal-pending-actions"] });
    },
  });

  // Marcar ação como concluída
  const completeAction = useMutation({
    mutationFn: async (actionId: string) => {
      const { error } = await supabase
        .from("pdi_linked_actions")
        .update({ completed_at: new Date().toISOString() })
        .eq("id", actionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goal-pending-actions"] });
    },
  });

  return {
    progressHistory,
    pendingActions,
    historyLoading,
    actionsLoading,
    triggerProgressUpdate,
    addLinkedAction,
    dismissAction,
    completeAction,
  };
}

// Hook para buscar todas as ações pendentes do usuário (para DailyPDIActions)
export function useAllPendingActions() {
  const { user } = useAuth();

  const { data: allPendingActions = [], isLoading } = useQuery({
    queryKey: ["all-pending-actions", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from("pdi_linked_actions")
        .select(`
          *,
          goal:goal_id (
            id,
            title,
            progress,
            priority
          )
        `)
        .eq("user_id", user.id)
        .is("completed_at", null)
        .is("dismissed_at", null)
        .order("priority", { ascending: true })
        .limit(10);

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  return { allPendingActions, isLoading };
}
