import { forwardRef } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Building2, RotateCcw, AlertCircle } from "lucide-react";
import type { MergedGameConfig, OrgGameOverride } from "@/hooks/useGameConfig";

interface OrgConfigLayerProps {
  config: MergedGameConfig;
  onOverrideChange: (updates: Partial<OrgGameOverride>) => void;
  onReset: () => void;
  readonly?: boolean;
}

export const OrgConfigLayer = forwardRef<HTMLDivElement, OrgConfigLayerProps>(
  function OrgConfigLayer({ config, onOverrideChange, onReset, readonly }, ref) {
    const hasOverrides = config.hasOverrides;
    const override = config.orgOverride;

    const renderOverrideIndicator = (field: keyof OrgGameOverride, label: string) => {
      const isOverridden = override && override[field] !== null && override[field] !== undefined;
      return (
        <div className="flex items-center gap-2">
          <span>{label}</span>
          {isOverridden && (
            <Badge variant="outline" className="text-xs bg-primary/10 text-primary">
              Customizado
            </Badge>
          )}
        </div>
      );
    };

    return (
      <div ref={ref} className="space-y-6">
        {/* Status Header */}
        <Card className={hasOverrides ? "border-primary/50 bg-primary/5" : "border-muted"}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Building2 className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium text-foreground">
                    {hasOverrides ? "Configuração Customizada" : "Usando Padrões Globais"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {hasOverrides 
                      ? "Esta empresa tem configurações personalizadas" 
                      : "Todas as configurações são herdadas do padrão global"
                    }
                  </p>
                </div>
              </div>
              {hasOverrides && !readonly && (
                <Button variant="ghost" size="sm" onClick={onReset}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Resetar
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Ativo/Inativo */}
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label>Jogo Ativo</Label>
            <p className="text-sm text-muted-foreground">
              Ativar ou desativar este jogo para a empresa
            </p>
          </div>
          <Switch
            checked={config.effectiveIsActive}
            onCheckedChange={v => onOverrideChange({ is_active: v })}
            disabled={readonly}
          />
        </div>

        {/* Visibilidade */}
        <div className="space-y-2">
          <Label>{renderOverrideIndicator("visibility_override", "Visibilidade")}</Label>
          <Select
            value={config.effectiveVisibility}
            onValueChange={v => onOverrideChange({ visibility_override: v as any })}
            disabled={readonly}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="required">
                <span className="flex items-center gap-2">
                  🔴 Obrigatório - Todos devem jogar
                </span>
              </SelectItem>
              <SelectItem value="recommended">
                <span className="flex items-center gap-2">
                  🟡 Recomendado - Sugerido aos colaboradores
                </span>
              </SelectItem>
              <SelectItem value="optional">
                <span className="flex items-center gap-2">
                  🟢 Livre - Disponível opcionalmente
                </span>
              </SelectItem>
              <SelectItem value="hidden">
                <span className="flex items-center gap-2">
                  ⚫ Oculto - Não aparece para colaboradores
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Override de Recompensas */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-foreground">Override de Recompensas</h4>
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Deixe em branco para usar o padrão global
          </p>
          
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>
                {renderOverrideIndicator("xp_base_override", "XP Base")}
              </Label>
              <Input
                type="number"
                min={0}
                placeholder={`Padrão: ${config.xp_base_reward}`}
                value={override?.xp_base_override ?? ""}
                onChange={e => onOverrideChange({ 
                  xp_base_override: e.target.value ? parseInt(e.target.value) : null 
                })}
                disabled={readonly}
              />
            </div>

            <div className="space-y-2">
              <Label>
                {renderOverrideIndicator("xp_multiplier_override", "Multiplicador XP")}
              </Label>
              <Input
                type="number"
                step={0.1}
                min={0.1}
                placeholder={`Padrão: ${config.xp_multiplier}`}
                value={override?.xp_multiplier_override ?? ""}
                onChange={e => onOverrideChange({ 
                  xp_multiplier_override: e.target.value ? parseFloat(e.target.value) : null 
                })}
                disabled={readonly}
              />
            </div>

            <div className="space-y-2">
              <Label>
                {renderOverrideIndicator("coins_base_override", "Moedas Base")}
              </Label>
              <Input
                type="number"
                min={0}
                placeholder={`Padrão: ${config.coins_base_reward}`}
                value={override?.coins_base_override ?? ""}
                onChange={e => onOverrideChange({ 
                  coins_base_override: e.target.value ? parseInt(e.target.value) : null 
                })}
                disabled={readonly}
              />
            </div>

            <div className="space-y-2">
              <Label>
                {renderOverrideIndicator("coins_multiplier_override", "Multiplicador Moedas")}
              </Label>
              <Input
                type="number"
                step={0.1}
                min={0.1}
                placeholder={`Padrão: ${config.coins_multiplier}`}
                value={override?.coins_multiplier_override ?? ""}
                onChange={e => onOverrideChange({ 
                  coins_multiplier_override: e.target.value ? parseFloat(e.target.value) : null 
                })}
                disabled={readonly}
              />
            </div>
          </div>
        </div>

        {/* Override de Meta */}
        <div className="space-y-2">
          <Label>
            {renderOverrideIndicator("target_score_override", "Meta Target (%)")}
          </Label>
          <Input
            type="number"
            min={0}
            max={100}
            placeholder={`Padrão: ${config.target_score}%`}
            value={override?.target_score_override ?? ""}
            onChange={e => onOverrideChange({ 
              target_score_override: e.target.value ? parseInt(e.target.value) : null 
            })}
            disabled={readonly}
          />
        </div>

        {/* Compromissos Coletivos */}
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label>Permitir em Compromissos Coletivos</Label>
            <p className="text-sm text-muted-foreground">
              Este jogo pode ser usado em desafios de equipe
            </p>
          </div>
          <Switch
            checked={config.effectiveAllowInCommitments}
            onCheckedChange={v => onOverrideChange({ allow_in_commitments: v })}
            disabled={readonly}
          />
        </div>
      </div>
    );
  }
);
