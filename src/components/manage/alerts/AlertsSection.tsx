/**
 * AlertsSection - Sistema de Alertas para Gestores
 * Exibe alertas sobre padrões negativos e permite ações rápidas
 */

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { 
  AlertTriangle, 
  TrendingDown, 
  Clock, 
  Flame,
  Check,
  Calendar,
  MessageSquare,
  GraduationCap,
  RefreshCw,
  Target,
  Bell
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { ScheduleOneOnOneModal } from "./ScheduleOneOnOneModal";
import { AssignTrainingModal } from "./AssignTrainingModal";
import { CreateGoalModal } from "./CreateGoalModal";

interface AlertData {
  alert_type: string;
  severity: "low" | "medium" | "high" | "critical";
  suggested_action?: string;
  target_user_id?: string;
  user_name?: string;
  previous_streak?: number;
  days_inactive?: number;
  drop_percent?: number;
  skill_id?: string;
  [key: string]: unknown;
}

interface AlertNotification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  data: AlertData;
  is_read: boolean;
  created_at: string;
  read_at: string | null;
}

interface ActionModalState {
  type: "1on1" | "training" | "goal" | null;
  alert: AlertNotification | null;
}

const ALERT_ICONS: Record<string, typeof AlertTriangle> = {
  streak_broken: Flame,
  user_inactive: Clock,
  performance_drop: TrendingDown,
  goal_failed: Target,
  default: AlertTriangle
};

const SEVERITY_COLORS: Record<string, string> = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  high: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  critical: "bg-destructive/10 text-destructive border-destructive/20"
};

const ACTION_LABELS: Record<string, { label: string; icon: typeof Calendar }> = {
  schedule_1on1: { label: "Agendar 1:1", icon: Calendar },
  send_reminder: { label: "Enviar Lembrete", icon: MessageSquare },
  assign_training: { label: "Sugerir Treinamento", icon: GraduationCap },
  create_goal: { label: "Criar Meta", icon: Target }
};

