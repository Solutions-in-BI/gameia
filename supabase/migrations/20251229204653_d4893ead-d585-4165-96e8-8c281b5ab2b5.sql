-- =====================================================
-- FASE 9: Notificações e Alertas Integrados
-- =====================================================

-- 1. Função para criar notificações de avaliação
CREATE OR REPLACE FUNCTION create_assessment_notification(
  p_user_id UUID,
  p_notification_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_data JSONB DEFAULT '{}'::jsonb,
  p_priority TEXT DEFAULT 'normal',
  p_action_url TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO notifications (
    user_id,
    type,
    title,
    message,
    data,
    priority,
    action_url,
    is_read,
    created_at
  ) VALUES (
    p_user_id,
    p_notification_type,
    p_title,
    p_message,
    p_data,
    p_priority,
    p_action_url,
    false,
    NOW()
  )
  RETURNING id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$$;

-- 2. Trigger para notificar quando sugestão de avaliação é criada
CREATE OR REPLACE FUNCTION notify_assessment_suggestion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_title TEXT;
  v_message TEXT;
  v_priority TEXT := 'normal';
BEGIN
  -- Determinar título e mensagem baseado no tipo
  CASE NEW.suggestion_type
    WHEN 'low_score_assessment' THEN
      v_title := 'Oportunidade de Melhoria';
      v_message := 'Identificamos uma área que pode se beneficiar de uma avaliação para potencializar seu desenvolvimento.';
      v_priority := 'high';
    WHEN 'streak_recovery' THEN
      v_title := 'Retome seu Progresso';
      v_message := 'Uma avaliação rápida pode ajudar a entender seu momento e planejar próximos passos.';
      v_priority := 'normal';
    WHEN 'goal_failed' THEN
      v_title := 'Reflexão sobre Meta';
      v_message := 'Sugerimos uma avaliação para identificar pontos de melhoria e ajustar sua estratégia.';
      v_priority := 'high';
    WHEN 'peer_feedback' THEN
      v_title := 'Feedback Pendente';
      v_message := 'Um colega solicitou seu feedback. Sua perspectiva é valiosa!';
      v_priority := 'normal';
    WHEN 'manager_request' THEN
      v_title := 'Solicitação do Gestor';
      v_message := 'Seu gestor sugeriu uma avaliação para apoiar seu desenvolvimento.';
      v_priority := 'high';
    WHEN 'self_assessment' THEN
      v_title := 'Hora de Auto-Avaliação';
      v_message := 'É um bom momento para refletir sobre seu progresso e identificar oportunidades.';
      v_priority := 'normal';
    ELSE
      v_title := 'Nova Sugestão de Avaliação';
      v_message := COALESCE(NEW.reason, 'Uma nova oportunidade de avaliação está disponível para você.');
  END CASE;

  -- Criar notificação
  PERFORM create_assessment_notification(
    NEW.user_id,
    'assessment_suggestion',
    v_title,
    v_message,
    jsonb_build_object(
      'suggestion_id', NEW.id,
      'suggestion_type', NEW.suggestion_type,
      'skills_to_evaluate', NEW.skills_to_evaluate,
      'priority', NEW.priority
    ),
    v_priority,
    '/app?tab=evolution'
  );

  RETURN NEW;
END;
$$;

-- Criar trigger
DROP TRIGGER IF EXISTS trg_notify_assessment_suggestion ON assessment_suggestions;
CREATE TRIGGER trg_notify_assessment_suggestion
  AFTER INSERT ON assessment_suggestions
  FOR EACH ROW
  EXECUTE FUNCTION notify_assessment_suggestion();

-- 3. Trigger para notificar quando ciclo de avaliação é fechado
CREATE OR REPLACE FUNCTION notify_assessment_cycle_closed()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_cycle_name TEXT;
  v_result_count INT;
BEGIN
  -- Só notificar quando status muda para 'completed'
  IF OLD.status != 'completed' AND NEW.status = 'completed' THEN
    -- Buscar nome do ciclo
    v_cycle_name := NEW.name;
    
    -- Buscar todos os avaliados e notificá-los
    FOR v_user_id IN
      SELECT DISTINCT evaluatee_id FROM assessments_360 WHERE cycle_id = NEW.id
    LOOP
      -- Contar resultados
      SELECT COUNT(*) INTO v_result_count
      FROM assessments_360
      WHERE cycle_id = NEW.id AND evaluatee_id = v_user_id AND status = 'completed';
      
      PERFORM create_assessment_notification(
        v_user_id,
        'assessment_completed',
        'Resultados Disponíveis',
        format('O ciclo "%s" foi concluído! Você recebeu %s avaliação(ões). Confira seus resultados.', v_cycle_name, v_result_count),
        jsonb_build_object(
          'cycle_id', NEW.id,
          'cycle_name', v_cycle_name,
          'result_count', v_result_count
        ),
        'high',
        '/app?tab=evolution'
      );
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Criar trigger
DROP TRIGGER IF EXISTS trg_notify_assessment_cycle_closed ON assessment_cycles;
CREATE TRIGGER trg_notify_assessment_cycle_closed
  AFTER UPDATE ON assessment_cycles
  FOR EACH ROW
  EXECUTE FUNCTION notify_assessment_cycle_closed();

-- 4. Trigger para notificar quando meta PDI está próxima do vencimento
CREATE OR REPLACE FUNCTION notify_pdi_goal_due()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_days_until_due INT;
BEGIN
  -- Buscar user_id do plano
  SELECT user_id INTO v_user_id
  FROM development_plans
  WHERE id = NEW.plan_id;
  
  IF v_user_id IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- Calcular dias até vencimento
  v_days_until_due := EXTRACT(DAY FROM (NEW.target_date::timestamp - NOW()));
  
  -- Notificar se meta está próxima (3 dias) e progresso < 80%
  IF v_days_until_due <= 3 AND v_days_until_due >= 0 AND COALESCE(NEW.progress, 0) < 80 THEN
    PERFORM create_assessment_notification(
      v_user_id,
      'pdi_goal_due',
      'Meta PDI se Aproximando',
      format('A meta "%s" vence em %s dia(s) e está em %s%% de progresso.', 
        NEW.title, v_days_until_due, COALESCE(NEW.progress, 0)),
      jsonb_build_object(
        'goal_id', NEW.id,
        'goal_title', NEW.title,
        'progress', NEW.progress,
        'days_until_due', v_days_until_due
      ),
      CASE WHEN v_days_until_due <= 1 THEN 'urgent' ELSE 'high' END,
      '/app?tab=pdi'
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Criar trigger (só para updates de progresso)
DROP TRIGGER IF EXISTS trg_notify_pdi_goal_due ON development_goals;
CREATE TRIGGER trg_notify_pdi_goal_due
  AFTER UPDATE OF progress ON development_goals
  FOR EACH ROW
  WHEN (NEW.status = 'in_progress')
  EXECUTE FUNCTION notify_pdi_goal_due();

-- 5. Função para enviar notificações em lote para times
CREATE OR REPLACE FUNCTION notify_team_assessment_cycle(
  p_cycle_id UUID,
  p_team_id UUID
)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_cycle_name TEXT;
  v_member RECORD;
  v_count INT := 0;
BEGIN
  -- Buscar nome do ciclo
  SELECT name INTO v_cycle_name FROM assessment_cycles WHERE id = p_cycle_id;
  
  IF v_cycle_name IS NULL THEN
    RETURN 0;
  END IF;
  
  -- Notificar cada membro do time
  FOR v_member IN
    SELECT m.user_id, p.nickname
    FROM organization_members m
    JOIN profiles p ON p.id = m.user_id
    WHERE m.team_id = p_team_id
  LOOP
    PERFORM create_assessment_notification(
      v_member.user_id,
      'team_assessment',
      'Avaliação de Equipe',
      format('O ciclo de avaliação "%s" foi iniciado para sua equipe.', v_cycle_name),
      jsonb_build_object(
        'cycle_id', p_cycle_id,
        'team_id', p_team_id
      ),
      'normal',
      '/app?tab=evolution'
    );
    v_count := v_count + 1;
  END LOOP;
  
  RETURN v_count;
END;
$$;

-- 6. Função para buscar notificações de avaliação do usuário
CREATE OR REPLACE FUNCTION get_assessment_notifications(p_user_id UUID)
RETURNS TABLE(
  id UUID,
  type TEXT,
  title TEXT,
  message TEXT,
  data JSONB,
  priority TEXT,
  action_url TEXT,
  is_read BOOLEAN,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    n.id,
    n.type,
    n.title,
    n.message,
    n.data,
    n.priority::text,
    n.action_url,
    n.is_read,
    n.created_at
  FROM notifications n
  WHERE n.user_id = p_user_id
    AND n.type IN ('assessment_suggestion', 'assessment_completed', 'pdi_goal_due', 'team_assessment', 'feedback_request')
  ORDER BY n.created_at DESC
  LIMIT 20;
END;
$$;