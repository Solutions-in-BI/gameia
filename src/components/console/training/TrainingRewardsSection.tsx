/**
 * TrainingRewardsSection - Configuração avançada de recompensas
 * Área restrita para admins/owners
 */

import { useState } from "react";
import { 
  Search, 
  Coins,
  TrendingUp,
  Zap,
  ChevronDown,
  ChevronUp,
  Shield,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useTrainings, Training } from "@/hooks/useTrainings";
import { useOrgTrainingConfig, OrgTrainingConfig } from "@/hooks/useOrgTrainingConfig";
import { useOrganization } from "@/hooks/useOrganization";
import { toast } from "sonner";

export function TrainingRewardsSection() {
  const { organization } = useOrganization();
  const { trainings, isLoading: trainingsLoading, updateTraining } = useTrainings(organization?.id);
  const { configs, isLoading: configsLoading, upsertConfig } = useOrgTrainingConfig(organization?.id);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const isLoading = trainingsLoading || configsLoading;

  const filteredTrainings = trainings.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) && t.is_active
  );

  const getConfig = (trainingId: string): OrgTrainingConfig | undefined => {
    return configs.find(c => c.training_id === trainingId);
  };

  const handleUpdateRewards = async (training: Training, xp: number, coins: number) => {
    try {
      await updateTraining(training.id, { xp_reward: xp, coins_reward: coins });
      toast.success("Recompensas atualizadas");
    } catch (error) {
      toast.error("Erro ao atualizar recompensas");
    }
  };

  const handleUpdateMultiplier = async (trainingId: string, field: string, value: number) => {
    try {
      await upsertConfig({
        training_id: trainingId,
        [field]: value,
      });
      toast.success("Multiplicador atualizado");
    } catch (error) {
      toast.error("Erro ao atualizar multiplicador");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-foreground">Recompensas Avançadas</h1>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Shield className="w-3 h-3" />
              Admin
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Configure XP, moedas, multiplicadores e bônus por performance
          </p>
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
        <div className="flex gap-3">
          <Sparkles className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-foreground mb-1">Dica</h3>
            <p className="text-sm text-muted-foreground">
              Recompensas base são definidas automaticamente pelos Templates de Evolução. 
              Use esta seção para ajustes finos e configuração de bônus especiais.
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar treinamentos ativos..."
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
          <Coins className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-medium text-foreground mb-2">Nenhum treinamento ativo</h3>
          <p className="text-sm text-muted-foreground">
            Ative treinamentos na seção de Distribuição
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
                      <div className="flex items-center gap-3 mt-0.5 text-sm">
                        <span className="text-primary font-medium">{training.xp_reward} XP</span>
                        <span className="text-amber-500 font-medium">{training.coins_reward} 🪙</span>
                        {config?.xp_multiplier && config.xp_multiplier > 1 && (
                          <Badge className="bg-primary/10 text-primary text-xs">
                            {config.xp_multiplier}x XP
                          </Badge>
                        )}
                      </div>
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

                  {/* Expanded Content */}
                  <CollapsibleContent>
                    <div className="px-4 pb-4 pt-2 border-t border-border space-y-6">
                      {/* Base Rewards */}
                      <div>
                        <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                          <Coins className="w-4 h-4 text-amber-500" />
                          Recompensas Base
                        </h4>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label className="text-sm">XP por Conclusão</Label>
                              <span className="text-sm font-medium text-primary">{training.xp_reward}</span>
                            </div>
                            <Slider
                              value={[training.xp_reward]}
                              onValueChange={([v]) => handleUpdateRewards(training, v, training.coins_reward)}
                              min={10}
                              max={500}
                              step={10}
                            />
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label className="text-sm">Moedas por Conclusão</Label>
                              <span className="text-sm font-medium text-amber-500">{training.coins_reward}</span>
                            </div>
                            <Slider
                              value={[training.coins_reward]}
                              onValueChange={([v]) => handleUpdateRewards(training, training.xp_reward, v)}
                              min={5}
                              max={250}
                              step={5}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Multipliers */}
                      <div>
                        <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-green-500" />
                          Multiplicadores
                        </h4>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label className="text-sm">Multiplicador XP</Label>
                              <span className="text-sm font-medium">{config?.xp_multiplier || 1}x</span>
                            </div>
                            <Slider
                              value={[config?.xp_multiplier || 1]}
                              onValueChange={([v]) => handleUpdateMultiplier(training.id, 'xp_multiplier', v)}
                              min={0.5}
                              max={3}
                              step={0.1}
                            />
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label className="text-sm">Multiplicador Moedas</Label>
                              <span className="text-sm font-medium">{config?.coins_multiplier || 1}x</span>
                            </div>
                            <Slider
                              value={[config?.coins_multiplier || 1]}
                              onValueChange={([v]) => handleUpdateMultiplier(training.id, 'coins_multiplier', v)}
                              min={0.5}
                              max={3}
                              step={0.1}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Performance Bonus */}
                      <div className="p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Zap className="w-4 h-4 text-yellow-500" />
                          <Label className="text-sm font-medium">Bônus por Performance</Label>
                        </div>
                        <p className="text-xs text-muted-foreground mb-3">
                          Bônus extras para quem completar com alta pontuação ou dentro do prazo
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            Bônus de velocidade (em breve)
                          </span>
                          <Switch disabled checked={false} />
                        </div>
                      </div>

                      {/* Preview */}
                      <div className="p-4 bg-primary/5 rounded-lg">
                        <h4 className="text-sm font-medium text-foreground mb-2">
                          Recompensa Total Estimada
                        </h4>
                        <div className="flex items-center gap-4 text-lg font-semibold">
                          <span className="text-primary">
                            {Math.round(training.xp_reward * (config?.xp_multiplier || 1))} XP
                          </span>
                          <span className="text-muted-foreground">+</span>
                          <span className="text-amber-500">
                            {Math.round(training.coins_reward * (config?.coins_multiplier || 1))} 🪙
                          </span>
                        </div>
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
