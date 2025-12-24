/**
 * Hook para gerenciar sistema de amizades
 */

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";

type FriendshipStatus = "pending" | "accepted" | "blocked";

interface Friend {
  id: string;
  odId: string;
  odNickname: string;
  status: FriendshipStatus;
  isRequester: boolean;
  createdAt: string;
}

interface FriendGroup {
  id: string;
  name: string;
  description: string | null;
  icon: string;
  maxMembers: number;
  memberCount: number;
  isOwner: boolean;
}

interface PendingGift {
  id: string;
  senderId: string;
  senderNickname: string;
  itemId: string;
  itemName: string;
  itemIcon: string;
  message: string | null;
  createdAt: string;
}

interface UseFriends {
  friends: Friend[];
  pendingRequests: Friend[];
  groups: FriendGroup[];
  pendingGifts: PendingGift[];
  isLoading: boolean;
  sendFriendRequest: (nickname: string) => Promise<boolean>;
  acceptFriendRequest: (friendshipId: string) => Promise<boolean>;
  rejectFriendRequest: (friendshipId: string) => Promise<boolean>;
  removeFriend: (friendshipId: string) => Promise<boolean>;
  createGroup: (name: string, icon?: string) => Promise<string | null>;
  addToGroup: (groupId: string, odId: string) => Promise<boolean>;
  leaveGroup: (groupId: string) => Promise<boolean>;
  deleteGroup: (groupId: string) => Promise<boolean>;
  sendGift: (receiverId: string, itemId: string, message?: string) => Promise<boolean>;
  acceptGift: (giftId: string) => Promise<boolean>;
  rejectGift: (giftId: string) => Promise<boolean>;
  refresh: () => Promise<void>;
}

