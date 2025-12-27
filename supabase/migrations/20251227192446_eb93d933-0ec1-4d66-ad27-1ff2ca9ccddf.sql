-- Enum para roles da empresa
CREATE TYPE public.org_role AS ENUM ('owner', 'admin', 'manager', 'member');

-- Tabela de convites de empresa
CREATE TABLE public.organization_invites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  email TEXT,
  invite_code TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  role org_role NOT NULL DEFAULT 'member',
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '7 days'),
  used_at TIMESTAMP WITH TIME ZONE,
  used_by UUID,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices para performance
CREATE INDEX idx_invites_org ON public.organization_invites(organization_id);
CREATE INDEX idx_invites_email ON public.organization_invites(email);
CREATE INDEX idx_invites_code ON public.organization_invites(invite_code);

-- Habilitar RLS
ALTER TABLE public.organization_invites ENABLE ROW LEVEL SECURITY;

-- Policies: Admins podem gerenciar convites da org
CREATE POLICY "Admins can view org invites"
ON public.organization_invites
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM organizations o 
    WHERE o.id = organization_invites.organization_id 
    AND o.owner_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM organization_members om 
    WHERE om.organization_id = organization_invites.organization_id 
    AND om.user_id = auth.uid() 
    AND om.role IN ('admin', 'manager')
  )
);

CREATE POLICY "Admins can create invites"
ON public.organization_invites
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM organizations o 
    WHERE o.id = organization_invites.organization_id 
    AND o.owner_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM organization_members om 
    WHERE om.organization_id = organization_invites.organization_id 
    AND om.user_id = auth.uid() 
    AND om.role IN ('admin', 'manager')
  )
);

CREATE POLICY "Admins can update invites"
ON public.organization_invites
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM organizations o 
    WHERE o.id = organization_invites.organization_id 
    AND o.owner_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM organization_members om 
    WHERE om.organization_id = organization_invites.organization_id 
    AND om.user_id = auth.uid() 
    AND om.role IN ('admin', 'manager')
  )
);

CREATE POLICY "Admins can delete invites"
ON public.organization_invites
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM organizations o 
    WHERE o.id = organization_invites.organization_id 
    AND o.owner_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM organization_members om 
    WHERE om.organization_id = organization_invites.organization_id 
    AND om.user_id = auth.uid() 
    AND om.role IN ('admin', 'manager')
  )
);

-- Política para usuários usarem convite pelo código (leitura pública do código)
CREATE POLICY "Anyone can view invite by code"
ON public.organization_invites
FOR SELECT
USING (
  invite_code IS NOT NULL 
  AND used_at IS NULL 
  AND expires_at > now()
);

-- Atualizar coluna role de organization_members para usar o enum
-- Primeiro, vamos criar uma nova coluna
ALTER TABLE public.organization_members ADD COLUMN org_role org_role DEFAULT 'member';

-- Migrar dados existentes
UPDATE public.organization_members SET org_role = 
  CASE 
    WHEN role = 'admin' THEN 'admin'::org_role
    WHEN role = 'owner' THEN 'owner'::org_role
    WHEN role = 'manager' THEN 'manager'::org_role
    ELSE 'member'::org_role
  END;

-- Função para verificar se usuário é admin de alguma org
CREATE OR REPLACE FUNCTION public.is_org_admin(_user_id uuid, _org_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM organizations WHERE id = _org_id AND owner_id = _user_id
  )
  OR EXISTS (
    SELECT 1 FROM organization_members 
    WHERE organization_id = _org_id 
    AND user_id = _user_id 
    AND org_role IN ('admin', 'owner')
  )
$$;

-- Função para aceitar convite
CREATE OR REPLACE FUNCTION public.accept_invite(p_invite_code text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_invite record;
  v_user_id uuid := auth.uid();
BEGIN
  -- Buscar convite válido
  SELECT * INTO v_invite
  FROM organization_invites
  WHERE invite_code = p_invite_code
    AND used_at IS NULL
    AND expires_at > now();
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Convite inválido ou expirado');
  END IF;
  
  -- Verificar se email bate (se especificado)
  IF v_invite.email IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = v_user_id AND email = v_invite.email) THEN
      RETURN jsonb_build_object('success', false, 'error', 'Este convite é para outro email');
    END IF;
  END IF;
  
  -- Verificar se já é membro
  IF EXISTS (
    SELECT 1 FROM organization_members 
    WHERE organization_id = v_invite.organization_id AND user_id = v_user_id
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Você já é membro desta organização');
  END IF;
  
  -- Adicionar como membro
  INSERT INTO organization_members (organization_id, user_id, org_role)
  VALUES (v_invite.organization_id, v_user_id, v_invite.role);
  
  -- Atualizar perfil com organização atual
  UPDATE profiles SET current_organization_id = v_invite.organization_id WHERE id = v_user_id;
  
  -- Marcar convite como usado
  UPDATE organization_invites 
  SET used_at = now(), used_by = v_user_id 
  WHERE id = v_invite.id;
  
  RETURN jsonb_build_object('success', true, 'organization_id', v_invite.organization_id);
END;
$$;