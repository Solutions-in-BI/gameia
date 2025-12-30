/**
 * Hook para notificações em tempo real
 * Escuta: presentes, amizades, badges, conquistas
 */

import { useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export function useRealtimeNotifications() {
  const { user, isAuthenticated } = useAuth();

  // Handler para novos presentes
  const handleNewGift = useCallback(async (payload: any) => {
    if (payload.new.receiver_id !== user?.id) return;
    
    const { data: gift } = await supabase
      .from("gifts")
      .select(`*, marketplace_items (name, icon)`)
      .eq("id", payload.new.id)
      .single();
    
    if (!gift) return;
    
    const { data: sender } = await supabase
      .from("profiles")
      .select("nickname")
      .eq("id", gift.sender_id)
      .single();
    
    toast.success(`🎁 ${sender?.nickname || "Alguém"} te enviou ${(gift.marketplace_items as any)?.name || "um presente"}!`);
  }, [user]);

  // Handler para novas solicitações de amizade
  const handleNewFriendRequest = useCallback(async (payload: any) => {
    if (payload.new.addressee_id !== user?.id) return;
    if (payload.new.status !== "pending") return;
    
    const { data: requester } = await supabase
      .from("profiles")
      .select("nickname")
      .eq("id", payload.new.requester_id)
      .single();
    
    toast.info(`👋 ${requester?.nickname || "Alguém"} quer ser seu amigo!`);
  }, [user]);

  // Handler para amizade aceita
  const handleFriendshipAccepted = useCallback(async (payload: any) => {
    if (payload.new.status !== "accepted") return;
    if (payload.old?.status === "accepted") return;
    
    if (payload.new.requester_id === user?.id) {
      const { data: friend } = await supabase
        .from("profiles")
        .select("nickname")
        .eq("id", payload.new.addressee_id)
        .single();
      
      toast.success(`🎉 ${friend?.nickname || "Alguém"} aceitou sua solicitação!`);
    }
  }, [user]);

  // Handler para novas notificações (genérico)
  const handleNewNotification = useCallback((payload: any) => {
    const notification = payload.new;
    
    const icons: Record<string, string> = {
      achievement: "🏆",
      badge: "🎖️",
      level_up: "⬆️",
      challenge: "🎯",
      challenge_completed: "🏆",
      training_completed: "📚",
      item_unlocked: "🎁",
      item_enabled: "🛒",
      streak: "🔥",
    };
    
    const icon = icons[notification.type] || "🔔";
    toast(notification.title, {
      description: notification.message,
      icon,
    });
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    // Canal para presentes
    const giftsChannel = supabase
      .channel("gifts-notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "gifts",
          filter: `receiver_id=eq.${user.id}`,
        },
        handleNewGift
      )
      .subscribe();

    // Canal para amizades
    const friendshipsChannel = supabase
      .channel("friendships-notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "friendships",
          filter: `addressee_id=eq.${user.id}`,
        },
        handleNewFriendRequest
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "friendships",
        },
        handleFriendshipAccepted
      )
      .subscribe();

    // Canal para notificações genéricas
    const notificationsChannel = supabase
      .channel("generic-notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        handleNewNotification
      )
      .subscribe();

    return () => {
      supabase.removeChannel(giftsChannel);
      supabase.removeChannel(friendshipsChannel);
      supabase.removeChannel(notificationsChannel);
    };
  }, [isAuthenticated, user, handleNewGift, handleNewFriendRequest, handleFriendshipAccepted, handleNewNotification]);
}
