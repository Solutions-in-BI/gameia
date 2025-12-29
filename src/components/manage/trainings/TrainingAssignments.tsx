/**
 * TrainingAssignments - Atribuição de treinamentos para membros da equipe
 * Painel do gestor para acompanhar e atribuir treinamentos
 */

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  GraduationCap,
  Users,
  Search,
  Filter,
  Clock,
  Target,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Calendar,
  BarChart3,
  ChevronRight,
  UserPlus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTrainings } from "@/hooks/useTrainings";
import { useOrgTrainingConfig } from "@/hooks/useOrgTrainingConfig";
import { useOrganization } from "@/hooks/useOrganization";
import { useOrgMetrics } from "@/hooks/useOrgMetrics";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { format, addDays, isPast, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";

interface MemberTrainingProgress {
  userId: string;
  nickname: string;
  avatarUrl: string | null;
  trainingId: string;
  trainingName: string;
  progress: number;
  assignedAt: string | null;
  deadlineAt: string | null;
  completedAt: string | null;
  status: "not_started" | "in_progress" | "completed" | "overdue";
}

export function TrainingAssignments() {
  const { currentOrg } = useOrganization();
  const { trainings, userProgress, isLoading: trainingsLoading } = useTrainings(currentOrg?.id);
  const { configs, getTrainingConfig } = useOrgTrainingConfig(currentOrg?.id);
  const { membersWithMetrics, isLoading: membersLoading } = useOrgMetrics(currentOrg?.id || "");

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedTraining, setSelectedTraining] = useState<string>("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [deadlineDays, setDeadlineDays] = useState<number>(30);

  const isLoading = trainingsLoading || membersLoading;

  // Build member training progress data
  const memberProgress = useMemo(() => {
    const result: MemberTrainingProgress[] = [];

    membersWithMetrics.forEach((member) => {
      trainings.forEach((training) => {
        const config = getTrainingConfig(training.id);
        if (!config?.is_enabled) return;

        const progress = userProgress.find(
          (p) => p.user_id === member.user_id && p.training_id === training.id
        );

        let status: MemberTrainingProgress["status"] = "not_started";
        if (progress?.completed_at) {
          status = "completed";
        } else if (progress && progress.progress_percent > 0) {
          // Check if overdue
          const deadline = (progress as any).deadline_at;
          if (deadline && isPast(new Date(deadline))) {
            status = "overdue";
          } else {
            status = "in_progress";
          }
        }

        result.push({
          userId: member.user_id,
          nickname: member.nickname || "Usuário",
          avatarUrl: member.avatar_url,
          trainingId: training.id,
          trainingName: training.name,
          progress: progress?.progress_percent || 0,
          assignedAt: (progress as any)?.assigned_at || null,
          deadlineAt: (progress as any)?.deadline_at || null,
          completedAt: progress?.completed_at || null,
          status,
        });
      });
    });

    return result;
  }, [membersWithMetrics, trainings, userProgress, getTrainingConfig]);

  // Filter progress
  const filteredProgress = useMemo(() => {
    return memberProgress.filter((p) => {
      const matchesSearch = p.nickname.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.trainingName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || p.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [memberProgress, searchQuery, statusFilter]);

  // Group by status for summary
  const statusSummary = useMemo(() => {
    return {
      completed: memberProgress.filter((p) => p.status === "completed").length,
      in_progress: memberProgress.filter((p) => p.status === "in_progress").length,
      not_started: memberProgress.filter((p) => p.status === "not_started").length,
      overdue: memberProgress.filter((p) => p.status === "overdue").length,
    };
  }, [memberProgress]);

  const handleAssignTraining = async () => {
    if (!selectedTraining || selectedMembers.length === 0) {
      toast.error("Selecione um treinamento e pelo menos um membro");
      return;
    }

    try {
      const deadline = addDays(new Date(), deadlineDays);

      for (const userId of selectedMembers) {
        await supabase.from("user_training_progress").upsert({
          user_id: userId,
          training_id: selectedTraining,
          assigned_at: new Date().toISOString(),
          deadline_at: deadline.toISOString(),
          progress_percent: 0,
        } as any);
      }

      toast.success(`Treinamento atribuído a ${selectedMembers.length} membro(s)`);
      setIsAssignModalOpen(false);
      setSelectedTraining("");
      setSelectedMembers([]);
    } catch (error) {
      toast.error("Erro ao atribuir treinamento");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-primary" />
            Treinamentos da Equipe
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Acompanhe e atribua treinamentos aos membros
          </p>
        </div>
        <Button onClick={() => setIsAssignModalOpen(true)} className="gap-2">
          <UserPlus className="w-4 h-4" />
          Atribuir Treinamento
        </Button>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border bg-card">
          <div className="flex items-center gap-2 text-emerald-500 mb-1">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-sm font-medium">Concluídos</span>
          </div>
          <p className="text-2xl font-bold">{statusSummary.completed}</p>
        </div>
        <div className="p-4 rounded-xl border bg-card">
          <div className="flex items-center gap-2 text-blue-500 mb-1">
            <BarChart3 className="w-4 h-4" />
            <span className="text-sm font-medium">Em Progresso</span>
          </div>
          <p className="text-2xl font-bold">{statusSummary.in_progress}</p>
        </div>
        <div className="p-4 rounded-xl border bg-card">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-medium">Não Iniciados</span>
          </div>
          <p className="text-2xl font-bold">{statusSummary.not_started}</p>
        </div>
        <div className="p-4 rounded-xl border bg-card">
          <div className="flex items-center gap-2 text-red-500 mb-1">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm font-medium">Atrasados</span>
          </div>
          <p className="text-2xl font-bold">{statusSummary.overdue}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por membro ou treinamento..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="completed">Concluídos</SelectItem>
            <SelectItem value="in_progress">Em Progresso</SelectItem>
            <SelectItem value="not_started">Não Iniciados</SelectItem>
            <SelectItem value="overdue">Atrasados</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Progress List */}
      <div className="space-y-2">
        {filteredProgress.map((item, index) => (
          <motion.div
            key={`${item.userId}-${item.trainingId}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.02 }}
            className={cn(
              "flex items-center gap-4 p-4 rounded-xl border bg-card",
              item.status === "overdue" && "border-red-500/30 bg-red-500/5"
            )}
          >
            {/* Avatar */}
            <Avatar className="h-10 w-10">
              <AvatarImage src={item.avatarUrl || undefined} />
              <AvatarFallback>{item.nickname.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium truncate">{item.nickname}</span>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground truncate">
                  {item.trainingName}
                </span>
              </div>
              <div className="flex items-center gap-3 mt-1">
                <Progress value={item.progress} className="flex-1 h-2" />
                <span className="text-xs font-mono text-muted-foreground w-12">
                  {item.progress}%
                </span>
              </div>
            </div>

            {/* Deadline */}
            {item.deadlineAt && (
              <div className="hidden md:flex flex-col items-end text-xs">
                <span className="text-muted-foreground">Prazo</span>
                <span className={cn(
                  "font-medium",
                  isPast(new Date(item.deadlineAt)) && !item.completedAt && "text-red-500"
                )}>
                  {format(new Date(item.deadlineAt), "dd/MM/yy", { locale: ptBR })}
                </span>
              </div>
            )}

            {/* Status Badge */}
            <Badge
              variant={
                item.status === "completed"
                  ? "default"
                  : item.status === "overdue"
                  ? "destructive"
                  : "secondary"
              }
              className="text-xs"
            >
              {item.status === "completed" && "Concluído"}
              {item.status === "in_progress" && "Em Progresso"}
              {item.status === "not_started" && "Não Iniciado"}
              {item.status === "overdue" && "Atrasado"}
            </Badge>
          </motion.div>
        ))}
      </div>

      {filteredProgress.length === 0 && (
        <div className="text-center py-16 px-4 rounded-2xl border border-border bg-card/50">
          <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Nenhum resultado encontrado
          </h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Tente ajustar os filtros ou atribua treinamentos aos membros.
          </p>
        </div>
      )}

      {/* Assign Training Modal */}
      <Dialog open={isAssignModalOpen} onOpenChange={setIsAssignModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-primary" />
              Atribuir Treinamento
            </DialogTitle>
            <DialogDescription>
              Selecione um treinamento e os membros que devem completá-lo.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Training Select */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Treinamento</label>
              <Select value={selectedTraining} onValueChange={setSelectedTraining}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um treinamento" />
                </SelectTrigger>
                <SelectContent>
                  {trainings.filter((t) => t.is_active).map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      <div className="flex items-center gap-2">
                        <span>{t.icon}</span>
                        <span>{t.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Deadline */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Prazo (dias)</label>
              <Input
                type="number"
                value={deadlineDays}
                onChange={(e) => setDeadlineDays(parseInt(e.target.value) || 30)}
                min={1}
                max={365}
              />
              <p className="text-xs text-muted-foreground">
                Data limite: {format(addDays(new Date(), deadlineDays), "dd/MM/yyyy", { locale: ptBR })}
              </p>
            </div>

            {/* Members Select */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Membros</label>
              <div className="border rounded-lg max-h-48 overflow-y-auto divide-y">
                {membersWithMetrics.map((member) => (
                  <label
                    key={member.user_id}
                    className="flex items-center gap-3 p-3 hover:bg-muted/50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedMembers.includes(member.user_id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedMembers((prev) => [...prev, member.user_id]);
                        } else {
                          setSelectedMembers((prev) => prev.filter((id) => id !== member.user_id));
                        }
                      }}
                      className="rounded"
                    />
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={member.avatar_url || undefined} />
                      <AvatarFallback>
                        {(member.nickname || "U").slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{member.nickname || "Usuário"}</span>
                  </label>
                ))}
              </div>
              {selectedMembers.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  {selectedMembers.length} membro(s) selecionado(s)
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAssignTraining}>
              Atribuir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
