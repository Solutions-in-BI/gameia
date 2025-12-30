/**
 * Trainings Page - Lista de treinamentos (usando nova UI)
 */

import { TrainingsPage } from "@/components/game/trainings/TrainingsPage";
import { useRealtimeNotifications } from "@/hooks/useRealtimeNotifications";

export default function TrainingsListPage() {
  useRealtimeNotifications();
  return <TrainingsPage />;
}
