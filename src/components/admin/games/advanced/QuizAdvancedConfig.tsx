import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

interface QuizAdvancedConfigProps {
  config: Record<string, any>;
  onChange: (key: string, value: any) => void;
  readonly?: boolean;
}

export function QuizAdvancedConfig({ config, onChange, readonly }: QuizAdvancedConfigProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Perguntas por Rodada</Label>
        <Input
          type="number"
          min={3}
          max={20}
          value={config.questionsPerRound || 10}
          onChange={e => onChange("questionsPerRound", parseInt(e.target.value) || 10)}
          disabled={readonly}
        />
      </div>

      <div className="flex items-center justify-between rounded-lg border p-4">
        <div className="space-y-0.5">
          <Label>Dificuldade Adaptativa</Label>
          <p className="text-sm text-muted-foreground">Ajusta dificuldade com base no desempenho</p>
        </div>
        <Switch
          checked={config.adaptiveDifficulty ?? true}
          onCheckedChange={v => onChange("adaptiveDifficulty", v)}
          disabled={readonly}
        />
      </div>

      <div className="space-y-2">
        <Label>Tempo por Pergunta (segundos)</Label>
        <Input
          type="number"
          min={5}
          max={120}
          value={config.timePerQuestion || 30}
          onChange={e => onChange("timePerQuestion", parseInt(e.target.value) || 30)}
          disabled={readonly}
        />
      </div>
    </div>
  );
}
