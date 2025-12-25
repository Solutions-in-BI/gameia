-- ==========================================
-- MVP GAMIFICAÇÃO EMPRESARIAL
-- ==========================================

-- 1) SKILL TREE - Árvore de Habilidades
CREATE TABLE public.skill_tree (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT NOT NULL DEFAULT '🎯',
  category_id UUID REFERENCES public.quiz_categories(id),
  parent_skill_id UUID REFERENCES public.skill_tree(id),
  level INT NOT NULL DEFAULT 1,
  xp_required INT NOT NULL DEFAULT 100,
  is_unlocked_by_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2) USER SKILLS - Progresso do usuário nas skills
CREATE TABLE public.user_skills (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  skill_id UUID NOT NULL REFERENCES public.skill_tree(id),
  is_unlocked BOOLEAN DEFAULT false,
  xp_earned INT DEFAULT 0,
  mastery_level INT DEFAULT 0, -- 0-5 estrelas
  unlocked_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, skill_id)
);

-- 3) CENÁRIOS DE DECISÃO
CREATE TABLE public.decision_scenarios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID REFERENCES public.quiz_categories(id),
  title TEXT NOT NULL,
  context TEXT NOT NULL, -- Descrição do cenário
  difficulty TEXT NOT NULL DEFAULT 'medium', -- easy, medium, hard
  xp_reward INT DEFAULT 50,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 4) OPÇÕES DE DECISÃO
CREATE TABLE public.decision_options (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  scenario_id UUID NOT NULL REFERENCES public.decision_scenarios(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  impact_score INT DEFAULT 0, -- -100 a +100
  cost_score INT DEFAULT 0, -- 0 a 100
  risk_score INT DEFAULT 0, -- 0 a 100
  feedback TEXT NOT NULL, -- Explicação da consequência
  is_optimal BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 5) RESPOSTAS DE CENÁRIO DO USUÁRIO
CREATE TABLE public.user_decision_answers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  scenario_id UUID NOT NULL REFERENCES public.decision_scenarios(id),
  option_id UUID NOT NULL REFERENCES public.decision_options(id),
  time_taken INT NOT NULL, -- milissegundos
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 6) PERFIL DE COMPETÊNCIAS DO USUÁRIO
CREATE TABLE public.user_competency_profile (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  decision_speed_avg INT DEFAULT 0, -- tempo médio de decisão
  risk_tolerance DECIMAL(3,2) DEFAULT 0.50, -- 0.0 a 1.0
  impact_focus DECIMAL(3,2) DEFAULT 0.50, -- prioriza impacto vs custo
  consistency_score DECIMAL(3,2) DEFAULT 0.00, -- consistência nas respostas
  total_scenarios_completed INT DEFAULT 0,
  total_correct_decisions INT DEFAULT 0,
  strengths TEXT[], -- áreas fortes
  weaknesses TEXT[], -- áreas a melhorar
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 7) MODOS DE JOGO
ALTER TABLE public.quiz_matches ADD COLUMN IF NOT EXISTS game_mode TEXT DEFAULT 'normal';
-- Modos: normal (15s), blitz (5s), strategy (60s), hardcore (10s sem dicas)

-- 8) RECOMPENSAS SIMBÓLICAS
CREATE TABLE public.symbolic_rewards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT NOT NULL,
  type TEXT NOT NULL, -- day_off, course, mentorship, highlight, priority, experience
  coins_required INT DEFAULT 0,
  level_required INT DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 9) RECOMPENSAS RESGATADAS
CREATE TABLE public.user_rewards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  reward_id UUID NOT NULL REFERENCES public.symbolic_rewards(id),
  status TEXT DEFAULT 'pending', -- pending, approved, redeemed
  redeemed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ==========================================
-- RLS POLICIES
-- ==========================================

ALTER TABLE public.skill_tree ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.decision_scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.decision_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_decision_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_competency_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.symbolic_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_rewards ENABLE ROW LEVEL SECURITY;

-- Skill Tree (todos podem ver)
CREATE POLICY "Anyone can view skill tree" ON public.skill_tree FOR SELECT USING (true);

