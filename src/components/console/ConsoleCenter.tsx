/**
 * ConsoleCenter - Centro de Configuração da Plataforma
 * Área exclusiva para admins
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { ConsoleSidebar, ConsoleSection, ConsoleHeader } from "./layout";

// Importar componentes existentes do admin que serão reutilizados
import { OrganizationSettings } from "@/components/admin/settings/OrganizationSettings";
import { PlanBillingSettings } from "@/components/admin/settings/PlanBillingSettings";
import { BadgeConfigSettings } from "@/components/admin/settings/BadgeConfigSettings";
import { LevelConfigSettings } from "@/components/admin/settings/LevelConfigSettings";
import { MarketplaceManagement } from "@/components/admin/marketplace/MarketplaceManagement";
import { TrainingManagement } from "@/components/admin/training/TrainingManagement";
import { IntegrationsSettings } from "@/components/admin/settings/IntegrationsSettings";
import { SSOSettings } from "@/components/admin/settings/SSOSettings";
import { GameConfigurationHub } from "@/components/admin/games";
import { OrgTrainingConfigSection, TrainingMetricsDashboard, TrainingReportsSection } from "./training";

// Placeholder para seções ainda não migradas
function UsersPermissionsSection() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Usuários & Permissões</h1>
        <p className="text-muted-foreground">Controle de acesso e roles</p>
      </div>
      <div className="bg-card border border-border rounded-xl p-8 text-center">
        <p className="text-muted-foreground">Em breve: gestão completa de usuários e permissões.</p>
      </div>
    </div>
  );
}

function CognitiveSection() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Testes Cognitivos</h1>
        <p className="text-muted-foreground">Configuração de testes e regras</p>
      </div>
      <div className="bg-card border border-border rounded-xl p-8 text-center">
        <p className="text-muted-foreground">Em breve: configuração de testes cognitivos.</p>
      </div>
    </div>
  );
}

function TemplatesSection() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Templates</h1>
        <p className="text-muted-foreground">Modelos de compromissos e avaliações</p>
      </div>
      <div className="bg-card border border-border rounded-xl p-8 text-center">
        <p className="text-muted-foreground">Em breve: templates reutilizáveis.</p>
      </div>
    </div>
  );
}

function AuditSection() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Logs & Auditoria</h1>
        <p className="text-muted-foreground">Histórico de ações e alterações</p>
      </div>
      <div className="bg-card border border-border rounded-xl p-8 text-center">
        <p className="text-muted-foreground">Em breve: logs detalhados de auditoria.</p>
      </div>
    </div>
  );
}

function OrganizationSection() {
  return (
    <div className="space-y-6">
      <OrganizationSettings />
      <PlanBillingSettings />
    </div>
  );
}

function IntegrationsSection() {
  return (
    <div className="space-y-6">
      <IntegrationsSettings />
      <SSOSettings />
    </div>
  );
}

export function ConsoleCenter() {
  const [activeSection, setActiveSection] = useState<ConsoleSection>("organization");

  const renderSection = () => {
    switch (activeSection) {
      case "organization":
        return <OrganizationSection />;
      case "users":
        return <UsersPermissionsSection />;
      case "gamification":
      case "games":
        return <GameConfigurationHub />;
      case "badges":
        return <BadgeConfigSettings />;
      case "levels":
        return <LevelConfigSettings />;
      case "marketplace":
        return <MarketplaceManagement />;
      case "trainings":
        return (
          <div className="space-y-8">
            <TrainingMetricsDashboard />
            <TrainingManagement />
            <OrgTrainingConfigSection />
            <TrainingReportsSection />
          </div>
        );
      case "cognitive":
        return <CognitiveSection />;
      case "templates":
        return <TemplatesSection />;
      case "integrations":
        return <IntegrationsSection />;
      case "audit":
        return <AuditSection />;
      default:
        return <OrganizationSection />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <ConsoleHeader />
      
      <div className="flex">
        <ConsoleSidebar
          activeSection={activeSection}
          onSectionChange={setActiveSection}
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
