/**
 * Hook para gerenciar lembretes de streak
 */

import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useStreak } from './useStreak';
import { toast } from 'sonner';

export function useStreakReminder() {
  const { user } = useAuth();
  const { streak, isAtRisk } = useStreak();

  // Check if user should be reminded about their streak
  const checkStreakStatus = useCallback(async () => {
    if (!user || !streak.lastPlayedAt) return;

    const now = new Date();
    const lastPlayed = new Date(streak.lastPlayedAt);
    const hoursSinceLastPlay = (now.getTime() - lastPlayed.getTime()) / (1000 * 60 * 60);

    // If at risk (played yesterday but not today)
    if (isAtRisk && streak.currentStreak > 0) {
      // Show warning toast
      toast('🔥 Seu streak está em risco!', {
        description: `Você tem um streak de ${streak.currentStreak} dias. Jogue agora para mantê-lo!`,
        duration: 10000,
        action: {
          label: 'Jogar',
          onClick: () => {
            window.location.href = '/';
          },
        },
      });

      // Create notification
      await supabase.from('notifications').insert({
        user_id: user.id,
        type: 'streak_warning',
        title: '🔥 Streak em risco!',
        message: `Você tem um streak de ${streak.currentStreak} dias. Não perca!`,
        category: 'engagement',
        priority: 'high',
      });
    }

    // If streak was broken (more than 48 hours)
    if (hoursSinceLastPlay >= 48 && streak.currentStreak === 0) {
      // Check if we already notified about this
      const { data: existingNotif } = await supabase
        .from('notifications')
        .select('id')
        .eq('user_id', user.id)
        .eq('type', 'streak_broken')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .maybeSingle();

      if (!existingNotif) {
        await supabase.from('notifications').insert({
          user_id: user.id,
          type: 'streak_broken',
          title: '💔 Streak perdido',
          message: 'Seu streak foi zerado. Comece de novo hoje!',
          category: 'engagement',
          priority: 'normal',
        });
      }
    }
  }, [user, streak, isAtRisk]);

  // Run check on mount and periodically
  useEffect(() => {
    if (!user) return;

    // Initial check after 5 seconds
    const timer = setTimeout(checkStreakStatus, 5000);

    // Check every 30 minutes
    const interval = setInterval(checkStreakStatus, 30 * 60 * 1000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [user, checkStreakStatus]);

  return { checkStreakStatus };
}
