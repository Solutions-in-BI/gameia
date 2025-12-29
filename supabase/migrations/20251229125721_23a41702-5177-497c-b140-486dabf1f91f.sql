-- =====================================================
-- FASE 1: Arquitetura de Dados Unificada - Gameia Evolution
-- =====================================================

-- 1.1 Tabela central: skill_impact_events
-- Registro de todas as ações que impactam skills
CREATE TABLE IF NOT EXISTS public.skill_impact_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  skill_id UUID NOT NULL REFERENCES public.skill_configurations(id) ON DELETE CASCADE,
  source_type TEXT NOT NULL CHECK (source_type IN ('game', 'cognitive_test', 'feedback_360', 'pdi_goal', 'one_on_one', 'training', 'challenge')),
  source_id UUID,
  impact_type TEXT NOT NULL CHECK (impact_type IN ('xp_gain', 'assessment', 'peer_feedback', 'manager_feedback', 'self_assessment', 'goal_completion', 'test_score')),
  impact_value INTEGER NOT NULL DEFAULT 0,
  normalized_score NUMERIC(5,2), -- Score normalizado 0-100 para comparações
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para performance
CREATE INDEX idx_skill_impact_user ON public.skill_impact_events(user_id);
CREATE INDEX idx_skill_impact_skill ON public.skill_impact_events(skill_id);
CREATE INDEX idx_skill_impact_source ON public.skill_impact_events(source_type, source_id);
CREATE INDEX idx_skill_impact_org ON public.skill_impact_events(organization_id);
CREATE INDEX idx_skill_impact_created ON public.skill_impact_events(created_at DESC);

-- RLS
ALTER TABLE public.skill_impact_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own skill impacts"
  ON public.skill_impact_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own skill impacts"
  ON public.skill_impact_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view org skill impacts"
  ON public.skill_impact_events FOR SELECT
  USING (public.is_org_admin(auth.uid(), organization_id));

