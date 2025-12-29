-- =====================================================
-- Sistema de Avaliações Integrado com Motor de Eventos
-- =====================================================

-- 1. Tabela de gatilhos automáticos de avaliações
CREATE TABLE public.assessment_triggers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  trigger_type TEXT NOT NULL CHECK (trigger_type IN ('event', 'schedule', 'threshold')),
  
  -- Configuração de gatilho por evento
  event_type TEXT,
  event_count INTEGER DEFAULT 1,
  
  -- Configuração de gatilho por threshold
  threshold_type TEXT CHECK (threshold_type IN ('xp', 'games', 'trainings', 'score')),
  threshold_value INTEGER,
  
  -- Configuração de gatilho por período
  schedule_cron TEXT,
  
  -- O que criar quando disparado
  cycle_template JSONB NOT NULL DEFAULT '{}',
  assessment_type TEXT DEFAULT '360' CHECK (assessment_type IN ('360', '180', 'self', 'peer')),
  skills_to_evaluate UUID[],
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Tabela de sugestões de avaliações pendentes
CREATE TABLE public.assessment_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  trigger_id UUID REFERENCES public.assessment_triggers(id) ON DELETE SET NULL,
  context_event_id UUID REFERENCES public.core_events(id) ON DELETE SET NULL,
  
  suggestion_type TEXT NOT NULL CHECK (suggestion_type IN ('auto', 'manual', 'scheduled')),
  reason TEXT,
  skills_to_evaluate UUID[],
  priority INTEGER DEFAULT 5,
  context_type TEXT,
  context_id UUID,
  
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'dismissed', 'expired')),
  accepted_at TIMESTAMPTZ,
  dismissed_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Tabela de vínculos de contexto das avaliações
CREATE TABLE public.assessment_context_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_cycle_id UUID REFERENCES public.assessment_cycles(id) ON DELETE CASCADE,
  
  -- Origem do ciclo
  origin_event_id UUID REFERENCES public.core_events(id) ON DELETE SET NULL,
  origin_type TEXT NOT NULL CHECK (origin_type IN ('arena_game', 'training', 'challenge', 'goal', 'cognitive_test', 'manual')),
  origin_id UUID,
  
  -- Skills avaliadas neste contexto
  context_skill_ids UUID[],
  
  -- Status do loop
  loop_status TEXT DEFAULT 'open' CHECK (loop_status IN ('open', 'pending_action', 'closed')),
  closed_at TIMESTAMPTZ,
  closure_reason TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Índices
CREATE INDEX idx_assessment_triggers_org ON public.assessment_triggers(organization_id);
CREATE INDEX idx_assessment_triggers_event ON public.assessment_triggers(event_type) WHERE is_active = true;
CREATE INDEX idx_assessment_suggestions_user ON public.assessment_suggestions(user_id, status);
CREATE INDEX idx_assessment_suggestions_pending ON public.assessment_suggestions(user_id) WHERE status = 'pending';
CREATE INDEX idx_assessment_context_links_cycle ON public.assessment_context_links(assessment_cycle_id);
CREATE INDEX idx_assessment_context_links_open ON public.assessment_context_links(loop_status) WHERE loop_status = 'open';

-- 5. RLS
ALTER TABLE public.assessment_triggers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_context_links ENABLE ROW LEVEL SECURITY;

-- Políticas para assessment_triggers (apenas admins)
CREATE POLICY "Admins can manage triggers" ON public.assessment_triggers
  FOR ALL USING (public.is_org_admin(auth.uid(), organization_id));

-- Políticas para assessment_suggestions
CREATE POLICY "Users can view own suggestions" ON public.assessment_suggestions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own suggestions" ON public.assessment_suggestions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can insert suggestions" ON public.assessment_suggestions
  FOR INSERT WITH CHECK (true);

-- Políticas para assessment_context_links
CREATE POLICY "Members can view context links" ON public.assessment_context_links
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.assessment_cycles ac
      WHERE ac.id = assessment_cycle_id
      AND public.is_org_member_or_owner(ac.organization_id)
    )
  );

CREATE POLICY "Admins can manage context links" ON public.assessment_context_links
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.assessment_cycles ac
      WHERE ac.id = assessment_cycle_id
      AND public.is_org_admin(auth.uid(), ac.organization_id)
    )
  );

