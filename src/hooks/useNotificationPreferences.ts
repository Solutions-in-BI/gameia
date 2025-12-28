/**
 * Hook para gerenciar preferências de notificações do usuário
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface NotificationPreferences {
  email_streak_reminder: boolean;
  email_weekly_summary: boolean;
  push_achievements: boolean;
  push_challenges: boolean;
  push_friends: boolean;
}

const defaultPreferences: NotificationPreferences = {
  email_streak_reminder: true,
  email_weekly_summary: true,
  push_achievements: true,
  push_challenges: true,
  push_friends: true,
};

export function useNotificationPreferences() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: preferences = defaultPreferences, isLoading } = useQuery({
    queryKey: ['notification-preferences', user?.id],
    queryFn: async () => {
      if (!user?.id) return defaultPreferences;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      // Type assertion since the column was just added via migration
      const prefs = (data as any)?.notification_preferences;
      return (prefs as NotificationPreferences) || defaultPreferences;
    },
    enabled: !!user?.id,
  });

  const updateMutation = useMutation({
    mutationFn: async (newPreferences: Partial<NotificationPreferences>) => {
      if (!user?.id) throw new Error('User not authenticated');

      const updatedPreferences = { ...preferences, ...newPreferences };

      // Use direct update with type assertion since the column was just added via migration
      const { error } = await supabase
        .from('profiles')
        .update({ notification_preferences: updatedPreferences } as any)
        .eq('id', user.id);

      if (error) throw error;
      return updatedPreferences;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['notification-preferences', user?.id], data);
      toast.success('Preferências atualizadas');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar preferências: ' + error.message);
    },
  });

  return {
    preferences,
    isLoading,
    updatePreferences: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
  };
}
