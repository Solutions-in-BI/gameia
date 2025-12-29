/**
 * Hook centralizado para subscriptions Realtime
 * Consolida todas as subscriptions em um único channel
 */

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export function useRealtimeHub() {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const subscribedRef = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || !user?.id || subscribedRef.current) return;
    
    subscribedRef.current = true;
    console.log("[RealtimeHub] Setting up unified realtime subscription");

    const channel = supabase
      .channel(`user_hub_${user.id}`)
      // Escuta mudanças em user_stats
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'user_stats',
          filter: `user_id=eq.${user.id}` 
        },
        () => {
          console.log("[RealtimeHub] user_stats changed");
          queryClient.invalidateQueries({ queryKey: ['user-data'] });
        }
      )
      // Escuta mudanças em user_streaks
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'user_streaks',
          filter: `user_id=eq.${user.id}` 
        },
        () => {
          console.log("[RealtimeHub] user_streaks changed");
          queryClient.invalidateQueries({ queryKey: ['user-data'] });
        }
      )
      // Escuta novos eventos de gamificação
      .on(
        'postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'gamification_events',
          filter: `user_id=eq.${user.id}` 
        },
        () => {
          console.log("[RealtimeHub] gamification_event received");
          queryClient.invalidateQueries({ queryKey: ['daily-missions'] });
          queryClient.invalidateQueries({ queryKey: ['insignias'] });
          queryClient.invalidateQueries({ queryKey: ['user-data'] });
        }
      )
      // Escuta mudanças em daily_missions
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'daily_missions',
          filter: `user_id=eq.${user.id}` 
        },
        () => {
          console.log("[RealtimeHub] daily_missions changed");
          queryClient.invalidateQueries({ queryKey: ['daily-missions'] });
        }
      )
      // Escuta novas notificações
      .on(
        'postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'notifications',
          filter: `user_id=eq.${user.id}` 
        },
        () => {
          console.log("[RealtimeHub] notification received");
          queryClient.invalidateQueries({ queryKey: ['notifications'] });
        }
      )
      // Escuta mudanças em user_badges
      .on(
        'postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'user_badges',
          filter: `user_id=eq.${user.id}` 
        },
        () => {
          console.log("[RealtimeHub] badge unlocked");
          queryClient.invalidateQueries({ queryKey: ['badges'] });
          queryClient.invalidateQueries({ queryKey: ['insignias'] });
        }
      )
      // Escuta mudanças em user_insignias
      .on(
        'postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'user_insignias',
          filter: `user_id=eq.${user.id}` 
        },
        () => {
          console.log("[RealtimeHub] insignia unlocked");
          queryClient.invalidateQueries({ queryKey: ['insignias'] });
        }
      )
      // Escuta sugestões de assessment
      .on(
        'postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'assessment_suggestions',
          filter: `user_id=eq.${user.id}` 
        },
        () => {
          console.log("[RealtimeHub] assessment suggestion received");
          queryClient.invalidateQueries({ queryKey: ['assessment-suggestions'] });
          queryClient.invalidateQueries({ queryKey: ['contextual-assessments'] });
        }
      )
      // Escuta resultados de assessment 360
      .on(
        'postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'assessment_360_results',
          filter: `user_id=eq.${user.id}` 
        },
        () => {
          console.log("[RealtimeHub] assessment 360 result received");
          queryClient.invalidateQueries({ queryKey: ['assessment-360'] });
          queryClient.invalidateQueries({ queryKey: ['evolution-dashboard'] });
        }
      )
      // Escuta mudanças em development_plans
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'development_plans',
          filter: `user_id=eq.${user.id}` 
        },
        () => {
          console.log("[RealtimeHub] development plan changed");
          queryClient.invalidateQueries({ queryKey: ['pdi'] });
          queryClient.invalidateQueries({ queryKey: ['development-plans'] });
        }
      )
      // Escuta mudanças em development_goals
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'development_goals'
        },
        () => {
          console.log("[RealtimeHub] development goal changed");
          queryClient.invalidateQueries({ queryKey: ['pdi'] });
          queryClient.invalidateQueries({ queryKey: ['development-goals'] });
        }
      )
      .subscribe((status) => {
        console.log("[RealtimeHub] Subscription status:", status);
      });

    return () => {
      console.log("[RealtimeHub] Cleaning up subscription");
      subscribedRef.current = false;
      supabase.removeChannel(channel);
    };
  }, [isAuthenticated, user?.id, queryClient]);
}
