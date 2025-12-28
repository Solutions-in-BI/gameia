-- Inserir trilha Cold Outreach
INSERT INTO sales_tracks (track_key, name, description, icon, color, time_limit_seconds, xp_reward, coins_reward, is_active)
VALUES (
  'cold_outreach',
  'Cold Outreach',
  'Domine a arte da prospecção fria. Aprenda a quebrar o gelo, criar interesse instantâneo e conseguir o primeiro micro-compromisso.',
  'Phone',
  'orange',
  180,
  120,
  60,
  true
);

-- Adicionar campo channel nas tabelas necessárias
ALTER TABLE sales_conversation_stages ADD COLUMN IF NOT EXISTS channel TEXT DEFAULT 'all';
ALTER TABLE sales_client_personas ADD COLUMN IF NOT EXISTS channel TEXT DEFAULT 'all';

-- Criar tabela de scripts de abertura
CREATE TABLE IF NOT EXISTS sales_opening_scripts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id),
  track_key TEXT NOT NULL DEFAULT 'cold_outreach',
  channel TEXT NOT NULL DEFAULT 'phone',
  name TEXT NOT NULL,
  script_template TEXT NOT NULL,
  context_tags TEXT[] DEFAULT '{}',
  effectiveness_score NUMERIC DEFAULT 0,
  usage_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE sales_opening_scripts ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view active scripts" ON sales_opening_scripts
  FOR SELECT USING (is_active = true);

CREATE POLICY "Org admins can manage scripts" ON sales_opening_scripts
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth.uid() AND org_role IN ('admin', 'owner')
    )
  );

-- Inserir 5 estágios específicos de Cold Outreach
INSERT INTO sales_conversation_stages (track_key, stage_key, stage_label, stage_order, description, icon, tips, channel)
VALUES 
  ('cold_outreach', 'first_impression', 'Primeira Impressão', 1, 
   'Os primeiros 7 segundos são cruciais. Cause uma impressão positiva e profissional.',
   'Eye', 'Sorria ao falar (mesmo no telefone), use um tom confiante mas não arrogante.', 'all'),
  ('cold_outreach', 'hook', 'Gancho de Atenção', 2,
   'Crie curiosidade imediata. Use um hook que faça o prospect querer saber mais.',
   'Anchor', 'Mencione algo específico sobre a empresa/situação do prospect. Seja relevante!', 'all'),
  ('cold_outreach', 'elevator_pitch', 'Pitch Relâmpago', 3,
   'Apresente sua proposta de valor em 30 segundos. Seja claro e objetivo.',
   'Zap', 'Foque no BENEFÍCIO, não nas features. O que o prospect GANHA?', 'all'),
  ('cold_outreach', 'brushoff_handling', 'Contorno de Objeção', 4,
   'O prospect vai tentar se livrar de você. Esteja preparado para contornar.',
   'Shield', 'Não discuta! Valide a objeção e redirecione com uma pergunta.', 'all'),
  ('cold_outreach', 'micro_commitment', 'Micro-Compromisso', 5,
   'Feche com um pequeno compromisso: reunião, demo, ou próximo passo concreto.',
   'Target', 'Ofereça opções limitadas (terça ou quinta?). Facilite o "sim".', 'all');

-- Inserir 5 personas de alta resistência para Cold Outreach
INSERT INTO sales_client_personas (track_key, name, personality, role, company_name, company_type, pain_points, decision_factors, difficulty, channel, is_active)
VALUES
  ('cold_outreach', 'Dr. Ricardo Almeida', 'skeptical', 'Sócio-Diretor', 'Almeida & Associados', 'Advocacia Trabalhista',
   ARRAY['Não tenho tempo para isso', 'Já trabalho com precatórios há anos', 'Não confio em empresas de fora'],
   ARRAY['Credibilidade', 'Resultados comprovados', 'Referências'],
   'hard', 'phone', true),
  ('cold_outreach', 'Dra. Fernanda Castro', 'busy', 'Advogada Sênior', 'Castro Advocacia', 'Advocacia Cível',
   ARRAY['Estou em audiência', 'Me liga depois', 'Manda por email'],
   ARRAY['Praticidade', 'Tempo', 'Valor rápido'],
   'hard', 'phone', true),
  ('cold_outreach', 'Carlos Eduardo', 'aggressive', 'Gestor Jurídico', 'Grupo Empresarial ABC', 'Departamento Jurídico Corporativo',
   ARRAY['Não atendo telefonemas de vendas', 'Como conseguiu meu número?', 'Vou desligar'],
   ARRAY['ROI claro', 'Cases de sucesso', 'Processo estruturado'],
   'extreme', 'phone', true),
  ('cold_outreach', 'Marcela Santos', 'indifferent', 'Coordenadora Jurídica', 'Construtora Horizonte', 'Construção Civil',
   ARRAY['Hmm, ok', 'Pode ser', 'Vou pensar'],
   ARRAY['Urgência', 'Oportunidade única', 'Prova social'],
   'medium', 'whatsapp', true),
  ('cold_outreach', 'João Paulo Ferreira', 'analytical', 'Diretor Financeiro', 'Investimentos Futuro', 'Gestora de Investimentos',
   ARRAY['Me manda os números', 'Qual o track record?', 'Preciso analisar os dados'],
   ARRAY['Dados concretos', 'Transparência', 'Metodologia'],
   'hard', 'phone', true);

