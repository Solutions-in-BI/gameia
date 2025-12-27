/**
 * Gameia - Página Principal
 * Plataforma de Gamificação Empresarial
 */

import { useState } from "react";
import { AppShell, GameiaSection } from "@/components/skillpath/layout/AppShell";
import { GamificationSection } from "@/components/skillpath/gamification/GamificationSection";
import { GuidanceSection } from "@/components/skillpath/guidance/GuidanceSection";
import { UnifiedProfileSection } from "@/components/skillpath/profile/UnifiedProfileSection";
import { useRealtimeNotifications } from "@/hooks/useRealtimeNotifications";

const Index = () => {
  const [activeSection, setActiveSection] = useState<GameiaSection>("gamification");
  
  // Ativa notificações em tempo real
  useRealtimeNotifications();

  const renderSection = () => {
    switch (activeSection) {
      case "gamification":
        return <GamificationSection />;
      case "guidance":
        return <GuidanceSection />;
      case "profile":
        return <UnifiedProfileSection />;
      default:
        return <GamificationSection />;
    }
  };

  return (
    <AppShell activeSection={activeSection} onSectionChange={setActiveSection}>
      {renderSection()}
    </AppShell>
  );
};

export default Index;
