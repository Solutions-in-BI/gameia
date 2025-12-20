-- Tabela de recordes/ranking para cada jogo
CREATE TABLE public.leaderboard (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  player_name TEXT NOT NULL,
  game_type TEXT NOT NULL CHECK (game_type IN ('memory', 'snake')),
  score INTEGER NOT NULL,
  difficulty TEXT, -- Para o jogo da memória (easy, medium, hard)
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índice para buscar os melhores scores por jogo
CREATE INDEX idx_leaderboard_game_score ON public.leaderboard(game_type, score DESC);

-- Enable RLS
ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;

-- Qualquer pessoa pode ver o ranking (leitura pública)
CREATE POLICY "Anyone can view leaderboard" 
ON public.leaderboard 
FOR SELECT 
USING (true);

-- Qualquer pessoa pode adicionar seu score (sem auth necessário)
CREATE POLICY "Anyone can add score" 
ON public.leaderboard 
FOR INSERT 
WITH CHECK (true);

-- Enable realtime para atualização ao vivo do ranking
ALTER PUBLICATION supabase_realtime ADD TABLE public.leaderboard;