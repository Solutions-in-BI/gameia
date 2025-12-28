-- =============================================
-- FASE 1: SEGURANÇA B2B - MIGRATION COMPLETA
-- =============================================

-- 1.1 CORRIGIR search_path EM TODAS AS FUNÇÕES
-- Recreate handle_new_user with proper search_path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, nickname)
  VALUES (
    NEW.id,
    COALESCE(
      (NEW.raw_user_meta_data->>'nickname')::text,
      split_part(NEW.email, '@', 1)
    )
  );
  RETURN NEW;
END;
$$;

-- Recreate update_updated_at_column with proper search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 1.2 SISTEMA DE ROLES ROBUSTO (tabela separada)
-- Create enum for app-wide roles
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('super_admin', 'admin', 'manager', 'user');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Create user_roles table (separada do profile por segurança)
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL DEFAULT 'user',
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  granted_by uuid REFERENCES auth.users(id),
  granted_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  is_active boolean NOT NULL DEFAULT true,
  UNIQUE (user_id, role, organization_id)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- SECURITY DEFINER function to check roles (evita recursão RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role, _org_id uuid DEFAULT NULL)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
      AND is_active = true
      AND (expires_at IS NULL OR expires_at > now())
      AND (_org_id IS NULL OR organization_id = _org_id OR organization_id IS NULL)
  )
$$;

-- Function to check if user has ANY admin-level role
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid, _org_id uuid DEFAULT NULL)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('super_admin', 'admin')
      AND is_active = true
      AND (expires_at IS NULL OR expires_at > now())
      AND (_org_id IS NULL OR organization_id = _org_id OR organization_id IS NULL)
  )
$$;

-- Function to get user's highest role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid, _org_id uuid DEFAULT NULL)
RETURNS public.app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
    AND is_active = true
    AND (expires_at IS NULL OR expires_at > now())
    AND (_org_id IS NULL OR organization_id = _org_id OR organization_id IS NULL)
  ORDER BY 
    CASE role 
      WHEN 'super_admin' THEN 1 
      WHEN 'admin' THEN 2 
      WHEN 'manager' THEN 3 
      ELSE 4 
    END
  LIMIT 1
$$;

-- RLS Policies for user_roles (only admins can manage)
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles in their org"
ON public.user_roles FOR SELECT
USING (
  public.is_admin(auth.uid(), organization_id)
);

CREATE POLICY "Super admins can manage all roles"
ON public.user_roles FOR ALL
USING (
  public.has_role(auth.uid(), 'super_admin', NULL)
);

CREATE POLICY "Org admins can manage roles in their org"
ON public.user_roles FOR INSERT
WITH CHECK (
  public.is_admin(auth.uid(), organization_id)
  AND role NOT IN ('super_admin')
);

CREATE POLICY "Org admins can update roles in their org"
ON public.user_roles FOR UPDATE
USING (
  public.is_admin(auth.uid(), organization_id)
  AND role NOT IN ('super_admin')
);

-- 1.4 AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  user_id uuid REFERENCES auth.users(id),
  organization_id uuid REFERENCES public.organizations(id),
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id text,
  old_values jsonb,
  new_values jsonb,
  ip_address inet,
  user_agent text,
  metadata jsonb
);

-- Enable RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Indexes for audit logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_org_id ON public.audit_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON public.audit_logs(resource_type, resource_id);

-- RLS for audit logs (admins only)
CREATE POLICY "Admins can view audit logs in their org"
ON public.audit_logs FOR SELECT
USING (
  public.is_admin(auth.uid(), organization_id)
  OR public.has_role(auth.uid(), 'super_admin', NULL)
);

CREATE POLICY "System can insert audit logs"
ON public.audit_logs FOR INSERT
WITH CHECK (true);

-- Function to log audit events (SECURITY DEFINER for system use)
CREATE OR REPLACE FUNCTION public.log_audit_event(
  _action text,
  _resource_type text,
  _resource_id text DEFAULT NULL,
  _old_values jsonb DEFAULT NULL,
  _new_values jsonb DEFAULT NULL,
  _org_id uuid DEFAULT NULL,
  _metadata jsonb DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _log_id uuid;
BEGIN
  INSERT INTO public.audit_logs (
    user_id,
    organization_id,
    action,
    resource_type,
    resource_id,
    old_values,
    new_values,
    metadata
  ) VALUES (
    auth.uid(),
    _org_id,
    _action,
    _resource_type,
    _resource_id,
    _old_values,
    _new_values,
    _metadata
  )
  RETURNING id INTO _log_id;
  
  RETURN _log_id;
END;
$$;

-- Indexes for user_roles
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_org_id ON public.user_roles(organization_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);

-- Grant org owner admin role automatically (trigger)
CREATE OR REPLACE FUNCTION public.grant_owner_admin_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role, organization_id, granted_by)
  VALUES (NEW.owner_id, 'admin', NEW.id, NEW.owner_id)
  ON CONFLICT (user_id, role, organization_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Trigger to auto-grant admin to org owners
DROP TRIGGER IF EXISTS on_org_created_grant_admin ON public.organizations;
CREATE TRIGGER on_org_created_grant_admin
  AFTER INSERT ON public.organizations
  FOR EACH ROW
  EXECUTE FUNCTION public.grant_owner_admin_role();