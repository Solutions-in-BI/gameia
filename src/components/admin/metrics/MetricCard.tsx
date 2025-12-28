/**
 * Card de métrica reutilizável para o Admin Center
 */

import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  subValue?: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  color?: "primary" | "secondary" | "accent" | "warning" | "success" | "destructive";
  size?: "sm" | "md" | "lg";
}

const colorClasses = {
  primary: "bg-primary/10 text-primary",
  secondary: "bg-secondary/10 text-secondary",
  accent: "bg-accent/10 text-accent",
  warning: "bg-yellow-500/10 text-yellow-500",
  success: "bg-green-500/10 text-green-500",
  destructive: "bg-destructive/10 text-destructive",
};

const trendColors = {
  up: "text-green-500",
  down: "text-red-500",
  neutral: "text-muted-foreground",
};

export function MetricCard({
  icon: Icon,
  label,
  value,
  subValue,
  trend,
  trendValue,
  color = "primary",
  size = "md",
}: MetricCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card p-4 transition-all hover:shadow-md",
        size === "lg" && "p-6"
      )}
    >
      <div className="flex items-start justify-between">
        <div
          className={cn(
            "rounded-lg p-2",
            colorClasses[color],
            size === "lg" && "p-3"
          )}
        >
          <Icon className={cn("w-4 h-4", size === "lg" && "w-6 h-6")} />
        </div>
        {trend && trendValue && (
          <span className={cn("text-xs font-medium", trendColors[trend])}>
            {trend === "up" && "↑"}
            {trend === "down" && "↓"}
            {trendValue}
          </span>
        )}
      </div>
      <div className="mt-3">
        <p className="text-xs text-muted-foreground font-medium">{label}</p>
        <p
          className={cn(
            "text-2xl font-bold text-foreground mt-1",
            size === "lg" && "text-3xl"
          )}
        >
          {value}
        </p>
        {subValue && (
          <p className="text-xs text-muted-foreground mt-1">{subValue}</p>
        )}
      </div>
    </div>
  );
}
