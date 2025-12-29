/**
 * Tipos centrais para o motor de eventos do Gameia
 */

// Tipos de eventos principais
export const CORE_EVENT_TYPES = {
  // Jogos
  JOGO_CONCLUIDO: 'JOGO_CONCLUIDO',
  
  // Treinamentos
  TREINAMENTO_CONCLUIDO: 'TREINAMENTO_CONCLUIDO',
  
  // Testes cognitivos
  TESTE_REALIZADO: 'TESTE_REALIZADO',
  TESTE_FALHOU_META: 'TESTE_FALHOU_META',
  
  // Streak
  STREAK_MANTIDO: 'STREAK_MANTIDO',
  STREAK_QUEBRADO: 'STREAK_QUEBRADO',
  
  // Metas
  META_ATINGIDA: 'META_ATINGIDA',
  META_FALHOU: 'META_FALHOU',
  
  // Feedback
  FEEDBACK_DADO: 'FEEDBACK_DADO',
  FEEDBACK_RECEBIDO: 'FEEDBACK_RECEBIDO',
} as const;

export type CoreEventType = typeof CORE_EVENT_TYPES[keyof typeof CORE_EVENT_TYPES];

// Estrutura base de um evento
export interface CoreEvent {
  id: string;
  user_id: string;
  team_id: string | null;
  organization_id: string | null;
  event_type: CoreEventType;
  skill_ids: string[];
  xp_earned: number;
  coins_earned: number;
  score: number | null;
  metadata: CoreEventMetadata;
  created_at: string;
}

// Metadata específica por tipo de evento
export interface CoreEventMetadata {
  // Comum
  source_id?: string;
  source_type?: string;
  duration_seconds?: number;
  
  // Jogos
  game_type?: string;
  difficulty?: string;
  level_reached?: number;
  
  // Treinamentos
  training_id?: string;
  module_id?: string;
  modules_completed?: number;
  total_modules?: number;
  
  // Testes
  test_id?: string;
  test_type?: string;
  target_score?: number;
  achieved_score?: number;
  percentile?: number;
  
  // Streak
  streak_days?: number;
  previous_streak?: number;
  
  // Metas
  goal_id?: string;
  goal_type?: string;
  target_value?: number;
  achieved_value?: number;
  
  // Feedback
  feedback_type?: 'peer' | 'manager' | 'self' | '360';
  recipient_id?: string;
  evaluator_id?: string;
  assessment_cycle_id?: string;
  
  // Extensível
  [key: string]: string | number | boolean | null | undefined;
}

// Parâmetros para criar um evento
export interface CreateCoreEventParams {
  eventType: CoreEventType;
  teamId?: string | null;
  skillIds?: string[];
  xpEarned?: number;
  coinsEarned?: number;
  score?: number | null;
  metadata?: CoreEventMetadata;
}

// Stats agregados por tipo
export interface CoreEventStats {
  event_type: CoreEventType;
  event_count: number;
  total_xp: number;
  total_coins: number;
  avg_score: number | null;
}

// Stats de equipe
export interface TeamEventStats {
  event_type: CoreEventType;
  event_count: number;
  unique_users: number;
  total_xp: number;
  total_coins: number;
}
