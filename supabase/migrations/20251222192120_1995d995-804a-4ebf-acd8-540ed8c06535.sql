-- Adiciona coluna para título selecionado no perfil
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS selected_title TEXT DEFAULT NULL;

-- Cria tabela de títulos desbloqueados pelo usuário
CREATE TABLE IF NOT EXISTS public.user_titles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title_id TEXT NOT NULL,
  unlocked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, title_id)
);

-- Enable RLS
ALTER TABLE public.user_titles ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Usuários podem ver próprios títulos" 
ON public.user_titles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar próprios títulos" 
ON public.user_titles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);