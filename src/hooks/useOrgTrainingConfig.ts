/**
 * Hook para gerenciamento de configuração de treinamentos por organização
 */

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface OrgTrainingConfig {
  id: string;
  organization_id: string;
  training_id: string;
  is_enabled: boolean;
  requirement_type: "optional" | "required" | "suggested";
  xp_multiplier: number;
  coins_multiplier: number;
  team_ids: string[] | null;
  role_ids: string[] | null;
  deadline_days: number | null;
  created_at: string;
  updated_at: string;
}

export interface TrainingAssignment {
  id: string;
  user_id: string;
  training_id: string;
  assigned_by: string;
  assigned_at: string;
  deadline_at: string | null;
  completed_at: string | null;
  progress_percent: number;
}

export interface TrainingAnalytics {
  id: string;
  organization_id: string;
  training_id: string;
  module_id: string | null;
  user_id: string;
  event_type: string;
  score: number | null;
  time_spent_seconds: number | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export function useOrgTrainingConfig(orgId?: string) {
  const { user } = useAuth();
  const [configs, setConfigs] = useState<OrgTrainingConfig[]>([]);
  const [analytics, setAnalytics] = useState<TrainingAnalytics[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchConfigs = useCallback(async () => {
    if (!orgId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const { data: configsData, error: configsError } = await supabase
        .from("org_training_config")
        .select("*")
        .eq("organization_id", orgId);

      if (configsError) throw configsError;
      setConfigs((configsData || []) as OrgTrainingConfig[]);

      // Fetch analytics
      const { data: analyticsData, error: analyticsError } = await supabase
        .from("training_analytics")
        .select("*")
        .eq("organization_id", orgId)
        .order("created_at", { ascending: false })
        .limit(500);

      if (analyticsError) throw analyticsError;
      setAnalytics((analyticsData || []) as TrainingAnalytics[]);
    } catch (error) {
      console.error("Error fetching training configs:", error);
    } finally {
      setIsLoading(false);
    }
  }, [orgId]);

  useEffect(() => {
    fetchConfigs();
  }, [fetchConfigs]);

  // Get config for specific training
  const getTrainingConfig = (trainingId: string) => {
    return configs.find((c) => c.training_id === trainingId);
  };

  // Get all enabled trainings
  const getEnabledTrainings = () => {
    return configs.filter((c) => c.is_enabled);
  };

  // Get required trainings for a user
  const getRequiredTrainings = (teamIds?: string[], roleIds?: string[]) => {
    return configs.filter((c) => {
      if (c.requirement_type !== "required") return false;
      if (!c.is_enabled) return false;
      
      // Check team filter
      if (c.team_ids && c.team_ids.length > 0) {
        if (!teamIds || !teamIds.some((t) => c.team_ids?.includes(t))) {
          return false;
        }
      }
      
      // Check role filter
      if (c.role_ids && c.role_ids.length > 0) {
        if (!roleIds || !roleIds.some((r) => c.role_ids?.includes(r))) {
          return false;
        }
      }
      
      return true;
    });
  };

  // Calculate analytics metrics
  const getTrainingMetrics = (trainingId: string) => {
    const trainingAnalytics = analytics.filter((a) => a.training_id === trainingId);
    
    const completions = trainingAnalytics.filter((a) => a.event_type === "training_completed").length;
    const starts = trainingAnalytics.filter((a) => a.event_type === "training_started").length;
    const totalTime = trainingAnalytics.reduce((acc, a) => acc + (a.time_spent_seconds || 0), 0);
    const avgScore = trainingAnalytics
      .filter((a) => a.score !== null)
      .reduce((acc, a, _, arr) => acc + (a.score || 0) / arr.length, 0);

    return {
      completions,
      starts,
      completionRate: starts > 0 ? Math.round((completions / starts) * 100) : 0,
      totalTimeMinutes: Math.round(totalTime / 60),
      avgScore: Math.round(avgScore),
    };
  };

  // Admin functions
  const upsertConfig = async (config: Partial<OrgTrainingConfig> & { training_id: string }) => {
    const existingConfig = configs.find((c) => c.training_id === config.training_id);
    
    if (existingConfig) {
      const { data, error } = await supabase
        .from("org_training_config")
        .update({
          ...config,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingConfig.id)
        .select()
        .single();
      if (error) throw error;
      await fetchConfigs();
      return data;
    } else {
      const { data, error } = await supabase
        .from("org_training_config")
        .insert({
          ...config,
          organization_id: orgId,
        } as any)
        .select()
        .single();
      if (error) throw error;
      await fetchConfigs();
      return data;
    }
  };

  const deleteConfig = async (trainingId: string) => {
    const config = configs.find((c) => c.training_id === trainingId);
    if (!config) return;

    const { error } = await supabase
      .from("org_training_config")
      .delete()
      .eq("id", config.id);
    if (error) throw error;
    await fetchConfigs();
  };

  // Log analytics event
  const logAnalyticsEvent = async (event: Omit<TrainingAnalytics, "id" | "created_at">) => {
    const { error } = await supabase
      .from("training_analytics")
      .insert({
        ...event,
        organization_id: orgId,
      } as any);
    if (error) throw error;
    await fetchConfigs();
  };

  return {
    configs,
    analytics,
    isLoading,
    refetch: fetchConfigs,
    getTrainingConfig,
    getEnabledTrainings,
    getRequiredTrainings,
    getTrainingMetrics,
    upsertConfig,
    deleteConfig,
    logAnalyticsEvent,
  };
}
