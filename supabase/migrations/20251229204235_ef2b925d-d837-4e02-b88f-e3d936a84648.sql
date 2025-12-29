-- Função para sugerir metas de PDI baseadas em resultados de avaliação
CREATE OR REPLACE FUNCTION public.suggest_pdi_goals_from_assessment(
  p_user_id UUID,
  p_assessment_cycle_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result JSONB := '[]'::jsonb;
  v_cycle RECORD;
  v_skill RECORD;
  v_avg_score NUMERIC;
  v_plan_id UUID;
  v_org_id UUID;
BEGIN
  -- Buscar dados do ciclo
  SELECT * INTO v_cycle
  FROM assessment_cycles
  WHERE id = p_assessment_cycle_id;
  
  IF v_cycle IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Cycle not found');
  END IF;
  
  v_org_id := v_cycle.organization_id;
  
  -- Buscar ou criar plano de desenvolvimento ativo
  SELECT id INTO v_plan_id
  FROM development_plans
  WHERE user_id = p_user_id
    AND organization_id = v_org_id
    AND status = 'active'
  ORDER BY created_at DESC
  LIMIT 1;
  
  -- Se não existe plano ativo, criar um
  IF v_plan_id IS NULL THEN
    INSERT INTO development_plans (
      user_id,
      organization_id,
      title,
      status,
      period_start,
      period_end
    )
    VALUES (
      p_user_id,
      v_org_id,
      'PDI ' || EXTRACT(YEAR FROM NOW()),
      'active',
      DATE_TRUNC('month', NOW()),
      DATE_TRUNC('month', NOW()) + INTERVAL '6 months'
    )
    RETURNING id INTO v_plan_id;
  END IF;
  
  -- Processar cada skill avaliada no ciclo
  IF v_cycle.evaluated_skills IS NOT NULL THEN
    FOR v_skill IN
      SELECT sc.id, sc.name, sc.category, sc.description
      FROM skill_configurations sc
      WHERE sc.id = ANY(v_cycle.evaluated_skills)
    LOOP
      -- Calcular score médio desta skill nas avaliações do ciclo
      SELECT AVG(
        CASE 
          WHEN jsonb_typeof(a.responses) = 'object' THEN
            (SELECT AVG((value::text)::numeric) 
             FROM jsonb_each(a.responses) 
             WHERE key LIKE '%' || v_skill.id::text || '%'
             AND (value::text ~ '^[0-9]+\.?[0-9]*$'))
          ELSE 3 -- default se não encontrar
        END
      ) INTO v_avg_score
      FROM assessments_360 a
      WHERE a.cycle_id = p_assessment_cycle_id
        AND a.evaluatee_id = p_user_id
        AND a.status = 'completed';
      
      -- Se score baixo (< 3.5 de 5), sugerir meta
      IF v_avg_score IS NOT NULL AND v_avg_score < 3.5 THEN
        -- Verificar se já não existe meta ativa para esta skill
        IF NOT EXISTS (
          SELECT 1 FROM development_goals
          WHERE plan_id = v_plan_id
            AND skill_id = v_skill.id
            AND status IN ('not_started', 'in_progress')
        ) THEN
          -- Criar sugestão de meta
          v_result := v_result || jsonb_build_object(
            'skill_id', v_skill.id,
            'skill_name', v_skill.name,
            'category', v_skill.category,
            'current_score', ROUND(v_avg_score, 2),
            'suggested_goal', 'Desenvolver ' || v_skill.name,
            'suggested_description', 'Meta sugerida baseada na avaliação 360°. Score atual: ' || ROUND(v_avg_score, 2)::text || '/5',
            'priority', CASE WHEN v_avg_score < 2.5 THEN 'high' WHEN v_avg_score < 3 THEN 'medium' ELSE 'low' END,
            'xp_reward', CASE WHEN v_avg_score < 2.5 THEN 150 WHEN v_avg_score < 3 THEN 100 ELSE 50 END
          );
        END IF;
      END IF;
    END LOOP;
  END IF;
  
  RETURN jsonb_build_object(
    'success', true,
    'plan_id', v_plan_id,
    'suggestions', v_result,
    'suggestions_count', jsonb_array_length(v_result)
  );
END;
$$;

-- Função para criar meta PDI a partir de sugestão
CREATE OR REPLACE FUNCTION public.create_pdi_goal_from_suggestion(
  p_plan_id UUID,
  p_skill_id UUID,
  p_title TEXT,
  p_description TEXT,
  p_priority TEXT DEFAULT 'medium',
  p_xp_reward INTEGER DEFAULT 100,
  p_target_date DATE DEFAULT NULL,
  p_origin_assessment_id UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_goal_id UUID;
  v_target DATE;
BEGIN
  -- Definir target_date se não fornecido (3 meses a partir de agora)
  v_target := COALESCE(p_target_date, (NOW() + INTERVAL '3 months')::date);
  
  -- Criar a meta
  INSERT INTO development_goals (
    plan_id,
    skill_id,
    title,
    description,
    priority,
    status,
    progress,
    xp_reward,
    target_date
  )
  VALUES (
    p_plan_id,
    p_skill_id,
    p_title,
    p_description,
    p_priority,
    'not_started',
    0,
    p_xp_reward,
    v_target
  )
  RETURNING id INTO v_goal_id;
  
  -- Se veio de uma avaliação, registrar o contexto
  IF p_origin_assessment_id IS NOT NULL THEN
    INSERT INTO assessment_context_links (
      origin_type,
      origin_id,
      context_skill_ids,
      loop_status
    )
    VALUES (
      'pdi_goal',
      v_goal_id,
      ARRAY[p_skill_id],
      'open'
    );
  END IF;
  
  RETURN v_goal_id;
END;
$$;

-- Função para buscar sugestões de metas baseadas em eventos recentes
CREATE OR REPLACE FUNCTION public.get_pdi_suggestions_for_user(p_user_id UUID)
RETURNS TABLE (
  suggestion_type TEXT,
  skill_id UUID,
  skill_name TEXT,
  reason TEXT,
  priority TEXT,
  source_type TEXT,
  source_id UUID,
  suggested_title TEXT,
  xp_reward INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Sugestões baseadas em scores baixos em testes cognitivos
  RETURN QUERY
  SELECT 
    'low_cognitive_score'::TEXT as suggestion_type,
    sc.id as skill_id,
    sc.name as skill_name,
    'Score ' || ROUND(cts.score::numeric, 0)::text || '% no teste ' || ct.name as reason,
    CASE WHEN cts.score < 50 THEN 'high' WHEN cts.score < 70 THEN 'medium' ELSE 'low' END as priority,
    'cognitive_test'::TEXT as source_type,
    cts.id as source_id,
    'Desenvolver ' || sc.name || ' através de práticas específicas' as suggested_title,
    CASE WHEN cts.score < 50 THEN 150 WHEN cts.score < 70 THEN 100 ELSE 50 END as xp_reward
  FROM cognitive_test_sessions cts
  JOIN cognitive_tests ct ON ct.id = cts.test_id
  JOIN skill_configurations sc ON sc.id = ANY(ct.related_skills)
  WHERE cts.user_id = p_user_id
    AND cts.status = 'completed'
    AND cts.score < 70
    AND cts.completed_at > NOW() - INTERVAL '30 days'
    AND NOT EXISTS (
      SELECT 1 FROM development_goals dg
      JOIN development_plans dp ON dp.id = dg.plan_id
      WHERE dp.user_id = p_user_id
        AND dg.skill_id = sc.id
        AND dg.status IN ('not_started', 'in_progress')
    )
  ORDER BY cts.score ASC
  LIMIT 5;
  
  -- Sugestões baseadas em feedback 360 com scores baixos
  RETURN QUERY
  SELECT 
    'low_feedback_score'::TEXT as suggestion_type,
    sc.id as skill_id,
    sc.name as skill_name,
    'Área de desenvolvimento identificada em feedback 360°' as reason,
    'medium'::TEXT as priority,
    'feedback_360'::TEXT as source_type,
    ar.cycle_id as source_id,
    'Fortalecer ' || sc.name || ' com base em feedback recebido' as suggested_title,
    100 as xp_reward
  FROM assessment_360_results ar
  JOIN skill_configurations sc ON sc.id = ANY(ar.development_areas::uuid[])
  WHERE ar.user_id = p_user_id
    AND ar.created_at > NOW() - INTERVAL '90 days'
    AND NOT EXISTS (
      SELECT 1 FROM development_goals dg
      JOIN development_plans dp ON dp.id = dg.plan_id
      WHERE dp.user_id = p_user_id
        AND dg.skill_id = sc.id
        AND dg.status IN ('not_started', 'in_progress')
    )
  LIMIT 5;
  
  -- Sugestões baseadas em skills com baixo progresso nos jogos
  RETURN QUERY
  SELECT 
    'low_game_performance'::TEXT as suggestion_type,
    usl.skill_id,
    sc.name as skill_name,
    'Nível ' || usl.current_level || ' (abaixo do esperado) em ' || sc.name as reason,
    CASE WHEN usl.current_level < 2 THEN 'high' WHEN usl.current_level < 3 THEN 'medium' ELSE 'low' END as priority,
    'game'::TEXT as source_type,
    NULL::UUID as source_id,
    'Treinar ' || sc.name || ' através dos jogos da plataforma' as suggested_title,
    75 as xp_reward
  FROM user_skill_levels usl
  JOIN skill_configurations sc ON sc.id = usl.skill_id
  WHERE usl.user_id = p_user_id
    AND usl.current_level < 3
    AND NOT EXISTS (
      SELECT 1 FROM development_goals dg
      JOIN development_plans dp ON dp.id = dg.plan_id
      WHERE dp.user_id = p_user_id
        AND dg.skill_id = sc.id
        AND dg.status IN ('not_started', 'in_progress')
    )
  ORDER BY usl.current_level ASC
  LIMIT 5;
END;
$$;