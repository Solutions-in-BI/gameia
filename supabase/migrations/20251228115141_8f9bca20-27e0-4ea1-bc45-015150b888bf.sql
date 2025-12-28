-- =============================================
-- FASE 3: FUNÇÕES RPC PARA MÉTRICAS
-- =============================================

-- 3.1 Função para obter métricas de engajamento da org
CREATE OR REPLACE FUNCTION public.get_org_engagement_metrics(
  _org_id uuid,
  _period text DEFAULT '30d'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
  
  SELECT jsonb_build_object(
    'total_members', total_members,
    'dau', COALESCE((SELECT COUNT(DISTINCT user_id) FROM user_activity_log 
            WHERE organization_id = _org_id AND created_at > now() - interval '1 day'), 0),
    'wau', COALESCE((SELECT COUNT(DISTINCT user_id) FROM user_activity_log 
            WHERE organization_id = _org_id AND created_at > now() - interval '7 days'), 0),
    'mau', COALESCE((SELECT COUNT(DISTINCT user_id) FROM user_activity_log 
            WHERE organization_id = _org_id AND created_at > now() - interval '30 days'), 0),
    'avg_streak', COALESCE((SELECT AVG(current_streak)::numeric(10,1) FROM user_streaks us
                   JOIN organization_members om ON us.user_id = om.user_id
                   WHERE om.organization_id = _org_id), 0),
    'total_activities', COALESCE((SELECT COUNT(*) FROM user_activity_log 
                         WHERE organization_id = _org_id AND created_at > start_date), 0),
    'period', _period
  ) INTO result;
  
  RETURN result;
END;
$$;

-- 3.2 Função para obter métricas de aprendizado
CREATE OR REPLACE FUNCTION public.get_org_learning_metrics(
  _org_id uuid,
  _period text DEFAULT '30d'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
  start_date timestamptz;
BEGIN
  IF NOT public.is_org_admin(auth.uid(), _org_id) THEN
    RETURN jsonb_build_object('error', 'Sem permissão');
  END IF;

  start_date := CASE _period
    WHEN '7d' THEN now() - interval '7 days'
    WHEN '30d' THEN now() - interval '30 days'
    WHEN '90d' THEN now() - interval '90 days'
    ELSE now() - interval '30 days'
  END;
  
  SELECT jsonb_build_object(
    'total_xp', COALESCE((SELECT SUM(xp_earned) FROM user_xp_history 
                WHERE organization_id = _org_id AND created_at > start_date), 0),
    'avg_xp_per_user', COALESCE((SELECT AVG(xp_earned)::numeric(10,1) FROM user_xp_history 
                        WHERE organization_id = _org_id AND created_at > start_date), 0),
    'total_coins', COALESCE((SELECT SUM(coins_earned) FROM user_xp_history 
                   WHERE organization_id = _org_id AND created_at > start_date), 0),
    'active_learners', COALESCE((SELECT COUNT(DISTINCT user_id) FROM user_xp_history 
                        WHERE organization_id = _org_id AND created_at > start_date), 0),
    'top_sources', COALESCE((SELECT jsonb_agg(row_to_json(t)) FROM (
                     SELECT source, SUM(xp_earned) as total_xp, COUNT(*) as count
                     FROM user_xp_history 
                     WHERE organization_id = _org_id AND created_at > start_date
                     GROUP BY source ORDER BY total_xp DESC LIMIT 5
                   ) t), '[]'::jsonb),
    'period', _period
  ) INTO result;
  
  RETURN result;
END;
$$;

-- 3.3 Função para obter métricas de competência
CREATE OR REPLACE FUNCTION public.get_org_competency_metrics(
  _org_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
BEGIN
  IF NOT public.is_org_admin(auth.uid(), _org_id) THEN
    RETURN jsonb_build_object('error', 'Sem permissão');
  END IF;
  
  SELECT jsonb_build_object(
    'total_assessments', COALESCE((SELECT COUNT(*) FROM competency_assessments 
                          WHERE organization_id = _org_id), 0),
    'avg_score', COALESCE((SELECT AVG(score)::numeric(10,1) FROM competency_assessments 
                  WHERE organization_id = _org_id), 0),
    'users_assessed', COALESCE((SELECT COUNT(DISTINCT user_id) FROM competency_assessments 
                       WHERE organization_id = _org_id), 0),
    'improving_users', COALESCE((SELECT COUNT(*) FROM user_competency_scores 
                        WHERE organization_id = _org_id AND trend = 'improving'), 0),
    'declining_users', COALESCE((SELECT COUNT(*) FROM user_competency_scores 
                        WHERE organization_id = _org_id AND trend = 'declining'), 0),
    'by_skill', COALESCE((SELECT jsonb_agg(row_to_json(t)) FROM (
                  SELECT sc.name as skill_name, sc.icon, 
                         AVG(ucs.current_score)::numeric(10,1) as avg_score,
                         COUNT(DISTINCT ucs.user_id) as users_count
                  FROM user_competency_scores ucs
                  JOIN skill_configurations sc ON ucs.skill_id = sc.id
                  WHERE ucs.organization_id = _org_id
                  GROUP BY sc.id, sc.name, sc.icon
                  ORDER BY avg_score DESC
                ) t), '[]'::jsonb)
  ) INTO result;
  
  RETURN result;
END;
$$;

-- 3.4 Função para obter métricas de decisão
CREATE OR REPLACE FUNCTION public.get_org_decision_metrics(
  _org_id uuid,
  _period text DEFAULT '30d'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
  start_date timestamptz;
BEGIN
  IF NOT public.is_org_admin(auth.uid(), _org_id) THEN
    RETURN jsonb_build_object('error', 'Sem permissão');
  END IF;

  start_date := CASE _period
    WHEN '7d' THEN now() - interval '7 days'
    WHEN '30d' THEN now() - interval '30 days'
    WHEN '90d' THEN now() - interval '90 days'
    ELSE now() - interval '30 days'
  END;
  
  SELECT jsonb_build_object(
    'total_decisions', COALESCE((SELECT COUNT(*) FROM decision_analytics 
                        WHERE organization_id = _org_id AND created_at > start_date), 0),
    'avg_quality_score', COALESCE((SELECT AVG(decision_quality_score)::numeric(10,1) 
                          FROM decision_analytics 
                          WHERE organization_id = _org_id AND created_at > start_date), 0),
    'avg_response_time', COALESCE((SELECT AVG(response_time_seconds)::numeric(10,1) 
                          FROM decision_analytics 
                          WHERE organization_id = _org_id AND created_at > start_date), 0),
    'optimal_rate', COALESCE((SELECT (COUNT(*) FILTER (WHERE is_optimal_choice)::numeric / 
                              NULLIF(COUNT(*), 0) * 100)::numeric(10,1)
                     FROM decision_analytics 
                     WHERE organization_id = _org_id AND created_at > start_date), 0),
    'by_depth', COALESCE((SELECT jsonb_agg(row_to_json(t)) FROM (
                  SELECT reasoning_depth, COUNT(*) as count
                  FROM decision_analytics 
                  WHERE organization_id = _org_id AND created_at > start_date
                  AND reasoning_depth IS NOT NULL
                  GROUP BY reasoning_depth
                ) t), '[]'::jsonb),
    'period', _period
  ) INTO result;
  
  RETURN result;
END;
$$;

-- 3.5 Função para listar membros com métricas
CREATE OR REPLACE FUNCTION public.get_org_members_with_metrics(
  _org_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
      COALESCE((SELECT COUNT(*) FROM user_activity_log WHERE user_id = om.user_id AND organization_id = _org_id AND created_at > now() - interval '7 days'), 0) as activities_week
    FROM organization_members om
    JOIN profiles p ON om.user_id = p.id
    LEFT JOIN organization_teams ot ON om.team_id = ot.id
    LEFT JOIN user_streaks us ON om.user_id = us.user_id
    WHERE om.organization_id = _org_id
    ORDER BY total_xp DESC
  ) t), '[]'::jsonb);
END;
$$;