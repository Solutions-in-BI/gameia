/**
 * DailyStreak - Componente de streak diário
 * 
 * Mostra o streak de dias consecutivos jogando
 * e oferece bônus de XP/moedas por manter o streak.
 */

import { motion } from "framer-motion";
import { Flame, Gift, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface DailyStreakProps {
  currentStreak: number;
  longestStreak: number;
  lastPlayedAt?: string;
  canClaimToday: boolean;
  onClaim?: () => void;
}

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

export function DailyStreak({
  currentStreak,
  longestStreak,
  lastPlayedAt,
  canClaimToday,
  onClaim,
}: DailyStreakProps) {
  const todayRewardIndex = Math.min(currentStreak, 6);
  const todayReward = STREAK_REWARDS[todayRewardIndex];
  
  // Verifica se o streak está em risco (não jogou ontem)
  const isAtRisk = lastPlayedAt && !canClaimToday && new Date(lastPlayedAt).getDate() !== new Date().getDate();

  return (
    <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/30 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ 
              scale: currentStreak > 0 ? [1, 1.2, 1] : 1,
              rotate: currentStreak > 0 ? [0, -10, 10, 0] : 0,
            }}
            transition={{ duration: 0.5, repeat: currentStreak > 0 ? Infinity : 0, repeatDelay: 2 }}
          >
            <Flame className={cn(
              "w-6 h-6",
              currentStreak >= 7 ? "text-orange-500" :
              currentStreak >= 3 ? "text-orange-400" :
              currentStreak >= 1 ? "text-orange-300" :
              "text-muted-foreground"
            )} />
          </motion.div>
          <div>
            <h3 className="font-bold text-foreground">Streak Diário</h3>
            <p className="text-xs text-muted-foreground">Jogue todo dia para bônus!</p>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-2xl font-bold text-orange-500">{currentStreak}</div>
          <div className="text-xs text-muted-foreground">dias</div>
        </div>
      </div>

      {/* Progresso semanal */}
      <div className="grid grid-cols-7 gap-1 mb-3">
        {STREAK_REWARDS.map((reward, index) => {
          const isCompleted = index < currentStreak;
          const isCurrent = index === currentStreak;
          const isBonus = index === 6;
          
          return (
            <motion.div
              key={index}
              className={cn(
                "relative aspect-square rounded-lg flex items-center justify-center text-xs font-bold",
                isCompleted 
                  ? "bg-orange-500 text-white" 
                  : isCurrent && canClaimToday
                    ? "bg-orange-500/30 border-2 border-orange-500 text-orange-500"
                    : "bg-muted/50 text-muted-foreground"
              )}
              whileHover={{ scale: 1.1 }}
            >
              {isCompleted ? (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-sm"
                >
                  ✓
                </motion.span>
              ) : isBonus ? (
                <Gift className="w-3 h-3" />
              ) : (
                index + 1
              )}
              
              {/* Indicador de bônus */}
              {isBonus && isCompleted && (
                <motion.div
                  className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full"
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                />
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Recompensa do dia */}
      {canClaimToday && onClaim && (
        <motion.button
          onClick={onClaim}
          className="w-full py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-medium flex items-center justify-center gap-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Zap className="w-4 h-4" />
          Resgatar: +{todayReward.coins} 🪙 +{todayReward.xp} XP
        </motion.button>
      )}

      {!canClaimToday && currentStreak > 0 && (
        <div className="text-center text-sm text-muted-foreground">
          ✅ Streak mantido! Volte amanhã para continuar.
        </div>
      )}

      {isAtRisk && (
        <motion.div
          className="text-center text-sm text-red-400 font-medium"
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          ⚠️ Jogue hoje para não perder seu streak!
        </motion.div>
      )}

      {/* Recorde */}
      {longestStreak > 0 && (
        <div className="mt-2 text-center text-xs text-muted-foreground">
          Maior streak: <span className="font-bold text-orange-400">{longestStreak} dias</span>
        </div>
      )}
    </div>
  );
}

/**
 * MiniStreak - Versão compacta para o menu principal
 */
interface MiniStreakProps {
  streak: number;
}

export function MiniStreak({ streak }: MiniStreakProps) {
  if (streak === 0) return null;
  
  return (
    <motion.div
      className="flex items-center gap-1 bg-orange-500/20 border border-orange-500/30 rounded-lg px-2 py-1"
      whileHover={{ scale: 1.05 }}
    >
      <Flame className="w-4 h-4 text-orange-500" />
      <span className="text-sm font-bold text-orange-500">{streak}</span>
    </motion.div>
  );
}
