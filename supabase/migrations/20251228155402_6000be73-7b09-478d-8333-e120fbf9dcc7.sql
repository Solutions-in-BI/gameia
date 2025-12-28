-- API Keys for organizations
CREATE TABLE public.organization_api_keys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  key_hash TEXT NOT NULL,
  key_prefix TEXT NOT NULL,
  scopes TEXT[] DEFAULT ARRAY['read']::TEXT[],
  is_active BOOLEAN DEFAULT true,
  last_used_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  revoked_at TIMESTAMP WITH TIME ZONE
);

-- Webhooks for organizations
CREATE TABLE public.organization_webhooks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  secret TEXT NOT NULL,
  events TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  is_active BOOLEAN DEFAULT true,
  retry_count INTEGER DEFAULT 3,
  timeout_seconds INTEGER DEFAULT 30,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Webhook delivery logs
CREATE TABLE public.webhook_deliveries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  webhook_id UUID NOT NULL REFERENCES public.organization_webhooks(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  response_status INTEGER,
  response_body TEXT,
  attempt_count INTEGER DEFAULT 1,
  delivered_at TIMESTAMP WITH TIME ZONE,
  next_retry_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- API request logs
CREATE TABLE public.api_request_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  api_key_id UUID REFERENCES public.organization_api_keys(id) ON DELETE SET NULL,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  status_code INTEGER,
  response_time_ms INTEGER,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.organization_api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_request_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for API Keys
CREATE POLICY "Org admins can manage API keys"
ON public.organization_api_keys
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.organization_members om
    WHERE om.organization_id = organization_api_keys.organization_id
    AND om.user_id = auth.uid()
    AND om.org_role IN ('owner', 'admin')
  )
);

-- RLS Policies for Webhooks
CREATE POLICY "Org admins can manage webhooks"
ON public.organization_webhooks
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.organization_members om
    WHERE om.organization_id = organization_webhooks.organization_id
    AND om.user_id = auth.uid()
    AND om.org_role IN ('owner', 'admin')
  )
);

-- RLS Policies for Webhook Deliveries
CREATE POLICY "Org admins can view webhook deliveries"
ON public.webhook_deliveries
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.organization_webhooks ow
    JOIN public.organization_members om ON om.organization_id = ow.organization_id
    WHERE ow.id = webhook_deliveries.webhook_id
    AND om.user_id = auth.uid()
    AND om.org_role IN ('owner', 'admin')
  )
);

-- RLS Policies for API Logs
CREATE POLICY "Org admins can view API logs"
ON public.api_request_logs
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.organization_members om
    WHERE om.organization_id = api_request_logs.organization_id
    AND om.user_id = auth.uid()
    AND om.org_role IN ('owner', 'admin')
  )
);

-- Indexes for performance
CREATE INDEX idx_api_keys_org ON public.organization_api_keys(organization_id);
CREATE INDEX idx_api_keys_prefix ON public.organization_api_keys(key_prefix);
CREATE INDEX idx_webhooks_org ON public.organization_webhooks(organization_id);
CREATE INDEX idx_webhook_deliveries_webhook ON public.webhook_deliveries(webhook_id);
CREATE INDEX idx_webhook_deliveries_status ON public.webhook_deliveries(status);
CREATE INDEX idx_api_logs_org ON public.api_request_logs(organization_id);
CREATE INDEX idx_api_logs_created ON public.api_request_logs(created_at DESC);

-- Function to update updated_at
CREATE TRIGGER update_webhooks_updated_at
BEFORE UPDATE ON public.organization_webhooks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();