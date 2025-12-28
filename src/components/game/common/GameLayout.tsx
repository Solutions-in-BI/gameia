import { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
    <motion.div 
      className="min-h-screen bg-background py-6 px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className={`${maxWidthClasses[maxWidth]} mx-auto`}>
        {/* Header do Jogo */}
        <motion.header 
          className="relative text-center mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          {onBack && (
            <motion.button
              onClick={onBack}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.05, x: -2 }}
              whileTap={{ scale: 0.95 }}
              className="absolute left-0 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-card border border-border 
                         hover:bg-muted hover:border-primary/30 transition-all duration-200 group"
              title="Voltar ao Menu"
            >
              <ArrowLeft className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
            </motion.button>
          )}
          <motion.h1 
            className="text-3xl md:text-4xl font-display font-bold text-foreground mb-1 neon-text"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            {title}
          </motion.h1>
          {subtitle && (
            <motion.p 
              className="text-muted-foreground text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {subtitle}
            </motion.p>
          )}
        </motion.header>

        {/* Conteúdo do Jogo */}
        <AnimatePresence mode="wait">
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, delay: 0.15 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
