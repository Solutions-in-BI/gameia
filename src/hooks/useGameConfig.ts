import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useOrganization } from "./useOrganization";
import { toast } from "sonner";

export interface GameBaseConfig {
  id: string;
  game_type: string;
  display_name: string;
  description: string | null;
  icon: string;
  is_active: boolean;
  skill_categories: string[];
  
  // Configuração Base
  duration_minutes: number;
  default_difficulty: 'easy' | 'medium' | 'hard';
  primary_metric: 'score' | 'accuracy' | 'completion' | 'time';
  target_score: number;
  is_repeatable: boolean;
  max_attempts_per_day: number | null;
  
  // Classificação
  visibility: 'required' | 'recommended' | 'optional' | 'hidden';
  allow_in_commitments: boolean;
  
  // Recompensas
  xp_base_reward: number;
  xp_multiplier: number;
  coins_base_reward: number;
  coins_multiplier: number;
  participation_xp: number;
  participation_coins: number;
  
  // Bônus
  difficulty_multipliers: Record<string, number>;
  time_bonus_config: { enabled: boolean; max_bonus_percent: number } | null;
  streak_bonus_config: { enabled: boolean; bonus_per_day: number; max_bonus: number } | null;
  
  // Avançado
  advanced_config: Record<string, any>;
  config_version: number;
}

export interface OrgGameOverride {
  id: string;
  organization_id: string;
  game_type: string;
  xp_base_override: number | null;
  xp_multiplier_override: number | null;
  coins_base_override: number | null;
  coins_multiplier_override: number | null;
  target_score_override: number | null;
  visibility_override: 'required' | 'recommended' | 'optional' | 'hidden' | null;
  is_active: boolean;
  allow_in_commitments: boolean;
  advanced_config_override: Record<string, any>;
}

export interface MergedGameConfig extends GameBaseConfig {
  orgOverride?: OrgGameOverride;
  effectiveXpBase: number;
  effectiveXpMultiplier: number;
  effectiveCoinsBase: number;
  effectiveCoinsMultiplier: number;
  effectiveTargetScore: number;
  effectiveVisibility: 'required' | 'recommended' | 'optional' | 'hidden';
  effectiveIsActive: boolean;
  effectiveAllowInCommitments: boolean;
  effectiveAdvancedConfig: Record<string, any>;
  hasOverrides: boolean;
}

interface UseOrganizationResult {
  currentOrg: { id: string; name: string } | null;
}

