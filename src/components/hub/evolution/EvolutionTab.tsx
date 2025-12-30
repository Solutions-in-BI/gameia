/**
 * EvolutionTab - Tab "Evolução" do hub
 * Mostra RESULTADOS e histórico (não inicia experiências)
 * Sub-navegação via sidebar lateral (não mais tabs internas)
 */

import { useSearchParams } from "react-router-dom";
import { EvolutionDashboard } from "@/components/evolution/EvolutionDashboard";
import { ManagerEvolutionView } from "@/components/evolution/ManagerEvolutionView";
import { SkillsPage } from "@/components/game/skills";
import { PDISection } from "@/components/game/development/PDISection";
import { Assessment360Section } from "@/components/game/development/Assessment360Section";
import { OneOnOneSection } from "@/components/game/development/OneOnOneSection";
import { InsigniasSubtab } from "./InsigniasSubtab";
import { ChallengesSubtab } from "./ChallengesSubtab";
import { HistorySubtab } from "./HistorySubtab";
import { useOrganization } from "@/hooks/useOrganization";

type EvolutionSubtab = "summary" | "history" | "challenges" | "insignias" | "skills" | "pdi" | "feedback" | "1on1" | "team";

export function EvolutionTab() {
  const { isAdmin } = useOrganization();
  const [searchParams, setSearchParams] = useSearchParams();
  const subtab = (searchParams.get("tab") as EvolutionSubtab) || "summary";

  const handleSubtabChange = (newTab: EvolutionSubtab) => {
    const params = new URLSearchParams(searchParams);
    params.set("tab", newTab);
    setSearchParams(params, { replace: true });
  };

  const renderContent = () => {
    switch (subtab) {
      case "summary":
        return <EvolutionDashboard onTabChange={(tab) => {
          const mapping: Record<string, EvolutionSubtab> = {
            cognitive: "history",
            assessments: "feedback",
            pdi: "pdi",
            "one-on-one": "1on1",
            profile: "history",
            commitments: "challenges",
          };
          if (mapping[tab]) handleSubtabChange(mapping[tab]);
        }} />;
      case "history":
        return <HistorySubtab />;
      case "challenges":
        return <ChallengesSubtab />;
      case "insignias":
        return <InsigniasSubtab />;
      case "skills":
        return <SkillsPage />;
      case "pdi":
        return <PDISection />;
      case "feedback":
        return <Assessment360Section />;
      case "1on1":
        return <OneOnOneSection />;
      case "team":
        return isAdmin ? <ManagerEvolutionView /> : null;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Content - No more internal subtabs, controlled by sidebar */}
      <div>{renderContent()}</div>
    </div>
  );
}
