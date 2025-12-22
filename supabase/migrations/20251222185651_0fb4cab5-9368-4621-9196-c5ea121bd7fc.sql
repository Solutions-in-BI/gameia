-- Adicionar colunas de estatísticas do Tetris
ALTER TABLE public.user_stats 
ADD COLUMN tetris_games_played integer NOT NULL DEFAULT 0,
ADD COLUMN tetris_best_score integer NOT NULL DEFAULT 0,
ADD COLUMN tetris_lines_cleared integer NOT NULL DEFAULT 0,
ADD COLUMN tetris_best_level integer NOT NULL DEFAULT 1;