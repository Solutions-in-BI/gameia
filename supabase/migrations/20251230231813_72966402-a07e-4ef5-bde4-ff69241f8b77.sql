-- =====================================================
-- GAMEIA ASSESSMENT SYSTEM - Sprint 1 Tables
-- Avaliação Contextual Rápida + Consequências Automáticas
-- =====================================================

-- 1. Perguntas para Avaliações Contextuais
CREATE TABLE public.contextual_assessment_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  context_type TEXT NOT NULL,
  skill_id UUID REFERENCES public.skill_configurations(id) ON DELETE SET NULL,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL DEFAULT 'scale',
  options JSONB,
  scale_min INTEGER DEFAULT 1,
  scale_max INTEGER DEFAULT 5,
  scale_labels JSONB,
  display_order INTEGER DEFAULT 0,
  is_required BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Respostas de Avaliações Contextuais
CREATE TABLE public.contextual_assessment_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  context_type TEXT NOT NULL,
  context_id UUID,
  context_event_id UUID REFERENCES public.core_events(id) ON DELETE SET NULL,
  responses JSONB NOT NULL,
  total_score NUMERIC(5,2),
  time_spent_seconds INTEGER,
  skills_impacted UUID[],
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Avaliações do Gestor
CREATE TABLE public.manager_assessments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  manager_id UUID NOT NULL,
  evaluatee_id UUID NOT NULL,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  cycle_id UUID REFERENCES public.assessment_cycles(id) ON DELETE SET NULL,
  assessment_type TEXT DEFAULT 'periodic',
  responses JSONB NOT NULL,
  direction_notes TEXT,
  strengths TEXT[],
  development_areas TEXT[],
  recommended_actions JSONB,
  total_score NUMERIC(5,2),
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. Consequências Geradas por Avaliações
CREATE TABLE public.assessment_consequences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  assessment_type TEXT NOT NULL,
  assessment_id UUID NOT NULL,
  consequence_type TEXT NOT NULL,
  target_type TEXT,
  target_id UUID,
  title TEXT NOT NULL,
  description TEXT,
  priority INTEGER DEFAULT 5,
  skill_ids UUID[],
  status TEXT DEFAULT 'pending',
  accepted_at TIMESTAMP WITH TIME ZONE,
  dismissed_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 5. Snapshots de Evolução
CREATE TABLE public.assessment_evolution_snapshots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
  skill_scores JSONB,
  overall_score NUMERIC(5,2),
  assessments_count INTEGER DEFAULT 0,
  trainings_count INTEGER DEFAULT 0,
  challenges_count INTEGER DEFAULT 0,
  streak_days INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, snapshot_date)
);

-- Enable RLS
ALTER TABLE public.contextual_assessment_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contextual_assessment_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manager_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_consequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_evolution_snapshots ENABLE ROW LEVEL SECURITY;

-- RLS Policies for contextual_assessment_questions
CREATE POLICY "Anyone can view active assessment questions"
  ON public.contextual_assessment_questions FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage assessment questions"
  ON public.contextual_assessment_questions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'super_admin') 
      AND is_active = true
    )
    OR EXISTS (
      SELECT 1 FROM organization_members 
      WHERE user_id = auth.uid() 
      AND organization_id = contextual_assessment_questions.organization_id
      AND role IN ('admin', 'org_admin')
    )
  );

-- RLS Policies for contextual_assessment_responses
CREATE POLICY "Users can view own responses"
  ON public.contextual_assessment_responses FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own responses"
  ON public.contextual_assessment_responses FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Managers can view team responses"
  ON public.contextual_assessment_responses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM organization_members 
      WHERE user_id = auth.uid() 
      AND organization_id = contextual_assessment_responses.organization_id
      AND role IN ('admin', 'org_admin', 'manager')
    )
  );

-- RLS Policies for manager_assessments
CREATE POLICY "Managers can create assessments"
  ON public.manager_assessments FOR INSERT
  WITH CHECK (manager_id = auth.uid());

CREATE POLICY "Managers can view their assessments"
  ON public.manager_assessments FOR SELECT
  USING (manager_id = auth.uid());

