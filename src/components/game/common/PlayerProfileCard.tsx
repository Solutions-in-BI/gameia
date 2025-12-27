/**
 * Card de perfil do jogador - estilo dashboard com avatar, nível, XP, estatísticas
 */

import { motion } from "framer-motion";
import { 
  Coins, 
  Trophy, 
  Award,
  TrendingUp
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface PlayerProfileCardProps {
  nickname: string;
  avatarUrl?: string | null;
  level: number;
  xp: number;
  xpToNextLevel: number;
  xpProgress: number;
  coins: number;
  ranking?: number;
  badges: number;
  title?: string;
}

export function PlayerProfileCard({
  nickname,
  avatarUrl,
  level,
  xp,
  xpToNextLevel,
  xpProgress,
  coins,
  ranking,
  badges,
  title,
}: PlayerProfileCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-5 rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm"
    >
      <div className="flex items-start gap-4">
        {/* Avatar with level badge */}
        <div className="relative">
          <Avatar className="w-20 h-20 border-2 border-primary/50">
            <AvatarImage src={avatarUrl || undefined} />
            <AvatarFallback className="text-2xl bg-gradient-to-br from-primary/30 to-secondary/30">
              {nickname?.charAt(0).toUpperCase() || "?"}
            </AvatarFallback>
          </Avatar>
          <div className="absolute -bottom-1 -left-1 px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-bold">
            {level}
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold text-foreground truncate">{nickname}</h2>
          
          {title && (
            <span className="text-sm text-muted-foreground">{title}</span>
          )}
          
          <div className="flex items-center gap-2 mt-1">
            <Coins className="w-4 h-4 text-amber-400" />
            <span className="text-amber-400 font-bold">{coins.toLocaleString()}</span>
          </div>

          {/* Level Progress */}
          <div className="mt-3 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary font-bold">
                NÍVEL {level}
              </span>
              <span className="text-muted-foreground">
                {xp.toLocaleString()} / {xpToNextLevel.toLocaleString()} XP
              </span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-primary"
                initial={{ width: 0 }}
                animate={{ width: `${xpProgress}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3 mt-5">
        {ranking && (
          <div className="p-3 rounded-xl bg-muted/30 border border-border/50 text-center">
            <Trophy className="w-5 h-5 text-amber-400 mx-auto mb-1" />
            <div className="text-xl font-bold text-foreground">#{ranking}</div>
            <div className="text-[10px] text-muted-foreground">Ranking</div>
          </div>
        )}
        
        <div className="p-3 rounded-xl bg-muted/30 border border-border/50 text-center">
          <Award className="w-5 h-5 text-purple-400 mx-auto mb-1" />
          <div className="text-xl font-bold text-foreground">{badges}</div>
          <div className="text-[10px] text-muted-foreground">Insígnias</div>
        </div>
      </div>
    </motion.div>
  );
}
