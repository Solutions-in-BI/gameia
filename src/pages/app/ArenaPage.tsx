/**
 * Arena Page - Jogos e desafios
 */

import { ArenaTab } from "@/components/hub/arena/ArenaTab";
import { useRealtimeNotifications } from "@/hooks/useRealtimeNotifications";

export default function ArenaPage() {
  useRealtimeNotifications();
  return <ArenaTab />;
}
