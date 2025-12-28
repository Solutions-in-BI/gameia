import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useOrganization } from './useOrganization';
import { toast } from 'sonner';

export interface ApiKey {
  id: string;
  name: string;
  key_prefix: string;
  scopes: string[];
  is_active: boolean;
  last_used_at: string | null;
  expires_at: string | null;
  created_at: string;
  revoked_at: string | null;
}

export interface Webhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  is_active: boolean;
  retry_count: number;
  timeout_seconds: number;
  created_at: string;
  updated_at: string;
}

export interface WebhookDelivery {
  id: string;
  webhook_id: string;
  event_type: string;
  payload: any;
  response_status: number | null;
  response_body: string | null;
  attempt_count: number;
  status: string;
  created_at: string;
  delivered_at: string | null;
}

const AVAILABLE_SCOPES = [
  { value: 'read', label: 'Leitura geral', description: 'Acesso de leitura a todos os endpoints' },
  { value: 'members:read', label: 'Membros', description: 'Listar membros da organização' },
  { value: 'metrics:read', label: 'Métricas', description: 'Visualizar métricas e analytics' },
  { value: 'activities:read', label: 'Atividades', description: 'Listar atividades' },
  { value: 'leaderboard:read', label: 'Ranking', description: 'Visualizar leaderboard' },
];

const AVAILABLE_EVENTS = [
  { value: 'member.joined', label: 'Membro entrou', description: 'Quando um novo membro entra na organização' },
  { value: 'member.left', label: 'Membro saiu', description: 'Quando um membro deixa a organização' },
  { value: 'badge.earned', label: 'Badge conquistada', description: 'Quando um membro ganha uma badge' },
  { value: 'level.up', label: 'Level up', description: 'Quando um membro sobe de nível' },
  { value: 'challenge.completed', label: 'Desafio concluído', description: 'Quando um desafio é concluído' },
  { value: 'training.completed', label: 'Treinamento concluído', description: 'Quando um treinamento é finalizado' },
];

