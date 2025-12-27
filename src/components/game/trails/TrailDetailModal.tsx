import { motion } from "framer-motion";
import { X, Clock, Target, Coins, Sparkles, CheckCircle2, Circle, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TrailBadge } from "./TrailBadge";
import { Trail, TrailMission, useTrails } from "@/hooks/useTrails";
import { cn } from "@/lib/utils";

interface TrailDetailModalProps {
  trail: Trail;
  missions: TrailMission[];
  isOpen: boolean;
  onClose: () => void;
}

const missionTypeIcons: Record<string, string> = {
  quiz: "📝",
  sales: "💼",
  decision: "🎯",
};

const missionTypeLabels: Record<string, string> = {
  quiz: "Quiz",
  sales: "Simulação de Vendas",
  decision: "Tomada de Decisão",
};

export function TrailDetailModal({ trail, missions, isOpen, onClose }: TrailDetailModalProps) {
  const { getTrailProgress, isTrailCompleted, missionProgress, startTrail } = useTrails();
  
  const progress = getTrailProgress(trail.id);
  const completed = isTrailCompleted(trail.id);

  const handleStartTrail = async () => {
    await startTrail(trail.id);
    // TODO: Navegar para primeira missão
  };

  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="w-full max-w-2xl max-h-[90vh] bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header com Badge */}
        <div className="relative bg-gradient-to-br from-primary/20 via-primary/10 to-background p-6">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </Button>

          <div className="flex items-start gap-4">
            <TrailBadge
              icon={trail.icon}
              name=""
              difficulty={trail.difficulty}
              isUnlocked={completed}
              size="lg"
              showGlow={completed}
            />

            <div className="flex-1">
              <h2 className="text-2xl font-display font-bold text-foreground">
                {trail.name}
              </h2>
              <p className="text-muted-foreground mt-1">
                {trail.description || "Complete as missões para ganhar esta insígnia"}
              </p>

              <div className="flex flex-wrap gap-3 mt-4 text-sm">
                {trail.estimated_hours && (
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    ~{trail.estimated_hours} horas
                  </span>
                )}
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Target className="w-4 h-4" />
                  {missions.length} missões
                </span>
                {trail.points_reward && (
                  <span className="flex items-center gap-1 text-amber-500">
                    <Coins className="w-4 h-4" />
                    +{trail.points_reward} XP
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">
                {progress.completed} de {progress.total} missões concluídas
              </span>
              <span className={cn(
                "font-medium",
                completed ? "text-emerald-500" : "text-primary"
              )}>
                {progress.percentage}%
              </span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <motion.div
                className={cn(
                  "h-full rounded-full",
                  completed 
                    ? "bg-gradient-to-r from-emerald-500 to-emerald-400" 
                    : "bg-gradient-to-r from-primary to-primary/80"
                )}
                initial={{ width: 0 }}
                animate={{ width: `${progress.percentage}%` }}
                transition={{ duration: 0.5, delay: 0.2 }}
              />
            </div>
          </div>
        </div>

        {/* Missões */}
        <ScrollArea className="max-h-[400px]">
          <div className="p-6 space-y-3">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Missões
            </h3>
            
            {missions.map((mission, index) => {
              const isCompleted = !!missionProgress[mission.id]?.completed_at;
              const isLocked = index > 0 && !missionProgress[missions[index - 1].id]?.completed_at;

              return (
                <motion.div
                  key={mission.id}
                  className={cn(
                    "relative flex items-start gap-4 p-4 rounded-xl border transition-all",
                    isCompleted 
                      ? "bg-emerald-500/5 border-emerald-500/30" 
                      : isLocked
                        ? "bg-muted/30 border-muted opacity-60"
                        : "bg-card border-border hover:border-primary/50"
                  )}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  {/* Status Icon */}
                  <div className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-full",
                    isCompleted 
                      ? "bg-emerald-500 text-white" 
                      : isLocked
                        ? "bg-muted text-muted-foreground"
                        : "bg-primary/10 text-primary"
                  )}>
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : isLocked ? (
                      <span className="text-sm">🔒</span>
                    ) : (
                      <span className="text-sm font-medium">{index + 1}</span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span>{missionTypeIcons[mission.mission_type] || "📋"}</span>
                      <h4 className={cn(
                        "font-medium",
                        isCompleted ? "text-emerald-600" : "text-foreground"
                      )}>
                        {mission.name}
                      </h4>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mt-1">
                      {mission.description || mission.instruction}
                    </p>

                    <div className="flex items-center gap-3 mt-2 text-xs">
                      <span className="text-muted-foreground">
                        {missionTypeLabels[mission.mission_type] || mission.mission_type}
                      </span>
                      {mission.xp_reward && (
                        <span className="flex items-center gap-1 text-primary">
                          <Sparkles className="w-3 h-3" />
                          +{mission.xp_reward} XP
                        </span>
                      )}
                      {mission.coins_reward && (
                        <span className="flex items-center gap-1 text-amber-500">
                          <Coins className="w-3 h-3" />
                          +{mission.coins_reward}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Button */}
                  {!isCompleted && !isLocked && (
                    <Button size="sm" variant="outline" className="flex-shrink-0">
                      <Play className="w-4 h-4 mr-1" />
                      Iniciar
                    </Button>
                  )}
                </motion.div>
              );
            })}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-muted/30">
          {completed ? (
            <div className="flex items-center justify-center gap-2 text-emerald-500">
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-medium">Trilha Concluída! Insígnia Desbloqueada</span>
            </div>
          ) : progress.completed === 0 ? (
            <Button className="w-full" onClick={handleStartTrail}>
              Iniciar Trilha
            </Button>
          ) : (
            <Button className="w-full">
              Continuar Trilha
            </Button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
