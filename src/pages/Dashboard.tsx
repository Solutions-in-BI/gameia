/**
 * Gameia - Página Principal
 * Hub unificado: Overview, Arena, Evolução, Caminho
 */

import { HubLayout } from "@/components/hub/HubLayout";
import { useRealtimeNotifications } from "@/hooks/useRealtimeNotifications";

const Index = () => {
  // Ativa notificações em tempo real
  useRealtimeNotifications();

  return <HubLayout />;
};

export default Index;
