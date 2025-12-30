import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Clock, Coins, Sparkles, Lock, CheckCircle2, AlertCircle } from "lucide-react";
import type { TrainingModule } from "@/hooks/useTrainingEditor";

interface StepSettingsProps {
  module: TrainingModule | null;
  onChange: (data: Partial<TrainingModule>) => void;
}

export function StepSettings({ module, onChange }: StepSettingsProps) {
  if (!module) {
    return (
      <div className="h-full flex items-center justify-center bg-muted/30 text-muted-foreground">
        <p className="text-sm">Selecione um módulo para configurar</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-muted/30">
      <div className="p-3 border-b">
        <h2 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
          Configurações
        </h2>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Time & Rewards Section */}
          <section className="space-y-4">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              Tempo & Recompensas
            </h3>

            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="time">Duração Estimada (min)</Label>
                <Input
                  id="time"
                  type="number"
                  min={1}
                  max={180}
                  value={module.time_minutes}
                  onChange={(e) => onChange({ time_minutes: parseInt(e.target.value) || 5 })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="xp" className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  XP da Etapa
                </Label>
                <Input
                  id="xp"
                  type="number"
                  min={0}
                  max={500}
                  value={module.xp_reward}
                  onChange={(e) => onChange({ xp_reward: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="coins" className="flex items-center gap-2">
                  <Coins className="w-3.5 h-3.5 text-yellow-500" />
                  Moedas da Etapa
                </Label>
                <Input
                  id="coins"
                  type="number"
                  min={0}
                  max={200}
                  value={module.coins_reward}
                  onChange={(e) => onChange({ coins_reward: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
          </section>

          <Separator />

          {/* Requirement Section */}
          <section className="space-y-4">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
              Obrigatoriedade
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Etapa Obrigatória</Label>
                  <p className="text-xs text-muted-foreground">
                    Usuário deve completar esta etapa
                  </p>
                </div>
                <Switch
                  checked={module.is_required}
                  onCheckedChange={(checked) => onChange({ is_required: checked, is_optional: !checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>É Checkpoint</Label>
                  <p className="text-xs text-muted-foreground">
                    Marca um ponto de verificação
                  </p>
                </div>
                <Switch
                  checked={module.is_checkpoint}
                  onCheckedChange={(checked) => onChange({ is_checkpoint: checked })}
                />
              </div>

              {module.is_checkpoint && (
                <div className="space-y-2">
                  <Label htmlFor="min-score">Score Mínimo (%)</Label>
                  <div className="flex items-center gap-3">
                    <Slider
                      value={[module.min_score || 70]}
                      onValueChange={([value]) => onChange({ min_score: value })}
                      min={0}
                      max={100}
                      step={5}
                      className="flex-1"
                    />
                    <Badge variant="secondary" className="min-w-[40px] justify-center">
                      {module.min_score || 70}%
                    </Badge>
                  </div>
                </div>
              )}
            </div>
          </section>

          <Separator />

          {/* Unlock Conditions */}
          <section className="space-y-4">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <Lock className="w-4 h-4 text-muted-foreground" />
              Condições de Desbloqueio
            </h3>

            <div className="space-y-3">
              <div className="space-y-2">
                <Label>Condição</Label>
                <Select
                  value={(module.unlock_condition as Record<string, string>)?.type || "previous_complete"}
                  onValueChange={(value) => onChange({ 
                    unlock_condition: { type: value } 
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sempre disponível</SelectItem>
                    <SelectItem value="previous_complete">Etapa anterior completa</SelectItem>
                    <SelectItem value="previous_score">Score mínimo na anterior</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </section>

          <Separator />

          {/* Preview Section */}
          <section className="space-y-4">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-muted-foreground" />
              Visibilidade
            </h3>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Disponível como Preview</Label>
                <p className="text-xs text-muted-foreground">
                  Visível para usuários não inscritos
                </p>
              </div>
              <Switch
                checked={module.is_preview_available}
                onCheckedChange={(checked) => onChange({ is_preview_available: checked })}
              />
            </div>
          </section>
        </div>
      </ScrollArea>
    </div>
  );
}
