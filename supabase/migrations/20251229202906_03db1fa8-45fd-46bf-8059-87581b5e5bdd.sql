-- Primeiro remover a função existente
DROP FUNCTION IF EXISTS suggest_assessments_for_user(uuid);

-- Função para processar conclusão de teste cognitivo e disparar avaliações
CREATE OR REPLACE FUNCTION process_cognitive_test_completion()
RETURNS TRIGGER AS $$
DECLARE
  test_record RECORD;
  target_score NUMERIC;
  passed_target BOOLEAN;
  skill_id TEXT;
  suggestion_reason TEXT;
BEGIN
  -- Só processar quando status muda para 'completed'
  IF NEW.status != 'completed' OR OLD.status = 'completed' THEN
    RETURN NEW;
  END IF;

  -- Buscar informações do teste
  SELECT * INTO test_record
  FROM public.cognitive_tests
  WHERE id = NEW.test_id;

  IF NOT FOUND THEN
    RETURN NEW;
  END IF;

  target_score := COALESCE(test_record.target_score, 70);
  passed_target := COALESCE(NEW.score, 0) >= target_score;

  -- Se passou no target, não precisa sugerir avaliação
  IF passed_target THEN
    RETURN NEW;
  END IF;

  -- Obter primeira skill relacionada ao teste (se houver)
  skill_id := NULL;
  IF test_record.related_skills IS NOT NULL AND array_length(test_record.related_skills, 1) > 0 THEN
    skill_id := test_record.related_skills[1];
  END IF;

  -- Definir razão da sugestão
  suggestion_reason := format(
    'Teste cognitivo "%s" concluído com score %s%% (meta: %s%%). Sugerimos uma avaliação para entender melhor os pontos de melhoria.',
    test_record.name,
    COALESCE(NEW.score, 0),
    target_score
  );

  -- Criar sugestão de avaliação
  INSERT INTO public.assessment_suggestions (
    user_id,
    organization_id,
    suggestion_type,
    context_type,
    context_id,
    context_event_id,
    skills_to_evaluate,
    reason,
    priority,
    status
  ) VALUES (
    NEW.user_id,
    NEW.organization_id,
    'cognitive_gap',
    'cognitive_test',
    NEW.test_id,
    NULL,
    CASE WHEN skill_id IS NOT NULL THEN ARRAY[skill_id] ELSE NULL END,
    suggestion_reason,
    CASE 
      WHEN NEW.score < 40 THEN 1  -- Alta prioridade
      WHEN NEW.score < 60 THEN 2  -- Média prioridade
      ELSE 3                      -- Baixa prioridade
    END,
    'pending'
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Criar trigger para processar conclusão de teste cognitivo
DROP TRIGGER IF EXISTS trg_cognitive_test_completion ON public.cognitive_test_sessions;
CREATE TRIGGER trg_cognitive_test_completion
  AFTER UPDATE ON public.cognitive_test_sessions
  FOR EACH ROW
  EXECUTE FUNCTION process_cognitive_test_completion();

-- Função para sugerir avaliações baseadas em eventos do core_events
CREATE FUNCTION suggest_assessments_for_user(p_user_id UUID)
RETURNS TABLE (
  suggestion_type TEXT,
  reason TEXT,
  priority INT,
  skill_ids TEXT[],
  context_type TEXT,
  context_id TEXT
) AS $$
BEGIN
  -- Sugestões baseadas em testes cognitivos com baixo score
  RETURN QUERY
  SELECT 
    'cognitive_gap'::TEXT,
    format('Score baixo no teste "%s": %s%%', ct.name, cts.score)::TEXT,
    CASE 
      WHEN cts.score < 40 THEN 1
      WHEN cts.score < 60 THEN 2
      ELSE 3
    END,
    ct.related_skills,
    'cognitive_test'::TEXT,
    cts.test_id::TEXT
  FROM public.cognitive_test_sessions cts
  JOIN public.cognitive_tests ct ON ct.id = cts.test_id
  WHERE cts.user_id = p_user_id
    AND cts.status = 'completed'
    AND cts.score < COALESCE(ct.target_score, 70)
    AND cts.completed_at > NOW() - INTERVAL '30 days'
    AND NOT EXISTS (
      SELECT 1 FROM public.assessment_suggestions asu
      WHERE asu.user_id = p_user_id
        AND asu.context_type = 'cognitive_test'
        AND asu.context_id = cts.test_id
        AND asu.status IN ('pending', 'accepted')
    )
  ORDER BY cts.completed_at DESC
  LIMIT 5;

  -- Sugestões baseadas em streaks quebrados longos
  RETURN QUERY
  SELECT 
    'engagement_drop'::TEXT,
    format('Streak de %s dias quebrado recentemente', (ce.metadata->>'previous_streak')::INT)::TEXT,
    2,
    NULL::TEXT[],
    'streak_break'::TEXT,
    ce.id::TEXT
  FROM public.core_events ce
  WHERE ce.user_id = p_user_id
    AND ce.event_type = 'STREAK_QUEBRADO'
    AND (ce.metadata->>'previous_streak')::INT >= 7
    AND ce.created_at > NOW() - INTERVAL '14 days'
    AND NOT EXISTS (
      SELECT 1 FROM public.assessment_suggestions asu
      WHERE asu.user_id = p_user_id
        AND asu.context_type = 'streak_break'
        AND asu.context_event_id = ce.id
        AND asu.status IN ('pending', 'accepted')
    )
  ORDER BY ce.created_at DESC
  LIMIT 3;

  -- Sugestões baseadas em metas falhas
  RETURN QUERY
  SELECT 
    'goal_gap'::TEXT,
    format('Meta "%s" não atingida: %s/%s', 
      COALESCE(ce.metadata->>'goal_type', 'meta'),
      (ce.metadata->>'achieved_value'),
      (ce.metadata->>'target_value')
    )::TEXT,
    2,
    ce.skill_ids,
    'goal_failure'::TEXT,
    ce.id::TEXT
  FROM public.core_events ce
  WHERE ce.user_id = p_user_id
    AND ce.event_type = 'META_FALHOU'
    AND ce.created_at > NOW() - INTERVAL '30 days'
    AND NOT EXISTS (
      SELECT 1 FROM public.assessment_suggestions asu
      WHERE asu.user_id = p_user_id
        AND asu.context_type = 'goal_failure'
        AND asu.context_event_id = ce.id
        AND asu.status IN ('pending', 'accepted')
    )
  ORDER BY ce.created_at DESC
  LIMIT 3;

  RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;