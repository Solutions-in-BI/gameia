-- =====================================================
-- DESAFIO DE VENDAS 2.0 - ESTRUTURA B2B CONFIGURÁVEL
-- =====================================================

-- Etapas da conversa de vendas (global e por organização)
CREATE TABLE public.sales_conversation_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  stage_order INT NOT NULL,
  stage_key TEXT NOT NULL, -- 'opening', 'discovery', 'presentation', 'objection', 'closing'
  stage_label TEXT NOT NULL, -- 'Abertura', 'Descoberta', etc.
  description TEXT,
  tips TEXT,
  icon TEXT DEFAULT '💬',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Produtos/Serviços configuráveis por organização
CREATE TABLE public.sales_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  key_benefits TEXT[],
  pricing_info TEXT,
  target_audience TEXT,
  common_objections JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Personas de clientes configuráveis
CREATE TABLE public.sales_client_personas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT, -- "Diretor de TI", "Gerente de Compras"
  company_name TEXT,
  company_type TEXT, -- "Startup", "Enterprise", "PME"
  personality TEXT NOT NULL, -- 'friendly', 'skeptical', 'busy', 'analytical', 'indecisive'
  pain_points TEXT[],
  decision_factors TEXT[],
  avatar TEXT DEFAULT '👤',
  difficulty TEXT DEFAULT 'medium', -- 'easy', 'medium', 'hard'
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Templates de mensagens por etapa
CREATE TABLE public.sales_message_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  stage_key TEXT NOT NULL,
  persona_personality TEXT, -- personality type, NULL = applies to all
  sequence_order INT DEFAULT 1, -- ordem dentro da etapa
  client_message TEXT NOT NULL,
  response_options JSONB NOT NULL,
  -- Cada opção: { 
  --   text: string, 
  --   rapport_change: number (-20 to +20),
  --   skill_tags: string[],
  --   feedback: string,
  --   is_optimal: boolean,
  --   leads_to_next_stage: boolean
  -- }
  context_hint TEXT, -- Dica contextual para o jogador
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sessões de jogo para métricas detalhadas
CREATE TABLE public.sales_game_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  product_id UUID REFERENCES public.sales_products(id) ON DELETE SET NULL,
  persona_id UUID REFERENCES public.sales_client_personas(id) ON DELETE SET NULL,
  
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Resultado final
  final_rapport INT DEFAULT 50,
  sale_closed BOOLEAN DEFAULT false,
  total_score INT DEFAULT 0,
  time_spent_seconds INT DEFAULT 0,
  
  -- Métricas por etapa
  stage_performance JSONB DEFAULT '{}'::jsonb,
  -- { "opening": { score: 85, time: 30 }, "discovery": { score: 70, time: 45 }, ... }
  
  -- Competências medidas
  skills_measured JSONB DEFAULT '{}'::jsonb,
  -- { "rapport_building": 85, "needs_analysis": 70, "objection_handling": 90, ... }
  
  -- Histórico completo da conversa
  conversation_history JSONB DEFAULT '[]'::jsonb,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.sales_conversation_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_client_personas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_message_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_game_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for sales_conversation_stages
CREATE POLICY "Anyone can view global stages" ON public.sales_conversation_stages
FOR SELECT USING (organization_id IS NULL OR organization_id IN (
  SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
) OR organization_id IN (
  SELECT id FROM public.organizations WHERE owner_id = auth.uid()
));

CREATE POLICY "Org admins can manage stages" ON public.sales_conversation_stages
FOR ALL USING (
  organization_id IS NOT NULL AND (
    EXISTS (SELECT 1 FROM public.organizations WHERE id = organization_id AND owner_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.organization_members WHERE organization_id = sales_conversation_stages.organization_id AND user_id = auth.uid() AND org_role IN ('admin', 'owner'))
  )
);

-- RLS Policies for sales_products
CREATE POLICY "Anyone can view active products" ON public.sales_products
FOR SELECT USING (is_active = true AND (organization_id IS NULL OR organization_id IN (
  SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
) OR organization_id IN (
  SELECT id FROM public.organizations WHERE owner_id = auth.uid()
)));

