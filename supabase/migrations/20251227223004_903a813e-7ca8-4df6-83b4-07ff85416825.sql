
-- =============================================
-- TABELAS DE CONFIGURAÇÃO DO SISTEMA
-- =============================================

-- Configurações gerais do sistema
CREATE TABLE public.system_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text NOT NULL UNIQUE,
  setting_value jsonb NOT NULL,
  description text,
  category text DEFAULT 'general',
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Configurações de jogos (XP, moedas, skills por jogo)
CREATE TABLE public.game_configurations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_type text NOT NULL,
  display_name text NOT NULL,
  description text,
  icon text DEFAULT '🎮',
  is_active boolean DEFAULT true,
  xp_base_reward integer DEFAULT 10,
  xp_multiplier numeric(3,2) DEFAULT 1.00,
  coins_base_reward integer DEFAULT 5,
  coins_multiplier numeric(3,2) DEFAULT 1.00,
  skill_categories text[] DEFAULT '{}',
  difficulty_multipliers jsonb DEFAULT '{"easy": 0.5, "medium": 1.0, "hard": 1.5}'::jsonb,
  time_bonus_config jsonb DEFAULT '{"enabled": true, "max_bonus_percent": 50}'::jsonb,
  streak_bonus_config jsonb DEFAULT '{"enabled": true, "bonus_per_day": 5, "max_bonus": 50}'::jsonb,
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(game_type, organization_id)
);

-- Configurações de níveis e progressão
CREATE TABLE public.level_configurations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  level integer NOT NULL,
  xp_required integer NOT NULL,
  title text,
  rewards jsonb DEFAULT '{"coins": 0, "badge_id": null}'::jsonb,
  perks text[],
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(level, organization_id)
);

-- =============================================
-- SISTEMA DE INSÍGNIAS/BADGES
-- =============================================

-- Categorias de insígnias
CREATE TABLE public.badge_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_key text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  icon text DEFAULT '🏅',
  color text DEFAULT '#FFD700',
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Insígnias disponíveis
CREATE TABLE public.badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  badge_key text NOT NULL,
  category_id uuid REFERENCES public.badge_categories(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  icon text NOT NULL,
  rarity text DEFAULT 'common' CHECK (rarity IN ('common', 'uncommon', 'rare', 'epic', 'legendary')),
  xp_reward integer DEFAULT 0,
  coins_reward integer DEFAULT 0,
  is_active boolean DEFAULT true,
  is_secret boolean DEFAULT false,
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(badge_key, organization_id)
);

-- Requisitos para desbloquear insígnias
CREATE TABLE public.badge_requirements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  badge_id uuid NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  requirement_type text NOT NULL,
  requirement_key text NOT NULL,
  requirement_operator text DEFAULT '>=' CHECK (requirement_operator IN ('=', '>', '<', '>=', '<=', 'in', 'contains')),
  requirement_value jsonb NOT NULL,
  is_required boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Insígnias conquistadas pelos usuários
CREATE TABLE public.user_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  badge_id uuid NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  unlocked_at timestamptz DEFAULT now(),
  is_displayed boolean DEFAULT false,
  progress jsonb DEFAULT '{}'::jsonb,
  UNIQUE(user_id, badge_id)
);

-- Progresso em tempo real para insígnias
CREATE TABLE public.user_badge_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  badge_id uuid NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  current_progress jsonb DEFAULT '{}'::jsonb,
  last_updated timestamptz DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

-- =============================================
-- HISTÓRICO DE RECOMPENSAS
-- =============================================

CREATE TABLE public.reward_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  transaction_type text NOT NULL CHECK (transaction_type IN ('xp', 'coins', 'badge', 'item', 'skill')),
  source_type text NOT NULL,
  source_id uuid,
  amount integer DEFAULT 0,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- =============================================
-- CONFIGURAÇÕES DE SKILLS
-- =============================================

CREATE TABLE public.skill_configurations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  skill_key text NOT NULL,
  name text NOT NULL,
  description text,
  icon text DEFAULT '⭐',
  color text DEFAULT '#3B82F6',
  max_level integer DEFAULT 100,
  category text,
  related_games text[],
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(skill_key, organization_id)
);

