/**
 * HubLayout - Premium SaaS Layout
 * Clean, enterprise-grade navigation with clear hierarchy
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
  BookOpen,
  ShoppingBag,
  Coins
} from "lucide-react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useStreak } from "@/hooks/useStreak";
import { useGamificationListener } from "@/hooks/useGamificationListener";
import { useInsignias } from "@/hooks/useInsignias";
import { useDailyMissions } from "@/hooks/useDailyMissions";
import { useMarketplace } from "@/hooks/useMarketplace";
import { cn } from "@/lib/utils";
import { UserSettingsDropdown } from "@/components/game/common/UserSettingsDropdown";
import { StreakModal } from "@/components/game/common/StreakModal";
import { NotificationsDropdown } from "@/components/notifications/NotificationsDropdown";
import { Logo } from "@/components/common/Logo";
import { HubOverview } from "./HubOverview";
import { ArenaTab } from "./arena/ArenaTab";
import { EvolutionTab } from "./evolution/EvolutionTab";
import { CaminhoTab } from "./caminho/CaminhoTab";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export type HubTab = "overview" | "arena" | "evolution" | "caminho";

const HUB_TABS = [
  { id: "overview" as const, label: "Visão Geral", shortLabel: "Início", icon: LayoutDashboard },
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
  const { coins } = useMarketplace();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [streakModalOpen, setStreakModalOpen] = useState(false);

  useGamificationListener({
    onEvent: async () => {
      await Promise.all([
        refetchMissions(),
        refetchInsignias(),
        checkAndUnlockInsignias()
      ]);
    }
  });

  const activeTab = (searchParams.get("tab") as HubTab) || "overview";
  const displayName = profile?.nickname || user?.email?.split("@")[0] || "Conta";

  const handleTabChange = (tab: HubTab) => {
    setSearchParams({ tab });
    setMobileMenuOpen(false);
  };

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
    <div className="min-h-screen bg-background">
      {/* Premium Header */}
      <header className="sticky top-0 z-50 w-full bg-card/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 gap-6">
            {/* Logo */}
            <div className="flex items-center gap-8">
              <Logo variant="full" size="sm" className="hidden sm:flex" />
              <Logo variant="icon" size="sm" className="sm:hidden" />

              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center">
                <div className="flex items-center bg-muted/40 p-1 rounded-lg">
                  {HUB_TABS.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => handleTabChange(tab.id)}
                      className={cn(
                        "relative flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200",
                        activeTab === tab.id
                          ? "text-primary"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {activeTab === tab.id && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute inset-0 bg-card rounded-md shadow-sm border border-border/50"
                          transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                        />
                      )}
                      <span className="relative z-10 flex items-center gap-2">
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                      </span>
                    </button>
                  ))}
                </div>
              </nav>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-1">
              {/* Quick Actions */}
              <div className="hidden sm:flex items-center gap-1 mr-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      to="/app/trainings"
                      className="flex items-center justify-center w-9 h-9 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                    >
                      <BookOpen className="w-[18px] h-[18px]" />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">Treinamentos</TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      to="/app/marketplace"
                      className="flex items-center gap-1.5 h-9 px-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                    >
                      <Coins className="w-[18px] h-[18px] text-amber-500" />
                      <span className="text-sm font-semibold tabular-nums">{coins}</span>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">Loja de Recompensas</TooltipContent>
                </Tooltip>
              </div>

              <div className="h-6 w-px bg-border hidden sm:block" />

              {isAuthenticated ? (
                <div className="flex items-center gap-1">
                  <NotificationsDropdown />
                  <UserSettingsDropdown
                    displayName={displayName}
                    avatarUrl={profile?.avatar_url}
                    streak={streak.currentStreak}
                    onViewProfile={() => handleTabChange("evolution")}
                    onViewStreak={() => setStreakModalOpen(true)}
                    onLogout={handleLogout}
                  />
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => navigate("/auth")}
                  className="btn-primary"
                >
                  <LogIn className="w-4 h-4" />
                  <span className="hidden sm:inline">Entrar</span>
                </button>
              )}

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors md:hidden"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden border-t border-border/50 bg-card"
            >
              <div className="p-4 space-y-3">
                {/* Quick Access */}
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to="/app/trainings"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 p-3 rounded-lg bg-muted/50 text-foreground hover:bg-muted transition-colors"
                  >
                    <BookOpen className="w-5 h-5 text-primary" />
                    <span className="font-medium text-sm">Treinamentos</span>
                  </Link>
                  <Link
                    to="/app/marketplace"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 p-3 rounded-lg bg-muted/50 text-foreground hover:bg-muted transition-colors"
                  >
                    <Coins className="w-5 h-5 text-amber-500" />
                    <span className="font-medium text-sm">{coins} moedas</span>
                  </Link>
                </div>

                <div className="h-px bg-border" />

                {/* Nav Items */}
                <div className="space-y-1">
                  {HUB_TABS.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => handleTabChange(tab.id)}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left",
                        activeTab === tab.id
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      )}
                    >
                      <tab.icon className="w-5 h-5" />
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pb-28 md:pb-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
          >
            {renderTabContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation (Mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-card border-t border-border safe-area-pb">
        <div className="flex items-center justify-around py-2 px-2">
          {HUB_TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={cn(
                  "relative flex flex-col items-center gap-1 py-2 px-4 rounded-lg transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="mobileActiveTab"
                    className="absolute inset-0 bg-primary/10 rounded-lg"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                  />
                )}
                <tab.icon className="w-5 h-5 relative z-10" />
                <span className="text-[11px] font-medium relative z-10">{tab.shortLabel}</span>
              </button>
            );
          })}
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
