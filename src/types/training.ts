/**
 * Types for the enhanced training system
 */

export type TrainingStatus = 'draft' | 'active' | 'archived';
export type RequiredLevel = 'beginner' | 'intermediate' | 'advanced';
export type TrainingArea = 'general' | 'sales' | 'leadership' | 'hr' | 'operations' | 'soft_skills' | 'productivity';

export type StepType = 
  | 'content'      // Video, texto, PDF
  | 'quiz'         // Quiz interno
  | 'arena_game'   // Jogo da Arena
  | 'cognitive_test' // Teste cognitivo
  | 'practical_challenge' // Desafio prático
  | 'simulation'   // Simulação/cenário
  | 'reflection'   // Checkpoint de reflexão
  | 'guided_reading' // Leitura guiada (livros)
  | 'ai_reflection'  // Reflexão com IA
  | 'routine_application' // Aplicação na rotina
  | 'validation';  // Validação final

export interface StepConfig {
  // For content
  content_type?: 'video' | 'text' | 'pdf' | 'link';
  
  // For arena_game
  game_type?: 'quiz' | 'decision' | 'sales' | 'memory' | 'snake' | 'tetris' | 'dino';
  game_config?: Record<string, unknown>;
  
  // For cognitive_test
  test_id?: string;
  test_type?: string;
  
  // For practical_challenge
  challenge_description?: string;
  submission_type?: 'text' | 'file' | 'link';
  
  // For simulation
  scenario_type?: string;
  scenario_config?: Record<string, unknown>;
  
  // For reflection
  reflection_prompt?: string;
  min_characters?: number;
}

export interface ValidationCriteria {
  require_completion?: boolean;
  min_score?: number;
  min_time_seconds?: number;
  require_submission?: boolean;
}

export interface BonusTier {
  min_score: number;
  xp_bonus: number;
  coins_bonus: number;
}

export interface BonusRules {
  type: 'fixed' | 'tiered';
  base_xp: number;
  base_coins: number;
  tiers: BonusTier[];
  speed_bonus?: {
    under_days: number;
    xp_bonus: number;
  };
}

export interface CompletionCriteria {
  min_modules_completed: number; // percentage
  require_all_checkpoints: boolean;
}

export interface EnhancedTraining {
  id: string;
  training_key: string;
  name: string;
  description: string | null;
  category: string;
  difficulty: string;
  icon: string;
  color: string;
  estimated_hours: number;
  xp_reward: number;
  coins_reward: number;
  is_active: boolean;
  display_order: number;
  organization_id: string | null;
  thumbnail_url: string | null;
  is_onboarding: boolean;
  certificate_enabled: boolean;
  insignia_reward_id: string | null;
  // New fields
  skill_ids: string[];
  area: TrainingArea;
  required_level: RequiredLevel;
  training_status: TrainingStatus;
  completion_criteria: CompletionCriteria;
  bonus_rules: BonusRules;
  max_attempts: number | null;
  allow_retry: boolean;
}

export interface EnhancedTrainingModule {
  id: string;
  training_id: string;
  module_key: string;
  name: string;
  description: string | null;
  content_type: string;
  content_data: Record<string, unknown> | null;
  order_index: number;
  xp_reward: number;
  coins_reward: number;
  time_minutes: number;
  video_url: string | null;
  thumbnail_url: string | null;
  is_preview: boolean;
  requires_completion: boolean;
  // New fields
  step_type: StepType;
  step_config: StepConfig;
  validation_criteria: ValidationCriteria;
  is_optional: boolean;
  is_checkpoint: boolean;
  min_score: number | null;
  skill_ids: string[];
}

export interface EnhancedModuleProgress {
  id: string;
  user_id: string;
  module_id: string;
  started_at: string | null;
  completed_at: string | null;
  time_spent_seconds: number;
  is_completed: boolean;
  // New fields
  score: number | null;
  passed_validation: boolean | null;
  attempts: number;
  metadata: Record<string, unknown>;
}

export interface EnhancedTrainingProgress {
  id: string;
  user_id: string;
  training_id: string;
  progress_percent: number;
  started_at: string | null;
  completed_at: string | null;
  // New fields
  assigned_by: string | null;
  assigned_at: string | null;
  deadline_at: string | null;
  average_score: number | null;
  bonus_xp_earned: number;
  total_time_seconds: number;
  attempts: number;
}

export interface OrgTrainingConfig {
  id: string;
  organization_id: string;
  training_id: string;
  is_enabled: boolean;
  requirement_type: 'mandatory' | 'recommended' | 'optional';
  xp_multiplier: number;
  coins_multiplier: number;
  team_ids: string[];
  role_ids: string[];
  deadline_days: number | null;
  created_at: string;
  updated_at: string;
}

export interface TrainingAnalyticsEvent {
  id: string;
  organization_id: string | null;
  training_id: string;
  module_id: string | null;
  user_id: string;
  event_type: 'training_started' | 'module_started' | 'module_completed' | 'checkpoint_passed' | 'checkpoint_failed' | 'training_completed' | 'training_abandoned';
  score: number | null;
  time_spent_seconds: number | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface TrainingMetrics {
  starts: number;
  completions: number;
  completion_rate: number;
  checkpoints_passed: number;
  checkpoints_failed: number;
  checkpoint_pass_rate: number;
  avg_score: number;
  avg_time_minutes: number;
}

// Step result from playing a step
export interface StepResult {
  completed: boolean;
  score?: number;
  passed?: boolean;
  timeSpent?: number;
  metadata?: Record<string, unknown>;
}
