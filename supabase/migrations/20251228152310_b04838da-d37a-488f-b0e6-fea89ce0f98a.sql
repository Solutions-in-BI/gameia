-- Tabela para captura de leads/demonstrações
CREATE TABLE public.demo_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  company_size TEXT,
  phone TEXT,
  message TEXT,
  source TEXT DEFAULT 'landing',
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  contacted_at TIMESTAMP WITH TIME ZONE,
  notes TEXT
);

-- Enable RLS
ALTER TABLE public.demo_leads ENABLE ROW LEVEL SECURITY;

-- Política para INSERT público (formulário de contato)
CREATE POLICY "Anyone can submit demo request" 
ON public.demo_leads 
FOR INSERT 
WITH CHECK (true);

-- Políticas para leitura apenas por usuários autenticados (admins)
CREATE POLICY "Authenticated users can view leads" 
ON public.demo_leads 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Políticas para update apenas por usuários autenticados
CREATE POLICY "Authenticated users can update leads" 
ON public.demo_leads 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);