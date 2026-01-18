/**
 * ChallengeDetailModal - Modal de detalhes do desafio
 * Mostra progresso, participantes, apoiadores, contexto e comprovação
 */

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Target,
  Users,
  Heart,
  Calendar,
  TrendingUp,
  Sparkles,
  Clock,
  ChevronRight,
  User,
  History,
  X,
  FileText,
  Gem,
  Info,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { format, formatDistanceToNow, isPast } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Challenge, ChallengeParticipant, ChallengeSupporter, ChallengeProof } from "@/hooks/useChallenges";
import {
  CHALLENGE_TYPE_CONFIG,
  CHALLENGE_ORIGIN_CONFIG,
  PROOF_TYPE_CONFIG,
  getDeadlineClasses,
  getDeadlinePriority,
  type ChallengeType,
  type ChallengeOrigin,
  type ProofType,
} from "@/constants/challengeTypes";
import { ChallengeProofSubmit } from "./ChallengeProofSubmit";

interface ChallengeDetailModalProps {
  challenge: Challenge | null;
  isOpen: boolean;
  onClose: () => void;
  onJoin?: () => void;
  onLeave?: () => void;
  onSupport?: () => void;
  onInputProgress?: () => void;
  onSubmitProof?: (data: { proofType: string; content?: string; fileUrl?: string }) => Promise<void>;
  canManage?: boolean;
  getParticipants?: (id: string) => Promise<ChallengeParticipant[]>;
  getSupporters?: (id: string) => Promise<ChallengeSupporter[]>;
  getProofs?: (id: string) => Promise<ChallengeProof[]>;
}

const SCOPE_LABELS: Record<string, { label: string; color: string }> = {
  personal: { label: "Pessoal", color: "bg-blue-500/20 text-blue-400" },
  team: { label: "Equipe", color: "bg-purple-500/20 text-purple-400" },
  global: { label: "Global", color: "bg-amber-500/20 text-amber-400" },
};

