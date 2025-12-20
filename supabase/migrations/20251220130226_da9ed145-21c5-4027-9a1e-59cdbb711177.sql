-- Atualiza o check constraint para incluir 'dino'
ALTER TABLE public.leaderboard DROP CONSTRAINT IF EXISTS leaderboard_game_type_check;
ALTER TABLE public.leaderboard ADD CONSTRAINT leaderboard_game_type_check 
  CHECK (game_type IN ('memory', 'snake', 'dino'));