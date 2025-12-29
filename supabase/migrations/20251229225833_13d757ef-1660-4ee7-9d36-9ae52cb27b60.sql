-- =============================================
-- FASE 2: MOTOR DE VERIFICAÇÃO DE CRITÉRIOS
-- =============================================

-- 2.1 Função para calcular progresso de um critério específico
CREATE OR REPLACE FUNCTION calculate_criterion_progress(
  p_user_id UUID,
  p_criterion_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_criterion RECORD;
  v_current NUMERIC := 0;
  v_required NUMERIC := 0;
  v_progress NUMERIC := 0;
  v_met BOOLEAN := false;
  v_time_filter TIMESTAMPTZ;
  v_events RECORD;
BEGIN
  -- Buscar o critério
  SELECT * INTO v_criterion
  FROM insignia_criteria
  WHERE id = p_criterion_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Criterion not found');
  END IF;
  
  -- Calcular filtro de tempo
  IF v_criterion.time_window_days IS NOT NULL THEN
    v_time_filter := now() - (v_criterion.time_window_days || ' days')::INTERVAL;
  ELSE
    v_time_filter := '1970-01-01'::TIMESTAMPTZ;
  END IF;
  
  -- Processar conforme tipo de critério
  CASE v_criterion.criterion_type
    
    -- Contagem de eventos
    WHEN 'event_count' THEN
      v_required := v_criterion.min_count;
      
      SELECT COUNT(*) INTO v_current
      FROM core_events ce
      WHERE ce.user_id = p_user_id
        AND ce.event_type = v_criterion.event_type
        AND ce.created_at >= v_time_filter
        AND (
          v_criterion.context_config = '{}'::JSONB
          OR (ce.metadata @> v_criterion.context_config)
        );
      
      v_met := v_current >= v_required;
      v_progress := LEAST(100, (v_current::NUMERIC / NULLIF(v_required, 0)::NUMERIC) * 100);
    
    -- Média de score nos eventos
    WHEN 'event_avg_score' THEN
      v_required := v_criterion.avg_value;
      
      SELECT COALESCE(AVG(ce.score), 0) INTO v_current
      FROM core_events ce
      WHERE ce.user_id = p_user_id
        AND ce.event_type = v_criterion.event_type
        AND ce.created_at >= v_time_filter
        AND ce.score IS NOT NULL
        AND (
          v_criterion.context_config = '{}'::JSONB
          OR (ce.metadata @> v_criterion.context_config)
        );
      
      v_met := v_current >= v_required;
      v_progress := LEAST(100, (v_current::NUMERIC / NULLIF(v_required, 0)::NUMERIC) * 100);
    
    -- Score mínimo em evento
    WHEN 'event_min_score' THEN
      v_required := v_criterion.min_value;
      
      SELECT COALESCE(MAX(ce.score), 0) INTO v_current
      FROM core_events ce
      WHERE ce.user_id = p_user_id
        AND ce.event_type = v_criterion.event_type
        AND ce.created_at >= v_time_filter
        AND (
          v_criterion.context_config = '{}'::JSONB
          OR (ce.metadata @> v_criterion.context_config)
        );
      
      v_met := v_current >= v_required;
      v_progress := LEAST(100, (v_current::NUMERIC / NULLIF(v_required, 0)::NUMERIC) * 100);
    
    -- Dias de streak
    WHEN 'streak_days' THEN
      v_required := v_criterion.min_value;
      
      SELECT COALESCE(MAX(us.current_streak), 0) INTO v_current
      FROM user_streaks us
      WHERE us.user_id = p_user_id;
      
      v_met := v_current >= v_required;
      v_progress := LEAST(100, (v_current::NUMERIC / NULLIF(v_required, 0)::NUMERIC) * 100);
    
    -- Diversidade (tipos de eventos diferentes)
    WHEN 'diversity' THEN
      v_required := v_criterion.min_count;
      
      SELECT COUNT(DISTINCT ce.event_type) INTO v_current
      FROM core_events ce
      WHERE ce.user_id = p_user_id
        AND ce.created_at >= v_time_filter;
      
      v_met := v_current >= v_required;
      v_progress := LEAST(100, (v_current::NUMERIC / NULLIF(v_required, 0)::NUMERIC) * 100);
    
    -- Nível de skill
    WHEN 'skill_level' THEN
      v_required := v_criterion.min_value;
      
      SELECT COALESCE(MAX(st.mastery_level), 0) INTO v_current
      FROM skill_tree st
      WHERE st.user_id = p_user_id
        AND (
          v_criterion.context_config->>'skill_id' IS NULL
          OR st.skill_id = (v_criterion.context_config->>'skill_id')::UUID
        );
      
      v_met := v_current >= v_required;
      v_progress := LEAST(100, (v_current::NUMERIC / NULLIF(v_required, 0)::NUMERIC) * 100);
    
    -- Eventos consecutivos com score acima do threshold
    WHEN 'consecutive' THEN
      v_required := v_criterion.min_count;
      
      -- Conta a maior sequência consecutiva de eventos com score >= min_value
      WITH ranked_events AS (
        SELECT 
          ce.id,
          ce.score,
          ce.created_at,
          CASE WHEN ce.score >= v_criterion.min_value THEN 1 ELSE 0 END as meets_threshold,
          ROW_NUMBER() OVER (ORDER BY ce.created_at) as rn
        FROM core_events ce
        WHERE ce.user_id = p_user_id
          AND ce.event_type = v_criterion.event_type
          AND ce.created_at >= v_time_filter
      ),
      grouped AS (
        SELECT 
          meets_threshold,
          rn - ROW_NUMBER() OVER (PARTITION BY meets_threshold ORDER BY rn) as grp
        FROM ranked_events
        WHERE meets_threshold = 1
      )
      SELECT COALESCE(MAX(cnt), 0) INTO v_current
      FROM (
        SELECT COUNT(*) as cnt
        FROM grouped
        GROUP BY grp
      ) sq;
      
      v_met := v_current >= v_required;
      v_progress := LEAST(100, (v_current::NUMERIC / NULLIF(v_required, 0)::NUMERIC) * 100);
    
    -- Sem falhas (score abaixo do threshold)
    WHEN 'no_failures' THEN
      v_required := v_criterion.min_count; -- Número mínimo de tentativas sem falha
      
      SELECT COUNT(*) INTO v_current
      FROM core_events ce
      WHERE ce.user_id = p_user_id
        AND ce.event_type = v_criterion.event_type
        AND ce.created_at >= v_time_filter
        AND ce.score >= COALESCE(v_criterion.min_value, 50);
      
      -- Verificar se houve falhas no período
      IF EXISTS (
        SELECT 1 FROM core_events ce
        WHERE ce.user_id = p_user_id
          AND ce.event_type = v_criterion.event_type
          AND ce.created_at >= v_time_filter
          AND ce.score < COALESCE(v_criterion.min_value, 50)
      ) THEN
        v_met := false;
        v_progress := 0;
      ELSE
        v_met := v_current >= v_required;
        v_progress := LEAST(100, (v_current::NUMERIC / NULLIF(v_required, 0)::NUMERIC) * 100);
      END IF;
    
    ELSE
      -- Tipo desconhecido
      v_required := 0;
      v_current := 0;
      v_met := false;
      v_progress := 0;
  END CASE;
  
  RETURN jsonb_build_object(
    'criterion_id', p_criterion_id,
    'criterion_type', v_criterion.criterion_type,
    'description', v_criterion.description,
    'current', v_current,
    'required', v_required,
    'progress', ROUND(v_progress, 2),
    'met', v_met,
    'weight', v_criterion.weight,
    'is_required', v_criterion.is_required
  );
END;
$$;

-- 2.2 Função para verificar todos os critérios de uma insígnia
CREATE OR REPLACE FUNCTION check_insignia_criteria(
  p_user_id UUID,
  p_insignia_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_insignia RECORD;
  v_criterion RECORD;
  v_criterion_result JSONB;
  v_criteria_results JSONB[] := '{}';
  v_total_weight INTEGER := 0;
  v_weighted_progress NUMERIC := 0;
  v_all_required_met BOOLEAN := true;
  v_eligible BOOLEAN := false;
BEGIN
  -- Buscar a insígnia
  SELECT * INTO v_insignia
  FROM insignias
  WHERE id = p_insignia_id AND is_active = true;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Insignia not found or inactive');
  END IF;
  
  -- Verificar se já foi conquistada
  IF EXISTS (
    SELECT 1 FROM user_insignias
    WHERE user_id = p_user_id AND insignia_id = p_insignia_id
  ) THEN
    RETURN jsonb_build_object(
      'eligible', false,
      'already_unlocked', true,
      'progress', 100,
      'criteria', '[]'::JSONB
    );
  END IF;
  
  -- Verificar pré-requisitos
  IF v_insignia.prerequisites IS NOT NULL AND array_length(v_insignia.prerequisites, 1) > 0 THEN
    IF NOT (
      SELECT COUNT(*) = array_length(v_insignia.prerequisites, 1)
      FROM user_insignias ui
      WHERE ui.user_id = p_user_id
        AND ui.insignia_id = ANY(v_insignia.prerequisites)
    ) THEN
      RETURN jsonb_build_object(
        'eligible', false,
        'prerequisites_missing', true,
        'missing_prerequisites', (
          SELECT jsonb_agg(jsonb_build_object('id', i.id, 'name', i.name))
          FROM insignias i
          WHERE i.id = ANY(v_insignia.prerequisites)
            AND i.id NOT IN (
              SELECT ui.insignia_id FROM user_insignias ui
              WHERE ui.user_id = p_user_id
            )
        ),
        'progress', 0,
        'criteria', '[]'::JSONB
      );
    END IF;
  END IF;
  
  -- Processar cada critério
  FOR v_criterion IN
    SELECT * FROM insignia_criteria
    WHERE insignia_id = p_insignia_id
    ORDER BY sort_order, created_at
  LOOP
    v_criterion_result := calculate_criterion_progress(p_user_id, v_criterion.id);
    v_criteria_results := array_append(v_criteria_results, v_criterion_result);
    
    -- Somar pesos
    v_total_weight := v_total_weight + v_criterion.weight;
    v_weighted_progress := v_weighted_progress + 
      ((v_criterion_result->>'progress')::NUMERIC * v_criterion.weight);
    
    -- Verificar critérios obrigatórios
    IF v_criterion.is_required AND NOT (v_criterion_result->>'met')::BOOLEAN THEN
      v_all_required_met := false;
    END IF;
  END LOOP;
  
  -- Se não há critérios definidos, usar regras legacy (XP, skill, etc.)
  IF v_total_weight = 0 THEN
    -- Fallback para sistema antigo
    RETURN jsonb_build_object(
      'eligible', false,
      'no_criteria', true,
      'progress', 0,
      'criteria', '[]'::JSONB
    );
  END IF;
  
  -- Calcular progresso total
  v_weighted_progress := v_weighted_progress / v_total_weight;
  v_eligible := v_all_required_met AND v_weighted_progress >= 100;
  
  RETURN jsonb_build_object(
    'eligible', v_eligible,
    'progress', ROUND(v_weighted_progress, 2),
    'all_required_met', v_all_required_met,
    'criteria', to_jsonb(v_criteria_results)
  );
END;
$$;

-- 2.3 Função para desbloquear uma insígnia
CREATE OR REPLACE FUNCTION unlock_insignia(
  p_user_id UUID,
  p_insignia_id UUID,
  p_source_events UUID[] DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_insignia RECORD;
  v_check_result JSONB;
  v_user_insignia_id UUID;
  v_org_id UUID;
BEGIN
  -- Buscar a insígnia
  SELECT * INTO v_insignia
  FROM insignias
  WHERE id = p_insignia_id AND is_active = true;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Insignia not found or inactive';
  END IF;
  
  -- Verificar se já foi conquistada
  IF EXISTS (
    SELECT 1 FROM user_insignias
    WHERE user_id = p_user_id AND insignia_id = p_insignia_id
  ) THEN
    -- Retorna o ID existente
    SELECT id INTO v_user_insignia_id
    FROM user_insignias
    WHERE user_id = p_user_id AND insignia_id = p_insignia_id;
    RETURN v_user_insignia_id;
  END IF;
  
  -- Verificar elegibilidade
  v_check_result := check_insignia_criteria(p_user_id, p_insignia_id);
  
  IF NOT (v_check_result->>'eligible')::BOOLEAN THEN
    RAISE EXCEPTION 'User is not eligible for this insignia';
  END IF;
  
  -- Buscar organização do usuário
  SELECT organization_id INTO v_org_id
  FROM organization_members
  WHERE user_id = p_user_id
  LIMIT 1;
  
  -- Criar registro na user_insignias
  INSERT INTO user_insignias (
    user_id,
    insignia_id,
    unlocked_at,
    progress_snapshot,
    source_events,
    awarded_by,
    xp_awarded,
    coins_awarded
  ) VALUES (
    p_user_id,
    p_insignia_id,
    now(),
    v_check_result,
    p_source_events,
    'system',
    COALESCE(v_insignia.xp_reward, 0),
    COALESCE(v_insignia.coins_reward, 0)
  )
  RETURNING id INTO v_user_insignia_id;
  
  -- Atualizar user_stats com XP e coins
  UPDATE user_stats
  SET 
    xp = xp + COALESCE(v_insignia.xp_reward, 0),
    coins = coins + COALESCE(v_insignia.coins_reward, 0),
    updated_at = now()
  WHERE user_id = p_user_id;
  
  -- Registrar evento INSIGNIA_CONQUISTADA
  INSERT INTO core_events (
    user_id,
    organization_id,
    event_type,
    skill_ids,
    xp_earned,
    coins_earned,
    metadata
  ) VALUES (
    p_user_id,
    v_org_id,
    'INSIGNIA_CONQUISTADA',
    v_insignia.related_skill_ids,
    COALESCE(v_insignia.xp_reward, 0),
    COALESCE(v_insignia.coins_reward, 0),
    jsonb_build_object(
      'insignia_id', p_insignia_id,
      'insignia_name', v_insignia.name,
      'insignia_type', v_insignia.insignia_type,
      'level', v_insignia.level
    )
  );
  
  RETURN v_user_insignia_id;
END;
$$;

-- 2.4 Função para verificar e desbloquear insígnias elegíveis
CREATE OR REPLACE FUNCTION check_and_unlock_eligible_insignias(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_insignia RECORD;
  v_check_result JSONB;
  v_unlocked_ids UUID[] := '{}';
  v_org_id UUID;
BEGIN
  -- Buscar organização do usuário
  SELECT organization_id INTO v_org_id
  FROM organization_members
  WHERE user_id = p_user_id
  LIMIT 1;
  
  -- Iterar sobre insígnias ativas não conquistadas
  FOR v_insignia IN
    SELECT i.* 
    FROM insignias i
    WHERE i.is_active = true
      AND (i.organization_id IS NULL OR i.organization_id = v_org_id)
      AND NOT EXISTS (
        SELECT 1 FROM user_insignias ui
        WHERE ui.user_id = p_user_id AND ui.insignia_id = i.id
      )
    ORDER BY i.level ASC, i.created_at ASC
  LOOP
    -- Verificar elegibilidade
    v_check_result := check_insignia_criteria(p_user_id, v_insignia.id);
    
    IF (v_check_result->>'eligible')::BOOLEAN THEN
      -- Desbloquear
      PERFORM unlock_insignia(p_user_id, v_insignia.id);
      v_unlocked_ids := array_append(v_unlocked_ids, v_insignia.id);
    END IF;
  END LOOP;
  
  RETURN jsonb_build_object(
    'checked_user', p_user_id,
    'unlocked_count', array_length(v_unlocked_ids, 1),
    'unlocked_insignia_ids', to_jsonb(v_unlocked_ids)
  );
END;
$$;

-- 2.5 Trigger function para verificar insígnias após eventos
CREATE OR REPLACE FUNCTION trg_check_insignias_on_event()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Agendar verificação de insígnias para o usuário
  -- Usamos PERFORM para não bloquear a inserção do evento
  PERFORM check_and_unlock_eligible_insignias(NEW.user_id);
  
  RETURN NEW;
END;
$$;

-- 2.6 Criar trigger na tabela core_events
DROP TRIGGER IF EXISTS trg_core_events_check_insignias ON core_events;
CREATE TRIGGER trg_core_events_check_insignias
  AFTER INSERT ON core_events
  FOR EACH ROW
  EXECUTE FUNCTION trg_check_insignias_on_event();

-- 2.7 Função RPC para obter progresso de todas as insígnias do usuário
CREATE OR REPLACE FUNCTION get_user_insignias_progress(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_org_id UUID;
  v_result JSONB;
BEGIN
  -- Buscar organização do usuário
  SELECT organization_id INTO v_org_id
  FROM organization_members
  WHERE user_id = p_user_id
  LIMIT 1;
  
  SELECT jsonb_agg(
    jsonb_build_object(
      'insignia', jsonb_build_object(
        'id', i.id,
        'name', i.name,
        'description', i.description,
        'icon', i.icon,
        'insignia_type', i.insignia_type,
        'level', i.level,
        'star_level', i.star_level,
        'xp_reward', i.xp_reward,
        'coins_reward', i.coins_reward,
        'prerequisites', i.prerequisites,
        'related_skill_ids', i.related_skill_ids,
        'unlock_message', i.unlock_message
      ),
      'unlocked', ui.id IS NOT NULL,
      'unlocked_at', ui.unlocked_at,
      'progress', CASE 
        WHEN ui.id IS NOT NULL THEN 100
        ELSE COALESCE((check_insignia_criteria(p_user_id, i.id)->>'progress')::NUMERIC, 0)
      END,
      'criteria_status', CASE
        WHEN ui.id IS NOT NULL THEN ui.progress_snapshot
        ELSE check_insignia_criteria(p_user_id, i.id)
      END
    )
  ) INTO v_result
  FROM insignias i
  LEFT JOIN user_insignias ui ON ui.insignia_id = i.id AND ui.user_id = p_user_id
  WHERE i.is_active = true
    AND (i.organization_id IS NULL OR i.organization_id = v_org_id);
  
  RETURN COALESCE(v_result, '[]'::JSONB);
END;
$$;

-- Comentários para documentação
COMMENT ON FUNCTION calculate_criterion_progress IS 'Calcula o progresso de um critério específico para um usuário';
COMMENT ON FUNCTION check_insignia_criteria IS 'Verifica todos os critérios de uma insígnia e retorna elegibilidade';
COMMENT ON FUNCTION unlock_insignia IS 'Desbloqueia uma insígnia para um usuário, registrando evento e concedendo rewards';
COMMENT ON FUNCTION check_and_unlock_eligible_insignias IS 'Verifica e desbloqueia todas as insígnias elegíveis para um usuário';
COMMENT ON FUNCTION get_user_insignias_progress IS 'Retorna progresso de todas as insígnias disponíveis para um usuário';