/**
 * Shell principal da aplicação Gameia
 * Header com navegação completa: Badges, Jogos, Apostas, Skills, Loja, Ranking
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Gamepad2, 
  Compass, 
  User, 
  LogOut, 
  LogIn,
  Menu,
  X,
  Trophy,
  Ticket,
  Target,
  Store,
  Crown,
  LayoutDashboard
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { useStreak } from "@/hooks/useStreak";
import { cn } from "@/lib/utils";
import { UserSettingsDropdown } from "@/components/game/common/UserSettingsDropdown";
import { StreakModal } from "@/components/game/common/StreakModal";
import { NotificationsDropdown } from "@/components/notifications/NotificationsDropdown";

export type GameiaSection = "gamification" | "guidance" | "profile";
export type DashboardTab = "dashboard" | "badges" | "trainings" | "games" | "bets" | "skills" | "store" | "ranking";

interface AppShellProps {
  children: React.ReactNode;
  activeSection: GameiaSection;
  onSectionChange: (section: GameiaSection) => void;
  activeTab?: DashboardTab;
  onTabChange?: (tab: DashboardTab) => void;
}

// Header nav items with icons
const HEADER_NAV_ITEMS: { id: DashboardTab; label: string; icon: React.ElementType }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "badges", label: "Insígnias", icon: Trophy },
  { id: "trainings", label: "Treinamentos", icon: Gamepad2 },
  { id: "games", label: "Jogos", icon: Gamepad2 },
  { id: "skills", label: "Skills", icon: Target },
  { id: "store", label: "Loja", icon: Store },
  { id: "ranking", label: "Ranking", icon: Crown },
];

const MAIN_NAV_ITEMS = [
  {
    id: "gamification" as const,
    label: "Treinamento",
    shortLabel: "Treinar",
    icon: Gamepad2,
    description: "Games, Quiz e Cenários",
  },
  {
    id: "guidance" as const,
    label: "Orientação",
    shortLabel: "Caminho",
    icon: Compass,
    description: "Seu GPS profissional",
  },
];

// Storage key for streak modal
const STREAK_MODAL_KEY = "gameia_streak_modal_last_shown";

export function AppShell({ 
  children, 
  activeSection, 
  onSectionChange, 
  activeTab = "dashboard",
  onTabChange 
}: AppShellProps) {
  const navigate = useNavigate();
  const { user, profile, isAuthenticated, signOut } = useAuth();
  const { isDark } = useTheme();
  const { streak, canClaimToday, isAtRisk, claimDailyReward } = useStreak();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [streakModalOpen, setStreakModalOpen] = useState(false);

  const displayName = profile?.nickname || user?.email?.split("@")[0] || "Conta";

  // Check if streak modal should be shown today
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const lastShown = localStorage.getItem(STREAK_MODAL_KEY);
    const today = new Date().toDateString();
    
    if (lastShown !== today && (canClaimToday || streak.currentStreak > 0)) {
      setStreakModalOpen(true);
      localStorage.setItem(STREAK_MODAL_KEY, today);
    }
  }, [isAuthenticated, canClaimToday, streak.currentStreak]);

  const handleLogout = async () => {
    await signOut();
  };

  const handleTabClick = (tab: DashboardTab) => {
    if (activeSection !== "gamification") {
      onSectionChange("gamification");
    }
    onTabChange?.(tab);
  };

  return (
    <div className="min-h-screen bg-background mesh-background">
      {/* Top Navigation Bar - Single Line */}
      <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14 gap-4">
            {/* Logo */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm font-display">G</span>
              </div>
              <span className="font-display font-bold text-lg text-foreground hidden lg:block">
                Gameia
              </span>
            </div>

            {/* Center Navigation - Dashboard Tabs */}
            {activeSection === "gamification" && (
              <nav className="hidden md:flex items-center gap-0.5 bg-muted/50 p-1 rounded-xl overflow-x-auto flex-1 max-w-2xl mx-4">
                {HEADER_NAV_ITEMS.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleTabClick(item.id)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-200 text-sm whitespace-nowrap",
                      activeTab === item.id
                        ? "bg-primary text-primary-foreground font-medium shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                    )}
                  >
                    <item.icon className="w-4 h-4" />
                    <span className="hidden lg:inline">{item.label}</span>
                  </button>
                ))}
              </nav>
            )}

            {/* Section toggle + User - aligned to right */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Main Section Toggle (Treinar / Caminho) */}
              <div className="hidden md:flex items-center gap-0.5 bg-muted/50 p-1 rounded-xl">
                {MAIN_NAV_ITEMS.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => onSectionChange(item.id)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-200 font-medium text-sm",
                      activeSection === item.id
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <item.icon className="w-4 h-4" />
                    <span className="hidden xl:inline">{item.shortLabel}</span>
                  </button>
                ))}
              </div>

              {/* Notifications + User dropdown or login */}
              {isAuthenticated ? (
                <>
                  <NotificationsDropdown />
                  <UserSettingsDropdown
                    displayName={displayName}
                    avatarUrl={profile?.avatar_url}
                    streak={streak.currentStreak}
                    onViewProfile={() => onSectionChange("profile")}
                    onViewStreak={() => setStreakModalOpen(true)}
                    onLogout={handleLogout}
                  />
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => navigate("/auth")}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-all"
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
                {MAIN_NAV_ITEMS.map((item) => (
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
                
                {/* Dashboard tabs in mobile */}
                {activeSection === "gamification" && (
                  <>
                    <div className="h-px bg-border/50 my-2" />
                    <div className="grid grid-cols-4 gap-1">
                      {HEADER_NAV_ITEMS.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => {
                            handleTabClick(item.id);
                            setMobileMenuOpen(false);
                          }}
                          className={cn(
                            "flex flex-col items-center gap-1 p-2 rounded-lg transition-all text-xs",
                            activeTab === item.id
                              ? "bg-primary/10 text-primary"
                              : "text-muted-foreground hover:text-foreground"
                          )}
                        >
                          <item.icon className="w-4 h-4" />
                          <span>{item.label}</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
                
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${activeSection}-${activeTab}`}
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
          {MAIN_NAV_ITEMS.map((item) => (
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

      {/* Streak Modal */}
      <StreakModal
        isOpen={streakModalOpen}
        onClose={() => setStreakModalOpen(false)}
        currentStreak={streak.currentStreak}
        longestStreak={streak.longestStreak}
        canClaim={canClaimToday}
        isAtRisk={isAtRisk}
        onClaim={claimDailyReward}
      />
    </div>
  );
}
