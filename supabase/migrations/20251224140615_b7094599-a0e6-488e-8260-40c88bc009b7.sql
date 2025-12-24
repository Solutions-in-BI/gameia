-- =============================================
-- SISTEMA DE STREAK DIÁRIO
-- =============================================
CREATE TABLE public.user_streaks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_played_at TIMESTAMP WITH TIME ZONE,
  last_claimed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver próprio streak"
ON public.user_streaks FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar próprio streak"
ON public.user_streaks FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar próprio streak"
ON public.user_streaks FOR UPDATE
USING (auth.uid() = user_id);

-- =============================================
-- SISTEMA DE AMIZADES
-- =============================================
CREATE TYPE public.friendship_status AS ENUM ('pending', 'accepted', 'blocked');

CREATE TABLE public.friendships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_id UUID NOT NULL,
  addressee_id UUID NOT NULL,
  status public.friendship_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(requester_id, addressee_id)
);

ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver próprias amizades"
ON public.friendships FOR SELECT
USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

CREATE POLICY "Usuários podem enviar solicitações"
ON public.friendships FOR INSERT
WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Usuários podem atualizar próprias amizades"
ON public.friendships FOR UPDATE
USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

CREATE POLICY "Usuários podem deletar próprias amizades"
ON public.friendships FOR DELETE
USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

-- =============================================
-- GRUPOS DE AMIGOS
-- =============================================
CREATE TABLE public.friend_groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT '👥',
  max_members INTEGER DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.friend_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Grupos são públicos para visualização"
ON public.friend_groups FOR SELECT
USING (true);

CREATE POLICY "Donos podem criar grupos"
ON public.friend_groups FOR INSERT
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Donos podem atualizar grupos"
ON public.friend_groups FOR UPDATE
USING (auth.uid() = owner_id);

CREATE POLICY "Donos podem deletar grupos"
ON public.friend_groups FOR DELETE
USING (auth.uid() = owner_id);

-- Membros dos grupos
CREATE TABLE public.friend_group_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.friend_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(group_id, user_id)
);

ALTER TABLE public.friend_group_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Membros são públicos para visualização"
ON public.friend_group_members FOR SELECT
USING (true);

CREATE POLICY "Donos podem adicionar membros"
ON public.friend_group_members FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.friend_groups 
    WHERE id = group_id AND owner_id = auth.uid()
  )
);

CREATE POLICY "Donos ou próprio membro pode remover"
ON public.friend_group_members FOR DELETE
USING (
  auth.uid() = user_id OR 
  EXISTS (
    SELECT 1 FROM public.friend_groups 
    WHERE id = group_id AND owner_id = auth.uid()
  )
);

-- =============================================
-- SISTEMA DE PRESENTES
-- =============================================
CREATE TYPE public.gift_status AS ENUM ('pending', 'accepted', 'rejected');

CREATE TABLE public.gifts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL,
  receiver_id UUID NOT NULL,
  item_id UUID NOT NULL REFERENCES public.marketplace_items(id),
  message TEXT,
  status public.gift_status NOT NULL DEFAULT 'pending',
  coins_spent INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  responded_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.gifts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver presentes enviados/recebidos"
ON public.gifts FOR SELECT
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Usuários podem enviar presentes"
ON public.gifts FOR INSERT
WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Destinatários podem atualizar presentes"
ON public.gifts FOR UPDATE
USING (auth.uid() = receiver_id);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_user_streaks_updated_at
BEFORE UPDATE ON public.user_streaks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_friendships_updated_at
BEFORE UPDATE ON public.friendships
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();