-- Skills dos usuários
CREATE TABLE public.user_skill_levels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  skill_id uuid NOT NULL REFERENCES public.skill_configurations(id) ON DELETE CASCADE,
  current_level integer DEFAULT 0,
  current_xp integer DEFAULT 0,
  total_xp integer DEFAULT 0,
  last_practiced timestamptz DEFAULT now(),
  UNIQUE(user_id, skill_id)
);

-- =============================================
-- RLS POLICIES
-- =============================================

ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.level_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badge_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badge_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badge_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reward_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_skill_levels ENABLE ROW LEVEL SECURITY;

-- Políticas de leitura (todos podem ver configurações)
CREATE POLICY "Anyone can view system settings" ON public.system_settings FOR SELECT USING (organization_id IS NULL OR organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()));
CREATE POLICY "Anyone can view game configs" ON public.game_configurations FOR SELECT USING (true);
CREATE POLICY "Anyone can view level configs" ON public.level_configurations FOR SELECT USING (true);
CREATE POLICY "Anyone can view badge categories" ON public.badge_categories FOR SELECT USING (true);
CREATE POLICY "Anyone can view badges" ON public.badges FOR SELECT USING (is_active = true);
CREATE POLICY "Anyone can view badge requirements" ON public.badge_requirements FOR SELECT USING (true);
CREATE POLICY "Anyone can view skill configs" ON public.skill_configurations FOR SELECT USING (true);

-- Políticas de usuário
CREATE POLICY "Users can view own badges" ON public.user_badges FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own badges" ON public.user_badges FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own badges" ON public.user_badges FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own badge progress" ON public.user_badge_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own badge progress" ON public.user_badge_progress FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own reward transactions" ON public.reward_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own reward transactions" ON public.reward_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own skill levels" ON public.user_skill_levels FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own skill levels" ON public.user_skill_levels FOR ALL USING (auth.uid() = user_id);

-- =============================================
-- DADOS INICIAIS - CATEGORIAS DE INSÍGNIAS
-- =============================================

INSERT INTO public.badge_categories (category_key, name, description, icon, color, display_order) VALUES
('time', 'Tempo de Casa', 'Reconhecimento por tempo de permanência', '⏰', '#10B981', 1),
('collaboration', 'Colaboração', 'Conquistas relacionadas a trabalho em equipe', '🤝', '#8B5CF6', 2),
('coins', 'Economia', 'Marcos de acumulação de moedas', '💰', '#F59E0B', 3),
('knowledge', 'Conhecimento', 'Aprendizado e domínio de habilidades', '📚', '#3B82F6', 4),
('games', 'Jogador', 'Conquistas em jogos', '🎮', '#EC4899', 5),
('streak', 'Consistência', 'Sequências de atividade', '🔥', '#EF4444', 6),
('social', 'Social', 'Interações e amizades', '👥', '#06B6D4', 7),
('special', 'Especial', 'Conquistas raras e eventos especiais', '✨', '#FFD700', 8);

-- =============================================
-- DADOS INICIAIS - INSÍGNIAS
-- =============================================

INSERT INTO public.badges (badge_key, category_id, name, description, icon, rarity, xp_reward, coins_reward) VALUES
-- Tempo de Casa
('week_1', (SELECT id FROM badge_categories WHERE category_key = 'time'), 'Primeira Semana', 'Completou sua primeira semana na plataforma', '🌱', 'common', 50, 10),
('month_1', (SELECT id FROM badge_categories WHERE category_key = 'time'), 'Primeiro Mês', 'Um mês de dedicação e crescimento', '🌿', 'uncommon', 100, 25),
('month_3', (SELECT id FROM badge_categories WHERE category_key = 'time'), 'Trimestre de Ouro', '3 meses de jornada contínua', '🌳', 'rare', 200, 50),
('month_6', (SELECT id FROM badge_categories WHERE category_key = 'time'), 'Meio Ano', '6 meses de compromisso exemplar', '🏆', 'epic', 500, 100),
('year_1', (SELECT id FROM badge_categories WHERE category_key = 'time'), 'Veterano', 'Um ano completo de história', '👑', 'legendary', 1000, 250),

