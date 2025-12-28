-- Corrigir Security Definer Views
DROP VIEW IF EXISTS public.vw_user_skill_progress;
DROP VIEW IF EXISTS public.vw_org_skill_metrics;

-- Recriar views com SECURITY INVOKER (padrão seguro)
CREATE VIEW public.vw_user_skill_progress 
WITH (security_invoker = true)
AS
SELECT 
  usl.id,
  usl.user_id,
  usl.skill_id,
  sc.skill_key,
  sc.name as skill_name,
  sc.description,
  sc.icon,
  sc.color,
  sc.category,
  sc.max_level,
  sc.xp_per_level,
  sc.parent_skill_id,
  sc.related_games,
  sc.organization_id,
  usl.current_level,
  usl.current_xp,
  usl.total_xp,
  usl.is_unlocked,
  usl.mastery_level,
  usl.last_practiced,
  usl.unlocked_at,
  CASE 
    WHEN sc.xp_per_level > 0 THEN 
      ROUND((usl.current_xp::NUMERIC / sc.xp_per_level) * 100, 1)
    ELSE 0 
  END as progress_percent,
  CASE 
    WHEN sc.max_level IS NOT NULL AND usl.current_level >= sc.max_level THEN true
    ELSE false 
  END as is_maxed
FROM public.user_skill_levels usl
JOIN public.skill_configurations sc ON sc.id = usl.skill_id;

CREATE VIEW public.vw_org_skill_metrics 
WITH (security_invoker = true)
AS
SELECT 
  sc.organization_id,
  sc.id as skill_id,
  sc.skill_key,
  sc.name as skill_name,
  sc.category,
  COUNT(DISTINCT usl.user_id) as total_users,
  COALESCE(AVG(usl.current_level), 0) as avg_level,
  COALESCE(AVG(usl.total_xp), 0) as avg_total_xp,
  COUNT(CASE WHEN usl.is_unlocked THEN 1 END) as unlocked_count,
  COUNT(CASE WHEN usl.mastery_level >= 5 THEN 1 END) as mastery_count
FROM public.skill_configurations sc
LEFT JOIN public.user_skill_levels usl ON usl.skill_id = sc.id
GROUP BY sc.organization_id, sc.id, sc.skill_key, sc.name, sc.category;

-- Corrigir function search path mutable para trigger
CREATE OR REPLACE FUNCTION public.update_skill_levels_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;