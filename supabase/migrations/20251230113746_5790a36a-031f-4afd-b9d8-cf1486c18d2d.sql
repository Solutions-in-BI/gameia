-- Create evolution_templates table for automatic evolution packages
CREATE TABLE public.evolution_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('vendas', 'lideranca', 'soft_skills', 'produtividade', 'estrategia', 'onboarding', 'compliance', 'tecnico')),
  level TEXT NOT NULL CHECK (level IN ('basico', 'intermediario', 'avancado', 'especialista')),
  importance TEXT NOT NULL CHECK (importance IN ('essencial', 'estrategico', 'complementar')),
  skill_impacts JSONB NOT NULL DEFAULT '[]',
  insignia_ids UUID[] DEFAULT '{}',
  generates_certificate BOOLEAN DEFAULT false,
  certificate_min_score INTEGER DEFAULT 80,
  suggested_xp INTEGER DEFAULT 100,
  suggested_coins INTEGER DEFAULT 50,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add evolution fields to trainings table
ALTER TABLE public.trainings 
ADD COLUMN IF NOT EXISTS evolution_template_id UUID REFERENCES evolution_templates(id),
ADD COLUMN IF NOT EXISTS evolution_snapshot JSONB,
ADD COLUMN IF NOT EXISTS importance TEXT DEFAULT 'complementar';

-- Enable RLS
ALTER TABLE public.evolution_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for evolution_templates
CREATE POLICY "Users can view evolution templates from their org"
ON public.evolution_templates FOR SELECT
USING (
  organization_id IS NULL 
  OR organization_id IN (
    SELECT organization_id FROM user_roles WHERE user_id = auth.uid() AND is_active = true
  )
);

CREATE POLICY "Admins can manage evolution templates"
ON public.evolution_templates FOR ALL
USING (
  organization_id IN (
    SELECT organization_id FROM user_roles 
    WHERE user_id = auth.uid() AND role IN ('admin', 'owner') AND is_active = true
  )
);

-- Create trigger for updated_at
CREATE TRIGGER update_evolution_templates_updated_at
BEFORE UPDATE ON public.evolution_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default templates (global, no org_id)
INSERT INTO public.evolution_templates (name, category, level, importance, skill_impacts, generates_certificate, suggested_xp, suggested_coins, is_default) VALUES
-- Vendas
('Vendas Básico', 'vendas', 'basico', 'essencial', '[]', false, 50, 25, true),
('Vendas Intermediário', 'vendas', 'intermediario', 'estrategico', '[]', true, 100, 50, true),
('Vendas Avançado', 'vendas', 'avancado', 'estrategico', '[]', true, 200, 100, true),
('Vendas Especialista', 'vendas', 'especialista', 'essencial', '[]', true, 400, 200, true),
-- Liderança
('Liderança Básico', 'lideranca', 'basico', 'complementar', '[]', false, 50, 25, true),
('Liderança Intermediário', 'lideranca', 'intermediario', 'estrategico', '[]', true, 150, 75, true),
('Liderança Avançado', 'lideranca', 'avancado', 'essencial', '[]', true, 300, 150, true),
-- Soft Skills
('Soft Skills Básico', 'soft_skills', 'basico', 'complementar', '[]', false, 40, 20, true),
('Soft Skills Intermediário', 'soft_skills', 'intermediario', 'estrategico', '[]', false, 80, 40, true),
-- Onboarding
('Onboarding Básico', 'onboarding', 'basico', 'essencial', '[]', false, 30, 15, true),
('Onboarding Completo', 'onboarding', 'intermediario', 'essencial', '[]', true, 100, 50, true),
-- Compliance
('Compliance Básico', 'compliance', 'basico', 'essencial', '[]', true, 50, 25, true),
('Compliance Avançado', 'compliance', 'avancado', 'essencial', '[]', true, 150, 75, true),
-- Técnico
('Técnico Básico', 'tecnico', 'basico', 'complementar', '[]', false, 60, 30, true),
('Técnico Avançado', 'tecnico', 'avancado', 'estrategico', '[]', true, 200, 100, true);