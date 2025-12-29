/**
 * CommitmentEmptyState - Estados vazios para compromissos
 * Mensagens contextuais baseadas no filtro atual
 */

import { Handshake, Plus, CheckCircle2, Search, Users } from "lucide-react";
import { HubButton } from "@/components/hub/common";

interface CommitmentEmptyStateProps {
  filter: "all" | "active" | "mine" | "completed";
  canCreate: boolean;
  onCreateClick: () => void;
}

export function CommitmentEmptyState({ filter, canCreate, onCreateClick }: CommitmentEmptyStateProps) {
  const getContent = () => {
    switch (filter) {
      case "mine":
        return {
          icon: Users,
          title: "Você ainda não participa de nenhum compromisso",
          description: "Explore os compromissos ativos e junte-se a uma meta coletiva para evoluir com sua equipe.",
        };
      case "completed":
        return {
          icon: CheckCircle2,
          title: "Nenhum compromisso encerrado ainda",
          description: "Os compromissos concluídos aparecerão aqui, com o histórico de conquistas coletivas.",
        };
      case "active":
        return {
          icon: Handshake,
          title: "Nenhum compromisso ativo no momento",
          description: canCreate 
            ? "Crie o primeiro compromisso para engajar sua equipe em uma meta coletiva."
            : "Quando seu gestor criar um compromisso, ele aparecerá aqui.",
        };
      default:
        return {
          icon: Search,
          title: "Nenhum compromisso encontrado",
          description: "Não há compromissos cadastrados ainda.",
        };
    }
  };

  const content = getContent();
  const Icon = content.icon;

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="p-4 rounded-2xl bg-muted/50 mb-4">
        <Icon className="w-10 h-10 text-muted-foreground" />
      </div>
      
      <h3 className="text-lg font-semibold text-foreground mb-2">
        {content.title}
      </h3>
      
      <p className="text-sm text-muted-foreground max-w-md mb-6">
        {content.description}
      </p>

      {canCreate && (filter === "all" || filter === "active") && (
        <HubButton
          onClick={onCreateClick}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Criar Compromisso
        </HubButton>
      )}

      {/* Educational tips */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl text-left">
        <div className="p-4 rounded-xl bg-muted/30 border border-border/30">
          <h4 className="font-medium text-foreground text-sm mb-1">
            O que é um Compromisso?
          </h4>
          <p className="text-xs text-muted-foreground">
            É um acordo coletivo de desempenho com incentivos internos (moedas e XP). 
            Diferente de apostas, foca em evolução e conquista em equipe.
          </p>
        </div>
        
        <div className="p-4 rounded-xl bg-muted/30 border border-border/30">
          <h4 className="font-medium text-foreground text-sm mb-1">
            Interno vs Externo
          </h4>
          <p className="text-xs text-muted-foreground">
            <strong>Interno:</strong> métricas automáticas (engajamento, XP, streak).
            <strong> Externo:</strong> dados manuais (metas comerciais, indicadores).
          </p>
        </div>
      </div>
    </div>
  );
}
