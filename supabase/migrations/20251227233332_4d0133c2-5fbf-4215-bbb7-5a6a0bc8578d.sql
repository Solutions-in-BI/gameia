-- ============================================
-- PHASE 1: INSIGNIAS SYSTEM - Complete Database Restructuring
-- ============================================

-- 1. Create insignias table (new progression system)
CREATE TABLE public.insignias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  insignia_key TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  shape TEXT NOT NULL DEFAULT 'star', -- 'star', 'rocket', 'shield', 'hexagon', 'crown', 'bolt', 'target', 'trophy'
  category TEXT NOT NULL, -- 'vendas', 'lideranca', 'comunicacao', 'decisao', 'geral'
  star_level INTEGER NOT NULL DEFAULT 1 CHECK (star_level BETWEEN 1 AND 5),
  
  -- Requirements (all optional, combined with AND logic)
  required_xp INTEGER DEFAULT 0,
  required_skill_id UUID REFERENCES public.skill_tree(id),
  required_skill_level INTEGER DEFAULT 0,
  required_streak_days INTEGER DEFAULT 0,
  required_game_type TEXT, -- 'quiz', 'sales', 'decisions'
  required_game_score_min INTEGER DEFAULT 0, -- minimum average score %
  required_missions_completed INTEGER DEFAULT 0,
  
  -- Rewards
  xp_reward INTEGER DEFAULT 0,
  coins_reward INTEGER DEFAULT 0,
  
  -- Visual
  icon TEXT NOT NULL DEFAULT '🏅',
  color TEXT DEFAULT '#6366f1',
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  organization_id UUID REFERENCES public.organizations(id),
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create user_insignias table (user progress tracking)
CREATE TABLE public.user_insignias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  insignia_id UUID REFERENCES public.insignias(id) ON DELETE CASCADE NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT now(),
  progress_data JSONB DEFAULT '{}', -- stores current progress toward requirements
  is_displayed BOOLEAN DEFAULT false, -- for showcase
  UNIQUE(user_id, insignia_id)
);

-- 3. Create trainings table (rename concept from badge_trails for educational content)
CREATE TABLE public.trainings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  training_key TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'professional',
  difficulty TEXT DEFAULT 'beginner',
  icon TEXT DEFAULT '📚',
  color TEXT DEFAULT '#3b82f6',
  estimated_hours INTEGER DEFAULT 2,
  xp_reward INTEGER DEFAULT 100,
  coins_reward INTEGER DEFAULT 50,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  organization_id UUID REFERENCES public.organizations(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Create training_modules table (content within trainings)
CREATE TABLE public.training_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  training_id UUID REFERENCES public.trainings(id) ON DELETE CASCADE NOT NULL,
  module_key TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  content_type TEXT DEFAULT 'text', -- 'text', 'video', 'quiz', 'interactive'
  content_data JSONB DEFAULT '{}', -- stores actual content or video URLs
  order_index INTEGER DEFAULT 0,
  xp_reward INTEGER DEFAULT 20,
  time_minutes INTEGER DEFAULT 15,
  is_required BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(training_id, module_key)
);

-- 5. Create user_training_progress table
CREATE TABLE public.user_training_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  training_id UUID REFERENCES public.trainings(id) ON DELETE CASCADE NOT NULL,
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  current_module_index INTEGER DEFAULT 0,
  progress_percent INTEGER DEFAULT 0,
  UNIQUE(user_id, training_id)
);

-- 6. Create user_module_progress table
CREATE TABLE public.user_module_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  module_id UUID REFERENCES public.training_modules(id) ON DELETE CASCADE NOT NULL,
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  score INTEGER, -- for quiz modules
  time_spent_seconds INTEGER DEFAULT 0,
  UNIQUE(user_id, module_id)
);

-- 7. Add game_skill_mapping to track which games develop which skills
CREATE TABLE public.game_skill_mapping (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_type TEXT NOT NULL, -- 'quiz', 'sales', 'decisions', 'memory', 'snake', etc.
  skill_id UUID REFERENCES public.skill_tree(id) ON DELETE CASCADE NOT NULL,
  xp_multiplier NUMERIC DEFAULT 1.0,
  is_primary BOOLEAN DEFAULT false, -- primary skill for this game
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(game_type, skill_id)
);

-- 8. Add user_game_stats table to track game performance for insignia requirements
CREATE TABLE public.user_game_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  game_type TEXT NOT NULL,
  total_games_played INTEGER DEFAULT 0,
  total_score INTEGER DEFAULT 0,
  best_score INTEGER DEFAULT 0,
  average_score NUMERIC DEFAULT 0,
  last_played_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, game_type)
);

-- ============================================
-- RLS POLICIES
-- ============================================

-- Insignias: Public read
ALTER TABLE public.insignias ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active insignias" ON public.insignias
  FOR SELECT USING (is_active = true);

-- User Insignias: Users can see and manage their own
ALTER TABLE public.user_insignias ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own insignias" ON public.user_insignias
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own insignias" ON public.user_insignias
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own insignias" ON public.user_insignias
  FOR UPDATE USING (auth.uid() = user_id);

-- Trainings: Public read
ALTER TABLE public.trainings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active trainings" ON public.trainings
  FOR SELECT USING (is_active = true);

-- Training Modules: Public read
ALTER TABLE public.training_modules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view training modules" ON public.training_modules
  FOR SELECT USING (true);

-- User Training Progress: Users manage their own
ALTER TABLE public.user_training_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own training progress" ON public.user_training_progress
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own training progress" ON public.user_training_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own training progress" ON public.user_training_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- User Module Progress: Users manage their own
ALTER TABLE public.user_module_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own module progress" ON public.user_module_progress
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own module progress" ON public.user_module_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own module progress" ON public.user_module_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- Game Skill Mapping: Public read
ALTER TABLE public.game_skill_mapping ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view game skill mappings" ON public.game_skill_mapping
  FOR SELECT USING (true);

-- User Game Stats: Users manage their own
ALTER TABLE public.user_game_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own game stats" ON public.user_game_stats
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own game stats" ON public.user_game_stats
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own game stats" ON public.user_game_stats
  FOR UPDATE USING (auth.uid() = user_id);