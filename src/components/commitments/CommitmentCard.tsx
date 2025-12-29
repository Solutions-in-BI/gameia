/**
 * CommitmentCard - Card premium para exibição de compromissos
 * Mostra escopo, fonte, progresso, recompensas e tempo restante
 */

import { motion } from "framer-motion";
import { 
  Users, 
  Globe, 
  Zap, 
  FileEdit, 
  Coins, 
  Star, 
  Clock, 
  ChevronRight,
  CheckCircle2,
  XCircle,
  Pause
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Commitment } from "@/hooks/useCommitments";
import { differenceInDays, differenceInHours, format, isPast } from "date-fns";
import { ptBR } from "date-fns/locale";

interface CommitmentCardProps {
  commitment: Commitment;
  onClick?: () => void;
  variant?: "default" | "compact";
}

export function CommitmentCard({ commitment, onClick, variant = "default" }: CommitmentCardProps) {
  const progress = commitment.target_value > 0 
    ? Math.min((commitment.current_value / commitment.target_value) * 100, 100) 
    : 0;

  const isEnded = isPast(new Date(commitment.ends_at));
  const daysRemaining = differenceInDays(new Date(commitment.ends_at), new Date());
  const hoursRemaining = differenceInHours(new Date(commitment.ends_at), new Date());

  const getTimeRemaining = () => {
    if (isEnded) return "Encerrado";
    if (daysRemaining > 0) return `${daysRemaining} dia${daysRemaining > 1 ? "s" : ""}`;
    if (hoursRemaining > 0) return `${hoursRemaining}h restantes`;
    return "Últimas horas";
  };

  const getStatusBadge = () => {
    switch (commitment.status) {
      case "completed":
        return (
          <Badge className="bg-gameia-success/20 text-gameia-success border-gameia-success/30">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Concluído
          </Badge>
        );
      case "failed":
        return (
          <Badge variant="outline" className="text-muted-foreground">
            <XCircle className="w-3 h-3 mr-1" />
            Não atingido
          </Badge>
        );
      case "cancelled":
        return (
          <Badge variant="outline" className="text-muted-foreground">
            <Pause className="w-3 h-3 mr-1" />
            Cancelado
          </Badge>
        );
      default:
        return null;
    }
  };

  if (variant === "compact") {
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className={cn(
          "p-4 rounded-xl border border-border/50 bg-card/50 cursor-pointer",
          "hover:border-primary/30 hover:bg-card transition-all",
          commitment.status === "active" && "border-primary/20"
        )}
      >
        <div className="flex items-center gap-3">
          <div className={cn(
            "p-2 rounded-lg",
            commitment.scope === "global" ? "bg-primary/10" : "bg-secondary/50"
          )}>
            {commitment.scope === "global" ? (
              <Globe className="w-4 h-4 text-primary" />
            ) : (
              <Users className="w-4 h-4 text-muted-foreground" />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-foreground truncate">{commitment.name}</h4>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{Math.round(progress)}%</span>
              <span>•</span>
              <Clock className="w-3 h-3" />
              <span>{getTimeRemaining()}</span>
            </div>
          </div>

          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </div>

        <Progress value={progress} className="h-1.5 mt-3" />
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={{ y: -2 }}
      onClick={onClick}
      className={cn(
        "p-5 rounded-2xl border border-border/50 bg-card cursor-pointer group",
        "hover:border-primary/30 hover:shadow-lg transition-all duration-300",
        commitment.status === "active" && "border-primary/20 bg-gradient-to-br from-card to-primary/5"
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Scope Badge */}
          <Badge 
            variant="outline" 
            className={cn(
              "text-xs",
              commitment.scope === "global" 
                ? "border-primary/30 text-primary bg-primary/5" 
                : "border-secondary text-secondary-foreground bg-secondary/30"
            )}
          >
            {commitment.scope === "global" ? (
              <>
                <Globe className="w-3 h-3 mr-1" />
                Global
              </>
            ) : (
              <>
                <Users className="w-3 h-3 mr-1" />
                {commitment.team?.name || "Equipe"}
              </>
            )}
          </Badge>

          {/* Source Badge */}
          <Badge 
            variant="outline" 
            className="text-xs border-muted text-muted-foreground"
          >
            {commitment.source === "internal" ? (
              <>
                <Zap className="w-3 h-3 mr-1" />
                Automático
              </>
            ) : (
              <>
                <FileEdit className="w-3 h-3 mr-1" />
                Manual
              </>
            )}
          </Badge>

          {getStatusBadge()}
        </div>

        {/* Time remaining */}
        {commitment.status === "active" && (
          <div className={cn(
            "flex items-center gap-1 text-xs px-2 py-1 rounded-full",
            daysRemaining <= 3 ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground"
          )}>
            <Clock className="w-3 h-3" />
            {getTimeRemaining()}
          </div>
        )}
      </div>

      {/* Title & Description */}
      <h3 className="text-lg font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
        {commitment.name}
      </h3>
      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
        {commitment.description}
      </p>

      {/* Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-muted-foreground">Progresso</span>
          <span className="font-medium text-foreground">
            {commitment.current_value.toLocaleString()} / {commitment.target_value.toLocaleString()}
          </span>
        </div>
        <Progress value={progress} className="h-2" />
        <p className="text-xs text-muted-foreground mt-1">
          {commitment.success_criteria}
        </p>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-border/30">
        {/* Rewards */}
        <div className="flex items-center gap-3">
          {(commitment.reward_type === "coins" || commitment.reward_type === "both") && commitment.coins_reward > 0 && (
            <div className="flex items-center gap-1 text-sm">
              <Coins className="w-4 h-4 text-gameia-coins" />
              <span className="font-medium text-foreground">{commitment.coins_reward}</span>
            </div>
          )}
          {(commitment.reward_type === "xp" || commitment.reward_type === "both") && commitment.xp_reward > 0 && (
            <div className="flex items-center gap-1 text-sm">
              <Star className="w-4 h-4 text-primary" />
              <span className="font-medium text-foreground">{commitment.xp_reward} XP</span>
            </div>
          )}
        </div>

        {/* Participants */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Users className="w-3.5 h-3.5" />
            <span>{commitment.participants_count || 0}</span>
          </div>

          {commitment.is_participating && (
            <Badge variant="secondary" className="text-xs">
              Participando
            </Badge>
          )}
        </div>
      </div>
    </motion.div>
  );
}
