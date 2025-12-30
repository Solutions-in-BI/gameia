/**
 * usePlayerRewards - Hook para premiar o usuário com XP e moedas
 * Usa o hook existente useLevel para adicionar XP e useUserData para coins
 */

import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useLevel } from "@/hooks/useLevel";
import { useUserData } from "@/hooks/useUserData";
import { toast } from "sonner";

export function usePlayerRewards() {
  const { user } = useAuth();
  const { addXP } = useLevel();
  const { addCoins } = useUserData();

  const awardRewards = useCallback(async (
    xp: number,
    coins: number,
    sourceType: string,
    sourceId: string
  ) => {
    if (!user) return;

    try {
      // Award XP usando o hook existente
      if (xp > 0) {
        await addXP(xp, `${sourceType}: ${sourceId}`);
      }

      // Award coins usando o hook existente
      if (coins > 0) {
        await addCoins(coins);
      }

      // Registrar evento core
      await supabase
        .from("core_events")
        .insert({
          user_id: user.id,
          event_type: sourceType,
          xp_earned: xp,
          coins_earned: coins,
          metadata: { source_id: sourceId },
        });

      // Mostrar toast de recompensa
      if (xp > 0 || coins > 0) {
        const rewards = [];
        if (xp > 0) rewards.push(`+${xp} XP`);
        if (coins > 0) rewards.push(`+${coins} moedas`);
        toast.success(rewards.join(" | "));
      }

    } catch (err) {
      console.error("Error awarding rewards:", err);
    }
  }, [user, addXP, addCoins]);

  return { awardRewards };
}