export function ChallengeDetailModal({
  challenge,
  isOpen,
  onClose,
  onJoin,
  onLeave,
  onSupport,
  onInputProgress,
  onSubmitProof,
  canManage = false,
  getParticipants,
  getSupporters,
  getProofs,
}: ChallengeDetailModalProps) {
  const [participants, setParticipants] = useState<ChallengeParticipant[]>([]);
  const [supporters, setSupporters] = useState<ChallengeSupporter[]>([]);
  const [proofs, setProofs] = useState<ChallengeProof[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [showProofForm, setShowProofForm] = useState(false);
  const [isSubmittingProof, setIsSubmittingProof] = useState(false);

  useEffect(() => {
    if (challenge && isOpen) {
      setIsLoadingData(true);
      Promise.all([
        getParticipants?.(challenge.id) || Promise.resolve([]),
        getSupporters?.(challenge.id) || Promise.resolve([]),
        getProofs?.(challenge.id) || Promise.resolve([]),
      ]).then(([p, s, pr]) => {
        setParticipants(p);
        setSupporters(s);
        setProofs(pr);
        setIsLoadingData(false);
      });
    }
  }, [challenge?.id, isOpen, getParticipants, getSupporters, getProofs]);

  if (!challenge) return null;

  const progress = challenge.target_value > 0
    ? Math.round((challenge.current_value / challenge.target_value) * 100)
    : 0;
  
  const isComplete = challenge.status === "completed";
  const isActive = challenge.status === "active";
  const hasMultiplier = challenge.supporter_multiplier > 1;
  const scopeStyle = SCOPE_LABELS[challenge.scope] || SCOPE_LABELS.personal;
  const isOverdue = challenge.is_overdue || (isActive && isPast(new Date(challenge.ends_at)));

  const typeConfig = CHALLENGE_TYPE_CONFIG[challenge.challenge_type as ChallengeType] || CHALLENGE_TYPE_CONFIG.practical;
  const originConfig = CHALLENGE_ORIGIN_CONFIG[challenge.origin_source as ChallengeOrigin];
  const proofConfig = PROOF_TYPE_CONFIG[challenge.proof_type as ProofType] || PROOF_TYPE_CONFIG.checkin;
  const deadlinePriority = getDeadlinePriority(challenge.ends_at);
  const deadlineClasses = getDeadlineClasses(deadlinePriority);

  const daysRemaining = Math.max(
    0,
    Math.ceil((new Date(challenge.ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  );

  const handleProofSubmit = async (data: { proofType: string; content?: string; fileUrl?: string }) => {
    if (!onSubmitProof) return;
    setIsSubmittingProof(true);
    try {
      await onSubmitProof(data);
      setShowProofForm(false);
      // Refresh proofs
      if (getProofs) {
        const newProofs = await getProofs(challenge.id);
        setProofs(newProofs);
      }
    } finally {
      setIsSubmittingProof(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader className="shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <span className="text-xl">{typeConfig.emoji}</span>
            Detalhes do Desafio
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1">
          <div className="space-y-6 pr-4">
            {/* Header */}
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{challenge.name}</h3>
                  <p className="text-sm text-muted-foreground">{challenge.description}</p>
                </div>
                <div className="flex flex-col gap-1 items-end">
                  <Badge variant="outline" className={scopeStyle.color}>
                    {scopeStyle.label}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {typeConfig.label}
                  </Badge>
                </div>
              </div>

              {/* Origin badge */}
              {originConfig && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <FileText className="w-3 h-3" />
                  <span>Origem: {originConfig.label}</span>
                </div>
              )}

              {/* Stats row */}
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span>{challenge.participants_count || 0} participantes</span>
                </div>
                <div className="flex items-center gap-1.5 text-amber-400">
                  <Heart className="w-4 h-4" />
                  <span>{challenge.supporters_count} apoiadores</span>
                </div>
                {hasMultiplier && (
                  <div className="flex items-center gap-1.5 text-green-400">
                    <Sparkles className="w-4 h-4" />
                    <span>{challenge.supporter_multiplier.toFixed(1)}x</span>
                  </div>
                )}
              </div>
            </div>

            {/* Context section */}
            {challenge.context_why && (
              <div className="p-4 rounded-xl border bg-primary/5 border-primary/20">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-primary mb-1">Por que este desafio?</p>
                    <p className="text-sm text-muted-foreground">{challenge.context_why}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Progress section */}
            <div className="p-4 rounded-xl border bg-muted/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Progresso</span>
                <span className="text-sm text-muted-foreground">
                  {challenge.current_value} / {challenge.target_value}
                </span>
              </div>
              <Progress value={progress} className="h-3 mb-2" />
              
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{challenge.success_criteria}</span>
                <span className={cn(
                  "font-medium",
                  progress >= 100 ? "text-green-400" : ""
                )}>
                  {progress}%
                </span>
              </div>
            </div>

            {/* Time and rewards */}
            <div className="grid grid-cols-2 gap-4">
              <div className={cn(
                "p-3 rounded-lg border",
                isOverdue ? "bg-destructive/10 border-destructive/30" : "bg-muted/10"
              )}>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  {isOverdue ? (
                    <AlertTriangle className="w-4 h-4 text-destructive" />
                  ) : (
                    <Clock className="w-4 h-4" />
                  )}
                  <span>Prazo</span>
                </div>
                <p className={cn(
                  "font-medium",
                  isOverdue && "text-destructive"
                )}>
                  {isComplete ? "Completado!" : 
                   isOverdue ? "Atrasado!" :
                   isActive ? `${daysRemaining} dias restantes` : "Encerrado"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(challenge.ends_at), "dd/MM/yyyy", { locale: ptBR })}
                </p>
              </div>

              <div className="p-3 rounded-lg border bg-muted/10">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <TrendingUp className="w-4 h-4" />
                  <span>Recompensa</span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium text-primary">
                    +{Math.floor(challenge.xp_reward * challenge.supporter_multiplier)} XP
                  </span>
                  <span className="font-medium text-amber-400">
                    +{Math.floor(challenge.coins_reward * challenge.supporter_multiplier)} 🪙
                  </span>
                  {(challenge.diamonds_reward || 0) > 0 && (
                    <span className="font-medium text-cyan-400 flex items-center gap-1">
                      <Gem className="w-3 h-3" />
                      +{challenge.diamonds_reward}
                    </span>
                  )}
                </div>
                {hasMultiplier && (
                  <p className="text-xs text-green-400">
                    Multiplicador: {challenge.supporter_multiplier.toFixed(1)}x
                  </p>
                )}
              </div>
            </div>

            {/* Proof requirement */}
            <div className="p-4 rounded-lg border bg-muted/10">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{proofConfig.icon}</span>
                  <span className="text-sm font-medium">Comprovação</span>
                </div>
                {challenge.is_participating && isActive && !showProofForm && onSubmitProof && (
                  <Button size="sm" variant="outline" onClick={() => setShowProofForm(true)}>
                    Enviar Evidência
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground">{proofConfig.description}</p>
              
              {showProofForm && (
                <div className="mt-4">
                  <ChallengeProofSubmit
                    proofType={challenge.proof_type as ProofType}
                    onSubmit={handleProofSubmit}
                    onCancel={() => setShowProofForm(false)}
                    isLoading={isSubmittingProof}
                  />
                </div>
              )}

              {/* Existing proofs */}
              {proofs.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">Evidências enviadas:</p>
                  {proofs.map((proof) => (
                    <div key={proof.id} className="p-2 rounded bg-muted/30 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">
                          {format(new Date(proof.submitted_at), "dd/MM HH:mm", { locale: ptBR })}
                        </span>
                        {proof.approved_at ? (
                          <Badge className="bg-green-500/20 text-green-400 text-xs">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Aprovado
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs">Pendente</Badge>
                        )}
                      </div>
                      {proof.content && (
                        <p className="mt-1 text-foreground">{proof.content}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pool info */}
            {challenge.total_staked > 0 && (
              <div className="p-4 rounded-lg bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Pool de Apoio</span>
                  <span className="text-lg font-bold text-amber-400">
                    {challenge.total_staked} 🪙
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Distribuído entre apoiadores se o desafio for completado
                </p>
              </div>
            )}

            {/* Tabs: Participants & Supporters */}
            <Tabs defaultValue="participants">
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="participants" className="text-xs">
                  <Users className="w-3 h-3 mr-1" />
                  Participantes ({participants.length})
                </TabsTrigger>
                <TabsTrigger value="supporters" className="text-xs">
                  <Heart className="w-3 h-3 mr-1" />
                  Apoiadores ({supporters.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="participants" className="mt-4">
                {participants.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground text-sm">
                    Nenhum participante ainda
                  </div>
                ) : (
                  <div className="space-y-2">
                    {participants.map((p) => (
                      <div key={p.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={p.profile?.avatar_url || undefined} />
                          <AvatarFallback>
                            {p.profile?.nickname?.[0]?.toUpperCase() || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{p.profile?.nickname || "Usuário"}</p>
                          <p className="text-xs text-muted-foreground">
                            Entrou {formatDistanceToNow(new Date(p.joined_at), { 
                              addSuffix: true, 
                              locale: ptBR 
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="supporters" className="mt-4">
                {supporters.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground text-sm">
                    Nenhum apoiador ainda. Seja o primeiro!
                  </div>
                ) : (
                  <div className="space-y-2">
                    {supporters.map((s) => (
                      <div key={s.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={s.profile?.avatar_url || undefined} />
                          <AvatarFallback>
                            {s.profile?.nickname?.[0]?.toUpperCase() || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{s.profile?.nickname || "Usuário"}</p>
                        </div>
                        <Badge variant="outline" className="text-amber-400 border-amber-500/30">
                          {s.coins_staked} 🪙
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </ScrollArea>

        {/* Actions */}
        {isActive && (
          <div className="flex gap-2 pt-4 border-t shrink-0">
            {!challenge.is_participating ? (
              <Button onClick={onJoin} className="flex-1">
                <Users className="w-4 h-4 mr-2" />
                Participar
              </Button>
            ) : (
              <>
                {canManage && challenge.source === "external" && (
                  <Button onClick={onInputProgress} variant="outline" className="flex-1">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Atualizar
                  </Button>
                )}
                <Button onClick={onLeave} variant="ghost" className="flex-1">
                  Sair
                </Button>
              </>
            )}
            {!challenge.is_supporting && (
              <Button onClick={onSupport} variant="secondary">
                <Heart className="w-4 h-4 mr-2" />
                Apoiar
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
