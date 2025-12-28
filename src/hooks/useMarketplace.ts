import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";

export interface MarketplaceItem {
  id: string;
  name: string;
  description: string | null;
  icon: string;
  image_url: string | null;
  category: string;
  price: number;
  rarity: string;
  is_active: boolean;
  stock: number | null;
  is_limited_edition: boolean;
  is_featured: boolean;
}

export interface MarketplaceCategory {
  id: string;
  name: string;
  slug: string;
  icon: string;
  section: string;
  sort_order: number;
}

export interface InventoryItem {
  id: string;
  user_id: string;
  item_id: string;
  purchased_at: string;
  is_equipped: boolean;
  item?: MarketplaceItem;
}

export function useMarketplace() {
  // All hooks must be called unconditionally at the top
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [categories, setCategories] = useState<MarketplaceCategory[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [coins, setCoins] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  // Busca itens do marketplace
  const fetchItems = useCallback(async () => {
    const { data } = await supabase
      .from("marketplace_items")
      .select("*")
      .eq("is_active", true)
      .order("is_featured", { ascending: false })
      .order("sort_order", { ascending: true })
      .order("price", { ascending: true });
    
    if (data) setItems(data as MarketplaceItem[]);
  }, []);

  // Busca categorias
  const fetchCategories = useCallback(async () => {
    const { data } = await supabase
      .from("marketplace_categories")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });
    
    if (data) setCategories(data as MarketplaceCategory[]);
  }, []);

  // Busca inventário do usuário
  const fetchInventory = useCallback(async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from("user_inventory")
      .select("*, item:marketplace_items(*)")
      .eq("user_id", user.id);
    
    if (data) {
      setInventory(data.map(inv => ({
        ...inv,
        item: inv.item as unknown as MarketplaceItem
      })));
    }
  }, [user]);

  // Busca moedas do usuário
  const fetchCoins = useCallback(async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from("user_stats")
      .select("coins")
      .eq("user_id", user.id)
      .maybeSingle();
    
    if (data) setCoins(data.coins);
  }, [user]);

  // Carrega dados iniciais
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchItems(), fetchCategories()]);
      if (isAuthenticated) {
        await Promise.all([fetchInventory(), fetchCoins()]);
      }
      setIsLoading(false);
    };
    
    loadData();
  }, [fetchItems, fetchCategories, fetchInventory, fetchCoins, isAuthenticated]);

  // Comprar item (usando função atômica do banco)
  const purchaseItem = async (itemId: string) => {
    if (!user) {
      toast({ title: "Erro", description: "Faça login para comprar", variant: "destructive" });
      return { success: false };
    }

    const { data, error } = await supabase.rpc("purchase_marketplace_item", {
      p_item_id: itemId
    });

    if (error) {
      toast({ title: "Erro ao processar compra", description: error.message, variant: "destructive" });
      return { success: false };
    }

    const result = data as { success: boolean; error?: string; item_name?: string; coins_spent?: number };

    if (!result.success) {
      const errorMessages: Record<string, string> = {
        not_authenticated: "Faça login para comprar",
        item_not_found: "Item não encontrado",
        out_of_stock: "Item esgotado",
        already_owned: "Você já possui este item",
        insufficient_coins: "Moedas insuficientes",
      };
      
      toast({ 
        title: errorMessages[result.error || ""] || "Erro ao comprar", 
        variant: "destructive" 
      });
      return { success: false };
    }

    // Atualiza estado local
    await Promise.all([fetchInventory(), fetchCoins()]);
    
    toast({ 
      title: "Compra realizada! 🎉", 
      description: `Você adquiriu ${result.item_name}` 
    });
    
    return { success: true };
  };

  // Equipar/desequipar item
  const toggleEquip = async (inventoryId: string, category: string) => {
    if (!user) return;

    // Desequipa todos do mesmo tipo
    const sameCategory = inventory.filter(inv => inv.item?.category === category);
    for (const inv of sameCategory) {
      if (inv.is_equipped) {
        await supabase
          .from("user_inventory")
          .update({ is_equipped: false })
          .eq("id", inv.id);
      }
    }

    // Equipa o novo
    const item = inventory.find(inv => inv.id === inventoryId);
    if (item && !item.is_equipped) {
      await supabase
        .from("user_inventory")
        .update({ is_equipped: true })
        .eq("id", inventoryId);
    }

    await fetchInventory();
  };

  // Adicionar moedas (chamado após jogos)
  const addCoins = async (amount: number) => {
    if (!user || amount <= 0) return;
    
    const { error } = await supabase
      .from("user_stats")
      .update({ coins: coins + amount })
      .eq("user_id", user.id);
    
    if (!error) {
      setCoins(prev => prev + amount);
    }
  };

  // Memoized values
  const featuredItems = useMemo(() => items.filter(i => i.is_featured), [items]);

  // Helper functions
  const getEquippedItem = useCallback((category: string) => {
    return inventory.find(inv => inv.is_equipped && inv.item?.category === category);
  }, [inventory]);

  const ownsItem = useCallback((itemId: string) => {
    return inventory.some(inv => inv.item_id === itemId);
  }, [inventory]);

  return {
    items,
    categories,
    inventory,
    coins,
    isLoading,
    featuredItems,
    purchaseItem,
    toggleEquip,
    addCoins,
    getEquippedItem,
    ownsItem,
    refresh: () => Promise.all([fetchItems(), fetchCategories(), fetchInventory(), fetchCoins()]),
  };
}
