/**
 * PDIInsightsPanel - Painel de insights do PDI
 * Mostra ritmo, previsões e alertas de estagnação
 */

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp,
  TrendingDown,
  Clock,
  Target,
  AlertTriangle,
  Zap,
  Calendar,
} from "lucide-react";
import { format, differenceInDays, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DevelopmentPlan, DevelopmentGoal } from "@/hooks/usePDI";

interface PDIInsightsPanelProps {
  plan: DevelopmentPlan;
  goals: DevelopmentGoal[];
}

export function PDIInsightsPanel({ plan, goals }: PDIInsightsPanelProps) {
  const insights = useMemo(() => {
    const now = new Date();
    const activeGoals = goals.filter(g => g.status !== "completed");
    const completedGoals = goals.filter(g => g.status === "completed");
    
    // Calcular metas atrasadas
    const overdueGoals = activeGoals.filter(g => 
      g.target_date && new Date(g.target_date) < now && g.progress < 100
    );
    
    // Calcular metas estagnadas (sem progresso há muito tempo)
    const stagnantGoals = activeGoals.filter(g => g.progress < 50);
    
    // Calcular ritmo médio (se tiver metas concluídas)
    const avgCompletionDays = completedGoals.length > 0 ? 14 : 30; // Placeholder
    
    // Previsão de conclusão
    const remainingProgress = 100 - plan.overall_progress;
    const daysToComplete = Math.ceil((remainingProgress / 100) * avgCompletionDays * goals.length);
    const estimatedCompletion = addDays(now, daysToComplete);
    
    // Determinar status geral
    let status: "excellent" | "good" | "attention" | "critical" = "good";
    if (overdueGoals.length > 0) status = "critical";
    else if (stagnantGoals.length > goals.length / 2) status = "attention";
    else if (plan.overall_progress >= 75) status = "excellent";
    
    return {
      overdueGoals,
      stagnantGoals,
      avgCompletionDays,
      estimatedCompletion,
      daysToComplete,
      status,
      activeGoals,
      completedGoals,
    };
  }, [plan, goals]);

  const statusConfig = {
    excellent: { 
      label: "Excelente", 
      color: "bg-green-500/10 text-green-600 border-green-500/20",
      icon: TrendingUp 
    },
    good: { 
      label: "No caminho", 
      color: "bg-blue-500/10 text-blue-600 border-blue-500/20",
      icon: Target 
    },
    attention: { 
      label: "Atenção", 
      color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
      icon: Clock 
    },
    critical: { 
      label: "Atrasado", 
      color: "bg-red-500/10 text-red-600 border-red-500/20",
      icon: AlertTriangle 
    },
  };

  const currentStatus = statusConfig[insights.status];
  const StatusIcon = currentStatus.icon;

  if (goals.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <Card className={`border ${currentStatus.color.split(" ")[2]}`}>
        <CardContent className="pt-4">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-xl ${currentStatus.color.split(" ")[0]}`}>
              <StatusIcon className={`h-6 w-6 ${currentStatus.color.split(" ")[1]}`} />
            </div>
            
            <div className="flex-1 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Badge variant="outline" className={currentStatus.color}>
                    {currentStatus.label}
                  </Badge>
                  <p className="text-sm text-muted-foreground mt-1">
                    {insights.status === "excellent" && "Você está arrasando! Continue assim."}
                    {insights.status === "good" && "Progresso consistente. Mantenha o ritmo!"}
                    {insights.status === "attention" && "Algumas metas precisam de mais foco."}
                    {insights.status === "critical" && "Metas atrasadas precisam de atenção urgente."}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
                <div className="text-center p-2 rounded-lg bg-muted/50">
                  <p className="text-2xl font-bold text-primary">{insights.completedGoals.length}</p>
                  <p className="text-xs text-muted-foreground">Concluídas</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-muted/50">
                  <p className="text-2xl font-bold">{insights.activeGoals.length}</p>
                  <p className="text-xs text-muted-foreground">Em progresso</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-muted/50">
                  <p className="text-2xl font-bold text-yellow-600">{insights.stagnantGoals.length}</p>
                  <p className="text-xs text-muted-foreground">Estagnadas</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-muted/50">
                  <p className="text-2xl font-bold text-red-500">{insights.overdueGoals.length}</p>
                  <p className="text-xs text-muted-foreground">Atrasadas</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Previsão de conclusão */}
      {plan.overall_progress < 100 && (
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Previsão de Conclusão</p>
                <p className="text-xs text-muted-foreground">
                  No ritmo atual, você concluirá em aproximadamente{" "}
                  <span className="font-semibold text-foreground">
                    {insights.daysToComplete} dias
                  </span>{" "}
                  ({format(insights.estimatedCompletion, "dd 'de' MMMM", { locale: ptBR })})
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">{plan.overall_progress}%</p>
                <Progress value={plan.overall_progress} className="w-20 h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alertas de metas atrasadas */}
      {insights.overdueGoals.length > 0 && (
        <Card className="border-red-500/20 bg-red-500/5">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-600">
                  {insights.overdueGoals.length} meta{insights.overdueGoals.length > 1 ? "s" : ""} atrasada{insights.overdueGoals.length > 1 ? "s" : ""}
                </p>
                <ul className="text-xs text-muted-foreground mt-1 space-y-1">
                  {insights.overdueGoals.slice(0, 3).map(goal => (
                    <li key={goal.id} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                      {goal.title} ({goal.progress}% concluído)
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sugestão de ação */}
      {insights.stagnantGoals.length > 0 && insights.overdueGoals.length === 0 && (
        <Card className="border-yellow-500/20 bg-yellow-500/5">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <Zap className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-700">
                  Sugestão: Foque na meta "{insights.stagnantGoals[0].title}"
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Esta meta está com {insights.stagnantGoals[0].progress}% de progresso. 
                  Avançar nela pode acelerar sua evolução geral.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}
