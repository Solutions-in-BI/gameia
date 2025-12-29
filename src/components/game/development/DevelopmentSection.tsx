/**
 * Seção de Evolução - Container principal unificado
 * Agora usa o EvolutionDashboard como hub central
 */

import { useState } from "react";
import { EvolutionDashboard } from "@/components/evolution/EvolutionDashboard";
import { CognitiveTestsHub } from "./CognitiveTestsHub";
import { MyCognitiveProfile } from "./MyCognitiveProfile";
import { PDISection } from "./PDISection";
import { Assessment360Section } from "./Assessment360Section";
import { OneOnOneSection } from "./OneOnOneSection";

export type EvolutionTab = "overview" | "cognitive" | "assessments" | "pdi" | "one-on-one" | "profile";

export function DevelopmentSection() {
  const [activeTab, setActiveTab] = useState<EvolutionTab>("overview");

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return <EvolutionDashboard onTabChange={setActiveTab} />;
      case "cognitive":
        return <CognitiveTestsHub onBack={() => setActiveTab("overview")} />;
      case "assessments":
        return <Assessment360Section onBack={() => setActiveTab("overview")} />;
      case "pdi":
        return <PDISection onBack={() => setActiveTab("overview")} />;
      case "one-on-one":
        return <OneOnOneSection onBack={() => setActiveTab("overview")} />;
      case "profile":
        return <MyCognitiveProfile onBack={() => setActiveTab("overview")} />;
      default:
        return <EvolutionDashboard onTabChange={setActiveTab} />;
    }
  };

  return renderContent();
}
