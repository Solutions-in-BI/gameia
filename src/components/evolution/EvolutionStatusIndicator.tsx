/**
 * EvolutionStatusIndicator - Indicador visual de saúde da evolução
 * Mostra status geral (verde/amarelo/vermelho) com texto interpretativo
 */

import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Flame,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface EvolutionStatusIndicatorProps {
  // Stats
  activeStreak?: number;
  weeklyXP?: number;
  pendingActions?: number;
  weakSkillsCount?: number;
  completedThisWeek?: number;
  // Optional custom message
  customMessage?: string;
}

type HealthStatus = "excellent" | "good" | "attention" | "critical";

export function EvolutionStatusIndicator({
  activeStreak = 0,
  weeklyXP = 0,
  pendingActions = 0,
  weakSkillsCount = 0,
  completedThisWeek = 0,
  customMessage
}: EvolutionStatusIndicatorProps) {
  // Calculate overall health score (0-100)
  const calculateHealthScore = (): number => {
    let score = 50; // Base score

    // Streak bonus (up to +20)
    if (activeStreak >= 7) score += 20;
    else if (activeStreak >= 3) score += 10;
    else if (activeStreak >= 1) score += 5;
    else score -= 10;

    // Weekly activity bonus (up to +20)
    if (completedThisWeek >= 5) score += 20;
    else if (completedThisWeek >= 3) score += 10;
    else if (completedThisWeek >= 1) score += 5;
    else score -= 10;

    // Pending actions penalty (up to -20)
    if (pendingActions >= 5) score -= 20;
    else if (pendingActions >= 3) score -= 10;
    else if (pendingActions >= 1) score -= 5;

    // Weak skills penalty (up to -10)
    if (weakSkillsCount >= 5) score -= 10;
    else if (weakSkillsCount >= 3) score -= 5;

    // XP bonus (up to +10)
    if (weeklyXP >= 500) score += 10;
    else if (weeklyXP >= 200) score += 5;

    return Math.max(0, Math.min(100, score));
  };

  const healthScore = calculateHealthScore();

  // Determine health status
  const getHealthStatus = (): HealthStatus => {
    if (healthScore >= 80) return "excellent";
    if (healthScore >= 60) return "good";
    if (healthScore >= 40) return "attention";
    return "critical";
  };

  const status = getHealthStatus();

  // Config for each status
  const statusConfig: Record<HealthStatus, {
    color: string;
    bgColor: string;
    borderColor: string;
    icon: typeof TrendingUp;
    label: string;
    message: string;
  }> = {
    excellent: {
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/30",
      icon: Sparkles,
      label: "Excelente",
      message: "Você está evoluindo muito bem! Continue assim! 🚀"
    },
    good: {
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/30",
      icon: TrendingUp,
      label: "Bom",
      message: "Sua evolução está no caminho certo. Continue praticando!"
    },
    attention: {
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500/30",
      icon: Minus,
      label: "Atenção",
      message: pendingActions > 0 
        ? `Você tem ${pendingActions} ações pendentes que precisam de atenção.`
        : "Sua evolução está estagnada. Hora de voltar a praticar!"
    },
    critical: {
      color: "text-destructive",
      bgColor: "bg-destructive/10",
      borderColor: "border-destructive/30",
      icon: AlertTriangle,
      label: "Crítico",
      message: "Atenção! Sua evolução precisa de foco imediato."
    }
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={cn("border", config.borderColor, config.bgColor)}>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            {/* Status Icon */}
            <div className={cn(
              "p-3 rounded-full",
              config.bgColor,
              config.color
            )}>
              <Icon className="w-6 h-6" />
            </div>

            {/* Status Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className={cn("font-medium", config.color)}>
                  {config.label}
                </Badge>
                {activeStreak > 0 && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Flame className="w-3 h-3 text-orange-500" />
                    {activeStreak} dias
                  </Badge>
                )}
              </div>
              
              <p className="text-sm text-foreground">
                {customMessage || config.message}
              </p>

              {/* Progress bar */}
              <div className="mt-2 flex items-center gap-2">
                <Progress 
                  value={healthScore} 
                  className="h-2 flex-1" 
                />
                <span className={cn("text-xs font-medium", config.color)}>
                  {healthScore}%
                </span>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="hidden sm:flex items-center gap-4 text-center">
              <div>
                <p className="text-lg font-bold">{weeklyXP}</p>
                <p className="text-[10px] text-muted-foreground">XP esta semana</p>
              </div>
              <div className="w-px h-8 bg-border" />
              <div>
                <p className="text-lg font-bold">{completedThisWeek}</p>
                <p className="text-[10px] text-muted-foreground">Atividades</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
