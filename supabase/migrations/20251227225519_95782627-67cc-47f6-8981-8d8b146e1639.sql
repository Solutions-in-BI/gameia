-- =====================================================
-- CRIAR TABELAS DE TRILHAS E MISSÕES
-- =====================================================

-- Trilhas/Jornadas temáticas
CREATE TABLE public.badge_trails (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trail_key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT NOT NULL DEFAULT '🎯',
  color TEXT DEFAULT '#6366f1',
  category TEXT DEFAULT 'professional',
  difficulty TEXT DEFAULT 'beginner',
  estimated_hours INTEGER DEFAULT 2,
  points_reward INTEGER DEFAULT 1000,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Missões dentro das trilhas
CREATE TABLE public.trail_missions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trail_id UUID NOT NULL REFERENCES public.badge_trails(id) ON DELETE CASCADE,
  mission_key TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  instruction TEXT,
  mission_type TEXT NOT NULL,
  target_value INTEGER DEFAULT 1,
  xp_reward INTEGER DEFAULT 50,
  coins_reward INTEGER DEFAULT 25,
  order_index INTEGER DEFAULT 0,
  is_required BOOLEAN DEFAULT true,
  time_limit_minutes INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(trail_id, mission_key)
);

-- Progresso do usuário nas trilhas
CREATE TABLE public.user_trail_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  trail_id UUID NOT NULL REFERENCES public.badge_trails(id) ON DELETE CASCADE,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  current_mission_index INTEGER DEFAULT 0,
  status TEXT DEFAULT 'in_progress',
  UNIQUE(user_id, trail_id)
);

-- Progresso do usuário nas missões
CREATE TABLE public.user_mission_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  mission_id UUID NOT NULL REFERENCES public.trail_missions(id) ON DELETE CASCADE,
  current_value INTEGER DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE,
  attempts INTEGER DEFAULT 0,
  best_score INTEGER,
  UNIQUE(user_id, mission_id)
);

-- Enable RLS
ALTER TABLE public.badge_trails ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trail_missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_trail_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_mission_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Trails are viewable by everyone" ON public.badge_trails FOR SELECT USING (true);
CREATE POLICY "Missions are viewable by everyone" ON public.trail_missions FOR SELECT USING (true);
CREATE POLICY "Users can view own trail progress" ON public.user_trail_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own trail progress" ON public.user_trail_progress FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own mission progress" ON public.user_mission_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own mission progress" ON public.user_mission_progress FOR ALL USING (auth.uid() = user_id);