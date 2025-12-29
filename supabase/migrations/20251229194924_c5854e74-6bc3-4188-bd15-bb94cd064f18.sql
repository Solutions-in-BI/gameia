-- =====================================================
-- EVOLUÇÃO DA LOJA: Sistema de Recompensas e Experiências
-- =====================================================

-- 1. Adicionar novos campos à tabela marketplace_items
ALTER TABLE public.marketplace_items 
ADD COLUMN IF NOT EXISTS item_type TEXT DEFAULT 'cosmetic',
ADD COLUMN IF NOT EXISTS expires_after_purchase INTEGER,
ADD COLUMN IF NOT EXISTS expires_after_use BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS requires_approval BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS usage_instructions TEXT,
ADD COLUMN IF NOT EXISTS max_uses INTEGER,
ADD COLUMN IF NOT EXISTS boost_type TEXT,
ADD COLUMN IF NOT EXISTS boost_value NUMERIC,
ADD COLUMN IF NOT EXISTS boost_duration_hours INTEGER,
ADD COLUMN IF NOT EXISTS available_for_orgs_only BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS configurable_by_org BOOLEAN DEFAULT false;

-- Comentários para documentação
COMMENT ON COLUMN public.marketplace_items.item_type IS 'Tipo: cosmetic, boost, title, experience, functional';
COMMENT ON COLUMN public.marketplace_items.expires_after_purchase IS 'Dias até expirar após compra (NULL = sem expiração)';
COMMENT ON COLUMN public.marketplace_items.expires_after_use IS 'Se expira após primeiro uso';
COMMENT ON COLUMN public.marketplace_items.requires_approval IS 'Se precisa aprovação do gestor';
COMMENT ON COLUMN public.marketplace_items.boost_type IS 'Tipo de boost: xp_multiplier, coins_multiplier, shield';
COMMENT ON COLUMN public.marketplace_items.boost_value IS 'Valor do multiplicador (1.5 = +50%)';
COMMENT ON COLUMN public.marketplace_items.boost_duration_hours IS 'Duração do boost em horas';

-- 2. Adicionar novos campos à tabela user_inventory
ALTER TABLE public.user_inventory 
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active',
ADD COLUMN IF NOT EXISTS used_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS uses_remaining INTEGER,
ADD COLUMN IF NOT EXISTS boost_active_until TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS approval_status TEXT,
ADD COLUMN IF NOT EXISTS approved_by UUID,
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Índice para buscar itens expirando
CREATE INDEX IF NOT EXISTS idx_user_inventory_expires_at 
ON public.user_inventory(expires_at) 
WHERE expires_at IS NOT NULL;

-- Índice para buscar boosts ativos
CREATE INDEX IF NOT EXISTS idx_user_inventory_boost_active 
ON public.user_inventory(boost_active_until) 
WHERE boost_active_until IS NOT NULL;

-- 3. Criar tabela experience_requests
CREATE TABLE IF NOT EXISTS public.experience_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  inventory_id UUID NOT NULL REFERENCES public.user_inventory(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  
  requested_at TIMESTAMPTZ DEFAULT now(),
  preferred_date DATE,
  notes TEXT,
  
  status TEXT DEFAULT 'pending',
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  
  completed_at TIMESTAMPTZ,
  completion_notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para experiências
CREATE INDEX IF NOT EXISTS idx_experience_requests_user 
ON public.experience_requests(user_id);

CREATE INDEX IF NOT EXISTS idx_experience_requests_org_status 
ON public.experience_requests(organization_id, status);

-- RLS para experience_requests
ALTER TABLE public.experience_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own experience requests"
ON public.experience_requests FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own experience requests"
ON public.experience_requests FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pending requests"
ON public.experience_requests FOR UPDATE
USING (auth.uid() = user_id AND status = 'pending');

CREATE POLICY "Managers can view org experience requests"
ON public.experience_requests FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.organization_id = experience_requests.organization_id
    AND ur.role IN ('admin', 'manager')
  )
);

CREATE POLICY "Managers can update org experience requests"
ON public.experience_requests FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.organization_id = experience_requests.organization_id
    AND ur.role IN ('admin', 'manager')
  )
);

-- 4. Criar tabela item_usage_log
CREATE TABLE IF NOT EXISTS public.item_usage_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  inventory_id UUID NOT NULL REFERENCES public.user_inventory(id) ON DELETE CASCADE,
  
  action TEXT NOT NULL,
  details JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Índice para histórico
CREATE INDEX IF NOT EXISTS idx_item_usage_log_user 
ON public.item_usage_log(user_id, created_at DESC);

-- RLS para item_usage_log
ALTER TABLE public.item_usage_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own usage log"
ON public.item_usage_log FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own usage log"
ON public.item_usage_log FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 5. Criar tabela organization_marketplace_config
CREATE TABLE IF NOT EXISTS public.organization_marketplace_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES public.marketplace_items(id) ON DELETE CASCADE,
  
  is_enabled BOOLEAN DEFAULT true,
  price_override INTEGER,
  custom_instructions TEXT,
  
  requires_manager_approval BOOLEAN DEFAULT true,
  auto_approve BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(organization_id, item_id)
);

