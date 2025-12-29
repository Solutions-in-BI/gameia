/**
 * HubStat - Card de estatística compacto
 * Usado nos 4 cards de resumo do hub
 */

import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface HubStatProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  iconColor?: string;
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
  trend,
  onClick,
  className 
}: HubStatProps) {
  const Wrapper = onClick ? motion.button : motion.div;

  return (
    <Wrapper
      whileHover={{ y: -2 }}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      onClick={onClick}
      className={cn(
        "flex items-center gap-4 p-4 rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm",
        onClick && "cursor-pointer hover:border-primary/30 hover:shadow-sm transition-all",
        className
      )}
    >
      <div className={cn("p-2.5 rounded-lg bg-muted", iconColor)}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0 text-left">
        <p className="text-xs text-muted-foreground truncate">{label}</p>
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-foreground">{value}</span>
          {trend && (
            <span 
              className={cn(
                "text-xs font-medium",
                trend.isPositive ? "text-gameia-success" : "text-destructive"
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
