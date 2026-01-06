/**
 * Componente de Conquistas/Badges com visual premium
 * Cards com raridade (Common, Rare, Epic, Legendary), ícones e estados locked/unlocked
 * 
 * Paleta: Honey & Charcoal - usando cores centralizadas
 */

import { motion } from "framer-motion";
import { Lock, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { RARITY_COLORS, getRarityColors, type RarityKey } from "@/constants/colors";

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

// Mapeamento de raridade para labels
const RARITY_LABELS: Record<BadgeRarity, string> = {
  common: "COMUM",
  rare: "RARO",
  epic: "ÉPICO",
  legendary: "LENDÁRIO",
};

export function AchievementsBadges({ badges, title, showCount = true }: AchievementsBadgesProps) {
  const unlockedCount = badges.filter(b => b.isUnlocked).length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
          {title || "Conquistas"}
        </h2>
        {showCount && (
          <div className="px-3 py-1 rounded-full bg-gameia-success/20 border border-gameia-success/30 text-gameia-success text-sm font-bold">
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
  const colors = getRarityColors(badge.rarity);
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
          : cn(colors.border, colors.glow)
      )}
    >
      {/* Unlocked Checkmark */}
      {!isLocked && (
        <div className="absolute top-2 right-2">
          <Check className="w-4 h-4 text-gameia-success" />
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
        isLocked ? "bg-muted/50 text-muted-foreground" : cn(colors.bgSubtle, colors.text)
      )}>
        {RARITY_LABELS[badge.rarity]}
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
        <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
          {title || "Conquistas"}
        </h2>
        <div className="px-3 py-1 rounded-full bg-gameia-success/20 border border-gameia-success/30 text-gameia-success text-sm font-bold">
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
