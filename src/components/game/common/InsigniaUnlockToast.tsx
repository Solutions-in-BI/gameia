/**
 * InsigniaUnlockToast - Toast animado para desbloqueio de insígnias
 */

import { motion, AnimatePresence } from "framer-motion";
import { Star, Award, Crown, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { InsigniaType, INSIGNIA_TYPE_CONFIG } from "@/types/insignias";
import confetti from "canvas-confetti";
import { useEffect } from "react";

interface UnlockedInsignia {
  id: string;
  name: string;
  icon: string;
  description: string | null;
  insignia_type: InsigniaType;
  star_level: number;
  xp_reward: number;
  coins_reward: number;
}

interface InsigniaUnlockToastProps {
  insignia: UnlockedInsignia | null;
  isVisible: boolean;
  onClose: () => void;
  autoCloseDelay?: number;
}

const TYPE_COLORS: Record<InsigniaType, string> = {
  skill: "from-blue-500/90 to-blue-600/90",
  behavior: "from-rose-500/90 to-rose-600/90",
  impact: "from-amber-500/90 to-amber-600/90",
  leadership: "from-purple-500/90 to-purple-600/90",
  special: "from-emerald-500/90 to-emerald-600/90",
};

const TYPE_BORDER_COLORS: Record<InsigniaType, string> = {
  skill: "border-blue-400/50",
  behavior: "border-rose-400/50",
  impact: "border-amber-400/50",
  leadership: "border-purple-400/50",
  special: "border-emerald-400/50",
};

export function InsigniaUnlockToast({
  insignia,
  isVisible,
  onClose,
  autoCloseDelay = 5000,
}: InsigniaUnlockToastProps) {
  // Confetti effect
  useEffect(() => {
    if (isVisible && insignia) {
      // Fire confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.8, x: 0.9 },
        colors: ["#FFD700", "#FFA500", "#FF6347", "#9370DB", "#00CED1"],
      });

      // Auto close
      const timer = setTimeout(onClose, autoCloseDelay);
      return () => clearTimeout(timer);
    }
  }, [isVisible, insignia, onClose, autoCloseDelay]);

  if (!insignia) return null;

  const typeConfig = INSIGNIA_TYPE_CONFIG[insignia.insignia_type];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 100, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.8 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 25,
          }}
          className={cn(
            "fixed bottom-6 right-6 z-50",
            "bg-gradient-to-r backdrop-blur-sm border rounded-2xl p-5 shadow-2xl",
            "min-w-[320px] max-w-[400px]",
            TYPE_COLORS[insignia.insignia_type],
            TYPE_BORDER_COLORS[insignia.insignia_type]
          )}
        >
          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 h-6 w-6 text-white/70 hover:text-white hover:bg-white/10"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </Button>

          {/* Glow effect */}
          <div className="absolute inset-0 rounded-2xl bg-white/10 blur-xl -z-10" />

          {/* Content */}
          <div className="flex gap-4">
            {/* Icon with animation */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 15,
                delay: 0.2,
              }}
              className="relative"
            >
              <div className="text-5xl relative z-10">{insignia.icon}</div>
              {/* Glow behind icon */}
              <div className="absolute inset-0 blur-lg opacity-50 text-5xl">
                {insignia.icon}
              </div>
              {/* Stars for star level */}
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                {[1, 2, 3].map((level) => (
                  <motion.div
                    key={level}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{
                      opacity: level <= insignia.star_level ? 1 : 0.3,
                      scale: 1,
                    }}
                    transition={{ delay: 0.4 + level * 0.1 }}
                  >
                    <Star
                      className={cn(
                        "w-3 h-3",
                        level <= insignia.star_level
                          ? "text-yellow-300 fill-yellow-300"
                          : "text-white/30"
                      )}
                    />
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Text content */}
            <div className="flex-1 min-w-0">
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="text-xs text-white/80 uppercase tracking-wider font-semibold flex items-center gap-1"
              >
                <Award className="w-3 h-3" />
                Insígnia Conquistada!
              </motion.p>
              
              <motion.h3
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="text-lg font-bold text-white mt-1"
              >
                {insignia.name}
              </motion.h3>
              
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="text-sm text-white/80 line-clamp-2 mt-0.5"
              >
                {insignia.description}
              </motion.p>

              {/* Rewards */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex items-center gap-3 mt-3"
              >
                <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-white/20 text-xs font-medium text-white">
                  <Sparkles className="w-3 h-3" />
                  +{insignia.xp_reward} XP
                </div>
                <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-white/20 text-xs font-medium text-white">
                  <span>🪙</span>
                  +{insignia.coins_reward}
                </div>
                <div 
                  className="px-2 py-1 rounded-full text-xs font-medium"
                  style={{ 
                    backgroundColor: `${typeConfig.color}40`,
                    color: "white",
                  }}
                >
                  {typeConfig.label}
                </div>
              </motion.div>
            </div>
          </div>

          {/* Shimmer effect */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: "200%" }}
            transition={{
              repeat: Infinity,
              repeatDelay: 2,
              duration: 1.5,
              ease: "easeInOut",
            }}
            className="absolute inset-0 w-1/3 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 pointer-events-none"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Export hook for using the toast
import { useState, useCallback } from "react";

export function useInsigniaUnlockToast() {
  const [currentInsignia, setCurrentInsignia] = useState<UnlockedInsignia | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const showUnlock = useCallback((insignia: UnlockedInsignia) => {
    setCurrentInsignia(insignia);
    setIsVisible(true);
  }, []);

  const hideUnlock = useCallback(() => {
    setIsVisible(false);
    // Clear insignia after animation
    setTimeout(() => setCurrentInsignia(null), 300);
  }, []);

  const ToastComponent = (
    <InsigniaUnlockToast
      insignia={currentInsignia}
      isVisible={isVisible}
      onClose={hideUnlock}
    />
  );

  return {
    showUnlock,
    hideUnlock,
    ToastComponent,
    isVisible,
  };
}
