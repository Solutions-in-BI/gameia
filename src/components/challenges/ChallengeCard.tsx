/**
 * ChallengeCard - Card visual para desafios
 * Mostra progresso, participantes, torcida e multiplicador
 */

import { motion } from "framer-motion";
import {
  Users,
  Trophy,
  Target,
  Flame,
  TrendingUp,
  Gamepad2,
  Zap,
  Award,
  Calendar,
  Crown,
  Sparkles,
  Heart,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Challenge } from "@/hooks/useChallenges";

const ICON_MAP: Record<string, typeof Trophy> = {
  trophy: Trophy,
  target: Target,
  "trending-up": TrendingUp,
  award: Award,
  flame: Flame,
  "gamepad-2": Gamepad2,
  zap: Zap,
  users: Users,
};

const SCOPE_LABELS: Record<string, { label: string; color: string }> = {
  personal: { label: "Pessoal", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  team: { label: "Equipe", color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
  global: { label: "Global", color: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
};

interface ChallengeCardProps {
  challenge: Challenge;
  variant?: "default" | "compact" | "featured";
  onJoin?: () => void;
  onLeave?: () => void;
  onSupport?: () => void;
  onView?: () => void;
  showActions?: boolean;
}

export function ChallengeCard({
  challenge,
  variant = "default",
  onJoin,
  onLeave,
  onSupport,
  onView,
  showActions = true,
}: ChallengeCardProps) {
  const Icon = ICON_MAP[challenge.icon] || Target;
  const scopeStyle = SCOPE_LABELS[challenge.scope] || SCOPE_LABELS.personal;
  
  const progress = challenge.target_value > 0
    ? Math.round((challenge.current_value / challenge.target_value) * 100)
    : 0;
  
  const isComplete = progress >= 100;
  const hasMultiplier = challenge.supporter_multiplier > 1;

  if (variant === "compact") {
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onView}
        className={cn(
          "p-3 rounded-lg border cursor-pointer transition-all",
          isComplete 
            ? "border-green-500/30 bg-green-500/5" 
            : "border-border/30 bg-muted/20 hover:bg-muted/40"
        )}
      >
        <div className="flex items-center gap-3">
          <div className={cn(
            "p-2 rounded-lg shrink-0",
            isComplete ? "bg-green-500/20 text-green-400" : "bg-primary/10 text-primary"
          )}>
            <Icon className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{challenge.name}</p>
            <div className="flex items-center gap-2 mt-1">
              <Progress value={progress} className="h-1.5 flex-1" />
              <span className="text-xs text-muted-foreground">{progress}%</span>
            </div>
          </div>
          {hasMultiplier && (
            <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-400 border-amber-500/30">
              {challenge.supporter_multiplier.toFixed(1)}x
            </Badge>
          )}
        </div>
      </motion.div>
    );
  }

  if (variant === "featured") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "relative p-5 rounded-xl border-2 overflow-hidden",
          "bg-gradient-to-br from-primary/10 via-background to-amber-500/5",
          "border-primary/30"
        )}
      >
        {/* Featured badge */}
        <div className="absolute top-3 right-3">
          <Badge className="bg-amber-500 text-black gap-1">
            <Crown className="w-3 h-3" />
            Destaque
          </Badge>
        </div>

        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-primary/20 text-primary">
            <Icon className="w-6 h-6" />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-lg">{challenge.name}</h3>
              <Badge variant="outline" className={cn("text-xs", scopeStyle.color)}>
                {scopeStyle.label}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-3">{challenge.description}</p>

            {/* Stats row */}
            <div className="flex items-center gap-4 text-sm mb-3">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Users className="w-4 h-4" />
                <span>{challenge.participants_count || 0}</span>
              </div>
              <div className="flex items-center gap-1.5 text-amber-400">
                <Heart className="w-4 h-4" />
                <span>{challenge.supporters_count}</span>
              </div>
              {hasMultiplier && (
                <div className="flex items-center gap-1.5 text-green-400">
                  <Sparkles className="w-4 h-4" />
                  <span>{challenge.supporter_multiplier.toFixed(1)}x</span>
                </div>
              )}
            </div>

            {/* Progress */}
            <div className="flex items-center gap-3">
              <Progress value={progress} className="h-2.5 flex-1" />
              <span className="text-sm font-medium">{progress}%</span>
            </div>

            {/* Rewards */}
            <div className="flex items-center gap-3 mt-3">
              <span className="text-sm text-primary font-medium">
                +{Math.floor(challenge.xp_reward * challenge.supporter_multiplier)} XP
              </span>
              <span className="text-sm text-amber-400 font-medium">
                +{Math.floor(challenge.coins_reward * challenge.supporter_multiplier)} 🪙
              </span>
              {challenge.total_staked > 0 && (
                <span className="text-sm text-muted-foreground">
                  Pool: {challenge.total_staked} 🪙
                </span>
              )}
            </div>

            {/* Actions */}
            {showActions && (
              <div className="flex items-center gap-2 mt-4">
                {!challenge.is_participating ? (
                  <Button onClick={onJoin} size="sm">
                    Participar
                  </Button>
                ) : (
                  <Button onClick={onLeave} size="sm" variant="outline">
                    Sair
                  </Button>
                )}
                {!challenge.is_supporting && (
                  <Button onClick={onSupport} size="sm" variant="secondary">
                    <Heart className="w-3 h-3 mr-1" />
                    Apoiar
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  // Default variant
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      onClick={onView}
      className={cn(
        "p-4 rounded-xl border cursor-pointer transition-all",
        isComplete 
          ? "border-green-500/30 bg-green-500/5" 
          : "border-border/30 bg-muted/20 hover:border-primary/30"
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn(
          "p-2.5 rounded-lg shrink-0",
          isComplete ? "bg-green-500/20 text-green-400" : "bg-primary/10 text-primary"
        )}>
          <Icon className="w-5 h-5" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <h4 className="font-medium truncate">{challenge.name}</h4>
            <Badge variant="outline" className={cn("text-xs shrink-0", scopeStyle.color)}>
              {scopeStyle.label}
            </Badge>
          </div>
          
          <p className="text-xs text-muted-foreground mb-2 line-clamp-1">
            {challenge.description}
          </p>

          {/* Progress bar */}
          <div className="flex items-center gap-2 mb-2">
            <Progress value={progress} className="h-2 flex-1" />
            <span className="text-xs font-medium text-muted-foreground">
              {challenge.current_value}/{challenge.target_value}
            </span>
          </div>

          {/* Footer stats */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                <span>{challenge.participants_count || 0}</span>
              </div>
              {challenge.supporters_count > 0 && (
                <div className="flex items-center gap-1 text-amber-400">
                  <Heart className="w-3 h-3" />
                  <span>{challenge.supporters_count}</span>
                </div>
              )}
              {hasMultiplier && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 bg-green-500/10 text-green-400 border-green-500/30">
                  {challenge.supporter_multiplier.toFixed(1)}x
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-2 text-xs">
              <span className="text-primary">+{challenge.xp_reward} XP</span>
              <span className="text-amber-400">+{challenge.coins_reward} 🪙</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
