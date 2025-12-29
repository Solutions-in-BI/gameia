/**
 * TeamAssessmentsPanel - Painel de avaliações contextuais da equipe
 * Permite gestores visualizarem loops e sugestões dos membros da equipe
 */

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  Brain,
  Calendar,
  ChevronDown,
  ChevronUp,
  GitBranch,
  Lightbulb,
  RefreshCw,
  Sparkles,
  Target,
  TrendingDown,
  Users,
  Zap,
  Clock,
  CheckCircle2,
  X,
  Eye,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useOrganization } from "@/hooks/useOrganization";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface TeamMember {
  id: string;
  nickname: string | null;
  avatar_url: string | null;
}

interface TeamLoopData {
  id: string;
  origin_type: string;
  origin_id: string | null;
  loop_status: string;
  created_at: string;
  closed_at: string | null;
  closure_reason: string | null;
  context_skill_ids: string[] | null;
  assessment_cycles: {
    id: string;
    name: string;
    status: string;
    evaluated_skills: string[] | null;
  } | null;
  profiles?: TeamMember;
}

interface TeamSuggestion {
  id: string;
  user_id: string;
  suggestion_type: string;
  reason: string | null;
  skills_to_evaluate: string[] | null;
  priority: number | null;
  status: string;
  created_at: string | null;
  profiles?: TeamMember;
}

// Configuração visual por tipo de origem
const ORIGIN_CONFIG: Record<string, { label: string; icon: typeof Brain; color: string }> = {
  game: { label: "Jogo", icon: Zap, color: "text-yellow-600" },
  arena_game: { label: "Arena", icon: Zap, color: "text-yellow-600" },
  cognitive_test: { label: "Teste Cognitivo", icon: Brain, color: "text-purple-600" },
  feedback_360: { label: "Feedback 360°", icon: Users, color: "text-blue-600" },
  pdi_goal: { label: "Meta PDI", icon: Target, color: "text-green-600" },
  goal: { label: "Meta", icon: Target, color: "text-green-600" },
  one_on_one: { label: "1:1", icon: Calendar, color: "text-orange-600" },
  streak_break: { label: "Quebra Streak", icon: TrendingDown, color: "text-red-600" },
  low_score: { label: "Score Baixo", icon: TrendingDown, color: "text-amber-600" },
  training: { label: "Treinamento", icon: Brain, color: "text-pink-600" },
  challenge: { label: "Desafio", icon: Target, color: "text-cyan-600" },
  manual: { label: "Manual", icon: GitBranch, color: "text-gray-600" },
};

const SUGGESTION_CONFIG: Record<string, { label: string; icon: typeof Brain; color: string }> = {
  low_score_assessment: { label: "Score Baixo", icon: TrendingDown, color: "text-amber-600" },
  streak_recovery: { label: "Recuperar Streak", icon: TrendingDown, color: "text-red-600" },
  goal_failed: { label: "Meta Falha", icon: Target, color: "text-orange-600" },
  peer_feedback: { label: "Feedback Pares", icon: Users, color: "text-blue-600" },
  scheduled: { label: "Agendada", icon: Calendar, color: "text-purple-600" },
  manager_request: { label: "Gestor", icon: Users, color: "text-indigo-600" },
  self_assessment: { label: "Autoavaliação", icon: Lightbulb, color: "text-green-600" },
  auto: { label: "Automática", icon: Sparkles, color: "text-cyan-600" },
  manual: { label: "Manual", icon: Lightbulb, color: "text-gray-600" },
};

