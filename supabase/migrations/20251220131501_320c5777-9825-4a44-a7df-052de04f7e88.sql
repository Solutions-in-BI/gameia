-- Tabela de perfis com apelido
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nickname TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilita RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Qualquer um pode ver perfis"
ON public.profiles FOR SELECT
USING (true);

CREATE POLICY "Usuários podem criar próprio perfil"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar próprio perfil"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

-- Função para criar perfil automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, nickname)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'nickname');
  RETURN NEW;
END;
$$;

-- Trigger para criar perfil no signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Adiciona user_id ao leaderboard para vincular scores ao usuário
ALTER TABLE public.leaderboard ADD COLUMN user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Atualiza constraint única para incluir user_id
ALTER TABLE public.leaderboard DROP CONSTRAINT leaderboard_player_game_unique;
ALTER TABLE public.leaderboard ADD CONSTRAINT leaderboard_user_game_unique 
  UNIQUE (user_id, game_type, difficulty);