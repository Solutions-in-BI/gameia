/**
 * CaminhoTab - Tab "Caminho" do hub
 * Trilha/roadmap de evolução e metas
 */

import { Compass } from "lucide-react";
import { HubHeader } from "../common";
import { GuidanceSection } from "@/components/skillpath/guidance/GuidanceSection";

export function CaminhoTab() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <HubHeader
        title="Caminho"
        subtitle="Seu GPS de desenvolvimento profissional"
        icon={Compass}
      />

      {/* Content */}
      <GuidanceSection />
    </div>
  );
}
