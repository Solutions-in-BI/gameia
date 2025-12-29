import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";

export interface ActiveBoost {
  inventory_id: string;
  user_id: string;
  item_name: string;
  item_icon: string;
  boost_type: string;
  boost_value: number;
  boost_active_until: string;
  hours_remaining: number;
}

export interface BoostInventoryItem {
  id: string;
  item_id: string;
  status: string;
  boost_active_until: string | null;
  uses_remaining: number | null;
  item: {
    name: string;
    icon: string;
    boost_type: string;
    boost_value: number;
    boost_duration_hours: number;
  };
}

export function useBoosts() {
  const [activeBoosts, setActiveBoosts] = useState<ActiveBoost[]>([]);
  const [availableBoosts, setAvailableBoosts] = useState<BoostInventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  // Fetch active boosts
  const fetchActiveBoosts = useCallback(async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from("user_inventory")
      .select(`
        id,
        user_id,
        boost_active_until,
        item:marketplace_items!inner(
          name,
          icon,
          boost_type,
          boost_value,
          item_type
        )
      `)
      .eq("user_id", user.id)
      .not("boost_active_until", "is", null)
      .gt("boost_active_until", new Date().toISOString())
      .eq("item.item_type", "boost");
    
    if (data) {
      const boosts: ActiveBoost[] = data.map((inv: any) => ({
        inventory_id: inv.id,
        user_id: inv.user_id,
        item_name: inv.item.name,
        item_icon: inv.item.icon,
        boost_type: inv.item.boost_type,
        boost_value: inv.item.boost_value,
        boost_active_until: inv.boost_active_until,
        hours_remaining: (new Date(inv.boost_active_until).getTime() - Date.now()) / (1000 * 60 * 60),
      }));
      setActiveBoosts(boosts);
    }
  }, [user]);

  // Fetch available (not yet activated) boosts in inventory
  const fetchAvailableBoosts = useCallback(async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from("user_inventory")
      .select(`
        id,
        item_id,
        status,
        boost_active_until,
        uses_remaining,
        item:marketplace_items!inner(
          name,
          icon,
          boost_type,
          boost_value,
          boost_duration_hours,
          item_type
        )
      `)
      .eq("user_id", user.id)
      .eq("status", "active")
      .eq("item.item_type", "boost");
    
    if (data) {
      // Filter out boosts that are currently active
      const available = data.filter((inv: any) => 
        !inv.boost_active_until || new Date(inv.boost_active_until) <= new Date()
      );
      setAvailableBoosts(available as BoostInventoryItem[]);
    }
  }, [user]);

  // Activate a boost
  const activateBoost = async (inventoryId: string) => {
    if (!user) {
      toast({ title: "Erro", description: "Faça login para ativar", variant: "destructive" });
      return { success: false };
    }

    const { data, error } = await supabase.rpc("activate_boost", {
      p_inventory_id: inventoryId
    });

    if (error) {
      toast({ title: "Erro ao ativar boost", description: error.message, variant: "destructive" });
      return { success: false };
    }

    const result = data as { success: boolean; error?: string; boost_type?: string; boost_value?: number; active_until?: string };

    if (!result.success) {
      const errorMessages: Record<string, string> = {
        item_not_found: "Item não encontrado",
        item_not_active: "Item não está mais disponível",
        boost_already_active: "Este boost já está ativo",
        not_a_boost: "Este item não é um boost",
      };
      
      toast({ 
        title: errorMessages[result.error || ""] || "Erro ao ativar", 
        variant: "destructive" 
      });
      return { success: false };
    }

    // Refresh data
    await Promise.all([fetchActiveBoosts(), fetchAvailableBoosts()]);
    
    toast({ 
      title: "Boost ativado! ⚡", 
      description: `+${((result.boost_value || 1) - 1) * 100}% por algumas horas` 
    });
    
    return { success: true, ...result };
  };

  // Get current multiplier for a boost type
  const getBoostMultiplier = useCallback((type: "xp_multiplier" | "coins_multiplier"): number => {
    const boost = activeBoosts.find(b => b.boost_type === type);
    return boost?.boost_value || 1;
  }, [activeBoosts]);

  // Check if any boost is active
  const hasActiveBoost = useMemo(() => activeBoosts.length > 0, [activeBoosts]);

  // Load data
  useEffect(() => {
    const loadData = async () => {
      if (!isAuthenticated) {
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      await Promise.all([fetchActiveBoosts(), fetchAvailableBoosts()]);
      setIsLoading(false);
    };
    
    loadData();
  }, [fetchActiveBoosts, fetchAvailableBoosts, isAuthenticated]);

  // Auto-refresh every minute to update remaining time
  useEffect(() => {
    if (!isAuthenticated || activeBoosts.length === 0) return;
    
    const interval = setInterval(() => {
      fetchActiveBoosts();
    }, 60000); // Every minute
    
    return () => clearInterval(interval);
  }, [isAuthenticated, activeBoosts.length, fetchActiveBoosts]);

  return {
    activeBoosts,
    availableBoosts,
    isLoading,
    hasActiveBoost,
    activateBoost,
    getBoostMultiplier,
    refresh: () => Promise.all([fetchActiveBoosts(), fetchAvailableBoosts()]),
  };
}
