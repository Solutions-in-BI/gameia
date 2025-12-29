/**
 * HubButton - Premium button component
 * Consistent styling across the hub with multiple variants
 */

import { cn } from "@/lib/utils";
import { forwardRef } from "react";
import { Loader2 } from "lucide-react";

interface HubButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const HubButton = forwardRef<HTMLButtonElement, HubButtonProps>(
  ({ 
    className, 
    variant = "primary", 
    size = "md", 
    isLoading = false,
    leftIcon,
    rightIcon,
    children,
    disabled,
    ...props 
  }, ref) => {
    const baseStyles = cn(
      "inline-flex items-center justify-center gap-2 font-medium rounded-lg",
      "transition-all duration-200 ease-out",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      "disabled:opacity-50 disabled:pointer-events-none"
    );
    
    const variants = {
      primary: cn(
        "bg-primary text-primary-foreground",
        "shadow-sm hover:shadow-md",
        "hover:-translate-y-px active:translate-y-0"
      ),
      secondary: cn(
        "bg-muted text-foreground border border-border/50",
        "hover:bg-muted/80 hover:border-border"
      ),
      ghost: cn(
        "text-muted-foreground",
        "hover:text-foreground hover:bg-muted/50"
      ),
      outline: cn(
        "border border-border bg-transparent text-foreground",
        "hover:bg-muted/50"
      ),
    };
    
    const sizes = {
      sm: "text-xs px-3 py-1.5 h-8",
      md: "text-sm px-4 py-2 h-9",
      lg: "text-sm px-5 py-2.5 h-11",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : leftIcon}
        {children}
        {!isLoading && rightIcon}
      </button>
    );
  }
);

HubButton.displayName = "HubButton";