export function useFriends(): UseFriends {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  const [friends, setFriends] = useState<Friend[]>([]);
  const [groups, setGroups] = useState<FriendGroup[]>([]);
  const [pendingGifts, setPendingGifts] = useState<PendingGift[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Busca amigos
  const fetchFriends = useCallback(async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("friendships")
        .select("*")
        .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`);
      
      if (error) throw error;
      
      // Pega nicknames dos amigos
      const friendIds = (data || []).map(f => 
        f.requester_id === user.id ? f.addressee_id : f.requester_id
      );
      
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, nickname")
        .in("id", friendIds);
      
      const profileMap = new Map(profiles?.map(p => [p.id, p.nickname]) || []);
      
      const formattedFriends: Friend[] = (data || []).map(f => ({
        id: f.id,
        odId: f.requester_id === user.id ? f.addressee_id : f.requester_id,
        odNickname: profileMap.get(f.requester_id === user.id ? f.addressee_id : f.requester_id) || "Desconhecido",
        status: f.status as FriendshipStatus,
        isRequester: f.requester_id === user.id,
        createdAt: f.created_at,
      }));
      
      setFriends(formattedFriends);
    } catch (err) {
      console.error("Erro ao buscar amigos:", err);
    }
  }, [user]);

  // Busca grupos
  const fetchGroups = useCallback(async () => {
    if (!user) return;
    
    try {
      // Grupos que participo
      const { data: myMemberships } = await supabase
        .from("friend_group_members")
        .select("group_id")
        .eq("user_id", user.id);
      
      const groupIds = myMemberships?.map(m => m.group_id) || [];
      
      // Grupos que sou dono
      const { data: myGroups } = await supabase
        .from("friend_groups")
        .select("*")
        .eq("owner_id", user.id);
      
      // Combina IDs únicos
      const allGroupIds = [...new Set([...groupIds, ...(myGroups?.map(g => g.id) || [])])];
      
      if (allGroupIds.length === 0) {
        setGroups([]);
        return;
      }
      
      // Busca detalhes dos grupos
      const { data: groupsData } = await supabase
        .from("friend_groups")
        .select("*")
        .in("id", allGroupIds);
      
      // Conta membros
      const { data: memberCounts } = await supabase
        .from("friend_group_members")
        .select("group_id")
        .in("group_id", allGroupIds);
      
      const countMap = new Map<string, number>();
      memberCounts?.forEach(m => {
        countMap.set(m.group_id, (countMap.get(m.group_id) || 0) + 1);
      });
      
      const formattedGroups: FriendGroup[] = (groupsData || []).map(g => ({
        id: g.id,
        name: g.name,
        description: g.description,
        icon: g.icon || "👥",
        maxMembers: g.max_members || 10,
        memberCount: countMap.get(g.id) || 0,
        isOwner: g.owner_id === user.id,
      }));
      
      setGroups(formattedGroups);
    } catch (err) {
      console.error("Erro ao buscar grupos:", err);
    }
  }, [user]);

  // Busca presentes pendentes
  const fetchPendingGifts = useCallback(async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("gifts")
        .select(`
          *,
          marketplace_items (name, icon)
        `)
        .eq("receiver_id", user.id)
        .eq("status", "pending");
      
      if (error) throw error;
      
      // Pega nicknames dos remetentes
      const senderIds = (data || []).map(g => g.sender_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, nickname")
        .in("id", senderIds);
      
      const profileMap = new Map(profiles?.map(p => [p.id, p.nickname]) || []);
      
      const formatted: PendingGift[] = (data || []).map(g => ({
        id: g.id,
        senderId: g.sender_id,
        senderNickname: profileMap.get(g.sender_id) || "Desconhecido",
        itemId: g.item_id,
        itemName: (g.marketplace_items as any)?.name || "Item",
        itemIcon: (g.marketplace_items as any)?.icon || "🎁",
        message: g.message,
        createdAt: g.created_at,
      }));
      
      setPendingGifts(formatted);
    } catch (err) {
      console.error("Erro ao buscar presentes:", err);
    }
  }, [user]);

  // Refresh all
  const refresh = useCallback(async () => {
    setIsLoading(true);
    await Promise.all([fetchFriends(), fetchGroups(), fetchPendingGifts()]);
    setIsLoading(false);
  }, [fetchFriends, fetchGroups, fetchPendingGifts]);

  useEffect(() => {
    if (isAuthenticated) {
      refresh();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated, refresh]);

  // Enviar solicitação de amizade
  const sendFriendRequest = useCallback(async (nickname: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      // Busca usuário pelo nickname
      const { data: targetUser } = await supabase
        .from("profiles")
        .select("id")
        .eq("nickname", nickname)
        .maybeSingle();
      
      if (!targetUser) {
        toast({ title: "Usuário não encontrado", variant: "destructive" });
        return false;
      }
      
      if (targetUser.id === user.id) {
        toast({ title: "Você não pode adicionar a si mesmo", variant: "destructive" });
        return false;
      }
      
      // Verifica se já existe
      const { data: existing } = await supabase
        .from("friendships")
        .select("id")
        .or(`and(requester_id.eq.${user.id},addressee_id.eq.${targetUser.id}),and(requester_id.eq.${targetUser.id},addressee_id.eq.${user.id})`)
        .maybeSingle();
      
      if (existing) {
        toast({ title: "Já existe uma solicitação ou amizade", variant: "destructive" });
        return false;
      }
      
      const { error } = await supabase
        .from("friendships")
        .insert({
          requester_id: user.id,
          addressee_id: targetUser.id,
        });
      
      if (error) throw error;
      
      toast({ title: "Solicitação enviada!" });
      await refresh();
      return true;
    } catch (err) {
      console.error("Erro ao enviar solicitação:", err);
      return false;
    }
  }, [user, toast, refresh]);

  // Aceitar solicitação
  const acceptFriendRequest = useCallback(async (friendshipId: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const { error } = await supabase
        .from("friendships")
        .update({ status: "accepted" as any })
        .eq("id", friendshipId);
      
      if (error) throw error;
      
      toast({ title: "Amizade aceita! 🎉" });
      await refresh();
      return true;
    } catch (err) {
      console.error("Erro ao aceitar:", err);
      return false;
    }
  }, [user, toast, refresh]);

  // Rejeitar solicitação
  const rejectFriendRequest = useCallback(async (friendshipId: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const { error } = await supabase
        .from("friendships")
        .delete()
        .eq("id", friendshipId);
      
      if (error) throw error;
      
      await refresh();
      return true;
    } catch (err) {
      console.error("Erro ao rejeitar:", err);
      return false;
    }
  }, [user, refresh]);

  // Remover amigo
  const removeFriend = useCallback(async (friendshipId: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const { error } = await supabase
        .from("friendships")
        .delete()
        .eq("id", friendshipId);
      
      if (error) throw error;
      
      toast({ title: "Amigo removido" });
      await refresh();
      return true;
    } catch (err) {
      console.error("Erro ao remover:", err);
      return false;
    }
  }, [user, toast, refresh]);

  // Criar grupo
  const createGroup = useCallback(async (name: string, icon = "👥"): Promise<string | null> => {
    if (!user) return null;
    
    try {
      const { data, error } = await supabase
        .from("friend_groups")
        .insert({
          owner_id: user.id,
          name,
          icon,
        })
        .select("id")
        .single();
      
      if (error) throw error;
      
      // Adiciona dono como membro
      await supabase
        .from("friend_group_members")
        .insert({
          group_id: data.id,
          user_id: user.id,
        });
      
      toast({ title: "Grupo criado! 🎉" });
      await refresh();
      return data.id;
    } catch (err) {
      console.error("Erro ao criar grupo:", err);
      return null;
    }
  }, [user, toast, refresh]);

  // Adicionar ao grupo
  const addToGroup = useCallback(async (groupId: string, odId: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const { error } = await supabase
        .from("friend_group_members")
        .insert({
          group_id: groupId,
          user_id: odId,
        });
      
      if (error) throw error;
      
      toast({ title: "Membro adicionado!" });
      await refresh();
      return true;
    } catch (err) {
      console.error("Erro ao adicionar:", err);
      return false;
    }
  }, [user, toast, refresh]);

  // Sair do grupo
  const leaveGroup = useCallback(async (groupId: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const { error } = await supabase
        .from("friend_group_members")
        .delete()
        .eq("group_id", groupId)
        .eq("user_id", user.id);
      
      if (error) throw error;
      
      toast({ title: "Você saiu do grupo" });
      await refresh();
      return true;
    } catch (err) {
      console.error("Erro ao sair:", err);
      return false;
    }
  }, [user, toast, refresh]);

  // Deletar grupo
  const deleteGroup = useCallback(async (groupId: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const { error } = await supabase
        .from("friend_groups")
        .delete()
        .eq("id", groupId);
      
      if (error) throw error;
      
      toast({ title: "Grupo deletado" });
      await refresh();
      return true;
    } catch (err) {
      console.error("Erro ao deletar:", err);
      return false;
    }
  }, [user, toast, refresh]);

  // Enviar presente
  const sendGift = useCallback(async (receiverId: string, itemId: string, message?: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      // Busca preço do item
      const { data: item } = await supabase
        .from("marketplace_items")
        .select("price, name")
        .eq("id", itemId)
        .single();
      
      if (!item) {
        toast({ title: "Item não encontrado", variant: "destructive" });
        return false;
      }
      
      // Busca moedas do usuário
      const { data: stats } = await supabase
        .from("user_stats")
        .select("coins")
        .eq("user_id", user.id)
        .single();
      
      if (!stats || stats.coins < item.price) {
        toast({ title: "Moedas insuficientes", variant: "destructive" });
        return false;
      }
      
      // Deduz moedas
      await supabase
        .from("user_stats")
        .update({ coins: stats.coins - item.price })
        .eq("user_id", user.id);
      
      // Cria presente
      const { error } = await supabase
        .from("gifts")
        .insert({
          sender_id: user.id,
          receiver_id: receiverId,
          item_id: itemId,
          message,
          coins_spent: item.price,
        });
      
      if (error) throw error;
      
      toast({ title: `Presente enviado! 🎁`, description: item.name });
      return true;
    } catch (err) {
      console.error("Erro ao enviar presente:", err);
      return false;
    }
  }, [user, toast]);

  // Aceitar presente
  const acceptGift = useCallback(async (giftId: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      // Busca presente
      const { data: gift } = await supabase
        .from("gifts")
        .select("item_id")
        .eq("id", giftId)
        .single();
      
      if (!gift) return false;
      
      // Adiciona item ao inventário
      await supabase
        .from("user_inventory")
        .insert({
          user_id: user.id,
          item_id: gift.item_id,
        });
      
      // Atualiza status do presente
      await supabase
        .from("gifts")
        .update({ 
          status: "accepted" as any,
          responded_at: new Date().toISOString(),
        })
        .eq("id", giftId);
      
      toast({ title: "Presente aceito! 🎉" });
      await refresh();
      return true;
    } catch (err) {
      console.error("Erro ao aceitar presente:", err);
      return false;
    }
  }, [user, toast, refresh]);

  // Rejeitar presente
  const rejectGift = useCallback(async (giftId: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      // Busca presente para devolver moedas
      const { data: gift } = await supabase
        .from("gifts")
        .select("sender_id, coins_spent")
        .eq("id", giftId)
        .single();
      
      if (!gift) return false;
      
      // Devolve moedas ao remetente
      const { data: senderStats } = await supabase
        .from("user_stats")
        .select("coins")
        .eq("user_id", gift.sender_id)
        .single();
      
      if (senderStats) {
        await supabase
          .from("user_stats")
          .update({ coins: senderStats.coins + gift.coins_spent })
          .eq("user_id", gift.sender_id);
      }
      
      // Atualiza status
      await supabase
        .from("gifts")
        .update({ 
          status: "rejected" as any,
          responded_at: new Date().toISOString(),
        })
        .eq("id", giftId);
      
      toast({ title: "Presente recusado" });
      await refresh();
      return true;
    } catch (err) {
      console.error("Erro ao rejeitar presente:", err);
      return false;
    }
  }, [user, toast, refresh]);

  const pendingRequests = friends.filter(f => f.status === "pending" && !f.isRequester);
  const acceptedFriends = friends.filter(f => f.status === "accepted");

  return {
    friends: acceptedFriends,
    pendingRequests,
    groups,
    pendingGifts,
    isLoading,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    removeFriend,
    createGroup,
    addToGroup,
    leaveGroup,
    deleteGroup,
    sendGift,
    acceptGift,
    rejectGift,
    refresh,
  };
}
