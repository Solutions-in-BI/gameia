/**
 * Hook para gerenciar notificações do usuário
 * com suporte a realtime
 */

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string | null;
  data: Record<string, any>;
  is_read: boolean;
  created_at: string;
  read_at: string | null;
  category?: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  action_url?: string | null;
  expires_at?: string | null;
}

export interface NotificationPreferences {
  email_streak_reminder: boolean;
  email_weekly_summary: boolean;
  push_achievements: boolean;
  push_challenges: boolean;
  push_friends: boolean;
}

interface UseNotifications {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  clearAll: () => Promise<void>;
  refresh: () => Promise<void>;
}

export function useNotifications(): UseNotifications {
  const { user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  // Busca notificações
  const fetchNotifications = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      setNotifications((data || []) as Notification[]);
    } catch (err) {
      console.error("Erro ao buscar notificações:", err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Marcar como lida
  const markAsRead = useCallback(async (id: string) => {
    try {
      await supabase
        .from("notifications")
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq("id", id);

      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, is_read: true, read_at: new Date().toISOString() } : n))
      );
    } catch (err) {
      console.error("Erro ao marcar como lida:", err);
    }
  }, []);

  // Marcar todas como lidas
  const markAllAsRead = useCallback(async () => {
    if (!user) return;

    try {
      await supabase
        .from("notifications")
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq("user_id", user.id)
        .eq("is_read", false);

      setNotifications(prev =>
        prev.map(n => ({ ...n, is_read: true, read_at: n.read_at || new Date().toISOString() }))
      );
    } catch (err) {
      console.error("Erro ao marcar todas como lidas:", err);
    }
  }, [user]);

  // Deletar notificação
  const deleteNotification = useCallback(async (id: string) => {
    try {
      await supabase.from("notifications").delete().eq("id", id);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      console.error("Erro ao deletar notificação:", err);
    }
  }, []);

  // Limpar todas
  const clearAll = useCallback(async () => {
    if (!user) return;

    try {
      await supabase.from("notifications").delete().eq("user_id", user.id);
      setNotifications([]);
    } catch (err) {
      console.error("Erro ao limpar notificações:", err);
    }
  }, [user]);

  // Refresh
  const refresh = useCallback(async () => {
    setIsLoading(true);
    await fetchNotifications();
  }, [fetchNotifications]);

  // Initial fetch
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
    }
  }, [isAuthenticated, fetchNotifications]);

  // Realtime subscription
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const channel = supabase
      .channel("notifications-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          setNotifications(prev => [newNotification, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAuthenticated, user]);

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    refresh,
  };
}
