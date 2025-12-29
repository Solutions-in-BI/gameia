-- =============================================
-- GAMIFICATION MODEL: Daily Missions + Monthly Goals
-- =============================================

-- 1. Create daily_missions table
CREATE TABLE public.daily_missions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  organization_id UUID REFERENCES public.organizations(id),
  mission_date DATE NOT NULL DEFAULT CURRENT_DATE,
  mission_type TEXT NOT NULL CHECK (mission_type IN ('play_game', 'complete_quiz', 'practice_skill', 'give_feedback', 'claim_streak', 'complete_training', 'reach_score')),
  target_game_type TEXT,
  target_skill_id UUID REFERENCES public.skill_configurations(id),
  target_value INT NOT NULL DEFAULT 1,
  current_value INT NOT NULL DEFAULT 0,
  xp_reward INT NOT NULL DEFAULT 15,
  coins_reward INT NOT NULL DEFAULT 10,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  is_bonus BOOLEAN NOT NULL DEFAULT false,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT 'target',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, mission_date, mission_type, target_game_type)
);

-- 2. Create monthly_goals table
CREATE TABLE public.monthly_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  organization_id UUID REFERENCES public.organizations(id),
  goal_month DATE NOT NULL, -- First day of the month
  goal_type TEXT NOT NULL CHECK (goal_type IN ('reach_level', 'unlock_insignias', 'complete_trail', 'max_streak', 'skill_mastery', 'games_played', 'xp_earned', 'missions_completed')),
  title TEXT NOT NULL,
  description TEXT,
  target_value INT NOT NULL,
  current_value INT NOT NULL DEFAULT 0,
  xp_reward INT NOT NULL DEFAULT 200,
  coins_reward INT NOT NULL DEFAULT 50,
  insignia_reward_id UUID REFERENCES public.insignias(id),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'failed', 'abandoned')),
  completed_at TIMESTAMP WITH TIME ZONE,
  icon TEXT DEFAULT 'trophy',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, goal_month, goal_type)
);

-- 3. Add unlock_message and unlock_animation to insignias
ALTER TABLE public.insignias 
  ADD COLUMN IF NOT EXISTS unlock_message TEXT,
  ADD COLUMN IF NOT EXISTS unlock_animation TEXT DEFAULT 'confetti';

-- 4. Create gamification_events table for tracking all XP/coin awards
CREATE TABLE public.gamification_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  event_type TEXT NOT NULL, -- 'game_complete', 'mission_complete', 'goal_complete', 'insignia_unlock', 'streak_claim', 'level_up'
  source_id UUID, -- Reference to the source (game session, mission, goal, etc.)
  source_type TEXT, -- 'daily_mission', 'monthly_goal', 'insignia', 'game', 'streak'
  xp_earned INT NOT NULL DEFAULT 0,
  coins_earned INT NOT NULL DEFAULT 0,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.daily_missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gamification_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for daily_missions
CREATE POLICY "Users can view their own daily missions"
  ON public.daily_missions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own daily missions"
  ON public.daily_missions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own daily missions"
  ON public.daily_missions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for monthly_goals
CREATE POLICY "Users can view their own monthly goals"
  ON public.monthly_goals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own monthly goals"
  ON public.monthly_goals FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own monthly goals"
  ON public.monthly_goals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own monthly goals"
  ON public.monthly_goals FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for gamification_events
CREATE POLICY "Users can view their own gamification events"
  ON public.gamification_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own gamification events"
  ON public.gamification_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_daily_missions_user_date ON public.daily_missions(user_id, mission_date);
CREATE INDEX idx_monthly_goals_user_month ON public.monthly_goals(user_id, goal_month);
CREATE INDEX idx_gamification_events_user ON public.gamification_events(user_id, created_at DESC);

-- Function to generate daily missions for a user
CREATE OR REPLACE FUNCTION public.generate_daily_missions(p_user_id UUID)
RETURNS SETOF public.daily_missions
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_today DATE := CURRENT_DATE;
  v_existing_count INT;
