-- Adicionar role 'owner' ao enum app_role
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'owner';

-- Criar tabela de permissões por área
CREATE TABLE IF NOT EXISTS public.area_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role public.app_role NOT NULL,
  area TEXT NOT NULL CHECK (area IN ('app', 'manage', 'console')),
  can_access BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(role, area)
);

-- Habilitar RLS
ALTER TABLE public.area_permissions ENABLE ROW LEVEL SECURITY;

-- Policy: Todos podem ler permissões de área (são configurações públicas)
CREATE POLICY "Anyone can read area permissions"
ON public.area_permissions
FOR SELECT
USING (true);

-- Policy: Apenas super_admin pode modificar
CREATE POLICY "Super admins can manage area permissions"
ON public.area_permissions
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

-- Inserir permissões padrão
INSERT INTO public.area_permissions (role, area, can_access) VALUES
  ('user', 'app', true),
  ('user', 'manage', false),
  ('user', 'console', false),
  ('manager', 'app', true),
  ('manager', 'manage', true),
  ('manager', 'console', false),
  ('admin', 'app', true),
  ('admin', 'manage', true),
  ('admin', 'console', true),
  ('super_admin', 'app', true),
  ('super_admin', 'manage', true),
  ('super_admin', 'console', true)
ON CONFLICT (role, area) DO NOTHING;

-- Função helper para verificar acesso a área
CREATE OR REPLACE FUNCTION public.can_access_area(_user_id uuid, _area text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.area_permissions ap ON ur.role = ap.role
    WHERE ur.user_id = _user_id
      AND ur.is_active = true
      AND ap.area = _area
      AND ap.can_access = true
      AND (ur.expires_at IS NULL OR ur.expires_at > now())
  )
$$;