-- ===========================================
-- FASE 1, 2 e 3: Unificação do Sistema
-- ===========================================

-- 1. Atualizar enum de commitment_scope para incluir 'personal'
ALTER TYPE commitment_scope ADD VALUE IF NOT EXISTS 'personal';

-- 2. Criar tabela de "Torcida" (supporters) para engajamento
CREATE TABLE IF NOT EXISTS public.challenge_supporters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  commitment_id UUID NOT NULL REFERENCES commitments(id) ON DELETE CASCADE,
  supporter_id UUID NOT NULL,
  coins_staked INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reward_claimed BOOLEAN NOT NULL DEFAULT false,
  UNIQUE(commitment_id, supporter_id)
);

-- Enable RLS
ALTER TABLE public.challenge_supporters ENABLE ROW LEVEL SECURITY;

-- RLS Policies for challenge_supporters
CREATE POLICY "Users can view supporters of commitments in their org"
ON public.challenge_supporters FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM commitments c
    JOIN organization_members om ON om.organization_id = c.organization_id
    WHERE c.id = commitment_id AND om.user_id = auth.uid()
  )
);

CREATE POLICY "Users can support commitments"
ON public.challenge_supporters FOR INSERT
WITH CHECK (supporter_id = auth.uid());

CREATE POLICY "Users can update their own support"
ON public.challenge_supporters FOR UPDATE
USING (supporter_id = auth.uid());

CREATE POLICY "Users can remove their own support"
ON public.challenge_supporters FOR DELETE
USING (supporter_id = auth.uid());

-- 3. Adicionar campos para sistema de torcida em commitments
ALTER TABLE public.commitments 
ADD COLUMN IF NOT EXISTS supporter_multiplier NUMERIC(3,2) DEFAULT 1.0,
ADD COLUMN IF NOT EXISTS total_staked INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS supporters_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS icon VARCHAR(50) DEFAULT 'target';

-- 4. Criar view para facilitar consultas de desafios com estatísticas
CREATE OR REPLACE VIEW public.vw_challenges_with_stats AS
SELECT 
  c.*,
  COALESCE(cs.supporters_count, 0) as calculated_supporters_count,
  COALESCE(cs.total_staked, 0) as calculated_total_staked,
  CASE 
    WHEN c.target_value > 0 THEN ROUND((c.current_value::numeric / c.target_value::numeric) * 100, 1)
    ELSE 0 
  END as progress_percentage
FROM commitments c
LEFT JOIN (
  SELECT 
    commitment_id,
    COUNT(*) as supporters_count,
    COALESCE(SUM(coins_staked), 0) as total_staked
  FROM challenge_supporters
  GROUP BY commitment_id
) cs ON cs.commitment_id = c.id;

-- 5. Função para calcular multiplicador de recompensa baseado na torcida
CREATE OR REPLACE FUNCTION public.calculate_supporter_multiplier(p_commitment_id UUID)
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_supporters_count INTEGER;
  v_multiplier NUMERIC;
BEGIN
  SELECT COUNT(*) INTO v_supporters_count
  FROM challenge_supporters
  WHERE commitment_id = p_commitment_id;
  
  -- Cada 5 apoiadores = +0.1x no multiplicador (máximo 2.0x)
  v_multiplier := 1.0 + LEAST((v_supporters_count / 5) * 0.1, 1.0);
  
  -- Atualiza o compromisso
  UPDATE commitments 
  SET supporter_multiplier = v_multiplier,
      supporters_count = v_supporters_count
  WHERE id = p_commitment_id;
  
  RETURN v_multiplier;
END;
$$;

-- 6. Trigger para atualizar multiplicador quando alguém apoia
CREATE OR REPLACE FUNCTION public.update_supporter_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Atualiza total_staked e recalcula multiplicador
    UPDATE commitments 
    SET total_staked = total_staked + NEW.coins_staked,
        supporters_count = supporters_count + 1,
        supporter_multiplier = 1.0 + LEAST(((supporters_count + 1) / 5) * 0.1, 1.0)
    WHERE id = NEW.commitment_id;
    
    -- Deduz moedas do apoiador
    UPDATE user_stats
    SET coins = coins - NEW.coins_staked
    WHERE user_id = NEW.supporter_id;
    
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Reverte stats se remover apoio antes do fim
    UPDATE commitments 
    SET total_staked = GREATEST(total_staked - OLD.coins_staked, 0),
        supporters_count = GREATEST(supporters_count - 1, 0),
        supporter_multiplier = 1.0 + LEAST((GREATEST(supporters_count - 1, 0) / 5) * 0.1, 1.0)
    WHERE id = OLD.commitment_id;
    
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_update_supporter_stats ON public.challenge_supporters;
CREATE TRIGGER trg_update_supporter_stats
AFTER INSERT OR DELETE ON public.challenge_supporters
FOR EACH ROW
EXECUTE FUNCTION public.update_supporter_stats();

-- 7. Função para distribuir recompensas quando compromisso é completado
CREATE OR REPLACE FUNCTION public.distribute_challenge_rewards(p_commitment_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_commitment RECORD;
  v_supporter RECORD;
  v_reward_per_supporter INTEGER;
  v_participant RECORD;
BEGIN
  -- Busca compromisso
  SELECT * INTO v_commitment 
  FROM commitments 
  WHERE id = p_commitment_id AND status = 'completed';
  
  IF NOT FOUND THEN
    RETURN;
  END IF;
  
  -- Calcula recompensa por apoiador (retorna aposta + 50% do pool dividido)
  IF v_commitment.supporters_count > 0 THEN
    v_reward_per_supporter := (v_commitment.total_staked / v_commitment.supporters_count) + 
                              (v_commitment.total_staked * 50 / 100 / v_commitment.supporters_count);
  END IF;
  
  -- Distribui para apoiadores
  FOR v_supporter IN 
    SELECT * FROM challenge_supporters 
    WHERE commitment_id = p_commitment_id AND NOT reward_claimed
  LOOP
    UPDATE user_stats 
    SET coins = coins + v_supporter.coins_staked + (v_reward_per_supporter - v_supporter.coins_staked)
    WHERE user_id = v_supporter.supporter_id;
    
    UPDATE challenge_supporters 
    SET reward_claimed = true 
    WHERE id = v_supporter.id;
  END LOOP;
  
  -- Distribui para participantes (com multiplicador)
  FOR v_participant IN 
    SELECT * FROM commitment_participants 
    WHERE commitment_id = p_commitment_id AND NOT reward_claimed
  LOOP
    UPDATE user_stats 
    SET xp = xp + FLOOR(v_commitment.xp_reward * v_commitment.supporter_multiplier),
        coins = coins + FLOOR(v_commitment.coins_reward * v_commitment.supporter_multiplier)
    WHERE user_id = v_participant.user_id;
    
    UPDATE commitment_participants 
    SET reward_claimed = true 
    WHERE id = v_participant.id;
  END LOOP;
END;
$$;