BEGIN
  -- Check if missions already exist for today
  SELECT COUNT(*) INTO v_existing_count
  FROM daily_missions
  WHERE user_id = p_user_id AND mission_date = v_today;
  
  IF v_existing_count > 0 THEN
    -- Return existing missions
    RETURN QUERY SELECT * FROM daily_missions WHERE user_id = p_user_id AND mission_date = v_today;
    RETURN;
  END IF;
  
  -- Generate 4 standard missions + 1 bonus
  
  -- Mission 1: Play a game
  INSERT INTO daily_missions (user_id, mission_date, mission_type, target_value, xp_reward, coins_reward, title, description, icon)
  VALUES (p_user_id, v_today, 'play_game', 2, 20, 15, 'Jogador Ativo', 'Complete 2 jogos hoje', 'gamepad-2');
  
  -- Mission 2: Claim streak
  INSERT INTO daily_missions (user_id, mission_date, mission_type, target_value, xp_reward, coins_reward, title, description, icon)
  VALUES (p_user_id, v_today, 'claim_streak', 1, 15, 10, 'Manter Sequência', 'Reivindique sua recompensa de streak', 'flame');
  
  -- Mission 3: Complete quiz
  INSERT INTO daily_missions (user_id, mission_date, mission_type, target_value, xp_reward, coins_reward, title, description, icon)
  VALUES (p_user_id, v_today, 'complete_quiz', 1, 25, 20, 'Teste de Conhecimento', 'Complete um quiz', 'brain');
  
  -- Mission 4: Reach score
  INSERT INTO daily_missions (user_id, mission_date, mission_type, target_game_type, target_value, xp_reward, coins_reward, title, description, icon)
  VALUES (p_user_id, v_today, 'reach_score', 'memory', 1000, 30, 25, 'Alta Performance', 'Alcance 1000 pontos em qualquer jogo', 'trophy');
  
  -- Mission 5: BONUS - Play all game types
  INSERT INTO daily_missions (user_id, mission_date, mission_type, target_value, xp_reward, coins_reward, is_bonus, title, description, icon)
  VALUES (p_user_id, v_today, 'play_game', 4, 100, 50, true, 'Maratona de Jogos', 'Jogue 4 tipos diferentes de jogos', 'medal');
  
  -- Return the newly created missions
  RETURN QUERY SELECT * FROM daily_missions WHERE user_id = p_user_id AND mission_date = v_today;
END;
$$;

-- Function to complete a daily mission
CREATE OR REPLACE FUNCTION public.complete_daily_mission(p_mission_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_mission daily_missions%ROWTYPE;
  v_result JSON;
BEGIN
  -- Get the mission
  SELECT * INTO v_mission FROM daily_missions WHERE id = p_mission_id AND user_id = auth.uid();
  
  IF v_mission IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Mission not found');
  END IF;
  
  IF v_mission.is_completed THEN
    RETURN json_build_object('success', false, 'error', 'Mission already completed');
  END IF;
  
  IF v_mission.current_value < v_mission.target_value THEN
    RETURN json_build_object('success', false, 'error', 'Mission not yet achieved');
  END IF;
  
  -- Mark as completed
  UPDATE daily_missions 
  SET is_completed = true, completed_at = now()
  WHERE id = p_mission_id;
  
  -- Award XP and coins
  UPDATE user_stats 
  SET 
    total_xp = total_xp + v_mission.xp_reward,
    coins = coins + v_mission.coins_reward
  WHERE user_id = auth.uid();
  
  -- Log the event
  INSERT INTO gamification_events (user_id, event_type, source_id, source_type, xp_earned, coins_earned)
  VALUES (auth.uid(), 'mission_complete', p_mission_id, 'daily_mission', v_mission.xp_reward, v_mission.coins_reward);
  
  RETURN json_build_object(
    'success', true, 
    'xp_earned', v_mission.xp_reward, 
    'coins_earned', v_mission.coins_reward,
    'is_bonus', v_mission.is_bonus
  );
END;
$$;

-- Function to update mission progress
CREATE OR REPLACE FUNCTION public.update_mission_progress(
  p_mission_type TEXT,
  p_increment INT DEFAULT 1,
  p_game_type TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_mission daily_missions%ROWTYPE;
  v_updated_count INT := 0;
BEGIN
  -- Update all matching missions for today
  UPDATE daily_missions
  SET current_value = LEAST(current_value + p_increment, target_value)
  WHERE user_id = auth.uid()
    AND mission_date = CURRENT_DATE
    AND mission_type = p_mission_type
    AND NOT is_completed
    AND (p_game_type IS NULL OR target_game_type IS NULL OR target_game_type = p_game_type);
  
  GET DIAGNOSTICS v_updated_count = ROW_COUNT;
  
  RETURN json_build_object('success', true, 'missions_updated', v_updated_count);
END;
$$;