-- 1.2 Alterações em cognitive_tests - Conectar a skills
ALTER TABLE public.cognitive_tests 
  ADD COLUMN IF NOT EXISTS related_skills UUID[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS skill_impact_config JSONB DEFAULT '{"xp_multiplier": 1, "auto_unlock_threshold": 70}';

-- 1.3 Alterações em assessment_cycles - Configurar skills avaliadas e contexto
ALTER TABLE public.assessment_cycles 
  ADD COLUMN IF NOT EXISTS evaluated_skills UUID[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS context_type TEXT DEFAULT 'general',
  ADD COLUMN IF NOT EXISTS context_id UUID,
  ADD COLUMN IF NOT EXISTS feedback_questions JSONB DEFAULT '[]';

-- 1.4 Alterações em development_goals - Conectar a desafios automáticos
ALTER TABLE public.development_goals 
  ADD COLUMN IF NOT EXISTS auto_challenges_enabled BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS challenge_config JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS related_games TEXT[] DEFAULT '{}';

-- 1.5 Alterações em one_on_one_meetings - Dados para conversa
ALTER TABLE public.one_on_one_meetings 
  ADD COLUMN IF NOT EXISTS skills_discussed UUID[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS challenges_reviewed UUID[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS suggested_topics JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS ai_insights TEXT,
  ADD COLUMN IF NOT EXISTS outcomes JSONB DEFAULT '[]';

-- 1.6 Função para registrar impacto em skill
CREATE OR REPLACE FUNCTION public.record_skill_impact(
  p_user_id UUID,
  p_skill_id UUID,
  p_source_type TEXT,
  p_source_id UUID,
  p_impact_type TEXT,
  p_impact_value INTEGER,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_org_id UUID;
  v_impact_id UUID;
  v_normalized NUMERIC(5,2);
BEGIN
  -- Buscar org do usuário
  SELECT current_organization_id INTO v_org_id
  FROM profiles WHERE id = p_user_id;

  -- Normalizar score (0-100)
  v_normalized := CASE 
    WHEN p_impact_type IN ('assessment', 'test_score', 'peer_feedback', 'manager_feedback') 
    THEN LEAST(100, GREATEST(0, p_impact_value))
    WHEN p_impact_type = 'xp_gain' 
    THEN LEAST(100, (p_impact_value::NUMERIC / 100) * 100) -- Assume 100 XP = 100%
    ELSE p_impact_value
  END;

  -- Inserir evento
  INSERT INTO skill_impact_events (
    user_id, organization_id, skill_id, source_type, source_id,
    impact_type, impact_value, normalized_score, metadata
  ) VALUES (
    p_user_id, v_org_id, p_skill_id, p_source_type, p_source_id,
    p_impact_type, p_impact_value, v_normalized, p_metadata
  )
  RETURNING id INTO v_impact_id;

  -- Atualizar XP na skill se for xp_gain
  IF p_impact_type = 'xp_gain' THEN
    PERFORM add_skill_xp(p_user_id, p_skill_id, p_impact_value, p_source_type, p_source_id::TEXT);
  END IF;

  RETURN v_impact_id;
END;
$$;

-- 1.7 Função para calcular score consolidado de uma skill
CREATE OR REPLACE FUNCTION public.get_consolidated_skill_score(
  p_user_id UUID,
  p_skill_id UUID,
  p_period_days INTEGER DEFAULT 90
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_result JSONB;
  v_start_date TIMESTAMPTZ;
BEGIN
  v_start_date := now() - (p_period_days || ' days')::INTERVAL;

  SELECT jsonb_build_object(
    'skill_id', p_skill_id,
    'user_id', p_user_id,
    'period_days', p_period_days,
    'consolidated_score', COALESCE((
      SELECT 
        -- Pesos: games 30%, cognitive 20%, feedback 25%, pdi 15%, 1:1 10%
        (COALESCE(AVG(CASE WHEN source_type = 'game' THEN normalized_score END), 0) * 0.30) +
        (COALESCE(AVG(CASE WHEN source_type = 'cognitive_test' THEN normalized_score END), 0) * 0.20) +
        (COALESCE(AVG(CASE WHEN source_type IN ('feedback_360') THEN normalized_score END), 0) * 0.25) +
        (COALESCE(AVG(CASE WHEN source_type = 'pdi_goal' THEN normalized_score END), 0) * 0.15) +
        (COALESCE(AVG(CASE WHEN source_type = 'one_on_one' THEN normalized_score END), 0) * 0.10)
      FROM skill_impact_events
      WHERE user_id = p_user_id 
        AND skill_id = p_skill_id 
        AND created_at > v_start_date
    ), 0)::NUMERIC(5,2),
    'breakdown', (
      SELECT jsonb_object_agg(source_type, source_data)
      FROM (
        SELECT 
          source_type,
          jsonb_build_object(
            'avg_score', ROUND(AVG(normalized_score)::NUMERIC, 2),
            'count', COUNT(*),
            'total_xp', SUM(CASE WHEN impact_type = 'xp_gain' THEN impact_value ELSE 0 END)
          ) as source_data
        FROM skill_impact_events
        WHERE user_id = p_user_id 
          AND skill_id = p_skill_id 
          AND created_at > v_start_date
        GROUP BY source_type
      ) sub
    ),
    'total_events', (
      SELECT COUNT(*) FROM skill_impact_events
      WHERE user_id = p_user_id AND skill_id = p_skill_id AND created_at > v_start_date
    ),
    'last_activity', (
      SELECT MAX(created_at) FROM skill_impact_events
      WHERE user_id = p_user_id AND skill_id = p_skill_id
    )
  ) INTO v_result;

  RETURN v_result;
END;
$$;

-- 1.8 Função para obter sugestões de próximos passos
CREATE OR REPLACE FUNCTION public.get_evolution_suggestions(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 5
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_result JSONB;
  v_org_id UUID;
BEGIN
  SELECT current_organization_id INTO v_org_id
  FROM profiles WHERE id = p_user_id;

  SELECT jsonb_build_object(
    'pending_tests', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'test_id', ct.id,
        'name', ct.name,
        'related_skills', ct.related_skills,
        'xp_reward', ct.xp_reward
      ))
      FROM cognitive_tests ct
      WHERE ct.organization_id = v_org_id
        AND ct.is_active = true
        AND NOT EXISTS (
          SELECT 1 FROM cognitive_test_sessions cts
          WHERE cts.test_id = ct.id 
            AND cts.user_id = p_user_id 
            AND cts.status = 'completed'
            AND cts.completed_at > now() - interval '30 days'
        )
      LIMIT p_limit
    ), '[]'::jsonb),
    'pending_feedbacks', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'assessment_id', a.id,
        'evaluatee_id', a.evaluatee_id,
        'relationship', a.relationship,
        'cycle_name', ac.name
      ))
      FROM assessments_360 a
      JOIN assessment_cycles ac ON a.cycle_id = ac.id
      WHERE a.evaluator_id = p_user_id
        AND a.status = 'pending'
      LIMIT p_limit
    ), '[]'::jsonb),
    'pdi_goals_due', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'goal_id', dg.id,
        'title', dg.title,
        'target_date', dg.target_date,
        'progress', dg.progress,
        'skill_id', dg.skill_id
      ))
      FROM development_goals dg
      JOIN development_plans dp ON dg.plan_id = dp.id
      WHERE dp.user_id = p_user_id
        AND dg.status = 'in_progress'
        AND dg.target_date <= now() + interval '7 days'
      ORDER BY dg.target_date
      LIMIT p_limit
    ), '[]'::jsonb),
    'upcoming_1on1s', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'meeting_id', m.id,
        'scheduled_at', m.scheduled_at,
        'manager_id', m.manager_id,
        'suggested_topics', m.suggested_topics
      ))
      FROM one_on_one_meetings m
      WHERE m.employee_id = p_user_id
        AND m.scheduled_at > now()
        AND m.status = 'scheduled'
      ORDER BY m.scheduled_at
      LIMIT p_limit
    ), '[]'::jsonb),
    'weak_skills', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'skill_id', sc.id,
        'skill_name', sc.name,
        'current_level', usl.current_level,
        'suggested_games', sc.game_types
      ))
      FROM user_skill_levels usl
      JOIN skill_configurations sc ON usl.skill_id = sc.id
      WHERE usl.user_id = p_user_id
        AND usl.current_level < 3
      ORDER BY usl.current_level
      LIMIT p_limit
    ), '[]'::jsonb)
  ) INTO v_result;

  RETURN v_result;
END;
$$;