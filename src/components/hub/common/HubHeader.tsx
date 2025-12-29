/**
 * HubHeader - Premium page header
 * Clear hierarchy with title, subtitle, and optional action
 */

import { cn } from "@/lib/utils";
import { HubButton } from "./HubButton";
import { LucideIcon } from "lucide-react";

interface HubHeaderProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  actionLabel?: string;
  actionIcon?: LucideIcon;
  onAction?: () => void;
  className?: string;
}

export function HubHeader({
  title,
  subtitle,
  icon: Icon,
  actionLabel,
  actionIcon: ActionIcon,
  onAction,
  className,
}: HubHeaderProps) {
  return (
    <div className={cn("flex flex-col sm:flex-row sm:items-center justify-between gap-4", className)}>
      <div className="flex items-center gap-4">
        {Icon && (
          <div className="hidden sm:flex p-3 rounded-xl bg-primary/10">
            <Icon className="w-6 h-6 text-primary" />
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">{title}</h1>
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
      {actionLabel && onAction && (
        <HubButton 
          onClick={onAction} 
          leftIcon={ActionIcon && <ActionIcon className="w-4 h-4" />}
        >
          {actionLabel}
        </HubButton>
      )}
    </div>
  );
}