-- Inserir scripts de abertura LegalTrade
INSERT INTO sales_opening_scripts (track_key, channel, name, script_template, context_tags, effectiveness_score)
VALUES
  ('cold_outreach', 'phone', 'Abertura Tribunal Urgente', 
   'Bom dia [NOME], aqui é [MEU_NOME] da LegalTrade. Identifiquei que você tem [QUANTIDADE] precatórios no [TRIBUNAL] com previsão de pagamento para [DATA]. Posso falar 30 segundos sobre como antecipar esse recebimento?',
   ARRAY['tribunal', 'urgência', 'antecipação'], 85),
  ('cold_outreach', 'phone', 'Abertura Referência',
   '[NOME], muito prazer! Sou [MEU_NOME] da LegalTrade. O Dr. [REFERÊNCIA] do [ESCRITÓRIO] me indicou seu contato. Ele fechou conosco mês passado e me disse que você também trabalha com precatórios federais. Tem 2 minutinhos?',
   ARRAY['referência', 'indicação', 'credibilidade'], 92),
  ('cold_outreach', 'phone', 'Abertura Oportunidade Limitada',
   '[NOME], bom dia! [MEU_NOME] da LegalTrade. Estou ligando porque identificamos uma janela de oportunidade para precatórios do [TRIBUNAL] essa semana. Você tem precatórios lá aguardando pagamento?',
   ARRAY['urgência', 'oportunidade', 'escassez'], 78),
  ('cold_outreach', 'whatsapp', 'WhatsApp Direto',
   'Olá [NOME]! 👋 Sou [MEU_NOME] da LegalTrade. Vi que seu escritório tem atuação forte em [ÁREA]. Temos uma oportunidade exclusiva para antecipação de precatórios esse mês. Posso mandar um resumo de 1 minuto em áudio?',
   ARRAY['whatsapp', 'informal', 'áudio'], 75),
  ('cold_outreach', 'phone', 'Abertura Problema-Solução',
   '[NOME], aqui é [MEU_NOME]. Sei que advogados como você perdem muito tempo esperando precatórios pagarem. E se eu te mostrasse como converter esse ativo em caixa em 15 dias? Me dá 1 minuto?',
   ARRAY['problema', 'solução', 'tempo'], 80);

-- Inserir objeções específicas de cold outreach
INSERT INTO sales_objection_library (track_key, objection_category, objection_text, recommended_response, technique, severity)
VALUES
  ('cold_outreach', 'brushoff', 'Não tenho tempo agora', 
   'Entendo perfeitamente. Qual seria o melhor horário para uma ligação de 3 minutos?', 
   'agendamento', 'low'),
  ('cold_outreach', 'brushoff', 'Me manda por email',
   'Claro! Mas para mandar algo relevante, me diz: vocês trabalham mais com precatórios federais ou estaduais?',
   'pergunta_qualificadora', 'medium'),
  ('cold_outreach', 'trust', 'Como conseguiu meu número?',
   'Seu escritório apareceu em nossa análise de tribunais como referência em [ÁREA]. Trabalhamos só com os melhores.',
   'elogio_sincero', 'high'),
  ('cold_outreach', 'not_interested', 'Não me interessa',
   'Entendo. Só por curiosidade, vocês já anteciparam precatórios antes ou é a primeira vez que ouvem sobre isso?',
   'pergunta_exploratória', 'high'),
  ('cold_outreach', 'competitor', 'Já trabalho com outra empresa',
   'Que bom que já conhece o mercado! Como está a experiência? Estão conseguindo as melhores taxas?',
   'comparação_sutil', 'medium'),
  ('cold_outreach', 'gatekeeper', 'Ele está em reunião',
   'Sem problemas! Qual o melhor horário para retornar? E qual seu nome para eu anotar aqui?',
   'rapport_gatekeeper', 'low');

-- Update function para atualizar updated_at nas tabelas de sales
CREATE OR REPLACE FUNCTION update_sales_scripts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.created_at = COALESCE(NEW.created_at, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_sales_opening_scripts_updated
  BEFORE UPDATE ON sales_opening_scripts
  FOR EACH ROW
  EXECUTE FUNCTION update_sales_scripts_updated_at();