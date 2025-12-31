/**
 * ManageCenter - Centro de Gestão de Pessoas
 * Área exclusiva para gestores
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { ManageSidebar, ManageSection, ManageHeader } from "./layout";
import { useOrganization } from "@/hooks/useOrganization";
import { useOrgMetrics } from "@/hooks/useOrgMetrics";
import { useOrgTeams } from "@/hooks/useOrgTeams";
import { useExperiences } from "@/hooks/useExperiences";
import { Loader2 } from "lucide-react";

// Importar componentes existentes do admin que serão reutilizados
import { ExecutiveDashboard } from "@/components/admin/dashboard/ExecutiveDashboard";
import { TeamManagement } from "@/components/admin/teams/TeamManagement";
import { MembersManagement } from "@/components/admin/members/MembersManagement";
import { ReportsPage } from "@/components/admin/reports/ReportsPage";

// Importar AlertsSection real
import { AlertsSection } from "./alerts";
import { TeamAssessmentsPanel } from "./TeamAssessmentsPanel";
import { TrainingAssignments } from "./trainings";
import { ExperienceApprovalsPanel } from "./benefits";
import { TeamCertificatesDashboard } from "./certificates";
import { RewardAnalyticsDashboard } from "./rewards/RewardAnalyticsDashboard";
import { ManagerAssessmentsSection } from "./assessments";

function CommitmentsSection() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Compromissos</h1>
        <p className="text-muted-foreground">Gestão de metas e desafios da equipe</p>
      </div>
      <div className="bg-card border border-border rounded-xl p-8 text-center">
        <p className="text-muted-foreground">Em breve: visão consolidada dos compromissos das equipes.</p>
      </div>
    </div>
  );
}

export function ManageCenter() {
  const [activeSection, setActiveSection] = useState<ManageSection>("dashboard");
  const { currentOrg, isLoading: orgLoading } = useOrganization();
  
  const orgId = currentOrg?.id || "";
  
  // Buscar métricas para o dashboard
  const { 
    engagement, 
    learning, 
    competency, 
    decision, 
    membersWithMetrics, 
    isLoading: metricsLoading 
  } = useOrgMetrics(orgId);
  
  // Buscar times
  const { teams, isLoading: teamsLoading } = useOrgTeams(orgId);
  
  // Buscar aprovações pendentes
  const { pendingApprovals } = useExperiences();

  const isLoading = orgLoading || metricsLoading || teamsLoading;

  const renderSection = () => {
    if (!currentOrg) {
      return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-muted-foreground">Selecione uma organização para continuar.</p>
        </div>
      );
    }

    switch (activeSection) {
      case "dashboard":
        return (
          <div className="space-y-6">
            <TeamAssessmentsPanel />
            <ExecutiveDashboard 
              engagement={engagement}
              learning={learning}
              competency={competency}
              decision={decision}
              members={membersWithMetrics}
              isLoading={isLoading}
            />
          </div>
        );
      case "alerts":
        return <AlertsSection />;
      case "teams":
        return <TeamManagement orgId={orgId} />;
      case "members":
        return (
          <MembersManagement 
            members={membersWithMetrics} 
            teams={teams} 
            isLoading={isLoading}
          />
        );
      case "trainings":
        return <TrainingAssignments />;
      case "certificates":
        return <TeamCertificatesDashboard />;
      case "benefits":
        return <ExperienceApprovalsPanel />;
      case "rewards":
        return <RewardAnalyticsDashboard />;
      case "commitments":
        return <CommitmentsSection />;
      case "assessments":
        return <ManagerAssessmentsSection />;
        return <ReportsPage />;
      default:
        return (
          <ExecutiveDashboard 
            engagement={engagement}
            learning={learning}
            competency={competency}
            decision={decision}
            members={membersWithMetrics}
            isLoading={isLoading}
          />
        );
    }
  };

  if (orgLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <ManageHeader />
      
      <div className="flex">
        <ManageSidebar
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          pendingApprovalsCount={pendingApprovals.length}
        />
        
        <main className="flex-1 p-6 overflow-auto">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.15 }}
          >
            {renderSection()}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