CREATE POLICY "Org admins can manage products" ON public.sales_products
FOR ALL USING (
  EXISTS (SELECT 1 FROM public.organizations WHERE id = organization_id AND owner_id = auth.uid())
  OR EXISTS (SELECT 1 FROM public.organization_members WHERE organization_id = sales_products.organization_id AND user_id = auth.uid() AND org_role IN ('admin', 'owner'))
);

-- RLS Policies for sales_client_personas
CREATE POLICY "Anyone can view active personas" ON public.sales_client_personas
FOR SELECT USING (is_active = true AND (organization_id IS NULL OR organization_id IN (
  SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
) OR organization_id IN (
  SELECT id FROM public.organizations WHERE owner_id = auth.uid()
)));

CREATE POLICY "Org admins can manage personas" ON public.sales_client_personas
FOR ALL USING (
  EXISTS (SELECT 1 FROM public.organizations WHERE id = organization_id AND owner_id = auth.uid())
  OR EXISTS (SELECT 1 FROM public.organization_members WHERE organization_id = sales_client_personas.organization_id AND user_id = auth.uid() AND org_role IN ('admin', 'owner'))
);

-- RLS Policies for sales_message_templates
CREATE POLICY "Anyone can view active templates" ON public.sales_message_templates
FOR SELECT USING (is_active = true AND (organization_id IS NULL OR organization_id IN (
  SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
) OR organization_id IN (
  SELECT id FROM public.organizations WHERE owner_id = auth.uid()
)));

CREATE POLICY "Org admins can manage templates" ON public.sales_message_templates
FOR ALL USING (
  EXISTS (SELECT 1 FROM public.organizations WHERE id = organization_id AND owner_id = auth.uid())
  OR EXISTS (SELECT 1 FROM public.organization_members WHERE organization_id = sales_message_templates.organization_id AND user_id = auth.uid() AND org_role IN ('admin', 'owner'))
);

-- RLS Policies for sales_game_sessions
CREATE POLICY "Users can view own sessions" ON public.sales_game_sessions
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own sessions" ON public.sales_game_sessions
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions" ON public.sales_game_sessions
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Org admins can view org sessions" ON public.sales_game_sessions
FOR SELECT USING (
  organization_id IS NOT NULL AND (
    EXISTS (SELECT 1 FROM public.organizations WHERE id = organization_id AND owner_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.organization_members WHERE organization_id = sales_game_sessions.organization_id AND user_id = auth.uid() AND org_role IN ('admin', 'owner', 'manager'))
  )
);

-- Indexes for performance
CREATE INDEX idx_sales_products_org ON public.sales_products(organization_id);
CREATE INDEX idx_sales_personas_org ON public.sales_client_personas(organization_id);
CREATE INDEX idx_sales_templates_stage ON public.sales_message_templates(stage_key);
CREATE INDEX idx_sales_sessions_user ON public.sales_game_sessions(user_id);
CREATE INDEX idx_sales_sessions_org ON public.sales_game_sessions(organization_id);

-- Insert default global stages
INSERT INTO public.sales_conversation_stages (organization_id, stage_order, stage_key, stage_label, description, tips, icon) VALUES
(NULL, 1, 'opening', 'Abertura', 'Primeiro contato com o cliente. Objetivo: criar conexão e quebrar o gelo.', 'Seja cordial, use o nome do cliente, faça perguntas abertas sobre o contexto dele.', '👋'),
(NULL, 2, 'discovery', 'Descoberta', 'Entender as necessidades, dores e contexto do cliente.', 'Faça perguntas abertas, escute ativamente, identifique dores específicas.', '🔍'),
(NULL, 3, 'presentation', 'Apresentação', 'Apresentar a solução de forma conectada às dores identificadas.', 'Conecte benefícios às dores mencionadas, use exemplos concretos.', '📊'),
(NULL, 4, 'objection', 'Objeções', 'Lidar com dúvidas, resistências e preocupações do cliente.', 'Não discuta, valide a preocupação e depois apresente uma perspectiva diferente.', '🛡️'),
(NULL, 5, 'closing', 'Fechamento', 'Conduzir o cliente para a decisão final.', 'Resuma os benefícios, proponha próximos passos claros, crie senso de urgência.', '🎯');

