-- Função para registrar atividade automaticamente
CREATE OR REPLACE FUNCTION public.log_user_activity(
  p_user_id UUID,
  p_activity_type TEXT,
  p_game_type TEXT DEFAULT NULL,
  p_xp_earned INTEGER DEFAULT 0,
  p_coins_earned INTEGER DEFAULT 0,
  p_score INTEGER DEFAULT 0,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_org_id UUID;
  v_activity_id UUID;
BEGIN
  -- Buscar organization_id do perfil do usuário
  SELECT current_organization_id INTO v_org_id
  FROM profiles
  WHERE id = p_user_id;

  -- Inserir log de atividade
  INSERT INTO user_activity_log (
    user_id,
    organization_id,
    activity_type,
    game_type,
    xp_earned,
    coins_earned,
    score,
    metadata
  ) VALUES (
    p_user_id,
    v_org_id,
    p_activity_type,
    p_game_type,
    p_xp_earned,
    p_coins_earned,
    p_score,
    p_metadata
  )
  RETURNING id INTO v_activity_id;

  RETURN v_activity_id;
END;
$$;

-- Trigger para copiar organization_id para user_xp_history
CREATE OR REPLACE FUNCTION public.set_org_id_on_xp_history()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Se organization_id não foi definido, buscar do perfil
  IF NEW.organization_id IS NULL THEN
    SELECT current_organization_id INTO NEW.organization_id
    FROM profiles
    WHERE id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Aplicar trigger na tabela user_xp_history (se existir)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_xp_history' AND table_schema = 'public') THEN
    DROP TRIGGER IF EXISTS trg_set_org_id_on_xp_history ON user_xp_history;
    CREATE TRIGGER trg_set_org_id_on_xp_history
      BEFORE INSERT ON user_xp_history
      FOR EACH ROW
      EXECUTE FUNCTION set_org_id_on_xp_history();
  END IF;
END;
$$;

-- Trigger para copiar organization_id para user_streaks
CREATE OR REPLACE FUNCTION public.set_org_id_on_streaks()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.organization_id IS NULL THEN
    SELECT current_organization_id INTO NEW.organization_id
    FROM profiles
    WHERE id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_set_org_id_on_streaks ON user_streaks;
CREATE TRIGGER trg_set_org_id_on_streaks
  BEFORE INSERT OR UPDATE ON user_streaks
  FOR EACH ROW
  EXECUTE FUNCTION set_org_id_on_streaks();

-- Atualizar streaks existentes com organization_id
UPDATE user_streaks us
SET organization_id = p.current_organization_id
FROM profiles p
WHERE us.user_id = p.id
  AND us.organization_id IS NULL
  AND p.current_organization_id IS NOT NULL;

-- Atualizar user_activity_log existentes com organization_id
UPDATE user_activity_log ual
SET organization_id = p.current_organization_id
FROM profiles p
WHERE ual.user_id = p.id
  AND ual.organization_id IS NULL
  AND p.current_organization_id IS NOT NULL;

-- Dar permissão para usuários autenticados usarem a função
GRANT EXECUTE ON FUNCTION public.log_user_activity TO authenticated;