-- 6. Função: Sugerir avaliações para usuário
CREATE OR REPLACE FUNCTION public.suggest_assessments_for_user(p_user_id UUID)
RETURNS TABLE (
  suggestion_type TEXT,
  reason TEXT,
  skills_to_evaluate UUID[],
  priority INTEGER,
  context_event_id UUID,
  context_type TEXT,
  context_id UUID
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_org_id UUID;
BEGIN
  -- Buscar org do usuário
  SELECT current_organization_id INTO v_org_id
  FROM profiles WHERE id = p_user_id;

  -- 1. Sugestão: Após 3+ jogos do mesmo tipo (autoavaliação)
  RETURN QUERY
  SELECT 
    'game_proficiency'::TEXT,
    'Você completou ' || COUNT(*)::TEXT || ' jogos de ' || ce.metadata->>'game_type' || '. Que tal avaliar suas habilidades?',
    ARRAY(
      SELECT DISTINCT unnest(ce2.skill_ids)
      FROM core_events ce2
      WHERE ce2.user_id = p_user_id
      AND ce2.event_type = 'JOGO_CONCLUIDO'
      AND ce2.metadata->>'game_type' = ce.metadata->>'game_type'
      AND ce2.created_at > now() - interval '7 days'
    ),
    3,
    MAX(ce.id),
    'arena_game'::TEXT,
    NULL::UUID
  FROM core_events ce
  WHERE ce.user_id = p_user_id
    AND ce.event_type = 'JOGO_CONCLUIDO'
    AND ce.created_at > now() - interval '7 days'
  GROUP BY ce.metadata->>'game_type'
  HAVING COUNT(*) >= 3
    AND NOT EXISTS (
      SELECT 1 FROM assessment_suggestions s
      WHERE s.user_id = p_user_id
      AND s.context_type = 'arena_game'
      AND s.created_at > now() - interval '7 days'
      AND s.status IN ('pending', 'accepted')
    );

  -- 2. Sugestão: Após treinamento concluído
  RETURN QUERY
  SELECT 
    'training_completion'::TEXT,
    'Você concluiu um treinamento. Avalie seu progresso nas habilidades desenvolvidas.',
    ce.skill_ids,
    2,
    ce.id,
    'training'::TEXT,
    (ce.metadata->>'training_id')::UUID
  FROM core_events ce
  WHERE ce.user_id = p_user_id
    AND ce.event_type = 'TREINAMENTO_CONCLUIDO'
    AND ce.created_at > now() - interval '3 days'
    AND NOT EXISTS (
      SELECT 1 FROM assessment_suggestions s
      WHERE s.user_id = p_user_id
      AND s.context_event_id = ce.id
    );

  -- 3. Sugestão: Após meta do PDI atingida
  RETURN QUERY
  SELECT 
    'goal_achieved'::TEXT,
    'Parabéns por atingir uma meta! Confirme seu progresso com uma avaliação.',
    ARRAY[dg.skill_id],
    1,
    ce.id,
    'goal'::TEXT,
    dg.id
  FROM core_events ce
  JOIN development_goals dg ON (ce.metadata->>'goal_id')::UUID = dg.id
  WHERE ce.user_id = p_user_id
    AND ce.event_type = 'META_ATINGIDA'
    AND ce.created_at > now() - interval '7 days'
    AND dg.skill_id IS NOT NULL
    AND NOT EXISTS (
      SELECT 1 FROM assessment_suggestions s
      WHERE s.user_id = p_user_id
      AND s.context_event_id = ce.id
    );

  -- 4. Sugestão: Skills com score baixo (diagnóstico)
  RETURN QUERY
  SELECT 
    'skill_diagnostic'::TEXT,
    'A skill "' || sc.name || '" precisa de atenção. Uma avaliação pode ajudar a identificar pontos de melhoria.',
    ARRAY[usl.skill_id],
    4,
    NULL::UUID,
    'diagnostic'::TEXT,
    usl.skill_id
  FROM user_skill_levels usl
  JOIN skill_configurations sc ON usl.skill_id = sc.id
  WHERE usl.user_id = p_user_id
    AND usl.current_level < 2
    AND NOT EXISTS (
      SELECT 1 FROM assessment_suggestions s
      WHERE s.user_id = p_user_id
      AND s.context_id = usl.skill_id
      AND s.created_at > now() - interval '30 days'
    )
  LIMIT 2;

  RETURN;
END;
$$;

-- 7. Função: Processar conclusão de avaliação
CREATE OR REPLACE FUNCTION public.process_assessment_completion(p_assessment_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_assessment RECORD;
  v_cycle RECORD;
  v_skill_id UUID;
  v_impact_score NUMERIC;
  v_responses JSONB;
  v_all_completed BOOLEAN;
  v_result JSONB := '{}'::JSONB;
  v_impacts_recorded INT := 0;
  v_pdi_updates INT := 0;
BEGIN
  -- Buscar avaliação
  SELECT * INTO v_assessment
  FROM assessments_360
  WHERE id = p_assessment_id AND status = 'completed';

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Avaliação não encontrada ou não concluída');
  END IF;

  -- Buscar ciclo
  SELECT * INTO v_cycle
  FROM assessment_cycles
  WHERE id = v_assessment.cycle_id;

  v_responses := v_assessment.responses;

  -- 1. Registrar impactos nas skills avaliadas
  IF v_cycle.evaluated_skills IS NOT NULL THEN
    FOREACH v_skill_id IN ARRAY v_cycle.evaluated_skills
    LOOP
      -- Calcular score médio das respostas (assumindo escala 1-5)
      SELECT COALESCE(AVG((value::TEXT)::NUMERIC), 3) * 20 INTO v_impact_score
      FROM jsonb_each(v_responses) 
      WHERE key LIKE 'skill_' || v_skill_id::TEXT || '%'
         OR key LIKE 'q%'; -- fallback para respostas genéricas

      -- Registrar impacto na skill
      PERFORM record_skill_impact(
        v_assessment.evaluatee_id,
        v_skill_id,
        'feedback_360',
        p_assessment_id,
        CASE v_assessment.relationship
          WHEN 'self' THEN 'self_assessment'
          WHEN 'peer' THEN 'peer_feedback'
          WHEN 'manager' THEN 'manager_feedback'
          ELSE '360_feedback'
        END,
        v_impact_score::INTEGER,
        jsonb_build_object(
          'evaluator_relationship', v_assessment.relationship,
          'cycle_id', v_cycle.id,
          'cycle_name', v_cycle.name
        )
      );

      v_impacts_recorded := v_impacts_recorded + 1;

      -- 2. Atualizar PDI goals relacionados à skill
      UPDATE development_goals dg
      SET 
        progress = LEAST(100, progress + 10),
        updated_at = now()
      FROM development_plans dp
      WHERE dg.plan_id = dp.id
        AND dp.user_id = v_assessment.evaluatee_id
        AND dg.skill_id = v_skill_id
        AND dg.status = 'in_progress';

      GET DIAGNOSTICS v_pdi_updates = ROW_COUNT;
    END LOOP;
  END IF;

  -- 3. Verificar se todas avaliações do ciclo foram concluídas
  SELECT NOT EXISTS (
    SELECT 1 FROM assessments_360
    WHERE cycle_id = v_cycle.id AND status != 'completed'
  ) INTO v_all_completed;

  -- 4. Se todas concluídas, fechar contexto e consolidar
  IF v_all_completed THEN
    UPDATE assessment_context_links
    SET 
      loop_status = 'closed',
      closed_at = now(),
      closure_reason = 'all_assessments_completed'
    WHERE assessment_cycle_id = v_cycle.id;

    -- Atualizar status do ciclo
    UPDATE assessment_cycles
    SET status = 'completed'
    WHERE id = v_cycle.id;

    -- Registrar evento de ciclo fechado
    INSERT INTO core_events (
      user_id, organization_id, event_type, skill_ids, metadata
    )
    SELECT 
      v_cycle.created_by,
      v_cycle.organization_id,
      'CICLO_FECHADO',
      v_cycle.evaluated_skills,
      jsonb_build_object(
        'cycle_id', v_cycle.id,
        'cycle_name', v_cycle.name,
        'assessments_count', (SELECT COUNT(*) FROM assessments_360 WHERE cycle_id = v_cycle.id),
        'context_type', v_cycle.context_type
      );
  END IF;

  v_result := jsonb_build_object(
    'success', true,
    'impacts_recorded', v_impacts_recorded,
    'pdi_goals_updated', v_pdi_updates,
    'cycle_closed', v_all_completed,
    'evaluatee_id', v_assessment.evaluatee_id
  );

  RETURN v_result;
END;
$$;

-- 8. Função: Criar avaliação contextual
CREATE OR REPLACE FUNCTION public.create_contextual_assessment(
  p_origin_type TEXT,
  p_origin_id UUID,
  p_origin_event_id UUID,
  p_user_id UUID,
  p_skill_ids UUID[],
  p_assessment_type TEXT DEFAULT 'self',
  p_evaluators UUID[] DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_org_id UUID;
  v_cycle_id UUID;
  v_cycle_name TEXT;
  v_evaluator_id UUID;
BEGIN
  -- Buscar org do usuário
  SELECT current_organization_id INTO v_org_id
  FROM profiles WHERE id = p_user_id;

  -- Gerar nome do ciclo baseado no contexto
  v_cycle_name := CASE p_origin_type
    WHEN 'arena_game' THEN 'Avaliação pós-jogo'
    WHEN 'training' THEN 'Avaliação pós-treinamento'
    WHEN 'challenge' THEN 'Avaliação de desafio'
    WHEN 'goal' THEN 'Avaliação de meta PDI'
    WHEN 'cognitive_test' THEN 'Avaliação pós-teste cognitivo'
    ELSE 'Avaliação contextual'
  END || ' - ' || to_char(now(), 'DD/MM/YYYY');

  -- Criar ciclo de avaliação
  INSERT INTO assessment_cycles (
    organization_id,
    name,
    description,
    cycle_type,
    start_date,
    end_date,
    status,
    evaluated_skills,
    context_type,
    context_id,
    created_by
  ) VALUES (
    v_org_id,
    v_cycle_name,
    'Avaliação gerada automaticamente a partir de ' || p_origin_type,
    p_assessment_type,
    now()::DATE,
    (now() + interval '7 days')::DATE,
    'active',
    p_skill_ids,
    p_origin_type,
    p_origin_id,
    p_user_id
  )
  RETURNING id INTO v_cycle_id;

  -- Criar link de contexto
  INSERT INTO assessment_context_links (
    assessment_cycle_id,
    origin_event_id,
    origin_type,
    origin_id,
    context_skill_ids,
    loop_status
  ) VALUES (
    v_cycle_id,
    p_origin_event_id,
    p_origin_type,
    p_origin_id,
    p_skill_ids,
    'open'
  );

  -- Criar avaliações baseadas no tipo
  IF p_assessment_type = 'self' THEN
    -- Autoavaliação
    INSERT INTO assessments_360 (
      cycle_id, evaluatee_id, evaluator_id, relationship, status
    ) VALUES (
      v_cycle_id, p_user_id, p_user_id, 'self', 'pending'
    );
  ELSIF p_evaluators IS NOT NULL THEN
    -- Avaliação por avaliadores específicos
    FOREACH v_evaluator_id IN ARRAY p_evaluators
    LOOP
      INSERT INTO assessments_360 (
        cycle_id, evaluatee_id, evaluator_id, relationship, status
      ) VALUES (
        v_cycle_id, 
        p_user_id, 
        v_evaluator_id, 
        CASE WHEN v_evaluator_id = p_user_id THEN 'self' ELSE 'peer' END,
        'pending'
      );
    END LOOP;
  END IF;

  -- Registrar evento de sugestão aceita
  INSERT INTO core_events (
    user_id, organization_id, event_type, skill_ids, metadata
  ) VALUES (
    p_user_id,
    v_org_id,
    'AVALIACAO_SUGERIDA',
    p_skill_ids,
    jsonb_build_object(
      'cycle_id', v_cycle_id,
      'origin_type', p_origin_type,
      'origin_id', p_origin_id,
      'assessment_type', p_assessment_type
    )
  );

  RETURN v_cycle_id;
END;
$$;

-- 9. Trigger: Verificar gatilhos após inserção de evento
CREATE OR REPLACE FUNCTION public.check_assessment_triggers()
RETURNS TRIGGER AS $$
DECLARE
  v_trigger RECORD;
  v_event_count INT;
BEGIN
  -- Verificar triggers ativos para este tipo de evento
  FOR v_trigger IN
    SELECT * FROM assessment_triggers
    WHERE is_active = true
      AND trigger_type = 'event'
      AND event_type = NEW.event_type
      AND organization_id = NEW.organization_id
  LOOP
    -- Contar eventos recentes deste tipo
    SELECT COUNT(*) INTO v_event_count
    FROM core_events
    WHERE user_id = NEW.user_id
      AND event_type = NEW.event_type
      AND created_at > now() - interval '7 days';

    -- Se atingiu o count, criar sugestão
    IF v_event_count >= v_trigger.event_count THEN
      INSERT INTO assessment_suggestions (
        user_id,
        organization_id,
        trigger_id,
        context_event_id,
        suggestion_type,
        reason,
        skills_to_evaluate,
        priority,
        context_type
      ) VALUES (
        NEW.user_id,
        NEW.organization_id,
        v_trigger.id,
        NEW.id,
        'auto',
        'Gatilho automático após ' || v_event_count || ' eventos de ' || NEW.event_type,
        COALESCE(v_trigger.skills_to_evaluate, NEW.skill_ids),
        3,
        v_trigger.assessment_type
      )
      ON CONFLICT DO NOTHING;
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public';

CREATE TRIGGER trg_check_assessment_triggers
  AFTER INSERT ON public.core_events
  FOR EACH ROW
  EXECUTE FUNCTION public.check_assessment_triggers();

-- 10. Realtime para sugestões
ALTER PUBLICATION supabase_realtime ADD TABLE public.assessment_suggestions;