-- Insert default personas (generic, no org)
INSERT INTO public.sales_client_personas (organization_id, name, role, company_name, company_type, personality, pain_points, decision_factors, avatar, difficulty) VALUES
(NULL, 'Maria Silva', 'Gerente de RH', 'TechCorp', 'Startup', 'friendly', ARRAY['Processo de recrutamento demorado', 'Alta rotatividade', 'Dificuldade em encontrar talentos'], ARRAY['Custo-benefício', 'Facilidade de uso', 'Suporte'], '👩‍💼', 'easy'),
(NULL, 'Carlos Oliveira', 'Diretor Financeiro', 'Indústrias ABC', 'Enterprise', 'analytical', ARRAY['Custos operacionais altos', 'Falta de visibilidade', 'Processos manuais'], ARRAY['ROI comprovado', 'Casos de sucesso', 'Integração com sistemas existentes'], '👨‍💼', 'medium'),
(NULL, 'Ana Beatriz', 'CEO', 'InnovateTech', 'Startup', 'busy', ARRAY['Crescimento rápido', 'Escalar operações', 'Falta de tempo'], ARRAY['Agilidade', 'Resultados rápidos', 'Menos reuniões'], '👩‍💻', 'hard'),
(NULL, 'Roberto Mendes', 'Gerente de Compras', 'Varejo Nacional', 'Enterprise', 'skeptical', ARRAY['Fornecedores não cumprem prazo', 'Qualidade inconsistente', 'Preços altos'], ARRAY['Garantias', 'Referências', 'Condições de pagamento'], '🧔', 'hard'),
(NULL, 'Juliana Costa', 'Coordenadora de Marketing', 'AgênciaXYZ', 'PME', 'indecisive', ARRAY['Falta de resultados mensuráveis', 'Orçamento limitado', 'Muitas opções no mercado'], ARRAY['Simplicidade', 'Resultados garantidos', 'Período de teste'], '👱‍♀️', 'medium');

-- Insert default message templates for a complete sales flow
-- OPENING - Friendly persona
INSERT INTO public.sales_message_templates (organization_id, stage_key, persona_personality, sequence_order, client_message, response_options, context_hint) VALUES
(NULL, 'opening', 'friendly', 1, 
'Oi! Vi que você tentou entrar em contato. Sobre o que vocês queriam conversar?',
'[
  {"text": "Olá! Tudo bem? Vi no LinkedIn que vocês estão crescendo bastante. Como está sendo essa fase?", "rapport_change": 15, "skill_tags": ["rapport_building"], "feedback": "Excelente! Você criou conexão mostrando interesse genuíno.", "is_optimal": true, "leads_to_next_stage": true},
  {"text": "Oi! Somos especialistas em [produto]. Posso te apresentar nossa solução?", "rapport_change": -5, "skill_tags": ["product_knowledge"], "feedback": "Muito direto. O cliente pode se sentir pressionado.", "is_optimal": false, "leads_to_next_stage": false},
  {"text": "Bom dia! Podemos agendar uma call de 1 hora para eu apresentar tudo?", "rapport_change": -10, "skill_tags": [], "feedback": "Pedir 1 hora logo no primeiro contato é intimidador.", "is_optimal": false, "leads_to_next_stage": false}
]',
'Crie conexão antes de falar do produto. Mostre que você pesquisou sobre a empresa.');

