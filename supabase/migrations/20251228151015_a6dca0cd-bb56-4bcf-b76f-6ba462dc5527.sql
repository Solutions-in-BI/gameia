-- Corrigir política de INSERT no leaderboard para exigir autenticação
DROP POLICY IF EXISTS "Anyone can add score" ON public.leaderboard;

CREATE POLICY "Authenticated users can add their own scores" 
ON public.leaderboard 
FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND auth.uid() = user_id
);

-- Adicionar política de UPDATE para próprios scores
DROP POLICY IF EXISTS "Users can update their own scores" ON public.leaderboard;

CREATE POLICY "Users can update their own scores" 
ON public.leaderboard 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Manter leitura pública do leaderboard (faz sentido para ranking)
DROP POLICY IF EXISTS "Anyone can view leaderboard" ON public.leaderboard;

CREATE POLICY "Anyone can view leaderboard" 
ON public.leaderboard 
FOR SELECT 
USING (true);

-- Restringir profiles para leitura somente por usuários autenticados
DROP POLICY IF EXISTS "Qualquer um pode ver perfis" ON public.profiles;

CREATE POLICY "Authenticated users can view profiles" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() IS NOT NULL);