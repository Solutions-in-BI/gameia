-- Organizations table (empresas)
CREATE TABLE public.organizations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  description TEXT,
  industry TEXT,
  size TEXT DEFAULT 'small',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  owner_id UUID NOT NULL
);

-- Organization members (funcionários vinculados)
CREATE TABLE public.organization_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  department TEXT,
  job_title TEXT,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true,
  UNIQUE(organization_id, user_id)
);

-- Organization challenges (desafios criados pela empresa)
CREATE TABLE public.organization_challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  xp_reward INTEGER DEFAULT 50,
  coins_reward INTEGER DEFAULT 25,
  deadline TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID NOT NULL
);

-- User challenge progress
CREATE TABLE public.user_challenge_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  challenge_id UUID NOT NULL REFERENCES public.organization_challenges(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending',
  completed_at TIMESTAMP WITH TIME ZONE,
  score INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, challenge_id)
);

-- Enable RLS
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_challenge_progress ENABLE ROW LEVEL SECURITY;

-- Organizations policies
CREATE POLICY "Anyone can view organizations" ON public.organizations FOR SELECT USING (true);
CREATE POLICY "Owners can update their organizations" ON public.organizations FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Authenticated users can create organizations" ON public.organizations FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owners can delete organizations" ON public.organizations FOR DELETE USING (auth.uid() = owner_id);

-- Organization members policies
CREATE POLICY "Members can view organization members" ON public.organization_members FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.organization_members om WHERE om.organization_id = organization_members.organization_id AND om.user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM public.organizations o WHERE o.id = organization_members.organization_id AND o.owner_id = auth.uid())
);
CREATE POLICY "Owners/admins can add members" ON public.organization_members FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.organizations o WHERE o.id = organization_id AND o.owner_id = auth.uid())
  OR EXISTS (SELECT 1 FROM public.organization_members om WHERE om.organization_id = organization_id AND om.user_id = auth.uid() AND om.role = 'admin')
);
CREATE POLICY "Owners/admins can update members" ON public.organization_members FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.organizations o WHERE o.id = organization_id AND o.owner_id = auth.uid())
  OR EXISTS (SELECT 1 FROM public.organization_members om WHERE om.organization_id = organization_id AND om.user_id = auth.uid() AND om.role = 'admin')
);
CREATE POLICY "Owners can remove members" ON public.organization_members FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.organizations o WHERE o.id = organization_id AND o.owner_id = auth.uid())
  OR user_id = auth.uid()
);

-- Organization challenges policies
CREATE POLICY "Members can view org challenges" ON public.organization_challenges FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.organization_members om WHERE om.organization_id = organization_challenges.organization_id AND om.user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM public.organizations o WHERE o.id = organization_challenges.organization_id AND o.owner_id = auth.uid())
);
CREATE POLICY "Owners/admins can create challenges" ON public.organization_challenges FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.organizations o WHERE o.id = organization_id AND o.owner_id = auth.uid())
  OR EXISTS (SELECT 1 FROM public.organization_members om WHERE om.organization_id = organization_id AND om.user_id = auth.uid() AND om.role = 'admin')
);
CREATE POLICY "Owners/admins can update challenges" ON public.organization_challenges FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.organizations o WHERE o.id = organization_id AND o.owner_id = auth.uid())
  OR EXISTS (SELECT 1 FROM public.organization_members om WHERE om.organization_id = organization_id AND om.user_id = auth.uid() AND om.role = 'admin')
);
CREATE POLICY "Owners can delete challenges" ON public.organization_challenges FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.organizations o WHERE o.id = organization_id AND o.owner_id = auth.uid())
);

-- User challenge progress policies
CREATE POLICY "Users can view own progress" ON public.user_challenge_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own progress" ON public.user_challenge_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own progress" ON public.user_challenge_progress FOR UPDATE USING (auth.uid() = user_id);

-- Add organization_id to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS current_organization_id UUID REFERENCES public.organizations(id);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS job_title TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS department TEXT;