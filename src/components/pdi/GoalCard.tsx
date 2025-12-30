import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Target, 
  Brain, 
  Zap, 
  Users,
  ChevronDown,
  ChevronUp,
  MessageSquarePlus,
  History,
  Edit3,
  Calendar,
  Sparkles,
  Link2,
  BookOpen,
  Trophy,
  Gamepad2,
  RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DevelopmentGoal } from "@/hooks/usePDI";
import { format, differenceInDays, isPast } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";

interface GoalCardProps {
  goal: DevelopmentGoal;
  onCheckIn: (goal: DevelopmentGoal) => void;
  onViewHistory: (goal: DevelopmentGoal) => void;
  onEdit: (goal: DevelopmentGoal) => void;
  expanded?: boolean;
  onToggleExpand?: () => void;
}

const goalTypeConfig: Record<string, { icon: React.ElementType; color: string; label: string; borderColor: string }> = {
  behavioral: { 
    icon: Users, 
    color: "text-blue-400", 
    label: "Comportamental",
    borderColor: "border-l-blue-500"
  },
  technical: { 
    icon: Zap, 
    color: "text-emerald-400", 
    label: "Técnica",
    borderColor: "border-l-emerald-500"
  },
  cognitive: { 
    icon: Brain, 
    color: "text-purple-400", 
    label: "Cognitiva",
    borderColor: "border-l-purple-500"
  },
  performance: { 
    icon: Target, 
    color: "text-orange-400", 
    label: "Performance",
    borderColor: "border-l-orange-500"
  },
};

const priorityConfig: Record<string, { color: string; bgColor: string; label: string }> = {
  high: { color: "text-red-400", bgColor: "bg-red-500/10 border-red-500/30", label: "Alta" },
  medium: { color: "text-amber-400", bgColor: "bg-amber-500/10 border-amber-500/30", label: "Média" },
  low: { color: "text-emerald-400", bgColor: "bg-emerald-500/10 border-emerald-500/30", label: "Baixa" },
};

