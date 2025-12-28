-- Create sales_tracks table
CREATE TABLE public.sales_tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  track_key TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT,
  time_limit_seconds INTEGER DEFAULT 600,
  xp_reward INTEGER DEFAULT 100,
  coins_reward INTEGER DEFAULT 50,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on sales_tracks
ALTER TABLE public.sales_tracks ENABLE ROW LEVEL SECURITY;

-- RLS policies for sales_tracks
CREATE POLICY "Anyone can view active tracks" ON public.sales_tracks
  FOR SELECT USING (is_active = true);

CREATE POLICY "Org admins can manage tracks" ON public.sales_tracks
  FOR ALL USING (
    organization_id IS NULL OR
    EXISTS (
      SELECT 1 FROM public.organization_members
      WHERE organization_id = sales_tracks.organization_id
      AND user_id = auth.uid()
      AND org_role IN ('owner', 'admin')
    )
  );

-- Create sales_objection_library table
CREATE TABLE public.sales_objection_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.sales_products(id) ON DELETE CASCADE,
  track_key TEXT,
  objection_category TEXT NOT NULL,
  objection_text TEXT NOT NULL,
  severity TEXT DEFAULT 'medium',
  recommended_response TEXT,
  technique TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on sales_objection_library
ALTER TABLE public.sales_objection_library ENABLE ROW LEVEL SECURITY;

-- RLS policies for sales_objection_library
CREATE POLICY "Anyone can view objections" ON public.sales_objection_library
  FOR SELECT USING (true);

CREATE POLICY "Org admins can manage objections" ON public.sales_objection_library
  FOR ALL USING (
    organization_id IS NULL OR
    EXISTS (
      SELECT 1 FROM public.organization_members
      WHERE organization_id = sales_objection_library.organization_id
      AND user_id = auth.uid()
      AND org_role IN ('owner', 'admin')
    )
  );

-- Add track_key to sales_conversation_stages
ALTER TABLE public.sales_conversation_stages ADD COLUMN IF NOT EXISTS track_key TEXT DEFAULT 'closer';

-- Add new columns to sales_products
ALTER TABLE public.sales_products ADD COLUMN IF NOT EXISTS product_type TEXT DEFAULT 'service';
ALTER TABLE public.sales_products ADD COLUMN IF NOT EXISTS sales_cycle_days INTEGER;
ALTER TABLE public.sales_products ADD COLUMN IF NOT EXISTS average_ticket TEXT;
ALTER TABLE public.sales_products ADD COLUMN IF NOT EXISTS commission_structure JSONB;
ALTER TABLE public.sales_products ADD COLUMN IF NOT EXISTS pitch_script TEXT;
ALTER TABLE public.sales_products ADD COLUMN IF NOT EXISTS discovery_questions JSONB;
ALTER TABLE public.sales_products ADD COLUMN IF NOT EXISTS demo_points JSONB;
ALTER TABLE public.sales_products ADD COLUMN IF NOT EXISTS competitive_advantages JSONB;
ALTER TABLE public.sales_products ADD COLUMN IF NOT EXISTS case_studies JSONB;
ALTER TABLE public.sales_products ADD COLUMN IF NOT EXISTS faq JSONB;

-- Add track_key to sales_client_personas
ALTER TABLE public.sales_client_personas ADD COLUMN IF NOT EXISTS track_key TEXT DEFAULT 'closer';

-- Add track_key to sales_game_sessions
ALTER TABLE public.sales_game_sessions ADD COLUMN IF NOT EXISTS track_key TEXT;

-- Seed SDR and Closer tracks
INSERT INTO public.sales_tracks (track_key, name, description, icon, color, time_limit_seconds, xp_reward, coins_reward) VALUES
('sdr', 'SDR - Prospecção', 'Domine a arte da prospecção fria. Qualifique leads e agende reuniões de alto valor.', '📞', 'from-blue-500 to-cyan-500', 480, 80, 40),
('closer', 'Closer - Negociação', 'Feche negócios complexos. Apresente valor, contorne objeções e assine contratos.', '🤝', 'from-green-500 to-emerald-500', 600, 150, 75);

-- Seed SDR conversation stages
INSERT INTO public.sales_conversation_stages (stage_order, stage_key, stage_label, description, tips, icon, track_key) VALUES
(1, 'cold_approach', 'Cold Approach', 'Abordagem inicial fria para captar atenção', 'Use gatilhos mentais de curiosidade. Mencione algo específico sobre a empresa do lead.', '📞', 'sdr'),
(2, 'qualification', 'Qualificação BANT', 'Identifique Budget, Authority, Need e Timeline', 'Faça perguntas abertas. Descubra se tem orçamento, autoridade, necessidade e urgência.', '🎯', 'sdr'),
(3, 'rapport_building', 'Rapport Building', 'Construa conexão e confiança inicial', 'Espelhe linguagem e tom. Demonstre interesse genuíno no negócio do prospect.', '🤝', 'sdr'),
(4, 'meeting_setting', 'Agendamento', 'Agende a reunião de apresentação', 'Ofereça duas opções de horário. Confirme participantes e pauta.', '📅', 'sdr');

