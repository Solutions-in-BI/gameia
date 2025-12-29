/**
 * HubCard - Card padronizado para todo o hub
 * Base consistente: borda, sombra, hover, radius, padding
 */

import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface HubCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "highlight" | "glass";
  noPadding?: boolean;
  noHover?: boolean;
}

export const HubCard = forwardRef<HTMLDivElement, HubCardProps>(
  ({ className, variant = "default", noPadding = false, noHover = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-xl border border-border/50 bg-card/90 backdrop-blur-sm transition-all duration-200",
          !noPadding && "p-5",
          !noHover && "hover:border-primary/30 hover:shadow-md",
          variant === "highlight" && "border-primary/20 bg-gradient-to-br from-primary/5 to-transparent",
          variant === "glass" && "bg-background/60 backdrop-blur-xl border-border/30",
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
    <div className={cn("flex items-start justify-between gap-4 mb-4", className)} {...props}>
      <div>
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        {description && <p className="text-sm text-muted-foreground mt-0.5">{description}</p>}
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
