-- Adicionar campos de configuração em camadas na tabela game_configurations
ALTER TABLE game_configurations 
ADD COLUMN IF NOT EXISTS duration_minutes INTEGER DEFAULT 10,
ADD COLUMN IF NOT EXISTS default_difficulty TEXT DEFAULT 'medium',
ADD COLUMN IF NOT EXISTS primary_metric TEXT DEFAULT 'score',
ADD COLUMN IF NOT EXISTS target_score INTEGER DEFAULT 70,
ADD COLUMN IF NOT EXISTS is_repeatable BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS max_attempts_per_day INTEGER,
ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'optional',
ADD COLUMN IF NOT EXISTS allow_in_commitments BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS advanced_config JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS config_version INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS participation_xp INTEGER DEFAULT 5,
ADD COLUMN IF NOT EXISTS participation_coins INTEGER DEFAULT 0;

-- Criar tabela de overrides por organização
CREATE TABLE IF NOT EXISTS organization_game_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  game_type TEXT NOT NULL,
  
  -- Overrides de recompensas
  xp_base_override INTEGER,
  xp_multiplier_override NUMERIC,
  coins_base_override INTEGER,
  coins_multiplier_override NUMERIC,
  
  -- Overrides de configuração
  target_score_override INTEGER,
  visibility_override TEXT CHECK (visibility_override IN ('required', 'recommended', 'optional', 'hidden')),
  is_active BOOLEAN DEFAULT true,
  allow_in_commitments BOOLEAN DEFAULT true,
  
  -- Configuração avançada customizada
  advanced_config_override JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(organization_id, game_type)
);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_org_game_overrides_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_org_game_overrides_timestamp ON organization_game_overrides;
CREATE TRIGGER update_org_game_overrides_timestamp
  BEFORE UPDATE ON organization_game_overrides
  FOR EACH ROW
  EXECUTE FUNCTION update_org_game_overrides_updated_at();

-- RLS para organization_game_overrides
ALTER TABLE organization_game_overrides ENABLE ROW LEVEL SECURITY;

-- Política de leitura: membros da org podem ver
CREATE POLICY "Members can view org game overrides"
  ON organization_game_overrides
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Política de escrita: apenas admins/owners podem modificar
CREATE POLICY "Admins can manage org game overrides"
  ON organization_game_overrides
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'owner', 'super_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'owner', 'super_admin')
    )
  );

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_org_game_overrides_org ON organization_game_overrides(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_game_overrides_game ON organization_game_overrides(game_type);