-- User Skills
CREATE POLICY "Users can view their own skills" ON public.user_skills FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own skills" ON public.user_skills FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own skills" ON public.user_skills FOR UPDATE USING (auth.uid() = user_id);

-- Decision Scenarios (todos podem ver)
CREATE POLICY "Anyone can view scenarios" ON public.decision_scenarios FOR SELECT USING (true);
CREATE POLICY "Anyone can view options" ON public.decision_options FOR SELECT USING (true);

-- User Decision Answers
CREATE POLICY "Users can view their own decisions" ON public.user_decision_answers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own decisions" ON public.user_decision_answers FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Competency Profile
CREATE POLICY "Users can view their own profile" ON public.user_competency_profile FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.user_competency_profile FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.user_competency_profile FOR UPDATE USING (auth.uid() = user_id);

-- Symbolic Rewards (todos podem ver)
CREATE POLICY "Anyone can view rewards" ON public.symbolic_rewards FOR SELECT USING (true);

-- User Rewards
CREATE POLICY "Users can view their own rewards" ON public.user_rewards FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own rewards" ON public.user_rewards FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ==========================================
-- DADOS INICIAIS
-- ==========================================

-- Skills de Marketing
INSERT INTO public.skill_tree (name, description, icon, category_id, level, xp_required, is_unlocked_by_default)
SELECT 'SEO Básico', 'Fundamentos de otimização para buscas', '🔍', id, 1, 100, true
FROM public.quiz_categories WHERE name = 'Marketing Digital';

INSERT INTO public.skill_tree (name, description, icon, category_id, parent_skill_id, level, xp_required)
SELECT 'SEO Avançado', 'Técnicas avançadas de SEO', '🎯', c.id, s.id, 2, 250
FROM public.quiz_categories c, public.skill_tree s
WHERE c.name = 'Marketing Digital' AND s.name = 'SEO Básico';

INSERT INTO public.skill_tree (name, description, icon, category_id, parent_skill_id, level, xp_required)
SELECT 'Growth Hacker', 'Estratégias de crescimento acelerado', '🚀', c.id, s.id, 3, 500
FROM public.quiz_categories c, public.skill_tree s
WHERE c.name = 'Marketing Digital' AND s.name = 'SEO Avançado';

-- Skills de Projetos
INSERT INTO public.skill_tree (name, description, icon, category_id, level, xp_required, is_unlocked_by_default)
SELECT 'Planejamento', 'Fundamentos de planejamento de projetos', '📋', id, 1, 100, true
FROM public.quiz_categories WHERE name = 'Gestão de Projetos';

INSERT INTO public.skill_tree (name, description, icon, category_id, parent_skill_id, level, xp_required)
SELECT 'Scrum Master', 'Metodologia ágil Scrum', '🔄', c.id, s.id, 2, 250
FROM public.quiz_categories c, public.skill_tree s
WHERE c.name = 'Gestão de Projetos' AND s.name = 'Planejamento';

INSERT INTO public.skill_tree (name, description, icon, category_id, parent_skill_id, level, xp_required)
SELECT 'Product Owner', 'Gestão de produto', '👑', c.id, s.id, 3, 500
FROM public.quiz_categories c, public.skill_tree s
WHERE c.name = 'Gestão de Projetos' AND s.name = 'Scrum Master';

-- Cenários de Decisão
INSERT INTO public.decision_scenarios (category_id, title, context, difficulty, xp_reward)
SELECT id, 
  'Projeto Atrasado', 
  'O projeto está 2 semanas atrasado e o cliente está pressionando. A equipe está desmotivada e o orçamento está no limite. Você precisa tomar uma decisão urgente.',
  'hard',
  100
FROM public.quiz_categories WHERE name = 'Gestão de Projetos';

INSERT INTO public.decision_options (scenario_id, option_text, impact_score, cost_score, risk_score, feedback, is_optimal)
SELECT s.id,
  'Negociar extensão de prazo com o cliente',
  70, 20, 30,
  'Boa escolha! Negociar de forma transparente preserva o relacionamento e permite entregar com qualidade. Impacto positivo no longo prazo.',
  true
