/**
 * TrailBadge / InsigniaBadge - Badge visual para insígnias e trilhas
 * 
 * Paleta: Honey & Charcoal - usando cores centralizadas
 */

import { motion } from "framer-motion";
import { Star, Rocket, Shield, Award, Crown, Zap, Target, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { DIFFICULTY_COLORS, getDifficultyColors, type DifficultyKey } from "@/constants/colors";

interface InsigniaBadgeProps {
  icon: string;
  name: string;
  shape?: "star" | "rocket" | "shield" | "hexagon" | "crown" | "bolt" | "target" | "trophy";
  difficulty?: string | null;
  isUnlocked: boolean;
  size?: "sm" | "md" | "lg";
  showGlow?: boolean;
  onClick?: () => void;
}

const sizeClasses = {
  sm: "w-14 h-14 text-lg",
  md: "w-20 h-20 text-2xl",
  lg: "w-28 h-28 text-4xl",
};

const ShapeIcon = ({ shape, className }: { shape: string; className?: string }) => {
  const icons: Record<string, React.ReactNode> = {
    star: <Star className={className} />,
    rocket: <Rocket className={className} />,
    shield: <Shield className={className} />,
    hexagon: <Award className={className} />,
    crown: <Crown className={className} />,
    bolt: <Zap className={className} />,
    target: <Target className={className} />,
    trophy: <Trophy className={className} />,
  };
  return icons[shape] || <Award className={className} />;
};

export function InsigniaBadge({ 
  icon, 
  name, 
  shape = "hexagon",
  difficulty = "beginner", 
  isUnlocked, 
  size = "md",
  showGlow = false,
  onClick 
}: InsigniaBadgeProps) {
  const colors = getDifficultyColors(difficulty || "beginner");
  
  return (
    <motion.div
      className={cn(
        "relative flex flex-col items-center gap-2 cursor-pointer",
        onClick && "hover:scale-105 transition-transform"
      )}
      onClick={onClick}
      whileHover={onClick ? { scale: 1.05 } : undefined}
      whileTap={onClick ? { scale: 0.95 } : undefined}
    >
      {/* Forma da Insígnia */}
      <div
        className={cn(
          "relative flex items-center justify-center",
          sizeClasses[size],
          "border-2 transition-all duration-300",
          shape === "target" ? "rounded-full" : 
          shape === "shield" ? "rounded-t-lg rounded-b-[40%]" :
          shape === "rocket" ? "rounded-t-full rounded-b-lg" :
          shape === "crown" ? "rounded-t-2xl rounded-b-lg" :
          shape === "star" ? "rounded-xl rotate-[15deg]" :
          "rounded-xl",
          isUnlocked 
            ? cn(
                "bg-gradient-to-br",
                colors.gradient,
                colors.border,
                showGlow && colors.glow
              )
            : "bg-muted/50 border-muted-foreground/30 grayscale"
        )}
      >
        {/* Ícone da Forma no canto */}
        <div className={cn(
          "absolute -top-1 -right-1 p-1 rounded-full",
          isUnlocked ? "bg-background shadow-sm" : "bg-muted"
        )}>
          <ShapeIcon 
            shape={shape} 
            className={cn(
              "w-3 h-3",
              isUnlocked ? "text-foreground" : "text-muted-foreground"
            )} 
          />
        </div>

        {/* Ícone Principal */}
        <span className={cn(
          "z-10",
          shape === "star" && "-rotate-[15deg]",
          !isUnlocked && "opacity-50"
        )}>
          {icon}
        </span>

        {/* Lock overlay */}
        {!isUnlocked && (
          <div className={cn(
            "absolute inset-0 flex items-center justify-center bg-background/60",
            shape === "target" ? "rounded-full" : 
            shape === "shield" ? "rounded-t-lg rounded-b-[40%]" :
            "rounded-xl"
          )}>
            <span className="text-muted-foreground">🔒</span>
          </div>
        )}

        {/* Glow animation for recently unlocked */}
        {isUnlocked && showGlow && (
          <motion.div
            className={cn(
              "absolute inset-0",
              shape === "target" ? "rounded-full" : 
              shape === "shield" ? "rounded-t-lg rounded-b-[40%]" :
              "rounded-xl",
              "bg-gradient-to-br",
              colors.gradient,
              "opacity-50"
            )}
            animate={{
              scale: [1, 1.15, 1],
              opacity: [0.5, 0.2, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        )}
      </div>

      {/* Nome da Insígnia */}
      {size !== "sm" && (
        <span className={cn(
          "text-xs font-medium text-center max-w-24 line-clamp-2",
          isUnlocked ? "text-foreground" : "text-muted-foreground"
        )}>
          {name}
        </span>
      )}
    </motion.div>
  );
}

// Alias para compatibilidade
export const TrailBadge = InsigniaBadge;
