/**
 * AssessmentLoopCard - Card visual para exibir um loop de avaliação contextual
 * Mostra origem -> avaliação -> outcome
 */

import { motion } from "framer-motion";
import {
  ArrowRight,
  Brain,
  Calendar,
  CheckCircle2,
  Clock,
  GamepadIcon,
  GitBranch,
  Target,
  TrendingDown,
  Users,
  X,
  Zap,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { AssessmentOriginType, LoopStatus } from "@/types/contextualAssessments";

interface AssessmentLoopCardProps {
  id: string;
  originType: AssessmentOriginType;
  originId?: string | null;
  cycleName: string;
  cycleStatus: string;
  loopStatus: LoopStatus;
  evaluatedSkills?: string[];
  createdAt: string;
  closedAt?: string | null;
  closureReason?: string | null;
  onCloseLoop?: () => void;
  onViewDetails?: () => void;
}

// Configuração visual por tipo de origem
const ORIGIN_CONFIG: Record<string, {
  label: string;
  icon: typeof Brain;
  color: string;
  bgColor: string;
}> = {
  game: {
    label: "Jogo",
    icon: GamepadIcon,
    color: "text-yellow-600",
    bgColor: "bg-yellow-500/10",
  },
  arena_game: {
    label: "Jogo Arena",
    icon: GamepadIcon,
    color: "text-yellow-600",
    bgColor: "bg-yellow-500/10",
  },
  cognitive_test: {
    label: "Teste Cognitivo",
    icon: Brain,
    color: "text-purple-600",
    bgColor: "bg-purple-500/10",
  },
  feedback_360: {
    label: "Feedback 360°",
    icon: Users,
    color: "text-blue-600",
    bgColor: "bg-blue-500/10",
  },
  pdi_goal: {
    label: "Meta PDI",
    icon: Target,
    color: "text-green-600",
    bgColor: "bg-green-500/10",
  },
  goal: {
    label: "Meta",
    icon: Target,
    color: "text-green-600",
    bgColor: "bg-green-500/10",
  },
  one_on_one: {
    label: "Reunião 1:1",
    icon: Calendar,
    color: "text-orange-600",
    bgColor: "bg-orange-500/10",
  },
  streak_break: {
    label: "Quebra de Streak",
    icon: TrendingDown,
    color: "text-red-600",
    bgColor: "bg-red-500/10",
  },
  low_score: {
    label: "Score Baixo",
    icon: TrendingDown,
    color: "text-amber-600",
    bgColor: "bg-amber-500/10",
  },
  training: {
    label: "Treinamento",
    icon: Zap,
    color: "text-pink-600",
    bgColor: "bg-pink-500/10",
  },
  challenge: {
    label: "Desafio",
    icon: Target,
    color: "text-cyan-600",
    bgColor: "bg-cyan-500/10",
  },
  manual: {
    label: "Manual",
    icon: GitBranch,
    color: "text-gray-600",
    bgColor: "bg-gray-500/10",
  },
};

// Status badges configuration
const LOOP_STATUS_CONFIG: Record<string, {
  label: string;
  variant: "default" | "secondary" | "outline" | "destructive";
  icon: typeof Clock;
}> = {
  open: {
    label: "Em Andamento",
    variant: "default",
    icon: Clock,
  },
  pending_action: {
    label: "Ação Pendente",
    variant: "outline",
    icon: Clock,
  },
  closed: {
    label: "Concluído",
    variant: "secondary",
    icon: CheckCircle2,
  },
  expired: {
    label: "Expirado",
    variant: "destructive",
    icon: X,
  },
};

export function AssessmentLoopCard({
  id,
  originType,
  originId,
  cycleName,
  cycleStatus,
  loopStatus,
  evaluatedSkills = [],
  createdAt,
  closedAt,
  closureReason,
  onCloseLoop,
  onViewDetails,
}: AssessmentLoopCardProps) {
  const originConfig = ORIGIN_CONFIG[originType] || ORIGIN_CONFIG.manual;
  const statusConfig = LOOP_STATUS_CONFIG[loopStatus] || LOOP_STATUS_CONFIG.open;
  const OriginIcon = originConfig.icon;
  const StatusIcon = statusConfig.icon;

  const isOpen = loopStatus === "open";
  const progress = loopStatus === "closed" ? 100 : loopStatus === "expired" ? 0 : 50;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="overflow-hidden border-border hover:shadow-md transition-all">
        <CardContent className="p-4">
          {/* Header with status */}
          <div className="flex items-center justify-between mb-4">
            <Badge variant={statusConfig.variant} className="flex items-center gap-1">
              <StatusIcon className="w-3 h-3" />
              {statusConfig.label}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(createdAt), {
                addSuffix: true,
                locale: ptBR,
              })}
            </span>
          </div>

          {/* Visual Loop Flow */}
          <div className="flex items-center gap-2 mb-4">
            {/* Origin */}
            <div className={`flex items-center gap-2 p-2 rounded-lg ${originConfig.bgColor}`}>
              <OriginIcon className={`w-4 h-4 ${originConfig.color}`} />
              <span className={`text-sm font-medium ${originConfig.color}`}>
                {originConfig.label}
              </span>
            </div>

            {/* Arrow */}
            <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />

            {/* Assessment */}
            <div className="flex-1 p-2 rounded-lg bg-primary/10 border border-primary/20">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary truncate">
                  {cycleName}
                </span>
              </div>
            </div>

            {/* Arrow to outcome (if closed) */}
            {loopStatus === "closed" && (
              <>
                <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <div className="p-2 rounded-lg bg-green-500/10">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                </div>
              </>
            )}
          </div>

          {/* Progress bar */}
          <Progress value={progress} className="h-1.5 mb-3" />

          {/* Skills involved */}
          {evaluatedSkills.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {evaluatedSkills.slice(0, 3).map((skillId) => (
                <Badge key={skillId} variant="outline" className="text-xs">
                  Skill #{skillId.slice(0, 4)}
                </Badge>
              ))}
              {evaluatedSkills.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{evaluatedSkills.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* Closure info */}
          {closedAt && (
            <p className="text-xs text-muted-foreground mb-3">
              Fechado {formatDistanceToNow(new Date(closedAt), {
                addSuffix: true,
                locale: ptBR,
              })}
              {closureReason && ` • ${closureReason}`}
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            {onViewDetails && (
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={onViewDetails}
              >
                Ver Detalhes
              </Button>
            )}
            {isOpen && onCloseLoop && (
              <Button
                variant="secondary"
                size="sm"
                className="flex-1"
                onClick={onCloseLoop}
              >
                Fechar Loop
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
