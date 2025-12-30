/**
 * Caminho Page - Trilhas e jornadas
 */

import { CaminhoTab } from "@/components/hub/caminho/CaminhoTab";
import { useRealtimeNotifications } from "@/hooks/useRealtimeNotifications";

export default function CaminhoPage() {
  useRealtimeNotifications();
  return <CaminhoTab />;
}
