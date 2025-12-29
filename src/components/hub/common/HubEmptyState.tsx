/**
 * HubEmptyState - Estado vazio elegante com CTA
 * Usado quando não há dados para mostrar
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
    <div className={cn("flex flex-col items-center justify-center py-12 px-4 text-center", className)}>
      <div className="p-4 rounded-full bg-muted/50 mb-4">
        <Icon className="w-10 h-10 text-muted-foreground/60" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-6">{description}</p>
      {actionLabel && onAction && (
        <HubButton onClick={onAction} variant="primary">
          {actionLabel}
        </HubButton>
      )}
    </div>
  );
}
