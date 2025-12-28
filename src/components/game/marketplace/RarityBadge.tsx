import { cn } from "@/lib/utils";

export type Rarity = "common" | "uncommon" | "rare" | "epic" | "legendary";

const RARITY_CONFIG: Record<Rarity, { label: string; className: string; glow?: string }> = {
  common: {
    label: "Comum",
    className: "bg-muted text-muted-foreground border-border",
  },
  uncommon: {
    label: "Incomum",
    className: "bg-green-500/20 text-green-400 border-green-500/40",
  },
  rare: {
    label: "Raro",
    className: "bg-blue-500/20 text-blue-400 border-blue-500/40",
    glow: "shadow-[0_0_10px_rgba(59,130,246,0.3)]",
  },
  epic: {
    label: "Épico",
    className: "bg-purple-500/20 text-purple-400 border-purple-500/40",
    glow: "shadow-[0_0_15px_rgba(168,85,247,0.4)]",
  },
  legendary: {
    label: "Lendário",
    className: "bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/40",
    glow: "shadow-[0_0_20px_rgba(245,158,11,0.5)] animate-pulse",
  },
};

interface RarityBadgeProps {
  rarity: Rarity | string;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

export function RarityBadge({ rarity, size = "md", showLabel = true, className }: RarityBadgeProps) {
  const config = RARITY_CONFIG[rarity as Rarity] || RARITY_CONFIG.common;

  const sizeClasses = {
    sm: "text-[10px] px-1.5 py-0.5",
    md: "text-xs px-2 py-1",
    lg: "text-sm px-3 py-1.5",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border font-medium transition-all",
        config.className,
        config.glow,
        sizeClasses[size],
        className
      )}
    >
      {showLabel && config.label}
    </span>
  );
}

export function getRarityOrder(rarity: string): number {
  const order: Record<string, number> = {
    legendary: 5,
    epic: 4,
    rare: 3,
    uncommon: 2,
    common: 1,
  };
  return order[rarity] || 0;
}