-- OPENING - Skeptical persona
INSERT INTO public.sales_message_templates (organization_id, stage_key, persona_personality, sequence_order, client_message, response_options, context_hint) VALUES
(NULL, 'opening', 'skeptical', 1, 
'Olá. Recebi seu contato, mas já vou avisando que não temos interesse em vendedores.',
'[
  {"text": "Entendo perfeitamente! Não vim vender nada. Só queria entender melhor o mercado de vocês. Você tem 2 minutos?", "rapport_change": 10, "skill_tags": ["rapport_building", "objection_handling"], "feedback": "Ótimo! Você desarmou a objeção e reduziu a barreira.", "is_optimal": true, "leads_to_next_stage": true},
  {"text": "Mas você nem sabe o que eu tenho para oferecer! Nosso produto é diferente.", "rapport_change": -15, "skill_tags": [], "feedback": "Discutir com o cliente cria mais resistência.", "is_optimal": false, "leads_to_next_stage": false},
  {"text": "Ok, sem problemas. Tenha um bom dia!", "rapport_change": 0, "skill_tags": [], "feedback": "Desistir fácil demais. Persista de forma elegante.", "is_optimal": false, "leads_to_next_stage": false}
]',
'Cliente resistente. Mostre que você respeita o tempo dele e não está desesperado.');

-- OPENING - Busy persona
INSERT INTO public.sales_message_templates (organization_id, stage_key, persona_personality, sequence_order, client_message, response_options, context_hint) VALUES
(NULL, 'opening', 'busy', 1, 
'Oi, estou em uma reunião. Pode ser rápido?',
'[
  {"text": "Claro! Em 30 segundos: vi que vocês estão escalando rápido. Ajudo empresas a [benefício principal] em metade do tempo. Vale a pena uma conversa de 10 min essa semana?", "rapport_change": 12, "skill_tags": ["value_proposition", "time_management"], "feedback": "Perfeito! Direto ao ponto com valor claro.", "is_optimal": true, "leads_to_next_stage": true},
  {"text": "Ah, desculpe incomodar. Posso ligar em outro momento?", "rapport_change": -5, "skill_tags": [], "feedback": "Muito passivo. Você perdeu a oportunidade.", "is_optimal": false, "leads_to_next_stage": false},
  {"text": "Na verdade, preciso de pelo menos 15 minutos para explicar direito...", "rapport_change": -15, "skill_tags": [], "feedback": "Ignorou completamente a restrição de tempo do cliente.", "is_optimal": false, "leads_to_next_stage": false}
]',
'Cliente ocupado. Seja extremamente objetivo e mostre valor imediato.');

-- DISCOVERY - All personas
INSERT INTO public.sales_message_templates (organization_id, stage_key, persona_personality, sequence_order, client_message, response_options, context_hint) VALUES
(NULL, 'discovery', NULL, 1, 
'Ok, pode falar. O que vocês fazem exatamente?',
'[
  {"text": "Antes de explicar, me conta: qual é o maior desafio que vocês estão enfrentando hoje na área de [contexto]?", "rapport_change": 10, "skill_tags": ["needs_analysis"], "feedback": "Excelente! Você inverteu para descobrir as dores primeiro.", "is_optimal": true, "leads_to_next_stage": false},
  {"text": "Nós somos uma plataforma completa que oferece [lista de funcionalidades]...", "rapport_change": -5, "skill_tags": ["product_knowledge"], "feedback": "Funcionalidades não vendem. Problemas resolvidos sim.", "is_optimal": false, "leads_to_next_stage": false},
  {"text": "Somos os melhores do mercado em [área]. Temos clientes como [empresas famosas].", "rapport_change": 0, "skill_tags": [], "feedback": "Credenciais são boas, mas você não descobriu as dores ainda.", "is_optimal": false, "leads_to_next_stage": false}
]',
'Não fale do produto ainda! Descubra as dores primeiro.');

