-- Remove duplicatas mantendo apenas o melhor score por usuário/jogo/dificuldade
-- Para jogos normais: maior score é melhor
-- Para memory: menor score é melhor

-- Primeiro remove duplicatas de snake/dino/tetris (mantém maior)
DELETE FROM leaderboard a
USING leaderboard b
WHERE a.id < b.id
AND a.user_id = b.user_id
AND a.game_type = b.game_type
AND COALESCE(a.difficulty, '') = COALESCE(b.difficulty, '')
AND a.game_type != 'memory'
AND a.score < b.score;

-- Remove duplicatas de memory (mantém menor)
DELETE FROM leaderboard a
USING leaderboard b
WHERE a.id < b.id
AND a.user_id = b.user_id
AND a.game_type = b.game_type
AND COALESCE(a.difficulty, '') = COALESCE(b.difficulty, '')
AND a.game_type = 'memory'
AND a.score > b.score;

-- Remove quaisquer duplicatas restantes mantendo o mais recente
DELETE FROM leaderboard a
USING leaderboard b
WHERE a.id < b.id
AND a.user_id = b.user_id
AND a.game_type = b.game_type
AND COALESCE(a.difficulty, '') = COALESCE(b.difficulty, '');

-- Cria constraint única para prevenir duplicatas futuras
ALTER TABLE leaderboard ADD CONSTRAINT unique_user_game_difficulty 
UNIQUE NULLS NOT DISTINCT (user_id, game_type, difficulty);