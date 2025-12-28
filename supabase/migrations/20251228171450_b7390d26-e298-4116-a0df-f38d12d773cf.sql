-- 1. Migrar dados existentes de user_xp_history para user_activity_log
-- Inserir registros de atividades baseados no histórico de XP existente
INSERT INTO user_activity_log (user_id, organization_id, activity_type, game_type, xp_earned, coins_earned, metadata, created_at)
SELECT 
  user_id, 
  organization_id, 
  'game_played' as activity_type,
  COALESCE(source, 'training') as game_type,
  xp_earned,
  COALESCE(coins_earned, 0),
  jsonb_build_object('source_id', source_id, 'migrated', true),
  created_at
FROM user_xp_history
WHERE NOT EXISTS (
  SELECT 1 FROM user_activity_log 
  WHERE user_activity_log.user_id = user_xp_history.user_id 
  AND user_activity_log.created_at = user_xp_history.created_at
  AND user_activity_log.activity_type = 'game_played'
);

-- 2. Criar função de sincronização de XP para atividades
CREATE OR REPLACE FUNCTION public.sync_xp_to_activity()
RETURNS TRIGGER AS $$
BEGIN
  -- Evita duplicatas verificando se já existe registro similar
  IF NOT EXISTS (
    SELECT 1 FROM user_activity_log 
    WHERE user_id = NEW.user_id 
    AND created_at = NEW.created_at 
    AND game_type = NEW.source
    AND activity_type = 'xp_earned'
  ) THEN
    INSERT INTO user_activity_log (
      user_id, 
      organization_id, 
      activity_type, 
      game_type, 
      xp_earned, 
      coins_earned, 
      metadata, 
      created_at
    ) VALUES (
      NEW.user_id, 
      NEW.organization_id, 
      'xp_earned', 
      COALESCE(NEW.source, 'unknown'),
      NEW.xp_earned, 
      COALESCE(NEW.coins_earned, 0),
      jsonb_build_object('source_id', NEW.source_id, 'auto_synced', true),
      NEW.created_at
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3. Aplicar trigger para sincronização automática
DROP TRIGGER IF EXISTS trg_sync_xp_to_activity ON user_xp_history;
CREATE TRIGGER trg_sync_xp_to_activity
  AFTER INSERT ON user_xp_history
  FOR EACH ROW EXECUTE FUNCTION sync_xp_to_activity();

-- 4. Atualizar função de métricas de engajamento para usar ambas as fontes
CREATE OR REPLACE FUNCTION public.get_org_engagement_metrics(_org_id uuid, _period text DEFAULT '30d'::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  result jsonb;
  start_date timestamptz;
  total_members integer;
BEGIN
  -- Verificar permissão
  IF NOT public.is_org_admin(auth.uid(), _org_id) THEN
    RETURN jsonb_build_object('error', 'Sem permissão');
  END IF;

  start_date := CASE _period
    WHEN '7d' THEN now() - interval '7 days'
    WHEN '30d' THEN now() - interval '30 days'
    WHEN '90d' THEN now() - interval '90 days'
    ELSE now() - interval '30 days'
  END;
  
  -- Contar membros
  SELECT COUNT(*) INTO total_members 
  FROM organization_members WHERE organization_id = _org_id;
  
  -- Usar UNION para combinar fontes de atividade (user_activity_log e user_xp_history)
  SELECT jsonb_build_object(
    'total_members', total_members,
    'dau', COALESCE((
      SELECT COUNT(DISTINCT user_id) FROM (
        SELECT user_id FROM user_activity_log 
        WHERE organization_id = _org_id AND created_at > now() - interval '1 day'
        UNION
        SELECT user_id FROM user_xp_history 
        WHERE organization_id = _org_id AND created_at > now() - interval '1 day'
      ) combined
    ), 0),
    'wau', COALESCE((
      SELECT COUNT(DISTINCT user_id) FROM (
        SELECT user_id FROM user_activity_log 
        WHERE organization_id = _org_id AND created_at > now() - interval '7 days'
        UNION
        SELECT user_id FROM user_xp_history 
        WHERE organization_id = _org_id AND created_at > now() - interval '7 days'
      ) combined
    ), 0),
    'mau', COALESCE((
      SELECT COUNT(DISTINCT user_id) FROM (
        SELECT user_id FROM user_activity_log 
        WHERE organization_id = _org_id AND created_at > now() - interval '30 days'
        UNION
        SELECT user_id FROM user_xp_history 
        WHERE organization_id = _org_id AND created_at > now() - interval '30 days'
      ) combined
    ), 0),
    'avg_streak', COALESCE((SELECT AVG(current_streak)::numeric(10,1) FROM user_streaks us
                   JOIN organization_members om ON us.user_id = om.user_id
                   WHERE om.organization_id = _org_id), 0),
    'total_activities', COALESCE((
      SELECT COUNT(*) FROM (
        SELECT id FROM user_activity_log 
        WHERE organization_id = _org_id AND created_at > start_date
        UNION ALL
        SELECT id FROM user_xp_history 
        WHERE organization_id = _org_id AND created_at > start_date
      ) combined
    ), 0),
    'period', _period
  ) INTO result;
  
  RETURN result;
END;
$function$;

-- 5. Atualizar função de métricas de membros para usar ambas as fontes
CREATE OR REPLACE FUNCTION public.get_org_members_with_metrics(_org_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT public.is_org_admin(auth.uid(), _org_id) THEN
    RETURN jsonb_build_object('error', 'Sem permissão');
  END IF;
  
  RETURN COALESCE((SELECT jsonb_agg(row_to_json(t)) FROM (
    SELECT 
      om.user_id,
      om.org_role,
      om.joined_at,
      om.team_id,
      p.nickname,
      p.avatar_url,
      ot.name as team_name,
      COALESCE(us.current_streak, 0) as current_streak,
      COALESCE((SELECT SUM(xp_earned) FROM user_xp_history WHERE user_id = om.user_id AND organization_id = _org_id), 0) as total_xp,
      -- Combina atividades de ambas as tabelas
      COALESCE((
        SELECT COUNT(*) FROM (
          SELECT id FROM user_activity_log 
          WHERE user_id = om.user_id AND organization_id = _org_id AND created_at > now() - interval '7 days'
          UNION ALL
          SELECT id FROM user_xp_history 
          WHERE user_id = om.user_id AND organization_id = _org_id AND created_at > now() - interval '7 days'
        ) combined
      ), 0) as activities_week,
      -- Status ativo baseado em qualquer atividade recente
      CASE 
        WHEN EXISTS (
          SELECT 1 FROM user_activity_log 
          WHERE user_id = om.user_id AND created_at > now() - interval '7 days'
        ) OR EXISTS (
          SELECT 1 FROM user_xp_history 
          WHERE user_id = om.user_id AND created_at > now() - interval '7 days'
        ) THEN true
        ELSE false
      END as is_active
    FROM organization_members om
    JOIN profiles p ON om.user_id = p.id
    LEFT JOIN organization_teams ot ON om.team_id = ot.id
    LEFT JOIN user_streaks us ON om.user_id = us.user_id
    WHERE om.organization_id = _org_id
    ORDER BY total_xp DESC
  ) t), '[]'::jsonb);
END;
$function$;

-- 6. Corrigir política RLS de INSERT na user_activity_log (mais permissiva)
DROP POLICY IF EXISTS "Users can insert own activity" ON user_activity_log;
CREATE POLICY "Users can insert own activity" ON user_activity_log
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 7. Verificar se existe política SELECT
DROP POLICY IF EXISTS "Users can view own activity" ON user_activity_log;
CREATE POLICY "Users can view own activity" ON user_activity_log
  FOR SELECT
  USING (auth.uid() = user_id OR public.is_org_admin(auth.uid(), organization_id));