-- Update existing stages to be Closer track
UPDATE public.sales_conversation_stages SET track_key = 'closer' WHERE track_key IS NULL OR track_key = '';

-- Seed LegalTrade products
INSERT INTO public.sales_products (name, description, target_audience, key_benefits, pricing_info, product_type, sales_cycle_days, average_ticket, pitch_script, discovery_questions, competitive_advantages, is_active) VALUES
(
  'Antecipação de Honorários',
  'Antecipe o recebimento dos seus honorários advocatícios com as melhores taxas do mercado.',
  'Advogados e escritórios de advocacia',
  ARRAY['Liquidez imediata', 'Taxas competitivas', 'Sem burocracia', 'Análise rápida', 'Flexibilidade de prazos'],
  'Taxas a partir de 2% ao mês',
  'financial',
  15,
  'R$ 50.000 - R$ 500.000',
  'Doutor(a), sei que o fluxo de caixa na advocacia pode ser desafiador. Muitos colegas seus já anteciparam mais de R$ X milhões conosco, com taxas que não encontram no mercado.',
  '["Quantos processos você tem em andamento com expectativa de recebimento?", "Qual o valor médio dos seus honorários por processo?", "Você já considerou antecipar esses valores para investir no escritório?", "Qual sua experiência anterior com antecipação de recebíveis?"]',
  '["Maior empresa de ativos judiciais do Brasil", "Mais de R$ 500 milhões já negociados", "Equipe jurídica própria para análise", "Processo 100% digital"]',
  true
),
(
  'Compra de Precatórios',
  'Receba o valor do seu precatório agora, sem esperar anos na fila de pagamento.',
  'Portadores de precatórios federais, estaduais e municipais',
  ARRAY['Recebimento imediato', 'Evita a fila de pagamento', 'Maior percentual do mercado', 'Segurança jurídica', 'Sem custos ocultos'],
  '60% a 85% do valor de face',
  'financial',
  30,
  'R$ 100.000 - R$ 5.000.000',
  'Você sabe que pode esperar 10, 15 ou até 20 anos para receber. Nós oferecemos até 85% do valor do seu precatório, hoje, com toda segurança jurídica.',
  '["Quando seu precatório foi expedido?", "Qual o ente devedor (federal, estadual ou municipal)?", "Você conhece a posição do seu precatório na fila?", "Já recebeu outras propostas de compra?"]',
  '["Pagamento mais rápido do mercado", "Equipe especializada em precatórios", "Maior transparência no processo", "Suporte jurídico completo"]',
  true
),
(
  'Investimento em Ativos Judiciais',
  'Diversifique sua carteira com ativos judiciais de alta rentabilidade e baixo risco.',
  'Investidores, family offices, fundos de investimento',
  ARRAY['Rentabilidade acima do CDI', 'Descorrelação com mercado', 'Ativos reais', 'Due diligence rigorosa', 'Gestão profissional'],
  'Retorno médio de 18% a.a.',
  'investment',
  45,
  'R$ 500.000+',
  'Você busca diversificação com rentabilidade? Ativos judiciais têm performance histórica de 18% ao ano, com baixa correlação ao mercado tradicional.',
  '["Qual o tamanho da sua carteira de investimentos?", "Qual percentual você destina a ativos alternativos?", "Conhece o mercado de ativos judiciais?", "Qual seu horizonte de investimento?"]',
  '["Track record de 10+ anos", "Mais de 5.000 ativos sob gestão", "Taxa de recuperação de 95%", "Relatórios mensais detalhados"]',
  true
),
(
  'Gestão de Passivos Judiciais',
  'Reduza o impacto dos passivos trabalhistas e cíveis da sua empresa com nossa solução estruturada.',
  'Empresas com passivo judicial relevante',
  ARRAY['Previsibilidade de caixa', 'Redução de contingência', 'Economia fiscal', 'Melhoria de balanço', 'Gestão especializada'],
  'Sob consulta - análise de portfólio',
  'b2b',
  60,
  'R$ 1.000.000+',
  'Sua empresa tem contingências judiciais impactando o balanço? Podemos estruturar uma solução que traz previsibilidade e economia.',
  '["Qual o volume atual de passivo judicial da empresa?", "Qual o setor de atuação e principais tipos de ações?", "Como é feita a gestão atual dessas contingências?", "Quais são as metas de redução de passivo?"]',
  '["Solução completa de gestão", "Economia comprovada", "Cases em grandes empresas", "Conformidade regulatória"]',
  true
);

