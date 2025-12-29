-- Fix search_path for security
CREATE OR REPLACE FUNCTION update_mission_progress_for_event(
  p_user_id uuid,
  p_event_type text,
  p_game_type text DEFAULT NULL,
  p_increment int DEFAULT 1
) RETURNS void AS $$
DECLARE
  v_mission_type text;
BEGIN
  CASE p_event_type
    WHEN 'game_played' THEN v_mission_type := 'play_game';
    WHEN 'quiz_completed' THEN v_mission_type := 'complete_quiz';
    WHEN 'sales_session' THEN v_mission_type := 'play_game';
    WHEN 'decision_made' THEN v_mission_type := 'play_game';
    WHEN 'streak_claimed' THEN v_mission_type := 'claim_streak';
    WHEN 'feedback_given' THEN v_mission_type := 'give_feedback';
    WHEN 'training_completed' THEN v_mission_type := 'complete_training';
    ELSE RETURN;
  END CASE;
  
  UPDATE public.daily_missions
  SET current_value = LEAST(current_value + p_increment, target_value),
      updated_at = now()
  WHERE user_id = p_user_id
    AND mission_date = CURRENT_DATE
    AND mission_type = v_mission_type
    AND is_completed = false
    AND (target_game_type IS NULL OR target_game_type = p_game_type);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION update_xp_mission_progress(
  p_user_id uuid,
  p_xp_earned int
) RETURNS void AS $$
BEGIN
  UPDATE public.daily_missions
  SET current_value = LEAST(current_value + p_xp_earned, target_value),
      updated_at = now()
  WHERE user_id = p_user_id
    AND mission_date = CURRENT_DATE
    AND mission_type = 'earn_xp'
    AND is_completed = false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;