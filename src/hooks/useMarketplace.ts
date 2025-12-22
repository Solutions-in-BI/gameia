import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";

export interface MarketplaceItem {
  id: string;
  name: string;
  description: string | null;
  icon: string;
  category: string;
  price: number;
  rarity: string;
  is_active: boolean;
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
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [coins, setCoins] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Busca itens do marketplace
  const fetchItems = useCallback(async () => {
    const { data } = await supabase
      .from("marketplace_items")
      .select("*")
      .eq("is_active", true)
      .order("price", { ascending: true });
    
    if (data) setItems(data);
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
      await fetchItems();
      if (isAuthenticated) {
        await Promise.all([fetchInventory(), fetchCoins()]);
      }
      setIsLoading(false);
    };
    
    loadData();
  }, [fetchItems, fetchInventory, fetchCoins, isAuthenticated]);

  // Comprar item
  const purchaseItem = async (itemId: string) => {
    if (!user) {
      toast({ title: "Erro", description: "Faça login para comprar", variant: "destructive" });
      return { success: false };
    }

    const item = items.find(i => i.id === itemId);
    if (!item) {
      toast({ title: "Erro", description: "Item não encontrado", variant: "destructive" });
      return { success: false };
    }

    if (coins < item.price) {
      toast({ title: "Moedas insuficientes", description: `Você precisa de ${item.price} moedas`, variant: "destructive" });
      return { success: false };
    }

    // Verifica se já possui
    if (inventory.some(inv => inv.item_id === itemId)) {
      toast({ title: "Você já possui este item!", variant: "destructive" });
      return { success: false };
    }

    // Deduz moedas
    const { error: coinsError } = await supabase
      .from("user_stats")
      .update({ coins: coins - item.price })
      .eq("user_id", user.id);

    if (coinsError) {
      toast({ title: "Erro ao processar compra", variant: "destructive" });
      return { success: false };
    }

    // Adiciona ao inventário
    const { error: invError } = await supabase
      .from("user_inventory")
      .insert({ user_id: user.id, item_id: itemId });

    if (invError) {
      // Reverte moedas
      await supabase.from("user_stats").update({ coins }).eq("user_id", user.id);
      toast({ title: "Erro ao adicionar item", variant: "destructive" });
      return { success: false };
    }

    // Atualiza estado local
    setCoins(prev => prev - item.price);
    await fetchInventory();
    
    toast({ 
      title: "Compra realizada!", 
      description: `Você adquiriu ${item.name}` 
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

  // Item equipado por categoria
  const getEquippedItem = (category: string) => {
    return inventory.find(inv => inv.is_equipped && inv.item?.category === category);
  };

  return {
    items,
    inventory,
    coins,
    isLoading,
    purchaseItem,
    toggleEquip,
    addCoins,
    getEquippedItem,
    refresh: () => Promise.all([fetchItems(), fetchInventory(), fetchCoins()]),
  };
}