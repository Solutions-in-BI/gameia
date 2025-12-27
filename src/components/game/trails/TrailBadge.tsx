import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface TrailBadgeProps {
  icon: string;
  name: string;
  difficulty?: string | null;
  isUnlocked: boolean;
  size?: "sm" | "md" | "lg";
  showGlow?: boolean;
  onClick?: () => void;
}

const difficultyColors: Record<string, { bg: string; border: string; glow: string }> = {
  beginner: { 
    bg: "from-emerald-500 to-emerald-600", 
    border: "border-emerald-400",
    glow: "shadow-emerald-500/50"
  },
  intermediate: { 
    bg: "from-violet-500 to-purple-600", 
    border: "border-violet-400",
    glow: "shadow-violet-500/50"
  },
  advanced: { 
    bg: "from-amber-500 to-orange-600", 
    border: "border-amber-400",
    glow: "shadow-amber-500/50"
  },
  expert: { 
    bg: "from-rose-500 to-red-600", 
    border: "border-rose-400",
    glow: "shadow-rose-500/50"
  },
};

const sizeClasses = {
  sm: "w-12 h-12 text-lg",
  md: "w-16 h-16 text-2xl",
  lg: "w-24 h-24 text-4xl",
};

export function TrailBadge({ 
  icon, 
  name, 
  difficulty = "beginner", 
  isUnlocked, 
  size = "md",
  showGlow = false,
  onClick 
}: TrailBadgeProps) {
  const colors = difficultyColors[difficulty || "beginner"];
  
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
      {/* Badge Hexagonal */}
      <div
        className={cn(
          "relative flex items-center justify-center",
          sizeClasses[size],
          "rounded-xl border-2 transition-all duration-300",
          isUnlocked 
            ? cn(
                "bg-gradient-to-br",
                colors.bg,
                colors.border,
                showGlow && cn("shadow-lg", colors.glow)
              )
            : "bg-muted/50 border-muted-foreground/30 grayscale"
        )}
      >
        {/* Ícone */}
        <span className={cn(
          "z-10",
          !isUnlocked && "opacity-50"
        )}>
          {icon}
        </span>

        {/* Lock overlay */}
        {!isUnlocked && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/60 rounded-xl">
            <span className="text-muted-foreground">🔒</span>
          </div>
        )}

        {/* Glow animation for recently unlocked */}
        {isUnlocked && showGlow && (
          <motion.div
            className={cn(
              "absolute inset-0 rounded-xl",
              "bg-gradient-to-br",
              colors.bg,
              "opacity-50"
            )}
            animate={{
              scale: [1, 1.2, 1],
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

      {/* Nome do Badge */}
      {size !== "sm" && (
        <span className={cn(
          "text-xs font-medium text-center max-w-20 line-clamp-2",
          isUnlocked ? "text-foreground" : "text-muted-foreground"
        )}>
          {name}
        </span>
      )}
    </motion.div>
  );
}
