-- Create subscription plans table
CREATE TABLE public.subscription_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  price_monthly DECIMAL(10,2) NOT NULL DEFAULT 0,
  price_yearly DECIMAL(10,2) NOT NULL DEFAULT 0,
  features JSONB DEFAULT '[]'::jsonb,
  limits JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user subscriptions table
CREATE TABLE public.user_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.subscription_plans(id),
  organization_id UUID REFERENCES public.organizations(id),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'expired', 'trial')),
  billing_cycle TEXT NOT NULL DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly')),
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  canceled_at TIMESTAMP WITH TIME ZONE,
  stripe_subscription_id TEXT,
  stripe_customer_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Plans are publicly readable
CREATE POLICY "Plans are publicly readable" ON public.subscription_plans
  FOR SELECT USING (true);

-- Users can view their own subscriptions
CREATE POLICY "Users can view own subscriptions" ON public.user_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Users can create their own subscriptions
CREATE POLICY "Users can create own subscriptions" ON public.user_subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own subscriptions
CREATE POLICY "Users can update own subscriptions" ON public.user_subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

-- Insert default plans
INSERT INTO public.subscription_plans (name, slug, description, price_monthly, price_yearly, features, limits, display_order) VALUES
('Gratuito', 'free', 'Perfeito para começar', 0, 0, 
  '["Acesso a jogos básicos", "Perfil de jogador", "Ranking público", "Até 5 membros"]'::jsonb,
  '{"max_members": 5, "max_games": 3, "analytics": false}'::jsonb, 0),
('Starter', 'starter', 'Para equipes em crescimento', 49, 470, 
  '["Tudo do Gratuito", "Até 25 membros", "Relatórios básicos", "Personalização de badges", "Suporte por email"]'::jsonb,
  '{"max_members": 25, "max_games": 10, "analytics": true}'::jsonb, 1),
('Business', 'business', 'Para empresas estabelecidas', 149, 1430, 
  '["Tudo do Starter", "Até 100 membros", "Analytics avançado", "Trilhas personalizadas", "API access", "Suporte prioritário"]'::jsonb,
  '{"max_members": 100, "max_games": -1, "analytics": true, "api_access": true}'::jsonb, 2),
('Enterprise', 'enterprise', 'Solução completa', 0, 0, 
  '["Membros ilimitados", "SSO/SAML", "Integrações customizadas", "SLA garantido", "Gerente de sucesso dedicado", "On-premise disponível"]'::jsonb,
  '{"max_members": -1, "max_games": -1, "analytics": true, "api_access": true, "sso": true}'::jsonb, 3);

-- Create trigger for updated_at
CREATE TRIGGER update_user_subscriptions_updated_at
  BEFORE UPDATE ON public.user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();