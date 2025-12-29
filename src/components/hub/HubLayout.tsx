/**
 * HubLayout - Layout base unificado do hub
 * Estrutura: Header + 4 Tabs (Overview, Arena, Evolution, Caminho)
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, 
  Gamepad2, 
  TrendingUp, 
  Compass,
  Menu,
  X,
  LogIn,
  User
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useStreak } from "@/hooks/useStreak";
import { useGamificationListener } from "@/hooks/useGamificationListener";
import { useInsignias } from "@/hooks/useInsignias";
import { useDailyMissions } from "@/hooks/useDailyMissions";
import { cn } from "@/lib/utils";
import { UserSettingsDropdown } from "@/components/game/common/UserSettingsDropdown";
import { StreakModal } from "@/components/game/common/StreakModal";
import { NotificationsDropdown } from "@/components/notifications/NotificationsDropdown";
import { Logo } from "@/components/common/Logo";
import { HubOverview } from "./HubOverview";
import { ArenaTab } from "./arena/ArenaTab";
import { EvolutionTab } from "./evolution/EvolutionTab";
import { CaminhoTab } from "./caminho/CaminhoTab";

export type HubTab = "overview" | "arena" | "evolution" | "caminho";

const HUB_TABS = [
  { id: "overview" as const, label: "Visão Geral", shortLabel: "Geral", icon: LayoutDashboard },
  { id: "arena" as const, label: "Arena", shortLabel: "Arena", icon: Gamepad2 },
  { id: "evolution" as const, label: "Evolução", shortLabel: "Evolução", icon: TrendingUp },
  { id: "caminho" as const, label: "Caminho", shortLabel: "Caminho", icon: Compass },
];

const STREAK_MODAL_KEY = "gameia_streak_modal_last_shown";

export function HubLayout() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, profile, isAuthenticated, signOut } = useAuth();
  const { streak, canClaimToday, isAtRisk, claimDailyReward } = useStreak();
  const { checkAndUnlockInsignias, refetch: refetchInsignias } = useInsignias();
  const { refetch: refetchMissions } = useDailyMissions();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [streakModalOpen, setStreakModalOpen] = useState(false);

  // Listen for gamification events and update missions/insignias
  useGamificationListener({
    onEvent: async () => {
      console.log("[HubLayout] Gamification event detected, refreshing data");
      await Promise.all([
        refetchMissions(),
        refetchInsignias(),
        checkAndUnlockInsignias()
      ]);
    }
  });

  // Get active tab from URL or default to overview
  const activeTab = (searchParams.get("tab") as HubTab) || "overview";
  
  const displayName = profile?.nickname || user?.email?.split("@")[0] || "Conta";

  // Sync tab to URL
  const handleTabChange = (tab: HubTab) => {
    setSearchParams({ tab });
    setMobileMenuOpen(false);
  };

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

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return <HubOverview onNavigate={handleTabChange} />;
      case "arena":
        return <ArenaTab />;
      case "evolution":
        return <EvolutionTab />;
      case "caminho":
        return <CaminhoTab />;
      default:
        return <HubOverview onNavigate={handleTabChange} />;
    }
  };

  return (
    <div className="min-h-screen bg-background mesh-background">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14 gap-4">
            {/* Logo */}
            <Logo variant="full" size="sm" className="hidden sm:flex" />
            <Logo variant="icon" size="sm" className="sm:hidden" />

            {/* Center Navigation - Hub Tabs */}
            <nav className="hidden md:flex items-center gap-1 bg-muted/50 p-1 rounded-xl">
              {HUB_TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium",
                    activeTab === tab.id
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                  )}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>

            {/* Right side - User */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {isAuthenticated ? (
                <>
                  <NotificationsDropdown />
                  <UserSettingsDropdown
                    displayName={displayName}
                    avatarUrl={profile?.avatar_url}
                    streak={streak.currentStreak}
                    onViewProfile={() => handleTabChange("evolution")}
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
                {HUB_TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
                      activeTab === tab.id
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    )}
                  >
                    <tab.icon className="w-5 h-5" />
                    <span className="font-medium text-sm">{tab.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {renderTabContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation (Mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t border-border/50 bg-background/95 backdrop-blur-lg safe-area-pb">
        <div className="flex items-center justify-around py-2">
          {HUB_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={cn(
                "flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all",
                activeTab === tab.id
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              <tab.icon className="w-5 h-5" />
              <span className="text-xs font-medium">{tab.shortLabel}</span>
            </button>
          ))}
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
