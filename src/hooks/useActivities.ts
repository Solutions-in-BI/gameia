/**
 * Hook para gerenciar histórico de atividades do usuário
 */

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface Activity {
  id: string;
  activity_type: string;
  activity_data: Record<string, any>;
  xp_earned: number;
  coins_earned: number;
  created_at: string;
}

export function useActivities() {
  const { user } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchActivities();
    }
  }, [user]);

  const fetchActivities = async () => {
    if (!user) return;

    try {
      // Using raw query since types may not be updated yet
      const { data, error } = await supabase
        .from('user_activities' as any)
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setActivities((data as unknown as Activity[]) || []);
    } catch (error) {
      console.error('Error fetching activities:', error);
      setActivities([]);
    } finally {
      setIsLoading(false);
    }
  };

  const logActivity = async (
    type: string,
    data: Record<string, any> = {},
    xpEarned = 0,
    coinsEarned = 0
  ) => {
    if (!user) return;

    try {
      const { error } = await supabase.from('user_activities' as any).insert({
        user_id: user.id,
        activity_type: type,
        activity_data: data,
        xp_earned: xpEarned,
        coins_earned: coinsEarned,
      } as any);

      if (error) throw error;
      
      // Add to local state
      const newActivity: Activity = {
        id: crypto.randomUUID(),
        activity_type: type,
        activity_data: data,
        xp_earned: xpEarned,
        coins_earned: coinsEarned,
        created_at: new Date().toISOString(),
      };
      setActivities((prev) => [newActivity, ...prev].slice(0, 50));
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  };

  const getActivityIcon = (type: string): string => {
    const icons: Record<string, string> = {
      quiz_completed: '🧠',
      scenario_completed: '🎯',
      achievement_unlocked: '🏆',
      level_up: '⬆️',
      login: '👋',
      streak_claimed: '🔥',
      item_purchased: '🛒',
      gift_sent: '🎁',
      gift_received: '📦',
      skill_unlocked: '⭐',
      game_played: '🎮',
    };
    return icons[type] || '📌';
  };

  const getActivityLabel = (type: string): string => {
    const labels: Record<string, string> = {
      quiz_completed: 'Quiz completado',
      scenario_completed: 'Cenário completado',
      achievement_unlocked: 'Conquista desbloqueada',
      level_up: 'Subiu de nível',
      login: 'Login realizado',
      streak_claimed: 'Recompensa diária coletada',
      item_purchased: 'Item comprado',
      gift_sent: 'Presente enviado',
      gift_received: 'Presente recebido',
      skill_unlocked: 'Skill desbloqueada',
      game_played: 'Jogo jogado',
    };
    return labels[type] || type;
  };

  return {
    activities,
    isLoading,
    logActivity,
    getActivityIcon,
    getActivityLabel,
    refetch: fetchActivities,
  };
}
