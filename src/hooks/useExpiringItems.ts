import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface ExpiringItem {
  inventory_id: string;
  user_id: string;
  item_name: string;
  item_icon: string;
  item_type: string;
  expires_at: string;
  days_remaining: number;
}

export function useExpiringItems() {
  const [expiringItems, setExpiringItems] = useState<ExpiringItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const { user, isAuthenticated } = useAuth();

  const fetchExpiringItems = useCallback(async () => {
    if (!user) return;
    
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    
    const { data } = await supabase
      .from("user_inventory")
      .select(`
        id,
        user_id,
        expires_at,
        item:marketplace_items(
          name,
          icon,
          item_type
        )
      `)
      .eq("user_id", user.id)
      .eq("status", "active")
      .not("expires_at", "is", null)
      .gt("expires_at", new Date().toISOString())
      .lt("expires_at", sevenDaysFromNow.toISOString())
      .order("expires_at", { ascending: true });
    
    if (data) {
      const items: ExpiringItem[] = data.map((inv: any) => ({
        inventory_id: inv.id,
        user_id: inv.user_id,
        item_name: inv.item.name,
        item_icon: inv.item.icon,
        item_type: inv.item.item_type,
        expires_at: inv.expires_at,
        days_remaining: Math.ceil((new Date(inv.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
      }));
      setExpiringItems(items);
    }
  }, [user]);

  useEffect(() => {
    const loadData = async () => {
      if (!isAuthenticated) {
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      await fetchExpiringItems();
      setIsLoading(false);
    };
    
    loadData();
  }, [fetchExpiringItems, isAuthenticated]);

  return {
    expiringItems,
    isLoading,
    hasExpiringItems: expiringItems.length > 0,
    refresh: fetchExpiringItems,
  };
}
