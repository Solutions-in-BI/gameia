import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";

/**
 * ===========================================
 * COMPONENTE: ThemeToggle
 * ===========================================
 * 
 * Botão simples para alternar tema claro/escuro.
 */

export function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-3 rounded-full bg-card border border-border hover:border-primary/50 
                 transition-all hover:scale-110"
      aria-label={isDark ? "Mudar para tema claro" : "Mudar para tema escuro"}
    >
      {isDark ? (
        <Sun className="w-5 h-5 text-primary" />
      ) : (
        <Moon className="w-5 h-5 text-primary" />
      )}
    </button>
  );
}
