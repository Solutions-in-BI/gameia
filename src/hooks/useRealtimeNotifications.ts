/**
 * Hook para notificações em tempo real
 */

import { useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";

export function useRealtimeNotifications() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  // Handler para novos presentes
  const handleNewGift = useCallback(async (payload: any) => {
    if (payload.new.receiver_id !== user?.id) return;
    
    // Busca detalhes do presente
    const { data: gift } = await supabase
      .from("gifts")
      .select(`
        *,
        marketplace_items (name, icon)
      `)
      .eq("id", payload.new.id)
      .single();
    
    if (!gift) return;
    
    // Busca nickname do remetente
    const { data: sender } = await supabase
      .from("profiles")
      .select("nickname")
      .eq("id", gift.sender_id)
      .single();
    
    toast({
      title: "🎁 Novo Presente!",
      description: `${sender?.nickname || "Alguém"} te enviou ${(gift.marketplace_items as any)?.name || "um presente"}!`,
    });
  }, [user, toast]);

  // Handler para novas solicitações de amizade
  const handleNewFriendRequest = useCallback(async (payload: any) => {
    if (payload.new.addressee_id !== user?.id) return;
    if (payload.new.status !== "pending") return;
    
    // Busca nickname do solicitante
    const { data: requester } = await supabase
      .from("profiles")
      .select("nickname")
      .eq("id", payload.new.requester_id)
      .single();
    
    toast({
      title: "👋 Nova Solicitação de Amizade!",
      description: `${requester?.nickname || "Alguém"} quer ser seu amigo!`,
    });
  }, [user, toast]);

  // Handler para amizade aceita
  const handleFriendshipAccepted = useCallback(async (payload: any) => {
    if (payload.new.status !== "accepted") return;
    if (payload.old?.status === "accepted") return;
    
    // Se eu fui quem enviou, notifica que foi aceito
    if (payload.new.requester_id === user?.id) {
      const { data: friend } = await supabase
        .from("profiles")
        .select("nickname")
        .eq("id", payload.new.addressee_id)
        .single();
      
      toast({
        title: "🎉 Amizade Aceita!",
        description: `${friend?.nickname || "Alguém"} aceitou sua solicitação!`,
      });
    }
  }, [user, toast]);

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

    return () => {
      supabase.removeChannel(giftsChannel);
      supabase.removeChannel(friendshipsChannel);
    };
  }, [isAuthenticated, user, handleNewGift, handleNewFriendRequest, handleFriendshipAccepted]);
}
