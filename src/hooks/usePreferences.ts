/**
 * Hook para gerenciar preferências do usuário
 */

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface UserPreferences {
  id: string;
  user_id: string;
  notifications_enabled: boolean;
  sound_enabled: boolean;
  dark_mode_preference: 'system' | 'light' | 'dark';
  language: string;
  email_notifications: boolean;
  weekly_summary: boolean;
}

const defaultPreferences: Omit<UserPreferences, 'id' | 'user_id'> = {
  notifications_enabled: true,
  sound_enabled: true,
  dark_mode_preference: 'system',
  language: 'pt-BR',
  email_notifications: true,
  weekly_summary: true,
};

export function usePreferences() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      fetchPreferences();
    }
  }, [user]);

  const fetchPreferences = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_preferences' as any)
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setPreferences(data as unknown as UserPreferences);
      } else {
        // Create default preferences
        const { data: newData, error: insertError } = await supabase
          .from('user_preferences' as any)
          .insert({
            user_id: user.id,
            ...defaultPreferences,
          } as any)
          .select()
          .single();

        if (insertError) throw insertError;
        setPreferences(newData as unknown as UserPreferences);
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
      // Set defaults locally if DB fails
      setPreferences({
        id: '',
        user_id: user.id,
        ...defaultPreferences,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updatePreference = async <K extends keyof Omit<UserPreferences, 'id' | 'user_id'>>(
    key: K,
    value: UserPreferences[K]
  ) => {
    if (!user || !preferences) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('user_preferences' as any)
        .update({ [key]: value } as any)
        .eq('user_id', user.id);

      if (error) throw error;

      setPreferences((prev) => prev ? { ...prev, [key]: value } : null);
      toast.success('Preferência atualizada');
    } catch (error) {
      console.error('Error updating preference:', error);
      toast.error('Erro ao atualizar preferência');
    } finally {
      setIsSaving(false);
    }
  };

  const updateMultiplePreferences = async (
    updates: Partial<Omit<UserPreferences, 'id' | 'user_id'>>
  ) => {
    if (!user || !preferences) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('user_preferences' as any)
        .update(updates as any)
        .eq('user_id', user.id);

      if (error) throw error;

      setPreferences((prev) => prev ? { ...prev, ...updates } : null);
      toast.success('Preferências atualizadas');
    } catch (error) {
      console.error('Error updating preferences:', error);
      toast.error('Erro ao atualizar preferências');
    } finally {
      setIsSaving(false);
    }
  };

  return {
    preferences,
    isLoading,
    isSaving,
    updatePreference,
    updateMultiplePreferences,
    refetch: fetchPreferences,
  };
}
