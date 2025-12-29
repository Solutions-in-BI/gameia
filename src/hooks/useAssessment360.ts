import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useOrganization } from "@/hooks/useOrganization";
import { toast } from "sonner";
import type { Json } from "@/integrations/supabase/types";

export interface AssessmentCycle {
  id: string;
  organization_id: string;
  name: string;
  description: string | null;
  cycle_type: string;
  start_date: string;
  end_date: string;
  status: string;
  config: Json;
  created_by: string | null;
  created_at: string;
}

export interface Assessment360 {
  id: string;
  cycle_id: string;
  evaluatee_id: string;
  evaluator_id: string;
  relationship: string;
  status: string;
  responses: Record<string, unknown>;
  submitted_at: string | null;
  created_at: string;
}

export interface Assessment360Result {
  id: string;
  cycle_id: string;
  user_id: string;
  consolidated_scores: Record<string, number> | null;
  strengths: string[] | null;
  development_areas: string[] | null;
  ai_insights: string | null;
  created_at: string;
}

export function useAssessment360() {
  const { user } = useAuth();
  const { currentOrg } = useOrganization();
  const queryClient = useQueryClient();

  const { data: cycles = [], isLoading: cyclesLoading } = useQuery({
    queryKey: ["assessment-cycles", currentOrg?.id],
    queryFn: async () => {
      if (!currentOrg?.id) return [];
      const { data, error } = await supabase
        .from("assessment_cycles")
        .select("*")
        .eq("organization_id", currentOrg.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as AssessmentCycle[];
    },
    enabled: !!currentOrg?.id,
  });

  const { data: myAssessments = [], isLoading: assessmentsLoading } = useQuery({
    queryKey: ["my-assessments-360", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("assessments_360")
        .select("*")
        .eq("evaluator_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Assessment360[];
    },
    enabled: !!user?.id,
  });

  const createCycle = useMutation({
    mutationFn: async (cycle: Partial<AssessmentCycle>) => {
      const { data, error } = await supabase
        .from("assessment_cycles")
        .insert({
          name: cycle.name!,
          start_date: cycle.start_date!,
          end_date: cycle.end_date!,
          organization_id: currentOrg?.id,
          created_by: user?.id,
          description: cycle.description,
          cycle_type: cycle.cycle_type,
          status: cycle.status,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assessment-cycles"] });
      toast.success("Ciclo de avaliação criado com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao criar ciclo de avaliação");
    },
  });

  const updateCycle = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<AssessmentCycle> & { id: string }) => {
      const { data, error } = await supabase
        .from("assessment_cycles")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assessment-cycles"] });
      toast.success("Ciclo atualizado com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao atualizar ciclo");
    },
  });

  const createAssessment = useMutation({
    mutationFn: async (assessment: Partial<Assessment360>) => {
      const { data, error } = await supabase
        .from("assessments_360")
        .insert({
          cycle_id: assessment.cycle_id,
          evaluatee_id: assessment.evaluatee_id!,
          evaluator_id: assessment.evaluator_id!,
          relationship: assessment.relationship!,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assessments-360"] });
      toast.success("Avaliação criada com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao criar avaliação");
    },
  });

  const submitAssessment = useMutation({
    mutationFn: async ({ id, responses }: { id: string; responses: Record<string, unknown> }) => {
      // 1. Atualizar avaliação
      const { data, error } = await supabase
        .from("assessments_360")
        .update({
          responses: responses as never,
          status: "completed",
          submitted_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      
      // 2. Processar conclusão (propagar para skills/PDI)
      try {
        await supabase.rpc("process_assessment_completion", {
          p_assessment_id: id,
        });
      } catch (processError) {
        console.warn("[Assessment360] Erro ao processar conclusão:", processError);
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-assessments-360"] });
      queryClient.invalidateQueries({ queryKey: ["skill-impacts"] });
      queryClient.invalidateQueries({ queryKey: ["user-skill-levels"] });
      queryClient.invalidateQueries({ queryKey: ["development-plans"] });
      toast.success("Avaliação enviada com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao enviar avaliação");
    },
  });

  return {
    cycles,
    cyclesLoading,
    myAssessments,
    assessmentsLoading,
    createCycle,
    updateCycle,
    createAssessment,
    submitAssessment,
  };
}
