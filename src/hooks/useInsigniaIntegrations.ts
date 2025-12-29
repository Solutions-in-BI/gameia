/**
 * useInsigniaIntegrations - Integração de insígnias com loja e títulos
 */

import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useTitles } from "./useTitles";
import { useMarketplace } from "./useMarketplace";
import { useToast } from "./use-toast";
import { useQueryClient } from "@tanstack/react-query";

interface InsigniaReward {
  unlocks_title_id: string | null;
  unlocks_item_id: string | null;
  xp_reward: number;
  coins_reward: number;
}

export function useInsigniaIntegrations() {
  const { user } = useAuth();
  const { unlockTitle } = useTitles();
  const { refresh: refreshMarketplace } = useMarketplace();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  /**
   * Process rewards from an unlocked insignia
   */
  const processInsigniaRewards = useCallback(async (
    insigniaId: string,
    rewards: InsigniaReward
  ) => {
    if (!user) return;

    const notifications: string[] = [];

    try {
      // 1. Unlock title if specified
      if (rewards.unlocks_title_id) {
        const success = await unlockTitle(rewards.unlocks_title_id);
        if (success) {
          notifications.push("Novo título desbloqueado!");
        }
      }

      // 2. Grant marketplace item if specified
      if (rewards.unlocks_item_id) {
        // Check if user already owns the item
        const { data: existingItem } = await supabase
          .from("user_inventory")
          .select("id")
          .eq("user_id", user.id)
          .eq("item_id", rewards.unlocks_item_id)
          .maybeSingle();

        if (!existingItem) {
          // Add item to inventory
          const { error } = await supabase
            .from("user_inventory")
            .insert({
              user_id: user.id,
              item_id: rewards.unlocks_item_id,
              status: "active",
            });

          if (!error) {
            notifications.push("Novo item desbloqueado na loja!");
            refreshMarketplace();
          }
        }
      }

      // 3. XP and coins are handled by the database trigger
      // But we can show a notification
      if (rewards.xp_reward > 0 || rewards.coins_reward > 0) {
        const rewardParts = [];
        if (rewards.xp_reward > 0) rewardParts.push(`+${rewards.xp_reward} XP`);
        if (rewards.coins_reward > 0) rewardParts.push(`+${rewards.coins_reward} moedas`);
        
        if (rewardParts.length > 0) {
          notifications.push(rewardParts.join(" e "));
        }
      }

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ["user-stats"] });
      queryClient.invalidateQueries({ queryKey: ["user-titles"] });
      queryClient.invalidateQueries({ queryKey: ["user-inventory"] });

      // Show combined notification if there are multiple rewards
      if (notifications.length > 1) {
        toast({
          title: "🎁 Recompensas Recebidas!",
          description: notifications.join(" • "),
        });
      }

    } catch (error) {
      console.error("Error processing insignia rewards:", error);
    }
  }, [user, unlockTitle, refreshMarketplace, queryClient, toast]);

  /**
   * Get titles unlockable by insignias
   */
  const getTitlesFromInsignias = useCallback(async () => {
    const { data } = await supabase
      .from("insignias")
      .select("id, name, icon, unlocks_title_id")
      .not("unlocks_title_id", "is", null);

    return data || [];
  }, []);

  /**
   * Get marketplace items unlockable by insignias
   */
  const getItemsFromInsignias = useCallback(async () => {
    const { data } = await supabase
      .from("insignias")
      .select("id, name, icon, unlocks_item_id")
      .not("unlocks_item_id", "is", null);

    return data || [];
  }, []);

  /**
   * Check if a title is locked behind an insignia
   */
  const isTitleLockedByInsignia = useCallback(async (titleId: string) => {
    const { data } = await supabase
      .from("insignias")
      .select("id, name, icon")
      .eq("unlocks_title_id", titleId)
      .maybeSingle();

    return data;
  }, []);

  /**
   * Check if an item is locked behind an insignia
   */
  const isItemLockedByInsignia = useCallback(async (itemId: string) => {
    const { data } = await supabase
      .from("insignias")
      .select("id, name, icon")
      .eq("unlocks_item_id", itemId)
      .maybeSingle();

    return data;
  }, []);

  return {
    processInsigniaRewards,
    getTitlesFromInsignias,
    getItemsFromInsignias,
    isTitleLockedByInsignia,
    isItemLockedByInsignia,
  };
}
