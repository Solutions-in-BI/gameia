-- =============================================
-- FASE 1: MODELAGEM DE DADOS - SISTEMA DE INSÍGNIAS V2
-- =============================================

-- 1.1 Expandir tabela insignias com novos campos
ALTER TABLE insignias ADD COLUMN IF NOT EXISTS insignia_type TEXT NOT NULL DEFAULT 'skill';
-- Valores: 'skill', 'behavior', 'impact', 'leadership', 'special'

ALTER TABLE insignias ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1;
-- Para insígnias progressivas (N1, N2, N3...)

ALTER TABLE insignias ADD COLUMN IF NOT EXISTS prerequisites UUID[] DEFAULT '{}';
-- IDs de insígnias que precisam ser conquistadas antes

ALTER TABLE insignias ADD COLUMN IF NOT EXISTS related_skill_ids UUID[] DEFAULT '{}';
-- Skills relacionadas a esta insígnia

ALTER TABLE insignias ADD COLUMN IF NOT EXISTS unlock_rules JSONB DEFAULT '{}';
-- Regras de negócio adicionais (não abandono, constância mínima, etc)

ALTER TABLE insignias ADD COLUMN IF NOT EXISTS unlock_message TEXT;
-- Mensagem exibida ao conquistar

ALTER TABLE insignias ADD COLUMN IF NOT EXISTS unlocks JSONB DEFAULT '[]';
-- IDs de itens/títulos desbloqueados por esta insígnia

ALTER TABLE insignias ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1;
-- Versionamento da insígnia

-- 1.2 Criar tabela insignia_criteria
CREATE TABLE IF NOT EXISTS insignia_criteria (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  insignia_id UUID NOT NULL REFERENCES insignias(id) ON DELETE CASCADE,
  
  -- Tipo do critério
  criterion_type TEXT NOT NULL,
  -- Valores: 'event_count', 'event_avg_score', 'event_min_score', 'streak_days', 
  -- 'diversity', 'time_window', 'skill_level', 'consecutive', 'no_failures'
  
  -- Configuração do evento
  event_type TEXT, -- Tipo de core_event (JOGO_CONCLUIDO, TREINAMENTO_CONCLUIDO, etc)
  
  -- Valores de threshold
  min_count INTEGER DEFAULT 0,
  min_value NUMERIC DEFAULT 0,
  avg_value NUMERIC DEFAULT 0,
  
  -- Janela de tempo
  time_window_days INTEGER, -- Janela de tempo (ex: últimos 30 dias)
  
  -- Configuração de contexto
  context_config JSONB DEFAULT '{}',
  -- Ex: {"game_type": "sales", "difficulty": "hard", "skill_id": "uuid"}
  
  -- Peso e obrigatoriedade
  weight INTEGER DEFAULT 1, -- Peso do critério no cálculo de progresso
  is_required BOOLEAN DEFAULT true, -- Se é obrigatório para desbloqueio
  
  -- Descrição legível
  description TEXT NOT NULL,
  
  -- Ordenação
  sort_order INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para insignia_criteria
CREATE INDEX IF NOT EXISTS idx_insignia_criteria_insignia ON insignia_criteria(insignia_id);
CREATE INDEX IF NOT EXISTS idx_insignia_criteria_type ON insignia_criteria(criterion_type);
CREATE INDEX IF NOT EXISTS idx_insignia_criteria_event ON insignia_criteria(event_type);

-- 1.3 Expandir tabela user_insignias
ALTER TABLE user_insignias ADD COLUMN IF NOT EXISTS progress_snapshot JSONB DEFAULT '{}';
-- Snapshot dos critérios no momento do unlock

ALTER TABLE user_insignias ADD COLUMN IF NOT EXISTS source_events UUID[] DEFAULT '{}';
-- IDs dos eventos que contribuíram para o unlock

ALTER TABLE user_insignias ADD COLUMN IF NOT EXISTS awarded_by TEXT DEFAULT 'system';
-- 'system' ou user_id para insígnias manuais

ALTER TABLE user_insignias ADD COLUMN IF NOT EXISTS xp_awarded INTEGER DEFAULT 0;
-- XP concedido no momento do unlock

ALTER TABLE user_insignias ADD COLUMN IF NOT EXISTS coins_awarded INTEGER DEFAULT 0;
-- Coins concedidos no momento do unlock

-- 1.4 Índices adicionais para performance
CREATE INDEX IF NOT EXISTS idx_insignias_type ON insignias(insignia_type);
CREATE INDEX IF NOT EXISTS idx_insignias_level ON insignias(level);
CREATE INDEX IF NOT EXISTS idx_insignias_org_type ON insignias(organization_id, insignia_type);
CREATE INDEX IF NOT EXISTS idx_user_insignias_user ON user_insignias(user_id);
CREATE INDEX IF NOT EXISTS idx_user_insignias_insignia ON user_insignias(insignia_id);

-- 1.5 Trigger para updated_at em insignia_criteria
CREATE OR REPLACE FUNCTION update_insignia_criteria_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_insignia_criteria_updated_at ON insignia_criteria;
CREATE TRIGGER trg_insignia_criteria_updated_at
  BEFORE UPDATE ON insignia_criteria
  FOR EACH ROW
  EXECUTE FUNCTION update_insignia_criteria_updated_at();

-- 1.6 RLS para insignia_criteria
ALTER TABLE insignia_criteria ENABLE ROW LEVEL SECURITY;

-- Leitura: todos podem ver critérios de insígnias ativas
CREATE POLICY "Anyone can read insignia criteria"
  ON insignia_criteria FOR SELECT
  USING (true);

-- Escrita: apenas admins da organização
CREATE POLICY "Admins can manage insignia criteria"
  ON insignia_criteria FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM insignias i
      JOIN organization_members om ON om.organization_id = i.organization_id
      WHERE i.id = insignia_criteria.insignia_id
        AND om.user_id = auth.uid()
        AND om.role IN ('admin', 'master')
    )
    OR
    EXISTS (
      SELECT 1 FROM insignias i
      WHERE i.id = insignia_criteria.insignia_id
        AND i.organization_id IS NULL
    )
  );

-- 1.7 Comentários nas tabelas para documentação
COMMENT ON TABLE insignia_criteria IS 'Critérios de desbloqueio de insígnias - Sistema v2';
COMMENT ON COLUMN insignias.insignia_type IS 'Tipo: skill, behavior, impact, leadership, special';
COMMENT ON COLUMN insignias.level IS 'Nível para insígnias progressivas (1=N1, 2=N2, etc)';
COMMENT ON COLUMN insignias.prerequisites IS 'Array de IDs de insígnias pré-requisito';
COMMENT ON COLUMN insignia_criteria.criterion_type IS 'Tipo: event_count, event_avg_score, streak_days, diversity, skill_level, consecutive, no_failures';
COMMENT ON COLUMN insignia_criteria.weight IS 'Peso no cálculo de progresso (maior = mais importante)';
COMMENT ON COLUMN insignia_criteria.is_required IS 'Se true, critério obrigatório para unlock';