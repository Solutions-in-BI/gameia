-- Tabela para configuração de SSO por domínio
CREATE TABLE public.organization_sso_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  is_enabled BOOLEAN DEFAULT false,
  allowed_domains TEXT[] NOT NULL DEFAULT '{}',
  require_domain_match BOOLEAN DEFAULT true,
  auto_join_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(organization_id)
);

-- Habilitar RLS
ALTER TABLE public.organization_sso_config ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Admins can manage SSO config"
  ON public.organization_sso_config
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_members om
      WHERE om.organization_id = organization_sso_config.organization_id
      AND om.user_id = auth.uid()
      AND om.org_role IN ('owner', 'admin')
      AND om.is_active = true
    )
  );

CREATE POLICY "Members can view SSO config"
  ON public.organization_sso_config
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_members om
      WHERE om.organization_id = organization_sso_config.organization_id
      AND om.user_id = auth.uid()
      AND om.is_active = true
    )
  );

-- Função para validar email contra domínios permitidos
CREATE OR REPLACE FUNCTION public.validate_email_domain(
  p_email TEXT,
  p_organization_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_config RECORD;
  v_email_domain TEXT;
BEGIN
  -- Extrair domínio do email
  v_email_domain := LOWER(SPLIT_PART(p_email, '@', 2));
  
  -- Buscar configuração SSO
  SELECT * INTO v_config
  FROM organization_sso_config
  WHERE organization_id = p_organization_id;
  
  -- Se não há config ou SSO desabilitado, permite qualquer email
  IF v_config IS NULL OR NOT v_config.is_enabled THEN
    RETURN TRUE;
  END IF;
  
  -- Se require_domain_match está ativo, valida o domínio
  IF v_config.require_domain_match THEN
    RETURN v_email_domain = ANY(v_config.allowed_domains);
  END IF;
  
  RETURN TRUE;
END;
$$;

-- Trigger para updated_at
CREATE TRIGGER update_organization_sso_config_updated_at
  BEFORE UPDATE ON public.organization_sso_config
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Índice para performance
CREATE INDEX idx_organization_sso_config_org ON public.organization_sso_config(organization_id);