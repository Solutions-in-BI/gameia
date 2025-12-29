/**
 * MonthlyGoalsCard - Card de metas mensais no HubOverview
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  Plus,
  TrendingUp,
  Award,
  Flame,
  Gamepad2,
  Zap,
  CheckCircle,
  Calendar,
  X,
  ChevronRight,
} from "lucide-react";
import {
  useMonthlyGoals,
  type MonthlyGoal,
  type GoalTemplate,
} from "@/hooks/useMonthlyGoals";
import { HubCard, HubCardHeader } from "../common";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<string, typeof Trophy> = {
  trophy: Trophy,
  "trending-up": TrendingUp,
  award: Award,
  flame: Flame,
  "gamepad-2": Gamepad2,
  zap: Zap,
  "check-circle": CheckCircle,
};

export function MonthlyGoalsCard() {
  const {
    goals,
    isLoading,
    activeGoalsCount,
    completedGoalsCount,
    daysRemaining,
    availableTemplates,
    createGoal,
    completeGoal,
  } = useMonthlyGoals();

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  if (isLoading) {
    return (
      <HubCard>
        <HubCardHeader title="Metas do Mês" description="Carregando..." />
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      </HubCard>
    );
  }

  const activeGoals = goals.filter((g) => g.status === "active");
  const completedGoals = goals.filter((g) => g.status === "completed");

  const handleComplete = async (goal: MonthlyGoal) => {
    if (goal.current_value >= goal.target_value && goal.status === "active") {
      await completeGoal(goal.id);
    }
  };

  const handleCreateGoal = async (template: GoalTemplate) => {
    const success = await createGoal(template);
    if (success) {
      setIsDialogOpen(false);
    }
  };

  return (
    <HubCard>
      <HubCardHeader
        title="Metas do Mês"
        description={`${completedGoalsCount} completas • ${daysRemaining} dias restantes`}
        action={
          activeGoalsCount < 3 && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <Plus className="w-3 h-3 mr-1" />
                  Adicionar
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Escolher Meta do Mês</DialogTitle>
                </DialogHeader>
                <div className="space-y-3 mt-4">
                  {availableTemplates.map((template) => {
                    const Icon = ICON_MAP[template.icon] || Trophy;
                    return (
                      <motion.button
                        key={template.goal_type}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleCreateGoal(template)}
                        className="w-full p-4 rounded-lg border border-border/50 bg-muted/20 hover:bg-muted/40 transition-colors text-left"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-primary/10 text-primary">
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{template.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {template.description}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-primary">
                              +{template.xp_reward} XP
                            </p>
                            <p className="text-xs text-muted-foreground">
                              +{template.coins_reward} 🪙
                            </p>
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
                  {availableTemplates.length === 0 && (
                    <div className="text-center py-6 text-muted-foreground">
                      <Trophy className="w-10 h-10 mx-auto mb-2" />
                      <p>Você já tem todas as metas ativas!</p>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          )
        }
      />

      {/* Empty state */}
      {activeGoals.length === 0 && completedGoals.length === 0 && (
        <div className="text-center py-8">
          <Calendar className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
          <p className="font-medium mb-1">Nenhuma meta definida</p>
          <p className="text-sm text-muted-foreground mb-4">
            Defina até 3 metas para este mês
          </p>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Definir Meta
          </Button>
        </div>
      )}

      {/* Active Goals */}
      <div className="space-y-3">
        <AnimatePresence>
          {activeGoals.map((goal, index) => {
            const Icon = ICON_MAP[goal.icon] || Trophy;
            const progress = Math.round(
              (goal.current_value / goal.target_value) * 100
            );
            const isComplete = goal.current_value >= goal.target_value;

            return (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  "p-4 rounded-lg border transition-all",
                  isComplete
                    ? "border-gameia-success/50 bg-gameia-success/5"
                    : "border-border/30 bg-muted/20"
                )}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      "p-2 rounded-lg",
                      isComplete
                        ? "bg-gameia-success/20 text-gameia-success"
                        : "bg-primary/10 text-primary"
                    )}
                  >
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="font-medium truncate">{goal.title}</p>
                      <Badge variant="outline" className="text-xs flex-shrink-0">
                        {goal.current_value}/{goal.target_value}
                      </Badge>
                    </div>

                    {goal.description && (
                      <p className="text-xs text-muted-foreground mb-2 truncate">
                        {goal.description}
                      </p>
                    )}

                    <div className="flex items-center gap-3">
                      <Progress
                        value={progress}
                        className={cn(
                          "h-2 flex-1",
                          isComplete && "bg-gameia-success/30"
                        )}
                      />
                      <span className="text-xs font-medium text-muted-foreground">
                        {progress}%
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-primary font-medium">
                        +{goal.xp_reward} XP • +{goal.coins_reward} 🪙
                      </span>
                      {isComplete && (
                        <Button
                          size="sm"
                          variant="default"
                          className="h-7"
                          onClick={() => handleComplete(goal)}
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Completar
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Completed Goals Summary */}
        {completedGoals.length > 0 && (
          <div className="pt-2 border-t border-border/30">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <CheckCircle className="w-4 h-4 text-gameia-success" />
                <span>
                  {completedGoals.length} meta{completedGoals.length > 1 ? "s" : ""}{" "}
                  completada{completedGoals.length > 1 ? "s" : ""}
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </div>
          </div>
        )}
      </div>

      {/* All complete celebration */}
      {activeGoals.length === 0 && completedGoals.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-4 p-4 rounded-lg bg-gradient-to-r from-primary/10 to-gameia-success/10 border border-primary/20 text-center"
        >
          <Trophy className="w-8 h-8 mx-auto mb-2 text-primary" />
          <p className="font-semibold">Todas as Metas Completas!</p>
          <p className="text-xs text-muted-foreground">
            Você é incrível! Adicione mais metas ou aguarde o próximo mês.
          </p>
        </motion.div>
      )}
    </HubCard>
  );
}
