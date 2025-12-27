import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface Trail {
  id: string;
  trail_key: string;
  name: string;
  description: string | null;
  icon: string;
  color: string | null;
  difficulty: string | null;
  category: string | null;
  estimated_hours: number | null;
  points_reward: number | null;
  is_active: boolean;
  display_order: number | null;
}

export interface TrailMission {
  id: string;
  trail_id: string;
  mission_key: string;
  name: string;
  description: string | null;
  instruction: string | null;
  mission_type: string;
  order_index: number | null;
  xp_reward: number | null;
  coins_reward: number | null;
  target_value: number | null;
  is_required: boolean;
}

export interface UserTrailProgress {
  id: string;
  user_id: string;
  trail_id: string;
  status: string | null;
  current_mission_index: number | null;
  started_at: string | null;
  completed_at: string | null;
}

export interface UserMissionProgress {
  id: string;
  user_id: string;
  mission_id: string;
  current_value: number | null;
  completed_at: string | null;
  best_score: number | null;
  attempts: number | null;
}

export function useTrails() {
  const { user } = useAuth();
  const [trails, setTrails] = useState<Trail[]>([]);
  const [missions, setMissions] = useState<Record<string, TrailMission[]>>({});
  const [userProgress, setUserProgress] = useState<UserTrailProgress[]>([]);
  const [missionProgress, setMissionProgress] = useState<Record<string, UserMissionProgress>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Buscar trilhas e progresso
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      
      // Buscar trilhas ativas
      const { data: trailsData } = await supabase
        .from("badge_trails")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (trailsData) {
        setTrails(trailsData);
        
        // Buscar missões de cada trilha
        const missionsMap: Record<string, TrailMission[]> = {};
        for (const trail of trailsData) {
          const { data: missionsData } = await supabase
            .from("trail_missions")
            .select("*")
            .eq("trail_id", trail.id)
            .order("order_index", { ascending: true });
          
          if (missionsData) {
            missionsMap[trail.id] = missionsData;
          }
        }
        setMissions(missionsMap);
      }

      // Buscar progresso do usuário
      if (user) {
        const { data: progressData } = await supabase
          .from("user_trail_progress")
          .select("*")
          .eq("user_id", user.id);

        if (progressData) {
          setUserProgress(progressData);
        }

        // Buscar progresso das missões
        const { data: missionProgressData } = await supabase
          .from("user_mission_progress")
          .select("*")
          .eq("user_id", user.id);

        if (missionProgressData) {
          const progressMap: Record<string, UserMissionProgress> = {};
          missionProgressData.forEach((mp) => {
            progressMap[mp.mission_id] = mp;
          });
          setMissionProgress(progressMap);
        }
      }

      setIsLoading(false);
    }

    fetchData();
  }, [user]);

  // Obter progresso de uma trilha
  const getTrailProgress = (trailId: string) => {
    const trailMissions = missions[trailId] || [];
    const completed = trailMissions.filter(m => 
      missionProgress[m.id]?.completed_at != null
    ).length;
    
    return {
      total: trailMissions.length,
      completed,
      percentage: trailMissions.length > 0 
        ? Math.round((completed / trailMissions.length) * 100) 
        : 0,
    };
  };

  // Verificar se trilha está completa
  const isTrailCompleted = (trailId: string) => {
    const progress = getTrailProgress(trailId);
    return progress.total > 0 && progress.completed === progress.total;
  };

  // Iniciar trilha
  const startTrail = async (trailId: string) => {
    if (!user) return false;

    const existing = userProgress.find(p => p.trail_id === trailId);
    if (existing) return true;

    const { error } = await supabase
      .from("user_trail_progress")
      .insert({
        user_id: user.id,
        trail_id: trailId,
        status: "in_progress",
        current_mission_index: 0,
        started_at: new Date().toISOString(),
      });

    if (!error) {
      setUserProgress(prev => [...prev, {
        id: crypto.randomUUID(),
        user_id: user.id,
        trail_id: trailId,
        status: "in_progress",
        current_mission_index: 0,
        started_at: new Date().toISOString(),
        completed_at: null,
      }]);
      return true;
    }
    return false;
  };

  // Completar missão
  const completeMission = async (missionId: string, score?: number) => {
    if (!user) return false;

    const existing = missionProgress[missionId];
    
    if (existing) {
      const { error } = await supabase
        .from("user_mission_progress")
        .update({
          completed_at: new Date().toISOString(),
          best_score: score ?? existing.best_score,
          attempts: (existing.attempts || 0) + 1,
        })
        .eq("id", existing.id);

      if (!error) {
        setMissionProgress(prev => ({
          ...prev,
          [missionId]: {
            ...existing,
            completed_at: new Date().toISOString(),
            best_score: score ?? existing.best_score,
            attempts: (existing.attempts || 0) + 1,
          }
        }));
        return true;
      }
    } else {
      const { data, error } = await supabase
        .from("user_mission_progress")
        .insert({
          user_id: user.id,
          mission_id: missionId,
          completed_at: new Date().toISOString(),
          best_score: score,
          attempts: 1,
        })
        .select()
        .single();

      if (!error && data) {
        setMissionProgress(prev => ({
          ...prev,
          [missionId]: data,
        }));
        return true;
      }
    }
    return false;
  };

  // Obter trilhas por dificuldade
  const getTrailsByDifficulty = (difficulty: string) => {
    return trails.filter(t => t.difficulty === difficulty);
  };

  // Estatísticas gerais
  const getOverallStats = () => {
    const completedTrails = trails.filter(t => isTrailCompleted(t.id)).length;
    const totalMissions = Object.values(missions).flat().length;
    const completedMissions = Object.values(missionProgress).filter(p => p.completed_at).length;

    return {
      totalTrails: trails.length,
      completedTrails,
      totalMissions,
      completedMissions,
      percentageComplete: totalMissions > 0 
        ? Math.round((completedMissions / totalMissions) * 100) 
        : 0,
    };
  };

  return {
    trails,
    missions,
    userProgress,
    missionProgress,
    isLoading,
    getTrailProgress,
    isTrailCompleted,
    startTrail,
    completeMission,
    getTrailsByDifficulty,
    getOverallStats,
  };
}
