import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useOrganization } from "./useOrganization";
import { useToast } from "./use-toast";

export interface SSOConfig {
  id: string;
  organization_id: string;
  is_enabled: boolean;
  allowed_domains: string[];
  require_domain_match: boolean;
  auto_join_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export function useSSOConfig() {
  const { currentOrg: organization } = useOrganization();
  const { toast } = useToast();
  const [config, setConfig] = useState<SSOConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchConfig = useCallback(async () => {
    if (!organization?.id) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("organization_sso_config")
        .select("*")
        .eq("organization_id", organization.id)
        .maybeSingle();

      if (error) throw error;
      setConfig(data);
    } catch (error) {
      console.error("Error fetching SSO config:", error);
    } finally {
      setIsLoading(false);
    }
  }, [organization?.id]);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const saveConfig = async (updates: Partial<SSOConfig>) => {
    if (!organization?.id) return { error: new Error("No organization") };

    try {
      if (config?.id) {
        // Update existing
        const { error } = await supabase
          .from("organization_sso_config")
          .update({
            ...updates,
            updated_at: new Date().toISOString(),
          })
          .eq("id", config.id);

        if (error) throw error;
      } else {
        // Create new
        const { error } = await supabase
          .from("organization_sso_config")
          .insert({
            organization_id: organization.id,
            ...updates,
          });

        if (error) throw error;
      }

      await fetchConfig();
      toast({
        title: "Configuração salva",
        description: "As configurações de SSO foram atualizadas.",
      });

      return { error: null };
    } catch (error: any) {
      toast({
        title: "Erro ao salvar",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  const addDomain = async (domain: string) => {
    const normalizedDomain = domain.toLowerCase().trim();
    const currentDomains = config?.allowed_domains || [];

    if (currentDomains.includes(normalizedDomain)) {
      toast({
        title: "Domínio já existe",
        description: "Este domínio já está na lista.",
        variant: "destructive",
      });
      return;
    }

    await saveConfig({
      allowed_domains: [...currentDomains, normalizedDomain],
    });
  };

  const removeDomain = async (domain: string) => {
    const currentDomains = config?.allowed_domains || [];
    await saveConfig({
      allowed_domains: currentDomains.filter((d) => d !== domain),
    });
  };

  const toggleSSO = async (enabled: boolean) => {
    await saveConfig({ is_enabled: enabled });
  };

  const toggleAutoJoin = async (enabled: boolean) => {
    await saveConfig({ auto_join_enabled: enabled });
  };

  const validateEmail = (email: string): boolean => {
    if (!config?.is_enabled || !config?.require_domain_match) {
      return true;
    }

    const emailDomain = email.toLowerCase().split("@")[1];
    return config.allowed_domains.includes(emailDomain);
  };

  return {
    config,
    isLoading,
    saveConfig,
    addDomain,
    removeDomain,
    toggleSSO,
    toggleAutoJoin,
    validateEmail,
    refresh: fetchConfig,
  };
}
