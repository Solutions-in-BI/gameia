-- =============================================
-- FASE 2: TABELAS DE MÉTRICAS B2B (CORRIGIDO)
-- =============================================

-- 2.1 Log de atividades do usuário (DAU/WAU/MAU)
CREATE TABLE IF NOT EXISTS public.user_activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  activity_type text NOT NULL,
  game_type text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- 2.2 Histórico de XP por skill
CREATE TABLE IF NOT EXISTS public.user_xp_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  skill_id uuid REFERENCES skill_configurations(id) ON DELETE SET NULL,
  xp_earned integer NOT NULL DEFAULT 0,
  coins_earned integer NOT NULL DEFAULT 0,
  source text NOT NULL,
  source_id uuid,
  difficulty text,
  performance_score numeric,
  created_at timestamptz DEFAULT now()
);

-- 2.3 Avaliações de competência
CREATE TABLE IF NOT EXISTS public.competency_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  skill_id uuid REFERENCES skill_configurations(id) ON DELETE SET NULL,
  assessment_type text NOT NULL,
  score numeric NOT NULL,
  max_score numeric NOT NULL DEFAULT 100,
  time_spent_seconds integer,
  is_monitored boolean DEFAULT false,
  attempts_count integer DEFAULT 1,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- 2.4 Scores consolidados de competência por skill
CREATE TABLE IF NOT EXISTS public.user_competency_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  skill_id uuid REFERENCES skill_configurations(id) ON DELETE CASCADE NOT NULL,
  current_score numeric DEFAULT 0,
  previous_score numeric DEFAULT 0,
  assessments_count integer DEFAULT 0,
  best_score numeric DEFAULT 0,
  avg_score numeric DEFAULT 0,
  last_assessed_at timestamptz,
  trend text DEFAULT 'stable',
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, skill_id)
);

-- 2.5 Analytics de decisão
CREATE TABLE IF NOT EXISTS public.decision_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  scenario_id uuid REFERENCES decision_scenarios(id) ON DELETE SET NULL,
  decision_quality_score numeric,
  response_time_seconds integer,
  prioritization_accuracy numeric,
  reasoning_depth text,
  is_optimal_choice boolean DEFAULT false,
  category_id uuid,
  created_at timestamptz DEFAULT now()
);

-- 2.6 Adicionar organization_id à tabela user_streaks existente
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'user_streaks' AND column_name = 'organization_id') THEN
    ALTER TABLE user_streaks ADD COLUMN organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'user_streaks' AND column_name = 'total_active_days') THEN
    ALTER TABLE user_streaks ADD COLUMN total_active_days integer DEFAULT 0;
  END IF;
END $$;

-- 2.7 Habilitar RLS em todas as tabelas
ALTER TABLE user_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_xp_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE competency_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_competency_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE decision_analytics ENABLE ROW LEVEL SECURITY;

-- 2.8 Políticas RLS com hierarquia
CREATE POLICY "View activity via hierarchy" ON user_activity_log
  FOR SELECT USING (public.can_view_user_data(user_id, organization_id));
CREATE POLICY "Users can insert own activity" ON user_activity_log
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "View xp via hierarchy" ON user_xp_history
  FOR SELECT USING (public.can_view_user_data(user_id, organization_id));
CREATE POLICY "Users can insert own xp" ON user_xp_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "View assessments via hierarchy" ON competency_assessments
  FOR SELECT USING (public.can_view_user_data(user_id, organization_id));
CREATE POLICY "Users can insert own assessments" ON competency_assessments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "View scores via hierarchy" ON user_competency_scores
  FOR SELECT USING (public.can_view_user_data(user_id, organization_id));
CREATE POLICY "Users can manage own scores" ON user_competency_scores
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "View decisions via hierarchy" ON decision_analytics
  FOR SELECT USING (public.can_view_user_data(user_id, organization_id));
CREATE POLICY "Users can insert own decisions" ON decision_analytics
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 2.9 Índices para performance
CREATE INDEX IF NOT EXISTS idx_activity_log_org_date ON user_activity_log(organization_id, created_at);
CREATE INDEX IF NOT EXISTS idx_activity_log_user_date ON user_activity_log(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_xp_history_user_skill ON user_xp_history(user_id, skill_id);
CREATE INDEX IF NOT EXISTS idx_competency_scores_org ON user_competency_scores(organization_id);
CREATE INDEX IF NOT EXISTS idx_decision_analytics_user ON decision_analytics(user_id, created_at);