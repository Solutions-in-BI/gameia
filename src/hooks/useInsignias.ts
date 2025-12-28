/**
 * Hook para gerenciar o sistema de insígnias
 * Verifica automaticamente quando uma insígnia pode ser desbloqueada
 * baseado em XP, skills, scores de jogos, streak e missões
 * 
 * Refatorado para buscar dados diretamente do DB em vez de usar hooks aninhados
 */

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface Insignia {
  id: string;
  insignia_key: string;
  name: string;
  description: string | null;
  shape: string;
  category: string;
  star_level: number;
  required_xp: number;
  required_skill_id: string | null;
  required_skill_level: number;
  required_streak_days: number;
  required_game_type: string | null;
  required_game_score_min: number;
  required_missions_completed: number;
  xp_reward: number;
  coins_reward: number;
  icon: string;
  color: string;
  display_order: number;
}

export interface UserInsignia {
  id: string;
  user_id: string;
  insignia_id: string;
  unlocked_at: string;
  progress_data: Record<string, unknown>;
  is_displayed: boolean;
}

export interface InsigniaWithProgress extends Insignia {
  isUnlocked: boolean;
  unlockedAt: string | null;
  progress: number; // 0-100
  progressDetails: {
    xp: { current: number; required: number; met: boolean };
    skill: { current: number; required: number; met: boolean; skillName?: string };
    streak: { current: number; required: number; met: boolean };
    gameScore: { current: number; required: number; met: boolean };
    missions: { current: number; required: number; met: boolean };
  };
}

interface UseInsignias {
  insignias: InsigniaWithProgress[];
  userInsignias: UserInsignia[];
  isLoading: boolean;
  getInsigniasByCategory: (category: string) => InsigniaWithProgress[];
  getInsigniasByStarLevel: (starLevel: number) => InsigniaWithProgress[];
  checkAndUnlockInsignias: () => Promise<void>;
  toggleDisplayInsignia: (insigniaId: string) => Promise<void>;
  refetch: () => Promise<void>;
}

