/**
 * RewardBadge - Badge visual para exibir recompensas
 * Variantes: preview (antes), earned (ganhou), missed (não atingiu)
 */

import { cn } from "@/lib/utils";
import { Sparkles, Coins, Target, Check, X } from "lucide-react";
import { motion } from "framer-motion";

interface RewardBadgeProps {
  xp?: number;
  coins?: number;
  condition?: string;
  targetPercent?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'preview' | 'earned' | 'missed';
  showCondition?: boolean;
  className?: string;
}

export function RewardBadge({
  xp = 0,
  coins = 0,
  condition,
  targetPercent,
  size = 'md',
  variant = 'preview',
  showCondition = true,
  className
}: RewardBadgeProps) {
  const sizeClasses = {
    sm: 'text-xs gap-1 px-2 py-0.5',
    md: 'text-sm gap-1.5 px-3 py-1',
    lg: 'text-base gap-2 px-4 py-1.5'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  const variantStyles = {
    preview: 'bg-primary/10 text-primary border-primary/20',
    earned: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/30',
    missed: 'bg-muted text-muted-foreground border-border'
  };

  const hasReward = xp > 0 || coins > 0;

  if (!hasReward && !condition) return null;

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      {/* Recompensa principal */}
      {hasReward && (
        <motion.div
          initial={variant === 'earned' ? { scale: 0.8, opacity: 0 } : false}
          animate={variant === 'earned' ? { scale: 1, opacity: 1 } : {}}
          className={cn(
            "inline-flex items-center rounded-full border font-medium",
            sizeClasses[size],
            variantStyles[variant]
          )}
        >
          {variant === 'earned' && (
            <Check className={cn(iconSizes[size], "text-green-500")} />
          )}
          {variant === 'missed' && (
            <X className={cn(iconSizes[size], "text-muted-foreground")} />
          )}
          
          {xp > 0 && (
            <span className="inline-flex items-center gap-0.5">
              <Sparkles className={iconSizes[size]} />
              <span>{variant === 'missed' ? '0' : `+${xp}`}</span>
              <span className="opacity-70">XP</span>
            </span>
          )}
          
          {xp > 0 && coins > 0 && (
            <span className="opacity-50">•</span>
          )}
          
          {coins > 0 && (
            <span className="inline-flex items-center gap-0.5">
              <Coins className={iconSizes[size]} />
              <span>{variant === 'missed' ? '0' : `+${coins}`}</span>
            </span>
          )}
        </motion.div>
      )}

      {/* Condição */}
      {showCondition && condition && (
        <div className={cn(
          "inline-flex items-center gap-1 text-muted-foreground",
          size === 'sm' ? 'text-[10px]' : size === 'md' ? 'text-xs' : 'text-sm'
        )}>
          <Target className={cn(
            size === 'sm' ? 'w-2.5 h-2.5' : size === 'md' ? 'w-3 h-3' : 'w-3.5 h-3.5'
          )} />
          <span>Meta: {condition}</span>
        </div>
      )}
    </div>
  );
}

/**
 * RewardPreviewCard - Card maior para exibir preview de recompensa
 */
interface RewardPreviewCardProps {
  baseXp: number;
  baseCoins?: number;
  bonusXp?: number;
  bonusCoins?: number;
  hasCondition: boolean;
  conditionText?: string;
  targetPercent?: number;
  className?: string;
}