INSERT INTO public.sales_message_templates (organization_id, stage_key, persona_personality, sequence_order, client_message, response_options, context_hint) VALUES
(NULL, 'discovery', NULL, 2, 
'Nosso maior problema é que [dor específica]. Isso está nos custando tempo e dinheiro.',
'[
  {"text": "Entendo. E quanto aproximadamente isso está custando por mês? Em tempo ou dinheiro mesmo?", "rapport_change": 12, "skill_tags": ["needs_analysis"], "feedback": "Ótimo! Quantificar a dor ajuda a justificar o investimento depois.", "is_optimal": true, "leads_to_next_stage": true},
  {"text": "Perfeito! É exatamente isso que resolvemos. Deixa eu te mostrar como.", "rapport_change": 5, "skill_tags": ["product_knowledge"], "feedback": "Ansioso demais. Explore mais a dor antes de apresentar.", "is_optimal": false, "leads_to_next_stage": false},
  {"text": "Sim, isso é muito comum. Várias empresas passam por isso.", "rapport_change": 0, "skill_tags": ["rapport_building"], "feedback": "Validou a dor, mas não explorou. Continue perguntando.", "is_optimal": false, "leads_to_next_stage": false}
]',
'Quantifique a dor! Pergunte sobre impacto em números.');

-- PRESENTATION
INSERT INTO public.sales_message_templates (organization_id, stage_key, persona_personality, sequence_order, client_message, response_options, context_hint) VALUES
(NULL, 'presentation', NULL, 1, 
'Interessante. E como vocês resolveriam esse problema?',
'[
  {"text": "Baseado no que você me contou sobre [dor específica], nossa solução faz [benefício concreto]. Em um cliente similar, conseguimos [resultado mensurável].", "rapport_change": 15, "skill_tags": ["value_proposition", "product_knowledge"], "feedback": "Perfeito! Você conectou a solução à dor específica com prova social.", "is_optimal": true, "leads_to_next_stage": true},
  {"text": "Nosso sistema tem mais de 50 funcionalidades. Deixa eu passar por cada uma delas.", "rapport_change": -10, "skill_tags": [], "feedback": "Muito genérico e entediante. Foque no que importa para ESTE cliente.", "is_optimal": false, "leads_to_next_stage": false},
  {"text": "É simples! Você só precisa contratar nosso plano premium de R$5.000/mês.", "rapport_change": -15, "skill_tags": [], "feedback": "Nunca fale de preço antes de estabelecer valor!", "is_optimal": false, "leads_to_next_stage": false}
]',
'Conecte a solução diretamente às dores que o cliente mencionou.');

INSERT INTO public.sales_message_templates (organization_id, stage_key, persona_personality, sequence_order, client_message, response_options, context_hint) VALUES
(NULL, 'presentation', NULL, 2, 
'Parece bom. Vocês têm algum case de sucesso?',
'[
  {"text": "Sim! A [Empresa Similar] tinha exatamente esse problema. Em 3 meses, eles [resultado concreto]. Posso te conectar com eles se quiser.", "rapport_change": 15, "skill_tags": ["product_knowledge", "value_proposition"], "feedback": "Excelente! Case relevante + oferta de referência = credibilidade.", "is_optimal": true, "leads_to_next_stage": true},
  {"text": "Temos vários! Apple, Google, Amazon... todos usam nossa solução.", "rapport_change": -5, "skill_tags": [], "feedback": "Muito genérico e possivelmente falso. Use cases reais e similares.", "is_optimal": false, "leads_to_next_stage": false},
  {"text": "Ainda estamos construindo nosso portfólio, mas nosso produto é muito bom!", "rapport_change": -10, "skill_tags": [], "feedback": "Falta de prova social gera desconfiança.", "is_optimal": false, "leads_to_next_stage": false}
]',
'Use cases de empresas similares ao cliente, não apenas famosas.');

-- OBJECTION
INSERT INTO public.sales_message_templates (organization_id, stage_key, persona_personality, sequence_order, client_message, response_options, context_hint) VALUES
(NULL, 'objection', NULL, 1, 
'Legal, mas achei um pouco caro para o que oferece.',
'[
  {"text": "Entendo sua preocupação com o investimento. Você mencionou que [dor] está custando [valor]. Se resolvermos isso, qual seria o retorno em 6 meses?", "rapport_change": 12, "skill_tags": ["objection_handling", "value_proposition"], "feedback": "Excelente! Você reposicionou o preço como investimento com retorno.", "is_optimal": true, "leads_to_next_stage": true},
  {"text": "Mas é o mais barato do mercado! Nossos concorrentes cobram o dobro.", "rapport_change": -10, "skill_tags": [], "feedback": "Competir por preço diminui seu valor percebido.", "is_optimal": false, "leads_to_next_stage": false},
  {"text": "Posso dar 30% de desconto se fechar hoje!", "rapport_change": -5, "skill_tags": ["closing_technique"], "feedback": "Desconto imediato passa despero e desvaloriza o produto.", "is_optimal": false, "leads_to_next_stage": false}
]',
'Não defenda o preço. Reposicione como investimento com retorno.');