-- RLS para organization_marketplace_config
ALTER TABLE public.organization_marketplace_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view enabled marketplace config"
ON public.organization_marketplace_config FOR SELECT
USING (is_enabled = true);

CREATE POLICY "Admins can manage org marketplace config"
ON public.organization_marketplace_config FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.organization_id = organization_marketplace_config.organization_id
    AND ur.role = 'admin'
  )
);

-- 6. Função para calcular expiração ao comprar item
CREATE OR REPLACE FUNCTION public.set_inventory_expiration()
RETURNS TRIGGER AS $$
DECLARE
  item_record RECORD;
BEGIN
  -- Busca dados do item
  SELECT expires_after_purchase, max_uses 
  INTO item_record
  FROM public.marketplace_items 
  WHERE id = NEW.item_id;
  
  -- Define expiração se aplicável
  IF item_record.expires_after_purchase IS NOT NULL THEN
    NEW.expires_at := NOW() + (item_record.expires_after_purchase || ' days')::INTERVAL;
  END IF;
  
  -- Define usos restantes se aplicável
  IF item_record.max_uses IS NOT NULL THEN
    NEW.uses_remaining := item_record.max_uses;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para aplicar expiração na compra
DROP TRIGGER IF EXISTS trigger_set_inventory_expiration ON public.user_inventory;
CREATE TRIGGER trigger_set_inventory_expiration
  BEFORE INSERT ON public.user_inventory
  FOR EACH ROW
  EXECUTE FUNCTION public.set_inventory_expiration();

-- 7. Função para ativar boost
CREATE OR REPLACE FUNCTION public.activate_boost(p_inventory_id UUID)
RETURNS JSONB AS $$
DECLARE
  inv_record RECORD;
  item_record RECORD;
  result JSONB;
BEGIN
  -- Busca inventário
  SELECT * INTO inv_record 
  FROM public.user_inventory 
  WHERE id = p_inventory_id AND user_id = auth.uid();
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'item_not_found');
  END IF;
  
  IF inv_record.status != 'active' THEN
    RETURN jsonb_build_object('success', false, 'error', 'item_not_active');
  END IF;
  
  IF inv_record.boost_active_until IS NOT NULL AND inv_record.boost_active_until > NOW() THEN
    RETURN jsonb_build_object('success', false, 'error', 'boost_already_active');
  END IF;
  
  -- Busca dados do item
  SELECT * INTO item_record 
  FROM public.marketplace_items 
  WHERE id = inv_record.item_id;
  
  IF item_record.item_type != 'boost' THEN
    RETURN jsonb_build_object('success', false, 'error', 'not_a_boost');
  END IF;
  
  -- Ativa o boost
  UPDATE public.user_inventory
  SET 
    boost_active_until = NOW() + (item_record.boost_duration_hours || ' hours')::INTERVAL,
    used_at = COALESCE(used_at, NOW()),
    uses_remaining = CASE 
      WHEN uses_remaining IS NOT NULL THEN uses_remaining - 1 
      ELSE NULL 
    END,
    status = CASE 
      WHEN item_record.expires_after_use THEN 'used'
      WHEN uses_remaining = 1 THEN 'used'
      ELSE 'active'
    END
  WHERE id = p_inventory_id;
  
  -- Registra uso
  INSERT INTO public.item_usage_log (user_id, inventory_id, action, details)
  VALUES (
    auth.uid(), 
    p_inventory_id, 
    'boost_activated',
    jsonb_build_object(
      'boost_type', item_record.boost_type,
      'boost_value', item_record.boost_value,
      'duration_hours', item_record.boost_duration_hours
    )
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'boost_type', item_record.boost_type,
    'boost_value', item_record.boost_value,
    'active_until', NOW() + (item_record.boost_duration_hours || ' hours')::INTERVAL
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. View para boosts ativos do usuário
CREATE OR REPLACE VIEW public.vw_active_boosts AS
SELECT 
  ui.id as inventory_id,
  ui.user_id,
  mi.name as item_name,
  mi.icon as item_icon,
  mi.boost_type,
  mi.boost_value,
  ui.boost_active_until,
  EXTRACT(EPOCH FROM (ui.boost_active_until - NOW())) / 3600 as hours_remaining
FROM public.user_inventory ui
JOIN public.marketplace_items mi ON mi.id = ui.item_id
WHERE ui.boost_active_until > NOW()
  AND mi.item_type = 'boost';

-- 9. View para itens expirando em breve (próximos 7 dias)
CREATE OR REPLACE VIEW public.vw_expiring_items AS
SELECT 
  ui.id as inventory_id,
  ui.user_id,
  mi.name as item_name,
  mi.icon as item_icon,
  mi.item_type,
  ui.expires_at,
  EXTRACT(EPOCH FROM (ui.expires_at - NOW())) / 86400 as days_remaining
FROM public.user_inventory ui
JOIN public.marketplace_items mi ON mi.id = ui.item_id
WHERE ui.expires_at IS NOT NULL
  AND ui.expires_at > NOW()
  AND ui.expires_at < NOW() + INTERVAL '7 days'
  AND ui.status = 'active';