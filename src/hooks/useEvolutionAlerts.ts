/**
 * Hook para gerenciar alertas de evolução
 * Busca, marca como lido/dispensado e atualiza alertas proativos
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";

export interface EvolutionAlert {
  id: string;
  user_id: string;
  organization_id: string | null;
  alert_type: "skill_stagnation" | "inactivity" | "performance_drop" | "goal_overdue" | "positive_streak" | "training_pending" | "challenge_completed" | "badge_earned";
  severity: "info" | "warning" | "critical" | "positive";
  title: string;
  description: string | null;
  suggested_action: string | null;
  suggested_action_type: "training" | "game" | "challenge" | "feedback" | "pdi" | "1on1" | "view" | null;
  suggested_action_id: string | null;
  related_entity_type: string | null;
  related_entity_id: string | null;
  metadata: Record<string, unknown>;
  is_read: boolean;
  is_dismissed: boolean;
  created_at: string;
  expires_at: string | null;
}

export interface AlertStats {
  total: number;
  unread: number;
  critical: number;
  positive: number;
  byType: Record<string, number>;
}

export function useEvolutionAlerts() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch active alerts (not dismissed)
  const { data: alerts = [], isLoading, refetch } = useQuery({
    queryKey: ["evolution-alerts", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from("evolution_alerts")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_dismissed", false)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      return (data || []) as EvolutionAlert[];
    },
    enabled: !!user?.id,
    staleTime: 60000, // 1 minute
  });

  // Calculate stats
  const stats: AlertStats = {
    total: alerts.length,
    unread: alerts.filter(a => !a.is_read).length,
    critical: alerts.filter(a => a.severity === "critical").length,
    positive: alerts.filter(a => a.severity === "positive").length,
    byType: alerts.reduce((acc, alert) => {
      acc[alert.alert_type] = (acc[alert.alert_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  };

  // Get unread alerts only
  const unreadAlerts = alerts.filter(a => !a.is_read);

  // Get alerts by severity
  const getAlertsBySeverity = (severity: EvolutionAlert["severity"]) => 
    alerts.filter(a => a.severity === severity);

  // Mark alert as read
  const markAsRead = useMutation({
    mutationFn: async (alertId: string) => {
      const { error } = await supabase
        .from("evolution_alerts")
        .update({ is_read: true })
        .eq("id", alertId)
        .eq("user_id", user?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["evolution-alerts"] });
    }
  });

  // Mark all as read
  const markAllAsRead = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("evolution_alerts")
        .update({ is_read: true })
        .eq("user_id", user?.id)
        .eq("is_read", false);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["evolution-alerts"] });
      toast({ title: "Todos os alertas marcados como lidos" });
    }
  });

  // Dismiss alert
  const dismissAlert = useMutation({
    mutationFn: async (alertId: string) => {
      const { error } = await supabase
        .from("evolution_alerts")
        .update({ is_dismissed: true })
        .eq("id", alertId)
        .eq("user_id", user?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["evolution-alerts"] });
    }
  });

  // Trigger pattern detection (for manual refresh)
  const triggerDetection = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("detect-patterns");
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["evolution-alerts"] });
      toast({ 
        title: "Análise concluída",
        description: `${data?.alertsCreated || 0} novos alertas gerados`
      });
    },
    onError: (error) => {
      console.error("Error triggering detection:", error);
      toast({ 
        title: "Erro na análise",
        variant: "destructive"
      });
    }
  });

  return {
    alerts,
    unreadAlerts,
    stats,
    isLoading,
    getAlertsBySeverity,
    markAsRead: markAsRead.mutate,
    markAllAsRead: markAllAsRead.mutate,
    dismissAlert: dismissAlert.mutate,
    triggerDetection: triggerDetection.mutate,
    isDetecting: triggerDetection.isPending,
    refetch
  };
}
