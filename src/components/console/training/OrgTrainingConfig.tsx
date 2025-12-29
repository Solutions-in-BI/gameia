/**
 * OrgTrainingConfig - Configuração B2B de treinamentos
 * Permite ativar/desativar treinamentos, definir obrigatoriedade, multiplicadores
 */

import { useState } from "react";
import { motion } from "framer-motion";
import {
  GraduationCap,
  Settings2,
  Users,
  Zap,
  Coins,
  Clock,
  Target,
  CheckCircle2,
  XCircle,
  ChevronDown,
  Search,
  Filter,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { useTrainings } from "@/hooks/useTrainings";
import { useOrgTrainingConfig, OrgTrainingConfig } from "@/hooks/useOrgTrainingConfig";
import { useOrganization } from "@/hooks/useOrganization";
import { useOrgTeams } from "@/hooks/useOrgTeams";
import { toast } from "sonner";

const REQUIREMENT_TYPES = [
  { value: "optional", label: "Opcional", icon: CheckCircle2, color: "text-muted-foreground" },
  { value: "suggested", label: "Sugerido", icon: Target, color: "text-amber-500" },
  { value: "required", label: "Obrigatório", icon: XCircle, color: "text-red-500" },
];

export function OrgTrainingConfigSection() {
  const { currentOrg } = useOrganization();
  const { trainings, isLoading: trainingsLoading } = useTrainings(currentOrg?.id);
  const { configs, getTrainingConfig, getTrainingMetrics, upsertConfig, isLoading: configsLoading } = useOrgTrainingConfig(currentOrg?.id);
  const { teams } = useOrgTeams(currentOrg?.id || "");

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTraining, setSelectedTraining] = useState<string | null>(null);
  const [expandedTrainings, setExpandedTrainings] = useState<string[]>([]);

  const isLoading = trainingsLoading || configsLoading;

  const filteredTrainings = trainings.filter((t) =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleExpand = (trainingId: string) => {
    setExpandedTrainings((prev) =>
      prev.includes(trainingId)
        ? prev.filter((id) => id !== trainingId)
        : [...prev, trainingId]
    );
  };

  const handleToggleEnabled = async (trainingId: string, enabled: boolean) => {
    try {
      await upsertConfig({
        training_id: trainingId,
        is_enabled: enabled,
      });
      toast.success(enabled ? "Treinamento ativado" : "Treinamento desativado");
    } catch (error) {
      toast.error("Erro ao atualizar configuração");
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Settings2 className="w-6 h-6 text-primary" />
            Configuração de Treinamentos
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Configure quais treinamentos estão disponíveis e suas regras
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            {configs.filter((c) => c.is_enabled).length} ativos
          </Badge>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar treinamentos..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Trainings List */}
      <div className="space-y-3">
        {filteredTrainings.map((training) => {
          const config = getTrainingConfig(training.id);
          const metrics = getTrainingMetrics(training.id);
          const isExpanded = expandedTrainings.includes(training.id);
          const isEnabled = config?.is_enabled ?? false;

          return (
            <motion.div
              key={training.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "rounded-xl border bg-card overflow-hidden transition-all",
                !isEnabled && "opacity-60"
              )}
            >
              {/* Main Row */}
              <div className="flex items-center gap-4 p-4">
                {/* Icon */}
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ backgroundColor: `${training.color}20` }}
                >
                  {training.icon}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground truncate">
                      {training.name}
                    </h3>
                    {config?.requirement_type === "required" && (
                      <Badge variant="destructive" className="text-xs">
                        Obrigatório
                      </Badge>
                    )}
                    {config?.requirement_type === "suggested" && (
                      <Badge variant="secondary" className="text-xs bg-amber-500/10 text-amber-600">
                        Sugerido
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {training.description}
                  </p>
                </div>

                {/* Quick Stats */}
                <div className="hidden md:flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <BarChart3 className="w-4 h-4" />
                    <span>{metrics.completionRate}%</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{metrics.completions}</span>
                  </div>
                </div>

                {/* Toggle */}
                <Switch
                  checked={isEnabled}
                  onCheckedChange={(checked) => handleToggleEnabled(training.id, checked)}
                />

                {/* Expand */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => toggleExpand(training.id)}
                >
                  <ChevronDown
                    className={cn(
                      "w-4 h-4 transition-transform",
                      isExpanded && "rotate-180"
                    )}
                  />
                </Button>
              </div>

              {/* Expanded Config */}
              {isExpanded && (
                <div className="border-t border-border p-4 bg-muted/30 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Requirement Type */}
                    <div className="space-y-2">
                      <Label>Tipo de Exigência</Label>
                      <Select
                        value={config?.requirement_type || "optional"}
                        onValueChange={(value) =>
                          handleUpdateConfig(training.id, {
                            requirement_type: value as "optional" | "required" | "suggested",
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {REQUIREMENT_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              <div className="flex items-center gap-2">
                                <type.icon className={cn("w-4 h-4", type.color)} />
                                {type.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* XP Multiplier */}
                    <div className="space-y-2">
                      <Label className="flex items-center justify-between">
                        <span>Multiplicador XP</span>
                        <span className="text-primary font-mono">
                          {(config?.xp_multiplier || 1).toFixed(1)}x
                        </span>
                      </Label>
                      <Slider
                        value={[config?.xp_multiplier || 1]}
                        min={0.5}
                        max={3}
                        step={0.1}
                        onValueChange={([value]) =>
                          handleUpdateConfig(training.id, { xp_multiplier: value })
                        }
                      />
                    </div>

                    {/* Coins Multiplier */}
                    <div className="space-y-2">
                      <Label className="flex items-center justify-between">
                        <span>Multiplicador Moedas</span>
                        <span className="text-amber-500 font-mono">
                          {(config?.coins_multiplier || 1).toFixed(1)}x
                        </span>
                      </Label>
                      <Slider
                        value={[config?.coins_multiplier || 1]}
                        min={0.5}
                        max={3}
                        step={0.1}
                        onValueChange={([value]) =>
                          handleUpdateConfig(training.id, { coins_multiplier: value })
                        }
                      />
                    </div>

                    {/* Deadline */}
                    <div className="space-y-2">
                      <Label>Prazo (dias)</Label>
                      <Input
                        type="number"
                        placeholder="Sem prazo"
                        value={config?.deadline_days || ""}
                        onChange={(e) =>
                          handleUpdateConfig(training.id, {
                            deadline_days: e.target.value ? parseInt(e.target.value) : null,
                          })
                        }
                      />
                    </div>

                    {/* Teams Filter */}
                    <div className="space-y-2">
                      <Label>Restringir por Equipes</Label>
                      <Select
                        value={config?.team_ids?.[0] || "all"}
                        onValueChange={(value) =>
                          handleUpdateConfig(training.id, {
                            team_ids: value === "all" ? null : [value],
                          })
                        }
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

                  {/* Metrics Summary */}
                  <div className="flex items-center gap-4 pt-4 border-t border-border text-sm">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Taxa de conclusão:</span>
                      <span className="font-semibold">{metrics.completionRate}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Completaram:</span>
                      <span className="font-semibold">{metrics.completions}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Tempo médio:</span>
                      <span className="font-semibold">{metrics.totalTimeMinutes} min</span>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {filteredTrainings.length === 0 && (
        <div className="text-center py-16 px-4 rounded-2xl border border-border bg-card/50">
          <GraduationCap className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Nenhum treinamento encontrado
          </h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Crie treinamentos na aba de Treinamentos para configurá-los aqui.
          </p>
        </div>
      )}
    </div>
  );
}
