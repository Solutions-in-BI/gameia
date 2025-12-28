-- ============================================
-- SISTEMA DE NOTIFICAÇÕES
-- ============================================

-- Tabela de notificações do usuário
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  type TEXT NOT NULL, -- 'invite', 'friend_request', 'gift', 'achievement', 'challenge', etc.
  title TEXT NOT NULL,
  message TEXT,
  data JSONB DEFAULT '{}'::jsonb, -- dados extras (ex: invite_id, friend_id, etc.)
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  read_at TIMESTAMPTZ
);

-- Índices para performance
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_unread ON public.notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX idx_notifications_created ON public.notifications(created_at DESC);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Políticas: usuário só vê/gerencia suas notificações
CREATE POLICY "Users can view their notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their notifications"
  ON public.notifications FOR DELETE
  USING (auth.uid() = user_id);

-- System/triggers podem inserir
CREATE POLICY "System can insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- ============================================
-- RATE LIMITING PARA CONVITES
-- ============================================

-- Tabela para rastrear tentativas de uso de convite
CREATE TABLE public.invite_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address TEXT,
  user_id UUID,
  invite_code TEXT NOT NULL,
  attempted_at TIMESTAMPTZ DEFAULT now(),
  success BOOLEAN DEFAULT false
);

-- Índice para buscar tentativas recentes
CREATE INDEX idx_invite_attempts_ip ON public.invite_attempts(ip_address, attempted_at DESC);
CREATE INDEX idx_invite_attempts_user ON public.invite_attempts(user_id, attempted_at DESC);

-- Enable RLS (apenas sistema pode acessar)
ALTER TABLE public.invite_attempts ENABLE ROW LEVEL SECURITY;

-- Apenas funções SECURITY DEFINER podem inserir/consultar
CREATE POLICY "System only access"
  ON public.invite_attempts
  USING (false)
  WITH CHECK (false);

-- ============================================
-- FUNÇÃO MELHORADA PARA ACEITAR CONVITE COM RATE LIMITING
-- ============================================

