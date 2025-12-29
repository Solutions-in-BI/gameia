/**
 * Tipos do Sistema de Insígnias V2
 * Sistema central de reconhecimento, evolução profissional e leitura gerencial
 */

// Tipos de insígnias
export type InsigniaType = 'skill' | 'behavior' | 'impact' | 'leadership' | 'special';

// Tipos de critérios
export type CriterionType = 
  | 'event_count' 
  | 'event_avg_score' 
  | 'event_min_score' 
  | 'streak_days' 
  | 'diversity' 
  | 'skill_level' 
  | 'consecutive' 
  | 'no_failures';

// Estrutura de um critério de insígnia
export interface InsigniaCriterion {
  id: string;
  insignia_id: string;
  criterion_type: CriterionType;
  event_type: string | null;
  min_count: number;
  min_value: number;
  avg_value: number;
  time_window_days: number | null;
  context_config: Record<string, unknown>;
  weight: number;
  is_required: boolean;
  description: string;
  sort_order: number;
}

// Progresso de um critério específico
export interface CriterionProgress {
  criterion_id: string;
  criterion_type: CriterionType;
  description: string;
  current: number;
  required: number;
  progress: number;
  met: boolean;
  weight: number;
  is_required: boolean;
}

// Status de verificação de critérios
export interface CriteriaCheckResult {
  eligible: boolean;
  progress: number;
  already_unlocked?: boolean;
  prerequisites_missing?: boolean;
  missing_prerequisites?: Array<{ id: string; name: string }>;
  no_criteria?: boolean;
  all_required_met?: boolean;
  criteria: CriterionProgress[];
}

// Skill relacionada à insígnia
export interface RelatedSkill {
  id: string;
  name: string;
  icon: string;
  category: string;
}

// Estrutura completa de uma insígnia V2
export interface InsigniaV2 {
  id: string;
  insignia_key: string;
  name: string;
  description: string | null;
  icon: string;
  color: string;
  category: string;
  star_level: number;
  
  // Novos campos V2
  insignia_type: InsigniaType;
  level: number;
  prerequisites: string[]; // IDs de insígnias pré-requisito
  related_skill_ids: string[];
  unlock_rules: Record<string, unknown>;
  unlock_message: string | null;
  unlocks: unknown[]; // IDs de itens/títulos desbloqueados
  version: number;
  
  // Rewards
  xp_reward: number;
  coins_reward: number;
  
  // Status
  is_active: boolean;
  organization_id: string | null;
  
  // Timestamps
  created_at: string;
}

// Insígnia com status de progresso do usuário
export interface InsigniaWithStatus extends InsigniaV2 {
  unlocked: boolean;
  unlocked_at: string | null;
  progress: number;
  criteria_status: CriteriaCheckResult | null;
  
  // Dados enriquecidos
  related_skills?: RelatedSkill[];
  prerequisite_insignias?: InsigniaV2[];
}

// Insígnia desbloqueada pelo usuário
export interface UserInsigniaV2 {
  id: string;
  user_id: string;
  insignia_id: string;
  unlocked_at: string;
  progress_snapshot: CriteriaCheckResult;
  source_events: string[];
  awarded_by: string;
  xp_awarded: number;
  coins_awarded: number;
  is_displayed: boolean;
}

// Resultado do unlock de insígnias
export interface UnlockResult {
  checked_user: string;
  unlocked_count: number | null;
  unlocked_insignia_ids: string[];
}

// Stats de insígnias do usuário
export interface UserInsigniasStats {
  total: number;
  unlocked: number;
  by_type: Record<InsigniaType, { total: number; unlocked: number }>;
  by_star_level: Record<number, { total: number; unlocked: number }>;
  recent_unlocks: InsigniaWithStatus[];
}

// Filtros para listagem de insígnias
export interface InsigniasFilters {
  type?: InsigniaType;
  category?: string;
  star_level?: number;
  unlocked_only?: boolean;
  locked_only?: boolean;
}

// Categorias visuais das insígnias
export const INSIGNIA_TYPE_CONFIG: Record<InsigniaType, { 
  label: string; 
  icon: string; 
  color: string;
  description: string;
}> = {
  skill: {
    label: 'Skills',
    icon: '⚡',
    color: 'from-blue-500 to-cyan-500',
    description: 'Evoluem com sua competência técnica',
  },
  behavior: {
    label: 'Comportamento',
    icon: '🎯',
    color: 'from-green-500 to-emerald-500',
    description: 'Reconhecem constância e hábitos',
  },
  impact: {
    label: 'Impacto',
    icon: '🏆',
    color: 'from-amber-500 to-orange-500',
    description: 'Metas e resultados alcançados',
  },
  leadership: {
    label: 'Liderança',
    icon: '👑',
    color: 'from-purple-500 to-pink-500',
    description: 'Desenvolvimento de pessoas',
  },
  special: {
    label: 'Especiais',
    icon: '✨',
    color: 'from-rose-500 to-red-500',
    description: 'Marcos únicos e cultura',
  },
};

// Níveis de insígnias progressivas
export const INSIGNIA_LEVEL_CONFIG: Record<number, {
  label: string;
  badge: string;
}> = {
  1: { label: 'Iniciante', badge: 'N1' },
  2: { label: 'Competente', badge: 'N2' },
  3: { label: 'Expert', badge: 'N3' },
  4: { label: 'Mestre', badge: 'N4' },
  5: { label: 'Lenda', badge: 'N5' },
};
