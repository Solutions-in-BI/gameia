/**
 * Hook para gerenciar a árvore de habilidades do usuário
 */

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";

export interface Skill {
  id: string;
  name: string;
  description: string | null;
  icon: string;
  category_id: string | null;
  parent_skill_id: string | null;
  level: number;
  xp_required: number;
  is_unlocked_by_default: boolean;
}

export interface UserSkill {
  id: string;
  user_id: string;
  skill_id: string;
  is_unlocked: boolean;
  xp_earned: number;
  mastery_level: number;
  unlocked_at: string | null;
}

export interface SkillWithProgress extends Skill {
  isUnlocked: boolean;
  xpEarned: number;
  masteryLevel: number;
  progress: number; // 0-100
  children: SkillWithProgress[];
}

interface UseSkillTree {
  skills: SkillWithProgress[];
  isLoading: boolean;
  unlockSkill: (skillId: string) => Promise<boolean>;
  addXPToSkill: (skillId: string, xp: number) => Promise<void>;
  getSkillsByCategory: (categoryId: string) => SkillWithProgress[];
  refetch: () => Promise<void>;
}

export function useSkillTree(): UseSkillTree {
  const { user } = useAuth();
  const { toast } = useToast();
  const [skills, setSkills] = useState<SkillWithProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const buildSkillTree = useCallback(
    (allSkills: Skill[], userSkills: UserSkill[]): SkillWithProgress[] => {
      const userSkillMap = new Map(
        userSkills.map((us) => [us.skill_id, us])
      );

      const enrichSkill = (skill: Skill): SkillWithProgress => {
        const userSkill = userSkillMap.get(skill.id);
        const xpEarned = userSkill?.xp_earned || 0;
        const isUnlocked = skill.is_unlocked_by_default || userSkill?.is_unlocked || false;

        return {
          ...skill,
          isUnlocked,
          xpEarned,
          masteryLevel: userSkill?.mastery_level || 0,
          progress: Math.min((xpEarned / skill.xp_required) * 100, 100),
          children: [],
        };
      };

      // Enrich all skills
      const enrichedSkills = allSkills.map(enrichSkill);

      // Build tree structure
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

      return rootSkills;
    },
    []
  );

  const fetchSkills = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch all skills
      const { data: allSkills, error: skillsError } = await supabase
        .from("skill_tree")
        .select("*")
        .order("level", { ascending: true });

      if (skillsError) throw skillsError;

      // Fetch user skills if authenticated
      let userSkills: UserSkill[] = [];
      if (user) {
        const { data: userSkillsData } = await supabase
          .from("user_skills")
          .select("*")
          .eq("user_id", user.id);

        userSkills = (userSkillsData || []) as UserSkill[];
      }

      const tree = buildSkillTree(allSkills || [], userSkills);
      setSkills(tree);
    } catch (err) {
      console.error("Erro ao buscar skills:", err);
    } finally {
      setIsLoading(false);
    }
  }, [user, buildSkillTree]);

  useEffect(() => {
    fetchSkills();
  }, [fetchSkills]);

  const unlockSkill = useCallback(
    async (skillId: string): Promise<boolean> => {
      if (!user) {
        toast({
          title: "Login necessário",
          variant: "destructive",
        });
        return false;
      }

      try {
        // Check if skill exists and prerequisites are met
        const { data: skill } = await supabase
          .from("skill_tree")
          .select("*")
          .eq("id", skillId)
          .single();

        if (!skill) {
          toast({ title: "Skill não encontrada", variant: "destructive" });
          return false;
        }

        // Check parent skill is unlocked
        if (skill.parent_skill_id) {
          const { data: parentUserSkill } = await supabase
            .from("user_skills")
            .select("is_unlocked")
            .eq("user_id", user.id)
            .eq("skill_id", skill.parent_skill_id)
            .single();

          if (!parentUserSkill?.is_unlocked) {
            toast({
              title: "Pré-requisito não cumprido",
              description: "Desbloqueie a skill anterior primeiro",
              variant: "destructive",
            });
            return false;
          }
        }

        // Unlock the skill
        const { error } = await supabase.from("user_skills").upsert({
          user_id: user.id,
          skill_id: skillId,
          is_unlocked: true,
          unlocked_at: new Date().toISOString(),
        });

        if (error) throw error;

        toast({
          title: "🎯 Skill desbloqueada!",
          description: skill.name,
        });

        await fetchSkills();
        return true;
      } catch (err) {
        console.error("Erro ao desbloquear skill:", err);
        return false;
      }
    },
    [user, toast, fetchSkills]
  );

  const addXPToSkill = useCallback(
    async (skillId: string, xp: number) => {
      if (!user) return;

      try {
        const { data: existing } = await supabase
          .from("user_skills")
          .select("*")
          .eq("user_id", user.id)
          .eq("skill_id", skillId)
          .single();

        const newXP = (existing?.xp_earned || 0) + xp;

        // Check if mastery level should increase
        const { data: skill } = await supabase
          .from("skill_tree")
          .select("xp_required")
          .eq("id", skillId)
          .single();

        let newMastery = existing?.mastery_level || 0;
        if (skill && newXP >= skill.xp_required) {
          newMastery = Math.min(5, Math.floor(newXP / skill.xp_required));
        }

        await supabase.from("user_skills").upsert({
          user_id: user.id,
          skill_id: skillId,
          xp_earned: newXP,
          mastery_level: newMastery,
          is_unlocked: existing?.is_unlocked || false,
        });

        await fetchSkills();
      } catch (err) {
        console.error("Erro ao adicionar XP:", err);
      }
    },
    [user, fetchSkills]
  );

  const getSkillsByCategory = useCallback(
    (categoryId: string): SkillWithProgress[] => {
      return skills.filter((s) => s.category_id === categoryId);
    },
    [skills]
  );

  return {
    skills,
    isLoading,
    unlockSkill,
    addXPToSkill,
    getSkillsByCategory,
    refetch: fetchSkills,
  };
}
