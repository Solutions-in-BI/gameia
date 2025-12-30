-- Create evolution_alerts table for proactive alerts system
CREATE TABLE public.evolution_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  organization_id UUID REFERENCES public.organizations(id),
  alert_type TEXT NOT NULL CHECK (alert_type IN ('skill_stagnation', 'inactivity', 'performance_drop', 'goal_overdue', 'positive_streak', 'training_pending', 'challenge_completed', 'badge_earned')),
  severity TEXT NOT NULL DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'critical', 'positive')),
  title TEXT NOT NULL,
  description TEXT,
  suggested_action TEXT,
  suggested_action_type TEXT CHECK (suggested_action_type IN ('training', 'game', 'challenge', 'feedback', 'pdi', '1on1', 'view')),
  suggested_action_id UUID,
  related_entity_type TEXT CHECK (related_entity_type IN ('skill', 'training', 'game', 'challenge', 'pdi', 'goal', 'badge', 'feedback')),
  related_entity_id UUID,
  metadata JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT FALSE,
  is_dismissed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.evolution_alerts ENABLE ROW LEVEL SECURITY;

-- Users can view their own alerts
CREATE POLICY "Users can view their own alerts"
ON public.evolution_alerts
FOR SELECT
USING (auth.uid() = user_id);

-- Users can update their own alerts (mark as read/dismissed)
CREATE POLICY "Users can update their own alerts"
ON public.evolution_alerts
FOR UPDATE
USING (auth.uid() = user_id);

-- System can insert alerts (via service role)
CREATE POLICY "Service role can insert alerts"
ON public.evolution_alerts
FOR INSERT
WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX idx_evolution_alerts_user_id ON public.evolution_alerts(user_id);
CREATE INDEX idx_evolution_alerts_org_id ON public.evolution_alerts(organization_id);
CREATE INDEX idx_evolution_alerts_type ON public.evolution_alerts(alert_type);
CREATE INDEX idx_evolution_alerts_created ON public.evolution_alerts(created_at DESC);
CREATE INDEX idx_evolution_alerts_unread ON public.evolution_alerts(user_id, is_read) WHERE is_read = FALSE;