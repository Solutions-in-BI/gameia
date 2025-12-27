/**
 * Seção de Gamificação Empresarial
 * Dashboard unificado com todos os elementos de jogo
 */

import { UnifiedDashboard } from "../dashboard/UnifiedDashboard";
import type { DashboardTab } from "../layout/AppShell";

interface GamificationSectionProps {
  activeTab?: DashboardTab;
  onTabChange?: (tab: DashboardTab) => void;
}

export function GamificationSection({ activeTab = "dashboard", onTabChange }: GamificationSectionProps) {
  return <UnifiedDashboard activeTab={activeTab} onTabChange={onTabChange} />;
}
