import { ReactNode } from "react";

/**
 * ===========================================
 * COMPONENTE: GameLayout
 * ===========================================
 * 
 * Layout base reutilizável para todos os jogos.
 * Garante consistência visual e estrutura.
 * 
 * @example
 * <GameLayout title="Snake" subtitle="Use WASD">
 *   <SnakeBoard />
 * </GameLayout>
 */

export interface GameLayoutProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "4xl";
  onBack?: () => void;
}

const maxWidthClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  "4xl": "max-w-4xl",
};

export function GameLayout({ 
  title, 
  subtitle, 
  children, 
  maxWidth = "4xl" 
}: GameLayoutProps) {
  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className={`${maxWidthClasses[maxWidth]} mx-auto`}>
        {/* Header do Jogo */}
        <header className="text-center mb-8 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-2 neon-text">
            {title}
          </h1>
          {subtitle && (
            <p className="text-muted-foreground">{subtitle}</p>
          )}
        </header>

        {/* Conteúdo do Jogo */}
        {children}
      </div>
    </div>
  );
}
