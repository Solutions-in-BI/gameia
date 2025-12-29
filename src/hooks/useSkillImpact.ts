/**
 * useSkillImpact - Hub central para registrar e consultar impactos em skills
 * Toda ação na Gameia (jogos, testes, feedback, PDI, 1:1) passa por aqui
 */

import { useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Json } from "@/integrations/supabase/types";

export type SourceType = 'game' | 'cognitive_test' | 'feedback_360' | 'pdi_goal' | 'one_on_one' | 'training' | 'challenge';
export type ImpactType = 'xp_gain' | 'assessment' | 'peer_feedback' | 'manager_feedback' | 'self_assessment' | 'goal_completion' | 'test_score';

export interface SkillImpactEvent {
  id: string;
  user_id: string;
  organization_id: string | null;
  skill_id: string;
  source_type: SourceType;
  source_id: string | null;
  impact_type: ImpactType;
  impact_value: number;
  normalized_score: number | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface ConsolidatedSkillScore {
  skill_id: string;
  user_id: string;
  period_days: number;
  consolidated_score: number;
  breakdown: Record<string, {
    avg_score: number;
    count: number;
    total_xp: number;
  }>;
  total_events: number;
  last_activity: string | null;
}

export interface EvolutionSuggestions {
  pending_tests: Array<{
    test_id: string;
    name: string;
    related_skills: string[];
    xp_reward: number;
  }>;
  pending_feedbacks: Array<{
    assessment_id: string;
    evaluatee_id: string;
    relationship: string;
    cycle_name: string;
  }>;
  pdi_goals_due: Array<{
    goal_id: string;
    title: string;
    target_date: string;
    progress: number;
    skill_id: string | null;
  }>;
  upcoming_1on1s: Array<{
    meeting_id: string;
    scheduled_at: string;
    manager_id: string;
    suggested_topics: unknown[];
  }>;
  weak_skills: Array<{
    skill_id: string;
    skill_name: string;
    current_level: number;
    suggested_games: string[];
  }>;
}

export function useSkillImpact() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Buscar histórico de impactos do usuário
  const { data: impactHistory, isLoading: historyLoading } = useQuery({
    queryKey: ["skill-impacts", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from("skill_impact_events")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      return data as SkillImpactEvent[];
    },
    enabled: !!user?.id,
  });

  // Buscar sugestões de evolução
  const { data: suggestions, isLoading: suggestionsLoading } = useQuery({
    queryKey: ["evolution-suggestions", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .rpc("get_evolution_suggestions", { p_user_id: user.id });

      if (error) throw error;
      return data as unknown as EvolutionSuggestions;
    },
    enabled: !!user?.id,
  });

  // Registrar impacto em skill
  const recordImpact = useMutation({
    mutationFn: async ({
      skillId,
      sourceType,
      sourceId,
      impactType,
      impactValue,
      metadata = {}
    }: {
      skillId: string;
      sourceType: SourceType;
      sourceId?: string;
      impactType: ImpactType;
      impactValue: number;
      metadata?: Record<string, unknown>;
    }) => {
      if (!user?.id) throw new Error("Usuário não autenticado");

      const { data, error } = await supabase.rpc("record_skill_impact", {
        p_user_id: user.id,
        p_skill_id: skillId,
        p_source_type: sourceType,
        p_source_id: sourceId || null,
        p_impact_type: impactType,
        p_impact_value: impactValue,
        p_metadata: metadata as unknown as Json
      });

      if (error) throw error;
      return data as unknown as string;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["skill-impacts"] });
      queryClient.invalidateQueries({ queryKey: ["user-skill-levels"] });
      queryClient.invalidateQueries({ queryKey: ["evolution-suggestions"] });
    },
    onError: (error) => {
      console.error("Erro ao registrar impacto:", error);
      toast.error("Erro ao registrar progresso");
    }
  });

  // Obter score consolidado de uma skill
  const getConsolidatedScore = useCallback(async (
    skillId: string,
    periodDays = 90
  ): Promise<ConsolidatedSkillScore | null> => {
    if (!user?.id) return null;

    const { data, error } = await supabase.rpc("get_consolidated_skill_score", {
      p_user_id: user.id,
      p_skill_id: skillId,
      p_period_days: periodDays
    });

    if (error) {
      console.error("Erro ao obter score consolidado:", error);
      return null;
    }

    return data as unknown as ConsolidatedSkillScore;
  }, [user?.id]);

  // Obter histórico de uma skill específica
  const getSkillHistory = useCallback(async (
    skillId: string,
    limit = 50
  ): Promise<SkillImpactEvent[]> => {
    if (!user?.id) return [];

    const { data, error } = await supabase
      .from("skill_impact_events")
      .select("*")
      .eq("user_id", user.id)
      .eq("skill_id", skillId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Erro ao obter histórico:", error);
      return [];
    }

    return data as SkillImpactEvent[];
  }, [user?.id]);

  // Obter breakdown de fontes de uma skill
  const getSkillSources = useCallback(async (skillId: string) => {
    const score = await getConsolidatedScore(skillId);
    return score?.breakdown || {};
  }, [getConsolidatedScore]);

  // Timeline de evolução recente (todas as skills)
  const { data: evolutionTimeline, isLoading: timelineLoading } = useQuery({
    queryKey: ["evolution-timeline", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from("skill_impact_events")
        .select(`
          *,
          skill:skill_configurations(id, name, icon, category)
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  return {
    // Dados
    impactHistory,
    suggestions,
    evolutionTimeline,
    
    // Loading states
    historyLoading,
    suggestionsLoading,
    timelineLoading,
    
    // Ações
    recordImpact,
    
    // Funções de consulta
    getConsolidatedScore,
    getSkillHistory,
    getSkillSources,
  };
}