export function useInsignias(): UseInsignias {
  const { user, isAuthenticated } = useAuth();
  
  const [insignias, setInsignias] = useState<InsigniaWithProgress[]>([]);
  const [userInsignias, setUserInsignias] = useState<UserInsignia[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Cache for user stats fetched from DB
  const [userXP, setUserXP] = useState(0);
  const [userStreak, setUserStreak] = useState(0);

  const fetchInsignias = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch all active insignias
      const { data: allInsignias, error: insigniasError } = await supabase
        .from("insignias")
        .select("*")
        .eq("is_active", true)
        .order("category")
        .order("star_level");

      if (insigniasError) throw insigniasError;

      // Fetch user data if authenticated
      let userInsigniasData: UserInsignia[] = [];
      let userSkills: { skill_id: string; mastery_level: number }[] = [];
      let userGameStats: { game_type: string; average_score: number }[] = [];
      let currentXP = 0;
      let currentStreak = 0;

      if (user) {
        const [userInsigniasResult, userSkillsResult, gameStatsResult, userStatsResult, streakResult] = await Promise.all([
          supabase
            .from("user_insignias")
            .select("*")
            .eq("user_id", user.id),
          supabase
            .from("user_skills")
            .select("skill_id, mastery_level")
            .eq("user_id", user.id),
          supabase
            .from("user_game_stats")
            .select("game_type, average_score")
            .eq("user_id", user.id),
          supabase
            .from("user_stats")
            .select("xp")
            .eq("user_id", user.id)
            .maybeSingle(),
          supabase
            .from("user_streaks")
            .select("current_streak")
            .eq("user_id", user.id)
            .maybeSingle(),
        ]);

        userInsigniasData = (userInsigniasResult.data || []) as UserInsignia[];
        userSkills = (userSkillsResult.data || []) as { skill_id: string; mastery_level: number }[];
        userGameStats = (gameStatsResult.data || []) as { game_type: string; average_score: number }[];
        currentXP = userStatsResult.data?.xp || 0;
        currentStreak = streakResult.data?.current_streak || 0;
        
        setUserXP(currentXP);
        setUserStreak(currentStreak);
      }

      setUserInsignias(userInsigniasData);

      // Build enriched insignias with progress
      const userInsigniaMap = new Map(
        userInsigniasData.map((ui) => [ui.insignia_id, ui])
      );
      const userSkillMap = new Map(
        userSkills.map((us) => [us.skill_id, us.mastery_level])
      );
      const userGameStatsMap = new Map(
        userGameStats.map((gs) => [gs.game_type, gs.average_score])
      );

      const enrichedInsignias: InsigniaWithProgress[] = (allInsignias || []).map((insignia) => {
        const userInsignia = userInsigniaMap.get(insignia.id);
        const isUnlocked = !!userInsignia;

        // Calculate progress for each requirement
        const xpMet = currentXP >= insignia.required_xp;
        const skillLevel = insignia.required_skill_id 
          ? userSkillMap.get(insignia.required_skill_id) || 0 
          : 0;
        const skillMet = !insignia.required_skill_id || skillLevel >= insignia.required_skill_level;
        const streakMet = currentStreak >= insignia.required_streak_days;
        const gameScore = insignia.required_game_type 
          ? userGameStatsMap.get(insignia.required_game_type) || 0 
          : 0;
        const gameScoreMet = !insignia.required_game_type || gameScore >= insignia.required_game_score_min;
        
        // Missions completed - would need additional query, simplified for now
        const missionsMet = insignia.required_missions_completed === 0;

        // Calculate overall progress percentage
        const requirements = [
          { weight: 30, met: xpMet, progress: Math.min(currentXP / Math.max(insignia.required_xp, 1), 1) },
          { weight: 25, met: skillMet, progress: insignia.required_skill_id ? Math.min(skillLevel / Math.max(insignia.required_skill_level, 1), 1) : 1 },
          { weight: 20, met: streakMet, progress: insignia.required_streak_days > 0 ? Math.min(currentStreak / insignia.required_streak_days, 1) : 1 },
          { weight: 15, met: gameScoreMet, progress: insignia.required_game_type ? Math.min(gameScore / Math.max(insignia.required_game_score_min, 1), 1) : 1 },
          { weight: 10, met: missionsMet, progress: missionsMet ? 1 : 0 },
        ];

        const totalProgress = requirements.reduce((sum, req) => sum + (req.progress * req.weight), 0);

        return {
          ...insignia,
          isUnlocked,
          unlockedAt: userInsignia?.unlocked_at || null,
          progress: isUnlocked ? 100 : totalProgress,
          progressDetails: {
            xp: { current: currentXP, required: insignia.required_xp, met: xpMet },
            skill: { current: skillLevel, required: insignia.required_skill_level, met: skillMet },
            streak: { current: currentStreak, required: insignia.required_streak_days, met: streakMet },
            gameScore: { current: gameScore, required: insignia.required_game_score_min, met: gameScoreMet },
            missions: { current: 0, required: insignia.required_missions_completed, met: missionsMet },
          },
        };
      });

      setInsignias(enrichedInsignias);
    } catch (err) {
      console.error("Erro ao buscar insígnias:", err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchInsignias();
  }, [fetchInsignias]);

  const checkAndUnlockInsignias = useCallback(async () => {
    if (!user) return;

    const unlockedIds = new Set(userInsignias.map((ui) => ui.insignia_id));
    const newlyUnlocked: InsigniaWithProgress[] = [];

    for (const insignia of insignias) {
      if (unlockedIds.has(insignia.id)) continue;

      const allMet = 
        insignia.progressDetails.xp.met &&
        insignia.progressDetails.skill.met &&
        insignia.progressDetails.streak.met &&
        insignia.progressDetails.gameScore.met &&
        insignia.progressDetails.missions.met;

      if (allMet) {
        try {
          // Unlock the insignia
          const { error } = await supabase.from("user_insignias").insert({
            user_id: user.id,
            insignia_id: insignia.id,
            progress_data: {},
          });

          if (!error) {
            newlyUnlocked.push(insignia);

            // Award XP and coins if applicable
            if (insignia.xp_reward > 0 || insignia.coins_reward > 0) {
              // Get current stats and update
              const { data: currentStats } = await supabase
                .from("user_stats")
                .select("xp, coins")
                .eq("user_id", user.id)
                .single();
              
              if (currentStats) {
                await supabase
                  .from("user_stats")
                  .update({
                    xp: (currentStats.xp || 0) + insignia.xp_reward,
                    coins: (currentStats.coins || 0) + insignia.coins_reward,
                  })
                  .eq("user_id", user.id);
              }
            }
          }
        } catch (err) {
          console.error("Erro ao desbloquear insígnia:", err);
        }
      }
    }

    if (newlyUnlocked.length > 0) {
      toast.success(`🏅 ${newlyUnlocked.length} Nova${newlyUnlocked.length > 1 ? "s" : ""} Insígnia${newlyUnlocked.length > 1 ? "s" : ""}!`, {
        description: newlyUnlocked.map((i) => i.name).join(", "),
      });
      await fetchInsignias();
    }
  }, [user, insignias, userInsignias, fetchInsignias]);

  const toggleDisplayInsignia = useCallback(
    async (insigniaId: string) => {
      if (!user) return;

      const current = userInsignias.find((ui) => ui.insignia_id === insigniaId);
      if (!current) return;

      await supabase
        .from("user_insignias")
        .update({ is_displayed: !current.is_displayed })
        .eq("id", current.id);

      await fetchInsignias();
    },
    [user, userInsignias, fetchInsignias]
  );

  const getInsigniasByCategory = useCallback(
    (category: string): InsigniaWithProgress[] => {
      return insignias.filter((i) => i.category === category);
    },
    [insignias]
  );

  const getInsigniasByStarLevel = useCallback(
    (starLevel: number): InsigniaWithProgress[] => {
      return insignias.filter((i) => i.star_level === starLevel);
    },
    [insignias]
  );

  // Auto-check for new insignias periodically
  useEffect(() => {
    if (!user || insignias.length === 0) return;
    
    const timer = setTimeout(() => {
      checkAndUnlockInsignias();
    }, 2000);

    return () => clearTimeout(timer);
  }, [user, insignias.length, checkAndUnlockInsignias]);

  return {
    insignias,
    userInsignias,
    isLoading,
    getInsigniasByCategory,
    getInsigniasByStarLevel,
    checkAndUnlockInsignias,
    toggleDisplayInsignia,
    refetch: fetchInsignias,
  };
}
