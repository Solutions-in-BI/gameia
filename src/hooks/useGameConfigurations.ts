import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface GameConfig {
  id: string;
  game_type: string;
  display_name: string;
  description: string | null;
  icon: string;
  is_active: boolean;
  xp_base_reward: number;
  xp_multiplier: number;
  coins_base_reward: number;
  coins_multiplier: number;
  skill_categories: string[];
  difficulty_multipliers: any;
  time_bonus_config: any;
  streak_bonus_config: any;
}

interface LevelConfig {
  id: string;
  level: number;
  xp_required: number;
  title: string | null;
  rewards: any;
  perks: string[];
}

interface SkillConfig {
  id: string;
  skill_key: string;
  name: string;
  description: string | null;
  icon: string;
  color: string;
  max_level: number;
  category: string | null;
  related_games: string[];
}

export function useGameConfigurations() {
  const [gameConfigs, setGameConfigs] = useState<GameConfig[]>([]);
  const [levelConfigs, setLevelConfigs] = useState<LevelConfig[]>([]);
  const [skillConfigs, setSkillConfigs] = useState<SkillConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchConfigurations = async () => {
      setIsLoading(true);
      try {
        const [gamesRes, levelsRes, skillsRes] = await Promise.all([
          supabase.from('game_configurations').select('*').eq('is_active', true).order('display_name'),
          supabase.from('level_configurations').select('*').order('level'),
          supabase.from('skill_configurations').select('*').order('name')
        ]);

        if (gamesRes.error) throw gamesRes.error;
        if (levelsRes.error) throw levelsRes.error;
        if (skillsRes.error) throw skillsRes.error;

        setGameConfigs((gamesRes.data || []) as GameConfig[]);
        setLevelConfigs((levelsRes.data || []) as LevelConfig[]);
        setSkillConfigs((skillsRes.data || []) as SkillConfig[]);
      } catch (error) {
        console.error('Error fetching game configurations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConfigurations();
  }, []);

  const getGameConfig = (gameType: string): GameConfig | undefined => {
    return gameConfigs.find(g => g.game_type === gameType);
  };

  const getLevelConfig = (level: number): LevelConfig | undefined => {
    return levelConfigs.find(l => l.level === level);
  };

  const getLevelForXP = (xp: number): LevelConfig | undefined => {
    return [...levelConfigs].reverse().find(l => xp >= l.xp_required);
  };

  const getSkillsForGame = (gameType: string): SkillConfig[] => {
    return skillConfigs.filter(s => s.related_games?.includes(gameType));
  };

  const getXPToNextLevel = (currentXP: number): { current: number; required: number; progress: number } => {
    const currentLevel = getLevelForXP(currentXP);
    const nextLevel = levelConfigs.find(l => l.level === (currentLevel?.level || 0) + 1);
    
    if (!nextLevel) {
      return { current: currentXP, required: currentXP, progress: 100 };
    }

    const baseXP = currentLevel?.xp_required || 0;
    const xpInLevel = currentXP - baseXP;
    const xpNeeded = nextLevel.xp_required - baseXP;
    const progress = Math.min(100, Math.round((xpInLevel / xpNeeded) * 100));

    return { current: xpInLevel, required: xpNeeded, progress };
  };

  return {
    gameConfigs,
    levelConfigs,
    skillConfigs,
    isLoading,
    getGameConfig,
    getLevelConfig,
    getLevelForXP,
    getSkillsForGame,
    getXPToNextLevel
  };
}
