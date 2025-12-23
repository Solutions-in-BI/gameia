-- Adicionar campos de XP e Level ao user_stats
ALTER TABLE public.user_stats 
ADD COLUMN IF NOT EXISTS xp INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS level INTEGER NOT NULL DEFAULT 1;

-- Atualizar XP existente baseado nos jogos já jogados (cada jogo = 10xp + pontos/10)
UPDATE public.user_stats 
SET xp = (total_games_played * 10) + 
         (snake_best_score / 10) + 
         (dino_best_score / 10) + 
         (tetris_best_score / 10);

-- Calcular level inicial (cada 100 XP = 1 level, máximo 100)
UPDATE public.user_stats 
SET level = LEAST(100, GREATEST(1, (xp / 100) + 1));