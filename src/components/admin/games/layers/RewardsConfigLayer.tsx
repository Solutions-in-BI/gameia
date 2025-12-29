import { forwardRef } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Coins, Zap, Flame, Gift } from "lucide-react";
import type { GameBaseConfig } from "@/hooks/useGameConfig";

interface RewardsConfigLayerProps {
  config: GameBaseConfig;
  onChange: (updates: Partial<GameBaseConfig>) => void;
  readonly?: boolean;
}

export const RewardsConfigLayer = forwardRef<HTMLDivElement, RewardsConfigLayerProps>(
  function RewardsConfigLayer({ config, onChange, readonly }, ref) {
    const timeBonusConfig = config.time_bonus_config || { enabled: true, max_bonus_percent: 20 };
    const streakBonusConfig = config.streak_bonus_config || { enabled: true, bonus_per_day: 5, max_bonus: 50 };
    const difficultyMultipliers = config.difficulty_multipliers || { easy: 0.8, medium: 1, hard: 1.5 };

    const updateTimeBonus = (updates: Partial<typeof timeBonusConfig>) => {
      onChange({ time_bonus_config: { ...timeBonusConfig, ...updates } });
    };

    const updateStreakBonus = (updates: Partial<typeof streakBonusConfig>) => {
      onChange({ streak_bonus_config: { ...streakBonusConfig, ...updates } });
    };

    const updateDifficultyMultiplier = (difficulty: string, value: number) => {
      onChange({ 
        difficulty_multipliers: { ...difficultyMultipliers, [difficulty]: value } 
      });
    };

    // Preview calculation
    const calculatePreview = () => {
      const baseXP = config.xp_base_reward;
      const baseCoins = config.coins_base_reward;
      const multiplier = difficultyMultipliers.hard || 1.5;
      const timeBonus = timeBonusConfig.enabled ? timeBonusConfig.max_bonus_percent : 0;
      const streakBonus = streakBonusConfig.enabled ? streakBonusConfig.max_bonus : 0;
      
      const maxXP = Math.round(baseXP * multiplier * (1 + (timeBonus + streakBonus) / 100));
      const maxCoins = Math.round(baseCoins * multiplier * (1 + (timeBonus + streakBonus) / 100));
      
      return { baseXP, baseCoins, maxXP, maxCoins };
    };

    const preview = calculatePreview();

    return (
      <div ref={ref} className="space-y-6">
        {/* Preview Card */}
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Recompensa Base</p>
                <p className="text-2xl font-bold text-foreground">
                  {preview.baseXP} XP + {preview.baseCoins} 🪙
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-muted-foreground">Máximo Possível</p>
                <p className="text-2xl font-bold text-primary">
                  {preview.maxXP} XP + {preview.maxCoins} 🪙
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recompensas Base */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Recompensas Base
          </h4>
          
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="xp_base">XP Base</Label>
              <div className="relative">
                <Zap className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-yellow-500" />
                <Input
                  id="xp_base"
                  type="number"
                  min={0}
                  className="pl-10"
                  value={config.xp_base_reward}
                  onChange={e => onChange({ xp_base_reward: parseInt(e.target.value) || 0 })}
                  disabled={readonly}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="coins_base">Moedas Base</Label>
              <div className="relative">
                <Coins className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-amber-500" />
                <Input
                  id="coins_base"
                  type="number"
                  min={0}
                  className="pl-10"
                  value={config.coins_base_reward}
                  onChange={e => onChange({ coins_base_reward: parseInt(e.target.value) || 0 })}
                  disabled={readonly}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Multiplicadores por Dificuldade */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-foreground">Multiplicadores por Dificuldade</h4>
          
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { key: "easy", label: "Fácil", color: "text-green-500" },
              { key: "medium", label: "Médio", color: "text-yellow-500" },
              { key: "hard", label: "Difícil", color: "text-red-500" },
            ].map(d => (
              <div key={d.key} className="space-y-2">
                <Label className={d.color}>{d.label}</Label>
                <Input
                  type="number"
                  step={0.1}
                  min={0.1}
                  max={5}
                  value={difficultyMultipliers[d.key] || 1}
                  onChange={e => updateDifficultyMultiplier(d.key, parseFloat(e.target.value) || 1)}
                  disabled={readonly}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Bônus por Tempo */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Flame className="h-4 w-4 text-orange-500" />
              Bônus por Tempo
            </h4>
            <Switch
              checked={timeBonusConfig.enabled}
              onCheckedChange={v => updateTimeBonus({ enabled: v })}
              disabled={readonly}
            />
          </div>

          {timeBonusConfig.enabled && (
            <div className="space-y-2">
              <Label>Bônus Máximo (%)</Label>
              <Input
                type="number"
                min={0}
                max={100}
                value={timeBonusConfig.max_bonus_percent}
                onChange={e => updateTimeBonus({ max_bonus_percent: parseInt(e.target.value) || 0 })}
                disabled={readonly}
              />
              <p className="text-xs text-muted-foreground">
                Jogadores ganham até +{timeBonusConfig.max_bonus_percent}% por terminar rápido
              </p>
            </div>
          )}
        </div>

        {/* Bônus por Streak */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Flame className="h-4 w-4 text-red-500" />
              Bônus por Sequência (Streak)
            </h4>
            <Switch
              checked={streakBonusConfig.enabled}
              onCheckedChange={v => updateStreakBonus({ enabled: v })}
              disabled={readonly}
            />
          </div>

          {streakBonusConfig.enabled && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Bônus por Dia (%)</Label>
                <Input
                  type="number"
                  min={0}
                  max={50}
                  value={streakBonusConfig.bonus_per_day}
                  onChange={e => updateStreakBonus({ bonus_per_day: parseInt(e.target.value) || 0 })}
                  disabled={readonly}
                />
              </div>
              <div className="space-y-2">
                <Label>Bônus Máximo (%)</Label>
                <Input
                  type="number"
                  min={0}
                  max={200}
                  value={streakBonusConfig.max_bonus}
                  onChange={e => updateStreakBonus({ max_bonus: parseInt(e.target.value) || 0 })}
                  disabled={readonly}
                />
              </div>
            </div>
          )}
        </div>

        {/* Recompensa por Participação */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Gift className="h-4 w-4 text-purple-500" />
            Recompensa por Participação
          </h4>
          <p className="text-sm text-muted-foreground">
            XP/Moedas mínimos, mesmo sem atingir a meta
          </p>
          
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>XP de Participação</Label>
              <Input
                type="number"
                min={0}
                value={config.participation_xp || 0}
                onChange={e => onChange({ participation_xp: parseInt(e.target.value) || 0 })}
                disabled={readonly}
              />
            </div>
            <div className="space-y-2">
              <Label>Moedas de Participação</Label>
              <Input
                type="number"
                min={0}
                value={config.participation_coins || 0}
                onChange={e => onChange({ participation_coins: parseInt(e.target.value) || 0 })}
                disabled={readonly}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
);
