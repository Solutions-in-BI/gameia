/**
 * Hook para gerenciar métricas de organização B2B
 */

import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface EngagementMetrics {
  total_members: number;
  dau: number;
  wau: number;
  mau: number;
  avg_streak: number;
  total_activities: number;
  period: string;
}

export interface LearningMetrics {
  total_xp: number;
  avg_xp_per_user: number;
  total_coins: number;
  active_learners: number;
  top_sources: Array<{ source: string; total_xp: number; count: number }>;
  period: string;
}

export interface CompetencyMetrics {
  total_assessments: number;
  avg_score: number;
  users_assessed: number;
  improving_users: number;
  declining_users: number;
  by_skill: Array<{
    skill_name: string;
    icon: string;
    avg_score: number;
    users_count: number;
  }>;
}

export interface DecisionMetrics {
  total_decisions: number;
  avg_quality_score: number;
  avg_response_time: number;
  optimal_rate: number;
  by_depth: Array<{ reasoning_depth: string; count: number }>;
  period: string;
}

export interface MemberWithMetrics {
  user_id: string;
  org_role: string;
  joined_at: string;
  team_id: string | null;
  nickname: string;
  avatar_url: string | null;
  team_name: string | null;
  current_streak: number;
  total_xp: number;
  activities_week: number;
}

export type MetricPeriod = "7d" | "30d" | "90d";

export function useOrgMetrics(orgId: string | undefined) {
  const [engagement, setEngagement] = useState<EngagementMetrics | null>(null);
  const [learning, setLearning] = useState<LearningMetrics | null>(null);
  const [competency, setCompetency] = useState<CompetencyMetrics | null>(null);
  const [decision, setDecision] = useState<DecisionMetrics | null>(null);
  const [membersWithMetrics, setMembersWithMetrics] = useState<MemberWithMetrics[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [period, setPeriod] = useState<MetricPeriod>("30d");

  const fetchEngagement = useCallback(async (p: MetricPeriod = period) => {
    if (!orgId) return;
    
    try {
      const { data, error } = await supabase.rpc("get_org_engagement_metrics", {
        _org_id: orgId,
        _period: p,
      });
      
      if (error) throw error;
      if (data && typeof data === "object" && !Array.isArray(data) && !("error" in data)) {
        setEngagement(data as unknown as EngagementMetrics);
      }
    } catch (error) {
      console.error("Error fetching engagement metrics:", error);
    }
  }, [orgId, period]);

  const fetchLearning = useCallback(async (p: MetricPeriod = period) => {
    if (!orgId) return;
    
    try {
      const { data, error } = await supabase.rpc("get_org_learning_metrics", {
        _org_id: orgId,
        _period: p,
      });
      
      if (error) throw error;
      if (data && typeof data === "object" && !Array.isArray(data) && !("error" in data)) {
        setLearning(data as unknown as LearningMetrics);
      }
    } catch (error) {
      console.error("Error fetching learning metrics:", error);
    }
  }, [orgId, period]);

  const fetchCompetency = useCallback(async () => {
    if (!orgId) return;
    
    try {
      const { data, error } = await supabase.rpc("get_org_competency_metrics", {
        _org_id: orgId,
      });
      
      if (error) throw error;
      if (data && typeof data === "object" && !Array.isArray(data) && !("error" in data)) {
        setCompetency(data as unknown as CompetencyMetrics);
      }
    } catch (error) {
      console.error("Error fetching competency metrics:", error);
    }
  }, [orgId]);

  const fetchDecision = useCallback(async (p: MetricPeriod = period) => {
    if (!orgId) return;
    
    try {
      const { data, error } = await supabase.rpc("get_org_decision_metrics", {
        _org_id: orgId,
        _period: p,
      });
      
      if (error) throw error;
      if (data && typeof data === "object" && !Array.isArray(data) && !("error" in data)) {
        setDecision(data as unknown as DecisionMetrics);
      }
    } catch (error) {
      console.error("Error fetching decision metrics:", error);
    }
  }, [orgId, period]);

  const fetchMembersWithMetrics = useCallback(async () => {
    if (!orgId) return;
    
    try {
      const { data, error } = await supabase.rpc("get_org_members_with_metrics", {
        _org_id: orgId,
      });
      
      if (error) throw error;
      if (data && Array.isArray(data)) {
        setMembersWithMetrics(data as unknown as MemberWithMetrics[]);
      }
    } catch (error) {
      console.error("Error fetching members with metrics:", error);
    }
  }, [orgId]);

  const fetchAllMetrics = useCallback(async (p: MetricPeriod = period) => {
    setIsLoading(true);
    setPeriod(p);
    
    try {
      await Promise.all([
        fetchEngagement(p),
        fetchLearning(p),
        fetchCompetency(),
        fetchDecision(p),
        fetchMembersWithMetrics(),
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [fetchEngagement, fetchLearning, fetchCompetency, fetchDecision, fetchMembersWithMetrics, period]);

  return {
    engagement,
    learning,
    competency,
    decision,
    membersWithMetrics,
    isLoading,
    period,
    setPeriod,
    fetchAllMetrics,
    fetchEngagement,
    fetchLearning,
    fetchCompetency,
    fetchDecision,
    fetchMembersWithMetrics,
  };
}
