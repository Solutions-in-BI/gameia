import { motion } from "framer-motion";
import { Clock, Target, ChevronRight, CheckCircle2, Star, Rocket, Shield, Award, Crown, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { InsigniaBadge } from "./TrailBadge";
import { Trail } from "@/hooks/useTrails";

interface InsigniaCardProps {
  trail: Trail;
  shape?: "star" | "rocket" | "shield" | "hexagon" | "crown" | "bolt" | "target" | "trophy";
  progress: {
    total: number;
    completed: number;
    percentage: number;
  };
  isCompleted: boolean;
  onClick: () => void;
}

const difficultyLabels: Record<string, string> = {
  beginner: "Iniciante",
  intermediate: "Intermediário",
  advanced: "Avançado",
  expert: "Expert",
};

const difficultyColors: Record<string, string> = {
  beginner: "text-emerald-500 bg-emerald-500/10",
  intermediate: "text-violet-500 bg-violet-500/10",
  advanced: "text-amber-500 bg-amber-500/10",
  expert: "text-rose-500 bg-rose-500/10",
};

export function InsigniaCard({ trail, shape = "hexagon", progress, isCompleted, onClick }: InsigniaCardProps) {
  return (
    <motion.div
      className={cn(
        "group relative bg-card border border-border rounded-xl p-4",
        "hover:border-primary/50 hover:shadow-lg transition-all duration-300",
        "cursor-pointer"
      )}
      onClick={onClick}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex gap-4">
        {/* Insígnia */}
        <InsigniaBadge
          icon={trail.icon}
          name={trail.name}
          shape={shape}
          difficulty={trail.difficulty}
          isUnlocked={isCompleted}
          size="md"
          showGlow={isCompleted}
        />

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                {trail.name}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                {trail.description || "Evolua para conquistar esta insígnia"}
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
          </div>

          {/* Meta info */}
          <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
            {trail.difficulty && (
              <span className={cn(
                "px-2 py-0.5 rounded-full font-medium",
                difficultyColors[trail.difficulty]
              )}>
                {difficultyLabels[trail.difficulty]}
              </span>
            )}
            {trail.estimated_hours && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                ~{trail.estimated_hours}h
              </span>
            )}
            <span className="flex items-center gap-1">
              <Target className="w-3 h-3" />
              {progress.total} desafios
            </span>
          </div>

          {/* Progress bar */}
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-muted-foreground">
                {progress.completed}/{progress.total} vencidos
              </span>
              <span className={cn(
                "font-medium",
                isCompleted ? "text-emerald-500" : "text-primary"
              )}>
                {progress.percentage}%
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                className={cn(
                  "h-full rounded-full",
                  isCompleted 
                    ? "bg-gradient-to-r from-emerald-500 to-emerald-400" 
                    : "bg-gradient-to-r from-primary to-primary/80"
                )}
                initial={{ width: 0 }}
                animate={{ width: `${progress.percentage}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Completed indicator */}
      {isCompleted && (
        <div className="absolute -top-2 -right-2 bg-amber-500 text-white p-1 rounded-full shadow-lg">
          <Award className="w-4 h-4" />
        </div>
      )}
    </motion.div>
  );
}

// Alias para compatibilidade
export const TrailCard = InsigniaCard;
