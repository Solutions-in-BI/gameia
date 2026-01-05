import { cn } from "@/lib/utils";
import { RARITY_COLORS, getRarityOrder, type RarityKey } from "@/constants/colors";

export type Rarity = RarityKey;

interface RarityBadgeProps {
  rarity: Rarity | string;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

export function RarityBadge({ rarity, size = "md", showLabel = true, className }: RarityBadgeProps) {
  const config = RARITY_COLORS[rarity as Rarity] || RARITY_COLORS.common;

  const sizeClasses = {
    sm: "text-[10px] px-1.5 py-0.5",
    md: "text-xs px-2 py-1",
    lg: "text-sm px-3 py-1.5",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border font-medium transition-all",
        config.bgSubtle,
        config.text,
        config.border,
        config.glow,
        sizeClasses[size],
        className
      )}
    >
      {showLabel && config.label}
    </span>
  );
}

// Re-export from colors.ts for backward compatibility
export { getRarityOrder } from "@/constants/colors";
