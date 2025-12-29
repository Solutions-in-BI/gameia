/**
 * Tipos para o sistema de avaliações contextuais integradas
 */

// Tipos de origem de avaliação
export type AssessmentOriginType = 
  | 'arena_game' 
  | 'training' 
  | 'challenge' 
  | 'goal' 
  | 'cognitive_test' 
  | 'manual';

// Tipos de sugestão
export type SuggestionType = 'auto' | 'manual' | 'scheduled';

// Status de sugestão
export type SuggestionStatus = 'pending' | 'accepted' | 'dismissed' | 'expired';

// Status do loop
export type LoopStatus = 'open' | 'pending_action' | 'closed';

// Tipos de gatilho
export type TriggerType = 'event' | 'schedule' | 'threshold';

// Tipos de threshold
export type ThresholdType = 'xp' | 'games' | 'trainings' | 'score';

// Tipos de avaliação
export type AssessmentType = '360' | '180' | 'self' | 'peer';

// Sugestão de avaliação
export interface AssessmentSuggestion {
  id: string;
  user_id: string;
  organization_id: string | null;
  trigger_id: string | null;
  context_event_id: string | null;
  suggestion_type: SuggestionType;
  reason: string | null;
  skills_to_evaluate: string[] | null;
  priority: number;
  context_type: string | null;
  context_id: string | null;
  status: SuggestionStatus;
  accepted_at: string | null;
  dismissed_at: string | null;
  created_at: string;
}

// Link de contexto da avaliação
export interface AssessmentContextLink {
  id: string;
  assessment_cycle_id: string | null;
  origin_event_id: string | null;
  origin_type: AssessmentOriginType;
  origin_id: string | null;
  context_skill_ids: string[] | null;
  loop_status: LoopStatus;
  closed_at: string | null;
  closure_reason: string | null;
  created_at: string;
}

// Gatilho de avaliação
export interface AssessmentTrigger {
  id: string;
  organization_id: string | null;
  trigger_type: TriggerType;
  event_type: string | null;
  event_count: number;
  threshold_type: ThresholdType | null;
  threshold_value: number | null;
  schedule_cron: string | null;
  cycle_template: Record<string, unknown>;
  assessment_type: AssessmentType;
  skills_to_evaluate: string[] | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Parâmetros para criar avaliação contextual
export interface CreateContextualAssessmentParams {
  originType: AssessmentOriginType;
  originId?: string | null;
  originEventId?: string | null;
  skillIds: string[];
  assessmentType?: AssessmentType;
  evaluators?: string[] | null;
}

// Resultado do processamento de conclusão
export interface AssessmentCompletionResult {
  success: boolean;
  error?: string;
  impacts_recorded?: number;
  pdi_goals_updated?: number;
  cycle_closed?: boolean;
  evaluatee_id?: string;
}

// Sugestão retornada pela função RPC
export interface SuggestedAssessment {
  suggestion_type: string;
  reason: string;
  skills_to_evaluate: string[];
  priority: number;
  context_event_id: string | null;
  context_type: string;
  context_id: string | null;
}

// Eventos adicionados ao motor de eventos
export const ASSESSMENT_EVENT_TYPES = {
  AVALIACAO_SUGERIDA: 'AVALIACAO_SUGERIDA',
  AVALIACAO_CONCLUIDA: 'AVALIACAO_CONCLUIDA',
  CICLO_FECHADO: 'CICLO_FECHADO',
} as const;

export type AssessmentEventType = typeof ASSESSMENT_EVENT_TYPES[keyof typeof ASSESSMENT_EVENT_TYPES];
