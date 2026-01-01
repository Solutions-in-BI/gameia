import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, TrendingUp, Swords, ShoppingBag, 
  History, Settings, ArrowLeft, Crown, Award, StickyNote, Menu
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useLevel } from "@/hooks/useLevel";
import { useRoles } from "@/hooks/useRoles";
import { AppSidebar, MobileSidebar, SidebarItem } from "@/components/layouts/AppSidebar";
import { ProfileHeader } from "./common/ProfileHeader";
import { OverviewTab } from "./tabs/OverviewTab";
import { EvolutionTab } from "./tabs/EvolutionTab";
import { ArenaTab } from "./tabs/ArenaTab";
import { ShopTab } from "./tabs/ShopTab";
import { HistoryTab } from "./tabs/HistoryTab";
import { SettingsTab } from "./tabs/SettingsTab";
import { CertificationsTab } from "./tabs/CertificationsTab";
import { NotesTab } from "./tabs/NotesTab";
import { getLevelProgress } from "@/constants/levels";

type TabId = "overview" | "evolution" | "arena" | "shop" | "certifications" | "notes" | "history" | "settings";

const sidebarItems: SidebarItem[] = [
  { id: "overview", label: "Visão Geral", icon: User },
  { id: "evolution", label: "Evolução", icon: TrendingUp },
  { id: "notes", label: "Anotações", icon: StickyNote },
  { id: "arena", label: "Arena", icon: Swords },
  { id: "shop", label: "Loja", icon: ShoppingBag },
  { id: "certifications", label: "Certificados", icon: Award },
  { id: "history", label: "Histórico", icon: History },
  { id: "settings", label: "Configurações", icon: Settings },
];

export function ProfileLayout() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { level, xp, levelInfo } = useLevel();
  const { highestRole } = useRoles();
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const xpProgress = getLevelProgress(xp, level);
  const xpForNextLevel = levelInfo.xpRequired;
  const currentXP = xp - (levelInfo.xpRequired - (levelInfo.xpRequired - xp % levelInfo.xpRequired));

  const isMaster = highestRole === "super_admin" || (highestRole as string) === "owner";
  const isAdmin = isMaster || highestRole === "admin";

  if (!user) {
    return (
      <div className="min-h-screen bg-background mesh-background flex items-center justify-center p-4">
        <div className="surface p-8 text-center max-w-md">
          <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Faça login para continuar</h2>
          <p className="text-muted-foreground mb-4">
            Acesse sua conta para ver seu perfil
          </p>
          <Button onClick={() => navigate("/auth")}>Entrar</Button>
        </div>
      </div>
    );
  }

  const handleTabChange = (id: string) => {
    setActiveTab(id as TabId);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return <OverviewTab />;
      case "evolution":
        return <EvolutionTab />;
      case "notes":
        return <NotesTab />;
      case "arena":
        return <ArenaTab />;
      case "shop":
        return <ShopTab />;
      case "certifications":
        return <CertificationsTab />;
      case "history":
        return <HistoryTab />;
      case "settings":
        return <SettingsTab />;
      default:
        return <OverviewTab />;
    }
  };

  return (
    <div className="min-h-screen bg-background mesh-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-border/40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate("/app")}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Voltar</span>
            </Button>
            
            {/* Mobile menu toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            {isMaster && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30">
                <Crown className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-medium text-primary">
                  Master
                </span>
              </div>
            )}
            {!isMaster && isAdmin && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/30">
                <span className="text-xs font-medium text-primary">Admin</span>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex flex-1 max-w-7xl mx-auto w-full">
        {/* Sidebar */}
        <AppSidebar
          items={sidebarItems}
          activeItem={activeTab}
          onItemChange={handleTabChange}
          title="Meu Perfil"
        />

        {/* Mobile Sidebar */}
        <MobileSidebar
          items={sidebarItems}
          activeItem={activeTab}
          onItemChange={handleTabChange}
          title="Meu Perfil"
          isOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
        />

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6 space-y-6 overflow-auto">
          {/* Profile Header Card - Compact version */}
          <ProfileHeader 
            profile={profile}
            level={level}
            currentXP={currentXP}
            xpForNextLevel={xpForNextLevel}
            xpProgress={xpProgress}
            isMaster={isMaster}
            isAdmin={isAdmin}
          />

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="min-h-[400px]"
            >
              {renderTabContent()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
