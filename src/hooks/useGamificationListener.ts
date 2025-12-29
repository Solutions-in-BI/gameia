/**
 * Hook que escuta eventos de gamificação via Realtime
 * Atualiza missões e verifica insígnias automaticamente
 */

import { useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface UseGamificationListenerOptions {
  onEvent?: () => void;
}

export function useGamificationListener(options: UseGamificationListenerOptions = {}) {
  const { user, isAuthenticated } = useAuth();
  const lastEventIdRef = useRef<string | null>(null);

  const handleGamificationEvent = useCallback(() => {
    console.log("[GamificationListener] New event detected");
    options.onEvent?.();
  }, [options]);

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    console.log("[GamificationListener] Setting up realtime subscription");

    const channel = supabase
      .channel(`gamification_events_${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "gamification_events",
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          // Avoid duplicate processing
          const eventId = (payload.new as { id?: string })?.id;
          if (eventId && eventId !== lastEventIdRef.current) {
            lastEventIdRef.current = eventId;
            handleGamificationEvent();
          }
        }
      )
      .subscribe((status) => {
        console.log("[GamificationListener] Subscription status:", status);
      });

    return () => {
      console.log("[GamificationListener] Cleaning up subscription");
      supabase.removeChannel(channel);
    };
  }, [isAuthenticated, user, handleGamificationEvent]);
}
