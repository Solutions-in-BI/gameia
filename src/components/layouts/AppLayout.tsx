/**
 * AppLayout - Layout base do aplicativo com navegação por rotas
 */

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, 
  Swords, 
  TrendingUp, 
  Compass,
  Menu,
  X,
  LogIn,
  Coins,
  GraduationCap,
  ShoppingBag,
} from "lucide-react";
import { useNavigate, useLocation, Link, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useStreak } from "@/hooks/useStreak";
import { useLevel } from "@/hooks/useLevel";
import { useTitles } from "@/hooks/useTitles";
import { useGamificationListener } from "@/hooks/useGamificationListener";
import { useInsignias } from "@/hooks/useInsignias";
import { useDailyMissions } from "@/hooks/useDailyMissions";
import { useMarketplace } from "@/hooks/useMarketplace";
import { useRealtimeHub } from "@/hooks/useRealtimeHub";
import { cn } from "@/lib/utils";
import { UserSettingsDropdown } from "@/components/game/common/UserSettingsDropdown";
import { StreakModal } from "@/components/game/common/StreakModal";
import { NotificationsDropdown } from "@/components/notifications/NotificationsDropdown";
import { Logo } from "@/components/common/Logo";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const NAV_ITEMS = [
  { path: "/app", label: "Início", shortLabel: "Início", icon: LayoutDashboard, exact: true },
  { path: "/app/arena", label: "Arena", shortLabel: "Arena", icon: Swords },
  { path: "/app/evolution", label: "Evolução", shortLabel: "Evolução", icon: TrendingUp },
  { path: "/app/caminho", label: "Caminho", shortLabel: "Caminho", icon: Compass },
];

const SECONDARY_NAV = [
  { path: "/app/trainings", label: "Treinamentos", icon: GraduationCap },
  { path: "/app/marketplace", label: "Loja", icon: ShoppingBag },
];

export function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, isAuthenticated, signOut } = useAuth();
  const { streak, canClaimToday, isAtRisk, claimDailyReward } = useStreak();
  const { level, xp } = useLevel();
  const { selectedTitle } = useTitles();
  const { checkAndUnlockInsignias, refetch: refetchInsignias } = useInsignias();
  const { refetch: refetchMissions } = useDailyMissions();
  const { coins } = useMarketplace();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [streakModalOpen, setStreakModalOpen] = useState(false);

  useRealtimeHub();

  const handleGamificationEvent = useCallback(async () => {
    await Promise.all([
      refetchMissions(),
      refetchInsignias(),
      checkAndUnlockInsignias()
    ]);
  }, [refetchMissions, refetchInsignias, checkAndUnlockInsignias]);

  useGamificationListener({ onEvent: handleGamificationEvent });

  const displayName = profile?.nickname || user?.email?.split("@")[0] || "Conta";
  const selectedTitleName = selectedTitle?.name || null;

  const isActive = (path: string, exact = false) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  const handleLogout = useCallback(async () => {
    await signOut();
  }, [signOut]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full bg-card/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 gap-6">
            {/* Logo */}
            <div className="flex items-center gap-8">
              <Link to="/app">
                <Logo variant="full" size="sm" className="hidden sm:flex" />
                <Logo variant="icon" size="sm" className="sm:hidden" />
              </Link>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center">
                <div className="flex items-center bg-muted/40 p-1 rounded-lg">
                  {NAV_ITEMS.map((item) => {
                    const active = isActive(item.path, item.exact);
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={cn(
                          "relative flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200",
                          active
                            ? "text-primary"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {active && (
                          <motion.div
                            layoutId="activeNavItem"
                            className="absolute inset-0 bg-card rounded-md shadow-sm border border-border/50"
                            transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                          />
                        )}
                        <span className="relative z-10 flex items-center gap-2">
                          <item.icon className="w-4 h-4" />
                          {item.label}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </nav>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-1">
              {/* Quick Actions */}
              <div className="hidden sm:flex items-center gap-1 mr-2">
                {SECONDARY_NAV.map((item) => (
                  <Tooltip key={item.path}>
                    <TooltipTrigger asChild>
                      <Link
                        to={item.path}
                        className={cn(
                          "flex items-center gap-1.5 h-9 px-3 rounded-lg transition-colors",
                          isActive(item.path) 
                            ? "text-primary bg-primary/10" 
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        )}
                      >
                        <item.icon className="w-[18px] h-[18px]" />
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">{item.label}</TooltipContent>
                  </Tooltip>
                ))}

                <div className="h-6 w-px bg-border mx-1" />

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
                  <TooltipContent side="bottom">Suas moedas</TooltipContent>
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
                    level={level}
                    xp={xp}
                    selectedTitle={selectedTitleName}
                    onViewProfile={() => navigate("/app/evolution")}
                    onViewStreak={() => setStreakModalOpen(true)}
                    onLogout={handleLogout}
                  />
                </div>
              ) : (
                <Link to="/auth" className="btn-primary">
                  <LogIn className="w-4 h-4" />
                  <span className="hidden sm:inline">Entrar</span>
                </Link>
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
                <div className="flex gap-2">
                  {SECONDARY_NAV.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex-1 flex items-center justify-center gap-2 p-3 rounded-lg bg-muted/50 text-foreground hover:bg-muted transition-colors"
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium text-sm">{item.label}</span>
                    </Link>
                  ))}
                </div>

                <div className="h-px bg-border" />

                {/* Nav Items */}
                <div className="space-y-1">
                  {NAV_ITEMS.map((item) => {
                    const active = isActive(item.path, item.exact);
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                          active
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        )}
                      >
                        <item.icon className="w-5 h-5" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pb-28 md:pb-8">
        <Outlet />
      </main>

      {/* Bottom Navigation (Mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-card border-t border-border safe-area-pb">
        <div className="flex items-center justify-around py-2 px-2">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.path, item.exact);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "relative flex flex-col items-center gap-1 py-2 px-4 rounded-lg transition-colors",
                  active ? "text-primary" : "text-muted-foreground"
                )}
              >
                {active && (
                  <motion.div
                    layoutId="mobileActiveNavItem"
                    className="absolute inset-0 bg-primary/10 rounded-lg"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                  />
                )}
                <item.icon className="w-5 h-5 relative z-10" />
                <span className="text-[11px] font-medium relative z-10">{item.shortLabel}</span>
              </Link>
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
