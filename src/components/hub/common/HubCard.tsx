/**
 * HubCard - Premium card component
 * Clean, consistent surface with subtle hover states
 */

import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface HubCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "highlight" | "elevated";
  noPadding?: boolean;
  interactive?: boolean;
}

export const HubCard = forwardRef<HTMLDivElement, HubCardProps>(
  ({ className, variant = "default", noPadding = false, interactive = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-xl bg-card border border-border/60 transition-all duration-200",
          !noPadding && "p-5",
          interactive && "cursor-pointer hover:border-border hover:shadow-md",
          variant === "highlight" && "border-primary/20 bg-gradient-to-br from-primary/[0.03] to-transparent",
          variant === "elevated" && "shadow-md border-border/40",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

HubCard.displayName = "HubCard";

interface HubCardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function HubCardHeader({ title, description, action, className, ...props }: HubCardHeaderProps) {
  return (
    <div className={cn("flex items-start justify-between gap-4 mb-5", className)} {...props}>
      <div className="space-y-1">
        <h3 className="text-base font-semibold text-foreground leading-none tracking-tight">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}

interface HubCardContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export function HubCardContent({ className, children, ...props }: HubCardContentProps) {
  return (
    <div className={cn("", className)} {...props}>
      {children}
    </div>
  );
}
