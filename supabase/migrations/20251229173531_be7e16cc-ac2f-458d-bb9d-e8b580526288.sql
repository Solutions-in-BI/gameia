-- Corrigir view para não usar SECURITY DEFINER implícito
-- Recriar como view normal com SECURITY INVOKER
DROP VIEW IF EXISTS public.vw_challenges_with_stats;

CREATE VIEW public.vw_challenges_with_stats 
WITH (security_invoker = on)
AS
SELECT 
  c.*,
  COALESCE(cs.supporters_count, 0) as calculated_supporters_count,
  COALESCE(cs.total_staked, 0) as calculated_total_staked,
  CASE 
    WHEN c.target_value > 0 THEN ROUND((c.current_value::numeric / c.target_value::numeric) * 100, 1)
    ELSE 0 
  END as progress_percentage
FROM commitments c
LEFT JOIN (
  SELECT 
    commitment_id,
    COUNT(*) as supporters_count,
    COALESCE(SUM(coins_staked), 0) as total_staked
  FROM challenge_supporters
  GROUP BY commitment_id
) cs ON cs.commitment_id = c.id;