export function AlertsSection() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<"all" | "unread">("unread");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [actionModal, setActionModal] = useState<ActionModalState>({ type: null, alert: null });

  // Buscar alertas do usuário atual
  const { data: alerts, isLoading, refetch } = useQuery({
    queryKey: ["manager-alerts", user?.id, filter],
    queryFn: async () => {
      if (!user?.id) return [];

      let query = supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .eq("type", "alert")
        .order("created_at", { ascending: false })
        .limit(50);

      if (filter === "unread") {
        query = query.eq("is_read", false);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as AlertNotification[];
    },
    enabled: !!user?.id
  });

  // Marcar alerta como lido
  const markAsRead = useMutation({
    mutationFn: async (alertId: string) => {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq("id", alertId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["manager-alerts"] });
    }
  });

  // Marcar todos como lidos
  const markAllAsRead = useMutation({
    mutationFn: async () => {
      if (!user?.id) return;
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq("user_id", user.id)
        .eq("type", "alert")
        .eq("is_read", false);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["manager-alerts"] });
      toast.success("Todos os alertas marcados como lidos");
    }
  });

  // Executar detecção de padrões
  const runPatternDetection = async () => {
    setIsRefreshing(true);
    try {
      const { data, error } = await supabase.functions.invoke("detect-patterns");
      if (error) throw error;
      
      toast.success(`Análise concluída: ${data.alertsGenerated || 0} padrões detectados`);
      refetch();
    } catch (err) {
      console.error("Error running pattern detection:", err);
      toast.error("Erro ao analisar padrões");
    } finally {
      setIsRefreshing(false);
    }
  };

  // Executar ação sugerida
  const executeAction = (alert: AlertNotification, action: string) => {
    switch (action) {
      case "schedule_1on1":
        setActionModal({ type: "1on1", alert });
        break;
      case "assign_training":
        setActionModal({ type: "training", alert });
        break;
      case "create_goal":
        setActionModal({ type: "goal", alert });
        break;
      case "send_reminder":
        sendReminder(alert);
        break;
      default:
        toast.info("Ação não implementada");
    }
  };

  // Enviar lembrete
  const sendReminder = async (alert: AlertNotification) => {
    const targetUserId = alert.data.target_user_id;
    if (!targetUserId) {
      toast.error("Usuário não encontrado");
      return;
    }

    try {
      await supabase.from("notifications").insert({
        user_id: targetUserId,
        type: "reminder",
        title: "Lembrete do seu gestor",
        message: "Seu gestor notou uma queda no seu engajamento. Que tal voltar às atividades?",
        data: { from_alert_id: alert.id },
        is_read: false,
      });

      toast.success("Lembrete enviado com sucesso!");
      markAsRead.mutate(alert.id);
    } catch (error) {
      console.error("Error sending reminder:", error);
      toast.error("Erro ao enviar lembrete");
    }
  };

  // Callback após ação bem-sucedida
  const handleActionSuccess = () => {
    if (actionModal.alert) {
      markAsRead.mutate(actionModal.alert.id);
    }
    setActionModal({ type: null, alert: null });
  };

  const unreadCount = alerts?.filter(a => !a.is_read).length || 0;

  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins}m atrás`;
    if (diffHours < 24) return `${diffHours}h atrás`;
    return `${diffDays}d atrás`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Bell className="h-6 w-6 text-primary" />
            Alertas & Ações
          </h1>
          <p className="text-muted-foreground">
            Padrões detectados que precisam da sua atenção
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={runPatternDetection}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
          
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markAllAsRead.mutate()}
            >
              <Check className="h-4 w-4 mr-2" />
              Marcar todos
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="border-yellow-500/20 bg-yellow-500/5">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/10">
                <Flame className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Streaks Quebrados</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {alerts?.filter(a => a.data.alert_type === "streak_broken").length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-500/20 bg-orange-500/5">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500/10">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Usuários Inativos</p>
                <p className="text-2xl font-bold text-orange-600">
                  {alerts?.filter(a => a.data.alert_type === "user_inactive").length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-500/20 bg-red-500/5">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/10">
                <TrendingDown className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Queda de Performance</p>
                <p className="text-2xl font-bold text-red-600">
                  {alerts?.filter(a => a.data.alert_type === "performance_drop").length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-500/20 bg-purple-500/5">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Target className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Metas Falhas</p>
                <p className="text-2xl font-bold text-purple-600">
                  {alerts?.filter(a => a.data.alert_type === "goal_failed").length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <Tabs value={filter} onValueChange={(v) => setFilter(v as "all" | "unread")}>
        <TabsList>
          <TabsTrigger value="unread" className="flex items-center gap-2">
            Não lidos
            {unreadCount > 0 && (
              <Badge variant="secondary" className="ml-1">
                {unreadCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="all">Todos</TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="mt-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : !alerts || alerts.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Check className="h-12 w-12 mx-auto text-green-500 mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  Tudo em dia!
                </h3>
                <p className="text-muted-foreground">
                  Não há alertas pendentes no momento.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {alerts.map((alert, index) => {
                  const Icon = ALERT_ICONS[alert.data.alert_type] || ALERT_ICONS.default;
                  const severityClass = SEVERITY_COLORS[alert.data.severity] || SEVERITY_COLORS.medium;
                  const suggestedAction = alert.data.suggested_action;
                  const actionConfig = suggestedAction ? ACTION_LABELS[suggestedAction] : null;

                  return (
                    <motion.div
                      key={alert.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className={`transition-colors ${!alert.is_read ? "border-primary/30 bg-primary/5" : ""}`}>
                        <CardContent className="py-4">
                          <div className="flex items-start gap-4">
                            {/* Icon */}
                            <div className={`p-2 rounded-lg ${severityClass}`}>
                              <Icon className="h-5 w-5" />
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <h4 className="font-medium text-foreground">
                                    {alert.title}
                                  </h4>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {alert.message}
                                  </p>
                                </div>
                                <span className="text-xs text-muted-foreground whitespace-nowrap">
                                  {formatTimeAgo(alert.created_at)}
                                </span>
                              </div>

                              {/* Actions */}
                              <div className="flex items-center gap-2 mt-3 flex-wrap">
                                {actionConfig && (
                                  <Button
                                    size="sm"
                                    variant="default"
                                    onClick={() => executeAction(alert, suggestedAction!)}
                                  >
                                    <actionConfig.icon className="h-4 w-4 mr-2" />
                                    {actionConfig.label}
                                  </Button>
                                )}

                                {/* Quick actions */}
                                {!suggestedAction && alert.data.target_user_id && (
                                  <>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => executeAction(alert, "schedule_1on1")}
                                    >
                                      <Calendar className="h-4 w-4 mr-2" />
                                      Agendar 1:1
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => executeAction(alert, "assign_training")}
                                    >
                                      <GraduationCap className="h-4 w-4 mr-2" />
                                      Treinamento
                                    </Button>
                                  </>
                                )}
                                
                                {!alert.is_read && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => markAsRead.mutate(alert.id)}
                                  >
                                    <Check className="h-4 w-4 mr-2" />
                                    Marcar como lido
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Action Modals */}
      {actionModal.type === "1on1" && actionModal.alert && (
        <ScheduleOneOnOneModal
          open={true}
          onClose={() => setActionModal({ type: null, alert: null })}
          targetUserId={actionModal.alert.data.target_user_id || ""}
          targetUserName={actionModal.alert.data.user_name || "Colaborador"}
          context={actionModal.alert.message}
          onSuccess={handleActionSuccess}
        />
      )}

      {actionModal.type === "training" && actionModal.alert && (
        <AssignTrainingModal
          open={true}
          onClose={() => setActionModal({ type: null, alert: null })}
          targetUserId={actionModal.alert.data.target_user_id || ""}
          targetUserName={actionModal.alert.data.user_name || "Colaborador"}
          context={actionModal.alert.message}
          suggestedSkillId={actionModal.alert.data.skill_id}
          onSuccess={handleActionSuccess}
        />
      )}

      {actionModal.type === "goal" && actionModal.alert && (
        <CreateGoalModal
          open={true}
          onClose={() => setActionModal({ type: null, alert: null })}
          targetUserId={actionModal.alert.data.target_user_id || ""}
          targetUserName={actionModal.alert.data.user_name || "Colaborador"}
          context={actionModal.alert.message}
          suggestedSkillId={actionModal.alert.data.skill_id}
          onSuccess={handleActionSuccess}
        />
      )}
    </div>
  );
}
