/**
 * useItemRewards - Hook para entrega de itens da loja como recompensa
 * Suporta desbloqueio automático e liberação para compra
 */

import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useOrganization } from "./useOrganization";
import { toast } from "sonner";

export type ItemUnlockMode = "auto_unlock" | "enable_purchase";
export type ItemRewardSourceType = "challenge" | "training" | "goal";

export interface ItemRewardConfig {
  item_id?: string;      // Item específico
  category?: string;     // Ou categoria (sorteia item aleatório)
  unlock_mode: ItemUnlockMode;
}

export interface RewardItemResult {
  success: boolean;
  item?: {
    id: string;
    name: string;
    icon: string;
    category: string;
  };
  mode: ItemUnlockMode;
  error?: string;
}

// Categorias de itens suportadas
export const ITEM_CATEGORIES = [
  { id: "avatar", label: "Avatar", icon: "👤" },
  { id: "title", label: "Título", icon: "🏷️" },
  { id: "frame", label: "Moldura", icon: "🖼️" },
  { id: "banner", label: "Banner", icon: "🎌" },
  { id: "mascot", label: "Mascote", icon: "🐾" },
  { id: "benefit", label: "Benefício", icon: "🎁" },
] as const;

export function useItemRewards() {
  const { user } = useAuth();
  const { currentOrg } = useOrganization();

  /**
   * Busca um item aleatório de uma categoria
   */
  const getRandomItemFromCategory = useCallback(async (
    category: string
  ): Promise<{ id: string; name: string; icon: string; category: string } | null> => {
    if (!currentOrg?.id) return null;

    try {
      // Buscar itens disponíveis da categoria que o usuário ainda não tem
      const { data: items, error } = await supabase
        .from("marketplace_items")
        .select("id, name, icon, category")
        .eq("organization_id", currentOrg.id)
        .eq("category", category)
        .eq("is_active", true)
        .limit(10);

      if (error || !items || items.length === 0) {
        console.log("No items found in category:", category);
        return null;
      }

      // Verificar quais o usuário já tem
      const { data: owned } = await supabase
        .from("user_inventory")
        .select("item_id")
        .eq("user_id", user?.id || "")
        .in("item_id", items.map(i => i.id));

      const ownedIds = new Set(owned?.map(o => o.item_id) || []);
      const available = items.filter(i => !ownedIds.has(i.id));

      if (available.length === 0) {
        // Usuário já tem todos os itens, retornar qualquer um
        return items[Math.floor(Math.random() * items.length)];
      }

      // Retornar item aleatório
      return available[Math.floor(Math.random() * available.length)];
    } catch (error) {
      console.error("Error getting random item:", error);
      return null;
    }
  }, [currentOrg?.id, user?.id]);

  /**
   * Concede um item como recompensa
   */
  const grantItemReward = useCallback(async (
    config: ItemRewardConfig,
    sourceType: ItemRewardSourceType,
    sourceId: string,
    showNotification: boolean = true
  ): Promise<RewardItemResult> => {
    if (!user?.id || !currentOrg?.id) {
      return { success: false, mode: config.unlock_mode, error: "User not authenticated" };
    }

    try {
      let item: { id: string; name: string; icon: string; category: string } | null = null;

      // 1. Determinar o item
      if (config.item_id) {
        // Item específico
        const { data, error } = await supabase
          .from("marketplace_items")
          .select("id, name, icon, category")
          .eq("id", config.item_id)
          .single();

        if (error || !data) {
          return { success: false, mode: config.unlock_mode, error: "Item not found" };
        }
        item = data;
      } else if (config.category) {
        // Sortear da categoria
        item = await getRandomItemFromCategory(config.category);
        if (!item) {
          return { success: false, mode: config.unlock_mode, error: "No items available in category" };
        }
      } else {
        return { success: false, mode: config.unlock_mode, error: "No item or category specified" };
      }

      // 2. Aplicar recompensa baseado no modo
      if (config.unlock_mode === "auto_unlock") {
        // Adicionar diretamente ao inventário
        const { error } = await supabase
          .from("user_inventory")
          .upsert({
            user_id: user.id,
            item_id: item.id,
            purchased_at: new Date().toISOString(),
            status: "active",
          }, {
            onConflict: "user_id,item_id"
          });

        if (error) {
          console.error("Error adding to inventory:", error);
          return { success: false, mode: config.unlock_mode, item, error: error.message };
        }

        if (showNotification) {
          toast.success(`🎁 Novo item desbloqueado: ${item.name}!`);
        }
      } else {
        // Liberar para compra
        const { error } = await supabase
          .from("user_unlocked_items")
          .upsert({
            user_id: user.id,
            item_id: item.id,
            source_type: sourceType,
            source_id: sourceId,
            organization_id: currentOrg.id,
          }, {
            onConflict: "user_id,item_id"
          });

        if (error) {
          console.error("Error unlocking item:", error);
          return { success: false, mode: config.unlock_mode, item, error: error.message };
        }

        if (showNotification) {
          toast.success(`🔓 Item liberado na loja: ${item.name}!`);
        }
      }

      // 3. Criar notificação no banco
      await supabase.from("notifications").insert({
        user_id: user.id,
        type: config.unlock_mode === "auto_unlock" ? "item_unlocked" : "item_available",
        title: config.unlock_mode === "auto_unlock" 
          ? "Novo Item Desbloqueado!" 
          : "Novo Item Disponível!",
        message: config.unlock_mode === "auto_unlock"
          ? `Você ganhou ${item.name}! Confira seu inventário.`
          : `${item.name} está disponível para compra na loja!`,
        data: {
          item_id: item.id,
          item_name: item.name,
          item_icon: item.icon,
          source_type: sourceType,
          source_id: sourceId,
          unlock_mode: config.unlock_mode,
        },
      });

      // 4. Registrar evento de gamificação
      await supabase.from("gamification_events").insert({
        user_id: user.id,
        event_type: config.unlock_mode === "auto_unlock" ? "item_unlocked" : "item_enabled",
        source_type: sourceType,
        source_id: sourceId,
        metadata: {
          item_id: item.id,
          item_name: item.name,
          category: item.category,
          unlock_mode: config.unlock_mode,
        },
      });

      return { success: true, item, mode: config.unlock_mode };
    } catch (error) {
      console.error("Error granting item reward:", error);
      return { success: false, mode: config.unlock_mode, error: String(error) };
    }
  }, [user?.id, currentOrg?.id, getRandomItemFromCategory]);

  /**
   * Processa múltiplos itens como recompensa
   */
  const processItemRewards = useCallback(async (
    rewardItems: ItemRewardConfig[],
    sourceType: ItemRewardSourceType,
    sourceId: string,
    showNotification: boolean = true
  ): Promise<RewardItemResult[]> => {
    const results: RewardItemResult[] = [];

    for (const config of rewardItems) {
      const result = await grantItemReward(config, sourceType, sourceId, showNotification);
      results.push(result);
    }

    return results;
  }, [grantItemReward]);

  /**
   * Busca itens disponíveis para configuração de recompensas
   */
  const getAvailableItems = useCallback(async (
    category?: string
  ): Promise<Array<{ id: string; name: string; icon: string; category: string; price: number }>> => {
    if (!currentOrg?.id) return [];

    try {
      let query = supabase
        .from("marketplace_items")
        .select("id, name, icon, category, price")
        .eq("organization_id", currentOrg.id)
        .eq("is_active", true)
        .order("name");

      if (category) {
        query = query.eq("category", category);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching items:", error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error("Error fetching items:", error);
      return [];
    }
  }, [currentOrg?.id]);

  /**
   * Verifica se o usuário tem um item liberado para compra
   */
  const isItemUnlockedForPurchase = useCallback(async (itemId: string): Promise<boolean> => {
    if (!user?.id) return false;

    const { data } = await supabase
      .from("user_unlocked_items")
      .select("id")
      .eq("user_id", user.id)
      .eq("item_id", itemId)
      .single();

    return !!data;
  }, [user?.id]);

  return {
    grantItemReward,
    processItemRewards,
    getAvailableItems,
    getRandomItemFromCategory,
    isItemUnlockedForPurchase,
    ITEM_CATEGORIES,
  };
}
