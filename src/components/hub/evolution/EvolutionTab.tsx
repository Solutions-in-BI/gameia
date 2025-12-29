/**
 * EvolutionTab - Tab "Evolução" do hub
 * Subtabs: Resumo, Compromissos, Skills, PDI, Feedback, 1:1, Perfil Cognitivo
 */

import { useState } from "react";
import { cn } from "@/lib/utils";
import { 
  TrendingUp, 
  Target, 
  Users, 
  Calendar, 
  Brain,
  BarChart3,
  Award,
  Handshake
} from "lucide-react";
import { HubHeader } from "../common";
import { EvolutionDashboard } from "@/components/evolution/EvolutionDashboard";
import { SkillsPage } from "@/components/game/skills";
import { PDISection } from "@/components/game/development/PDISection";
import { Assessment360Section } from "@/components/game/development/Assessment360Section";
import { OneOnOneSection } from "@/components/game/development/OneOnOneSection";
import { MyCognitiveProfile } from "@/components/game/development/MyCognitiveProfile";
import { InsigniasSubtab } from "./InsigniasSubtab";
import { ChallengesSubtab } from "./ChallengesSubtab";

type EvolutionSubtab = "summary" | "commitments" | "insignias" | "skills" | "pdi" | "feedback" | "1on1" | "profile";

const SUBTABS = [
  { id: "summary" as const, label: "Resumo", icon: BarChart3 },
  { id: "commitments" as const, label: "Desafios", icon: Target },
  { id: "insignias" as const, label: "Insígnias", icon: Award },
  { id: "skills" as const, label: "Skills", icon: Target },
  { id: "pdi" as const, label: "PDI", icon: TrendingUp },
  { id: "feedback" as const, label: "Feedback 360", icon: Users },
  { id: "1on1" as const, label: "1:1", icon: Calendar },
  { id: "profile" as const, label: "Perfil", icon: Brain },
];

export function EvolutionTab() {
  const [subtab, setSubtab] = useState<EvolutionSubtab>("summary");

  const renderContent = () => {
    switch (subtab) {
      case "summary":
        return <EvolutionDashboard onTabChange={(tab) => {
          const mapping: Record<string, EvolutionSubtab> = {
            cognitive: "profile",
            assessments: "feedback",
            pdi: "pdi",
            "one-on-one": "1on1",
            profile: "profile",
            commitments: "commitments",
          };
          if (mapping[tab]) setSubtab(mapping[tab]);
        }} />;
      case "commitments":
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
      case "profile":
        return <MyCognitiveProfile />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <HubHeader
        title="Evolução"
        subtitle="Acompanhe seu desenvolvimento profissional"
        icon={TrendingUp}
      />

      {/* Subtabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-2 bg-muted/30 p-1 rounded-xl">
        {SUBTABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSubtab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all",
              subtab === tab.id
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <tab.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div>{renderContent()}</div>
    </div>
  );
}
