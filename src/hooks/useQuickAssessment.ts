/**
 * Hook para Avaliação Contextual Rápida
 * Gerencia perguntas, respostas e consequências de avaliações contextuais
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useOrganization } from "@/hooks/useOrganization";
import { toast } from "sonner";

export type ContextType = 'training' | 'game' | 'challenge' | 'simulation' | 'application';

export interface ContextualQuestion {
  id: string;
  context_type: string;
  skill_id: string | null;
  question_text: string;
  question_type: 'scale' | 'choice' | 'text';
  options: Record<string, string> | null;
  scale_min: number;
  scale_max: number;
  scale_labels: Record<string, string> | null;
  display_order: number;
  is_required: boolean;
}

export interface QuestionResponse {
  question_id: string;
  value: number | string;
  comment?: string;
  skill_id?: string | null;
}

export interface AssessmentConsequence {
  id: string;
  consequence_type: string;
  target_type: string | null;
  target_id: string | null;
  title: string;
  description: string | null;
  priority: number;
  skill_ids: string[] | null;
  status: string;
  created_at: string;
}

export function useQuickAssessment(contextType?: ContextType) {
  const { user } = useAuth();
  const { currentOrg } = useOrganization();
  const queryClient = useQueryClient();
  const organizationId = currentOrg?.id;

  // Fetch questions for a specific context type
  const { data: questions, isLoading: questionsLoading } = useQuery({
    queryKey: ['contextual-questions', contextType],
    queryFn: async () => {
      if (!contextType) return [];
      
      const { data, error } = await supabase
        .from('contextual_assessment_questions')
        .select('*')
        .eq('context_type', contextType)
        .eq('is_active', true)
        .order('display_order');

      if (error) throw error;
      return data as ContextualQuestion[];
    },
    enabled: !!contextType,
  });

  // Fetch user's pending consequences
  const { data: pendingConsequences, isLoading: consequencesLoading } = useQuery({
    queryKey: ['assessment-consequences', user?.id, 'pending'],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('assessment_consequences')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'pending')
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as AssessmentConsequence[];
    },
    enabled: !!user?.id,
  });

  // Check if user already completed assessment for this context
  const checkExistingAssessment = async (contextId: string): Promise<boolean> => {
    if (!user?.id) return false;
    
    const { data, error } = await supabase
      .from('contextual_assessment_responses')
      .select('id')
      .eq('user_id', user.id)
      .eq('context_id', contextId)
      .limit(1);

    if (error) return false;
    return data && data.length > 0;
  };

  // Submit assessment responses
  const submitAssessment = useMutation({
    mutationFn: async ({
      contextType,
      contextId,
      contextEventId,
      responses,
      timeSpentSeconds,
      skillIds,
    }: {
      contextType: ContextType;
      contextId?: string;
      contextEventId?: string;
      responses: QuestionResponse[];
      timeSpentSeconds?: number;
      skillIds?: string[];
    }) => {
      if (!user?.id) throw new Error('Usuário não autenticado');

      // Calculate total score (average of scale responses)
      const scaleResponses = responses.filter(r => typeof r.value === 'number');
      const totalScore = scaleResponses.length > 0
        ? (scaleResponses.reduce((acc, r) => acc + (r.value as number), 0) / scaleResponses.length) * 20
        : null;

      // Format responses as JSONB
      const responsesJson = responses.reduce((acc, r) => ({
        ...acc,
        [r.question_id]: {
          value: r.value,
          comment: r.comment,
          skill_id: r.skill_id,
        }
      }), {});

      // Insert response
      const { data: response, error: responseError } = await supabase
        .from('contextual_assessment_responses')
        .insert({
          user_id: user.id,
          organization_id: organizationId,
          context_type: contextType,
          context_id: contextId,
          context_event_id: contextEventId,
          responses: responsesJson,
          total_score: totalScore,
          time_spent_seconds: timeSpentSeconds,
          skills_impacted: skillIds,
        })
        .select()
        .single();

      if (responseError) throw responseError;

      // Generate consequences
      const { data: consequences, error: consequenceError } = await supabase
        .rpc('generate_assessment_consequences', {
          p_user_id: user.id,
          p_assessment_type: 'contextual',
          p_assessment_id: response.id,
          p_responses: responsesJson,
          p_skill_ids: skillIds,
        });

      if (consequenceError) {
        console.error('Error generating consequences:', consequenceError);
      }

      return { response, consequences };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assessment-consequences'] });
      queryClient.invalidateQueries({ queryKey: ['contextual-assessment-responses'] });
      toast.success('Avaliação concluída!');
    },
    onError: (error) => {
      console.error('Error submitting assessment:', error);
      toast.error('Erro ao enviar avaliação');
    },
  });

  // Accept a consequence (create the action)
  const acceptConsequence = useMutation({
    mutationFn: async (consequenceId: string) => {
      const { data, error } = await supabase
        .from('assessment_consequences')
        .update({
          status: 'accepted',
          accepted_at: new Date().toISOString(),
        })
        .eq('id', consequenceId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assessment-consequences'] });
      toast.success('Ação aceita!');
    },
  });

  // Dismiss a consequence
  const dismissConsequence = useMutation({
    mutationFn: async (consequenceId: string) => {
      const { data, error } = await supabase
        .from('assessment_consequences')
        .update({
          status: 'dismissed',
          dismissed_at: new Date().toISOString(),
        })
        .eq('id', consequenceId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assessment-consequences'] });
    },
  });

  return {
    questions,
    questionsLoading,
    pendingConsequences,
    consequencesLoading,
    checkExistingAssessment,
    submitAssessment,
    acceptConsequence,
    dismissConsequence,
  };
}
