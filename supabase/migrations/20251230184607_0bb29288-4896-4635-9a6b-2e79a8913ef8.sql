-- Tabela de anotações de treinamento
CREATE TABLE public.training_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  
  -- Contexto da anotação
  training_id UUID NOT NULL REFERENCES public.trainings(id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES public.training_modules(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL CHECK (content_type IN ('video', 'text', 'quiz', 'game', 'pdf', 'link', 'reflection')),
  
  -- Localização exata no conteúdo
  timestamp_seconds INTEGER, -- Para vídeos
  text_selection TEXT, -- Trecho selecionado em texto
  quiz_question_index INTEGER, -- Índice da questão em quiz
  game_context JSONB, -- Contexto em jogos (fase, pontuação, etc)
  
  -- Conteúdo da nota
  title TEXT,
  content TEXT NOT NULL,
  
  -- Skills associadas (do módulo)
  skill_ids UUID[],
  
  -- Status e organização
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'applied', 'reviewed')),
  tags TEXT[],
  is_favorite BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices para performance
CREATE INDEX idx_training_notes_user ON public.training_notes(user_id);
CREATE INDEX idx_training_notes_training ON public.training_notes(training_id);
CREATE INDEX idx_training_notes_module ON public.training_notes(module_id);
CREATE INDEX idx_training_notes_status ON public.training_notes(status);
CREATE INDEX idx_training_notes_created ON public.training_notes(created_at DESC);
CREATE INDEX idx_training_notes_org ON public.training_notes(organization_id);

-- Habilitar RLS
ALTER TABLE public.training_notes ENABLE ROW LEVEL SECURITY;

-- Política: usuários podem gerenciar suas próprias notas
CREATE POLICY "Users can manage own notes"
  ON public.training_notes
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_training_notes_updated_at
  BEFORE UPDATE ON public.training_notes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Tabela de analytics agregadas (sem conteúdo individual)
CREATE TABLE public.training_notes_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  training_id UUID NOT NULL REFERENCES public.trainings(id) ON DELETE CASCADE,
  module_id UUID REFERENCES public.training_modules(id) ON DELETE CASCADE,
  
  -- Métricas agregadas
  total_notes INTEGER DEFAULT 0,
  unique_users INTEGER DEFAULT 0,
  avg_notes_per_user NUMERIC(5,2) DEFAULT 0,
  notes_by_status JSONB DEFAULT '{"draft": 0, "applied": 0, "reviewed": 0}'::jsonb,
  
  -- Período
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(organization_id, training_id, module_id, period_start, period_end)
);

-- Índices para analytics
CREATE INDEX idx_notes_analytics_org ON public.training_notes_analytics(organization_id);
CREATE INDEX idx_notes_analytics_training ON public.training_notes_analytics(training_id);
CREATE INDEX idx_notes_analytics_period ON public.training_notes_analytics(period_start, period_end);

-- Habilitar RLS
ALTER TABLE public.training_notes_analytics ENABLE ROW LEVEL SECURITY;

-- Política: gestores podem ver analytics da organização
CREATE POLICY "Managers can view org analytics"
  ON public.training_notes_analytics
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_members
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'owner', 'manager')
    )
  );