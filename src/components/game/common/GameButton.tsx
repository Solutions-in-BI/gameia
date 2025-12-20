import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * ===========================================
 * COMPONENTE: GameButton
 * ===========================================
 * 
 * Botão estilizado reutilizável para os jogos.
 * 
 * @example
 * <GameButton variant="primary" icon={RotateCcw} onClick={reset}>
 *   Reiniciar
 * </GameButton>
 */

interface GameButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "muted";
  icon?: LucideIcon;
  className?: string;
  fullWidth?: boolean;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  size?: "sm" | "md" | "lg";
}

const variantClasses = {
  primary: "btn-primary-game",
  secondary: "btn-secondary-game",
  muted: "btn-game bg-muted text-foreground",
};

const sizeClasses = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2",
  lg: "px-6 py-3 text-lg",
};

export function GameButton({ 
  children, 
  onClick, 
  variant = "primary",
  icon: Icon,
  className,
  fullWidth = false,
  disabled = false,
  type = "button",
  size = "md",
}: GameButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        variantClasses[variant],
        sizeClasses[size],
        "flex items-center justify-center gap-2",
        fullWidth && "w-full",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      {Icon && <Icon className="w-5 h-5" />}
      {children}
    </button>
  );
}
