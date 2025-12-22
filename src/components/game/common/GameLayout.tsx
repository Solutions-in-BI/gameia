import { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";

/**
 * ===========================================
 * COMPONENTE: GameLayout
 * ===========================================
 * 
 * Layout base reutilizável para todos os jogos.
 * Garante consistência visual e estrutura.
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
  maxWidth = "4xl",
  onBack
}: GameLayoutProps) {
  return (
    <div className="min-h-screen bg-background py-6 px-4">
      <div className={`${maxWidthClasses[maxWidth]} mx-auto`}>
        {/* Header do Jogo */}
        <header className="relative text-center mb-6 animate-fade-in">
          {onBack && (
            <button
              onClick={onBack}
              className="absolute left-0 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-card border border-border 
                         hover:bg-muted transition-colors group"
              title="Voltar ao Menu"
            >
              <ArrowLeft className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
            </button>
          )}
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-1 neon-text">
            {title}
          </h1>
          {subtitle && (
            <p className="text-muted-foreground text-sm">{subtitle}</p>
          )}
        </header>

        {/* Conteúdo do Jogo */}
        {children}
      </div>
    </div>
  );
}
