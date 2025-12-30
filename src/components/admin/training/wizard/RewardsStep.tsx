/**
 * RewardsStep - Step 3: Recompensas e gamificação
 * Reorganizado: Template como fonte principal, override opcional
 */

import { useState, useCallback, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { 
  Award,
  Coins,
  Sparkles,
  Plus,
  X,
  Zap,
  Target,
  TrendingUp,
  Calculator,
  ChevronDown,
  Settings2,
  Edit3,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { TrainingFormData, SkillImpact, InsigniaRelation } from "../TrainingWizard";
import { ItemRewardsSection } from "@/components/rewards/ItemRewardsSection";
import { EvolutionTemplateSection } from "@/components/rewards/EvolutionTemplateSection";
import type { ItemRewardConfig } from "@/hooks/useItemRewards";
import type { EvolutionTemplate } from "@/hooks/useEvolutionTemplates";

interface RewardsStepProps {
  formData: TrainingFormData;
  setFormData: React.Dispatch<React.SetStateAction<TrainingFormData>>;
  skillImpacts: SkillImpact[];
  setSkillImpacts: React.Dispatch<React.SetStateAction<SkillImpact[]>>;
  insigniaRelations: InsigniaRelation[];
  setInsigniaRelations: React.Dispatch<React.SetStateAction<InsigniaRelation[]>>;
  availableSkills: Array<{id: string; name: string; icon: string}>;
  availableInsignias: Array<{id: string; name: string; icon: string}>;
  xpMultiplier: number;
  setXpMultiplier: React.Dispatch<React.SetStateAction<number>>;
  coinsMultiplier: number;
  setCoinsMultiplier: React.Dispatch<React.SetStateAction<number>>;
  rewardItems: ItemRewardConfig[];
  setRewardItems: React.Dispatch<React.SetStateAction<ItemRewardConfig[]>>;
  evolutionTemplateId: string | null;
  setEvolutionTemplateId: React.Dispatch<React.SetStateAction<string | null>>;
  // Callbacks para informar o pai sobre template selecionado
  onTemplateInfoChange?: (templateName: string | undefined, xp: number | undefined, coins: number | undefined, override: boolean) => void;
}

const RELATION_TYPES = [
  { value: "unlocks", label: "Desbloqueia" },
  { value: "required", label: "Requerido" },
  { value: "recommended", label: "Recomendado" },
];

export function RewardsStep({ 
  formData, 
  setFormData,
  skillImpacts,
  setSkillImpacts,
  insigniaRelations,
  setInsigniaRelations,
  availableSkills,
  availableInsignias,
  xpMultiplier,
  setXpMultiplier,
  coinsMultiplier,
  setCoinsMultiplier,
  rewardItems,
  setRewardItems,
  evolutionTemplateId,
  setEvolutionTemplateId,
  onTemplateInfoChange,
}: RewardsStepProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [overrideRewards, setOverrideRewards] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<EvolutionTemplate | null>(null);

  // Callback para receber o template selecionado
  const handleTemplateChange = useCallback((template: EvolutionTemplate | null) => {
    setSelectedTemplate(template);
    // Quando um template é selecionado, desabilitar override por padrão
    if (template) {
      setOverrideRewards(false);
    }
  }, []);

  // Notificar o pai sobre mudanças no template/override
  useEffect(() => {
    onTemplateInfoChange?.(
      selectedTemplate?.name,
      selectedTemplate?.suggested_xp,
      selectedTemplate?.suggested_coins,
      overrideRewards
    );
  }, [selectedTemplate, overrideRewards, onTemplateInfoChange]);

  // Calcular recompensas efetivas (template ou override)
  const effectiveXp = !selectedTemplate || overrideRewards
    ? formData.xp_reward
    : selectedTemplate.suggested_xp || 0;

  const effectiveCoins = !selectedTemplate || overrideRewards
    ? formData.coins_reward
    : selectedTemplate.suggested_coins || 0;

  // Calculate estimated totals with multipliers
  const estimatedXp = Math.round(effectiveXp * xpMultiplier);
  const estimatedCoins = Math.round(effectiveCoins * coinsMultiplier);

  const addSkillImpact = () => {
    if (skillImpacts.length >= 3) return;
    const availableSkill = availableSkills.find(
      s => !skillImpacts.some(si => si.skillId === s.id)
    );
    if (availableSkill) {
      setSkillImpacts([...skillImpacts, { skillId: availableSkill.id, weight: 50 }]);
    }
  };

  const removeSkillImpact = (skillId: string) => {
    setSkillImpacts(skillImpacts.filter(si => si.skillId !== skillId));
  };

  const updateSkillWeight = (skillId: string, weight: number) => {
    setSkillImpacts(skillImpacts.map(si => 
      si.skillId === skillId ? { ...si, weight } : si
    ));
  };

  const addInsigniaRelation = () => {
    const availableInsignia = availableInsignias.find(
      i => !insigniaRelations.some(ir => ir.insigniaId === i.id)
    );
    if (availableInsignia) {
      setInsigniaRelations([...insigniaRelations, { insigniaId: availableInsignia.id, relationType: "unlocks" }]);
    }
  };

  const removeInsigniaRelation = (insigniaId: string) => {
    setInsigniaRelations(insigniaRelations.filter(ir => ir.insigniaId !== insigniaId));
  };

  // Preencher campos com valores do template
  const fillFromTemplate = () => {
    if (selectedTemplate) {
      setFormData(prev => ({
        ...prev,
        xp_reward: selectedTemplate.suggested_xp || 0,
        coins_reward: selectedTemplate.suggested_coins || 0,
      }));
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Evolution Template - FONTE PRINCIPAL */}
      <EvolutionTemplateSection
        selectedTemplateId={evolutionTemplateId}
        setSelectedTemplateId={setEvolutionTemplateId}
        onTemplateChange={handleTemplateChange}
      />

      {/* 2. Override Rewards - Apenas quando template selecionado */}
      {selectedTemplate && (
        <div className="space-y-4">
          <div 
            className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => setOverrideRewards(!overrideRewards)}
          >
            <Checkbox 
              checked={overrideRewards} 
              onCheckedChange={(checked) => setOverrideRewards(!!checked)}
              onClick={(e) => e.stopPropagation()}
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Personalizar recompensas</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Sobrescreve os valores sugeridos pelo template ({selectedTemplate.suggested_xp} XP, {selectedTemplate.suggested_coins} moedas)
              </p>
            </div>
          </div>

          {overrideRewards && (
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                    Recompensas Personalizadas
                  </Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={fillFromTemplate}
                  >
                    <Info className="w-3 h-3 mr-1" />
                    Usar valores do template
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-purple-500" />
                      <Label htmlFor="xp_reward" className="text-sm">XP Base</Label>
                    </div>
                    <Input
                      id="xp_reward"
                      type="number"
                      min="0"
                      value={formData.xp_reward}
                      onChange={(e) => setFormData(prev => ({ ...prev, xp_reward: parseInt(e.target.value) || 0 }))}
                      className="text-lg font-semibold"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Coins className="w-4 h-4 text-amber-500" />
                      <Label htmlFor="coins_reward" className="text-sm">Moedas Base</Label>
                    </div>
                    <Input
                      id="coins_reward"
                      type="number"
                      min="0"
                      value={formData.coins_reward}
                      onChange={(e) => setFormData(prev => ({ ...prev, coins_reward: parseInt(e.target.value) || 0 }))}
                      className="text-lg font-semibold"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* 3. Base Rewards - Apenas quando NÃO há template */}
      {!selectedTemplate && (
        <div>
          <Label className="text-xs uppercase tracking-wide text-muted-foreground mb-3 block">
            Recompensas Base
          </Label>
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-purple-500/10">
                    <Sparkles className="w-5 h-5 text-purple-500" />
                  </div>
                  <div>
                    <Label htmlFor="xp_reward_base" className="font-medium">XP Base</Label>
                    <p className="text-xs text-muted-foreground">Experiência</p>
                  </div>
                </div>
                <Input
                  id="xp_reward_base"
                  type="number"
                  min="0"
                  value={formData.xp_reward}
                  onChange={(e) => setFormData(prev => ({ ...prev, xp_reward: parseInt(e.target.value) || 0 }))}
                  className="text-lg font-semibold"
                />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-amber-500/10">
                    <Coins className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <Label htmlFor="coins_reward_base" className="font-medium">Moedas Base</Label>
                    <p className="text-xs text-muted-foreground">Para a loja</p>
                  </div>
                </div>
                <Input
                  id="coins_reward_base"
                  type="number"
                  min="0"
                  value={formData.coins_reward}
                  onChange={(e) => setFormData(prev => ({ ...prev, coins_reward: parseInt(e.target.value) || 0 }))}
                  className="text-lg font-semibold"
                />
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* 4. Multipliers */}
      <div>
        <Label className="text-xs uppercase tracking-wide text-muted-foreground mb-3 flex items-center gap-2">
          <TrendingUp className="w-3 h-3" />
          Multiplicadores da Organização
        </Label>
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-500" />
                    Multiplicador XP
                  </span>
                  <Badge variant="secondary" className="text-sm font-semibold">
                    {xpMultiplier}x
                  </Badge>
                </div>
                <Slider
                  value={[xpMultiplier]}
                  onValueChange={([value]) => setXpMultiplier(value)}
                  min={0.5}
                  max={3}
                  step={0.1}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0.5x</span>
                  <span>3x</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium flex items-center gap-2">
                    <Coins className="w-4 h-4 text-amber-500" />
                    Multiplicador Moedas
                  </span>
                  <Badge variant="secondary" className="text-sm font-semibold">
                    {coinsMultiplier}x
                  </Badge>
                </div>
                <Slider
                  value={[coinsMultiplier]}
                  onValueChange={([value]) => setCoinsMultiplier(value)}
                  min={0.5}
                  max={3}
                  step={0.1}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0.5x</span>
                  <span>3x</span>
                </div>
              </div>
            </div>

            {/* Estimated Preview */}
            <div className="pt-4 border-t border-border">
              <div className="flex items-center gap-2 mb-3">
                <Calculator className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Recompensa Total Estimada</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 p-3 rounded-lg bg-purple-500/5 border border-purple-500/20">
                  <Sparkles className="w-5 h-5 text-purple-500" />
                  <div>
                    <div className="text-lg font-bold text-purple-600">{estimatedXp}</div>
                    <div className="text-xs text-muted-foreground">
                      XP Total {selectedTemplate && !overrideRewards && <span>(do template)</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
                  <Coins className="w-5 h-5 text-amber-500" />
                  <div>
                    <div className="text-lg font-bold text-amber-600">{estimatedCoins}</div>
                    <div className="text-xs text-muted-foreground">
                      Moedas Total {selectedTemplate && !overrideRewards && <span>(do template)</span>}
                    </div>
                  </div>
                </div>
              </div>
              {(xpMultiplier !== 1 || coinsMultiplier !== 1) && (
                <div className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
                  <Info className="w-3 h-3" />
                  Base: {effectiveXp} XP × {xpMultiplier}x = {estimatedXp} | {effectiveCoins} moedas × {coinsMultiplier}x = {estimatedCoins}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 5. Item Rewards */}
      <ItemRewardsSection
        rewardItems={rewardItems}
        setRewardItems={setRewardItems}
        maxItems={3}
      />

      {/* 6. Advanced Configuration - Skills & Insignias */}
      <div className="pt-2">
        <div 
          className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          <Checkbox 
            checked={showAdvanced} 
            onCheckedChange={(checked) => setShowAdvanced(!!checked)}
            onClick={(e) => e.stopPropagation()}
          />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Settings2 className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Configurações Avançadas</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Vincular skills impactadas e insígnias relacionadas
            </p>
          </div>
          <ChevronDown className={cn(
            "w-4 h-4 text-muted-foreground transition-transform",
            showAdvanced && "rotate-180"
          )} />
        </div>

        <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
          <CollapsibleContent className="pt-4 space-y-6">
            {/* Skill Impacts */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground flex items-center gap-2">
                  <Zap className="w-3 h-3" />
                  Skills Impactadas (máx. 3)
                </Label>
                {skillImpacts.length < 3 && availableSkills.length > skillImpacts.length && (
                  <Button type="button" variant="outline" size="sm" onClick={addSkillImpact}>
                    <Plus className="w-4 h-4 mr-1" />
                    Adicionar
                  </Button>
                )}
              </div>

              {skillImpacts.length === 0 ? (
                <div className="text-center py-6 border border-dashed border-border rounded-lg">
                  <Target className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Nenhuma skill vinculada</p>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    className="mt-2"
                    onClick={addSkillImpact}
                    disabled={availableSkills.length === 0}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Adicionar Skill
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {skillImpacts.map((impact) => {
                    const skill = availableSkills.find(s => s.id === impact.skillId);
                    return (
                      <Card key={impact.skillId}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <Select
                                value={impact.skillId}
                                onValueChange={(value) => {
                                  setSkillImpacts(skillImpacts.map(si =>
                                    si.skillId === impact.skillId ? { ...si, skillId: value } : si
                                  ));
                                }}
                              >
                                <SelectTrigger className="w-48">
                                  <SelectValue>
                                    <span className="flex items-center gap-2">
                                      <span>{skill?.icon}</span>
                                      <span>{skill?.name}</span>
                                    </span>
                                  </SelectValue>
                                </SelectTrigger>
                                <SelectContent className="bg-popover z-50">
                                  {availableSkills
                                    .filter(s => s.id === impact.skillId || !skillImpacts.some(si => si.skillId === s.id))
                                    .map((s) => (
                                      <SelectItem key={s.id} value={s.id}>
                                        <span className="flex items-center gap-2">
                                          <span>{s.icon}</span>
                                          <span>{s.name}</span>
                                        </span>
                                      </SelectItem>
                                    ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              onClick={() => removeSkillImpact(impact.skillId)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Peso do impacto</span>
                              <Badge variant="secondary">{impact.weight}%</Badge>
                            </div>
                            <Slider
                              value={[impact.weight]}
                              onValueChange={([value]) => updateSkillWeight(impact.skillId, value)}
                              min={10}
                              max={100}
                              step={10}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Insignia Relations */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground flex items-center gap-2">
                  <Award className="w-3 h-3" />
                  Insígnias Relacionadas
                </Label>
                {availableInsignias.length > insigniaRelations.length && (
                  <Button type="button" variant="outline" size="sm" onClick={addInsigniaRelation}>
                    <Plus className="w-4 h-4 mr-1" />
                    Adicionar
                  </Button>
                )}
              </div>

              {insigniaRelations.length === 0 ? (
                <div className="text-center py-6 border border-dashed border-border rounded-lg">
                  <Award className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Nenhuma insígnia vinculada</p>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    className="mt-2"
                    onClick={addInsigniaRelation}
                    disabled={availableInsignias.length === 0}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Adicionar Insígnia
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {insigniaRelations.map((relation) => {
                    const insignia = availableInsignias.find(i => i.id === relation.insigniaId);
                    return (
                      <Card key={relation.insigniaId}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Select
                                value={relation.insigniaId}
                                onValueChange={(value) => {
                                  setInsigniaRelations(insigniaRelations.map(ir =>
                                    ir.insigniaId === relation.insigniaId ? { ...ir, insigniaId: value } : ir
                                  ));
                                }}
                              >
                                <SelectTrigger className="w-40">
                                  <SelectValue>
                                    <span className="flex items-center gap-2">
                                      <span>{insignia?.icon}</span>
                                      <span>{insignia?.name}</span>
                                    </span>
                                  </SelectValue>
                                </SelectTrigger>
                                <SelectContent className="bg-popover z-50">
                                  {availableInsignias
                                    .filter(i => i.id === relation.insigniaId || !insigniaRelations.some(ir => ir.insigniaId === i.id))
                                    .map((i) => (
                                      <SelectItem key={i.id} value={i.id}>
                                        <span className="flex items-center gap-2">
                                          <span>{i.icon}</span>
                                          <span>{i.name}</span>
                                        </span>
                                      </SelectItem>
                                    ))}
                                </SelectContent>
                              </Select>

                              <Select
                                value={relation.relationType}
                                onValueChange={(value) => {
                                  setInsigniaRelations(insigniaRelations.map(ir =>
                                    ir.insigniaId === relation.insigniaId ? { ...ir, relationType: value } : ir
                                  ));
                                }}
                              >
                                <SelectTrigger className="w-36">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-popover z-50">
                                  {RELATION_TYPES.map((type) => (
                                    <SelectItem key={type.value} value={type.value}>
                                      {type.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              onClick={() => removeInsigniaRelation(relation.insigniaId)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
}