/**
 * CreateChallengeModal - Modal para criar desafios
 * Suporta personal, team e global
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Target,
  User,
  Users,
  Globe,
  Calendar,
  Zap,
  Coins,
  Award,
  ChevronRight,
  ChevronLeft,
  Check,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { 
  INTERNAL_METRICS, 
  PERSONAL_CHALLENGE_TEMPLATES,
  type ChallengeScope,
  type ChallengeSource,
  type ChallengeRewardType,
  type CreateChallengeData,
} from "@/hooks/useChallenges";
import { ItemRewardsSection } from "@/components/rewards/ItemRewardsSection";
import type { ItemRewardConfig } from "@/hooks/useItemRewards";

interface CreateChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: CreateChallengeData) => Promise<any>;
  teams?: Array<{ id: string; name: string; icon: string }>;
  canCreateTeam?: boolean;
  canCreateGlobal?: boolean;
}

const STEPS = ["Tipo", "Detalhes", "Período", "Meta", "Recompensa", "Itens"];

const SCOPE_OPTIONS = [
  { value: "personal" as const, label: "Pessoal", icon: User, description: "Só você participa" },
  { value: "team" as const, label: "Equipe", icon: Users, description: "Membros da equipe" },
  { value: "global" as const, label: "Global", icon: Globe, description: "Toda organização" },
];

export function CreateChallengeModal({
  isOpen,
  onClose,
  onCreate,
  teams = [],
  canCreateTeam = false,
  canCreateGlobal = false,
}: CreateChallengeModalProps) {
  const [step, setStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Form state
  const [scope, setScope] = useState<ChallengeScope>("personal");
  const [source, setSource] = useState<ChallengeSource>("internal");
  const [teamId, setTeamId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startsAt, setStartsAt] = useState(new Date().toISOString().split("T")[0]);
  const [endsAt, setEndsAt] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    return d.toISOString().split("T")[0];
  });
  const [metricType, setMetricType] = useState("custom");
  const [targetValue, setTargetValue] = useState(100);
  const [successCriteria, setSuccessCriteria] = useState("");
  const [rewardType, setRewardType] = useState<ChallengeRewardType>("both");
  const [xpReward, setXpReward] = useState(100);
  const [coinsReward, setCoinsReward] = useState(50);
  const [icon, setIcon] = useState("target");
  const [rewardItems, setRewardItems] = useState<ItemRewardConfig[]>([]);

  // Template selection for personal
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);

  const handleReset = () => {
    setStep(0);
    setScope("personal");
    setSource("internal");
    setTeamId(null);
    setName("");
    setDescription("");
    setSelectedTemplate(null);
    setMetricType("custom");
    setTargetValue(100);
    setSuccessCriteria("");
    setXpReward(100);
    setCoinsReward(50);
    setRewardItems([]);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleTemplateSelect = (index: number) => {
    const template = PERSONAL_CHALLENGE_TEMPLATES[index];
    setSelectedTemplate(index);
    setName(template.name);
    setDescription(template.description);
    setMetricType(template.metric_type);
    setTargetValue(template.target_value);
    setSuccessCriteria(template.description);
    setXpReward(template.xp_reward);
    setCoinsReward(template.coins_reward);
    setIcon(template.icon);
  };

  const canProceed = (): boolean => {
    switch (step) {
      case 0: 
        if (scope === "team") return !!teamId;
        return true;
      case 1: 
        if (scope === "personal" && selectedTemplate !== null) return true;
        return name.trim().length > 0 && description.trim().length > 0;
      case 2: return startsAt && endsAt && new Date(endsAt) > new Date(startsAt);
      case 3: return successCriteria.trim().length > 0 && targetValue > 0;
      case 4: return xpReward > 0 || coinsReward > 0;
      case 5: return true; // Item rewards são opcionais
      default: return false;
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    
    const data: CreateChallengeData = {
      name,
      description,
      scope,
      source,
      team_id: scope === "team" ? teamId : null,
      starts_at: new Date(startsAt).toISOString(),
      ends_at: new Date(endsAt).toISOString(),
      success_criteria: successCriteria,
      target_value: targetValue,
      metric_type: metricType,
      reward_type: rewardType,
      xp_reward: xpReward,
      coins_reward: coinsReward,
      icon,
      auto_enroll: scope === "personal",
      reward_items: rewardItems.length > 0 ? rewardItems : undefined,
    };

    const result = await onCreate(data);
    setIsLoading(false);
    
    if (result) {
      handleClose();
    }
  };

  const availableScopes = SCOPE_OPTIONS.filter(s => {
    if (s.value === "team") return canCreateTeam;
    if (s.value === "global") return canCreateGlobal;
    return true;
  });

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Criar Desafio
          </DialogTitle>
        </DialogHeader>

        {/* Progress indicator */}
        <div className="flex items-center gap-1 mb-4">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center flex-1">
              <div
                className={cn(
                  "w-full h-1 rounded-full transition-colors",
                  i <= step ? "bg-primary" : "bg-muted"
                )}
              />
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="min-h-[280px]"
          >
            {/* Step 0: Scope/Type */}
            {step === 0 && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">Que tipo de desafio você quer criar?</p>
                
                <RadioGroup value={scope} onValueChange={(v) => setScope(v as ChallengeScope)}>
                  {availableScopes.map((option) => (
                    <label
                      key={option.value}
                      className={cn(
                        "flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-all",
                        scope === option.value 
                          ? "border-primary bg-primary/5" 
                          : "border-border/50 hover:border-border"
                      )}
                    >
                      <RadioGroupItem value={option.value} />
                      <div className="p-2 rounded-lg bg-muted">
                        <option.icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{option.label}</p>
                        <p className="text-xs text-muted-foreground">{option.description}</p>
                      </div>
                    </label>
                  ))}
                </RadioGroup>

                {scope === "team" && teams.length > 0 && (
                  <div className="space-y-2">
                    <Label>Equipe</Label>
                    <Select value={teamId || ""} onValueChange={setTeamId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a equipe" />
                      </SelectTrigger>
                      <SelectContent>
                        {teams.map(team => (
                          <SelectItem key={team.id} value={team.id}>
                            {team.icon} {team.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            )}

            {/* Step 1: Details */}
            {step === 1 && (
              <div className="space-y-4">
                {scope === "personal" && (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">Escolha um modelo ou crie personalizado:</p>
                    <div className="grid gap-2">
                      {PERSONAL_CHALLENGE_TEMPLATES.map((template, index) => (
                        <button
                          key={template.metric_type}
                          onClick={() => handleTemplateSelect(index)}
                          className={cn(
                            "flex items-center gap-3 p-3 rounded-lg border text-left transition-all",
                            selectedTemplate === index
                              ? "border-primary bg-primary/5"
                              : "border-border/50 hover:border-border"
                          )}
                        >
                          <div className="p-2 rounded-lg bg-muted text-lg">
                            {template.icon === "flame" ? "🔥" : 
                             template.icon === "zap" ? "⚡" : 
                             template.icon === "award" ? "🏆" : "🎯"}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm">{template.name}</p>
                            <p className="text-xs text-muted-foreground">{template.description}</p>
                          </div>
                          {selectedTemplate === index && (
                            <Check className="w-4 h-4 text-primary" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {(scope !== "personal" || selectedTemplate === null) && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Nome do Desafio</Label>
                      <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ex: Maratona de Vendas Q1"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Descrição</Label>
                      <Textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Descreva o objetivo do desafio..."
                        rows={3}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Period */}
            {step === 2 && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">Quando o desafio acontece?</p>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Início
                    </Label>
                    <Input
                      type="date"
                      value={startsAt}
                      onChange={(e) => setStartsAt(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Fim
                    </Label>
                    <Input
                      type="date"
                      value={endsAt}
                      onChange={(e) => setEndsAt(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Target */}
            {step === 3 && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">Qual é a meta do desafio?</p>

                <div className="space-y-2">
                  <Label>Critério de Sucesso</Label>
                  <Textarea
                    value={successCriteria}
                    onChange={(e) => setSuccessCriteria(e.target.value)}
                    placeholder="Ex: Atingir 100 vendas no período"
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Métrica</Label>
                    <Select value={metricType} onValueChange={setMetricType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="custom">Personalizada</SelectItem>
                        {INTERNAL_METRICS.map(m => (
                          <SelectItem key={m.id} value={m.id}>{m.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Valor Alvo</Label>
                    <Input
                      type="number"
                      value={targetValue}
                      onChange={(e) => setTargetValue(Number(e.target.value))}
                      min={1}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Rewards */}
            {step === 4 && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">Recompensas ao completar</p>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-primary" />
                      XP
                    </Label>
                    <Input
                      type="number"
                      value={xpReward}
                      onChange={(e) => setXpReward(Number(e.target.value))}
                      min={0}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Coins className="w-4 h-4 text-amber-400" />
                      Moedas
                    </Label>
                    <Input
                      type="number"
                      value={coinsReward}
                      onChange={(e) => setCoinsReward(Number(e.target.value))}
                      min={0}
                    />
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-muted/30 border border-border/30">
                  <p className="text-sm text-muted-foreground">
                    💡 Se outros apoiarem este desafio, as recompensas serão multiplicadas!
                  </p>
                </div>
              </div>
            )}

            {/* Step 5: Item Rewards */}
            {step === 5 && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Adicione itens da loja como recompensa (opcional)
                </p>
                <ItemRewardsSection
                  rewardItems={rewardItems}
                  setRewardItems={setRewardItems}
                  maxItems={3}
                />
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between pt-4 border-t">
          <Button
            variant="ghost"
            onClick={() => step > 0 ? setStep(s => s - 1) : handleClose()}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            {step > 0 ? "Voltar" : "Cancelar"}
          </Button>

          {step < STEPS.length - 1 ? (
            <Button onClick={() => setStep(s => s + 1)} disabled={!canProceed()}>
              Próximo
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={!canProceed() || isLoading}>
              {isLoading ? "Criando..." : "Criar Desafio"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