export function TeamAssessmentsPanel() {
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState<"loops" | "suggestions">("loops");
  const { currentOrg } = useOrganization();
  const queryClient = useQueryClient();
  const orgId = currentOrg?.id;

  // Buscar loops abertos da organização
  const { data: teamLoops = [], isLoading: loopsLoading, refetch: refetchLoops } = useQuery({
    queryKey: ["team-assessment-loops", orgId],
    queryFn: async () => {
      if (!orgId) return [];

      const { data, error } = await supabase
        .from("assessment_context_links")
        .select(`
          *,
          assessment_cycles!inner(
            id,
            name,
            status,
            organization_id,
            evaluated_skills
          )
        `)
        .eq("loop_status", "open")
        .eq("assessment_cycles.organization_id", orgId)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      return (data || []) as TeamLoopData[];
    },
    enabled: !!orgId,
  });

  // Buscar sugestões pendentes da organização
  const { data: teamSuggestions = [], isLoading: suggestionsLoading, refetch: refetchSuggestions } = useQuery({
    queryKey: ["team-assessment-suggestions", orgId],
    queryFn: async () => {
      if (!orgId) return [];

      // Buscar sugestões
      const { data: suggestions, error } = await supabase
        .from("assessment_suggestions")
        .select("*")
        .eq("organization_id", orgId)
        .eq("status", "pending")
        .order("priority", { ascending: true })
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      if (!suggestions || suggestions.length === 0) return [];

      // Buscar perfis dos usuários
      const userIds = [...new Set(suggestions.map(s => s.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, nickname, avatar_url")
        .in("id", userIds);

      const profilesMap = new Map((profiles || []).map(p => [p.id, p]));

      return suggestions.map(s => ({
        ...s,
        profiles: profilesMap.get(s.user_id) || null,
      })) as TeamSuggestion[];
    },
    enabled: !!orgId,
  });

  // Fechar loop manualmente
  const closeLoopMutation = useMutation({
    mutationFn: async (contextLinkId: string) => {
      const { error } = await supabase
        .from("assessment_context_links")
        .update({
          loop_status: "closed",
          closed_at: new Date().toISOString(),
          closure_reason: "manager_closed",
        })
        .eq("id", contextLinkId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-assessment-loops"] });
      toast.success("Loop fechado com sucesso");
    },
    onError: () => {
      toast.error("Erro ao fechar loop");
    },
  });

  const handleRefresh = async () => {
    await Promise.all([refetchLoops(), refetchSuggestions()]);
    toast.success("Dados atualizados");
  };

  const isLoading = loopsLoading || suggestionsLoading;
  const totalLoops = teamLoops.length;
  const totalSuggestions = teamSuggestions.length;

  // Se não há nada para mostrar, não renderiza
  if (!isLoading && totalLoops === 0 && totalSuggestions === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
        <CardHeader
          className="cursor-pointer py-3"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <GitBranch className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  Avaliações da Equipe
                  {totalLoops > 0 && (
                    <Badge variant="default">
                      {totalLoops} loop{totalLoops > 1 ? "s" : ""} aberto{totalLoops > 1 ? "s" : ""}
                    </Badge>
                  )}
                  {totalSuggestions > 0 && (
                    <Badge variant="outline" className="animate-pulse">
                      {totalSuggestions} sugestão{totalSuggestions > 1 ? "ões" : ""}
                    </Badge>
                  )}
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  Acompanhe os ciclos de avaliação contextual da sua equipe
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRefresh();
                }}
                disabled={isLoading}
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
              </Button>
              {isExpanded ? (
                <ChevronUp className="w-5 h-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              )}
            </div>
          </div>
        </CardHeader>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <CardContent className="pt-0">
                <Tabs
                  value={activeTab}
                  onValueChange={(v) => setActiveTab(v as typeof activeTab)}
                >
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="loops" className="flex items-center gap-2">
                      <GitBranch className="w-4 h-4" />
                      Loops Ativos
                      {totalLoops > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          {totalLoops}
                        </Badge>
                      )}
                    </TabsTrigger>
                    <TabsTrigger value="suggestions" className="flex items-center gap-2">
                      <Lightbulb className="w-4 h-4" />
                      Sugestões
                      {totalSuggestions > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          {totalSuggestions}
                        </Badge>
                      )}
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="loops">
                    {isLoading ? (
                      <div className="space-y-3">
                        {[1, 2].map((i) => (
                          <Skeleton key={i} className="h-24 w-full" />
                        ))}
                      </div>
                    ) : totalLoops > 0 ? (
                      <ScrollArea className="h-[280px] pr-2">
                        <div className="space-y-3">
                          {teamLoops.map((loop) => {
                            const config = ORIGIN_CONFIG[loop.origin_type] || ORIGIN_CONFIG.manual;
                            const Icon = config.icon;
                            const cycle = loop.assessment_cycles;

                            return (
                              <motion.div
                                key={loop.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="p-3 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors"
                              >
                                <div className="flex items-center gap-3">
                                  <div className={`p-2 rounded-lg bg-muted ${config.color}`}>
                                    <Icon className="w-4 h-4" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium text-sm truncate">
                                        {cycle?.name || "Avaliação"}
                                      </span>
                                      <Badge variant="outline" className="text-xs">
                                        {config.label}
                                      </Badge>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      Iniciado {formatDistanceToNow(new Date(loop.created_at), {
                                        addSuffix: true,
                                        locale: ptBR,
                                      })}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Badge variant="default" className="flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      Aberto
                                    </Badge>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => closeLoopMutation.mutate(loop.id)}
                                      disabled={closeLoopMutation.isPending}
                                    >
                                      <X className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      </ScrollArea>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <CheckCircle2 className="w-12 h-12 mx-auto mb-2 text-green-500" />
                        <p>Nenhum loop ativo</p>
                        <p className="text-sm">Todos os ciclos de avaliação estão concluídos</p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="suggestions">
                    {isLoading ? (
                      <div className="space-y-3">
                        {[1, 2].map((i) => (
                          <Skeleton key={i} className="h-24 w-full" />
                        ))}
                      </div>
                    ) : totalSuggestions > 0 ? (
                      <ScrollArea className="h-[280px] pr-2">
                        <div className="space-y-3">
                          {teamSuggestions.map((suggestion) => {
                            const config = SUGGESTION_CONFIG[suggestion.suggestion_type] || SUGGESTION_CONFIG.auto;
                            const Icon = config.icon;
                            const profile = suggestion.profiles as TeamMember | undefined;

                            return (
                              <motion.div
                                key={suggestion.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="p-3 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors"
                              >
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-8 w-8">
                                    <AvatarImage src={profile?.avatar_url || undefined} />
                                    <AvatarFallback className="text-xs">
                                      {profile?.nickname?.charAt(0) || "U"}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium text-sm truncate">
                                        {profile?.nickname || "Colaborador"}
                                      </span>
                                      <Badge variant="outline" className={`text-xs ${config.color}`}>
                                        <Icon className="w-3 h-3 mr-1" />
                                        {config.label}
                                      </Badge>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                                      {suggestion.reason || "Sugestão de avaliação"}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Badge 
                                      variant={suggestion.priority && suggestion.priority <= 3 ? "destructive" : "secondary"}
                                      className="text-xs"
                                    >
                                      P{suggestion.priority || 5}
                                    </Badge>
                                    <Button variant="ghost" size="icon">
                                      <Eye className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      </ScrollArea>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>Nenhuma sugestão pendente</p>
                        <p className="text-sm">A equipe está com as avaliações em dia</p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}
