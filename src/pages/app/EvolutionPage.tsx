/**
 * Evolution Page - Perfil e evolução
 */

import { EvolutionTab } from "@/components/hub/evolution/EvolutionTab";
import { useRealtimeNotifications } from "@/hooks/useRealtimeNotifications";

export default function EvolutionPage() {
  useRealtimeNotifications();
  return <EvolutionTab />;
}
