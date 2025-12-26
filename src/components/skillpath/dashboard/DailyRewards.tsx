/**
 * Recompensas diárias e streak
 */

import { motion } from "framer-motion";
import { 
  Flame, 
  Gift,
  Coins,
  Star,
  Check,
  Lock
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface DailyRewardsProps {
  currentStreak: number;
  longestStreak: number;
  canClaim: boolean;
  isAtRisk: boolean;
  todayReward: { coins: number; xp: number };
  onClaim: () => Promise<boolean>;
}

const STREAK_REWARDS = [
  { day: 1, coins: 10, xp: 5 },
  { day: 2, coins: 15, xp: 10 },
  { day: 3, coins: 25, xp: 15 },
  { day: 4, coins: 35, xp: 20 },
  { day: 5, coins: 50, xp: 30 },
  { day: 6, coins: 75, xp: 40 },
  { day: 7, coins: 100, xp: 50 },
];

export function DailyRewards({
  currentStreak,
  longestStreak,
  canClaim,
  isAtRisk,
  todayReward,
  onClaim,
}: DailyRewardsProps) {
  const currentDay = Math.min(currentStreak + 1, 7);

  return (
    <div className="p-4 rounded-2xl bg-card/50 border border-border/50 backdrop-blur-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center",
            isAtRisk ? "bg-orange-500/20" : "bg-primary/20"
          )}>
            <Flame className={cn(
              "w-5 h-5",
              isAtRisk ? "text-orange-500" : "text-primary"
            )} />
          </div>
          <div>
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              Streak: {currentStreak} dias
              {isAtRisk && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-500">
                  Em risco!
                </span>
              )}
            </h3>
            <p className="text-xs text-muted-foreground">
              Recorde: {longestStreak} dias
            </p>
          </div>
        </div>

        {canClaim && (
          <Button
            size="sm"
            onClick={onClaim}
            className="gap-1"
          >
            <Gift className="w-4 h-4" />
            Resgatar
          </Button>
        )}
      </div>

      {/* Weekly rewards preview */}
      <div className="grid grid-cols-7 gap-1">
        {STREAK_REWARDS.map((reward, i) => {
          const day = i + 1;
          const isPast = day < currentDay;
          const isCurrent = day === currentDay;
          const isFuture = day > currentDay;

          return (
            <motion.div
              key={day}
              whileHover={{ scale: 1.05 }}
              className={cn(
                "relative flex flex-col items-center p-2 rounded-xl text-center transition-all",
                isPast && "bg-primary/10 border border-primary/30",
                isCurrent && canClaim && "bg-primary/20 border border-primary animate-pulse",
                isCurrent && !canClaim && "bg-green-500/20 border border-green-500/30",
                isFuture && "bg-muted/30 border border-border/30"
              )}
            >
              {/* Day number */}
              <div className={cn(
                "text-xs font-medium mb-1",
                isPast && "text-primary",
                isCurrent && "text-primary",
                isFuture && "text-muted-foreground"
              )}>
                D{day}
              </div>

              {/* Icon */}
              <div className="text-lg mb-1">
                {isPast && <Check className="w-4 h-4 text-primary" />}
                {isCurrent && !canClaim && <Check className="w-4 h-4 text-green-500" />}
                {isCurrent && canClaim && <Gift className="w-4 h-4 text-primary" />}
                {isFuture && <Lock className="w-4 h-4 text-muted-foreground" />}
              </div>

              {/* Reward */}
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-xs text-warning flex items-center gap-0.5">
                  <Coins className="w-3 h-3" />
                  {reward.coins}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Current day reward */}
      {canClaim && (
        <div className="flex items-center justify-center gap-4 p-3 rounded-xl bg-primary/10 border border-primary/20">
          <span className="text-sm text-foreground">Recompensa de hoje:</span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-warning font-medium">
              <Coins className="w-4 h-4" />
              {todayReward.coins}
            </span>
            <span className="flex items-center gap-1 text-primary font-medium">
              <Star className="w-4 h-4" />
              {todayReward.xp} XP
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
