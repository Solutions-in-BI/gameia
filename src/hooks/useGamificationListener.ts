/**
 * Hook que escuta eventos de gamificação via Realtime
 * Atualiza missões e verifica insígnias automaticamente
 * 
 * OTIMIZADO: Usa useRef para callback estável, evitando re-renders
 */

import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface UseGamificationListenerOptions {
  onEvent?: () => void;
}

export function useGamificationListener(options: UseGamificationListenerOptions = {}) {
  const { user, isAuthenticated } = useAuth();
  const lastEventIdRef = useRef<string | null>(null);
  
  // Usar ref para manter callback estável entre renders
  const onEventRef = useRef(options.onEvent);
  
  // Atualiza a ref quando o callback muda, sem causar re-subscribe
  useEffect(() => {
    onEventRef.current = options.onEvent;
  }, [options.onEvent]);

  useEffect(() => {
    // Só subscreve se autenticado e tem user.id
    if (!isAuthenticated || !user?.id) return;

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
            console.log("[GamificationListener] New event detected");
            // Usa a ref estável
            onEventRef.current?.();
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
  // IMPORTANTE: Não incluir options.onEvent nas deps - usamos ref
  }, [isAuthenticated, user?.id]);
}
