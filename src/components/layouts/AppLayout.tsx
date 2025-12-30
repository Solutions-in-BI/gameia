/**
 * AppLayout - Layout base do aplicativo com navegação horizontal + dropdowns + sidebar
 */

import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, 
  Swords, 
  TrendingUp, 
  Compass,
  Menu,
  LogIn,
  Coins,
  GraduationCap,
  ShoppingBag,
  ChevronDown,
  Route,
  Award,
  Gamepad2,
  Target,
  Brain,
  MessageSquare,
  BarChart3,
  History,
  Sparkles,
  Users,
  Calendar,
  UsersRound,
  PanelLeft,
  LucideIcon,
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
import { useOrganization } from "@/hooks/useOrganization";
import { cn } from "@/lib/utils";
import { UserSettingsDropdown } from "@/components/game/common/UserSettingsDropdown";
import { StreakModal } from "@/components/game/common/StreakModal";
import { NotificationsDropdown } from "@/components/notifications/NotificationsDropdown";
import { Logo } from "@/components/common/Logo";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { AppSidebar, MobileSidebar, SidebarItem } from "./AppSidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Sub-navigation items per section
interface NavSection {
  path: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
  subnav?: SidebarItem[];
}

const NAV_SECTIONS: NavSection[] = [
  { 
    path: "/app", 
    label: "Início", 
    icon: LayoutDashboard, 
    exact: true,
    // No subnav for home
  },
  { 
    path: "/app/arena", 
    label: "Arena", 
    icon: Swords,
    subnav: [
      { id: "all", label: "Todos", icon: Gamepad2 },
      { id: "games", label: "Jogos", icon: Gamepad2 },
      { id: "challenges", label: "Desafios", icon: Target },
      { id: "cognitive", label: "Testes", icon: Brain },
      { id: "simulations", label: "Simulações", icon: MessageSquare },
    ],
  },
  { 
    path: "/app/development", 
    label: "Desenvolvimento", 
    icon: GraduationCap,
    subnav: [
      { id: "journeys", label: "Jornadas", icon: Route },
      { id: "trainings", label: "Treinamentos", icon: GraduationCap },
      { id: "certificates", label: "Certificados", icon: Award },
    ],
  },
  { 
    path: "/app/evolution", 
    label: "Evolução", 
    icon: TrendingUp,
    subnav: [
      { id: "summary", label: "Resumo", icon: BarChart3 },
      { id: "history", label: "Histórico", icon: History },
      { id: "challenges", label: "Desafios", icon: Target },
      { id: "insignias", label: "Insígnias", icon: Award },
      { id: "skills", label: "Skills", icon: Sparkles },
      { id: "pdi", label: "PDI", icon: TrendingUp },
      { id: "feedback", label: "Feedback 360", icon: Users },
      { id: "1on1", label: "1:1", icon: Calendar },
    ],
  },
  { 
    path: "/app/caminho", 
    label: "Caminho", 
    icon: Compass,
    // No subnav for caminho
  },
];

// Manager-only sub-nav item
const MANAGER_SUBNAV_ITEM: SidebarItem = { id: "team", label: "Meu Time", icon: UsersRound };

