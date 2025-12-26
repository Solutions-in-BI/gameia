/**
 * Estatísticas rápidas do jogador - XP, Moedas, Streak, Level
 */

import { motion } from "framer-motion";
import { 
  Flame, 
  Coins, 
  Trophy, 
  TrendingUp,
  Star,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

interface StatPillProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  color: string;
  trend?: number;
}

function StatPill({ icon, value, label, color, trend }: StatPillProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-2xl",
        "bg-card/50 border border-border/50 backdrop-blur-sm",
        "hover:border-primary/30 transition-all"
      )}
    >
      <div className={cn(
        "w-10 h-10 rounded-xl flex items-center justify-center",
        color
      )}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-1">
          <span className="text-xl font-bold text-foreground">
            {typeof value === "number" ? value.toLocaleString() : value}
          </span>
          {trend !== undefined && trend > 0 && (
            <span className="text-xs text-green-500 flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" />
              +{trend}%
            </span>
          )}
        </div>
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
    </motion.div>
  );
}

interface QuickStatsProps {
  level: number;
  xp: number;
  xpProgress: number;
  coins: number;
  streak: number;
  achievements: number;
  totalAchievements: number;
}

export function QuickStats({ 
  level, 
  xp, 
  xpProgress, 
  coins, 
  streak, 
  achievements,
  totalAchievements 
}: QuickStatsProps) {
  return (
    <div className="space-y-4">
      {/* Main stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatPill
          icon={<Star className="w-5 h-5 text-primary" />}
          value={`Lv. ${level}`}
          label={`${xp.toLocaleString()} XP`}
          color="bg-primary/20"
        />
        <StatPill
          icon={<Coins className="w-5 h-5 text-yellow-500" />}
          value={coins}
          label="Moedas"
          color="bg-yellow-500/20"
        />
        <StatPill
          icon={<Flame className="w-5 h-5 text-orange-500" />}
          value={streak}
          label="Dias seguidos"
          color="bg-orange-500/20"
        />
        <StatPill
          icon={<Trophy className="w-5 h-5 text-purple-500" />}
          value={`${achievements}/${totalAchievements}`}
          label="Conquistas"
          color="bg-purple-500/20"
        />
      </div>

      {/* XP Progress bar */}
      <div className="p-4 rounded-2xl bg-card/50 border border-border/50 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground flex items-center gap-1">
            <Zap className="w-4 h-4 text-primary" />
            Progresso para Nível {level + 1}
          </span>
          <span className="text-sm font-medium text-foreground">{Math.round(xpProgress)}%</span>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <motion.div 
            className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
            initial={{ width: 0 }}
            animate={{ width: `${xpProgress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </div>
    </div>
  );
}