export function useGameConfig() {
  const { currentOrg } = useOrganization();
  const [games, setGames] = useState<GameBaseConfig[]>([]);
  const [orgOverrides, setOrgOverrides] = useState<OrgGameOverride[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch all game configurations
  const fetchConfigs = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: gamesData, error: gamesError } = await supabase
        .from('game_configurations')
        .select('*')
        .order('display_name');

      if (gamesError) throw gamesError;

      // Cast and set defaults for new columns
      const typedGames: GameBaseConfig[] = (gamesData || []).map((g: any) => ({
        ...g,
        duration_minutes: g.duration_minutes ?? 10,
        default_difficulty: g.default_difficulty ?? 'medium',
        primary_metric: g.primary_metric ?? 'score',
        target_score: g.target_score ?? 70,
        is_repeatable: g.is_repeatable ?? true,
        max_attempts_per_day: g.max_attempts_per_day,
        visibility: g.visibility ?? 'optional',
        allow_in_commitments: g.allow_in_commitments ?? true,
        participation_xp: g.participation_xp ?? 5,
        participation_coins: g.participation_coins ?? 0,
        advanced_config: g.advanced_config ?? {},
        config_version: g.config_version ?? 1,
        difficulty_multipliers: g.difficulty_multipliers ?? { easy: 0.8, medium: 1, hard: 1.5 },
        time_bonus_config: g.time_bonus_config ?? { enabled: true, max_bonus_percent: 20 },
        streak_bonus_config: g.streak_bonus_config ?? { enabled: true, bonus_per_day: 5, max_bonus: 50 },
      }));

      setGames(typedGames);

      // Fetch org overrides if org exists
      if (currentOrg?.id) {
        const { data: overridesData, error: overridesError } = await supabase
          .from('organization_game_overrides')
          .select('*')
          .eq('organization_id', currentOrg.id);

        if (overridesError) throw overridesError;
        setOrgOverrides((overridesData || []) as OrgGameOverride[]);
      }
    } catch (error) {
      console.error('Error fetching game configs:', error);
      toast.error('Erro ao carregar configurações de jogos');
    } finally {
      setIsLoading(false);
    }
  }, [currentOrg?.id]);

  useEffect(() => {
    fetchConfigs();
  }, [fetchConfigs]);

  // Get merged config for a specific game
  const getMergedConfig = useCallback((gameType: string): MergedGameConfig | undefined => {
    const baseConfig = games.find(g => g.game_type === gameType);
    if (!baseConfig) return undefined;

    const override = orgOverrides.find(o => o.game_type === gameType);
    
    const hasOverrides = override ? (
      override.xp_base_override !== null ||
      override.xp_multiplier_override !== null ||
      override.coins_base_override !== null ||
      override.coins_multiplier_override !== null ||
      override.target_score_override !== null ||
      override.visibility_override !== null ||
      Object.keys(override.advanced_config_override || {}).length > 0
    ) : false;

    return {
      ...baseConfig,
      orgOverride: override,
      effectiveXpBase: override?.xp_base_override ?? baseConfig.xp_base_reward,
      effectiveXpMultiplier: override?.xp_multiplier_override ?? baseConfig.xp_multiplier,
      effectiveCoinsBase: override?.coins_base_override ?? baseConfig.coins_base_reward,
      effectiveCoinsMultiplier: override?.coins_multiplier_override ?? baseConfig.coins_multiplier,
      effectiveTargetScore: override?.target_score_override ?? baseConfig.target_score,
      effectiveVisibility: override?.visibility_override ?? baseConfig.visibility,
      effectiveIsActive: override?.is_active ?? baseConfig.is_active,
      effectiveAllowInCommitments: override?.allow_in_commitments ?? baseConfig.allow_in_commitments,
      effectiveAdvancedConfig: {
        ...baseConfig.advanced_config,
        ...(override?.advanced_config_override || {}),
      },
      hasOverrides,
    };
  }, [games, orgOverrides]);

  // Get all merged configs
  const getAllMergedConfigs = useCallback((): MergedGameConfig[] => {
    return games.map(g => getMergedConfig(g.game_type)).filter(Boolean) as MergedGameConfig[];
  }, [games, getMergedConfig]);

  // Update base config (global - super_admin only)
  const updateBaseConfig = useCallback(async (
    gameType: string, 
    updates: Partial<GameBaseConfig>
  ): Promise<boolean> => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('game_configurations')
        .update({
          ...updates,
          config_version: (games.find(g => g.game_type === gameType)?.config_version || 0) + 1,
        })
        .eq('game_type', gameType);

      if (error) throw error;
      
      toast.success('Configuração base atualizada');
      await fetchConfigs();
      return true;
    } catch (error) {
      console.error('Error updating base config:', error);
      toast.error('Erro ao atualizar configuração');
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [games, fetchConfigs]);

  // Update or create org override
  const updateOrgOverride = useCallback(async (
    gameType: string,
    updates: Partial<Omit<OrgGameOverride, 'id' | 'organization_id' | 'game_type'>>
  ): Promise<boolean> => {
    if (!currentOrg?.id) {
      toast.error('Nenhuma organização selecionada');
      return false;
    }

    setIsSaving(true);
    try {
      const existingOverride = orgOverrides.find(o => o.game_type === gameType);

      if (existingOverride) {
        const { error } = await supabase
          .from('organization_game_overrides')
          .update(updates)
          .eq('id', existingOverride.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('organization_game_overrides')
          .insert({
            organization_id: currentOrg.id,
            game_type: gameType,
            ...updates,
          });

        if (error) throw error;
      }

      toast.success('Configuração da empresa atualizada');
      await fetchConfigs();
      return true;
    } catch (error) {
      console.error('Error updating org override:', error);
      toast.error('Erro ao atualizar configuração da empresa');
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [currentOrg?.id, orgOverrides, fetchConfigs]);

  // Reset org overrides to defaults
  const resetOrgOverrides = useCallback(async (gameType: string): Promise<boolean> => {
    const existingOverride = orgOverrides.find(o => o.game_type === gameType);
    if (!existingOverride) return true;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('organization_game_overrides')
        .delete()
        .eq('id', existingOverride.id);

      if (error) throw error;

      toast.success('Configuração resetada para padrão');
      await fetchConfigs();
      return true;
    } catch (error) {
      console.error('Error resetting org overrides:', error);
      toast.error('Erro ao resetar configuração');
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [orgOverrides, fetchConfigs]);

  // Check if game has any org overrides
  const hasOrgOverride = useCallback((gameType: string): boolean => {
    return orgOverrides.some(o => o.game_type === gameType);
  }, [orgOverrides]);

  return {
    games,
    orgOverrides,
    isLoading,
    isSaving,
    getMergedConfig,
    getAllMergedConfigs,
    updateBaseConfig,
    updateOrgOverride,
    resetOrgOverrides,
    hasOrgOverride,
    refetch: fetchConfigs,
  };
}
