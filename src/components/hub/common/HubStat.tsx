/**
 * HubStat - Premium stat card
 * Clean metrics display with icon and optional trend
 */

import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface HubStatProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  onClick?: () => void;
  className?: string;
}

export function HubStat({ 
  label, 
  value, 
  icon: Icon, 
  iconColor = "text-primary",
  iconBg = "bg-primary/10",
  trend,
  onClick,
  className 
}: HubStatProps) {
  const Wrapper = onClick ? motion.button : motion.div;

  return (
    <Wrapper
      whileHover={onClick ? { y: -2 } : undefined}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      onClick={onClick}
      className={cn(
        "flex items-center gap-4 p-4 rounded-xl bg-card border border-border/60 transition-all duration-200",
        onClick && "cursor-pointer hover:border-border hover:shadow-sm",
        className
      )}
    >
      <div className={cn("p-2.5 rounded-xl", iconBg)}>
        <Icon className={cn("w-5 h-5", iconColor)} />
      </div>
      <div className="flex-1 min-w-0 text-left">
        <p className="text-xs font-medium text-muted-foreground truncate">{label}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xl font-bold text-foreground tabular-nums">{value}</span>
          {trend && (
            <span 
              className={cn(
                "text-xs font-semibold px-1.5 py-0.5 rounded",
                trend.isPositive 
                  ? "text-gameia-success bg-gameia-success/10" 
                  : "text-destructive bg-destructive/10"
              )}
            >
              {trend.isPositive ? "+" : ""}{trend.value}%
            </span>
          )}
        </div>
      </div>
    </Wrapper>
  );
}
