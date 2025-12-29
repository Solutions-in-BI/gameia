import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useOrganization } from "@/hooks/useOrganization";
import { useCoreEvents } from "@/hooks/useCoreEvents";
import { toast } from "sonner";
import type {
  AssessmentSuggestion,
  AssessmentContextLink,
  CreateContextualAssessmentParams,
  AssessmentCompletionResult,
  SuggestedAssessment,
  SuggestionStatus,
} from "@/types/contextualAssessments";

export function useContextualAssessments() {
  const { user } = useAuth();
  const { currentOrg } = useOrganization();
  const { recordFeedbackGiven } = useCoreEvents();
  const queryClient = useQueryClient();

  // Buscar sugestões pendentes do usuário
  const { data: pendingSuggestions = [], isLoading: suggestionsLoading } = useQuery({
    queryKey: ["assessment-suggestions", user?.id, "pending"],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from("assessment_suggestions")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "pending")
        .order("priority", { ascending: true })
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as AssessmentSuggestion[];
    },
    enabled: !!user?.id,
  });

  // Buscar loops abertos (contextos de avaliação não fechados)
  const { data: openLoops = [], isLoading: loopsLoading } = useQuery({
    queryKey: ["assessment-context-links", currentOrg?.id, "open"],
    queryFn: async () => {
      if (!currentOrg?.id) return [];
      
      const { data, error } = await supabase
        .from("assessment_context_links")
        .select(`
          *,
          assessment_cycles!inner(
            id,
            name,
            organization_id,
            status,
            evaluated_skills
          )
        `)
        .eq("loop_status", "open")
        .eq("assessment_cycles.organization_id", currentOrg.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as (AssessmentContextLink & { assessment_cycles: unknown })[];
    },
    enabled: !!currentOrg?.id,
  });

  // Gerar sugestões dinâmicas baseadas em eventos
  const { data: dynamicSuggestions = [], refetch: refetchDynamicSuggestions } = useQuery({
    queryKey: ["dynamic-assessment-suggestions", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase.rpc("suggest_assessments_for_user", {
        p_user_id: user.id,
      });

      if (error) throw error;
      return (data || []) as SuggestedAssessment[];
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  // Criar avaliação contextual
  const createFromContext = useMutation({
    mutationFn: async (params: CreateContextualAssessmentParams) => {
      if (!user?.id) throw new Error("Usuário não autenticado");

      const { data, error } = await supabase.rpc("create_contextual_assessment", {
        p_origin_type: params.originType,
        p_origin_id: params.originId || null,
        p_origin_event_id: params.originEventId || null,
        p_user_id: user.id,
        p_skill_ids: params.skillIds,
        p_assessment_type: params.assessmentType || "self",
        p_evaluators: params.evaluators || null,
      });

      if (error) throw error;
      return data as string; // cycle_id
    },
    onSuccess: (cycleId) => {
      queryClient.invalidateQueries({ queryKey: ["assessment-suggestions"] });
      queryClient.invalidateQueries({ queryKey: ["assessment-context-links"] });
      queryClient.invalidateQueries({ queryKey: ["assessment-cycles"] });
      toast.success("Avaliação criada com sucesso!");
      return cycleId;
    },
    onError: () => {
      toast.error("Erro ao criar avaliação");
    },
  });

  // Aceitar uma sugestão
  const acceptSuggestion = useMutation({
    mutationFn: async (suggestionId: string) => {
      // Buscar a sugestão
      const { data: suggestion, error: fetchError } = await supabase
        .from("assessment_suggestions")
        .select("*")
        .eq("id", suggestionId)
        .single();

      if (fetchError || !suggestion) throw new Error("Sugestão não encontrada");

      // Atualizar status
      const { error: updateError } = await supabase
        .from("assessment_suggestions")
        .update({
          status: "accepted" as SuggestionStatus,
          accepted_at: new Date().toISOString(),
        })
        .eq("id", suggestionId);

      if (updateError) throw updateError;

      // Criar avaliação contextual
      const cycleId = await createFromContext.mutateAsync({
        originType: (suggestion.context_type as CreateContextualAssessmentParams["originType"]) || "manual",
        originId: suggestion.context_id,
        originEventId: suggestion.context_event_id,
        skillIds: suggestion.skills_to_evaluate || [],
        assessmentType: "self",
      });

      return cycleId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assessment-suggestions"] });
      toast.success("Sugestão aceita! Avaliação criada.");
    },
    onError: () => {
      toast.error("Erro ao aceitar sugestão");
    },
  });

  // Dispensar uma sugestão
  const dismissSuggestion = useMutation({
    mutationFn: async (suggestionId: string) => {
      const { error } = await supabase
        .from("assessment_suggestions")
        .update({
          status: "dismissed" as SuggestionStatus,
          dismissed_at: new Date().toISOString(),
        })
        .eq("id", suggestionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assessment-suggestions"] });
      toast.success("Sugestão dispensada");
    },
    onError: () => {
      toast.error("Erro ao dispensar sugestão");
    },
  });

  // Processar conclusão de avaliação (propagar para skills/PDI)
  const processCompletion = useMutation({
    mutationFn: async (assessmentId: string) => {
      const { data, error } = await supabase.rpc("process_assessment_completion", {
        p_assessment_id: assessmentId,
      });

      if (error) throw error;
      return data as unknown as AssessmentCompletionResult;
    },
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ["skill-impacts"] });
        queryClient.invalidateQueries({ queryKey: ["user-skill-levels"] });
        queryClient.invalidateQueries({ queryKey: ["development-plans"] });
        queryClient.invalidateQueries({ queryKey: ["assessment-context-links"] });
        
        if (result.cycle_closed) {
          toast.success("Ciclo de avaliação fechado! Impactos registrados nas skills.");
        }
      }
    },
    onError: () => {
      toast.error("Erro ao processar conclusão da avaliação");
    },
  });

  // Submeter avaliação com integração completa
  const submitAssessmentWithIntegration = useMutation({
    mutationFn: async ({
      assessmentId,
      responses,
      evaluateeId,
      relationship,
      skillIds,
    }: {
      assessmentId: string;
      responses: Record<string, unknown>;
      evaluateeId: string;
      relationship: string;
      skillIds: string[];
    }) => {
      // 1. Atualizar avaliação
      const { error: submitError } = await supabase
        .from("assessments_360")
        .update({
          responses: responses as never,
          status: "completed",
          submitted_at: new Date().toISOString(),
        })
        .eq("id", assessmentId);

      if (submitError) throw submitError;

      // 2. Processar conclusão (propagar para skills/PDI)
      const result = await processCompletion.mutateAsync(assessmentId);

      // 3. Registrar evento no motor de eventos
      if (user?.id) {
        const feedbackTypeMap: Record<string, "peer" | "manager" | "self" | "360"> = {
          peer: "peer",
          manager: "manager",
          self: "self",
          "360": "360",
        };
        const mappedType = feedbackTypeMap[relationship] || "360";
        
        await recordFeedbackGiven(
          evaluateeId,
          mappedType,
          50, // XP reward padrão
          skillIds
        );
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-assessments-360"] });
      queryClient.invalidateQueries({ queryKey: ["assessments-360"] });
      toast.success("Avaliação enviada e integrada ao sistema!");
    },
    onError: () => {
      toast.error("Erro ao submeter avaliação");
    },
  });

  // Buscar contexto de uma avaliação específica
  const getAssessmentContext = async (cycleId: string): Promise<AssessmentContextLink | null> => {
    const { data, error } = await supabase
      .from("assessment_context_links")
      .select("*")
      .eq("assessment_cycle_id", cycleId)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;
    return data as unknown as AssessmentContextLink;
  };

  // Fechar loop manualmente
  const closeLoop = useMutation({
    mutationFn: async ({
      contextLinkId,
      reason,
    }: {
      contextLinkId: string;
      reason?: string;
    }) => {
      const { error } = await supabase
        .from("assessment_context_links")
        .update({
          loop_status: "closed",
          closed_at: new Date().toISOString(),
          closure_reason: reason || "manual_closure",
        })
        .eq("id", contextLinkId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assessment-context-links"] });
      toast.success("Loop de avaliação fechado");
    },
    onError: () => {
      toast.error("Erro ao fechar loop");
    },
  });

  return {
    // Sugestões
    pendingSuggestions,
    suggestionsLoading,
    dynamicSuggestions,
    hasPendingSuggestions: pendingSuggestions.length > 0 || dynamicSuggestions.length > 0,
    refetchDynamicSuggestions,
    
    // Loops
    openLoops,
    loopsLoading,
    
    // Ações
    createFromContext,
    acceptSuggestion,
    dismissSuggestion,
    processCompletion,
    submitAssessmentWithIntegration,
    getAssessmentContext,
    closeLoop,
  };
}
