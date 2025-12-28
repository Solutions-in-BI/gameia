/**
 * Hook unificado para gerenciar progresso de skills
 * Usa skill_configurations e user_skill_levels (modelo unificado)
 */

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";

export interface SkillConfig {
  id: string;
  skill_key: string;
  name: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  max_level: number | null;
  xp_per_level: number;
  category: string | null;
  related_games: string[] | null;
  parent_skill_id: string | null;
  is_unlocked_by_default: boolean;
  display_order: number;
  organization_id: string | null;
}

export interface UserSkillProgress {
  id: string;
  user_id: string;
  skill_id: string;
  current_level: number;
  current_xp: number;
  total_xp: number;
  is_unlocked: boolean;
  mastery_level: number;
  last_practiced: string | null;
  unlocked_at: string | null;
}

export interface SkillWithProgress extends SkillConfig {
  userProgress: UserSkillProgress | null;
  progressPercent: number;
  isMaxed: boolean;
  children: SkillWithProgress[];
}

interface AddXPResult {
  success: boolean;
  new_level?: number;
  new_xp?: number;
  total_xp?: number;
  leveled_up?: boolean;
  skill_name?: string;
  error?: string;
}

interface SkillHealthResult {
  healthy: boolean;
  orphan_skills: number;
  users_without_skills: number;
  invalid_levels: number;
  duplicate_entries: number;
  checked_at: string;
}

interface UseSkillProgress {
  skills: SkillWithProgress[];
  isLoading: boolean;
  error: string | null;
  addXP: (skillId: string, xpAmount: number, sourceType?: string, sourceId?: string) => Promise<AddXPResult>;
  unlockSkill: (skillId: string) => Promise<boolean>;
  getSkillsByCategory: (category: string) => SkillWithProgress[];
  getSkillsForGame: (gameType: string) => SkillWithProgress[];
  checkHealth: () => Promise<SkillHealthResult | null>;
  refetch: () => Promise<void>;
}

