/**
 * NextStepsPanel - Painel agregado de próximos passos
 * Combina: aplicações práticas, missões diárias, ações 1:1, metas PDI
 */

import { motion } from "framer-motion";
import { 
  Target, Clock, CheckCircle2, ArrowRight, Calendar,
  Brain, Users, Flame, AlertCircle, BookOpen
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useNextSteps, NextStep, StepType } from "@/hooks/useNextSteps";
import { format, isPast, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useNavigate } from "react-router-dom";

interface NextStepsPanelProps {
  maxItems?: number;
  showEmpty?: boolean;
  onViewAll?: () => void;
}

const TYPE_CONFIG: Record<StepType, { 
  icon: typeof Target; 
  color: string; 
  bgColor: string;
  label: string;
}> = {
  book_application: { 
    icon: BookOpen, 
    color: "text-orange-500", 
    bgColor: "bg-orange-500/10",
    label: "Aplicação Prática" 
  },
  daily_mission: { 
    icon: Target, 
    color: "text-green-500", 
    bgColor: "bg-green-500/10",
    label: "Missão Diária" 
  },
  "1on1_action": { 
    icon: Users, 
    color: "text-blue-500", 
    bgColor: "bg-blue-500/10",
    label: "Ação 1:1" 
  },
  pdi_goal: { 
    icon: Brain, 
    color: "text-purple-500", 
    bgColor: "bg-purple-500/10",
    label: "Meta PDI" 
  },
  training_module: {
    icon: Target,
    color: "text-indigo-500",
    bgColor: "bg-indigo-500/10",
    label: "Módulo de Treinamento"
  },
  commitment: {
    icon: Flame,
    color: "text-red-500",
    bgColor: "bg-red-500/10",
    label: "Compromisso"
  }
};

export function NextStepsPanel({ 
  maxItems = 5, 
  showEmpty = true,
  onViewAll 
}: NextStepsPanelProps) {
  const { steps, isLoading, urgentCount } = useNextSteps();
  const navigate = useNavigate();

  const displayedSteps = steps.slice(0, maxItems);

  const handleStepClick = (step: NextStep) => {
    // Navigate based on step type
    switch (step.stepType) {
      case 'book_application':
        navigate(`/app/trainings`);
        break;
      case 'daily_mission':
        navigate('/app');
        break;
      case 'pdi_goal':
        navigate('/app/evolution');
        break;
      default:
        break;
    }
  };

  const getPriorityBadge = (priority: NextStep['priority']) => {
    switch (priority) {
      case 'urgent':
        return <Badge variant="destructive" className="text-xs">Urgente</Badge>;
      case 'high':
        return <Badge variant="outline" className="text-xs border-orange-500 text-orange-500">Alta</Badge>;
      default:
        return null;
    }
  };

  const getDeadlineText = (deadline: Date | null, isOverdue: boolean) => {
    if (!deadline) return null;
    
    if (isOverdue) {
      return (
        <span className="text-xs text-destructive flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          Atrasado
        </span>
      );
    }
    
    if (isToday(deadline)) {
      return (
        <span className="text-xs text-orange-500 flex items-center gap-1">
          <Flame className="w-3 h-3" />
          Hoje
        </span>
      );
    }
    
    return (
      <span className="text-xs text-muted-foreground flex items-center gap-1">
        <Calendar className="w-3 h-3" />
        {format(deadline, "dd/MM", { locale: ptBR })}
      </span>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Próximos Passos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-muted/50 rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Próximos Passos
            {urgentCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {urgentCount} urgente{urgentCount > 1 ? 's' : ''}
              </Badge>
            )}
          </CardTitle>
          {onViewAll && steps.length > maxItems && (
            <Button variant="ghost" size="sm" onClick={onViewAll} className="gap-1">
              Ver todos
              <ArrowRight className="w-3 h-3" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {displayedSteps.length > 0 ? (
          <div className="space-y-3">
            {displayedSteps.map((step, index) => {
              const config = TYPE_CONFIG[step.stepType];
              const Icon = config?.icon || Target;

              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleStepClick(step)}
                  className="flex items-start gap-3 p-3 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors cursor-pointer group"
                >
                  <div className={`p-2 rounded-lg ${config?.bgColor || 'bg-muted'} ${config?.color || 'text-muted-foreground'} shrink-0`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-sm leading-tight">{step.title}</p>
                        <p className="text-xs text-muted-foreground">{config?.label || step.stepType}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {getPriorityBadge(step.priority)}
                        {getDeadlineText(step.deadlineAt, step.isOverdue)}
                      </div>
                    </div>
                    
                    {step.description && (
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {step.description}
                      </p>
                    )}
                  </div>

                  <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-2" />
                </motion.div>
              );
            })}
          </div>
        ) : showEmpty ? (
          <div className="text-center py-8">
            <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <h3 className="font-semibold mb-1">Tudo em dia!</h3>
            <p className="text-sm text-muted-foreground">
              Você não tem pendências no momento.
            </p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