export function useIntegrations() {
  const { user } = useAuth();
  const { currentOrg } = useOrganization();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [deliveries, setDeliveries] = useState<WebhookDelivery[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchApiKeys = useCallback(async () => {
    if (!currentOrg?.id) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('organization_api_keys')
        .select('*')
        .eq('organization_id', currentOrg.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApiKeys(data || []);
    } catch (err: any) {
      console.error('Error fetching API keys:', err);
      toast.error('Erro ao carregar API keys');
    } finally {
      setIsLoading(false);
    }
  }, [currentOrg?.id]);

  const createApiKey = useCallback(async (name: string, scopes: string[], expiresInDays?: number) => {
    if (!currentOrg?.id || !user?.id) return null;

    try {
      // Generate a secure random key
      const keyBytes = new Uint8Array(32);
      crypto.getRandomValues(keyBytes);
      const rawKey = 'gsk_' + Array.from(keyBytes).map(b => b.toString(16).padStart(2, '0')).join('');
      const keyPrefix = rawKey.substring(0, 12);

      // Hash the key for storage
      const encoder = new TextEncoder();
      const data = encoder.encode(rawKey);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const keyHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      const expiresAt = expiresInDays 
        ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toISOString()
        : null;

      const { data: newKey, error } = await supabase
        .from('organization_api_keys')
        .insert({
          organization_id: currentOrg.id,
          name,
          key_hash: keyHash,
          key_prefix: keyPrefix,
          scopes,
          expires_at: expiresAt,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('API key criada com sucesso');
      await fetchApiKeys();

      // Return the raw key only once - it cannot be retrieved later
      return { ...newKey, rawKey };
    } catch (err: any) {
      console.error('Error creating API key:', err);
      toast.error('Erro ao criar API key');
      return null;
    }
  }, [currentOrg?.id, user?.id, fetchApiKeys]);

  const revokeApiKey = useCallback(async (keyId: string) => {
    try {
      const { error } = await supabase
        .from('organization_api_keys')
        .update({ 
          is_active: false, 
          revoked_at: new Date().toISOString() 
        })
        .eq('id', keyId);

      if (error) throw error;

      toast.success('API key revogada');
      await fetchApiKeys();
    } catch (err: any) {
      console.error('Error revoking API key:', err);
      toast.error('Erro ao revogar API key');
    }
  }, [fetchApiKeys]);

  const fetchWebhooks = useCallback(async () => {
    if (!currentOrg?.id) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('organization_webhooks')
        .select('*')
        .eq('organization_id', currentOrg.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWebhooks(data || []);
    } catch (err: any) {
      console.error('Error fetching webhooks:', err);
      toast.error('Erro ao carregar webhooks');
    } finally {
      setIsLoading(false);
    }
  }, [currentOrg?.id]);

  const createWebhook = useCallback(async (
    name: string, 
    url: string, 
    events: string[],
    options?: { retryCount?: number; timeoutSeconds?: number }
  ) => {
    if (!currentOrg?.id || !user?.id) return null;

    try {
      // Generate webhook secret
      const secretBytes = new Uint8Array(24);
      crypto.getRandomValues(secretBytes);
      const secret = 'whsec_' + Array.from(secretBytes).map(b => b.toString(16).padStart(2, '0')).join('');

      const { data, error } = await supabase
        .from('organization_webhooks')
        .insert({
          organization_id: currentOrg.id,
          name,
          url,
          secret,
          events,
          retry_count: options?.retryCount || 3,
          timeout_seconds: options?.timeoutSeconds || 30,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Webhook criado com sucesso');
      await fetchWebhooks();

      // Return with secret visible only once
      return { ...data, secret };
    } catch (err: any) {
      console.error('Error creating webhook:', err);
      toast.error('Erro ao criar webhook');
      return null;
    }
  }, [currentOrg?.id, user?.id, fetchWebhooks]);

  const updateWebhook = useCallback(async (webhookId: string, updates: Partial<Webhook>) => {
    try {
      const { error } = await supabase
        .from('organization_webhooks')
        .update(updates)
        .eq('id', webhookId);

      if (error) throw error;

      toast.success('Webhook atualizado');
      await fetchWebhooks();
    } catch (err: any) {
      console.error('Error updating webhook:', err);
      toast.error('Erro ao atualizar webhook');
    }
  }, [fetchWebhooks]);

  const deleteWebhook = useCallback(async (webhookId: string) => {
    try {
      const { error } = await supabase
        .from('organization_webhooks')
        .delete()
        .eq('id', webhookId);

      if (error) throw error;

      toast.success('Webhook removido');
      await fetchWebhooks();
    } catch (err: any) {
      console.error('Error deleting webhook:', err);
      toast.error('Erro ao remover webhook');
    }
  }, [fetchWebhooks]);

  const fetchDeliveries = useCallback(async (webhookId: string) => {
    try {
      const { data, error } = await supabase
        .from('webhook_deliveries')
        .select('*')
        .eq('webhook_id', webhookId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setDeliveries(data || []);
    } catch (err: any) {
      console.error('Error fetching deliveries:', err);
      toast.error('Erro ao carregar entregas');
    }
  }, []);

  const getApiEndpoint = useCallback(() => {
    const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID || 'eeaqaryoyxbuqyxqczab';
    return `https://${projectId}.supabase.co/functions/v1/public-api`;
  }, []);

  return {
    apiKeys,
    webhooks,
    deliveries,
    isLoading,
    fetchApiKeys,
    createApiKey,
    revokeApiKey,
    fetchWebhooks,
    createWebhook,
    updateWebhook,
    deleteWebhook,
    fetchDeliveries,
    getApiEndpoint,
    AVAILABLE_SCOPES,
    AVAILABLE_EVENTS,
  };
}
