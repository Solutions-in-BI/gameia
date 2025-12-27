import { motion } from "framer-motion";
import { TrendingUp, Zap } from "lucide-react";
import { useGameConfigurations } from "@/hooks/useGameConfigurations";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface UserSkillLevel {
  skill_id: string;
  current_level: number;
  current_xp: number;
  total_xp: number;
}

export function SkillsOverview() {
  const { user } = useAuth();
  const { skillConfigs, isLoading } = useGameConfigurations();
  const [userSkills, setUserSkills] = useState<UserSkillLevel[]>([]);
  const [loadingSkills, setLoadingSkills] = useState(true);

  useEffect(() => {
    const fetchUserSkills = async () => {
      if (!user) return;
      
      setLoadingSkills(true);
      try {
        const { data, error } = await supabase
          .from('user_skill_levels')
          .select('*')
          .eq('user_id', user.id);
        
        if (error) throw error;
        setUserSkills(data || []);
      } catch (error) {
        console.error('Error fetching user skills:', error);
      } finally {
        setLoadingSkills(false);
      }
    };

    fetchUserSkills();
  }, [user]);

  if (isLoading || loadingSkills) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-6 w-32" />
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  // Group skills by category
  const skillsByCategory = skillConfigs.reduce((acc, skill) => {
    const category = skill.category || 'Outros';
    if (!acc[category]) acc[category] = [];
    acc[category].push(skill);
    return acc;
  }, {} as Record<string, typeof skillConfigs>);

  const categoryLabels: Record<string, { label: string; icon: string }> = {
    cognitivo: { label: 'Cognitivo', icon: '🧠' },
    motor: { label: 'Motor', icon: '🏃' },
    analitico: { label: 'Analítico', icon: '📊' },
    interpessoal: { label: 'Interpessoal', icon: '🤝' },
    comportamental: { label: 'Comportamental', icon: '💪' },
    conhecimento: { label: 'Conhecimento', icon: '📚' },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-cyan-400" />
        <h3 className="font-semibold">Suas Competências</h3>
      </div>

      {Object.entries(skillsByCategory).map(([category, skills]) => {
        const categoryInfo = categoryLabels[category] || { label: category, icon: '⭐' };
        
        return (
          <div key={category} className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{categoryInfo.icon}</span>
              <span>{categoryInfo.label}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {skills.map((skill) => {
                const userSkill = userSkills.find(us => us.skill_id === skill.id);
                const level = userSkill?.current_level || 0;
                const xpInLevel = userSkill?.current_xp || 0;
                const progress = (xpInLevel / 100) * 100;

                return (
                  <motion.div
                    key={skill.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-card/50 border border-border/50 rounded-xl p-3"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{skill.icon}</span>
                        <span className="font-medium text-sm">{skill.name}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs">
                        <Zap className="w-3 h-3" style={{ color: skill.color }} />
                        <span className="font-bold">Lv.{level}</span>
                      </div>
                    </div>

                    <Progress 
                      value={progress} 
                      className="h-1.5"
                      style={{ 
                        ['--progress-foreground' as string]: skill.color 
                      }}
                    />

                    <div className="flex items-center justify-between mt-1 text-xs text-muted-foreground">
                      <span>{xpInLevel}/100 XP</span>
                      <span>→ Lv.{level + 1}</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        );
      })}

      {skillConfigs.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>Jogue para desenvolver suas competências!</p>
        </div>
      )}
    </div>
  );
}
