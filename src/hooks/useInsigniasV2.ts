/**
 * Hook do Sistema de Insígnias V2
 * Usa funções SQL do backend para verificação de critérios
 */

import { useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";
import type {
  InsigniaV2,
  InsigniaWithStatus,
  UserInsigniaV2,
  InsigniaType,
  CriteriaCheckResult,
  UnlockResult,
  UserInsigniasStats,
  InsigniasFilters,
  INSIGNIA_TYPE_CONFIG,
} from "@/types/insignias";

interface UseInsigniasV2Return {
  // Data
  insignias: InsigniaWithStatus[];
  userInsignias: UserInsigniaV2[];
  stats: UserInsigniasStats | null;
  isLoading: boolean;
  
  // Filters
  getByType: (type: InsigniaType) => InsigniaWithStatus[];
  getByCategory: (category: string) => InsigniaWithStatus[];
  getByStarLevel: (level: number) => InsigniaWithStatus[];
  getUnlocked: () => InsigniaWithStatus[];
  getLocked: () => InsigniaWithStatus[];
  getInProgress: (minProgress?: number) => InsigniaWithStatus[];
  
  // Actions
  checkAndUnlock: () => Promise<UnlockResult | null>;
  toggleDisplay: (insigniaId: string) => Promise<void>;
  checkProgress: (insigniaId: string) => Promise<CriteriaCheckResult | null>;
  refetch: () => Promise<void>;
}

export function useInsigniasV2(): UseInsigniasV2Return {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  // Query principal - usa RPC get_user_insignias_progress
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['insignias-v2', user?.id],
    queryFn: async () => {
      if (!user?.id) return { insignias: [], userInsignias: [] };

      // Chamar RPC que retorna todas as insígnias com progresso
      const { data: progressData, error } = await supabase
        .rpc('get_user_insignias_progress', { p_user_id: user.id });

      if (error) {
        console.error('Erro ao buscar progresso de insígnias:', error);
        throw error;
      }

      // Buscar user_insignias para dados adicionais
      const { data: userInsigniasData } = await supabase
        .from('user_insignias')
        .select('*')
        .eq('user_id', user.id);

      // Processar dados retornados (progressData é um array JSON)
      const progressArray = Array.isArray(progressData) ? progressData : [];
      const insignias: InsigniaWithStatus[] = progressArray.map((item: any) => ({
        ...item.insignia,
        unlocked: item.unlocked,
        unlocked_at: item.unlocked_at,
        progress: item.progress,
        criteria_status: item.criteria_status,
      }));

      // Cast seguro para userInsignias
      const userInsignias: UserInsigniaV2[] = (userInsigniasData || []).map((ui: any) => ({
        id: ui.id,
        user_id: ui.user_id,
        insignia_id: ui.insignia_id,
        unlocked_at: ui.unlocked_at,
        progress_snapshot: ui.progress_snapshot as CriteriaCheckResult,
        source_events: ui.source_events || [],
        awarded_by: ui.awarded_by || 'system',
        xp_awarded: ui.xp_awarded || 0,
        coins_awarded: ui.coins_awarded || 0,
        is_displayed: ui.is_displayed || false,
      }));

      return {
        insignias,
        userInsignias,
      };
    },
    enabled: isAuthenticated && !!user?.id,
    staleTime: 30000, // 30 segundos
    gcTime: 300000, // 5 minutos
  });

  const insignias = data?.insignias || [];
  const userInsignias = data?.userInsignias || [];

  // Calcular estatísticas
  const stats = useMemo((): UserInsigniasStats | null => {
    if (!insignias.length) return null;

    const byType: Record<InsigniaType, { total: number; unlocked: number }> = {
      skill: { total: 0, unlocked: 0 },
      behavior: { total: 0, unlocked: 0 },
      impact: { total: 0, unlocked: 0 },
      leadership: { total: 0, unlocked: 0 },
      special: { total: 0, unlocked: 0 },
    };

    const byStarLevel: Record<number, { total: number; unlocked: number }> = {};

    insignias.forEach((ins) => {
      const type = ins.insignia_type as InsigniaType;
      if (byType[type]) {
        byType[type].total++;
        if (ins.unlocked) byType[type].unlocked++;
      }

      if (!byStarLevel[ins.star_level]) {
        byStarLevel[ins.star_level] = { total: 0, unlocked: 0 };
      }
      byStarLevel[ins.star_level].total++;
      if (ins.unlocked) byStarLevel[ins.star_level].unlocked++;
    });

    const recentUnlocks = insignias
      .filter((i) => i.unlocked && i.unlocked_at)
      .sort((a, b) => new Date(b.unlocked_at!).getTime() - new Date(a.unlocked_at!).getTime())
      .slice(0, 5);

    return {
      total: insignias.length,
      unlocked: insignias.filter((i) => i.unlocked).length,
      by_type: byType,
      by_star_level: byStarLevel,
      recent_unlocks: recentUnlocks,
    };
  }, [insignias]);

  // Filtros
  const getByType = useCallback(
    (type: InsigniaType) => insignias.filter((i) => i.insignia_type === type),
    [insignias]
  );

  const getByCategory = useCallback(
    (category: string) => insignias.filter((i) => i.category === category),
    [insignias]
  );

  const getByStarLevel = useCallback(
    (level: number) => insignias.filter((i) => i.star_level === level),
    [insignias]
  );

  const getUnlocked = useCallback(
    () => insignias.filter((i) => i.unlocked),
    [insignias]
  );

  const getLocked = useCallback(
    () => insignias.filter((i) => !i.unlocked),
    [insignias]
  );

  const getInProgress = useCallback(
    (minProgress = 50) => insignias.filter((i) => !i.unlocked && i.progress >= minProgress),
    [insignias]
  );

  // Mutation para verificar e desbloquear insígnias
  const checkAndUnlockMutation = useMutation({
    mutationFn: async (): Promise<UnlockResult | null> => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .rpc('check_and_unlock_eligible_insignias', { p_user_id: user.id });

      if (error) {
        console.error('Erro ao verificar insígnias:', error);
        throw error;
      }

      return data as unknown as UnlockResult;
    },
    onSuccess: (result) => {
      if (result && result.unlocked_count && result.unlocked_count > 0) {
        // Buscar nomes das insígnias desbloqueadas
        const unlockedInsignias = insignias.filter((i) =>
          result.unlocked_insignia_ids.includes(i.id)
        );

        toast.success(
          `🏅 ${result.unlocked_count} Nova${result.unlocked_count > 1 ? 's' : ''} Insígnia${result.unlocked_count > 1 ? 's' : ''}!`,
          {
            description: unlockedInsignias.map((i) => i.name).join(', '),
            duration: 5000,
          }
        );

        // Invalidar queries relacionadas
        queryClient.invalidateQueries({ queryKey: ['insignias-v2', user?.id] });
        queryClient.invalidateQueries({ queryKey: ['user-data', user?.id] });
      }
    },
  });

  // Mutation para alternar exibição
  const toggleDisplayMutation = useMutation({
    mutationFn: async (insigniaId: string) => {
      if (!user?.id) throw new Error('Usuário não autenticado');

      const userInsignia = userInsignias.find((ui) => ui.insignia_id === insigniaId);
      if (!userInsignia) throw new Error('Insígnia não desbloqueada');

      const { error } = await supabase
        .from('user_insignias')
        .update({ is_displayed: !userInsignia.is_displayed })
        .eq('id', userInsignia.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['insignias-v2', user?.id] });
    },
  });

  // Verificar progresso de uma insígnia específica
  const checkProgress = useCallback(
    async (insigniaId: string): Promise<CriteriaCheckResult | null> => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .rpc('check_insignia_criteria', {
          p_user_id: user.id,
          p_insignia_id: insigniaId,
        });

      if (error) {
        console.error('Erro ao verificar progresso:', error);
        return null;
      }

      return data as unknown as CriteriaCheckResult;
    },
    [user?.id]
  );

  return {
    insignias,
    userInsignias,
    stats,
    isLoading,
    getByType,
    getByCategory,
    getByStarLevel,
    getUnlocked,
    getLocked,
    getInProgress,
    checkAndUnlock: () => checkAndUnlockMutation.mutateAsync(),
    toggleDisplay: (id) => toggleDisplayMutation.mutateAsync(id),
    checkProgress,
    refetch: async () => { await refetch(); },
  };
}

// Re-export types
export type {
  InsigniaV2,
  InsigniaWithStatus,
  UserInsigniaV2,
  InsigniaType,
  CriteriaCheckResult,
  UnlockResult,
  UserInsigniasStats,
};