INSERT INTO public.sales_message_templates (organization_id, stage_key, persona_personality, sequence_order, client_message, response_options, context_hint) VALUES
(NULL, 'objection', NULL, 2, 
'Preciso pensar e conversar com meu time antes de decidir.',
'[
  {"text": "Claro, faz total sentido! Que tal agendarmos uma call com seu time para eu responder todas as dúvidas de uma vez? Assim você não precisa repassar tudo.", "rapport_change": 12, "skill_tags": ["objection_handling", "closing_technique"], "feedback": "Ótimo! Você avançou o processo ao invés de esperar passivamente.", "is_optimal": true, "leads_to_next_stage": true},
  {"text": "Ok, me liga quando decidir então.", "rapport_change": -15, "skill_tags": [], "feedback": "Muito passivo! Você perdeu o controle do processo.", "is_optimal": false, "leads_to_next_stage": false},
  {"text": "Mas você é o decisor, certo? Por que precisa consultar outros?", "rapport_change": -20, "skill_tags": [], "feedback": "Isso soa agressivo e desrespeitoso.", "is_optimal": false, "leads_to_next_stage": false}
]',
'Não aceite vagos. Proponha um próximo passo concreto.');

-- CLOSING
INSERT INTO public.sales_message_templates (organization_id, stage_key, persona_personality, sequence_order, client_message, response_options, context_hint) VALUES
(NULL, 'closing', NULL, 1, 
'Ok, acho que faz sentido para nós. Qual o próximo passo?',
'[
  {"text": "Ótimo! Posso enviar a proposta agora e agendamos uma call amanhã para revisar juntos. Às 10h ou 14h fica melhor?", "rapport_change": 15, "skill_tags": ["closing_technique"], "feedback": "Perfeito! Você deu opções concretas e manteve o momentum.", "is_optimal": true, "leads_to_next_stage": true},
  {"text": "Vou enviar a proposta por email e você me avisa quando quiser fechar!", "rapport_change": -10, "skill_tags": [], "feedback": "Sem urgência ou próximo passo definido. O deal vai esfriar.", "is_optimal": false, "leads_to_next_stage": false},
  {"text": "Maravilha! Deixa eu te mandar todos os nossos planos para você escolher.", "rapport_change": -5, "skill_tags": [], "feedback": "Muitas opções criam paralisia. Recomende um plano específico.", "is_optimal": false, "leads_to_next_stage": false}
]',
'Sempre termine com próximo passo concreto e data definida.');

INSERT INTO public.sales_message_templates (organization_id, stage_key, persona_personality, sequence_order, client_message, response_options, context_hint) VALUES
(NULL, 'closing', NULL, 2, 
'Perfeito, vamos fazer! Me manda o contrato.',
'[
  {"text": "Excelente decisão! Estou enviando agora. Bem-vindo à família! Qualquer dúvida, estou aqui. 🎉", "rapport_change": 20, "skill_tags": ["closing_technique", "rapport_building"], "feedback": "Parabéns! Venda fechada com elegância!", "is_optimal": true, "leads_to_next_stage": true},
  {"text": "Ok, vou enviar.", "rapport_change": 5, "skill_tags": [], "feedback": "Funciona, mas poderia celebrar mais o momento.", "is_optimal": false, "leads_to_next_stage": true},
  {"text": "Antes de enviar, quer conhecer nossos outros produtos também?", "rapport_change": -10, "skill_tags": [], "feedback": "Upsell agora pode fazer o cliente repensar tudo.", "is_optimal": false, "leads_to_next_stage": false}
]',
'Celebre a vitória! Não tente vender mais coisas agora.');