export function RewardPreviewCard({
  baseXp,
  baseCoins = 0,
  bonusXp,
  bonusCoins,
  hasCondition,
  conditionText,
  targetPercent,
  className
}: RewardPreviewCardProps) {
  const totalXp = baseXp + (bonusXp || 0);
  const totalCoins = baseCoins + (bonusCoins || 0);

  return (
    <div className={cn(
      "rounded-xl border bg-card p-4 space-y-3",
      className
    )}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">Recompensa</span>
        {hasCondition && (
          <span className="text-xs bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full">
            Condicional
          </span>
        )}
      </div>

      <div className="flex items-center gap-4">
        {/* XP */}
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div>
            <div className="text-xl font-bold">+{totalXp}</div>
            <div className="text-xs text-muted-foreground">XP</div>
          </div>
        </div>

        {/* Coins */}
        {totalCoins > 0 && (
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Coins className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <div className="text-xl font-bold">+{totalCoins}</div>
              <div className="text-xs text-muted-foreground">Moedas</div>
            </div>
          </div>
        )}
      </div>

      {/* Condição */}
      {hasCondition && conditionText && (
        <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
          <Target className="w-4 h-4 text-amber-500" />
          <span className="text-sm">
            Para ganhar: <strong>{conditionText}</strong>
          </span>
        </div>
      )}

      {/* Breakdown se tiver bônus */}
      {bonusXp && bonusXp > 0 && (
        <div className="text-xs text-muted-foreground pt-2 border-t">
          Base: {baseXp} XP {baseCoins > 0 && `+ ${baseCoins} moedas`}
          {' • '}
          Bônus: +{bonusXp} XP {bonusCoins && bonusCoins > 0 && `+ ${bonusCoins} moedas`}
        </div>
      )}
    </div>
  );
}

/**
 * RewardResultCard - Card para exibir resultado após completar
 */
interface RewardResultCardProps {
  xpEarned: number;
  coinsEarned: number;
  targetMet: boolean;
  performanceScore?: number;
  targetScore?: number;
  bonusApplied?: boolean;
  className?: string;
}

export function RewardResultCard({
  xpEarned,
  coinsEarned,
  targetMet,
  performanceScore,
  targetScore,
  bonusApplied,
  className
}: RewardResultCardProps) {
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={cn(
        "rounded-xl border p-6 text-center space-y-4",
        targetMet 
          ? "bg-gradient-to-br from-green-500/10 to-emerald-500/5 border-green-500/30" 
          : "bg-muted/50",
        className
      )}
    >
      {/* Ícone de status */}
      <div className={cn(
        "w-16 h-16 mx-auto rounded-full flex items-center justify-center",
        targetMet ? "bg-green-500/20" : "bg-muted"
      )}>
        {targetMet ? (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
          >
            <Check className="w-8 h-8 text-green-500" />
          </motion.div>
        ) : (
          <Target className="w-8 h-8 text-muted-foreground" />
        )}
      </div>

      {/* Título */}
      <div>
        <h3 className={cn(
          "text-lg font-bold",
          targetMet ? "text-green-600 dark:text-green-400" : "text-muted-foreground"
        )}>
          {targetMet ? (bonusApplied ? "Meta Atingida! 🎯" : "Concluído!") : "Meta Não Atingida"}
        </h3>
        
        {performanceScore !== undefined && targetScore !== undefined && (
          <p className="text-sm text-muted-foreground mt-1">
            Você fez {performanceScore.toFixed(0)}% 
            {!targetMet && ` (meta: ${targetScore.toFixed(0)}%)`}
          </p>
        )}
      </div>

      {/* Recompensas */}
      <div className="flex items-center justify-center gap-6">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center"
        >
          <div className={cn(
            "text-3xl font-bold",
            targetMet ? "text-primary" : "text-muted-foreground"
          )}>
            +{xpEarned}
          </div>
          <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
            <Sparkles className="w-3 h-3" />
            XP
          </div>
        </motion.div>

        {coinsEarned > 0 && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center"
          >
            <div className={cn(
              "text-3xl font-bold",
              targetMet ? "text-amber-500" : "text-muted-foreground"
            )}>
              +{coinsEarned}
            </div>
            <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              <Coins className="w-3 h-3" />
              Moedas
            </div>
          </motion.div>
        )}
      </div>

      {/* Call to action se não atingiu */}
      {!targetMet && (
        <p className="text-sm text-muted-foreground">
          💪 Tente novamente para ganhar a recompensa!
        </p>
      )}
    </motion.div>
  );
}
