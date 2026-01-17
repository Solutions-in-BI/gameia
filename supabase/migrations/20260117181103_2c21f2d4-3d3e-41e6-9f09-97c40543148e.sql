-- =====================================================
-- GAMEIA: Consolidação do Sistema de Desafios
-- =====================================================

-- 1. Adicionar novos campos na tabela commitments
ALTER TABLE public.commitments 
ADD COLUMN IF NOT EXISTS challenge_type text DEFAULT 'practical',
ADD COLUMN IF NOT EXISTS origin_source text DEFAULT 'manual',
ADD COLUMN IF NOT EXISTS origin_id uuid,
ADD COLUMN IF NOT EXISTS proof_type text DEFAULT 'checkin',
ADD COLUMN IF NOT EXISTS diamonds_reward integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS context_why text,
ADD COLUMN IF NOT EXISTS is_overdue boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS last_reminder_at timestamptz,
ADD COLUMN IF NOT EXISTS skill_ids uuid[] DEFAULT '{}';

-- 2. Criar tabela de evidências/comprovações de desafios
CREATE TABLE IF NOT EXISTS public.challenge_proofs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  commitment_id uuid NOT NULL REFERENCES public.commitments(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  proof_type text NOT NULL CHECK (proof_type IN ('checkin', 'text', 'file', 'link', 'metric')),
  content text,
  file_url text,
  submitted_at timestamptz DEFAULT now(),
  approved_at timestamptz,
  approved_by uuid,
  created_at timestamptz DEFAULT now()
);

-- 3. Habilitar RLS na tabela challenge_proofs
ALTER TABLE public.challenge_proofs ENABLE ROW LEVEL SECURITY;

-- 4. Políticas RLS para challenge_proofs
CREATE POLICY "Users can view their own proofs"
ON public.challenge_proofs FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can view proofs of challenges they participate in"
ON public.challenge_proofs FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.commitment_participants cp
    WHERE cp.commitment_id = challenge_proofs.commitment_id
    AND cp.user_id = auth.uid()
  )
);

CREATE POLICY "Users can submit proofs for challenges they participate in"
ON public.challenge_proofs FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM public.commitment_participants cp
    WHERE cp.commitment_id = challenge_proofs.commitment_id
    AND cp.user_id = auth.uid()
  )
);

CREATE POLICY "Managers can approve proofs"
ON public.challenge_proofs FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.commitments c
    JOIN public.organization_members om ON om.organization_id = c.organization_id
    WHERE c.id = challenge_proofs.commitment_id
    AND om.user_id = auth.uid()
    AND om.role IN ('admin', 'manager')
  )
);

-- 5. Índices para performance
CREATE INDEX IF NOT EXISTS idx_challenge_proofs_commitment ON public.challenge_proofs(commitment_id);
CREATE INDEX IF NOT EXISTS idx_challenge_proofs_user ON public.challenge_proofs(user_id);
CREATE INDEX IF NOT EXISTS idx_commitments_challenge_type ON public.commitments(challenge_type);
CREATE INDEX IF NOT EXISTS idx_commitments_origin_source ON public.commitments(origin_source);
CREATE INDEX IF NOT EXISTS idx_commitments_is_overdue ON public.commitments(is_overdue) WHERE is_overdue = true;

-- 6. Função para marcar desafios como atrasados
CREATE OR REPLACE FUNCTION public.update_overdue_challenges()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.commitments
  SET is_overdue = true, updated_at = now()
  WHERE status = 'active'
    AND ends_at < now()
    AND is_overdue = false;
END;
$$;

-- 7. Função para sincronizar desafios com próximos passos
CREATE OR REPLACE FUNCTION public.sync_challenge_to_next_steps()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_participant RECORD;
BEGIN
  -- Se o desafio foi ativado ou tem prazo atualizado
  IF (TG_OP = 'INSERT' AND NEW.status = 'active') 
     OR (TG_OP = 'UPDATE' AND OLD.status != 'active' AND NEW.status = 'active')
     OR (TG_OP = 'UPDATE' AND NEW.ends_at != OLD.ends_at) THEN
    
    -- Para cada participante, criar/atualizar próximo passo
    FOR v_participant IN 
      SELECT user_id FROM public.commitment_participants WHERE commitment_id = NEW.id
    LOOP
      INSERT INTO public.user_next_steps (
        user_id,
        step_type,
        source_type,
        source_id,
        title,
        description,
        deadline,
        priority,
        organization_id
      ) VALUES (
        v_participant.user_id,
        'challenge',
        'commitment',
        NEW.id,
        NEW.name,
        NEW.description,
        NEW.ends_at,
        CASE 
          WHEN NEW.ends_at <= now() + interval '1 day' THEN 'high'
          WHEN NEW.ends_at <= now() + interval '3 days' THEN 'medium'
          ELSE 'low'
        END,
        NEW.organization_id
      )
      ON CONFLICT (source_type, source_id, user_id) 
      DO UPDATE SET
        title = EXCLUDED.title,
        deadline = EXCLUDED.deadline,
        priority = EXCLUDED.priority,
        updated_at = now();
    END LOOP;
  END IF;

  -- Se o desafio foi concluído ou cancelado, remover dos próximos passos
  IF TG_OP = 'UPDATE' AND NEW.status IN ('completed', 'cancelled', 'failed') AND OLD.status = 'active' THEN
    DELETE FROM public.user_next_steps 
    WHERE source_type = 'commitment' AND source_id = NEW.id;
  END IF;

  RETURN NEW;
END;
$$;

-- 8. Trigger para sincronização automática
DROP TRIGGER IF EXISTS trg_sync_challenge_next_steps ON public.commitments;
CREATE TRIGGER trg_sync_challenge_next_steps
AFTER INSERT OR UPDATE ON public.commitments
FOR EACH ROW
EXECUTE FUNCTION public.sync_challenge_to_next_steps();

-- 9. Adicionar coluna diamonds na tabela user_stats se não existir
ALTER TABLE public.user_stats 
ADD COLUMN IF NOT EXISTS diamonds integer DEFAULT 0;

-- 10. Habilitar realtime para challenge_proofs
ALTER PUBLICATION supabase_realtime ADD TABLE public.challenge_proofs;