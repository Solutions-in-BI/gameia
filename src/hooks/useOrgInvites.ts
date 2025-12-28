/**
 * Hook para gerenciar convites de organização
 */

import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./use-toast";

export interface OrgInvite {
  id: string;
  email: string | null;
  invite_code: string;
  role: string;
  created_at: string;
  expires_at: string;
  used_at: string | null;
  used_by: string | null;
  is_expired: boolean;
  is_used: boolean;
}

interface CreateInviteParams {
  organizationId: string;
  email?: string;
  role?: "member" | "admin";
  expiresInDays?: number;
}

interface UseOrgInvites {
  invites: OrgInvite[];
  isLoading: boolean;
  createInvite: (params: CreateInviteParams) => Promise<{ code: string; url: string } | null>;
  revokeInvite: (inviteId: string) => Promise<boolean>;
  acceptInvite: (code: string) => Promise<{ success: boolean; error?: string; rateLimited?: boolean }>;
  fetchInvites: (organizationId: string) => Promise<void>;
  getInviteUrl: (code: string) => string;
}

export function useOrgInvites(): UseOrgInvites {
  const { toast } = useToast();
  const [invites, setInvites] = useState<OrgInvite[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Gerar URL de convite
  const getInviteUrl = useCallback((code: string) => {
    return `${window.location.origin}/invite/${code}`;
  }, []);

  // Criar convite
  const createInvite = useCallback(async ({
    organizationId,
    email,
    role = "member",
    expiresInDays = 7,
  }: CreateInviteParams) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.rpc("create_org_invite", {
        p_organization_id: organizationId,
        p_email: email || null,
        p_role: role,
        p_expires_in_days: expiresInDays,
      });

      if (error) throw error;

      const result = data as { success: boolean; error?: string; invite_code?: string };

      if (!result.success) {
        toast({ title: result.error || "Erro ao criar convite", variant: "destructive" });
        return null;
      }

      const code = result.invite_code!;
      toast({ title: "Convite criado! 📨" });
      
      return {
        code,
        url: getInviteUrl(code),
      };
    } catch (err) {
      console.error("Erro ao criar convite:", err);
      toast({ title: "Erro ao criar convite", variant: "destructive" });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast, getInviteUrl]);

  // Revogar convite
  const revokeInvite = useCallback(async (inviteId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.rpc("revoke_org_invite", {
        p_invite_id: inviteId,
      });

      if (error) throw error;

      const result = data as { success: boolean; error?: string };

      if (!result.success) {
        toast({ title: result.error || "Erro ao revogar convite", variant: "destructive" });
        return false;
      }

      setInvites(prev => prev.filter(i => i.id !== inviteId));
      toast({ title: "Convite revogado" });
      return true;
    } catch (err) {
      console.error("Erro ao revogar convite:", err);
      toast({ title: "Erro ao revogar convite", variant: "destructive" });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Aceitar convite (com rate limiting)
  const acceptInvite = useCallback(async (code: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.rpc("accept_invite_with_rate_limit", {
        p_invite_code: code,
        p_client_ip: null, // Não temos acesso ao IP no cliente
      });

      if (error) throw error;

      const result = data as { 
        success: boolean; 
        error?: string; 
        rate_limited?: boolean;
        retry_after_minutes?: number;
        organization_id?: string;
      };

      if (!result.success) {
        if (result.rate_limited) {
          toast({ 
            title: "Muitas tentativas", 
            description: `Aguarde ${result.retry_after_minutes || 15} minutos`,
            variant: "destructive" 
          });
          return { success: false, error: result.error, rateLimited: true };
        }
        toast({ title: result.error || "Erro ao aceitar convite", variant: "destructive" });
        return { success: false, error: result.error };
      }

      toast({ title: "Bem-vindo à equipe! 🎉" });
      return { success: true };
    } catch (err) {
      console.error("Erro ao aceitar convite:", err);
      toast({ title: "Erro ao aceitar convite", variant: "destructive" });
      return { success: false, error: "Erro inesperado" };
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Buscar convites da organização
  const fetchInvites = useCallback(async (organizationId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.rpc("list_org_invites", {
        p_organization_id: organizationId,
      });

      if (error) throw error;
      setInvites((data || []) as OrgInvite[]);
    } catch (err) {
      console.error("Erro ao buscar convites:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    invites,
    isLoading,
    createInvite,
    revokeInvite,
    acceptInvite,
    fetchInvites,
    getInviteUrl,
  };
}