-- Colaboração
('first_help', (SELECT id FROM badge_categories WHERE category_key = 'collaboration'), 'Primeiro Auxílio', 'Ajudou um colega pela primeira vez', '🤲', 'common', 30, 5),
('team_player', (SELECT id FROM badge_categories WHERE category_key = 'collaboration'), 'Jogador de Equipe', 'Participou de 10 atividades em grupo', '⚽', 'uncommon', 100, 20),
('mentor', (SELECT id FROM badge_categories WHERE category_key = 'collaboration'), 'Mentor', 'Orientou 5 novos membros', '🎓', 'rare', 250, 50),
('community_pillar', (SELECT id FROM badge_categories WHERE category_key = 'collaboration'), 'Pilar da Comunidade', 'Reconhecido como referência por 20+ pessoas', '🏛️', 'epic', 500, 100),
('legend', (SELECT id FROM badge_categories WHERE category_key = 'collaboration'), 'Lenda Viva', 'Impactou mais de 100 pessoas positivamente', '🌟', 'legendary', 1000, 250),

-- Economia/Moedas
('first_coins', (SELECT id FROM badge_categories WHERE category_key = 'coins'), 'Primeiras Moedas', 'Ganhou suas primeiras 100 moedas', '🪙', 'common', 20, 0),
('saver', (SELECT id FROM badge_categories WHERE category_key = 'coins'), 'Poupador', 'Acumulou 500 moedas', '💵', 'uncommon', 50, 0),
('investor', (SELECT id FROM badge_categories WHERE category_key = 'coins'), 'Investidor', 'Alcançou 2.000 moedas', '💎', 'rare', 100, 0),
('tycoon', (SELECT id FROM badge_categories WHERE category_key = 'coins'), 'Magnata', 'Conquistou 10.000 moedas', '🏦', 'epic', 250, 0),
('billionaire', (SELECT id FROM badge_categories WHERE category_key = 'coins'), 'Bilionário', 'Atingiu 50.000 moedas', '🤑', 'legendary', 500, 0),

-- Conhecimento
('first_lesson', (SELECT id FROM badge_categories WHERE category_key = 'knowledge'), 'Primeira Lição', 'Completou sua primeira atividade de aprendizado', '📖', 'common', 25, 5),
('quick_learner', (SELECT id FROM badge_categories WHERE category_key = 'knowledge'), 'Aprendiz Rápido', 'Dominou 3 habilidades básicas', '🧠', 'uncommon', 75, 15),
('specialist', (SELECT id FROM badge_categories WHERE category_key = 'knowledge'), 'Especialista', 'Atingiu nível avançado em uma área', '🎯', 'rare', 200, 40),
('polymath', (SELECT id FROM badge_categories WHERE category_key = 'knowledge'), 'Polímata', 'Domina 5+ áreas de conhecimento', '🔬', 'epic', 400, 80),
('sage', (SELECT id FROM badge_categories WHERE category_key = 'knowledge'), 'Sábio', 'Alcançou maestria em múltiplas disciplinas', '🧙', 'legendary', 800, 200),

-- Jogos
('first_game', (SELECT id FROM badge_categories WHERE category_key = 'games'), 'Primeiro Jogo', 'Jogou seu primeiro jogo', '🎲', 'common', 15, 5),
('gamer_10', (SELECT id FROM badge_categories WHERE category_key = 'games'), 'Jogador Casual', 'Completou 10 partidas', '🕹️', 'uncommon', 50, 15),
('gamer_50', (SELECT id FROM badge_categories WHERE category_key = 'games'), 'Jogador Dedicado', 'Completou 50 partidas', '🎮', 'rare', 150, 35),
('gamer_100', (SELECT id FROM badge_categories WHERE category_key = 'games'), 'Hardcore Gamer', 'Completou 100 partidas', '👾', 'epic', 300, 75),
('game_master', (SELECT id FROM badge_categories WHERE category_key = 'games'), 'Mestre dos Jogos', 'Completou 500 partidas', '🏅', 'legendary', 750, 200),