CREATE OR REPLACE FUNCTION public.accept_invite_with_rate_limit(
  p_invite_code TEXT,
  p_client_ip TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_invite RECORD;
  v_user_id UUID := auth.uid();
  v_attempt_count INT;
  v_max_attempts INT := 5;
  v_window_minutes INT := 15;
BEGIN
  -- Verifica se usuário está autenticado
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Não autenticado');
  END IF;

  -- Rate limiting por usuário (últimas tentativas)
  SELECT COUNT(*) INTO v_attempt_count
  FROM public.invite_attempts
  WHERE user_id = v_user_id
    AND attempted_at > now() - (v_window_minutes || ' minutes')::interval
    AND success = false;

  IF v_attempt_count >= v_max_attempts THEN
    -- Registra tentativa bloqueada
    INSERT INTO public.invite_attempts (user_id, ip_address, invite_code, success)
    VALUES (v_user_id, p_client_ip, p_invite_code, false);
    
    RETURN jsonb_build_object(
      'success', false, 
      'error', 'Muitas tentativas. Aguarde ' || v_window_minutes || ' minutos.',
      'rate_limited', true,
      'retry_after_minutes', v_window_minutes
    );
  END IF;

  -- Busca convite válido
  SELECT * INTO v_invite
  FROM public.organization_invites
  WHERE invite_code = p_invite_code
    AND used_at IS NULL
    AND expires_at > now();

  -- Registra tentativa
  INSERT INTO public.invite_attempts (user_id, ip_address, invite_code, success)
  VALUES (v_user_id, p_client_ip, p_invite_code, v_invite IS NOT NULL);

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Convite inválido ou expirado');
  END IF;

  -- Verifica se email bate (se especificado)
  IF v_invite.email IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = v_user_id AND email = v_invite.email) THEN
      RETURN jsonb_build_object('success', false, 'error', 'Este convite é para outro email');
    END IF;
  END IF;

  -- Verifica se já é membro
  IF EXISTS (
    SELECT 1 FROM public.organization_members 
    WHERE organization_id = v_invite.organization_id AND user_id = v_user_id
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Você já é membro desta organização');
  END IF;

  -- Adiciona como membro
  INSERT INTO public.organization_members (organization_id, user_id, org_role)
  VALUES (v_invite.organization_id, v_user_id, v_invite.role);

  -- Atualiza perfil com organização atual
  UPDATE public.profiles 
  SET current_organization_id = v_invite.organization_id 
  WHERE id = v_user_id;

  -- Marca convite como usado
  UPDATE public.organization_invites 
  SET used_at = now(), used_by = v_user_id 
  WHERE id = v_invite.id;

  -- Cria notificação para o usuário
  INSERT INTO public.notifications (user_id, type, title, message, data)
  VALUES (
    v_user_id,
    'invite_accepted',
    'Bem-vindo à equipe! 🎉',
    'Você agora faz parte da organização.',
    jsonb_build_object('organization_id', v_invite.organization_id)
  );

  -- Notifica o criador do convite
  INSERT INTO public.notifications (user_id, type, title, message, data)
  VALUES (
    v_invite.created_by,
    'invite_used',
    'Convite aceito!',
    'Um novo membro entrou na organização.',
    jsonb_build_object('organization_id', v_invite.organization_id, 'new_member_id', v_user_id)
  );

  RETURN jsonb_build_object(
    'success', true, 
    'organization_id', v_invite.organization_id
  );
END;
$$;

-- ============================================
-- FUNÇÃO PARA CRIAR CONVITE COM LINK
-- ============================================

CREATE OR REPLACE FUNCTION public.create_org_invite(
  p_organization_id UUID,
  p_email TEXT DEFAULT NULL,
  p_role TEXT DEFAULT 'member',
  p_expires_in_days INT DEFAULT 7
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_invite_code TEXT;
  v_invite_id UUID;
BEGIN
  -- Verifica se é admin da org
  IF NOT public.is_org_admin(v_user_id, p_organization_id) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Sem permissão para criar convites');
  END IF;

  -- Gera código único
  v_invite_code := encode(gen_random_bytes(16), 'hex');

  -- Cria convite
  INSERT INTO public.organization_invites (
    organization_id,
    created_by,
    email,
    invite_code,
    role,
    expires_at
  )
  VALUES (
    p_organization_id,
    v_user_id,
    p_email,
    v_invite_code,
    p_role::public.org_role,
    now() + (p_expires_in_days || ' days')::interval
  )
  RETURNING id INTO v_invite_id;

  RETURN jsonb_build_object(
    'success', true,
    'invite_id', v_invite_id,
    'invite_code', v_invite_code,
    'expires_at', now() + (p_expires_in_days || ' days')::interval
  );
END;
$$;

-- ============================================
-- FUNÇÃO PARA LISTAR CONVITES DA ORG
-- ============================================

CREATE OR REPLACE FUNCTION public.list_org_invites(p_organization_id UUID)
RETURNS TABLE (
  id UUID,
  email TEXT,
  invite_code TEXT,
  role TEXT,
  created_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  used_at TIMESTAMPTZ,
  used_by UUID,
  is_expired BOOLEAN,
  is_used BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Verifica se é admin da org
  IF NOT public.is_org_admin(auth.uid(), p_organization_id) THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT 
    i.id,
    i.email,
    i.invite_code,
    i.role::text,
    i.created_at,
    i.expires_at,
    i.used_at,
    i.used_by,
    i.expires_at < now() AS is_expired,
    i.used_at IS NOT NULL AS is_used
  FROM public.organization_invites i
  WHERE i.organization_id = p_organization_id
  ORDER BY i.created_at DESC;
END;
$$;

-- ============================================
-- FUNÇÃO PARA REVOGAR CONVITE
-- ============================================

CREATE OR REPLACE FUNCTION public.revoke_org_invite(p_invite_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_org_id UUID;
BEGIN
  -- Busca org do convite
  SELECT organization_id INTO v_org_id
  FROM public.organization_invites
  WHERE id = p_invite_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Convite não encontrado');
  END IF;

  -- Verifica se é admin
  IF NOT public.is_org_admin(auth.uid(), v_org_id) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Sem permissão');
  END IF;

  -- Revoga (marca como expirado)
  UPDATE public.organization_invites
  SET expires_at = now() - interval '1 second'
  WHERE id = p_invite_id;

  RETURN jsonb_build_object('success', true);
END;
$$;