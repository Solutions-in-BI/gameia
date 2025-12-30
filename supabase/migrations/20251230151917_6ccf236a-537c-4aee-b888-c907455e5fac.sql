
-- Drop and recreate the function with fixed skill aggregation
CREATE OR REPLACE FUNCTION recalculate_journey_totals(p_journey_id UUID)
RETURNS void AS $$
DECLARE
  v_total_hours INTEGER;
  v_total_trainings INTEGER;
  v_total_xp INTEGER;
  v_total_coins INTEGER;
  v_aggregated_skills JSONB;
BEGIN
  -- Calculate totals from journey_trainings and trainings
  SELECT 
    COALESCE(SUM(t.estimated_hours), 0),
    COUNT(*),
    COALESCE(SUM(t.xp_reward), 0),
    COALESCE(SUM(t.coins_reward), 0)
  INTO v_total_hours, v_total_trainings, v_total_xp, v_total_coins
  FROM public.journey_trainings jt
  JOIN public.trainings t ON t.id = jt.training_id
  WHERE jt.journey_id = p_journey_id;
  
  -- Aggregate unique skills - fixed to handle text[] properly
  SELECT COALESCE(jsonb_agg(DISTINCT skill_elem), '[]'::jsonb)
  INTO v_aggregated_skills
  FROM (
    SELECT unnest(t.skill_ids) as skill_elem
    FROM public.journey_trainings jt
    JOIN public.trainings t ON t.id = jt.training_id
    WHERE jt.journey_id = p_journey_id
      AND t.skill_ids IS NOT NULL
  ) sub;
  
  -- Update the journey with calculated totals
  UPDATE public.training_journeys
  SET 
    total_estimated_hours = v_total_hours,
    total_trainings = v_total_trainings,
    total_xp = v_total_xp,
    total_coins = v_total_coins,
    aggregated_skills = v_aggregated_skills,
    updated_at = now()
  WHERE id = p_journey_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