export const GoalCard: React.FC<GoalCardProps> = ({
  goal,
  onCheckIn,
  onViewHistory,
  onEdit,
  expanded = false,
  onToggleExpand,
}) => {
  const typeConfig = goalTypeConfig[goal.goal_type || "behavioral"];
  const TypeIcon = typeConfig?.icon || Target;
  const priority = priorityConfig[goal.priority || "medium"];
  
  const daysRemaining = goal.target_date 
    ? differenceInDays(new Date(goal.target_date), new Date())
    : null;
  
  const isOverdue = goal.target_date && isPast(new Date(goal.target_date)) && goal.status !== "completed";
  const isCompleted = goal.status === "completed";
  const isStagnant = !!goal.stagnant_since;

  const linkedCount = (goal.linked_training_ids?.length || 0) + 
                      (goal.linked_challenge_ids?.length || 0) + 
                      (goal.linked_cognitive_test_ids?.length || 0);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Card className={cn(
        "relative overflow-hidden border-l-4 transition-all duration-300 hover:shadow-lg",
        typeConfig?.borderColor || "border-l-primary",
        isCompleted && "opacity-75",
        isOverdue && "ring-1 ring-red-500/30",
        isStagnant && !isOverdue && "ring-1 ring-amber-500/30"
      )}>
        {/* Auto progress indicator */}
        {goal.auto_progress_enabled && (
          <div className="absolute top-2 right-2">
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs">
              <RefreshCw className="h-3 w-3" />
              <span>Auto</span>
            </div>
          </div>
        )}

        <CardContent className="p-4">
          {/* Header Row */}
          <div className="flex items-start gap-3 mb-3">
            <div className={cn(
              "p-2 rounded-lg bg-muted/50",
              typeConfig?.color
            )}>
              <TypeIcon className="h-5 w-5" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h3 className="font-semibold text-foreground truncate">
                  {goal.title}
                </h3>
                {goal.xp_reward && goal.xp_reward > 0 && (
                  <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/30 text-xs">
                    <Sparkles className="h-3 w-3 mr-1" />
                    {goal.xp_reward} XP
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-2 flex-wrap text-xs">
                <Badge variant="outline" className={cn("text-xs", priority?.bgColor, priority?.color)}>
                  {priority?.label || "Média"}
                </Badge>
                
                {typeConfig && (
                  <span className={cn("text-xs", typeConfig.color)}>
                    {typeConfig.label}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-muted-foreground">Progresso</span>
              <span className="font-medium text-foreground">{goal.progress || 0}%</span>
            </div>
            <div className="relative h-2 bg-muted rounded-full overflow-hidden">
              <motion.div 
                className={cn(
                  "absolute inset-y-0 left-0 rounded-full",
                  isCompleted ? "bg-emerald-500" : "bg-gradient-to-r from-primary to-chart-2"
                )}
                initial={{ width: 0 }}
                animate={{ width: `${goal.progress || 0}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
          </div>

          {/* Meta Info Row */}
          <div className="flex items-center gap-3 flex-wrap text-xs text-muted-foreground mb-3">
            {goal.target_date && (
              <div className={cn(
                "flex items-center gap-1",
                isOverdue ? "text-red-400" : daysRemaining !== null && daysRemaining <= 7 ? "text-amber-400" : ""
              )}>
                <Calendar className="h-3.5 w-3.5" />
                {isOverdue ? (
                  <span>Atrasada</span>
                ) : daysRemaining !== null ? (
                  <span>{daysRemaining} dias</span>
                ) : null}
              </div>
            )}
            
            {linkedCount > 0 && (
              <div className="flex items-center gap-1">
                <Link2 className="h-3.5 w-3.5" />
                <span>{linkedCount} atividades</span>
              </div>
            )}

            {isStagnant && (
              <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/30 text-xs animate-pulse">
                Estagnada
              </Badge>
            )}
          </div>

          {/* Linked Activities Mini Preview */}
          {linkedCount > 0 && (
            <div className="flex items-center gap-1.5 mb-3 overflow-x-auto pb-1">
              {goal.linked_training_ids?.slice(0, 2).map((_, i) => (
                <div key={`training-${i}`} className="flex items-center gap-1 px-2 py-1 rounded-md bg-blue-500/10 text-blue-400 text-xs whitespace-nowrap">
                  <BookOpen className="h-3 w-3" />
                  <span>Treinamento</span>
                </div>
              ))}
              {goal.linked_challenge_ids?.slice(0, 2).map((_, i) => (
                <div key={`challenge-${i}`} className="flex items-center gap-1 px-2 py-1 rounded-md bg-orange-500/10 text-orange-400 text-xs whitespace-nowrap">
                  <Trophy className="h-3 w-3" />
                  <span>Desafio</span>
                </div>
              ))}
              {goal.linked_cognitive_test_ids?.slice(0, 1).map((_, i) => (
                <div key={`cognitive-${i}`} className="flex items-center gap-1 px-2 py-1 rounded-md bg-purple-500/10 text-purple-400 text-xs whitespace-nowrap">
                  <Brain className="h-3 w-3" />
                  <span>Teste</span>
                </div>
              ))}
              {linkedCount > 3 && (
                <span className="text-xs text-muted-foreground">+{linkedCount - 3}</span>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="default"
              size="sm"
              className="flex-1 gap-1.5"
              onClick={() => onCheckIn(goal)}
              disabled={isCompleted}
            >
              <MessageSquarePlus className="h-4 w-4" />
              Check-in
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewHistory(goal)}
              className="gap-1.5"
            >
              <History className="h-4 w-4" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(goal)}
              className="gap-1.5"
            >
              <Edit3 className="h-4 w-4" />
            </Button>

            {onToggleExpand && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleExpand}
              >
                {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            )}
          </div>

          {/* Expanded Content */}
          <AnimatePresence>
            {expanded && goal.description && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-4 mt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground">{goal.description}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default GoalCard;
