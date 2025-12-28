/**
 * Seção de Desenvolvimento - Container principal
 * Gerencia as tabs de desenvolvimento do colaborador
 */

import { useState } from "react";
import { DevelopmentDashboard, DevelopmentTab } from "./DevelopmentDashboard";
import { CognitiveTestsHub } from "./CognitiveTestsHub";
import { MyCognitiveProfile } from "./MyCognitiveProfile";
import { PDISection } from "./PDISection";
import { Assessment360Section } from "./Assessment360Section";
import { OneOnOneSection } from "./OneOnOneSection";

export function DevelopmentSection() {
  const [activeTab, setActiveTab] = useState<DevelopmentTab>("overview");

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return <DevelopmentDashboard onTabChange={setActiveTab} />;
      case "cognitive":
        return <CognitiveTestsHub />;
      case "assessments":
        return <Assessment360Section />;
      case "pdi":
        return <PDISection />;
      case "one-on-one":
        return <OneOnOneSection />;
      default:
        return <DevelopmentDashboard onTabChange={setActiveTab} />;
    }
  };

  return renderContent();
}
