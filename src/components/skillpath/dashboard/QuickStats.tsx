/**
 * Estatísticas rápidas do jogador - XP, Moedas, Streak, Level
 * Design atualizado com gradientes e visual premium
 */

import { motion } from "framer-motion";
import { 
  Flame, 
  Coins, 
  Trophy, 
  Star,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

interface StatPillProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  gradient: string;
  iconColor: string;
}

function StatPill({ icon, value, label, gradient, iconColor }: StatPillProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      className={cn(
        "relative flex items-center gap-3 px-4 py-3 rounded-xl overflow-hidden",
        "border border-border/30 backdrop-blur-sm",
        "hover:shadow-lg transition-all duration-300"
      )}
    >
      {/* Background gradient */}
      <div className={cn("absolute inset-0 opacity-20", gradient)} />
      
      <div className={cn(
        "relative w-10 h-10 rounded-lg flex items-center justify-center",
        "bg-background/50 border border-border/30"
      )}>
        <div className={iconColor}>{icon}</div>
      </div>
      <div className="relative flex-1 min-w-0">
        <div className="text-xl font-bold text-foreground">
          {typeof value === "number" ? value.toLocaleString() : value}
        </div>
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{label}</span>
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
          icon={<Star className="w-5 h-5" />}
          value={`Lv. ${level}`}
          label={`${xp.toLocaleString()} XP`}
          gradient="bg-gradient-to-br from-cyan-500 to-blue-600"
          iconColor="text-cyan-400"
        />
        <StatPill
          icon={<Coins className="w-5 h-5" />}
          value={coins}
          label="Moedas"
          gradient="bg-gradient-to-br from-amber-500 to-orange-600"
          iconColor="text-amber-400"
        />
        <StatPill
          icon={<Flame className="w-5 h-5" />}
          value={streak}
          label="Dias Seguidos"
          gradient="bg-gradient-to-br from-orange-500 to-red-600"
          iconColor="text-orange-400"
        />
        <StatPill
          icon={<Trophy className="w-5 h-5" />}
          value={`${achievements}/${totalAchievements}`}
          label="Conquistas"
          gradient="bg-gradient-to-br from-purple-500 to-pink-600"
          iconColor="text-purple-400"
        />
      </div>

      {/* XP Progress bar */}
      <div className="p-4 rounded-xl bg-card/50 border border-border/30 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-primary" />
            Progresso para Nível {level + 1}
          </span>
          <span className="text-sm font-bold text-foreground">{Math.round(xpProgress)}%</span>
        </div>
        <div className="h-2.5 rounded-full bg-muted/50 overflow-hidden">
          <motion.div 
            className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-primary"
            initial={{ width: 0 }}
            animate={{ width: `${xpProgress}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
      </div>
    </div>
  );
}
