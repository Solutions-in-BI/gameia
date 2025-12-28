/**
 * Gameia - Página Principal
 * Plataforma de Gamificação Empresarial
 */

import { useState } from "react";
import { AppShell, GameiaSection, DashboardTab } from "@/components/skillpath/layout/AppShell";
import { GamificationSection } from "@/components/skillpath/gamification/GamificationSection";
import { GuidanceSection } from "@/components/skillpath/guidance/GuidanceSection";
import { UnifiedProfileSection } from "@/components/skillpath/profile/UnifiedProfileSection";
import { DevelopmentSection } from "@/components/game/development";
import { useRealtimeNotifications } from "@/hooks/useRealtimeNotifications";

const Index = () => {
  const [activeSection, setActiveSection] = useState<GameiaSection>("gamification");
  const [activeTab, setActiveTab] = useState<DashboardTab>("dashboard");
  
  // Ativa notificações em tempo real
  useRealtimeNotifications();

  const renderSection = () => {
    switch (activeSection) {
      case "gamification":
        return <GamificationSection activeTab={activeTab} onTabChange={setActiveTab} />;
      case "development":
        return <DevelopmentSection />;
      case "guidance":
        return <GuidanceSection />;
      case "profile":
        return <UnifiedProfileSection />;
      default:
        return <GamificationSection activeTab={activeTab} onTabChange={setActiveTab} />;
    }
  };

  return (
    <AppShell 
      activeSection={activeSection} 
      onSectionChange={setActiveSection}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {renderSection()}
    </AppShell>
  );
};

export default Index;
