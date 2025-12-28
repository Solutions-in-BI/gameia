-- =====================================================
-- FUNÇÕES RPC PARA SISTEMA DE RELATÓRIOS AVANÇADO
-- =====================================================

-- 1. Relatório Individual Completo (One-on-One)
CREATE OR REPLACE FUNCTION public.get_member_full_report(
  _user_id UUID,
  _org_id UUID,
  _period TEXT DEFAULT '30d'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result JSONB;
  start_date TIMESTAMPTZ;
  prev_start_date TIMESTAMPTZ;
  prev_end_date TIMESTAMPTZ;
BEGIN
  -- Verificar permissão
  IF NOT public.can_view_user_data(_user_id, _org_id) THEN
    RETURN jsonb_build_object('error', 'Sem permissão');
  END IF;

  -- Calcular datas
  start_date := CASE _period
    WHEN '7d' THEN now() - interval '7 days'
    WHEN '30d' THEN now() - interval '30 days'
    WHEN '90d' THEN now() - interval '90 days'
    WHEN '1y' THEN now() - interval '1 year'
    ELSE now() - interval '30 days'
  END;

  prev_end_date := start_date;
  prev_start_date := start_date - (now() - start_date);

  SELECT jsonb_build_object(
    'profile', (
      SELECT jsonb_build_object(
        'nickname', p.nickname,
        'avatar_url', p.avatar_url,
        'job_title', p.job_title,
        'department', p.department,
        'selected_title', p.selected_title,
        'joined_at', om.joined_at,
        'team_name', ot.name
      )
      FROM profiles p
      LEFT JOIN organization_members om ON om.user_id = p.id AND om.organization_id = _org_id
      LEFT JOIN organization_teams ot ON om.team_id = ot.id
      WHERE p.id = _user_id
    ),
    'xp', jsonb_build_object(
      'total_period', COALESCE((SELECT SUM(xp_earned) FROM user_xp_history WHERE user_id = _user_id AND created_at > start_date), 0),
      'total_previous', COALESCE((SELECT SUM(xp_earned) FROM user_xp_history WHERE user_id = _user_id AND created_at BETWEEN prev_start_date AND prev_end_date), 0),
      'by_source', COALESCE((SELECT jsonb_agg(row_to_json(t)) FROM (
        SELECT source, SUM(xp_earned) as total, COUNT(*) as count
        FROM user_xp_history WHERE user_id = _user_id AND created_at > start_date
        GROUP BY source ORDER BY total DESC
      ) t), '[]'::jsonb)
    ),
    'activities', jsonb_build_object(
      'total_period', COALESCE((SELECT COUNT(*) FROM user_activity_log WHERE user_id = _user_id AND created_at > start_date), 0),
      'total_previous', COALESCE((SELECT COUNT(*) FROM user_activity_log WHERE user_id = _user_id AND created_at BETWEEN prev_start_date AND prev_end_date), 0),
      'by_type', COALESCE((SELECT jsonb_agg(row_to_json(t)) FROM (
        SELECT activity_type, COUNT(*) as count
        FROM user_activity_log WHERE user_id = _user_id AND created_at > start_date
        GROUP BY activity_type ORDER BY count DESC
      ) t), '[]'::jsonb),
      'recent', COALESCE((SELECT jsonb_agg(row_to_json(t)) FROM (
        SELECT activity_type, game_type, created_at, metadata
        FROM user_activity_log WHERE user_id = _user_id
        ORDER BY created_at DESC LIMIT 10
      ) t), '[]'::jsonb)
    ),
    'streak', (
      SELECT jsonb_build_object(
        'current', COALESCE(current_streak, 0),
        'longest', COALESCE(longest_streak, 0),
        'last_activity', last_activity_date
      )
      FROM user_streaks WHERE user_id = _user_id
    ),
    'badges', jsonb_build_object(
      'total', COALESCE((SELECT COUNT(*) FROM user_badges WHERE user_id = _user_id), 0),
      'recent', COALESCE((SELECT jsonb_agg(row_to_json(t)) FROM (
        SELECT b.name, b.icon, b.rarity, ub.unlocked_at
        FROM user_badges ub
        JOIN badges b ON ub.badge_id = b.id
        WHERE ub.user_id = _user_id
        ORDER BY ub.unlocked_at DESC LIMIT 5
      ) t), '[]'::jsonb)
    ),
    'games', COALESCE((SELECT jsonb_agg(row_to_json(t)) FROM (
      SELECT game_type, games_played, best_score, total_xp_earned, avg_score
      FROM user_game_stats WHERE user_id = _user_id
      ORDER BY total_xp_earned DESC
    ) t), '[]'::jsonb),
    'trainings', COALESCE((SELECT jsonb_agg(row_to_json(t)) FROM (
      SELECT tr.name, utp.progress_percent, utp.status, utp.started_at, utp.completed_at
      FROM user_training_progress utp
      JOIN trainings tr ON utp.training_id = tr.id
      WHERE utp.user_id = _user_id
      ORDER BY utp.updated_at DESC
    ) t), '[]'::jsonb),
    'competencies', COALESCE((SELECT jsonb_agg(row_to_json(t)) FROM (
      SELECT sc.name as skill_name, sc.icon, ucs.current_score, ucs.trend, ucs.assessments_count
      FROM user_competency_scores ucs
      JOIN skill_configurations sc ON ucs.skill_id = sc.id
      WHERE ucs.user_id = _user_id
    ) t), '[]'::jsonb),
    'period', _period
  ) INTO result;

  RETURN result;
END;
$$;

-- 2. Relatório de Equipe
CREATE OR REPLACE FUNCTION public.get_team_report(
  _team_id UUID,
  _org_id UUID,
  _period TEXT DEFAULT '30d'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result JSONB;
  start_date TIMESTAMPTZ;
BEGIN
  IF NOT public.is_org_admin(auth.uid(), _org_id) THEN
    RETURN jsonb_build_object('error', 'Sem permissão');
  END IF;

  start_date := CASE _period
    WHEN '7d' THEN now() - interval '7 days'
    WHEN '30d' THEN now() - interval '30 days'
    WHEN '90d' THEN now() - interval '90 days'
    WHEN '1y' THEN now() - interval '1 year'
    ELSE now() - interval '30 days'
  END;

  SELECT jsonb_build_object(
    'team', (
      SELECT jsonb_build_object(
        'id', ot.id,
        'name', ot.name,
        'description', ot.description,
        'color', ot.color,
        'icon', ot.icon,
        'manager', (SELECT nickname FROM profiles WHERE id = ot.manager_id)
      )
      FROM organization_teams ot WHERE ot.id = _team_id
    ),
    'members', COALESCE((SELECT jsonb_agg(row_to_json(t)) FROM (
      SELECT 
        p.id as user_id, p.nickname, p.avatar_url, om.job_title,
        COALESCE(us.current_streak, 0) as streak,
        COALESCE((SELECT SUM(xp_earned) FROM user_xp_history WHERE user_id = p.id AND created_at > start_date), 0) as xp_period,
        COALESCE((SELECT COUNT(*) FROM user_activity_log WHERE user_id = p.id AND created_at > start_date), 0) as activities
      FROM organization_members om
      JOIN profiles p ON om.user_id = p.id
      LEFT JOIN user_streaks us ON p.id = us.user_id
      WHERE om.team_id = _team_id AND om.organization_id = _org_id
      ORDER BY xp_period DESC
    ) t), '[]'::jsonb),
    'metrics', jsonb_build_object(
      'total_members', (SELECT COUNT(*) FROM organization_members WHERE team_id = _team_id),
      'total_xp', COALESCE((
        SELECT SUM(xh.xp_earned) 
        FROM user_xp_history xh
        JOIN organization_members om ON xh.user_id = om.user_id
        WHERE om.team_id = _team_id AND xh.created_at > start_date
      ), 0),
      'avg_xp', COALESCE((
        SELECT AVG(xp_sum)::numeric(10,1) FROM (
          SELECT SUM(xh.xp_earned) as xp_sum
          FROM user_xp_history xh
          JOIN organization_members om ON xh.user_id = om.user_id
          WHERE om.team_id = _team_id AND xh.created_at > start_date
          GROUP BY xh.user_id
        ) sub
      ), 0),
      'total_activities', COALESCE((
        SELECT COUNT(*) 
        FROM user_activity_log al
        JOIN organization_members om ON al.user_id = om.user_id
        WHERE om.team_id = _team_id AND al.created_at > start_date
      ), 0),
      'active_members', COALESCE((
        SELECT COUNT(DISTINCT al.user_id) 
        FROM user_activity_log al
        JOIN organization_members om ON al.user_id = om.user_id
        WHERE om.team_id = _team_id AND al.created_at > start_date
      ), 0),
      'avg_streak', COALESCE((
        SELECT AVG(us.current_streak)::numeric(10,1)
        FROM user_streaks us
        JOIN organization_members om ON us.user_id = om.user_id
        WHERE om.team_id = _team_id
      ), 0)
    ),
    'games_stats', COALESCE((SELECT jsonb_agg(row_to_json(t)) FROM (
      SELECT game_type, SUM(games_played) as total_games, MAX(best_score) as top_score, SUM(total_xp_earned) as total_xp
      FROM user_game_stats ugs
      JOIN organization_members om ON ugs.user_id = om.user_id
      WHERE om.team_id = _team_id
      GROUP BY game_type ORDER BY total_games DESC
    ) t), '[]'::jsonb),
    'period', _period
  ) INTO result;

  RETURN result;
END;
$$;

-- 3. Comparativo Entre Equipes
CREATE OR REPLACE FUNCTION public.get_teams_comparison(
  _org_id UUID,
  _period TEXT DEFAULT '30d'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result JSONB;
  start_date TIMESTAMPTZ;
BEGIN
  IF NOT public.is_org_admin(auth.uid(), _org_id) THEN
    RETURN jsonb_build_object('error', 'Sem permissão');
  END IF;

  start_date := CASE _period
    WHEN '7d' THEN now() - interval '7 days'
    WHEN '30d' THEN now() - interval '30 days'
    WHEN '90d' THEN now() - interval '90 days'
    WHEN '1y' THEN now() - interval '1 year'
    ELSE now() - interval '30 days'
  END;

  SELECT jsonb_build_object(
    'teams', COALESCE((SELECT jsonb_agg(row_to_json(t)) FROM (
      SELECT 
        ot.id,
        ot.name,
        ot.color,
        ot.icon,
        (SELECT COUNT(*) FROM organization_members WHERE team_id = ot.id) as member_count,
        COALESCE((
          SELECT SUM(xh.xp_earned) 
          FROM user_xp_history xh
          JOIN organization_members om ON xh.user_id = om.user_id
          WHERE om.team_id = ot.id AND xh.created_at > start_date
        ), 0) as total_xp,
        COALESCE((
          SELECT COUNT(*) 
          FROM user_activity_log al
          JOIN organization_members om ON al.user_id = om.user_id
          WHERE om.team_id = ot.id AND al.created_at > start_date
        ), 0) as total_activities,
        COALESCE((
          SELECT AVG(us.current_streak)::numeric(10,1)
          FROM user_streaks us
          JOIN organization_members om ON us.user_id = om.user_id
          WHERE om.team_id = ot.id
        ), 0) as avg_streak,
        COALESCE((
          SELECT COUNT(DISTINCT al.user_id) * 100.0 / NULLIF((SELECT COUNT(*) FROM organization_members WHERE team_id = ot.id), 0)
          FROM user_activity_log al
          JOIN organization_members om ON al.user_id = om.user_id
          WHERE om.team_id = ot.id AND al.created_at > start_date
        ), 0)::numeric(10,1) as engagement_rate
      FROM organization_teams ot
      WHERE ot.organization_id = _org_id
      ORDER BY total_xp DESC
    ) t), '[]'::jsonb),
    'summary', jsonb_build_object(
      'total_teams', (SELECT COUNT(*) FROM organization_teams WHERE organization_id = _org_id),
      'org_total_xp', COALESCE((SELECT SUM(xp_earned) FROM user_xp_history WHERE organization_id = _org_id AND created_at > start_date), 0),
      'org_total_activities', COALESCE((SELECT COUNT(*) FROM user_activity_log WHERE organization_id = _org_id AND created_at > start_date), 0)
    ),
    'period', _period
  ) INTO result;

  RETURN result;
END;
$$;

-- 4. Relatório de Jogos/Gamificação
CREATE OR REPLACE FUNCTION public.get_games_report(
  _org_id UUID,
  _period TEXT DEFAULT '30d'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result JSONB;
  start_date TIMESTAMPTZ;
BEGIN
  IF NOT public.is_org_admin(auth.uid(), _org_id) THEN
    RETURN jsonb_build_object('error', 'Sem permissão');
  END IF;

  start_date := CASE _period
    WHEN '7d' THEN now() - interval '7 days'
    WHEN '30d' THEN now() - interval '30 days'
    WHEN '90d' THEN now() - interval '90 days'
    WHEN '1y' THEN now() - interval '1 year'
    ELSE now() - interval '30 days'
  END;

  SELECT jsonb_build_object(
    'game_stats', COALESCE((SELECT jsonb_agg(row_to_json(t)) FROM (
      SELECT 
        game_type,
        SUM(games_played) as total_plays,
        COUNT(DISTINCT user_id) as unique_players,
        MAX(best_score) as top_score,
        AVG(avg_score)::numeric(10,1) as avg_score,
        SUM(total_xp_earned) as total_xp
      FROM user_game_stats ugs
      JOIN organization_members om ON ugs.user_id = om.user_id
      WHERE om.organization_id = _org_id
      GROUP BY game_type
      ORDER BY total_plays DESC
    ) t), '[]'::jsonb),
    'top_players', COALESCE((SELECT jsonb_agg(row_to_json(t)) FROM (
      SELECT 
        p.nickname,
        p.avatar_url,
        SUM(ugs.total_xp_earned) as total_xp,
        SUM(ugs.games_played) as total_games,
        MAX(ugs.best_score) as best_score
      FROM user_game_stats ugs
      JOIN organization_members om ON ugs.user_id = om.user_id
      JOIN profiles p ON ugs.user_id = p.id
      WHERE om.organization_id = _org_id
      GROUP BY p.id, p.nickname, p.avatar_url
      ORDER BY total_xp DESC
      LIMIT 10
    ) t), '[]'::jsonb),
    'recent_activity', COALESCE((SELECT jsonb_agg(row_to_json(t)) FROM (
      SELECT 
        al.game_type,
        COUNT(*) as plays,
        al.created_at::date as play_date
      FROM user_activity_log al
      WHERE al.organization_id = _org_id 
        AND al.game_type IS NOT NULL
        AND al.created_at > start_date
      GROUP BY al.game_type, al.created_at::date
      ORDER BY play_date DESC
      LIMIT 50
    ) t), '[]'::jsonb),
    'badges_earned', COALESCE((SELECT jsonb_agg(row_to_json(t)) FROM (
      SELECT 
        b.name,
        b.icon,
        b.rarity,
        COUNT(*) as times_earned
      FROM user_badges ub
      JOIN badges b ON ub.badge_id = b.id
      JOIN organization_members om ON ub.user_id = om.user_id
      WHERE om.organization_id = _org_id AND ub.unlocked_at > start_date
      GROUP BY b.id, b.name, b.icon, b.rarity
      ORDER BY times_earned DESC
      LIMIT 10
    ) t), '[]'::jsonb),
    'quiz_stats', jsonb_build_object(
      'total_matches', COALESCE((
        SELECT COUNT(*) FROM quiz_matches qm
        JOIN organization_members om ON qm.player1_id = om.user_id
        WHERE om.organization_id = _org_id AND qm.created_at > start_date
      ), 0),
      'avg_score', COALESCE((
        SELECT AVG(player1_score + player2_score)::numeric(10,1) FROM quiz_matches qm
        JOIN organization_members om ON qm.player1_id = om.user_id
        WHERE om.organization_id = _org_id AND qm.created_at > start_date
      ), 0)
    ),
    'period', _period
  ) INTO result;

  RETURN result;
END;
$$;

-- 5. Relatório de Treinamentos
CREATE OR REPLACE FUNCTION public.get_trainings_report(
  _org_id UUID,
  _period TEXT DEFAULT '30d'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result JSONB;
  start_date TIMESTAMPTZ;
BEGIN
  IF NOT public.is_org_admin(auth.uid(), _org_id) THEN
    RETURN jsonb_build_object('error', 'Sem permissão');
  END IF;

  start_date := CASE _period
    WHEN '7d' THEN now() - interval '7 days'
    WHEN '30d' THEN now() - interval '30 days'
    WHEN '90d' THEN now() - interval '90 days'
    WHEN '1y' THEN now() - interval '1 year'
    ELSE now() - interval '30 days'
  END;

  SELECT jsonb_build_object(
    'trainings', COALESCE((SELECT jsonb_agg(row_to_json(t)) FROM (
      SELECT 
        tr.id,
        tr.name,
        tr.category,
        tr.difficulty,
        tr.icon,
        tr.color,
        COUNT(DISTINCT utp.user_id) as enrolled_users,
        COUNT(DISTINCT CASE WHEN utp.status = 'completed' THEN utp.user_id END) as completed_users,
        AVG(utp.progress_percent)::numeric(10,1) as avg_progress,
        (COUNT(DISTINCT CASE WHEN utp.status = 'completed' THEN utp.user_id END)::numeric / NULLIF(COUNT(DISTINCT utp.user_id), 0) * 100)::numeric(10,1) as completion_rate
      FROM trainings tr
      LEFT JOIN user_training_progress utp ON tr.id = utp.training_id
      LEFT JOIN organization_members om ON utp.user_id = om.user_id
      WHERE tr.organization_id = _org_id OR tr.organization_id IS NULL
      GROUP BY tr.id, tr.name, tr.category, tr.difficulty, tr.icon, tr.color
      ORDER BY enrolled_users DESC
    ) t), '[]'::jsonb),
    'recent_completions', COALESCE((SELECT jsonb_agg(row_to_json(t)) FROM (
      SELECT 
        p.nickname,
        p.avatar_url,
        tr.name as training_name,
        utp.completed_at
      FROM user_training_progress utp
      JOIN profiles p ON utp.user_id = p.id
      JOIN trainings tr ON utp.training_id = tr.id
      JOIN organization_members om ON utp.user_id = om.user_id
      WHERE om.organization_id = _org_id 
        AND utp.status = 'completed'
        AND utp.completed_at > start_date
      ORDER BY utp.completed_at DESC
      LIMIT 10
    ) t), '[]'::jsonb),
    'summary', jsonb_build_object(
      'total_trainings', (SELECT COUNT(*) FROM trainings WHERE organization_id = _org_id OR organization_id IS NULL),
      'total_enrollments', COALESCE((
        SELECT COUNT(*) FROM user_training_progress utp
        JOIN organization_members om ON utp.user_id = om.user_id
        WHERE om.organization_id = _org_id
      ), 0),
      'total_completions', COALESCE((
        SELECT COUNT(*) FROM user_training_progress utp
        JOIN organization_members om ON utp.user_id = om.user_id
        WHERE om.organization_id = _org_id AND utp.status = 'completed'
      ), 0),
      'completions_period', COALESCE((
        SELECT COUNT(*) FROM user_training_progress utp
        JOIN organization_members om ON utp.user_id = om.user_id
        WHERE om.organization_id = _org_id AND utp.status = 'completed' AND utp.completed_at > start_date
      ), 0)
    ),
    'period', _period
  ) INTO result;

  RETURN result;
END;
$$;

-- 6. Evolução Temporal
CREATE OR REPLACE FUNCTION public.get_temporal_evolution(
  _org_id UUID,
  _period TEXT DEFAULT '30d',
  _granularity TEXT DEFAULT 'day'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result JSONB;
  start_date TIMESTAMPTZ;
  date_trunc_unit TEXT;
BEGIN
  IF NOT public.is_org_admin(auth.uid(), _org_id) THEN
    RETURN jsonb_build_object('error', 'Sem permissão');
  END IF;

  start_date := CASE _period
    WHEN '7d' THEN now() - interval '7 days'
    WHEN '30d' THEN now() - interval '30 days'
    WHEN '90d' THEN now() - interval '90 days'
    WHEN '1y' THEN now() - interval '1 year'
    ELSE now() - interval '30 days'
  END;

  date_trunc_unit := CASE _granularity
    WHEN 'hour' THEN 'hour'
    WHEN 'day' THEN 'day'
    WHEN 'week' THEN 'week'
    WHEN 'month' THEN 'month'
    ELSE 'day'
  END;

  SELECT jsonb_build_object(
    'xp_evolution', COALESCE((SELECT jsonb_agg(row_to_json(t)) FROM (
      SELECT 
        date_trunc(date_trunc_unit, created_at) as period_date,
        SUM(xp_earned) as total_xp,
        COUNT(DISTINCT user_id) as active_users
      FROM user_xp_history
      WHERE organization_id = _org_id AND created_at > start_date
      GROUP BY date_trunc(date_trunc_unit, created_at)
      ORDER BY period_date
    ) t), '[]'::jsonb),
    'activity_evolution', COALESCE((SELECT jsonb_agg(row_to_json(t)) FROM (
      SELECT 
        date_trunc(date_trunc_unit, created_at) as period_date,
        COUNT(*) as total_activities,
        COUNT(DISTINCT user_id) as active_users
      FROM user_activity_log
      WHERE organization_id = _org_id AND created_at > start_date
      GROUP BY date_trunc(date_trunc_unit, created_at)
      ORDER BY period_date
    ) t), '[]'::jsonb),
    'members_evolution', COALESCE((SELECT jsonb_agg(row_to_json(t)) FROM (
      SELECT 
        date_trunc(date_trunc_unit, joined_at) as period_date,
        COUNT(*) as new_members
      FROM organization_members
      WHERE organization_id = _org_id AND joined_at > start_date
      GROUP BY date_trunc(date_trunc_unit, joined_at)
      ORDER BY period_date
    ) t), '[]'::jsonb),
    'badges_evolution', COALESCE((SELECT jsonb_agg(row_to_json(t)) FROM (
      SELECT 
        date_trunc(date_trunc_unit, ub.unlocked_at) as period_date,
        COUNT(*) as badges_earned
      FROM user_badges ub
      JOIN organization_members om ON ub.user_id = om.user_id
      WHERE om.organization_id = _org_id AND ub.unlocked_at > start_date
      GROUP BY date_trunc(date_trunc_unit, ub.unlocked_at)
      ORDER BY period_date
    ) t), '[]'::jsonb),
    'period', _period,
    'granularity', _granularity
  ) INTO result;

  RETURN result;
END;
$$;

-- 7. Ranking Geral de Membros
CREATE OR REPLACE FUNCTION public.get_members_ranking(
  _org_id UUID,
  _period TEXT DEFAULT '30d',
  _limit INT DEFAULT 50
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result JSONB;
  start_date TIMESTAMPTZ;
BEGIN
  IF NOT public.is_org_admin(auth.uid(), _org_id) THEN
    RETURN jsonb_build_object('error', 'Sem permissão');
  END IF;

  start_date := CASE _period
    WHEN '7d' THEN now() - interval '7 days'
    WHEN '30d' THEN now() - interval '30 days'
    WHEN '90d' THEN now() - interval '90 days'
    WHEN '1y' THEN now() - interval '1 year'
    ELSE now() - interval '30 days'
  END;

  SELECT jsonb_build_object(
    'ranking', COALESCE((SELECT jsonb_agg(row_to_json(t)) FROM (
      SELECT 
        ROW_NUMBER() OVER (ORDER BY COALESCE(xp_data.xp_period, 0) DESC) as rank,
        p.id as user_id,
        p.nickname,
        p.avatar_url,
        p.selected_title,
        om.job_title,
        ot.name as team_name,
        COALESCE(us.current_streak, 0) as streak,
        COALESCE(xp_data.xp_period, 0) as xp_period,
        COALESCE(activity_data.activities, 0) as activities,
        COALESCE(badge_data.badges_count, 0) as badges_earned
      FROM organization_members om
      JOIN profiles p ON om.user_id = p.id
      LEFT JOIN organization_teams ot ON om.team_id = ot.id
      LEFT JOIN user_streaks us ON p.id = us.user_id
      LEFT JOIN (
        SELECT user_id, SUM(xp_earned) as xp_period
        FROM user_xp_history
        WHERE created_at > start_date
        GROUP BY user_id
      ) xp_data ON p.id = xp_data.user_id
      LEFT JOIN (
        SELECT user_id, COUNT(*) as activities
        FROM user_activity_log
        WHERE created_at > start_date
        GROUP BY user_id
      ) activity_data ON p.id = activity_data.user_id
      LEFT JOIN (
        SELECT user_id, COUNT(*) as badges_count
        FROM user_badges
        WHERE unlocked_at > start_date
        GROUP BY user_id
      ) badge_data ON p.id = badge_data.user_id
      WHERE om.organization_id = _org_id
      ORDER BY xp_period DESC
      LIMIT _limit
    ) t), '[]'::jsonb),
    'period', _period
  ) INTO result;

  RETURN result;
END;
$$;