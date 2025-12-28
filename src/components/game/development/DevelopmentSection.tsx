/**
 * Seção de Desenvolvimento - Container principal
 * Gerencia as tabs de desenvolvimento do colaborador
 */

import { useState } from "react";
import { DevelopmentDashboard, DevelopmentTab } from "./DevelopmentDashboard";
import { CognitiveTestsHub } from "./CognitiveTestsHub";
import { MyCognitiveProfile } from "./MyCognitiveProfile";

export function DevelopmentSection() {
  const [activeTab, setActiveTab] = useState<DevelopmentTab>("overview");

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return <DevelopmentDashboard onTabChange={setActiveTab} />;
      case "cognitive":
        return <CognitiveTestsHub />;
      case "assessments":
        return (
          <div className="text-center py-12 text-muted-foreground">
            <p>Módulo de Avaliação 360° em breve</p>
          </div>
        );
      case "pdi":
        return (
          <div className="text-center py-12 text-muted-foreground">
            <p>Módulo de PDI em breve</p>
          </div>
        );
      case "one-on-one":
        return (
          <div className="text-center py-12 text-muted-foreground">
            <p>Módulo de 1:1 em breve</p>
          </div>
        );
      default:
        return <DevelopmentDashboard onTabChange={setActiveTab} />;
    }
  };

  return renderContent();
}
