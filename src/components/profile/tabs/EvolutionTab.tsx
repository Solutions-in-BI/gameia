import { motion } from "framer-motion";
import { TrendingUp, Award, Target, BookOpen, Brain } from "lucide-react";
import { useLevel } from "@/hooks/useLevel";
import { useSkillTree } from "@/hooks/useSkillTree";
import { useAchievements } from "@/hooks/useAchievements";
import { usePDI } from "@/hooks/usePDI";
import { useTrainings } from "@/hooks/useTrainings";
import { ACHIEVEMENTS } from "@/constants/achievements";
import { Progress } from "@/components/ui/progress";

export function EvolutionTab() {
  const { level, xp, levelInfo } = useLevel();
  const { skills } = useSkillTree();
  const { unlockedAchievements, stats } = useAchievements();
  const { activePlan } = usePDI();
  const { trainings } = useTrainings();

  // Group achievements by category
  const achievementsByCategory = ACHIEVEMENTS.reduce((acc, achievement) => {
    const category = achievement.category;
    if (!acc[category]) acc[category] = [];
    const isUnlocked = unlockedAchievements.some(ua => ua.achievementId === achievement.id);
    acc[category].push({ ...achievement, isUnlocked });
    return acc;
  }, {} as Record<string, Array<typeof ACHIEVEMENTS[0] & { isUnlocked: boolean }>>);

  const completedTrainings = trainings.filter(t => t.status === "completed").length;

  return (
    <div className="space-y-6">
      {/* Evolução de Nível */}
      <div className="surface p-5">
        <h3 className="text-sm font-medium text-muted-foreground mb-4 flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          Evolução de Nível
        </h3>
        
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center">
            <span className="text-2xl font-bold text-primary">{level}</span>
          </div>
          <div className="flex-1">
            <p className="font-medium">Nível {level}</p>
            <p className="text-sm text-muted-foreground mb-2">
              {xp.toLocaleString()} XP total
            </p>
            <Progress value={(xp % levelInfo.xpRequired) / levelInfo.xpRequired * 100} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {levelInfo.xpRequired - (xp % levelInfo.xpRequired)} XP para o próximo nível
            </p>
          </div>
        </div>
      </div>

      {/* Skills Progress */}
      <div className="surface p-5">
        <h3 className="text-sm font-medium text-muted-foreground mb-4 flex items-center gap-2">
          <Target className="h-4 w-4" />
          Progresso por Skill
        </h3>
        
        <div className="grid gap-3 sm:grid-cols-2">
          {skills.filter(s => s.currentXP > 0).map((skill, index) => (
            <motion.div
              key={skill.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-3 rounded-lg bg-muted/30"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{skill.icon}</span>
                <span className="font-medium text-sm flex-1">{skill.name}</span>
                <span className="text-xs text-muted-foreground">Nv. {skill.level}</span>
              </div>
              <Progress value={skill.progress} className="h-1.5" />
              <p className="text-xs text-muted-foreground mt-1">
                {skill.currentXP} / {skill.xpForNextLevel} XP
              </p>
            </motion.div>
          ))}
          
          {skills.filter(s => s.currentXP > 0).length === 0 && (
            <p className="text-sm text-muted-foreground col-span-2 text-center py-4">
              Jogue para desenvolver suas skills!
            </p>
          )}
        </div>
      </div>

      {/* Conquistas por Categoria */}
      <div className="surface p-5">
        <h3 className="text-sm font-medium text-muted-foreground mb-4 flex items-center gap-2">
          <Award className="h-4 w-4" />
          Insígnias Conquistadas
        </h3>
        
        <div className="space-y-4">
          {Object.entries(achievementsByCategory).map(([category, achievements]) => {
            const unlockedCount = achievements.filter(a => a.isUnlocked).length;
            
            return (
              <div key={category}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium capitalize">{category}</span>
                  <span className="text-xs text-muted-foreground">
                    {unlockedCount}/{achievements.length}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {achievements.map(achievement => (
                    <div
                      key={achievement.id}
                      className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-all ${
                        achievement.isUnlocked 
                          ? "bg-primary/10 border border-primary/20" 
                          : "bg-muted/50 grayscale opacity-40"
                      }`}
                      title={`${achievement.name}: ${achievement.description}`}
                    >
                      {achievement.icon}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* PDI Ativo */}
      {activePlan && (
        <div className="surface p-5">
          <h3 className="text-sm font-medium text-muted-foreground mb-4 flex items-center gap-2">
            <Brain className="h-4 w-4" />
            PDI Ativo
          </h3>
          
          <div className="p-4 rounded-lg bg-accent/5 border border-accent/10">
            <p className="font-medium">{activePlan.title}</p>
            <p className="text-sm text-muted-foreground mt-1">
              Progresso: {activePlan.overall_progress || 0}%
            </p>
            <Progress value={activePlan.overall_progress || 0} className="h-2 mt-2" />
          </div>
        </div>
      )}

      {/* Impacto de Treinamentos */}
      <div className="surface p-5">
        <h3 className="text-sm font-medium text-muted-foreground mb-4 flex items-center gap-2">
          <BookOpen className="h-4 w-4" />
          Treinamentos
        </h3>
        
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="p-4 rounded-lg bg-muted/30">
            <p className="text-2xl font-bold">{completedTrainings}</p>
            <p className="text-sm text-muted-foreground">Treinamentos concluídos</p>
          </div>
          <div className="p-4 rounded-lg bg-muted/30">
            <p className="text-2xl font-bold">{trainings.length}</p>
            <p className="text-sm text-muted-foreground">Total disponível</p>
          </div>
        </div>
      </div>
    </div>
  );
}