-- Streak/Consistência
('streak_3', (SELECT id FROM badge_categories WHERE category_key = 'streak'), 'Início Promissor', '3 dias consecutivos de atividade', '🔥', 'common', 30, 10),
('streak_7', (SELECT id FROM badge_categories WHERE category_key = 'streak'), 'Semana Perfeita', '7 dias consecutivos', '💪', 'uncommon', 75, 25),
('streak_30', (SELECT id FROM badge_categories WHERE category_key = 'streak'), 'Mês Impecável', '30 dias consecutivos', '⚡', 'rare', 200, 60),
('streak_90', (SELECT id FROM badge_categories WHERE category_key = 'streak'), 'Trimestre de Fogo', '90 dias consecutivos', '🌋', 'epic', 500, 150),
('streak_365', (SELECT id FROM badge_categories WHERE category_key = 'streak'), 'Inabalável', '365 dias consecutivos', '☀️', 'legendary', 1500, 500),

-- Social
('first_friend', (SELECT id FROM badge_categories WHERE category_key = 'social'), 'Primeiro Amigo', 'Fez sua primeira conexão', '🫂', 'common', 20, 5),
('social_5', (SELECT id FROM badge_categories WHERE category_key = 'social'), 'Sociável', '5 amigos na plataforma', '👋', 'uncommon', 50, 15),
('networker', (SELECT id FROM badge_categories WHERE category_key = 'social'), 'Networker', '20 conexões ativas', '🌐', 'rare', 125, 35),
('influencer', (SELECT id FROM badge_categories WHERE category_key = 'social'), 'Influenciador', '50 conexões e alto engajamento', '📢', 'epic', 300, 80),
('community_star', (SELECT id FROM badge_categories WHERE category_key = 'social'), 'Estrela da Comunidade', 'Referência social com 100+ conexões', '⭐', 'legendary', 750, 200);

-- =============================================
-- CONFIGURAÇÕES DE JOGOS
-- =============================================

INSERT INTO public.game_configurations (game_type, display_name, description, icon, xp_base_reward, coins_base_reward, skill_categories) VALUES
('memory', 'Jogo da Memória', 'Teste sua memória combinando pares de cartas', '🧠', 15, 8, ARRAY['memoria', 'concentracao', 'agilidade']),
('snake', 'Snake', 'Jogo clássico da cobrinha', '🐍', 10, 5, ARRAY['reflexo', 'estrategia', 'coordenacao']),
('tetris', 'Tetris', 'Encaixe as peças para completar linhas', '🧱', 12, 6, ARRAY['logica', 'espacial', 'velocidade']),
('dino', 'Dino Run', 'Corra e desvie dos obstáculos', '🦖', 8, 4, ARRAY['reflexo', 'timing', 'persistencia']),
('quiz', 'Quiz de Conhecimento', 'Teste seus conhecimentos em diversas áreas', '❓', 20, 10, ARRAY['conhecimento', 'raciocinio', 'memoria']),
('decisions', 'Decisões Estratégicas', 'Tome decisões empresariais simuladas', '🎯', 25, 12, ARRAY['lideranca', 'estrategia', 'analise']),
('sales', 'Desafio de Vendas', 'Simule negociações de vendas com IA', '💼', 30, 15, ARRAY['comunicacao', 'negociacao', 'empatia', 'persuasao']);

-- =============================================
-- CONFIGURAÇÕES DE NÍVEIS
-- =============================================

INSERT INTO public.level_configurations (level, xp_required, title, rewards, perks) VALUES
(1, 0, 'Iniciante', '{"coins": 0}'::jsonb, ARRAY['Acesso básico']),
(2, 100, 'Aprendiz', '{"coins": 10}'::jsonb, ARRAY['Desbloqueio de avatar']),
(3, 250, 'Praticante', '{"coins": 20}'::jsonb, ARRAY['Chat desbloqueado']),
(4, 500, 'Competente', '{"coins": 30}'::jsonb, ARRAY['Grupos de amigos']),
(5, 850, 'Proficiente', '{"coins": 50}'::jsonb, ARRAY['Desafios especiais']),
(6, 1300, 'Experiente', '{"coins": 75}'::jsonb, ARRAY['Molduras exclusivas']),
(7, 1850, 'Avançado', '{"coins": 100}'::jsonb, ARRAY['Títulos personalizados']),
(8, 2500, 'Expert', '{"coins": 150}'::jsonb, ARRAY['Animações de perfil']),
(9, 3300, 'Mestre', '{"coins": 200}'::jsonb, ARRAY['Acesso antecipado']),
(10, 4200, 'Grão-Mestre', '{"coins": 300}'::jsonb, ARRAY['Badge exclusivo']),
(11, 5200, 'Lenda', '{"coins": 400}'::jsonb, ARRAY['Efeitos especiais']),
(12, 6400, 'Mítico', '{"coins": 500}'::jsonb, ARRAY['Página de honra']),
(13, 7800, 'Imortal', '{"coins": 750}'::jsonb, ARRAY['Mentor oficial']),
(14, 9400, 'Transcendente', '{"coins": 1000}'::jsonb, ARRAY['Recompensas únicas']),
(15, 11200, 'Divino', '{"coins": 1500}'::jsonb, ARRAY['Tudo desbloqueado']);

