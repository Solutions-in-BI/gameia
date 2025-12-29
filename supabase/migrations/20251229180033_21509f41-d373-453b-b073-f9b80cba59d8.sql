-- Adicionar campos de recompensa em cognitive_tests
ALTER TABLE public.cognitive_tests 
ADD COLUMN IF NOT EXISTS coins_reward integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS target_score integer DEFAULT 70,
ADD COLUMN IF NOT EXISTS reward_rules jsonb DEFAULT '{"type": "conditional", "metric": "accuracy", "target": 0.7}'::jsonb;

-- Adicionar campo de regras de recompensa em trainings
ALTER TABLE public.trainings 
ADD COLUMN IF NOT EXISTS reward_rules jsonb DEFAULT '{"type": "fixed"}'::jsonb;

-- Adicionar campo de regras de recompensa em training_modules
ALTER TABLE public.training_modules 
ADD COLUMN IF NOT EXISTS xp_reward integer DEFAULT 25,
ADD COLUMN IF NOT EXISTS coins_reward integer DEFAULT 10;

-- Criar tabela de histórico de recompensas
CREATE TABLE IF NOT EXISTS public.reward_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  source_type text NOT NULL, -- 'training' | 'cognitive_test' | 'game' | 'challenge' | 'module'
  source_id uuid NOT NULL,
  xp_earned integer NOT NULL DEFAULT 0,
  coins_earned integer NOT NULL DEFAULT 0,
  performance_score numeric, -- score obtido (0-100)
  target_score numeric, -- meta exigida
  target_met boolean DEFAULT true,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  organization_id uuid REFERENCES public.organizations(id)
);

-- Habilitar RLS
ALTER TABLE public.reward_history ENABLE ROW LEVEL SECURITY;

-- Política para usuários verem seu próprio histórico
CREATE POLICY "Users can view own reward history"
ON public.reward_history
FOR SELECT
USING (auth.uid() = user_id);

-- Política para inserir próprio histórico
CREATE POLICY "Users can insert own reward history"
ON public.reward_history
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_reward_history_user_id ON public.reward_history(user_id);
CREATE INDEX IF NOT EXISTS idx_reward_history_source ON public.reward_history(source_type, source_id);
CREATE INDEX IF NOT EXISTS idx_reward_history_created_at ON public.reward_history(created_at DESC);

-- Habilitar realtime para reward_history
ALTER PUBLICATION supabase_realtime ADD TABLE public.reward_history;

COMMENT ON TABLE public.reward_history IS 'Histórico de recompensas ganhas por usuários em diferentes experiências';