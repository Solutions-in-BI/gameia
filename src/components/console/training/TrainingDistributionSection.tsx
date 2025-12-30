/**
 * TrainingDistributionSection - Distribuição e ativação de treinamentos
 * Gerencia público-alvo, prazos e gatilhos automáticos
 */

import { useState } from "react";
import { 
  Search, 
  Users,
  Calendar,
  Clock,
  ChevronDown,
  ChevronUp,
  Settings2,
  Target,
  Play,
  Pause,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useTrainings, Training } from "@/hooks/useTrainings";
import { useOrgTrainingConfig, OrgTrainingConfig } from "@/hooks/useOrgTrainingConfig";
import { useOrganization } from "@/hooks/useOrganization";
import { useOrgTeams } from "@/hooks/useOrgTeams";
import { toast } from "sonner";

const REQUIREMENT_TYPES = [
  { value: "optional", label: "Opcional", description: "Usuário escolhe se faz" },
  { value: "suggested", label: "Recomendado", description: "Aparece como destaque" },
  { value: "required", label: "Obrigatório", description: "Usuário precisa completar" },
];

export function TrainingDistributionSection() {
  const { organization } = useOrganization();
  const { trainings, isLoading: trainingsLoading, updateTraining } = useTrainings(organization?.id);
  const { configs, isLoading: configsLoading, upsertConfig } = useOrgTrainingConfig(organization?.id);
  const { teams } = useOrgTeams(organization?.id);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const isLoading = trainingsLoading || configsLoading;

  const filteredTrainings = trainings.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getConfig = (trainingId: string): OrgTrainingConfig | undefined => {
    return configs.find(c => c.training_id === trainingId);
  };

  const handleToggleActive = async (training: Training) => {
    try {
      await updateTraining(training.id, { is_active: !training.is_active });
      toast.success(training.is_active ? "Treinamento desativado" : "Treinamento ativado");
    } catch (error) {
      toast.error("Erro ao atualizar status");
    }
  };

  const handleUpdateConfig = async (trainingId: string, updates: Partial<OrgTrainingConfig>) => {
    try {
      await upsertConfig({
        training_id: trainingId,
        ...updates,
      });
      toast.success("Configuração atualizada");
    } catch (error) {
      toast.error("Erro ao atualizar configuração");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Distribuição de Treinamentos</h1>
        <p className="text-muted-foreground">
          Configure público-alvo, prazos e gatilhos automáticos
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar treinamentos..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Training List */}
      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Carregando...</div>
      ) : filteredTrainings.length === 0 ? (
        <div className="text-center py-12 bg-card border border-border rounded-xl">
          <Target className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-medium text-foreground mb-2">Nenhum treinamento encontrado</h3>
          <p className="text-sm text-muted-foreground">
            Crie treinamentos no Catálogo primeiro
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTrainings.map((training) => {
            const config = getConfig(training.id);
            const isExpanded = expandedId === training.id;

            return (
              <Collapsible
                key={training.id}
                open={isExpanded}
                onOpenChange={() => setExpandedId(isExpanded ? null : training.id)}
              >
                <div className="bg-card border border-border rounded-xl overflow-hidden">
                  {/* Header Row */}
                  <div className="p-4 flex items-center gap-4">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-xl shrink-0"
                      style={{ backgroundColor: `${training.color}20` }}
                    >
                      {training.icon}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-foreground truncate">{training.name}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        {config?.requirement_type && (
                          <Badge variant="secondary" className="text-xs">
                            {REQUIREMENT_TYPES.find(r => r.value === config.requirement_type)?.label}
                          </Badge>
                        )}
                        {config?.team_restriction && (
                          <Badge variant="outline" className="text-xs">
                            <Users className="w-3 h-3 mr-1" />
                            Restrito
                          </Badge>
                        )}
                        {config?.deadline && (
                          <Badge variant="outline" className="text-xs">
                            <Calendar className="w-3 h-3 mr-1" />
                            Prazo
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="flex items-center gap-2">
                        {training.is_active ? (
                          <Play className="w-4 h-4 text-green-500" />
                        ) : (
                          <Pause className="w-4 h-4 text-muted-foreground" />
                        )}
                        <Switch
                          checked={training.is_active}
                          onCheckedChange={() => handleToggleActive(training)}
                        />
                      </div>

                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="icon">
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </Button>
                      </CollapsibleTrigger>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  <CollapsibleContent>
                    <div className="px-4 pb-4 pt-2 border-t border-border space-y-4">
                      {/* Requirement Type */}
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label className="text-sm">Tipo de Requisito</Label>
                          <Select
                            value={config?.requirement_type || "optional"}
                            onValueChange={(v) => handleUpdateConfig(training.id, { requirement_type: v as "optional" | "suggested" | "required" })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {REQUIREMENT_TYPES.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  <div>
                                    <span>{type.label}</span>
                                    <span className="text-xs text-muted-foreground ml-2">
                                      {type.description}
                                    </span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm">Restringir por Equipe</Label>
                          <Select
                            value={config?.team_restriction || "all"}
                            onValueChange={(v) => handleUpdateConfig(training.id, { team_restriction: v === "all" ? null : v })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Todas as equipes" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">Todas as equipes</SelectItem>
                              {teams.map((team) => (
                                <SelectItem key={team.id} value={team.id}>
                                  {team.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Deadline */}
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label className="text-sm flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Prazo para Conclusão
                          </Label>
                          <Input
                            type="date"
                            value={config?.deadline || ""}
                            onChange={(e) => handleUpdateConfig(training.id, { deadline: e.target.value || null })}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            Recorrência
                          </Label>
                          <Select
                            value={config?.recurrence || "none"}
                            onValueChange={(v) => handleUpdateConfig(training.id, { recurrence: v === "none" ? null : v })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Sem recorrência" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">Sem recorrência</SelectItem>
                              <SelectItem value="monthly">Mensal</SelectItem>
                              <SelectItem value="quarterly">Trimestral</SelectItem>
                              <SelectItem value="yearly">Anual</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Triggers */}
                      <div className="p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Settings2 className="w-4 h-4 text-muted-foreground" />
                          <Label className="text-sm font-medium">Gatilhos Automáticos</Label>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Gatilhos como onboarding, queda de performance e integração com PDI serão disponibilizados em breve.
                        </p>
                      </div>
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            );
          })}
        </div>
      )}
    </div>
  );
}