const SECONDARY_NAV = [
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
  const { isAdmin } = useOrganization();
  
  const [streakModalOpen, setStreakModalOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

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

  // Get current section from path
  const currentSection = useMemo(() => {
    // Check exact match first
    const exactMatch = NAV_SECTIONS.find(s => s.exact && location.pathname === s.path);
    if (exactMatch) return exactMatch;
    
    // Then check prefix match (longest first)
    const sortedSections = [...NAV_SECTIONS].filter(s => !s.exact).sort((a, b) => b.path.length - a.path.length);
    return sortedSections.find(s => location.pathname.startsWith(s.path)) || NAV_SECTIONS[0];
  }, [location.pathname]);

  // Get sub-navigation items for current section
  const sidebarItems = useMemo(() => {
    const baseItems = currentSection.subnav || [];
    // Add manager item for evolution if user is admin
    if (currentSection.path === "/app/evolution" && isAdmin) {
      return [...baseItems, MANAGER_SUBNAV_ITEM];
    }
    return baseItems;
  }, [currentSection, isAdmin]);

  // Get active subtab from URL search params
  const searchParams = new URLSearchParams(location.search);
  const activeSubtab = searchParams.get("tab") || sidebarItems[0]?.id || "";

  const handleSubtabChange = useCallback((subtab: string) => {
    const params = new URLSearchParams(location.search);
    params.set("tab", subtab);
    navigate(`${location.pathname}?${params.toString()}`, { replace: true });
  }, [navigate, location.pathname, location.search]);

  const handleSectionChange = useCallback((path: string, subtab?: string) => {
    if (subtab) {
      navigate(`${path}?tab=${subtab}`);
    } else {
      navigate(path);
    }
  }, [navigate]);

  const handleLogout = useCallback(async () => {
    await signOut();
  }, [signOut]);

  const hasSidebar = sidebarItems.length > 0;

  const isActive = (path: string, exact = false) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full bg-card/80 backdrop-blur-xl border-b border-border/50">
        <div className="px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Left: Logo + Navigation */}
            <div className="flex items-center gap-6">
              <Link to="/app">
                <Logo variant="full" size="sm" className="hidden sm:flex" />
                <Logo variant="icon" size="sm" className="sm:hidden" />
              </Link>

              {/* Desktop Navigation with Dropdowns */}
              <nav className="hidden md:flex items-center">
                <div className="flex items-center bg-muted/40 p-1 rounded-lg">
                  {NAV_SECTIONS.map((section) => {
                    const active = isActive(section.path, section.exact);
                    const SectionIcon = section.icon;
                    const hasSubnav = section.subnav && section.subnav.length > 0;

                    // If has subnav, render dropdown
                    if (hasSubnav) {
                      return (
                        <DropdownMenu key={section.path}>
                          <DropdownMenuTrigger asChild>
                            <button
                              onClick={() => {
                                // Navigate to section on click (first subtab)
                                if (!active) {
                                  handleSectionChange(section.path, section.subnav?.[0]?.id);
                                }
                              }}
                              className={cn(
                                "relative flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200",
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
                              <span className="relative z-10 flex items-center gap-1.5">
                                <SectionIcon className="w-4 h-4" />
                                <span className="hidden lg:inline">{section.label}</span>
                                <ChevronDown className="w-3 h-3 opacity-60" />
                              </span>
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start" className="w-48 bg-popover">
                            {section.subnav?.map((item) => {
                              const ItemIcon = item.icon;
                              const isItemActive = active && activeSubtab === item.id;
                              return (
                                <DropdownMenuItem
                                  key={item.id}
                                  onClick={() => handleSectionChange(section.path, item.id)}
                                  className={cn(
                                    "flex items-center gap-2 cursor-pointer",
                                    isItemActive && "bg-primary/10 text-primary"
                                  )}
                                >
                                  <ItemIcon className="w-4 h-4" />
                                  <span>{item.label}</span>
                                  {isItemActive && (
                                    <span className="ml-auto text-xs text-primary">✓</span>
                                  )}
                                </DropdownMenuItem>
                              );
                            })}
                            {/* Manager item for evolution */}
                            {section.path === "/app/evolution" && isAdmin && (
                              <DropdownMenuItem
                                onClick={() => handleSectionChange(section.path, "team")}
                                className={cn(
                                  "flex items-center gap-2 cursor-pointer",
                                  active && activeSubtab === "team" && "bg-primary/10 text-primary"
                                )}
                              >
                                <UsersRound className="w-4 h-4" />
                                <span>Meu Time</span>
                                {active && activeSubtab === "team" && (
                                  <span className="ml-auto text-xs text-primary">✓</span>
                                )}
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      );
                    }

                    // No subnav, simple link
                    return (
                      <Link
                        key={section.path}
                        to={section.path}
                        className={cn(
                          "relative flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200",
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
                        <span className="relative z-10 flex items-center gap-1.5">
                          <SectionIcon className="w-4 h-4" />
                          <span className="hidden lg:inline">{section.label}</span>
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </nav>

              {/* Mobile: Sidebar trigger */}
              {hasSidebar && (
                <button
                  onClick={() => setMobileSidebarOpen(true)}
                  className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors md:hidden"
                >
                  <PanelLeft className="w-5 h-5" />
                </button>
              )}
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
                          location.pathname.startsWith(item.path) 
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors md:hidden">
                    <Menu className="w-5 h-5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-popover">
                  {NAV_SECTIONS.map((section) => {
                    const isActiveSection = isActive(section.path, section.exact);
                    const SectionIcon = section.icon;
                    return (
                      <DropdownMenuItem
                        key={section.path}
                        onClick={() => handleSectionChange(section.path)}
                        className={cn(
                          "flex items-center gap-3 py-3 cursor-pointer",
                          isActiveSection && "bg-primary/10 text-primary"
                        )}
                      >
                        <SectionIcon className="w-5 h-5" />
                        <span>{section.label}</span>
                      </DropdownMenuItem>
                    );
                  })}
                  <div className="h-px bg-border my-2" />
                  {SECONDARY_NAV.map((item) => (
                    <DropdownMenuItem
                      key={item.path}
                      onClick={() => navigate(item.path)}
                      className="flex items-center gap-3 py-3 cursor-pointer"
                    >
                      <item.icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuItem
                    onClick={() => navigate("/app/marketplace")}
                    className="flex items-center gap-3 py-3 cursor-pointer"
                  >
                    <Coins className="w-5 h-5 text-amber-500" />
                    <span>Moedas: {coins}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content with Sidebar */}
      <div className="flex-1 flex w-full">
        {/* Sidebar (desktop) */}
        {hasSidebar && (
          <AppSidebar
            items={sidebarItems}
            activeItem={activeSubtab}
            onItemChange={handleSubtabChange}
            title={currentSection.label}
          />
        )}

        {/* Mobile Sidebar Sheet */}
        {hasSidebar && (
          <MobileSidebar
            items={sidebarItems}
            activeItem={activeSubtab}
            onItemChange={handleSubtabChange}
            title={currentSection.label}
            isOpen={mobileSidebarOpen}
            onClose={() => setMobileSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className={cn(
          "flex-1 px-4 sm:px-6 py-6 pb-24 md:pb-8 overflow-x-hidden",
          hasSidebar ? "max-w-6xl" : "max-w-7xl mx-auto"
        )}>
          <Outlet context={{ activeSubtab, onSubtabChange: handleSubtabChange }} />
        </main>
      </div>

      {/* Bottom Navigation (Mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-card border-t border-border safe-area-pb">
        <div className="flex items-center justify-around py-2 px-2">
          {NAV_SECTIONS.map((item) => {
            const active = isActive(item.path, item.exact);
            const ItemIcon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "relative flex flex-col items-center gap-1 py-2 px-3 rounded-lg transition-colors",
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
                <ItemIcon className="w-5 h-5 relative z-10" />
                <span className="text-[10px] font-medium relative z-10">{item.label}</span>
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

// Hook for child components to access subtab state
export function useAppLayoutContext() {
  return null;
}
