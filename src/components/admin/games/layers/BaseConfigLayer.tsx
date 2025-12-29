import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Clock, Target, Repeat, Layers } from "lucide-react";
import type { GameBaseConfig } from "@/hooks/useGameConfig";

interface BaseConfigLayerProps {
  config: GameBaseConfig;
  onChange: (updates: Partial<GameBaseConfig>) => void;
  readonly?: boolean;
}

const SKILL_OPTIONS = [
  { value: "leadership", label: "Liderança" },
  { value: "communication", label: "Comunicação" },
  { value: "negotiation", label: "Negociação" },
  { value: "problem_solving", label: "Resolução de Problemas" },
  { value: "decision_making", label: "Tomada de Decisão" },
  { value: "critical_thinking", label: "Pensamento Crítico" },
  { value: "emotional_intelligence", label: "Inteligência Emocional" },
  { value: "adaptability", label: "Adaptabilidade" },
];

export function BaseConfigLayer({ config, onChange, readonly }: BaseConfigLayerProps) {
  const toggleSkill = (skill: string) => {
    const current = config.skill_categories || [];
    const updated = current.includes(skill)
      ? current.filter(s => s !== skill)
      : [...current, skill];
    onChange({ skill_categories: updated });
  };

  return (
    <div className="space-y-6">
      {/* Informações Básicas */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Layers className="h-4 w-4" />
          Informações Básicas
        </h4>
        
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="display_name">Nome do Jogo</Label>
            <Input
              id="display_name"
              value={config.display_name}
              onChange={e => onChange({ display_name: e.target.value })}
              disabled={readonly}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="game_type">Tipo</Label>
            <Input
              id="game_type"
              value={config.game_type}
              disabled
              className="bg-muted"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Descrição</Label>
          <Textarea
            id="description"
            value={config.description || ""}
            onChange={e => onChange({ description: e.target.value })}
            disabled={readonly}
            rows={3}
          />
        </div>
      </div>

      {/* Skills Trabalhadas */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-foreground">Skills Trabalhadas</h4>
        <div className="flex flex-wrap gap-2">
          {SKILL_OPTIONS.map(skill => (
            <Badge
              key={skill.value}
              variant={config.skill_categories?.includes(skill.value) ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => !readonly && toggleSkill(skill.value)}
            >
              {skill.label}
            </Badge>
          ))}
        </div>
      </div>

      {/* Configurações de Jogo */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Configurações de Jogo
        </h4>
        
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="duration">Duração (min)</Label>
            <Input
              id="duration"
              type="number"
              min={1}
              value={config.duration_minutes}
              onChange={e => onChange({ duration_minutes: parseInt(e.target.value) || 10 })}
              disabled={readonly}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="difficulty">Dificuldade Padrão</Label>
            <Select
              value={config.default_difficulty}
              onValueChange={v => onChange({ default_difficulty: v as any })}
              disabled={readonly}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Fácil</SelectItem>
                <SelectItem value="medium">Médio</SelectItem>
                <SelectItem value="hard">Difícil</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="metric">Métrica Principal</Label>
            <Select
              value={config.primary_metric}
              onValueChange={v => onChange({ primary_metric: v as any })}
              disabled={readonly}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="score">Pontuação</SelectItem>
                <SelectItem value="accuracy">Precisão</SelectItem>
                <SelectItem value="completion">Conclusão</SelectItem>
                <SelectItem value="time">Tempo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Meta e Repetição */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Target className="h-4 w-4" />
          Meta e Repetição
        </h4>
        
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="target">Meta Target Padrão (%)</Label>
            <Input
              id="target"
              type="number"
              min={0}
              max={100}
              value={config.target_score}
              onChange={e => onChange({ target_score: parseInt(e.target.value) || 70 })}
              disabled={readonly}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="attempts">Tentativas por Dia</Label>
            <Input
              id="attempts"
              type="number"
              min={0}
              placeholder="Ilimitado"
              value={config.max_attempts_per_day || ""}
              onChange={e => onChange({ 
                max_attempts_per_day: e.target.value ? parseInt(e.target.value) : null 
              })}
              disabled={readonly}
            />
          </div>
        </div>

        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label className="flex items-center gap-2">
              <Repeat className="h-4 w-4" />
              Reaplicável
            </Label>
            <p className="text-sm text-muted-foreground">
              Permitir que usuários joguem múltiplas vezes
            </p>
          </div>
          <Switch
            checked={config.is_repeatable}
            onCheckedChange={v => onChange({ is_repeatable: v })}
            disabled={readonly}
          />
        </div>
      </div>
    </div>
  );
}