-- Seed LegalTrade personas for SDR
INSERT INTO public.sales_client_personas (name, role, company_name, company_type, personality, pain_points, decision_factors, difficulty, avatar, is_active, track_key) VALUES
('Dr. Marcos Oliveira', 'Advogado Sócio', 'Oliveira & Associados', 'Escritório de advocacia de médio porte', 'analytical', 
  ARRAY['Fluxo de caixa irregular', 'Processos demoram anos', 'Dificuldade em investir no escritório'],
  ARRAY['Taxas competitivas', 'Rapidez na análise', 'Reputação da empresa'],
  'medium', '👨‍⚖️', true, 'sdr'),
('Maria Lourdes Santos', 'Aposentada', 'Pessoa Física', 'Beneficiária de precatório federal', 'skeptical',
  ARRAY['Precisa do dinheiro urgente', 'Não entende bem o processo', 'Medo de golpe'],
  ARRAY['Segurança', 'Percentual de pagamento', 'Clareza nas explicações'],
  'hard', '👵', true, 'sdr'),
('Rafael Costa', 'CFO', 'Fundo Investimentos XYZ', 'Fundo de investimentos', 'analytical',
  ARRAY['Busca diversificação', 'Rentabilidade abaixo do esperado', 'Mercado volátil'],
  ARRAY['Track record', 'Due diligence', 'Liquidez', 'Compliance'],
  'hard', '💼', true, 'sdr');

-- Seed LegalTrade personas for Closer
INSERT INTO public.sales_client_personas (name, role, company_name, company_type, personality, pain_points, decision_factors, difficulty, avatar, is_active, track_key) VALUES
('Dr. Junior Pegorini', 'Sócio-fundador', 'Pegorini Advogados', 'Grande escritório trabalhista', 'analytical',
  ARRAY['Precisa escalar operação', 'Honorários presos há anos', 'Quer investir em tecnologia'],
  ARRAY['Análise detalhada', 'Taxas', 'Velocidade', 'Referências de mercado'],
  'hard', '👨‍💼', true, 'closer'),
('Sr. Paulo Henrique', 'Aposentado', 'Pessoa Física', 'Precatório municipal de São Paulo', 'friendly',
  ARRAY['Problemas de saúde', 'Precisa do dinheiro para tratamento', 'Família depende dele'],
  ARRAY['Confiança', 'Atendimento humanizado', 'Prazo de pagamento'],
  'easy', '👴', true, 'closer'),
('Amanda Rodrigues', 'Gestora de Portfólio', 'Wealth Management Partners', 'Multi-family office', 'analytical',
  ARRAY['Clientes querem diversificação', 'Pressão por rentabilidade', 'Busca ativos alternativos'],
  ARRAY['Relatórios', 'Governança', 'Rentabilidade histórica', 'Liquidez'],
  'medium', '👩‍💼', true, 'closer'),
('Carlos Alberto Nunes', 'Diretor Financeiro', 'Indústrias Nunes S.A.', 'Indústria de grande porte', 'busy',
  ARRAY['Passivo trabalhista alto', 'Pressão de auditoria', 'Precisa limpar balanço'],
  ARRAY['Economia real', 'Conformidade', 'Agilidade', 'Cases similares'],
  'medium', '🏭', true, 'closer');

-- Seed objection library for LegalTrade
INSERT INTO public.sales_objection_library (objection_category, objection_text, severity, recommended_response, technique, track_key) VALUES
('price', 'As taxas são muito altas', 'high', 'Entendo sua preocupação. Mas compare: quanto custa esperar 5, 10 anos? Nossa taxa considera o valor do tempo e a certeza do recebimento hoje.', 'reframe', 'closer'),
('trust', 'Nunca ouvi falar da LegalTrade', 'medium', 'Somos a maior empresa de ativos judiciais do Brasil, com mais de 10 anos de mercado e R$ 500 milhões negociados. Posso enviar cases e referências de clientes satisfeitos.', 'proof', 'closer'),
('timing', 'Vou pensar e depois retorno', 'high', 'Claro, é uma decisão importante. Mas me conta: o que especificamente você precisa pensar? Talvez eu possa ajudar com alguma informação.', 'isolate', 'closer'),
('competition', 'Recebi proposta melhor de outro lugar', 'medium', 'Interessante! Posso perguntar qual foi a proposta? Às vezes as condições parecem melhores mas escondem custos ou processos mais demorados.', 'question', 'sdr'),
('need', 'Não preciso antecipar agora', 'medium', 'Entendo. E se surgisse uma oportunidade de investimento ou necessidade urgente, você teria acesso rápido a esse capital? Muitos clientes preferem ter a opção disponível.', 'future_pace', 'sdr'),
('authority', 'Preciso consultar meu sócio/família', 'low', 'Faz todo sentido. Gostaria que eu preparasse um material para facilitar essa conversa? Podemos até agendar uma call com todos juntos.', 'facilitate', 'sdr');