-- =============================================
-- CONFIGURAÇÕES DE SKILLS
-- =============================================

INSERT INTO public.skill_configurations (skill_key, name, description, icon, color, category, related_games) VALUES
('memoria', 'Memória', 'Capacidade de recordar e reter informações', '🧠', '#8B5CF6', 'cognitivo', ARRAY['memory', 'quiz']),
('concentracao', 'Concentração', 'Foco e atenção sustentada', '🎯', '#EC4899', 'cognitivo', ARRAY['memory', 'tetris']),
('agilidade', 'Agilidade Mental', 'Velocidade de processamento', '⚡', '#F59E0B', 'cognitivo', ARRAY['memory', 'dino']),
('reflexo', 'Reflexo', 'Tempo de reação rápido', '🏃', '#EF4444', 'motor', ARRAY['snake', 'dino']),
('estrategia', 'Estratégia', 'Planejamento e tomada de decisão', '♟️', '#10B981', 'analitico', ARRAY['snake', 'decisions']),
('coordenacao', 'Coordenação', 'Sincronização motora e visual', '🤹', '#06B6D4', 'motor', ARRAY['snake', 'tetris']),
('logica', 'Lógica', 'Raciocínio lógico e dedutivo', '🔢', '#3B82F6', 'analitico', ARRAY['tetris', 'quiz']),
('espacial', 'Visão Espacial', 'Percepção e manipulação espacial', '📐', '#8B5CF6', 'cognitivo', ARRAY['tetris']),
('velocidade', 'Velocidade', 'Rapidez de execução', '💨', '#F97316', 'motor', ARRAY['tetris', 'dino']),
('timing', 'Timing', 'Precisão temporal', '⏱️', '#14B8A6', 'motor', ARRAY['dino']),
('persistencia', 'Persistência', 'Resiliência e determinação', '💪', '#DC2626', 'comportamental', ARRAY['dino', 'snake']),
('conhecimento', 'Conhecimento Geral', 'Amplo domínio de informações', '📚', '#6366F1', 'conhecimento', ARRAY['quiz']),
('raciocinio', 'Raciocínio', 'Capacidade analítica', '🧩', '#7C3AED', 'analitico', ARRAY['quiz', 'decisions']),
('lideranca', 'Liderança', 'Habilidade de liderar e influenciar', '👔', '#059669', 'interpessoal', ARRAY['decisions']),
('analise', 'Análise', 'Avaliação crítica de situações', '📊', '#0284C7', 'analitico', ARRAY['decisions']),
('comunicacao', 'Comunicação', 'Expressão clara e efetiva', '💬', '#DB2777', 'interpessoal', ARRAY['sales']),
('negociacao', 'Negociação', 'Arte de negociar e persuadir', '🤝', '#7C3AED', 'interpessoal', ARRAY['sales']),
('empatia', 'Empatia', 'Compreensão das necessidades alheias', '❤️', '#F43F5E', 'interpessoal', ARRAY['sales']),
('persuasao', 'Persuasão', 'Influência positiva sobre outros', '🎤', '#8B5CF6', 'interpessoal', ARRAY['sales']);

-- =============================================
-- REQUISITOS DAS INSÍGNIAS
-- =============================================

