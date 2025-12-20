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
  onClick: () => void;
  variant?: "primary" | "secondary" | "muted";
  icon?: LucideIcon;
  className?: string;
  fullWidth?: boolean;
  disabled?: boolean;
}

const variantClasses = {
  primary: "btn-primary-game",
  secondary: "btn-secondary-game",
  muted: "btn-game bg-muted text-foreground",
};

export function GameButton({ 
  children, 
  onClick, 
  variant = "primary",
  icon: Icon,
  className,
  fullWidth = false,
  disabled = false,
}: GameButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        variantClasses[variant],
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
