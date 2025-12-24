-- Criar enum para dificuldade das perguntas
CREATE TYPE public.quiz_difficulty AS ENUM ('easy', 'medium', 'hard');

-- Criar enum para status da partida
CREATE TYPE public.quiz_match_status AS ENUM ('waiting', 'in_progress', 'finished', 'cancelled');

-- Tabela de categorias de quiz
CREATE TABLE public.quiz_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT '📚',
  description TEXT,
  color TEXT NOT NULL DEFAULT '#3B82F6',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de perguntas
CREATE TABLE public.quiz_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID REFERENCES public.quiz_categories(id) ON DELETE CASCADE NOT NULL,
  question TEXT NOT NULL,
  options JSONB NOT NULL, -- Array de 4 opções
  correct_answer INTEGER NOT NULL, -- Índice da resposta correta (0-3)
  explanation TEXT, -- Explicação educativa
  difficulty public.quiz_difficulty NOT NULL DEFAULT 'medium',
  xp_reward INTEGER NOT NULL DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de partidas
CREATE TABLE public.quiz_matches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID REFERENCES public.quiz_categories(id) NOT NULL,
  player1_id UUID NOT NULL,
  player2_id UUID,
  player1_score INTEGER NOT NULL DEFAULT 0,
  player2_score INTEGER NOT NULL DEFAULT 0,
  status public.quiz_match_status NOT NULL DEFAULT 'waiting',
  questions JSONB, -- IDs das perguntas selecionadas
  current_question INTEGER NOT NULL DEFAULT 0,
  winner_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  finished_at TIMESTAMP WITH TIME ZONE
);