-- Tempo de Casa
INSERT INTO public.badge_requirements (badge_id, requirement_type, requirement_key, requirement_operator, requirement_value) VALUES
((SELECT id FROM badges WHERE badge_key = 'week_1'), 'time', 'days_since_registration', '>=', '7'::jsonb),
((SELECT id FROM badges WHERE badge_key = 'month_1'), 'time', 'days_since_registration', '>=', '30'::jsonb),
((SELECT id FROM badges WHERE badge_key = 'month_3'), 'time', 'days_since_registration', '>=', '90'::jsonb),
((SELECT id FROM badges WHERE badge_key = 'month_6'), 'time', 'days_since_registration', '>=', '180'::jsonb),
((SELECT id FROM badges WHERE badge_key = 'year_1'), 'time', 'days_since_registration', '>=', '365'::jsonb);

-- Moedas
INSERT INTO public.badge_requirements (badge_id, requirement_type, requirement_key, requirement_operator, requirement_value) VALUES
((SELECT id FROM badges WHERE badge_key = 'first_coins'), 'stats', 'total_coins_earned', '>=', '100'::jsonb),
((SELECT id FROM badges WHERE badge_key = 'saver'), 'stats', 'coins', '>=', '500'::jsonb),
((SELECT id FROM badges WHERE badge_key = 'investor'), 'stats', 'coins', '>=', '2000'::jsonb),
((SELECT id FROM badges WHERE badge_key = 'tycoon'), 'stats', 'coins', '>=', '10000'::jsonb),
((SELECT id FROM badges WHERE badge_key = 'billionaire'), 'stats', 'coins', '>=', '50000'::jsonb);

-- Jogos
INSERT INTO public.badge_requirements (badge_id, requirement_type, requirement_key, requirement_operator, requirement_value) VALUES
((SELECT id FROM badges WHERE badge_key = 'first_game'), 'stats', 'total_games_played', '>=', '1'::jsonb),
((SELECT id FROM badges WHERE badge_key = 'gamer_10'), 'stats', 'total_games_played', '>=', '10'::jsonb),
((SELECT id FROM badges WHERE badge_key = 'gamer_50'), 'stats', 'total_games_played', '>=', '50'::jsonb),
((SELECT id FROM badges WHERE badge_key = 'gamer_100'), 'stats', 'total_games_played', '>=', '100'::jsonb),
((SELECT id FROM badges WHERE badge_key = 'game_master'), 'stats', 'total_games_played', '>=', '500'::jsonb);

-- Streak
INSERT INTO public.badge_requirements (badge_id, requirement_type, requirement_key, requirement_operator, requirement_value) VALUES
((SELECT id FROM badges WHERE badge_key = 'streak_3'), 'streak', 'current_streak', '>=', '3'::jsonb),
((SELECT id FROM badges WHERE badge_key = 'streak_7'), 'streak', 'current_streak', '>=', '7'::jsonb),
((SELECT id FROM badges WHERE badge_key = 'streak_30'), 'streak', 'current_streak', '>=', '30'::jsonb),
((SELECT id FROM badges WHERE badge_key = 'streak_90'), 'streak', 'current_streak', '>=', '90'::jsonb),
((SELECT id FROM badges WHERE badge_key = 'streak_365'), 'streak', 'current_streak', '>=', '365'::jsonb);

-- Social
INSERT INTO public.badge_requirements (badge_id, requirement_type, requirement_key, requirement_operator, requirement_value) VALUES
((SELECT id FROM badges WHERE badge_key = 'first_friend'), 'social', 'friends_count', '>=', '1'::jsonb),
((SELECT id FROM badges WHERE badge_key = 'social_5'), 'social', 'friends_count', '>=', '5'::jsonb),
((SELECT id FROM badges WHERE badge_key = 'networker'), 'social', 'friends_count', '>=', '20'::jsonb),
((SELECT id FROM badges WHERE badge_key = 'influencer'), 'social', 'friends_count', '>=', '50'::jsonb),
((SELECT id FROM badges WHERE badge_key = 'community_star'), 'social', 'friends_count', '>=', '100'::jsonb);

-- =============================================
-- TRIGGERS PARA ATUALIZAÇÃO AUTOMÁTICA
-- =============================================

CREATE TRIGGER update_system_settings_timestamp
  BEFORE UPDATE ON public.system_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_game_configurations_timestamp
  BEFORE UPDATE ON public.game_configurations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