export function useSkillProgress(): UseSkillProgress {
  const { user } = useAuth();
  const { toast } = useToast();
  const [skills, setSkills] = useState<SkillWithProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const buildSkillTree = useCallback(
    (allSkills: SkillConfig[], userProgress: UserSkillProgress[]): SkillWithProgress[] => {
      const progressMap = new Map(userProgress.map((up) => [up.skill_id, up]));

      const enrichSkill = (skill: SkillConfig): SkillWithProgress => {
        const progress = progressMap.get(skill.id);
        const currentXp = progress?.current_xp || 0;
        const xpPerLevel = skill.xp_per_level || 100;
        const progressPercent = xpPerLevel > 0 ? Math.min((currentXp / xpPerLevel) * 100, 100) : 0;
        const currentLevel = progress?.current_level || 1;
        const isMaxed = skill.max_level !== null && currentLevel >= skill.max_level;

        return {
          ...skill,
          userProgress: progress || null,
          progressPercent,
          isMaxed,
          children: [],
        };
      };

      const enrichedSkills = allSkills.map(enrichSkill);
      const skillMap = new Map(enrichedSkills.map((s) => [s.id, s]));
      const rootSkills: SkillWithProgress[] = [];

      enrichedSkills.forEach((skill) => {
        if (skill.parent_skill_id) {
          const parent = skillMap.get(skill.parent_skill_id);
          if (parent) {
            parent.children.push(skill);
          }
        } else {
          rootSkills.push(skill);
        }
      });

      // Sort by display_order
      rootSkills.sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
      rootSkills.forEach((skill) => {
        skill.children.sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
      });

      return rootSkills;
    },
    []
  );

  const fetchSkills = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch all skill configurations
      const { data: allSkills, error: skillsError } = await supabase
        .from("skill_configurations")
        .select("*")
        .order("display_order", { ascending: true });

      if (skillsError) throw skillsError;

      // Fetch user progress if authenticated
      let userProgress: UserSkillProgress[] = [];
      if (user) {
        const { data: progressData, error: progressError } = await supabase
          .from("user_skill_levels")
          .select("*")
          .eq("user_id", user.id);

        if (progressError) {
          console.warn("Erro ao buscar progresso de skills:", progressError);
        } else {
          userProgress = (progressData || []) as UserSkillProgress[];
        }
      }

      const tree = buildSkillTree((allSkills || []) as SkillConfig[], userProgress);
      setSkills(tree);
    } catch (err: any) {
      console.error("Erro ao buscar skills:", err);
      setError(err.message || "Erro ao carregar skills");
    } finally {
      setIsLoading(false);
    }
  }, [user, buildSkillTree]);

  useEffect(() => {
    fetchSkills();
  }, [fetchSkills]);

  const addXP = useCallback(
    async (
      skillId: string,
      xpAmount: number,
      sourceType: string = "game",
      sourceId?: string
    ): Promise<AddXPResult> => {
      if (!user) {
        return { success: false, error: "Usuário não autenticado" };
      }

      try {
        const { data, error: rpcError } = await supabase.rpc("add_skill_xp", {
          p_user_id: user.id,
          p_skill_id: skillId,
          p_xp_amount: xpAmount,
          p_source_type: sourceType,
          p_source_id: sourceId || null,
        });

        if (rpcError) throw rpcError;

        const result = data as unknown as AddXPResult;

        if (result.success && result.leveled_up) {
          toast({
            title: "🎯 Level Up!",
            description: `${result.skill_name} agora é nível ${result.new_level}!`,
          });
        }

        await fetchSkills();
        return result;
      } catch (err: any) {
        console.error("Erro ao adicionar XP:", err);
        return { success: false, error: err.message };
      }
    },
    [user, toast, fetchSkills]
  );

  const unlockSkill = useCallback(
    async (skillId: string): Promise<boolean> => {
      if (!user) {
        toast({ title: "Login necessário", variant: "destructive" });
        return false;
      }

      try {
        // Get skill config
        const skill = skills.find((s) => s.id === skillId) || 
          skills.flatMap((s) => s.children).find((s) => s.id === skillId);

        if (!skill) {
          toast({ title: "Skill não encontrada", variant: "destructive" });
          return false;
        }

        // Check parent is unlocked
        if (skill.parent_skill_id) {
          const { data: parentProgress } = await supabase
            .from("user_skill_levels")
            .select("is_unlocked")
            .eq("user_id", user.id)
            .eq("skill_id", skill.parent_skill_id)
            .single();

          if (!parentProgress?.is_unlocked) {
            toast({
              title: "Pré-requisito não cumprido",
              description: "Desbloqueie a skill anterior primeiro",
              variant: "destructive",
            });
            return false;
          }
        }

        // Unlock
        const { error: upsertError } = await supabase.from("user_skill_levels").upsert({
          user_id: user.id,
          skill_id: skillId,
          is_unlocked: true,
          unlocked_at: new Date().toISOString(),
          current_level: 1,
          current_xp: 0,
          total_xp: 0,
          mastery_level: 0,
        });

        if (upsertError) throw upsertError;

        // Log event
        await supabase.from("skill_events_log").insert({
          user_id: user.id,
          skill_id: skillId,
          event_type: "skill_unlocked",
          new_value: { unlocked: true },
          source_type: "user",
        });

        toast({
          title: "🎯 Skill desbloqueada!",
          description: skill.name,
        });

        await fetchSkills();
        return true;
      } catch (err: any) {
        console.error("Erro ao desbloquear skill:", err);
        toast({ title: "Erro ao desbloquear", variant: "destructive" });
        return false;
      }
    },
    [user, skills, toast, fetchSkills]
  );

  const getSkillsByCategory = useCallback(
    (category: string): SkillWithProgress[] => {
      const flatSkills = [...skills, ...skills.flatMap((s) => s.children)];
      return flatSkills.filter((s) => s.category === category);
    },
    [skills]
  );

  const getSkillsForGame = useCallback(
    (gameType: string): SkillWithProgress[] => {
      const flatSkills = [...skills, ...skills.flatMap((s) => s.children)];
      return flatSkills.filter((s) => s.related_games?.includes(gameType));
    },
    [skills]
  );

  const checkHealth = useCallback(async (): Promise<SkillHealthResult | null> => {
    try {
      const { data, error: rpcError } = await supabase.rpc("check_skills_health");
      if (rpcError) throw rpcError;
      return data as unknown as SkillHealthResult;
    } catch (err) {
      console.error("Erro ao verificar saúde:", err);
      return null;
    }
  }, []);

  return {
    skills,
    isLoading,
    error,
    addXP,
    unlockSkill,
    getSkillsByCategory,
    getSkillsForGame,
    checkHealth,
    refetch: fetchSkills,
  };
}