CREATE POLICY "Users can view assessments about them"
  ON public.manager_assessments FOR SELECT
  USING (evaluatee_id = auth.uid());

-- RLS Policies for assessment_consequences
CREATE POLICY "Users can view own consequences"
  ON public.assessment_consequences FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own consequences"
  ON public.assessment_consequences FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Authenticated users can insert consequences"
  ON public.assessment_consequences FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- RLS Policies for assessment_evolution_snapshots
CREATE POLICY "Users can view own evolution"
  ON public.assessment_evolution_snapshots FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Authenticated can manage snapshots"
  ON public.assessment_evolution_snapshots FOR ALL
  USING (auth.uid() IS NOT NULL);

-- Indexes
CREATE INDEX idx_contextual_questions_context ON public.contextual_assessment_questions(context_type, is_active);
CREATE INDEX idx_contextual_responses_user ON public.contextual_assessment_responses(user_id, context_type);
CREATE INDEX idx_contextual_responses_context ON public.contextual_assessment_responses(context_id);
CREATE INDEX idx_manager_assessments_evaluatee ON public.manager_assessments(evaluatee_id);
CREATE INDEX idx_assessment_consequences_user ON public.assessment_consequences(user_id, status);
CREATE INDEX idx_evolution_snapshots_user ON public.assessment_evolution_snapshots(user_id, snapshot_date);

-- Function to generate assessment consequences
CREATE OR REPLACE FUNCTION public.generate_assessment_consequences(
  p_user_id UUID,
  p_assessment_type TEXT,
  p_assessment_id UUID,
  p_responses JSONB,
  p_skill_ids UUID[] DEFAULT NULL
)
RETURNS SETOF public.assessment_consequences
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_org_id UUID;
  v_consequence_id UUID;
BEGIN
  SELECT current_organization_id INTO v_org_id FROM profiles WHERE id = p_user_id;
  
  INSERT INTO assessment_consequences (
    user_id, organization_id, assessment_type, assessment_id,
    consequence_type, title, description, priority, skill_ids, status
  ) VALUES (
    p_user_id, v_org_id, p_assessment_type, p_assessment_id,
    'insight', 
    'Avaliação concluída',
    'Continue praticando para evoluir suas competências!',
    3,
    p_skill_ids,
    'pending'
  )
  RETURNING id INTO v_consequence_id;
  
  RETURN QUERY SELECT * FROM assessment_consequences WHERE id = v_consequence_id;
  RETURN;
END;
$$;

-- Seed default contextual questions
INSERT INTO public.contextual_assessment_questions (context_type, question_text, question_type, scale_labels, display_order) VALUES
('training', 'Quanto você conseguiu aplicar os conceitos deste treinamento no seu dia a dia?', 'scale', '{"1": "Nada", "3": "Parcialmente", "5": "Totalmente"}', 1),
('training', 'Como você avalia a mudança no seu comportamento após este aprendizado?', 'scale', '{"1": "Nenhuma mudança", "3": "Alguma mudança", "5": "Mudança significativa"}', 2),
('training', 'O quanto você se sente preparado para ensinar isso a um colega?', 'scale', '{"1": "Nada preparado", "3": "Parcialmente", "5": "Totalmente preparado"}', 3),
('game', 'Como você avalia seu desempenho nesta simulação?', 'scale', '{"1": "Muito abaixo", "3": "Na média", "5": "Excelente"}', 1),
('game', 'O quanto esta experiência te ajudou a desenvolver novas habilidades?', 'scale', '{"1": "Nada", "3": "Um pouco", "5": "Muito"}', 2),
('challenge', 'Qual foi o nível de dificuldade para completar este desafio?', 'scale', '{"1": "Muito fácil", "3": "Adequado", "5": "Muito difícil"}', 1),
('challenge', 'O quanto você aprendeu com este desafio?', 'scale', '{"1": "Nada", "3": "Um pouco", "5": "Muito"}', 2),
('challenge', 'Você conseguiu aplicar o aprendizado na prática?', 'scale', '{"1": "Não apliquei", "3": "Parcialmente", "5": "Totalmente"}', 3);