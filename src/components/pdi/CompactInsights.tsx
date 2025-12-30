import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  AlertTriangle, 
  Clock, 
  Target,
  TrendingUp,
  X,
  ChevronRight,
  Lightbulb
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DevelopmentPlan, DevelopmentGoal } from "@/hooks/usePDI";
import { motion, AnimatePresence } from "framer-motion";

interface CompactInsightsProps {
  plan: DevelopmentPlan;
  goals: DevelopmentGoal[];
  onGoalClick?: (goalId: string) => void;
  onDismiss?: () => void;
}

export const CompactInsights: React.FC<CompactInsightsProps> = ({
  plan,
  goals,
  onGoalClick,
  onDismiss,
}) => {
  const overdueGoals = goals.filter(g => {
    if (!g.target_date || g.status === "completed") return false;
    return new Date(g.target_date) < new Date();
  });

  const stagnantGoals = goals.filter(g => g.stagnant_since && g.status !== "completed");
  
  const topPriorityGoal = goals
    .filter(g => g.status !== "completed")
    .sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return (priorityOrder[a.priority as keyof typeof priorityOrder] || 1) - 
             (priorityOrder[b.priority as keyof typeof priorityOrder] || 1);
    })[0];

  // No insights needed
  if (overdueGoals.length === 0 && stagnantGoals.length === 0 && !topPriorityGoal) {
    return null;
  }

  // Only show the most critical insight
  const criticalInsight = overdueGoals.length > 0 
    ? { type: "overdue" as const, goals: overdueGoals }
    : stagnantGoals.length > 0 
    ? { type: "stagnant" as const, goals: stagnantGoals }
    : topPriorityGoal 
    ? { type: "focus" as const, goal: topPriorityGoal }
    : null;

  if (!criticalInsight) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "relative flex items-center gap-3 p-3 rounded-lg border",
        criticalInsight.type === "overdue" && "bg-red-500/10 border-red-500/30",
        criticalInsight.type === "stagnant" && "bg-amber-500/10 border-amber-500/30",
        criticalInsight.type === "focus" && "bg-blue-500/10 border-blue-500/30"
      )}
    >
      {/* Icon */}
      <div className={cn(
        "flex-shrink-0 p-2 rounded-full",
        criticalInsight.type === "overdue" && "bg-red-500/20 text-red-400",
        criticalInsight.type === "stagnant" && "bg-amber-500/20 text-amber-400",
        criticalInsight.type === "focus" && "bg-blue-500/20 text-blue-400"
      )}>
        {criticalInsight.type === "overdue" && <AlertTriangle className="h-4 w-4" />}
        {criticalInsight.type === "stagnant" && <Clock className="h-4 w-4" />}
        {criticalInsight.type === "focus" && <Lightbulb className="h-4 w-4" />}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {criticalInsight.type === "overdue" && (
          <>
            <p className="text-sm font-medium text-red-400">
              {criticalInsight.goals.length} meta{criticalInsight.goals.length > 1 ? "s" : ""} atrasada{criticalInsight.goals.length > 1 ? "s" : ""}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {criticalInsight.goals[0].title}
              {criticalInsight.goals.length > 1 && ` e mais ${criticalInsight.goals.length - 1}`}
            </p>
          </>
        )}
        
        {criticalInsight.type === "stagnant" && (
          <>
            <p className="text-sm font-medium text-amber-400">
              {criticalInsight.goals.length} meta{criticalInsight.goals.length > 1 ? "s" : ""} sem progresso
            </p>
            <p className="text-xs text-muted-foreground truncate">
              Faça um check-in para atualizar seu progresso
            </p>
          </>
        )}
        
        {criticalInsight.type === "focus" && (
          <>
            <p className="text-sm font-medium text-blue-400">
              Foque em: {criticalInsight.goal.title}
            </p>
            <p className="text-xs text-muted-foreground">
              Meta de alta prioridade com {criticalInsight.goal.progress || 0}% de progresso
            </p>
          </>
        )}
      </div>

      {/* Action */}
      <Button
        variant="ghost"
        size="sm"
        className="flex-shrink-0 gap-1"
        onClick={() => {
          if (criticalInsight.type === "focus" && criticalInsight.goal) {
            onGoalClick?.(criticalInsight.goal.id);
          } else if (criticalInsight.goals?.[0]) {
            onGoalClick?.(criticalInsight.goals[0].id);
          }
        }}
      >
        Ver
        <ChevronRight className="h-4 w-4" />
      </Button>

      {/* Dismiss */}
      {onDismiss && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-1 right-1 h-6 w-6 p-0 opacity-50 hover:opacity-100"
          onClick={onDismiss}
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </motion.div>
  );
};

export default CompactInsights;
