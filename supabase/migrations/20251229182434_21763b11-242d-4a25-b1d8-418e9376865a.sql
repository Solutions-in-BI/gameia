-- Tabela central de eventos do Gameia
CREATE TABLE public.core_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  team_id UUID REFERENCES public.organization_teams(id) ON DELETE SET NULL,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  skill_ids UUID[] DEFAULT '{}',
  xp_earned INTEGER DEFAULT 0,
  coins_earned INTEGER DEFAULT 0,
  score INTEGER,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices para performance em consultas analíticas
CREATE INDEX idx_core_events_user_id ON public.core_events(user_id);
CREATE INDEX idx_core_events_team_id ON public.core_events(team_id);
CREATE INDEX idx_core_events_organization_id ON public.core_events(organization_id);
CREATE INDEX idx_core_events_event_type ON public.core_events(event_type);
CREATE INDEX idx_core_events_created_at ON public.core_events(created_at DESC);
CREATE INDEX idx_core_events_skill_ids ON public.core_events USING GIN(skill_ids);
CREATE INDEX idx_core_events_user_type_date ON public.core_events(user_id, event_type, created_at DESC);

-- Enable RLS
ALTER TABLE public.core_events ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can view their own events"
ON public.core_events FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own events"
ON public.core_events FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Org admins can view team events"
ON public.core_events FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.organization_members om
    WHERE om.organization_id = core_events.organization_id
    AND om.user_id = auth.uid()
    AND om.role IN ('admin', 'owner')
  )
);

-- Habilitar realtime para analytics
ALTER PUBLICATION supabase_realtime ADD TABLE public.core_events;

-- Função RPC para registrar eventos (para uso em triggers e edge functions)
CREATE OR REPLACE FUNCTION public.record_core_event(
  p_user_id UUID,
  p_event_type TEXT,
  p_team_id UUID DEFAULT NULL,
  p_organization_id UUID DEFAULT NULL,
  p_skill_ids UUID[] DEFAULT '{}',
  p_xp_earned INTEGER DEFAULT 0,
  p_coins_earned INTEGER DEFAULT 0,
  p_score INTEGER DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_event_id UUID;
  v_org_id UUID;
BEGIN
  -- Se org_id não foi passado, buscar do perfil do usuário
  IF p_organization_id IS NULL THEN
    SELECT current_organization_id INTO v_org_id
    FROM profiles WHERE id = p_user_id;
  ELSE
    v_org_id := p_organization_id;
  END IF;

  INSERT INTO core_events (
    user_id,
    team_id,
    organization_id,
    event_type,
    skill_ids,
    xp_earned,
    coins_earned,
    score,
    metadata
  ) VALUES (
    p_user_id,
    p_team_id,
    v_org_id,
    p_event_type,
    p_skill_ids,
    p_xp_earned,
    p_coins_earned,
    p_score,
    p_metadata
  )
  RETURNING id INTO v_event_id;

  RETURN v_event_id;
END;
$$;

-- Função para buscar eventos agregados por tipo
CREATE OR REPLACE FUNCTION public.get_user_event_stats(
  p_user_id UUID,
  p_days INTEGER DEFAULT 30
)
RETURNS TABLE (
  event_type TEXT,
  event_count BIGINT,
  total_xp INTEGER,
  total_coins INTEGER,
  avg_score NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ce.event_type,
    COUNT(*)::BIGINT as event_count,
    COALESCE(SUM(ce.xp_earned), 0)::INTEGER as total_xp,
    COALESCE(SUM(ce.coins_earned), 0)::INTEGER as total_coins,
    AVG(ce.score)::NUMERIC as avg_score
  FROM core_events ce
  WHERE ce.user_id = p_user_id
    AND ce.created_at >= now() - (p_days || ' days')::INTERVAL
  GROUP BY ce.event_type
  ORDER BY event_count DESC;
END;
$$;

-- Função para buscar eventos de equipe
CREATE OR REPLACE FUNCTION public.get_team_event_stats(
  p_team_id UUID,
  p_days INTEGER DEFAULT 30
)
RETURNS TABLE (
  event_type TEXT,
  event_count BIGINT,
  unique_users BIGINT,
  total_xp INTEGER,
  total_coins INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ce.event_type,
    COUNT(*)::BIGINT as event_count,
    COUNT(DISTINCT ce.user_id)::BIGINT as unique_users,
    COALESCE(SUM(ce.xp_earned), 0)::INTEGER as total_xp,
    COALESCE(SUM(ce.coins_earned), 0)::INTEGER as total_coins
  FROM core_events ce
  WHERE ce.team_id = p_team_id
    AND ce.created_at >= now() - (p_days || ' days')::INTERVAL
  GROUP BY ce.event_type
  ORDER BY event_count DESC;
END;
$$;