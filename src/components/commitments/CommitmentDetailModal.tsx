/**
 * CommitmentDetailModal - Modal de detalhes do compromisso
 * Mostra progresso, participantes, histórico e ações
 */

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  X, 
  Users, 
  Globe, 
  Zap, 
  FileEdit,
  Coins,
  Star,
  Clock,
  Calendar,
  TrendingUp,
  History,
  UserPlus,
  LogOut,
  Edit3,
  AlertCircle
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { 
  Commitment, 
  CommitmentParticipant, 
  CommitmentProgressLog,
  useCommitments 
} from "@/hooks/useCommitments";
import { format, differenceInDays, isPast } from "date-fns";
import { ptBR } from "date-fns/locale";

interface CommitmentDetailModalProps {
  commitment: Commitment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orgId: string;
  onInputProgress?: () => void;
  userId?: string;
  canManage?: boolean;
}

export function CommitmentDetailModal({
  commitment,
  open,
  onOpenChange,
  orgId,
  onInputProgress,
  userId,
  canManage = false,
}: CommitmentDetailModalProps) {
  const { joinCommitment, leaveCommitment, getParticipants, getProgressLogs } = useCommitments(orgId);
  const [participants, setParticipants] = useState<CommitmentParticipant[]>([]);
  const [progressLogs, setProgressLogs] = useState<CommitmentProgressLog[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  useEffect(() => {
    if (commitment && open) {
      loadData();
    }
  }, [commitment?.id, open]);

  const loadData = async () => {
    if (!commitment) return;
    setIsLoadingData(true);
    try {
      const [parts, logs] = await Promise.all([
        getParticipants(commitment.id),
        getProgressLogs(commitment.id),
      ]);
      setParticipants(parts);
      setProgressLogs(logs);
    } finally {
      setIsLoadingData(false);
    }
  };

  if (!commitment) return null;

  const progress = commitment.target_value > 0 
    ? Math.min((commitment.current_value / commitment.target_value) * 100, 100) 
    : 0;

  const isEnded = isPast(new Date(commitment.ends_at));
  const daysRemaining = differenceInDays(new Date(commitment.ends_at), new Date());
  const isParticipating = commitment.is_participating;
  const isActive = commitment.status === "active";

  const handleJoin = async () => {
    setIsJoining(true);
    await joinCommitment(commitment.id);
    await loadData();
    setIsJoining(false);
  };

  const handleLeave = async () => {
    setIsJoining(true);
    await leaveCommitment(commitment.id);
    await loadData();
    setIsJoining(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-0 gap-0 overflow-hidden max-h-[90vh]">
        <DialogHeader className="p-6 pb-4 border-b border-border/50">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge 
                  variant="outline" 
                  className={cn(
                    "text-xs",
                    commitment.scope === "global" 
                      ? "border-primary/30 text-primary bg-primary/5" 
                      : "border-secondary text-secondary-foreground bg-secondary/30"
                  )}
                >
                  {commitment.scope === "global" ? (
                    <>
                      <Globe className="w-3 h-3 mr-1" />
                      Global
                    </>
                  ) : (
                    <>
                      <Users className="w-3 h-3 mr-1" />
                      {commitment.team?.name || "Equipe"}
                    </>
                  )}
                </Badge>

                <Badge variant="outline" className="text-xs border-muted text-muted-foreground">
                  {commitment.source === "internal" ? (
                    <>
                      <Zap className="w-3 h-3 mr-1" />
                      Automático
                    </>
                  ) : (
                    <>
                      <FileEdit className="w-3 h-3 mr-1" />
                      Manual
                    </>
                  )}
                </Badge>

                {commitment.status !== "active" && (
                  <Badge 
                    variant={commitment.status === "completed" ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {commitment.status === "completed" ? "Concluído" : 
                     commitment.status === "failed" ? "Não atingido" : 
                     commitment.status === "cancelled" ? "Cancelado" : "Rascunho"}
                  </Badge>
                )}
              </div>
              
              <DialogTitle className="text-xl">{commitment.name}</DialogTitle>
            </div>
            
            <button 
              onClick={() => onOpenChange(false)} 
              className="p-1 rounded-lg hover:bg-muted"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Progress Section */}
          <div className="p-6 border-b border-border/50">
            <p className="text-sm text-muted-foreground mb-4">
              {commitment.description}
            </p>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progresso</span>
                <span className="font-medium text-foreground">
                  {Math.round(progress)}% ({commitment.current_value.toLocaleString()} / {commitment.target_value.toLocaleString()})
                </span>
              </div>
              <Progress value={progress} className="h-3" />
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="w-3 h-3 inline mr-1" />
                {commitment.success_criteria}
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="text-center p-3 rounded-lg bg-muted/30">
                <Calendar className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
                <p className="text-xs text-muted-foreground">Período</p>
                <p className="text-sm font-medium text-foreground">
                  {format(new Date(commitment.starts_at), "dd/MM", { locale: ptBR })} - {format(new Date(commitment.ends_at), "dd/MM", { locale: ptBR })}
                </p>
              </div>

              <div className="text-center p-3 rounded-lg bg-muted/30">
                <Clock className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
                <p className="text-xs text-muted-foreground">Tempo</p>
                <p className={cn(
                  "text-sm font-medium",
                  isEnded ? "text-muted-foreground" : 
                  daysRemaining <= 3 ? "text-destructive" : "text-foreground"
                )}>
                  {isEnded ? "Encerrado" : `${daysRemaining} dias`}
                </p>
              </div>

              <div className="text-center p-3 rounded-lg bg-muted/30">
                <Users className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
                <p className="text-xs text-muted-foreground">Participantes</p>
                <p className="text-sm font-medium text-foreground">
                  {participants.length}
                </p>
              </div>
            </div>

            {/* Rewards */}
            <div className="flex items-center justify-center gap-6 mt-6 p-4 rounded-xl bg-gradient-to-r from-primary/5 to-gameia-coins/5 border border-border/30">
              <span className="text-sm text-muted-foreground">Recompensa:</span>
              {(commitment.reward_type === "coins" || commitment.reward_type === "both") && commitment.coins_reward > 0 && (
                <div className="flex items-center gap-1">
                  <Coins className="w-5 h-5 text-gameia-coins" />
                  <span className="font-bold text-foreground">{commitment.coins_reward}</span>
                </div>
              )}
              {(commitment.reward_type === "xp" || commitment.reward_type === "both") && commitment.xp_reward > 0 && (
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 text-primary" />
                  <span className="font-bold text-foreground">{commitment.xp_reward} XP</span>
                </div>
              )}
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="participants" className="p-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="participants">
                <Users className="w-4 h-4 mr-2" />
                Participantes ({participants.length})
              </TabsTrigger>
              <TabsTrigger value="history">
                <History className="w-4 h-4 mr-2" />
                Histórico
              </TabsTrigger>
            </TabsList>

            <TabsContent value="participants" className="mt-4">
              {isLoadingData ? (
                <div className="space-y-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-12 bg-muted/30 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : participants.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>Nenhum participante ainda</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {participants.map(p => (
                    <div 
                      key={p.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-muted/30"
                    >
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={p.profile?.avatar_url || undefined} />
                        <AvatarFallback>
                          {p.profile?.nickname?.charAt(0).toUpperCase() || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">
                          {p.profile?.nickname || "Usuário"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Entrou em {format(new Date(p.joined_at), "dd/MM/yyyy")}
                        </p>
                      </div>
                      {p.contributed && (
                        <Badge variant="secondary" className="text-xs">
                          Contribuiu
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="history" className="mt-4">
              {isLoadingData ? (
                <div className="space-y-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-16 bg-muted/30 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : progressLogs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>Nenhuma atualização registrada</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[200px] overflow-y-auto">
                  {progressLogs.map(log => (
                    <div 
                      key={log.id}
                      className="p-3 rounded-lg border border-border/30 bg-card"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-foreground">
                          {log.previous_value !== null ? (
                            <>
                              {log.previous_value} → {log.new_value}
                              <span className={cn(
                                "ml-2 text-xs",
                                (log.change_amount || 0) >= 0 ? "text-gameia-success" : "text-destructive"
                              )}>
                                ({(log.change_amount || 0) >= 0 ? "+" : ""}{log.change_amount})
                              </span>
                            </>
                          ) : (
                            `Valor: ${log.new_value}`
                          )}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(log.created_at), "dd/MM HH:mm")}
                        </span>
                      </div>
                      {log.note && (
                        <p className="text-xs text-muted-foreground">{log.note}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        Por {log.logger?.nickname || "Sistema"} • {log.source === "automatic" ? "Automático" : "Manual"}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer Actions */}
        <div className="p-6 pt-4 border-t border-border/50 flex items-center justify-between">
          <div>
            {isParticipating && (
              <Badge variant="secondary" className="text-xs">
                Você está participando
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            {canManage && commitment.source === "external" && isActive && (
              <Button variant="outline" onClick={onInputProgress}>
                <Edit3 className="w-4 h-4 mr-2" />
                Atualizar Progresso
              </Button>
            )}

            {isActive && (
              isParticipating ? (
                <Button 
                  variant="outline" 
                  onClick={handleLeave}
                  disabled={isJoining}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  {isJoining ? "Saindo..." : "Sair"}
                </Button>
              ) : (
                <Button 
                  onClick={handleJoin}
                  disabled={isJoining}
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  {isJoining ? "Entrando..." : "Participar"}
                </Button>
              )
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
