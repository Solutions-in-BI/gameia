/**
 * Componente de Conquistas/Badges com visual premium
 * Cards com raridade (Common, Rare, Epic, Legendary), ícones e estados locked/unlocked
 */

import { motion } from "framer-motion";
import { Lock, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export type BadgeRarity = "common" | "rare" | "epic" | "legendary";

export interface Badge {
  id: string;
  name: string;
  icon: string;
  rarity: BadgeRarity;
  isUnlocked: boolean;
  unlockedAt?: string;
}

interface AchievementsBadgesProps {
  badges: Badge[];
  title?: string;
  showCount?: boolean;
}

// Estilos por raridade
const RARITY_STYLES: Record<BadgeRarity, {
  label: string;
  border: string;
  glow: string;
  badge: string;
  text: string;
}> = {
  common: {
    label: "COMMON",
    border: "border-border/50",
    glow: "",
    badge: "bg-muted/50 text-muted-foreground",
    text: "text-muted-foreground",
  },
  rare: {
    label: "RARE",
    border: "border-cyan-500/50",
    glow: "shadow-lg shadow-cyan-500/20",
    badge: "bg-cyan-500/20 text-cyan-400",
    text: "text-cyan-400",
  },
  epic: {
    label: "EPIC",
    border: "border-purple-500/50",
    glow: "shadow-lg shadow-purple-500/20",
    badge: "bg-purple-500/20 text-purple-400",
    text: "text-purple-400",
  },
  legendary: {
    label: "LEGENDARY",
    border: "border-amber-500/50",
    glow: "shadow-lg shadow-amber-500/20",
    badge: "bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-400",
    text: "text-amber-400",
  },
};

export function AchievementsBadges({ badges, title, showCount = true }: AchievementsBadgesProps) {
  const unlockedCount = badges.filter(b => b.isUnlocked).length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
          {title || "Conquistas"}
        </h2>
        {showCount && (
          <div className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-sm font-bold">
            {unlockedCount}/{badges.length}
          </div>
        )}
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {badges.map((badge, index) => (
          <BadgeCard key={badge.id} badge={badge} delay={index * 0.03} />
        ))}
      </div>
    </div>
  );
}

interface BadgeCardProps {
  badge: Badge;
  delay?: number;
}

function BadgeCard({ badge, delay = 0 }: BadgeCardProps) {
  const style = RARITY_STYLES[badge.rarity];
  const isLocked = !badge.isUnlocked;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
      whileHover={{ scale: isLocked ? 1 : 1.03 }}
      className={cn(
        "relative flex flex-col items-center p-4 rounded-xl border transition-all duration-300",
        "bg-card/80 backdrop-blur-sm",
        isLocked 
          ? "border-border/30 opacity-40" 
          : cn(style.border, style.glow)
      )}
    >
      {/* Unlocked Checkmark */}
      {!isLocked && (
        <div className="absolute top-2 right-2">
          <Check className="w-4 h-4 text-emerald-400" />
        </div>
      )}

      {/* Icon */}
      <div className={cn(
        "text-4xl mb-3",
        isLocked && "grayscale opacity-50"
      )}>
        {isLocked ? <Lock className="w-8 h-8 text-muted-foreground" /> : badge.icon}
      </div>

      {/* Name */}
      <h3 className={cn(
        "font-medium text-sm text-center mb-2",
        isLocked ? "text-muted-foreground" : "text-foreground"
      )}>
        {badge.name}
      </h3>

      {/* Rarity Badge */}
      <div className={cn(
        "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
        isLocked ? "bg-muted/50 text-muted-foreground" : style.badge
      )}>
        {style.label}
      </div>
    </motion.div>
  );
}

// Componente alternativo em formato de lista horizontal scrollável
export function BadgesCarousel({ badges, title }: AchievementsBadgesProps) {
  const unlockedCount = badges.filter(b => b.isUnlocked).length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
          {title || "Conquistas"}
        </h2>
        <div className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-sm font-bold">
          {unlockedCount}/{badges.length}
        </div>
      </div>

      {/* Horizontal Scroll */}
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
        {badges.map((badge, index) => (
          <BadgeCard key={badge.id} badge={badge} delay={index * 0.02} />
        ))}
      </div>
    </div>
  );
}
