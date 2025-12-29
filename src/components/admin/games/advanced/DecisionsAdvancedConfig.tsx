import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface DecisionsAdvancedConfigProps {
  config: Record<string, any>;
  onChange: (key: string, value: any) => void;
  readonly?: boolean;
}

export function DecisionsAdvancedConfig({ config, onChange, readonly }: DecisionsAdvancedConfigProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Contexto da Empresa</Label>
        <Textarea
          placeholder="Descreva o contexto específico da sua empresa para os cenários..."
          value={config.companyContext || ""}
          onChange={e => onChange("companyContext", e.target.value)}
          disabled={readonly}
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label>Objetivo do Cenário</Label>
        <Input
          placeholder="Ex: Desenvolver pensamento estratégico"
          value={config.scenarioObjective || ""}
          onChange={e => onChange("scenarioObjective", e.target.value)}
          disabled={readonly}
        />
      </div>

      <div className="space-y-2">
        <Label>Prompt Base (IA)</Label>
        <Textarea
          placeholder="Prompt customizado para geração de cenários..."
          value={config.basePrompt || ""}
          onChange={e => onChange("basePrompt", e.target.value)}
          disabled={readonly}
          rows={4}
        />
      </div>
    </div>
  );
}
