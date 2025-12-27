/**
 * StreakModal - Modal de streak diário
 * Aparece 1x ao dia para mostrar recompensas de streak
 */

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Gift, Zap, X, Coins, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

// Recompensas por dia de streak
const STREAK_REWARDS = [
  { day: 1, coins: 10, xp: 5 },
  { day: 2, coins: 15, xp: 10 },
  { day: 3, coins: 25, xp: 15 },
  { day: 4, coins: 35, xp: 20 },
  { day: 5, coins: 50, xp: 30 },
  { day: 6, coins: 75, xp: 40 },
  { day: 7, coins: 100, xp: 50, bonus: "🎁 Bônus Semanal!" },
];

interface StreakModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStreak: number;
  longestStreak: number;
  canClaim: boolean;
  isAtRisk: boolean;
  onClaim: () => Promise<boolean>;
}

export function StreakModal({
  isOpen,
  onClose,
  currentStreak,
  longestStreak,
  canClaim,
  isAtRisk,
  onClaim,
}: StreakModalProps) {
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimed, setClaimed] = useState(false);

  const todayRewardIndex = Math.min(currentStreak, 6);
  const todayReward = STREAK_REWARDS[todayRewardIndex];

  const handleClaim = async () => {
    if (isClaiming || !canClaim) return;
    setIsClaiming(true);
    const success = await onClaim();
    if (success) {
      setClaimed(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    }
    setIsClaiming(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-gradient-to-br from-orange-950/90 via-background to-red-950/90 border-orange-500/30">
        <DialogTitle className="sr-only">Streak Diário</DialogTitle>
        
        {/* Background glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-red-500/20 pointer-events-none" />
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 p-1 rounded-lg bg-background/50 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="relative p-6 space-y-6">
          {/* Header with flame */}
          <div className="text-center space-y-2">
            <motion.div
              className="inline-flex"
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, -10, 10, 0],
              }}
              transition={{ duration: 1, repeat: Infinity, repeatDelay: 1 }}
            >
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-2xl shadow-orange-500/50">
                <Flame className="w-10 h-10 text-white" />
              </div>
            </motion.div>
            
            <h2 className="text-2xl font-bold text-foreground font-display">
              Streak Diário
            </h2>
            <p className="text-muted-foreground text-sm">
              Jogue todos os dias para ganhar bônus!
            </p>
          </div>

          {/* Streak counter */}
          <div className="flex items-center justify-center gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                {currentStreak}
              </div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide">
                Dias
              </div>
            </div>
            
            <div className="h-12 w-px bg-border/50" />
            
            <div className="text-center">
              <div className="text-2xl font-bold text-muted-foreground">
                {longestStreak}
              </div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide">
                Recorde
              </div>
            </div>
          </div>

          {/* Weekly progress */}
          <div className="grid grid-cols-7 gap-2">
            {STREAK_REWARDS.map((reward, index) => {
              const isCompleted = index < currentStreak;
              const isCurrent = index === currentStreak;
              const isBonus = index === 6;

              return (
                <motion.div
                  key={index}
                  className={cn(
                    "relative aspect-square rounded-xl flex flex-col items-center justify-center text-xs font-bold transition-all",
                    isCompleted
                      ? "bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/30"
                      : isCurrent && canClaim
                        ? "bg-orange-500/20 border-2 border-orange-500 text-orange-400"
                        : "bg-muted/30 text-muted-foreground"
                  )}
                  whileHover={{ scale: 1.05 }}
                >
                  {isCompleted ? (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                    >
                      ✓
                    </motion.span>
                  ) : isBonus ? (
                    <Gift className="w-4 h-4" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                  
                  <span className="text-[10px] opacity-70">
                    +{reward.coins}
                  </span>

                  {/* Bonus indicator */}
                  {isBonus && (
                    <motion.div
                      className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full"
                      animate={isCompleted ? { scale: [1, 1.3, 1] } : {}}
                      transition={{ duration: 0.5, repeat: Infinity }}
                    />
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Today's reward */}
          <div className="bg-background/50 rounded-xl p-4 border border-border/30">
            <div className="text-center text-sm text-muted-foreground mb-2">
              Recompensa de hoje
            </div>
            <div className="flex items-center justify-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                  <Coins className="w-4 h-4 text-yellow-400" />
                </div>
                <span className="font-bold text-lg text-foreground">
                  +{todayReward.coins}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                </div>
                <span className="font-bold text-lg text-foreground">
                  +{todayReward.xp} XP
                </span>
              </div>
            </div>
          </div>

          {/* Action button */}
          {canClaim && !claimed ? (
            <motion.button
              onClick={handleClaim}
              disabled={isClaiming}
              className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 transition-all disabled:opacity-70"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isClaiming ? (
                <>
                  <motion.div
                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  Resgatando...
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5" />
                  Resgatar Recompensa
                </>
              )}
            </motion.button>
          ) : claimed ? (
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full py-4 bg-green-500/20 border border-green-500/50 text-green-400 rounded-xl font-bold text-lg flex items-center justify-center gap-2"
            >
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.5 }}
              >
                ✓
              </motion.span>
              Recompensa Resgatada!
            </motion.div>
          ) : (
            <div className="w-full py-4 bg-muted/30 text-muted-foreground rounded-xl font-medium text-center">
              ✅ Streak mantido! Volte amanhã.
            </div>
          )}

          {/* Risk warning */}
          {isAtRisk && (
            <motion.div
              className="text-center text-sm text-red-400 font-medium"
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              ⚠️ Jogue hoje para não perder seu streak!
            </motion.div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
