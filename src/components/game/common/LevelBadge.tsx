/**
 * LevelBadge - Exibe o nível do jogador com estilo visual
 */

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { getLevelTier, LEVEL_COLORS, getLevelInfo } from "@/constants/levels";

interface LevelBadgeProps {
  level: number;
  xp?: number;
  size?: "sm" | "md" | "lg";
  showProgress?: boolean;
  showTitle?: boolean;
  className?: string;
}

export function LevelBadge({ 
  level, 
  xp = 0, 
  size = "md", 
  showProgress = false,
  showTitle = false,
  className 
}: LevelBadgeProps) {
  const tier = getLevelTier(level);
  const colors = LEVEL_COLORS[tier];
  const info = getLevelInfo(level, xp);
  const progress = xp > 0 ? ((xp % 100) / 100) * 100 : 0;

  const sizeClasses = {
    sm: "w-6 h-6 text-xs",
    md: "w-8 h-8 text-sm",
    lg: "w-12 h-12 text-lg",
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Badge circular */}
      <motion.div
        className={cn(
          "relative rounded-full flex items-center justify-center font-bold",
          sizeClasses[size],
          colors.bgColor,
          colors.color,
          tier === "legendary" && "shadow-lg",
          tier === "legendary" && colors.glowColor
        )}
        whileHover={{ scale: 1.1 }}
        transition={{ type: "spring", stiffness: 400 }}
      >
        {/* Anel de progresso */}
        {showProgress && (
          <svg 
            className="absolute inset-0 w-full h-full -rotate-90"
            viewBox="0 0 36 36"
          >
            <path
              className="stroke-current opacity-20"
              fill="none"
              strokeWidth="3"
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <motion.path
              className={cn("stroke-current", colors.color)}
              fill="none"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={`${progress}, 100`}
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
              initial={{ strokeDasharray: "0, 100" }}
              animate={{ strokeDasharray: `${progress}, 100` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </svg>
        )}
        
        {/* Número do nível */}
        <span className="relative z-10">{level}</span>
        
        {/* Efeito brilhante para níveis altos */}
        {tier === "legendary" && (
          <motion.div
            className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-400/0 via-yellow-300/50 to-orange-400/0"
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          />
        )}
      </motion.div>

      {/* Título do nível */}
      {showTitle && (
        <div className="flex flex-col">
          <span className={cn("text-xs font-medium", colors.color)}>
            {info.icon} {info.title}
          </span>
          {showProgress && (
            <span className="text-[10px] text-muted-foreground">
              {xp % 100}/100 XP
            </span>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * LevelProgressBar - Barra de progresso do nível
 */
interface LevelProgressBarProps {
  level: number;
  xp: number;
  className?: string;
}

export function LevelProgressBar({ level, xp, className }: LevelProgressBarProps) {
  const tier = getLevelTier(level);
  const colors = LEVEL_COLORS[tier];
  const progress = (xp % 100);
  const nextLevelXP = level * 100;

  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">Nível {level}</span>
        <span className={colors.color}>{xp} / {nextLevelXP} XP</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          className={cn("h-full rounded-full", colors.bgColor.replace("/20", ""))}
          style={{ 
            background: tier === "legendary" 
              ? "linear-gradient(90deg, #f59e0b, #ef4444, #f59e0b)" 
              : undefined 
          }}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
