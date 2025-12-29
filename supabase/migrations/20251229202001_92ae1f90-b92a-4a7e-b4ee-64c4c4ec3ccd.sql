-- Trigger para criar alertas automáticos quando padrões críticos são detectados em core_events
-- Este trigger notifica gestores quando:
-- 1. Um streak de 7+ dias é quebrado
-- 2. Uma meta importante falha

-- Função que cria notificações para gestores
CREATE OR REPLACE FUNCTION notify_managers_on_critical_pattern()
RETURNS TRIGGER AS $$
DECLARE
  manager_record RECORD;
  user_name TEXT;
  alert_title TEXT;
  alert_message TEXT;
  alert_severity TEXT;
  suggested_action TEXT;
BEGIN
  -- Só processa eventos com organization_id
  IF NEW.organization_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Buscar nome do usuário
  SELECT COALESCE(full_name, nickname, 'Membro') INTO user_name
  FROM profiles
  WHERE id = NEW.user_id;

  -- Processar STREAK_QUEBRADO com streak >= 7 dias
  IF NEW.event_type = 'STREAK_QUEBRADO' THEN
    DECLARE
      prev_streak INT;
    BEGIN
      prev_streak := COALESCE((NEW.metadata->>'previous_streak')::INT, 0);
      
      IF prev_streak >= 7 THEN
        alert_title := 'Streak de ' || prev_streak || ' dias quebrado';
        alert_message := user_name || ' perdeu um streak de ' || prev_streak || ' dias consecutivos.';
        alert_severity := CASE WHEN prev_streak >= 14 THEN 'high' ELSE 'medium' END;
        suggested_action := 'schedule_1on1';
        
        -- Notificar todos os gestores da organização
        FOR manager_record IN
          SELECT user_id 
          FROM organization_members 
          WHERE organization_id = NEW.organization_id 
          AND org_role IN ('owner', 'admin', 'manager')
          AND user_id != NEW.user_id
          AND is_active = true
        LOOP
          INSERT INTO notifications (user_id, type, title, message, data, is_read)
          VALUES (
            manager_record.user_id,
            'alert',
            alert_title,
            alert_message,
            jsonb_build_object(
              'alert_type', 'streak_broken',
              'severity', alert_severity,
              'suggested_action', suggested_action,
              'target_user_id', NEW.user_id,
              'user_name', user_name,
              'previous_streak', prev_streak,
              'event_id', NEW.id
            ),
            false
          );
        END LOOP;
      END IF;
    END;
  END IF;

  -- Processar META_FALHOU
  IF NEW.event_type = 'META_FALHOU' THEN
    DECLARE
      goal_type TEXT;
      target_val NUMERIC;
      achieved_val NUMERIC;
    BEGIN
      goal_type := COALESCE(NEW.metadata->>'goal_type', 'meta');
      target_val := COALESCE((NEW.metadata->>'target_value')::NUMERIC, 0);
      achieved_val := COALESCE((NEW.metadata->>'achieved_value')::NUMERIC, 0);
      
      alert_title := 'Meta não atingida: ' || goal_type;
      alert_message := user_name || ' não atingiu a meta. Alcançou ' || achieved_val || ' de ' || target_val || '.';
      alert_severity := 'medium';
      suggested_action := 'assign_training';
      
      -- Notificar gestores
      FOR manager_record IN
        SELECT user_id 
        FROM organization_members 
        WHERE organization_id = NEW.organization_id 
        AND org_role IN ('owner', 'admin', 'manager')
        AND user_id != NEW.user_id
        AND is_active = true
      LOOP
        INSERT INTO notifications (user_id, type, title, message, data, is_read)
        VALUES (
          manager_record.user_id,
          'alert',
          alert_title,
          alert_message,
          jsonb_build_object(
            'alert_type', 'goal_failed',
            'severity', alert_severity,
            'suggested_action', suggested_action,
            'target_user_id', NEW.user_id,
            'user_name', user_name,
            'goal_type', goal_type,
            'target_value', target_val,
            'achieved_value', achieved_val,
            'event_id', NEW.id
          ),
          false
        );
      END LOOP;
    END;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar trigger
DROP TRIGGER IF EXISTS trg_notify_managers_critical_patterns ON core_events;
CREATE TRIGGER trg_notify_managers_critical_patterns
  AFTER INSERT ON core_events
  FOR EACH ROW
  EXECUTE FUNCTION notify_managers_on_critical_pattern();

-- Comentário explicativo
COMMENT ON FUNCTION notify_managers_on_critical_pattern() IS 
'Trigger function que cria alertas automáticos para gestores quando padrões críticos são detectados (streak quebrado >= 7 dias, meta não atingida)';