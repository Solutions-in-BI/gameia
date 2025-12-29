/**
 * HubHeader - Header dinâmico do hub
 * Título + subtítulo + CTA contextual
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
    <div className={cn("flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6", className)}>
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="p-2 rounded-lg bg-primary/10">
            <Icon className="w-6 h-6 text-primary" />
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
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
