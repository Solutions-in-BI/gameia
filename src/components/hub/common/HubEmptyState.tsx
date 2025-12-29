/**
 * HubEmptyState - Premium empty state
 * Clean feedback when no data is available
 */

import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { HubButton } from "./HubButton";

interface HubEmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function HubEmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: HubEmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-12 px-6 text-center", className)}>
      <div className="p-4 rounded-2xl bg-muted mb-5">
        <Icon className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-base font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-xs mb-6">{description}</p>
      {actionLabel && onAction && (
        <HubButton onClick={onAction} variant="primary" size="sm">
          {actionLabel}
        </HubButton>
      )}
    </div>
  );
}
