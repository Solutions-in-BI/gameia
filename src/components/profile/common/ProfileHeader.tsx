import { motion } from "framer-motion";
import { Crown, Flame, Coins, Award, Building2 } from "lucide-react";
import { useStreak } from "@/hooks/useStreak";
import { useMarketplace } from "@/hooks/useMarketplace";
import { useAchievements } from "@/hooks/useAchievements";
import { useOrganization } from "@/hooks/useOrganization";
import { useTitles } from "@/hooks/useTitles";
import { GAME_TITLES, getTitleById } from "@/constants/titles";

interface Profile {
  id: string;
  nickname: string | null;
  avatar_url: string | null;
  selected_title: string | null;
}

interface ProfileHeaderProps {
  profile: Profile | null;
  level: number;
  currentXP: number;
  xpForNextLevel: number;
  xpProgress: number;
  isMaster: boolean;
  isAdmin: boolean;
}

export function ProfileHeader({
  profile,
  level,
  currentXP,
  xpForNextLevel,
  xpProgress,
  isMaster,
  isAdmin
}: ProfileHeaderProps) {
  const { streak } = useStreak();
  const { coins } = useMarketplace();
  const { unlockedAchievements } = useAchievements();
  const { currentOrg } = useOrganization();
  const { unlockedTitles } = useTitles();

  const displayName = profile?.nickname || "Jogador";
  const avatarUrl = profile?.avatar_url;
  const unlockedCount = unlockedAchievements.length;
  
  // Get title from profile or default
  const selectedTitleId = profile?.selected_title;
  const titleData = selectedTitleId ? getTitleById(selectedTitleId) : null;
  const titleDisplay = titleData?.name || "Novato";

  return (
    <div className="surface-elevated p-6">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Avatar & Level */}
        <div className="flex flex-col items-center">
          <div className="relative">
            {/* Level Ring */}
            <svg className="absolute -inset-2 w-[calc(100%+16px)] h-[calc(100%+16px)]">
              <circle
                cx="50%"
                cy="50%"
                r="46%"
                fill="none"
                stroke="hsl(var(--muted))"
                strokeWidth="3"
              />
              <motion.circle
                cx="50%"
                cy="50%"
                r="46%"
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={`${xpProgress * 2.89} 289`}
                transform="rotate(-90 50 50)"
                initial={{ strokeDasharray: "0 289" }}
                animate={{ strokeDasharray: `${xpProgress * 2.89} 289` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </svg>
            
            {/* Avatar */}
            <div className="relative w-24 h-24 rounded-full overflow-hidden bg-muted border-2 border-background shadow-lg">
              {avatarUrl ? (
                <img 
                  src={avatarUrl} 
                  alt={displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-muted-foreground">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Level Badge */}
            <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shadow-md">
              {level}
            </div>
          </div>

          {/* Master Badge */}
          {isMaster && (
            <div className="mt-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-md">
              <Crown className="h-4 w-4" />
              <span className="text-xs font-bold">MASTER</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-2xl font-bold text-foreground">{displayName}</h1>
          <p className="text-muted-foreground text-sm">{titleDisplay}</p>

          {/* XP Progress */}
          <div className="mt-4 max-w-sm">
            <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
              <span>Nível {level}</span>
              <span>{currentXP.toLocaleString()} / {xpForNextLevel.toLocaleString()} XP</span>
            </div>
            <div className="progress-track h-2">
              <motion.div 
                className="progress-fill"
                initial={{ width: 0 }}
                animate={{ width: `${xpProgress}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
          </div>

          {/* Quick Stats */}
          <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-3">
            <QuickStat icon={Flame} value={streak.currentStreak} label="Streak" color="text-orange-500" />
            <QuickStat icon={Coins} value={coins} label="Moedas" color="text-yellow-500" />
            <QuickStat icon={Award} value={unlockedCount} label="Conquistas" color="text-primary" />
          </div>

          {/* Organization */}
          {currentOrg && (
            <div className="mt-4 flex items-center gap-2 justify-center md:justify-start text-sm text-muted-foreground">
              <Building2 className="h-4 w-4" />
              <span>{currentOrg.name}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function QuickStat({ 
  icon: Icon, 
  value, 
  label, 
  color 
}: { 
  icon: typeof Flame; 
  value: number; 
  label: string; 
  color: string;
}) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50">
      <Icon className={`h-4 w-4 ${color}`} />
      <span className="text-sm font-medium">{value.toLocaleString()}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}
