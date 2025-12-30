-- =============================================
-- TRAINING JOURNEYS - Jornadas de Treinamentos
-- =============================================

-- Tabela principal de jornadas
CREATE TABLE public.training_journeys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  journey_key TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'geral',
  level TEXT NOT NULL DEFAULT 'iniciante',
  importance TEXT DEFAULT 'estrategico',
  icon TEXT DEFAULT 'Route',
  color TEXT DEFAULT '#6366f1',
  thumbnail_url TEXT,
  
  order_type TEXT DEFAULT 'sequential' CHECK (order_type IN ('sequential', 'flexible')),
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  
  bonus_xp INTEGER DEFAULT 0,
  bonus_coins INTEGER DEFAULT 0,
  bonus_insignia_id UUID REFERENCES public.insignias(id) ON DELETE SET NULL,
  bonus_item_ids JSONB DEFAULT '[]'::jsonb,
  generates_certificate BOOLEAN DEFAULT false,
  certificate_name TEXT,
  
  evolution_template_id UUID REFERENCES public.evolution_templates(id) ON DELETE SET NULL,
  
  total_estimated_hours NUMERIC(10,2) DEFAULT 0,
  total_trainings INTEGER DEFAULT 0,
  total_xp INTEGER DEFAULT 0,
  total_coins INTEGER DEFAULT 0,
  aggregated_skills JSONB DEFAULT '[]'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(organization_id, journey_key)
);

-- Tabela de relacionamento jornada-treinamentos
CREATE TABLE public.journey_trainings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  journey_id UUID NOT NULL REFERENCES public.training_journeys(id) ON DELETE CASCADE,
  training_id UUID NOT NULL REFERENCES public.trainings(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_required BOOLEAN DEFAULT true,
  prerequisite_training_id UUID REFERENCES public.trainings(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(journey_id, training_id)
);

-- Tabela de progresso do usuário na jornada
CREATE TABLE public.user_journey_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  journey_id UUID NOT NULL REFERENCES public.training_journeys(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  trainings_completed INTEGER DEFAULT 0,
  total_xp_earned INTEGER DEFAULT 0,
  total_coins_earned INTEGER DEFAULT 0,
  bonus_claimed BOOLEAN DEFAULT false,
  certificate_issued_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(user_id, journey_id)
);

-- Índices
CREATE INDEX idx_training_journeys_org ON public.training_journeys(organization_id);
CREATE INDEX idx_training_journeys_active ON public.training_journeys(is_active, organization_id);
CREATE INDEX idx_journey_trainings_journey ON public.journey_trainings(journey_id);
CREATE INDEX idx_journey_trainings_order ON public.journey_trainings(journey_id, order_index);
CREATE INDEX idx_user_journey_progress_user ON public.user_journey_progress(user_id);
CREATE INDEX idx_user_journey_progress_journey ON public.user_journey_progress(journey_id);

-- Enable RLS
ALTER TABLE public.training_journeys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journey_trainings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_journey_progress ENABLE ROW LEVEL SECURITY;

-- RLS para training_journeys
CREATE POLICY "Users can view active journeys from their org"
  ON public.training_journeys FOR SELECT
  USING (
    is_active = true AND (
      organization_id IS NULL OR
      organization_id IN (
        SELECT current_organization_id FROM public.profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Admins can manage journeys in their org"
  ON public.training_journeys FOR ALL
  USING (
    organization_id IN (
      SELECT om.organization_id FROM public.organization_members om
      WHERE om.user_id = auth.uid() AND om.role IN ('admin', 'super_admin')
    )
  );

-- RLS para journey_trainings
CREATE POLICY "Users can view journey trainings"
  ON public.journey_trainings FOR SELECT
  USING (
    journey_id IN (
      SELECT id FROM public.training_journeys tj
      WHERE tj.is_active = true AND (
        tj.organization_id IS NULL OR
        tj.organization_id IN (
          SELECT current_organization_id FROM public.profiles WHERE id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Admins can manage journey trainings"
  ON public.journey_trainings FOR ALL
  USING (
    journey_id IN (
      SELECT id FROM public.training_journeys tj
      WHERE tj.organization_id IN (
        SELECT om.organization_id FROM public.organization_members om
        WHERE om.user_id = auth.uid() AND om.role IN ('admin', 'super_admin')
      )
    )
  );

-- RLS para user_journey_progress
CREATE POLICY "Users can view their own journey progress"
  ON public.user_journey_progress FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own journey progress"
  ON public.user_journey_progress FOR ALL
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view journey progress in their org"
  ON public.user_journey_progress FOR SELECT
  USING (
    organization_id IN (
      SELECT om.organization_id FROM public.organization_members om
      WHERE om.user_id = auth.uid() AND om.role IN ('admin', 'super_admin', 'manager')
    )
  );

-- Trigger para atualizar updated_at
CREATE TRIGGER update_training_journeys_updated_at
  BEFORE UPDATE ON public.training_journeys
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_journey_progress_updated_at
  BEFORE UPDATE ON public.user_journey_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Função para recalcular totais da jornada
CREATE OR REPLACE FUNCTION public.recalculate_journey_totals(p_journey_id UUID)
RETURNS void AS $$
DECLARE
  v_total_hours NUMERIC;
  v_total_trainings INTEGER;
  v_total_xp INTEGER;
  v_total_coins INTEGER;
  v_skills JSONB;
BEGIN
  SELECT 
    COALESCE(SUM(t.estimated_hours), 0),
    COUNT(jt.id),
    COALESCE(SUM(t.xp_reward), 0),
    COALESCE(SUM(t.coins_reward), 0)
  INTO v_total_hours, v_total_trainings, v_total_xp, v_total_coins
  FROM public.journey_trainings jt
  JOIN public.trainings t ON t.id = jt.training_id
  WHERE jt.journey_id = p_journey_id;
  
  SELECT COALESCE(jsonb_agg(DISTINCT skill), '[]'::jsonb)
  INTO v_skills
  FROM (
    SELECT jsonb_array_elements(t.skill_ids::jsonb) as skill
    FROM public.journey_trainings jt
    JOIN public.trainings t ON t.id = jt.training_id
    WHERE jt.journey_id = p_journey_id
      AND t.skill_ids IS NOT NULL
  ) sub;
  
  UPDATE public.training_journeys
  SET 
    total_estimated_hours = v_total_hours,
    total_trainings = v_total_trainings,
    total_xp = v_total_xp,
    total_coins = v_total_coins,
    aggregated_skills = COALESCE(v_skills, '[]'::jsonb),
    updated_at = now()
  WHERE id = p_journey_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para recalcular totais
CREATE OR REPLACE FUNCTION public.journey_trainings_change_trigger()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    PERFORM public.recalculate_journey_totals(OLD.journey_id);
    RETURN OLD;
  ELSE
    PERFORM public.recalculate_journey_totals(NEW.journey_id);
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER journey_trainings_changed
  AFTER INSERT OR UPDATE OR DELETE ON public.journey_trainings
  FOR EACH ROW
  EXECUTE FUNCTION public.journey_trainings_change_trigger();