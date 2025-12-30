/**
 * DailyPDIActions - Widget de recomendações diárias baseadas no PDI
 * "Para evoluir hoje..." - mostra ações concretas com link direto
 */

import { useMemo } from "react";
import { motion } from "framer-motion";
import { 
  Sparkles, ArrowRight, BookOpen, Gamepad2, 
  Trophy, Brain, Target, Clock, TrendingUp
} from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { usePDI } from "@/hooks/usePDI";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface RecommendedAction {
  id: string;
  type: "training" | "game" | "challenge" | "cognitive_test" | "checkin";
  title: string;
  description: string;
  goalTitle?: string;
  link: string;
  priority: number;
  expectedImpact: number;
}

const ACTION_CONFIG = {
  training: {
    icon: BookOpen,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    label: "Treinamento",
  },
  game: {
    icon: Gamepad2,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    label: "Jogo",
  },
  challenge: {
    icon: Trophy,
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
    label: "Desafio",
  },
  cognitive_test: {
    icon: Brain,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    label: "Teste",
  },
  checkin: {
    icon: Target,
    color: "text-primary",
    bgColor: "bg-primary/10",
    label: "Check-in",
  },
};

export function DailyPDIActions() {
  const { user } = useAuth();
  const { myPlans, myPlansLoading } = usePDI();

  // Buscar metas ativas com vínculos
  const { data: activeGoals = [] } = useQuery({
    queryKey: ["active-goals-with-links", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const activePlanIds = myPlans
        .filter(p => p.status === "active")
        .map(p => p.id);

      if (activePlanIds.length === 0) return [];

      const { data, error } = await supabase
        .from("development_goals")
        .select("*")
        .in("plan_id", activePlanIds)
        .eq("status", "in_progress")
        .lt("progress", 100)
        .order("priority", { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id && !myPlansLoading && myPlans.length > 0,
  });

  // Buscar treinamentos não concluídos vinculados às metas
  const { data: pendingTrainings = [] } = useQuery({
    queryKey: ["pending-trainings-for-pdi", user?.id, activeGoals],
    queryFn: async () => {
      if (!user?.id) return [];

      const allTrainingIds = activeGoals
        .flatMap(g => g.linked_training_ids || [])
        .filter(Boolean);

      if (allTrainingIds.length === 0) return [];

      // Buscar treinamentos
      const { data: trainings } = await supabase
        .from("trainings")
        .select("id, title")
        .in("id", allTrainingIds);

      // Buscar progresso do usuário
      const { data: progress } = await supabase
        .from("user_training_progress")
        .select("training_id, completed_at")
        .eq("user_id", user.id)
        .in("training_id", allTrainingIds);

      const completedIds = new Set(progress?.filter(p => p.completed_at).map(p => p.training_id) || []);

      return trainings?.filter(t => !completedIds.has(t.id)) || [];
    },
    enabled: activeGoals.length > 0,
  });

  // Gerar recomendações baseadas nas metas e atividades pendentes
  const recommendations = useMemo<RecommendedAction[]>(() => {
    const actions: RecommendedAction[] = [];

    // Adicionar treinamentos pendentes
    pendingTrainings.slice(0, 2).forEach((training, index) => {
      const relatedGoal = activeGoals.find(g => 
        g.linked_training_ids?.includes(training.id)
      );

      actions.push({
        id: `training-${training.id}`,
        type: "training",
        title: training.title,
        description: "Avance neste treinamento para progredir na sua meta",
        goalTitle: relatedGoal?.title,
        link: `/app/trainings/${training.id}`,
        priority: index + 1,
        expectedImpact: 25,
      });
    });

    // Sugerir check-in para metas estagnadas
    const stagnantGoals = activeGoals.filter(g => {
      if (!g.stagnant_since) return false;
      const daysSinceUpdate = Math.floor(
        (Date.now() - new Date(g.stagnant_since).getTime()) / (1000 * 60 * 60 * 24)
      );
      return daysSinceUpdate >= 5;
    });

    stagnantGoals.slice(0, 1).forEach(goal => {
      actions.push({
        id: `checkin-${goal.id}`,
        type: "checkin",
        title: `Check-in: ${goal.title}`,
        description: "Esta meta precisa de atenção. Faça um check-in rápido.",
        link: `/app/development`,
        priority: 0,
        expectedImpact: 10,
      });
    });

    // Sugerir jogo se meta tem jogos vinculados
    const goalsWithGames = activeGoals.filter(g => g.related_games?.length);
    if (goalsWithGames.length > 0) {
      const goal = goalsWithGames[0];
      actions.push({
        id: `game-${goal.related_games?.[0]}`,
        type: "game",
        title: "Praticar na Arena",
        description: "Jogue para desenvolver habilidades ligadas à sua meta",
        goalTitle: goal.title,
        link: `/app/arena`,
        priority: 3,
        expectedImpact: 10,
      });
    }

    // Ordenar por prioridade
    return actions.sort((a, b) => a.priority - b.priority).slice(0, 3);
  }, [activeGoals, pendingTrainings]);

  if (myPlansLoading || recommendations.length === 0) {
    return null;
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="h-5 w-5 text-primary" />
          Para evoluir hoje
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {recommendations.map((action, index) => {
          const config = ACTION_CONFIG[action.type];
          const Icon = config.icon;

          return (
            <motion.div
              key={action.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link to={action.link}>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors group">
                  <div className={cn("p-2 rounded-lg shrink-0", config.bgColor)}>
                    <Icon className={cn("h-4 w-4", config.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm truncate">{action.title}</p>
                      <Badge variant="outline" className="text-xs shrink-0">
                        +{action.expectedImpact}%
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {action.description}
                    </p>
                    {action.goalTitle && (
                      <div className="flex items-center gap-1 mt-1">
                        <Target className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground truncate">
                          Meta: {action.goalTitle}
                        </span>
                      </div>
                    )}
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0 mt-1" />
                </div>
              </Link>
            </motion.div>
          );
        })}

        <Button variant="ghost" className="w-full text-sm" asChild>
          <Link to="/app/development">
            <TrendingUp className="h-4 w-4 mr-2" />
            Ver meu PDI completo
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
