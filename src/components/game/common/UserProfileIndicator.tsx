/**
 * UserProfileIndicator - Premium user profile indicator with level, progress, and title
 */

import { forwardRef } from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { getLevelInfo, getLevelProgress, getLevelTier, LEVEL_COLORS } from "@/constants/levels";

interface UserProfileIndicatorProps {
  displayName: string;
  avatarUrl?: string | null;
  level: number;
  xp: number;
  selectedTitle?: string | null;
  className?: string;
}

// Border colors based on tier
const TIER_BORDER_CLASSES: Record<string, string> = {
  bronze: "ring-amber-700",
  silver: "ring-slate-400",
  gold: "ring-yellow-500",
  platinum: "ring-cyan-400",
  diamond: "ring-purple-400",
  master: "ring-red-500",
  grandmaster: "ring-pink-500",
  legendary: "ring-orange-500",
};

export const UserProfileIndicator = forwardRef<
  HTMLButtonElement, 
  UserProfileIndicatorProps & React.ButtonHTMLAttributes<HTMLButtonElement>
>(
  ({ displayName, avatarUrl, level, xp, selectedTitle, className, ...props }, ref) => {
    const avatarInitial = displayName.charAt(0).toUpperCase() || "G";
    const tier = getLevelTier(level);
    const progress = getLevelProgress(xp, level);
    const levelInfo = getLevelInfo(level, xp);
    const tierBorder = TIER_BORDER_CLASSES[tier] || "ring-border";

    return (
      <button
        ref={ref}
        type="button"
        className={cn(
          "flex items-center gap-2.5 px-2 py-1.5 rounded-xl hover:bg-muted/50 transition-all group",
          className
        )}
        {...props}
      >
        {/* Avatar with tier border and level badge */}
        <div className="relative">
          {/* Avatar */}
          <div
            className={cn(
              "w-9 h-9 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center overflow-hidden ring-2",
              tierBorder
            )}
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-primary-foreground text-sm font-semibold">
                {avatarInitial}
              </span>
            )}
          </div>

          {/* Level badge */}
          <motion.div
            initial={false}
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 0.3 }}
            className={cn(
              "absolute -bottom-1 -right-1 flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold shadow-md border-2 border-card",
              tier === "legendary"
                ? "bg-gradient-to-br from-orange-500 to-yellow-400 text-white"
                : tier === "grandmaster"
                ? "bg-gradient-to-br from-pink-500 to-rose-400 text-white"
                : tier === "master"
                ? "bg-gradient-to-br from-red-500 to-orange-400 text-white"
                : tier === "diamond"
                ? "bg-gradient-to-br from-purple-500 to-violet-400 text-white"
                : tier === "platinum"
                ? "bg-gradient-to-br from-cyan-400 to-sky-300 text-white"
                : tier === "gold"
                ? "bg-gradient-to-br from-yellow-500 to-amber-400 text-white"
                : tier === "silver"
                ? "bg-gradient-to-br from-slate-400 to-slate-300 text-slate-800"
                : "bg-gradient-to-br from-amber-700 to-amber-600 text-white"
            )}
          >
            {level}
          </motion.div>
        </div>

        {/* User info (desktop only) */}
        <div className="hidden sm:flex flex-col items-start min-w-0">
          <span className="text-sm font-medium text-foreground truncate max-w-[100px]">
            {displayName}
          </span>
          
          <div className="flex items-center gap-2 w-full">
            {/* Title or default */}
            <span className="text-[11px] text-muted-foreground truncate max-w-[80px]">
              {selectedTitle || levelInfo.title}
            </span>
            
            {/* Mini progress bar */}
            <div className="w-12 h-1 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
          </div>
        </div>

        <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
      </button>
    );
  }
);

UserProfileIndicator.displayName = "UserProfileIndicator";
