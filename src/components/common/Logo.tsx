/**
 * Componente de Logo reutilizável do Gameia
 * Suporta variantes: icon-only, full (icon + texto), text-only
 * Suporta tamanhos: sm, md, lg, xl
 */

import { cn } from "@/lib/utils";
import gameiaIcon from "@/assets/gameia-icon.png";

type LogoVariant = "icon" | "full" | "text";
type LogoSize = "xs" | "sm" | "md" | "lg" | "xl";

interface LogoProps {
  variant?: LogoVariant;
  size?: LogoSize;
  className?: string;
  showGradientText?: boolean;
}

const sizeConfig: Record<LogoSize, { icon: string; text: string; gap: string }> = {
  xs: { icon: "w-6 h-6", text: "text-sm", gap: "gap-1" },
  sm: { icon: "w-8 h-8", text: "text-base", gap: "gap-1.5" },
  md: { icon: "w-10 h-10", text: "text-lg", gap: "gap-2" },
  lg: { icon: "w-12 h-12", text: "text-xl", gap: "gap-2.5" },
  xl: { icon: "w-16 h-16", text: "text-2xl", gap: "gap-3" },
};

export function Logo({ 
  variant = "full", 
  size = "md", 
  className,
  showGradientText = true 
}: LogoProps) {
  const config = sizeConfig[size];

  const IconComponent = () => (
    <img 
      src={gameiaIcon} 
      alt="Gameia" 
      className={cn(config.icon, "rounded-lg object-contain")}
    />
  );

  const TextComponent = () => (
    <span 
      className={cn(
        "font-display font-bold",
        config.text,
        showGradientText 
          ? "bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"
          : "text-foreground"
      )}
    >
      Gameia
    </span>
  );

  if (variant === "icon") {
    return (
      <div className={cn("flex-shrink-0", className)}>
        <IconComponent />
      </div>
    );
  }

  if (variant === "text") {
    return (
      <div className={cn("flex-shrink-0", className)}>
        <TextComponent />
      </div>
    );
  }

  // full variant
  return (
    <div className={cn("flex items-center", config.gap, className)}>
      <IconComponent />
      <TextComponent />
    </div>
  );
}

export default Logo;
