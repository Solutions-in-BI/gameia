-- Criar bucket para avatares
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas de storage para avatares
CREATE POLICY "Avatares são públicos"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Usuários podem fazer upload do próprio avatar"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Usuários podem atualizar o próprio avatar"
ON storage.objects FOR UPDATE
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Usuários podem deletar o próprio avatar"
ON storage.objects FOR DELETE
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Adicionar coluna de moedas na tabela user_stats
ALTER TABLE public.user_stats
ADD COLUMN coins integer NOT NULL DEFAULT 0;

-- Criar tabela de itens do marketplace
CREATE TABLE public.marketplace_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  icon text NOT NULL,
  category text NOT NULL DEFAULT 'avatar',
  price integer NOT NULL,
  rarity text NOT NULL DEFAULT 'common',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Criar tabela de inventário do usuário
CREATE TABLE public.user_inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id uuid NOT NULL REFERENCES public.marketplace_items(id) ON DELETE CASCADE,
  purchased_at timestamp with time zone NOT NULL DEFAULT now(),
  is_equipped boolean NOT NULL DEFAULT false,
  UNIQUE(user_id, item_id)
);

-- Habilitar RLS
ALTER TABLE public.marketplace_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_inventory ENABLE ROW LEVEL SECURITY;

-- Políticas para marketplace_items (todos podem ver)
CREATE POLICY "Itens do marketplace são públicos"
ON public.marketplace_items FOR SELECT
USING (is_active = true);

-- Políticas para user_inventory
CREATE POLICY "Usuários podem ver próprio inventário"
ON public.user_inventory FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem adicionar ao próprio inventário"
ON public.user_inventory FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar próprio inventário"
ON public.user_inventory FOR UPDATE
USING (auth.uid() = user_id);

-- Inserir itens iniciais do marketplace
INSERT INTO public.marketplace_items (name, description, icon, category, price, rarity) VALUES
-- Avatares
('Garrafa de Whiskey', 'Um avatar clássico para os apreciadores', '🥃', 'avatar', 500, 'rare'),
('Chocolate Delicioso', 'Doce e irresistível', '🍫', 'avatar', 200, 'common'),
('Troféu Dourado', 'Para os verdadeiros campeões', '🏆', 'avatar', 1000, 'legendary'),
('Coroa Real', 'Seja a realeza dos jogos', '👑', 'avatar', 2000, 'legendary'),
('Diamante Brilhante', 'Raro e precioso', '💎', 'avatar', 1500, 'epic'),
('Foguete Espacial', 'Velocidade máxima!', '🚀', 'avatar', 800, 'rare'),
('Unicórnio Mágico', 'Criatura lendária', '🦄', 'avatar', 1200, 'epic'),
('Pizza Deliciosa', 'Quem não ama pizza?', '🍕', 'avatar', 150, 'common'),
('Cerveja Gelada', 'Refrescante!', '🍺', 'avatar', 300, 'common'),
('Coração de Ouro', 'Mostre seu lado bom', '💛', 'avatar', 250, 'common'),
('Ninja Sombrio', 'Furtivo e mortal', '🥷', 'avatar', 600, 'rare'),
('Dragão de Fogo', 'Poder e destruição', '🐉', 'avatar', 2500, 'legendary'),
-- Molduras
('Moldura Neon', 'Brilhe no escuro', '✨', 'frame', 400, 'rare'),
('Moldura Arco-íris', 'Todas as cores', '🌈', 'frame', 350, 'rare'),
('Moldura Flamejante', 'Quente demais!', '🔥', 'frame', 500, 'epic');