/**
 * Overview Page - Visão geral do app
 */

import { HubOverview } from "@/components/hub/HubOverview";
import { useNavigate } from "react-router-dom";
import { useRealtimeNotifications } from "@/hooks/useRealtimeNotifications";

export default function OverviewPage() {
  useRealtimeNotifications();
  const navigate = useNavigate();

  const handleNavigate = (tab: string) => {
    navigate(`/app/${tab === "overview" ? "" : tab}`);
  };

  return <HubOverview onNavigate={handleNavigate} />;
}
