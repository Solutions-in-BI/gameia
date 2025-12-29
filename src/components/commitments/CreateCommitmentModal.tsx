/**
 * CreateCommitmentModal - Modal para criação de compromissos
 * Formulário em steps para facilitar preenchimento
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Check,
  Users,
  Globe,
  Zap,
  FileEdit,
  Coins,
  Star,
  Calendar,
  Target,
  Award
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { 
  CreateCommitmentData, 
  CommitmentScope, 
  CommitmentSource, 
  CommitmentRewardType,
  INTERNAL_METRICS 
} from "@/hooks/useCommitments";
import { OrgTeam } from "@/hooks/useOrgTeams";
import { format, addDays } from "date-fns";

interface CreateCommitmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teams: OrgTeam[];
  canCreateGlobal: boolean;
  onSubmit: (data: CreateCommitmentData) => Promise<void>;
}

type Step = 1 | 2 | 3 | 4 | 5;

const STEPS: { id: Step; title: string }[] = [
  { id: 1, title: "Básico" },
  { id: 2, title: "Escopo" },
  { id: 3, title: "Período" },
  { id: 4, title: "Meta" },
  { id: 5, title: "Recompensa" },
];

export function CreateCommitmentModal({
  open,
  onOpenChange,
  teams,
  canCreateGlobal,
  onSubmit,
}: CreateCommitmentModalProps) {
  const [step, setStep] = useState<Step>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [scope, setScope] = useState<CommitmentScope>("team");
  const [source, setSource] = useState<CommitmentSource>("external");
  const [teamId, setTeamId] = useState<string | null>(null);
  const [startsAt, setStartsAt] = useState(format(new Date(), "yyyy-MM-dd"));
  const [endsAt, setEndsAt] = useState(format(addDays(new Date(), 30), "yyyy-MM-dd"));
  const [successCriteria, setSuccessCriteria] = useState("");
  const [targetValue, setTargetValue] = useState(100);
  const [metricType, setMetricType] = useState("custom");
  const [rewardType, setRewardType] = useState<CommitmentRewardType>("both");
  const [coinsReward, setCoinsReward] = useState(500);
  const [xpReward, setXpReward] = useState(200);
  const [autoEnroll, setAutoEnroll] = useState(false);

  const resetForm = () => {
    setStep(1);
    setName("");
    setDescription("");
    setScope("team");
    setSource("external");
    setTeamId(null);
    setStartsAt(format(new Date(), "yyyy-MM-dd"));
    setEndsAt(format(addDays(new Date(), 30), "yyyy-MM-dd"));
    setSuccessCriteria("");
    setTargetValue(100);
    setMetricType("custom");
    setRewardType("both");
    setCoinsReward(500);
    setXpReward(200);
    setAutoEnroll(false);
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const canProceed = () => {
    switch (step) {
      case 1: return name.trim().length > 0 && description.trim().length > 0;
      case 2: return scope === "global" || teamId !== null;
      case 3: return startsAt && endsAt && new Date(endsAt) > new Date(startsAt);
      case 4: return successCriteria.trim().length > 0 && targetValue > 0;
      case 5: return rewardType === "insignia" || coinsReward > 0 || xpReward > 0;
      default: return false;
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSubmit({
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
        coins_reward: (rewardType === "coins" || rewardType === "both") ? coinsReward : 0,
        xp_reward: (rewardType === "xp" || rewardType === "both") ? xpReward : 0,
        auto_enroll: autoEnroll,
      });
      handleClose();
    } catch (error) {
      console.error("Error creating commitment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nome do Compromisso</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Meta de Vendas Q1"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descreva o objetivo do compromisso de forma clara..."
                className="mt-1.5 min-h-[100px]"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            {/* Scope */}
            <div>
              <Label className="mb-3 block">Escopo</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setScope("team")}
                  className={cn(
                    "p-4 rounded-xl border-2 text-left transition-all",
                    scope === "team" 
                      ? "border-primary bg-primary/5" 
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <Users className="w-6 h-6 text-primary mb-2" />
                  <p className="font-medium text-foreground">Equipe</p>
                  <p className="text-xs text-muted-foreground">Apenas membros de uma equipe</p>
                </button>

                <button
                  type="button"
                  onClick={() => canCreateGlobal && setScope("global")}
                  disabled={!canCreateGlobal}
                  className={cn(
                    "p-4 rounded-xl border-2 text-left transition-all",
                    scope === "global" 
                      ? "border-primary bg-primary/5" 
                      : "border-border hover:border-primary/50",
                    !canCreateGlobal && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <Globe className="w-6 h-6 text-primary mb-2" />
                  <p className="font-medium text-foreground">Global</p>
                  <p className="text-xs text-muted-foreground">Toda a organização</p>
                </button>
              </div>
            </div>

            {/* Team selector */}
            {scope === "team" && (
              <div>
                <Label className="mb-3 block">Selecione a Equipe</Label>
                <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto">
                  {teams.map(team => (
                    <button
                      key={team.id}
                      type="button"
                      onClick={() => setTeamId(team.id)}
                      className={cn(
                        "p-3 rounded-lg border text-left transition-all flex items-center gap-2",
                        teamId === team.id 
                          ? "border-primary bg-primary/5" 
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <span className="text-lg">{team.icon}</span>
                      <span className="font-medium text-sm truncate">{team.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Source */}
            <div>
              <Label className="mb-3 block">Fonte de Dados</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSource("internal")}
                  className={cn(
                    "p-4 rounded-xl border-2 text-left transition-all",
                    source === "internal" 
                      ? "border-primary bg-primary/5" 
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <Zap className="w-6 h-6 text-primary mb-2" />
                  <p className="font-medium text-foreground">Interno</p>
                  <p className="text-xs text-muted-foreground">Métricas automáticas do Gameia</p>
                </button>

                <button
                  type="button"
                  onClick={() => setSource("external")}
                  className={cn(
                    "p-4 rounded-xl border-2 text-left transition-all",
                    source === "external" 
                      ? "border-primary bg-primary/5" 
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <FileEdit className="w-6 h-6 text-primary mb-2" />
                  <p className="font-medium text-foreground">Externo</p>
                  <p className="text-xs text-muted-foreground">Dados inseridos manualmente</p>
                </button>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="starts_at">Data de Início</Label>
                <Input
                  id="starts_at"
                  type="date"
                  value={startsAt}
                  onChange={(e) => setStartsAt(e.target.value)}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="ends_at">Data de Término</Label>
                <Input
                  id="ends_at"
                  type="date"
                  value={endsAt}
                  onChange={(e) => setEndsAt(e.target.value)}
                  min={startsAt}
                  className="mt-1.5"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Duração: {Math.ceil((new Date(endsAt).getTime() - new Date(startsAt).getTime()) / (1000 * 60 * 60 * 24))} dias
              </span>
            </div>

            <div className="flex items-center gap-3 pt-4">
              <input
                type="checkbox"
                id="autoEnroll"
                checked={autoEnroll}
                onChange={(e) => setAutoEnroll(e.target.checked)}
                className="rounded border-border"
              />
              <Label htmlFor="autoEnroll" className="cursor-pointer">
                Inscrever membros automaticamente
              </Label>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            {source === "internal" && (
              <div>
                <Label className="mb-3 block">Tipo de Métrica</Label>
                <div className="grid grid-cols-2 gap-2">
                  {INTERNAL_METRICS.map(metric => (
                    <button
                      key={metric.id}
                      type="button"
                      onClick={() => setMetricType(metric.id)}
                      className={cn(
                        "p-3 rounded-lg border text-left transition-all",
                        metricType === metric.id 
                          ? "border-primary bg-primary/5" 
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <p className="font-medium text-sm text-foreground">{metric.label}</p>
                      <p className="text-xs text-muted-foreground">{metric.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="target_value">Meta (Valor Alvo)</Label>
              <Input
                id="target_value"
                type="number"
                value={targetValue}
                onChange={(e) => setTargetValue(Number(e.target.value))}
                min={1}
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="success_criteria">Critério de Sucesso</Label>
              <Textarea
                id="success_criteria"
                value={successCriteria}
                onChange={(e) => setSuccessCriteria(e.target.value)}
                placeholder="Ex: Atingir 80% de engajamento médio na equipe"
                className="mt-1.5"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Descreva claramente como o sucesso será medido
              </p>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div>
              <Label className="mb-3 block">Tipo de Recompensa</Label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setRewardType("coins")}
                  className={cn(
                    "p-4 rounded-xl border-2 text-center transition-all",
                    rewardType === "coins" 
                      ? "border-gameia-coins bg-gameia-coins/5" 
                      : "border-border hover:border-gameia-coins/50"
                  )}
                >
                  <Coins className="w-6 h-6 text-gameia-coins mx-auto mb-2" />
                  <p className="font-medium text-foreground text-sm">Moedas</p>
                </button>

                <button
                  type="button"
                  onClick={() => setRewardType("xp")}
                  className={cn(
                    "p-4 rounded-xl border-2 text-center transition-all",
                    rewardType === "xp" 
                      ? "border-primary bg-primary/5" 
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <Star className="w-6 h-6 text-primary mx-auto mb-2" />
                  <p className="font-medium text-foreground text-sm">XP</p>
                </button>

                <button
                  type="button"
                  onClick={() => setRewardType("both")}
                  className={cn(
                    "p-4 rounded-xl border-2 text-center transition-all",
                    rewardType === "both" 
                      ? "border-primary bg-primary/5" 
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <Award className="w-6 h-6 text-primary mx-auto mb-2" />
                  <p className="font-medium text-foreground text-sm">Ambos</p>
                </button>
              </div>
            </div>

            {(rewardType === "coins" || rewardType === "both") && (
              <div>
                <Label htmlFor="coins_reward">Moedas por Participante</Label>
                <Input
                  id="coins_reward"
                  type="number"
                  value={coinsReward}
                  onChange={(e) => setCoinsReward(Number(e.target.value))}
                  min={0}
                  className="mt-1.5"
                />
              </div>
            )}

            {(rewardType === "xp" || rewardType === "both") && (
              <div>
                <Label htmlFor="xp_reward">XP por Participante</Label>
                <Input
                  id="xp_reward"
                  type="number"
                  value={xpReward}
                  onChange={(e) => setXpReward(Number(e.target.value))}
                  min={0}
                  className="mt-1.5"
                />
              </div>
            )}

            {/* Preview */}
            <div className="p-4 rounded-xl bg-muted/50 border border-border/50">
              <p className="text-sm font-medium text-foreground mb-2">Preview da Recompensa</p>
              <div className="flex items-center gap-4">
                {(rewardType === "coins" || rewardType === "both") && coinsReward > 0 && (
                  <div className="flex items-center gap-1">
                    <Coins className="w-5 h-5 text-gameia-coins" />
                    <span className="font-bold text-foreground">{coinsReward}</span>
                  </div>
                )}
                {(rewardType === "xp" || rewardType === "both") && xpReward > 0 && (
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 text-primary" />
                    <span className="font-bold text-foreground">{xpReward} XP</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4 border-b border-border/50">
          <DialogTitle className="flex items-center justify-between">
            <span>Novo Compromisso</span>
            <button onClick={handleClose} className="p-1 rounded-lg hover:bg-muted">
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </DialogTitle>

          {/* Progress steps */}
          <div className="flex items-center gap-2 mt-4">
            {STEPS.map((s, index) => (
              <div key={s.id} className="flex items-center">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                    step >= s.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {step > s.id ? <Check className="w-4 h-4" /> : s.id}
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={cn(
                      "w-8 h-0.5 mx-1",
                      step > s.id ? "bg-primary" : "bg-muted"
                    )}
                  />
                )}
              </div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {STEPS.find(s => s.id === step)?.title}
          </p>
        </DialogHeader>

        {/* Content */}
        <div className="p-6 min-h-[300px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-6 pt-4 border-t border-border/50 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => step > 1 ? setStep((step - 1) as Step) : handleClose()}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            {step === 1 ? "Cancelar" : "Voltar"}
          </Button>

          {step < 5 ? (
            <Button
              onClick={() => setStep((step + 1) as Step)}
              disabled={!canProceed()}
            >
              Próximo
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!canProceed() || isSubmitting}
            >
              {isSubmitting ? "Criando..." : "Criar Compromisso"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
