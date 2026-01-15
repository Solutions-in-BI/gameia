/**
 * AssessmentSuggestionCard - Card para sugestões de avaliação contextual
 * Mostra sugestões dinâmicas baseadas em eventos
 */

import { motion } from "framer-motion";
import {
  AlertCircle,
  Brain,
  Calendar,
  Check,
  GamepadIcon,
  Lightbulb,
  Sparkles,
  Target,
  TrendingDown,
  Users,
  X,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { SuggestionType } from "@/types/contextualAssessments";
import { ASSESSMENT_TYPE_COLORS, STATUS_COLORS } from "@/constants/colors";

interface AssessmentSuggestionCardProps {
  id: string;
  suggestionType: SuggestionType;
  reason: string;
  skillsToEvaluate?: string[];
  priority?: number;
  createdAt: string;
  contextType?: string | null;
  onAccept: () => void;
  onDismiss: () => void;
  isLoading?: boolean;
}

// Configuração visual por tipo de sugestão - usando sistema centralizado
const SUGGESTION_CONFIG: Record<string, {
  label: string;
  icon: typeof Brain;
  color: string;
  bgColor: string;
  borderColor: string;
}> = {
  low_score_assessment: {
    label: "Score Baixo",
    icon: TrendingDown,
    color: STATUS_COLORS.warning.text,
    bgColor: STATUS_COLORS.warning.bgSubtle,
    borderColor: STATUS_COLORS.warning.border,
  },
  streak_recovery: {
    label: "Recuperar Streak",
    icon: AlertCircle,
    color: STATUS_COLORS.error.text,
    bgColor: STATUS_COLORS.error.bgSubtle,
    borderColor: STATUS_COLORS.error.border,
  },
  goal_failed: {
    label: "Meta não Atingida",
    icon: Target,
    color: "text-primary",
    bgColor: "bg-primary/10",
    borderColor: "border-primary/30",
  },
  peer_feedback: {
    label: "Feedback de Pares",
    icon: Users,
    color: STATUS_COLORS.info.text,
    bgColor: STATUS_COLORS.info.bgSubtle,
    borderColor: STATUS_COLORS.info.border,
  },
  scheduled: {
    label: "Agendada",
    icon: Calendar,
    color: ASSESSMENT_TYPE_COLORS.scheduled.text,
    bgColor: ASSESSMENT_TYPE_COLORS.scheduled.bgSubtle,
    borderColor: ASSESSMENT_TYPE_COLORS.scheduled.border,
  },
  manager_request: {
    label: "Solicitação do Gestor",
    icon: Users,
    color: ASSESSMENT_TYPE_COLORS.manager_request.text,
    bgColor: ASSESSMENT_TYPE_COLORS.manager_request.bgSubtle,
    borderColor: ASSESSMENT_TYPE_COLORS.manager_request.border,
  },
  self_assessment: {
    label: "Autoavaliação",
    icon: Lightbulb,
    color: ASSESSMENT_TYPE_COLORS.self_assessment.text,
    bgColor: ASSESSMENT_TYPE_COLORS.self_assessment.bgSubtle,
    borderColor: ASSESSMENT_TYPE_COLORS.self_assessment.border,
  },
  auto: {
    label: "Automática",
    icon: Sparkles,
    color: ASSESSMENT_TYPE_COLORS.auto.text,
    bgColor: ASSESSMENT_TYPE_COLORS.auto.bgSubtle,
    borderColor: ASSESSMENT_TYPE_COLORS.auto.border,
  },
  manual: {
    label: "Manual",
    icon: Lightbulb,
    color: "text-muted-foreground",
    bgColor: "bg-muted/50",
    borderColor: "border-border",
  },
};

// Mapeamento de contexto para ícone
const CONTEXT_ICON: Record<string, typeof Brain> = {
  game: GamepadIcon,
  cognitive_test: Brain,
  pdi_goal: Target,
  streak: AlertCircle,
};

export function AssessmentSuggestionCard({
  id,
  suggestionType,
  reason,
  skillsToEvaluate = [],
  priority = 5,
  createdAt,
  contextType,
  onAccept,
  onDismiss,
  isLoading,
}: AssessmentSuggestionCardProps) {
  const config = SUGGESTION_CONFIG[suggestionType] || SUGGESTION_CONFIG.self_assessment;
  const SuggestionIcon = config.icon;
  const ContextIcon = contextType ? CONTEXT_ICON[contextType] || Lightbulb : Lightbulb;

  // Priority indicator - usando sistema centralizado
  const priorityLabel = priority <= 3 ? "Alta" : priority <= 6 ? "Média" : "Baixa";
  const priorityColor = priority <= 3 ? STATUS_COLORS.error.text : priority <= 6 ? STATUS_COLORS.warning.text : STATUS_COLORS.success.text;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={`overflow-hidden ${config.borderColor} border-2`}>
        <CardHeader className={`py-3 ${config.bgColor}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SuggestionIcon className={`w-5 h-5 ${config.color}`} />
              <CardTitle className={`text-sm font-semibold ${config.color}`}>
                {config.label}
              </CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={`text-xs ${priorityColor}`}>
                Prioridade {priorityLabel}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4">
          {/* Reason/Message */}
          <p className="text-sm text-foreground mb-3">{reason}</p>

          {/* Context indicator */}
          {contextType && (
            <div className="flex items-center gap-2 mb-3 text-xs text-muted-foreground">
              <ContextIcon className="w-3 h-3" />
              <span>Originado de: {contextType.replace("_", " ")}</span>
            </div>
          )}

          {/* Skills to evaluate */}
          {skillsToEvaluate.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              <span className="text-xs text-muted-foreground mr-1">Skills:</span>
              {skillsToEvaluate.slice(0, 4).map((skillId, i) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  {skillId.slice(0, 8)}
                </Badge>
              ))}
              {skillsToEvaluate.length > 4 && (
                <Badge variant="secondary" className="text-xs">
                  +{skillsToEvaluate.length - 4}
                </Badge>
              )}
            </div>
          )}

          {/* Timestamp */}
          <p className="text-xs text-muted-foreground mb-4">
            Sugerido {formatDistanceToNow(new Date(createdAt), {
              addSuffix: true,
              locale: ptBR,
            })}
          </p>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="default"
              size="sm"
              className="flex-1"
              onClick={onAccept}
              disabled={isLoading}
            >
              <Check className="w-4 h-4 mr-1" />
              Aceitar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onDismiss}
              disabled={isLoading}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