-- Tabela de apostas
CREATE TABLE public.quiz_bets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID REFERENCES public.quiz_matches(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  bet_on_player_id UUID NOT NULL,
  coins_bet INTEGER NOT NULL,
  coins_won INTEGER,
  is_won BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de histórico de respostas do jogador
CREATE TABLE public.quiz_answers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID REFERENCES public.quiz_matches(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  question_id UUID REFERENCES public.quiz_questions(id) NOT NULL,
  answer_index INTEGER NOT NULL,
  is_correct BOOLEAN NOT NULL,
  time_taken INTEGER NOT NULL, -- milissegundos
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.quiz_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_bets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_answers ENABLE ROW LEVEL SECURITY;

-- Políticas para categorias (públicas para leitura)
CREATE POLICY "Categorias são públicas" ON public.quiz_categories
FOR SELECT USING (is_active = true);

-- Políticas para perguntas (públicas para leitura)
CREATE POLICY "Perguntas são públicas" ON public.quiz_questions
FOR SELECT USING (true);

-- Políticas para partidas
CREATE POLICY "Usuários podem ver partidas públicas" ON public.quiz_matches
FOR SELECT USING (true);

CREATE POLICY "Usuários autenticados podem criar partidas" ON public.quiz_matches
FOR INSERT WITH CHECK (auth.uid() = player1_id);

CREATE POLICY "Jogadores podem atualizar próprias partidas" ON public.quiz_matches
FOR UPDATE USING (auth.uid() = player1_id OR auth.uid() = player2_id);

-- Políticas para apostas
CREATE POLICY "Usuários podem ver próprias apostas" ON public.quiz_bets
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar apostas" ON public.quiz_bets
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Sistema pode atualizar apostas" ON public.quiz_bets
FOR UPDATE USING (auth.uid() = user_id);

-- Políticas para respostas
CREATE POLICY "Usuários podem ver próprias respostas" ON public.quiz_answers
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar respostas" ON public.quiz_answers
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Habilitar realtime para partidas
ALTER PUBLICATION supabase_realtime ADD TABLE public.quiz_matches;

-- Inserir categorias iniciais
INSERT INTO public.quiz_categories (name, icon, description, color) VALUES
('Marketing Digital', '📱', 'Estratégias de marketing online, redes sociais e SEO', '#EC4899'),
('Gestão de Projetos', '📊', 'Metodologias ágeis, Scrum, Kanban e gestão de equipes', '#3B82F6'),
('Vendas B2B', '💼', 'Técnicas de vendas, negociação e relacionamento com clientes', '#10B981'),
('Liderança', '👥', 'Gestão de pessoas, comunicação e desenvolvimento de equipes', '#F59E0B'),
('Metodologias Ágeis', '🚀', 'Scrum, Kanban, XP e práticas ágeis', '#8B5CF6');

-- Inserir perguntas de Marketing Digital
INSERT INTO public.quiz_questions (category_id, question, options, correct_answer, explanation, difficulty, xp_reward) VALUES
((SELECT id FROM quiz_categories WHERE name = 'Marketing Digital'),
'Qual é a principal métrica para medir o sucesso de uma campanha de email marketing?',
'["Número de seguidores", "Taxa de abertura e cliques", "Curtidas nas redes sociais", "Visitas ao site"]',
1, 'A taxa de abertura e cliques indica diretamente o engajamento dos destinatários com o conteúdo do email.', 'easy', 10),

((SELECT id FROM quiz_categories WHERE name = 'Marketing Digital'),
'O que significa SEO?',
'["Social Engine Optimization", "Search Engine Optimization", "Sales Engine Operations", "Site Enhancement Online"]',
1, 'SEO (Search Engine Optimization) são técnicas para melhorar o posicionamento de sites nos mecanismos de busca.', 'easy', 10),

((SELECT id FROM quiz_categories WHERE name = 'Marketing Digital'),
'Qual estratégia NÃO é recomendada para crescer no Instagram?',
'["Usar hashtags relevantes", "Comprar seguidores", "Postar consistentemente", "Interagir com seguidores"]',
1, 'Comprar seguidores prejudica o engajamento real e pode resultar em penalizações do algoritmo.', 'easy', 10),

((SELECT id FROM quiz_categories WHERE name = 'Marketing Digital'),
'O que é funil de vendas?',
'["Ferramenta de design", "Jornada do cliente da descoberta à compra", "Tipo de anúncio", "Software de CRM"]',
1, 'O funil de vendas representa as etapas que um potencial cliente percorre até realizar uma compra.', 'medium', 15),

((SELECT id FROM quiz_categories WHERE name = 'Marketing Digital'),
'Qual é a melhor prática para CTAs (Call to Action)?',
'["Usar textos longos", "Ser claro e direto", "Esconder no final da página", "Usar cores neutras"]',
1, 'CTAs devem ser claros, diretos e visualmente destacados para incentivar a ação do usuário.', 'medium', 15);

-- Inserir perguntas de Gestão de Projetos
INSERT INTO public.quiz_questions (category_id, question, options, correct_answer, explanation, difficulty, xp_reward) VALUES
((SELECT id FROM quiz_categories WHERE name = 'Gestão de Projetos'),
'Qual é a duração recomendada de uma Sprint no Scrum?',
'["1 dia", "1 a 4 semanas", "3 meses", "6 meses"]',
1, 'Sprints geralmente duram de 1 a 4 semanas, sendo 2 semanas a duração mais comum.', 'easy', 10),

((SELECT id FROM quiz_categories WHERE name = 'Gestão de Projetos'),
'O que é um MVP?',
'["Most Valuable Player", "Minimum Viable Product", "Maximum Visible Project", "Marketing Value Proposition"]',
1, 'MVP é o Produto Mínimo Viável, versão inicial com funcionalidades essenciais para validar hipóteses.', 'easy', 10),

((SELECT id FROM quiz_categories WHERE name = 'Gestão de Projetos'),
'Quem é responsável pelo backlog do produto no Scrum?',
'["Scrum Master", "Product Owner", "Time de Desenvolvimento", "Stakeholders"]',
1, 'O Product Owner é o responsável por priorizar e gerenciar o backlog do produto.', 'medium', 15),

((SELECT id FROM quiz_categories WHERE name = 'Gestão de Projetos'),
'O que é a Daily Scrum?',
'["Reunião semanal de planejamento", "Reunião diária de 15 minutos", "Retrospectiva do projeto", "Reunião com cliente"]',
1, 'A Daily Scrum é uma reunião diária de no máximo 15 minutos para sincronização do time.', 'easy', 10),

((SELECT id FROM quiz_categories WHERE name = 'Gestão de Projetos'),
'Qual ferramenta é usada para visualizar o fluxo de trabalho no Kanban?',
'["Gráfico de Gantt", "Quadro Kanban", "Burndown Chart", "Diagrama de Pareto"]',
1, 'O Quadro Kanban visualiza o fluxo de trabalho com colunas representando cada etapa do processo.', 'easy', 10);

-- Inserir perguntas de Vendas B2B
INSERT INTO public.quiz_questions (category_id, question, options, correct_answer, explanation, difficulty, xp_reward) VALUES
((SELECT id FROM quiz_categories WHERE name = 'Vendas B2B'),
'O que significa B2B?',
'["Business to Business", "Back to Basics", "Buy to Buy", "Best to Best"]',
0, 'B2B significa Business to Business, vendas entre empresas.', 'easy', 10),

((SELECT id FROM quiz_categories WHERE name = 'Vendas B2B'),
'Qual é a primeira etapa do processo de vendas consultivas?',
'["Fechamento", "Descoberta/Qualificação", "Apresentação", "Negociação"]',
1, 'A descoberta e qualificação permitem entender as necessidades do cliente antes de propor soluções.', 'medium', 15),

((SELECT id FROM quiz_categories WHERE name = 'Vendas B2B'),
'O que é CAC?',
'["Customer Acquisition Cost", "Client Average Commission", "Company Annual Contribution", "Cost Analysis Chart"]',
0, 'CAC é o Custo de Aquisição de Cliente, quanto custa para conquistar um novo cliente.', 'medium', 15),

((SELECT id FROM quiz_categories WHERE name = 'Vendas B2B'),
'Qual técnica é mais eficaz para lidar com objeções?',
'["Ignorar a objeção", "Perguntar para entender melhor", "Pressionar o cliente", "Oferecer desconto imediato"]',
1, 'Perguntar para entender a objeção permite endereçá-la de forma personalizada e eficaz.', 'medium', 15);

-- Inserir perguntas de Liderança
INSERT INTO public.quiz_questions (category_id, question, options, correct_answer, explanation, difficulty, xp_reward) VALUES
((SELECT id FROM quiz_categories WHERE name = 'Liderança'),
'Qual é a característica principal de um líder servidor?',
'["Autoritarismo", "Servir a equipe primeiro", "Tomar todas as decisões", "Manter distância da equipe"]',
1, 'O líder servidor prioriza as necessidades da equipe e ajuda no desenvolvimento dos membros.', 'easy', 10),

((SELECT id FROM quiz_categories WHERE name = 'Liderança'),
'O que é feedback construtivo?',
'["Crítica negativa", "Orientação para melhoria com exemplos", "Elogio genérico", "Avaliação anual"]',
1, 'Feedback construtivo oferece orientações específicas para melhoria com exemplos práticos.', 'easy', 10),

((SELECT id FROM quiz_categories WHERE name = 'Liderança'),
'Qual estilo de liderança é mais adequado para equipes experientes?',
'["Autocrático", "Delegativo", "Microgerenciamento", "Coercitivo"]',
1, 'O estilo delegativo funciona bem com equipes experientes que precisam de autonomia.', 'medium', 15);

-- Inserir perguntas de Metodologias Ágeis
INSERT INTO public.quiz_questions (category_id, question, options, correct_answer, explanation, difficulty, xp_reward) VALUES
((SELECT id FROM quiz_categories WHERE name = 'Metodologias Ágeis'),
'Qual valor do Manifesto Ágil prioriza indivíduos?',
'["Processos sobre pessoas", "Indivíduos e interações sobre processos", "Documentação completa", "Contratos rígidos"]',
1, 'O Manifesto Ágil valoriza "Indivíduos e interações mais que processos e ferramentas".', 'easy', 10),

((SELECT id FROM quiz_categories WHERE name = 'Metodologias Ágeis'),
'O que é uma User Story?',
'["História do usuário no sistema", "Descrição de funcionalidade na perspectiva do usuário", "Manual do usuário", "Log de atividades"]',
1, 'User Story descreve uma funcionalidade do ponto de vista do usuário final.', 'easy', 10),

((SELECT id FROM quiz_categories WHERE name = 'Metodologias Ágeis'),
'O que significa WIP limit no Kanban?',
'["Limite de trabalho em progresso", "Limite de reuniões", "Limite de sprints", "Limite de membros"]',
0, 'WIP (Work in Progress) limit define quantos itens podem estar em andamento simultaneamente.', 'medium', 15),

((SELECT id FROM quiz_categories WHERE name = 'Metodologias Ágeis'),
'Qual é o objetivo da retrospectiva?',
'["Planejar próxima sprint", "Refletir e melhorar continuamente", "Apresentar para stakeholders", "Definir requisitos"]',
1, 'A retrospectiva permite que o time reflita sobre o que funcionou e o que pode melhorar.', 'easy', 10);