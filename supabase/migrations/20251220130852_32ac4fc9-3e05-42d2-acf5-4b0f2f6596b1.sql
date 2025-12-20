-- Add unique constraint for player_name + game_type + difficulty
-- This allows upsert to update existing scores instead of creating duplicates
ALTER TABLE public.leaderboard 
ADD CONSTRAINT leaderboard_player_game_unique 
UNIQUE (player_name, game_type, difficulty);