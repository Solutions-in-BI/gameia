/**
 * Shell principal da aplicação Gameia
 * Navegação unificada: Treinamento, Orientação, Perfil
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Gamepad2, 
  Compass, 
  User, 
  LogOut, 
  LogIn,
  Menu,
  X,
  Moon,
  Sun
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";

export type GameiaSection = "gamification" | "guidance" | "profile";

interface AppShellProps {
  children: React.ReactNode;
  activeSection: GameiaSection;
  onSectionChange: (section: GameiaSection) => void;
}

const NAV_ITEMS = [
  {
    id: "gamification" as const,
    label: "Treinamento",
    shortLabel: "Treinar",
    icon: Gamepad2,
    color: "pillar-gamification",
    description: "Games, Quiz e Cenários",
  },
  {
    id: "guidance" as const,
    label: "Orientação",
    shortLabel: "Caminho",
    icon: Compass,
    color: "pillar-guidance",
    description: "Seu GPS profissional",
  },
];

export function AppShell({ children, activeSection, onSectionChange }: AppShellProps) {
  const navigate = useNavigate();
  const { user, profile, isAuthenticated, signOut } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const displayName = profile?.nickname || user?.email?.split("@")[0] || "Conta";
  const avatarInitial = displayName.charAt(0).toUpperCase() || "G";

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-background mesh-background">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg font-display">G</span>
              </div>
              <span className="font-display font-bold text-xl text-foreground hidden sm:block">
                Gameia
              </span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onSectionChange(item.id)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200",
                    activeSection === item.id
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="font-medium text-sm">{item.shortLabel}</span>
                </button>
              ))}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              {isAuthenticated ? (
                <>
                  <button
                    type="button"
                    onClick={() => onSectionChange("profile")}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-xl transition-all",
                      activeSection === "profile" ? "bg-primary/10" : "hover:bg-muted/50"
                    )}
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                      <span className="text-primary-foreground text-sm font-semibold">
                        {avatarInitial}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-foreground hidden lg:block">
                      {displayName}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all hidden sm:flex"
                    title="Sair"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => navigate("/auth")}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-all"
                >
                  <LogIn className="w-4 h-4" />
                  <span className="hidden sm:inline">Entrar</span>
                </button>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all md:hidden"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-lg"
            >
              <div className="px-4 py-3 space-y-1">
                {NAV_ITEMS.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      onSectionChange(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
                      activeSection === item.id
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    <div className="text-left">
                      <div className="font-medium text-sm">{item.label}</div>
                      <div className="text-xs text-muted-foreground">{item.description}</div>
                    </div>
                  </button>
                ))}
                {isAuthenticated && (
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-destructive hover:bg-destructive/10 transition-all"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium text-sm">Sair da conta</span>
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation (Mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t border-border/50 bg-background/95 backdrop-blur-lg safe-area-pb">
        <div className="flex items-center justify-around py-2">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={cn(
                "flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all",
                activeSection === item.id
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-xs font-medium">{item.shortLabel}</span>
            </button>
          ))}
          <button
            onClick={() => onSectionChange("profile")}
            className={cn(
              "flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all",
              activeSection === "profile"
                ? "text-primary"
                : "text-muted-foreground"
            )}
          >
            <User className="w-5 h-5" />
            <span className="text-xs font-medium">Perfil</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
