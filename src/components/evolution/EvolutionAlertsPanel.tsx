/**
 * EvolutionAlertsPanel - Painel de alertas proativos de evolução
 * Mostra alertas com CTAs claros e ações sugeridas
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Info,
  X,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Brain,
  Target,
  Gamepad2,
  GraduationCap,
  Users,
  Calendar,
  Sparkles,
  RefreshCw,
  Bell,
  TrendingDown,
  Flame,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useEvolutionAlerts, EvolutionAlert } from "@/hooks/useEvolutionAlerts";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

const SEVERITY_CONFIG = {
  critical: {
    icon: AlertTriangle,
    bgColor: "bg-destructive/10",
    borderColor: "border-destructive/30",
    textColor: "text-destructive",
    badge: "destructive" as const,
    label: "Crítico"
  },
  warning: {
    icon: AlertCircle,
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/30",
    textColor: "text-amber-500",
    badge: "outline" as const,
    label: "Atenção"
  },
  info: {
    icon: Info,
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
    textColor: "text-blue-500",
    badge: "secondary" as const,
    label: "Info"
  },
  positive: {
    icon: CheckCircle2,
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/30",
    textColor: "text-green-500",
    badge: "outline" as const,
    label: "Positivo"
  }
};

const ALERT_TYPE_CONFIG: Record<string, { icon: typeof Brain; label: string }> = {
  skill_stagnation: { icon: Target, label: "Skill estagnada" },
  inactivity: { icon: Gamepad2, label: "Inatividade" },
  performance_drop: { icon: TrendingDown, label: "Queda de performance" },
  goal_overdue: { icon: Target, label: "Meta atrasada" },
  positive_streak: { icon: Flame, label: "Streak positivo" },
  training_pending: { icon: GraduationCap, label: "Treinamento pendente" },
  challenge_completed: { icon: Sparkles, label: "Desafio concluído" },
  badge_earned: { icon: Sparkles, label: "Insígnia conquistada" }
};

interface EvolutionAlertsPanelProps {
  maxAlerts?: number;
  showHeader?: boolean;
  compact?: boolean;
}

export function EvolutionAlertsPanel({ 
  maxAlerts = 5, 
  showHeader = true,
  compact = false 
}: EvolutionAlertsPanelProps) {
  const navigate = useNavigate();
  const { 
    unreadAlerts, 
    stats, 
    isLoading, 
    markAsRead, 
    dismissAlert, 
    markAllAsRead,
    triggerDetection,
    isDetecting 
  } = useEvolutionAlerts();
  
  const [expanded, setExpanded] = useState(true);

  // Get alerts to display
  const displayAlerts = unreadAlerts.slice(0, maxAlerts);
  const hasMore = unreadAlerts.length > maxAlerts;

  // Handle action click
  const handleAction = (alert: EvolutionAlert) => {
    markAsRead(alert.id);

    switch (alert.suggested_action_type) {
      case "training":
        navigate("/app/development");
        break;
      case "game":
        navigate("/app/arena");
        break;
      case "pdi":
        navigate("/app/evolution");
        break;
      case "feedback":
        navigate("/app/evolution");
        break;
      case "1on1":
        navigate("/app/evolution");
        break;
      case "view":
        navigate("/app/evolution");
        break;
      default:
        navigate("/app/evolution");
    }
  };

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardContent className="p-4">
          <div className="h-16 bg-muted rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  if (unreadAlerts.length === 0) {
    return null; // Don't show panel if no alerts
  }

  return (
    <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
      {showHeader && (
        <CardHeader className="pb-2 pt-4 px-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Bell className="w-4 h-4 text-primary" />
              Alertas de Evolução
              {stats.unread > 0 && (
                <Badge variant="default" className="ml-1">
                  {stats.unread}
                </Badge>
              )}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => triggerDetection()}
                disabled={isDetecting}
                className="h-8 px-2"
              >
                <RefreshCw className={cn("w-4 h-4", isDetecting && "animate-spin")} />
              </Button>
              {stats.unread > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => markAllAsRead()}
                  className="h-8 px-2 text-xs"
                >
                  Marcar todos
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExpanded(!expanded)}
                className="h-8 w-8 p-0"
              >
                {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </CardHeader>
      )}

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <CardContent className={cn("space-y-2", compact ? "p-2" : "p-4 pt-2")}>
              {displayAlerts.map((alert, index) => (
                <AlertItem
                  key={alert.id}
                  alert={alert}
                  index={index}
                  compact={compact}
                  onAction={() => handleAction(alert)}
                  onDismiss={() => dismissAlert(alert.id)}
                />
              ))}

              {hasMore && (
                <Button
                  variant="ghost"
                  className="w-full h-8 text-xs text-muted-foreground"
                  onClick={() => navigate("/app/evolution")}
                >
                  Ver todos os {unreadAlerts.length} alertas
                  <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              )}
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

function AlertItem({ 
  alert, 
  index, 
  compact,
  onAction, 
  onDismiss 
}: { 
  alert: EvolutionAlert; 
  index: number;
  compact: boolean;
  onAction: () => void; 
  onDismiss: () => void;
}) {
  const config = SEVERITY_CONFIG[alert.severity];
  const typeConfig = ALERT_TYPE_CONFIG[alert.alert_type] || ALERT_TYPE_CONFIG.skill_stagnation;
  const Icon = config.icon;
  const TypeIcon = typeConfig.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        "relative p-3 rounded-lg border transition-colors",
        config.bgColor,
        config.borderColor,
        "hover:bg-muted/50"
      )}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={cn("p-1.5 rounded-lg bg-background/50", config.textColor)}>
          <Icon className="w-4 h-4" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={cn("font-medium text-sm", config.textColor)}>
              {alert.title}
            </span>
            <Badge variant={config.badge} className="text-[10px] px-1.5 py-0">
              <TypeIcon className="w-3 h-3 mr-1" />
              {typeConfig.label}
            </Badge>
          </div>
          
          {!compact && alert.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
              {alert.description}
            </p>
          )}

          <div className="flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground">
              {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true, locale: ptBR })}
            </span>

            {alert.suggested_action && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onAction}
                className={cn("h-6 px-2 text-xs", config.textColor)}
              >
                {alert.suggested_action}
                <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            )}
          </div>
        </div>

        {/* Dismiss button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onDismiss();
          }}
          className="h-6 w-6 p-0 opacity-50 hover:opacity-100"
        >
          <X className="w-3 h-3" />
        </Button>
      </div>
    </motion.div>
  );
}