FROM public.decision_scenarios s WHERE s.title = 'Projeto Atrasado';

INSERT INTO public.decision_options (scenario_id, option_text, impact_score, cost_score, risk_score, feedback, is_optimal)
SELECT s.id,
  'Contratar mais pessoas para acelerar',
  40, 90, 60,
  'Cuidado! Adicionar pessoas em projetos atrasados geralmente piora a situação (Lei de Brooks). Alto custo e risco.',
  false
FROM public.decision_scenarios s WHERE s.title = 'Projeto Atrasado';

INSERT INTO public.decision_options (scenario_id, option_text, impact_score, cost_score, risk_score, feedback, is_optimal)
SELECT s.id,
  'Cortar funcionalidades para entregar no prazo',
  50, 30, 50,
  'Opção viável se bem negociada. Priorize o MVP e deixe features secundárias para próximas versões.',
  false
FROM public.decision_scenarios s WHERE s.title = 'Projeto Atrasado';

INSERT INTO public.decision_options (scenario_id, option_text, impact_score, cost_score, risk_score, feedback, is_optimal)
SELECT s.id,
  'Fazer a equipe trabalhar em horas extras',
  20, 40, 80,
  'Péssima escolha! Horas extras prolongadas aumentam erros, burnout e rotatividade. Prejudica qualidade e moral.',
  false
FROM public.decision_scenarios s WHERE s.title = 'Projeto Atrasado';

-- Mais cenários
INSERT INTO public.decision_scenarios (category_id, title, context, difficulty, xp_reward)
SELECT id, 
  'Cliente Insatisfeito', 
  'Um cliente importante reclamou publicamente nas redes sociais sobre seu produto. A repercussão está crescendo e outros clientes estão vendo.',
  'medium',
  75
FROM public.quiz_categories WHERE name = 'Marketing Digital';

INSERT INTO public.decision_options (scenario_id, option_text, impact_score, cost_score, risk_score, feedback, is_optimal)
SELECT s.id,
  'Responder publicamente com transparência e oferecer solução',
  90, 20, 20,
  'Excelente! Transparência e agilidade na resposta pública mostram maturidade e podem reverter a situação.',
  true
FROM public.decision_scenarios s WHERE s.title = 'Cliente Insatisfeito';

INSERT INTO public.decision_options (scenario_id, option_text, impact_score, cost_score, risk_score, feedback, is_optimal)
SELECT s.id,
  'Deletar os comentários negativos',
  -50, 10, 95,
  'Péssima escolha! Deletar comentários gera efeito Streisand e destruição de confiança. Nunca faça isso.',
  false
FROM public.decision_scenarios s WHERE s.title = 'Cliente Insatisfeito';

INSERT INTO public.decision_options (scenario_id, option_text, impact_score, cost_score, risk_score, feedback, is_optimal)
SELECT s.id,
  'Ignorar e esperar passar',
  -30, 5, 70,
  'Ignorar só piora. Clientes percebem falta de cuidado e a situação pode escalar.',
  false
FROM public.decision_scenarios s WHERE s.title = 'Cliente Insatisfeito';

-- Recompensas Simbólicas
INSERT INTO public.symbolic_rewards (name, description, icon, type, coins_required, level_required) VALUES
('Day Off Merecido', 'Um dia de folga extra pelo seu desempenho', '🏖️', 'day_off', 5000, 10),
('Curso Premium', 'Acesso a um curso da plataforma escolhida', '📚', 'course', 3000, 5),
('Mentoria VIP', 'Uma hora de mentoria com líder da empresa', '🎓', 'mentorship', 4000, 8),
('Destaque do Mês', 'Reconhecimento na comunicação interna', '⭐', 'highlight', 1000, 3),
('Escolha de Projeto', 'Prioridade na escolha do próximo projeto', '🎯', 'priority', 2500, 6),
('Workshop Exclusivo', 'Participação em workshop especial', '🎪', 'experience', 2000, 4);