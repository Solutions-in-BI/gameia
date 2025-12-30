-- Tabela para configurar itens como recompensa de desafios/metas/treinamentos
CREATE TABLE public.reward_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_type TEXT NOT NULL CHECK (source_type IN ('challenge', 'training', 'goal')),
  source_id UUID NOT NULL,
  item_id UUID REFERENCES public.marketplace_items(id) ON DELETE CASCADE,
  category TEXT,
  unlock_mode TEXT NOT NULL DEFAULT 'auto_unlock' CHECK (unlock_mode IN ('auto_unlock', 'enable_purchase')),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT check_item_or_category CHECK (item_id IS NOT NULL OR category IS NOT NULL)
);

-- Índices para buscas
CREATE INDEX idx_reward_items_source ON public.reward_items(source_type, source_id);
CREATE INDEX idx_reward_items_org ON public.reward_items(organization_id);

-- RLS
ALTER TABLE public.reward_items ENABLE ROW LEVEL SECURITY;

-- Política: membros da org podem ver
CREATE POLICY "Members can view reward items"
ON public.reward_items FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id FROM public.organization_members 
    WHERE user_id = auth.uid()
  )
);

-- Política: admins podem gerenciar
CREATE POLICY "Admins can manage reward items"
ON public.reward_items FOR ALL
USING (
  organization_id IN (
    SELECT organization_id FROM public.organization_members 
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
  )
);

-- Adicionar coluna reward_items em commitments
ALTER TABLE public.commitments 
ADD COLUMN IF NOT EXISTS reward_items JSONB DEFAULT '[]'::jsonb;

-- Adicionar coluna reward_items em trainings
ALTER TABLE public.trainings 
ADD COLUMN IF NOT EXISTS reward_items JSONB DEFAULT '[]'::jsonb;

-- Tabela para rastrear itens liberados para compra (não inventário direto)
CREATE TABLE public.user_unlocked_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES public.marketplace_items(id) ON DELETE CASCADE,
  source_type TEXT NOT NULL,
  source_id UUID NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT now(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  UNIQUE(user_id, item_id)
);

-- RLS para user_unlocked_items
ALTER TABLE public.user_unlocked_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own unlocked items"
ON public.user_unlocked_items FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "System can insert unlocked items"
ON public.user_unlocked_items FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Índices
CREATE INDEX idx_user_unlocked_items_user ON public.user_unlocked_items(user_id);
CREATE INDEX idx_user_unlocked_items_item ON public.user_unlocked_items(item_id);