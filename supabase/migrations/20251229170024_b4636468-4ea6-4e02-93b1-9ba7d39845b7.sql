
-- Create enums for commitments
CREATE TYPE public.commitment_scope AS ENUM ('team', 'global');
CREATE TYPE public.commitment_source AS ENUM ('internal', 'external');
CREATE TYPE public.commitment_status AS ENUM ('draft', 'active', 'completed', 'failed', 'cancelled');
CREATE TYPE public.commitment_reward_type AS ENUM ('coins', 'xp', 'both', 'insignia');

-- Create commitments table
CREATE TABLE public.commitments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  team_id UUID REFERENCES public.organization_teams(id) ON DELETE SET NULL,
  created_by UUID NOT NULL,
  
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  scope public.commitment_scope NOT NULL,
  source public.commitment_source NOT NULL,
  
  starts_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ends_at TIMESTAMP WITH TIME ZONE NOT NULL,
  
  success_criteria TEXT NOT NULL,
  target_value NUMERIC NOT NULL DEFAULT 100,
  current_value NUMERIC NOT NULL DEFAULT 0,
  metric_type TEXT NOT NULL DEFAULT 'custom',
  
  reward_type public.commitment_reward_type NOT NULL DEFAULT 'both',
  coins_reward INTEGER NOT NULL DEFAULT 0,
  xp_reward INTEGER NOT NULL DEFAULT 0,
  insignia_id UUID REFERENCES public.insignias(id) ON DELETE SET NULL,
  
  auto_enroll BOOLEAN NOT NULL DEFAULT false,
  max_participants INTEGER,
  status public.commitment_status NOT NULL DEFAULT 'draft',
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create commitment_participants table
CREATE TABLE public.commitment_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  commitment_id UUID NOT NULL REFERENCES public.commitments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  individual_progress NUMERIC NOT NULL DEFAULT 0,
  contributed BOOLEAN NOT NULL DEFAULT false,
  reward_claimed BOOLEAN NOT NULL DEFAULT false,
  
  UNIQUE(commitment_id, user_id)
);

-- Create commitment_progress_logs table
CREATE TABLE public.commitment_progress_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  commitment_id UUID NOT NULL REFERENCES public.commitments(id) ON DELETE CASCADE,
  logged_by UUID NOT NULL,
  
  previous_value NUMERIC,
  new_value NUMERIC NOT NULL,
  change_amount NUMERIC,
  note TEXT,
  source TEXT NOT NULL DEFAULT 'manual',
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.commitments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commitment_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commitment_progress_logs ENABLE ROW LEVEL SECURITY;

-- Security definer function to check if user is member of organization
CREATE OR REPLACE FUNCTION public.is_org_member(_user_id UUID, _org_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE user_id = _user_id AND organization_id = _org_id
  )
$$;

-- Security definer function to check if user is manager of team
CREATE OR REPLACE FUNCTION public.is_team_manager(_user_id UUID, _team_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organization_teams
    WHERE id = _team_id AND manager_id = _user_id
  )
$$;

-- Security definer function to check if user is org admin
CREATE OR REPLACE FUNCTION public.is_org_admin(_user_id UUID, _org_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE user_id = _user_id 
    AND organization_id = _org_id 
    AND role IN ('admin', 'super_admin', 'owner')
  )
$$;

-- RLS Policies for commitments

-- Users can view commitments from their organization
CREATE POLICY "Users can view org commitments"
ON public.commitments
FOR SELECT
TO authenticated
USING (
  public.is_org_member(auth.uid(), organization_id)
);

-- Managers/Admins can create commitments
CREATE POLICY "Managers can create team commitments"
ON public.commitments
FOR INSERT
TO authenticated
WITH CHECK (
  (scope = 'team' AND team_id IS NOT NULL AND public.is_team_manager(auth.uid(), team_id))
  OR
  (scope = 'global' AND public.is_org_admin(auth.uid(), organization_id))
);

-- Creator or admin can update commitments
CREATE POLICY "Creator or admin can update commitments"
ON public.commitments
FOR UPDATE
TO authenticated
USING (
  created_by = auth.uid() OR public.is_org_admin(auth.uid(), organization_id)
);

-- Creator or admin can delete commitments
CREATE POLICY "Creator or admin can delete commitments"
ON public.commitments
FOR DELETE
TO authenticated
USING (
  created_by = auth.uid() OR public.is_org_admin(auth.uid(), organization_id)
);

-- RLS Policies for commitment_participants

-- Users can view participants of commitments they can see
CREATE POLICY "Users can view commitment participants"
ON public.commitment_participants
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.commitments c
    WHERE c.id = commitment_id
    AND public.is_org_member(auth.uid(), c.organization_id)
  )
);

-- Users can join commitments
CREATE POLICY "Users can join commitments"
ON public.commitment_participants
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.commitments c
    WHERE c.id = commitment_id
    AND c.status = 'active'
    AND public.is_org_member(auth.uid(), c.organization_id)
  )
);

-- Users can leave their own participation
CREATE POLICY "Users can leave commitments"
ON public.commitment_participants
FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- RLS Policies for commitment_progress_logs

-- Users can view progress logs of commitments they can see
CREATE POLICY "Users can view progress logs"
ON public.commitment_progress_logs
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.commitments c
    WHERE c.id = commitment_id
    AND public.is_org_member(auth.uid(), c.organization_id)
  )
);

-- Managers/Admins can insert progress logs
CREATE POLICY "Managers can log progress"
ON public.commitment_progress_logs
FOR INSERT
TO authenticated
WITH CHECK (
  logged_by = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.commitments c
    WHERE c.id = commitment_id
    AND (
      public.is_org_admin(auth.uid(), c.organization_id)
      OR (c.team_id IS NOT NULL AND public.is_team_manager(auth.uid(), c.team_id))
    )
  )
);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.update_commitments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_commitments_updated_at
BEFORE UPDATE ON public.commitments
FOR EACH ROW
EXECUTE FUNCTION public.update_commitments_updated_at();

-- Create indexes for performance
CREATE INDEX idx_commitments_org ON public.commitments(organization_id);
CREATE INDEX idx_commitments_team ON public.commitments(team_id);
CREATE INDEX idx_commitments_status ON public.commitments(status);
CREATE INDEX idx_commitment_participants_commitment ON public.commitment_participants(commitment_id);
CREATE INDEX idx_commitment_participants_user ON public.commitment_participants(user_id);
CREATE INDEX idx_commitment_progress_logs_commitment ON public.commitment_progress_logs(commitment_id);
