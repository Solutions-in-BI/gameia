/**
 * ManagerPDIOverview - Dashboard de PDIs para gestores
 * Visão estratégica dos PDIs do time com alertas e correlações
 */

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useOrganization } from "@/hooks/useOrganization";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Users, Target, AlertTriangle, TrendingUp, 
  Search, Filter, Clock, CheckCircle2, 
  ArrowRight, BarChart3, AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";

interface PDIWithUser {
  id: string;
  title: string;
  status: string;
  overall_progress: number;
  created_at: string;
  period_end: string | null;
  user_id: string;
  user_name: string;
  user_avatar: string | null;
  goals_count: number;
  stagnant_goals: number;
  overdue_goals: number;
}

export function ManagerPDIOverview() {
  const { currentOrg } = useOrganization();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [riskFilter, setRiskFilter] = useState<string>("all");

  // Buscar PDIs do time com informações dos usuários
  const { data: teamPDIs = [], isLoading } = useQuery({
    queryKey: ["manager-team-pdis", currentOrg?.id],
    queryFn: async () => {
      if (!currentOrg?.id) return [];

      // Buscar planos da organização
      const { data: plans, error: plansError } = await supabase
        .from("development_plans")
        .select("*")
        .eq("organization_id", currentOrg.id)
        .order("created_at", { ascending: false });

      if (plansError) throw plansError;
      if (!plans?.length) return [];

      // Buscar perfis dos usuários
      const userIds = [...new Set(plans.map(p => p.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, nickname, avatar_url")
        .in("id", userIds);

      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

      // Buscar metas para cada plano
      const planIds = plans.map(p => p.id);
      const { data: goals } = await supabase
        .from("development_goals")
        .select("id, plan_id, status, progress, target_date, stagnant_since")
        .in("plan_id", planIds);

      const goalsMap = new Map<string, typeof goals>();
      goals?.forEach(g => {
        if (!goalsMap.has(g.plan_id)) {
          goalsMap.set(g.plan_id, []);
        }
        goalsMap.get(g.plan_id)!.push(g);
      });

      // Montar dados consolidados
      return plans.map(plan => {
        const profile = profileMap.get(plan.user_id);
        const planGoals = goalsMap.get(plan.id) || [];
        const now = new Date();

        const stagnantGoals = planGoals.filter(g => 
          g.stagnant_since && differenceInDays(now, new Date(g.stagnant_since)) >= 7
        ).length;

        const overdueGoals = planGoals.filter(g => 
          g.target_date && 
          new Date(g.target_date) < now && 
          (g.progress || 0) < 100
        ).length;

        return {
          id: plan.id,
          title: plan.title,
          status: plan.status,
          overall_progress: plan.overall_progress || 0,
          created_at: plan.created_at,
          period_end: plan.period_end,
          user_id: plan.user_id,
          user_name: profile?.nickname || "Usuário",
          user_avatar: profile?.avatar_url,
          goals_count: planGoals.length,
          stagnant_goals: stagnantGoals,
          overdue_goals: overdueGoals,
        } as PDIWithUser;
      });
    },
    enabled: !!currentOrg?.id,
  });

  // Filtrar PDIs
  const filteredPDIs = useMemo(() => {
    return teamPDIs.filter(pdi => {
      // Filtro de busca
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        if (!pdi.title.toLowerCase().includes(term) && 
            !pdi.user_name.toLowerCase().includes(term)) {
          return false;
        }
      }

      // Filtro de status
      if (statusFilter !== "all" && pdi.status !== statusFilter) {
        return false;
      }

      // Filtro de risco
      if (riskFilter === "at_risk" && pdi.stagnant_goals === 0 && pdi.overdue_goals === 0) {
        return false;
      }
      if (riskFilter === "healthy" && (pdi.stagnant_goals > 0 || pdi.overdue_goals > 0)) {
        return false;
      }

      return true;
    });
  }, [teamPDIs, searchTerm, statusFilter, riskFilter]);

  // Estatísticas
  const stats = useMemo(() => {
    const active = teamPDIs.filter(p => p.status === "active").length;
    const atRisk = teamPDIs.filter(p => p.stagnant_goals > 0 || p.overdue_goals > 0).length;
    const avgProgress = teamPDIs.length > 0
      ? Math.round(teamPDIs.reduce((sum, p) => sum + p.overall_progress, 0) / teamPDIs.length)
      : 0;
    const completed = teamPDIs.filter(p => p.status === "completed").length;

    return { total: teamPDIs.length, active, atRisk, avgProgress, completed };
  }, [teamPDIs]);

  const getRiskLevel = (pdi: PDIWithUser) => {
    if (pdi.overdue_goals > 0) return "critical";
    if (pdi.stagnant_goals > 0) return "warning";
    return "healthy";
  };

  const getRiskBadge = (level: string) => {
    switch (level) {
      case "critical":
        return <Badge variant="destructive" className="gap-1"><AlertCircle className="h-3 w-3" />Crítico</Badge>;
      case "warning":
        return <Badge variant="outline" className="gap-1 border-amber-500 text-amber-500"><AlertTriangle className="h-3 w-3" />Atenção</Badge>;
      default:
        return <Badge variant="outline" className="gap-1 border-emerald-500 text-emerald-500"><CheckCircle2 className="h-3 w-3" />Saudável</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">PDIs do Time</h2>
        <p className="text-muted-foreground">Visão estratégica dos planos de desenvolvimento</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">PDIs Total</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <Target className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.active}</p>
                <p className="text-sm text-muted-foreground">PDIs Ativos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.atRisk}</p>
                <p className="text-sm text-muted-foreground">Em Risco</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <TrendingUp className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.avgProgress}%</p>
                <p className="text-sm text-muted-foreground">Progresso Médio</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou título..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="active">Ativos</SelectItem>
            <SelectItem value="completed">Concluídos</SelectItem>
            <SelectItem value="draft">Rascunhos</SelectItem>
          </SelectContent>
        </Select>
        <Select value={riskFilter} onValueChange={setRiskFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Risco" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="at_risk">Em Risco</SelectItem>
            <SelectItem value="healthy">Saudáveis</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* PDI List */}
      {filteredPDIs.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              Nenhum PDI encontrado com os filtros selecionados.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredPDIs.map((pdi, index) => {
            const riskLevel = getRiskLevel(pdi);
            
            return (
              <motion.div
                key={pdi.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className={cn(
                  "hover:shadow-md transition-shadow",
                  riskLevel === "critical" && "border-red-500/30",
                  riskLevel === "warning" && "border-amber-500/30"
                )}>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={pdi.user_avatar || undefined} />
                        <AvatarFallback>{pdi.user_name.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-semibold truncate">{pdi.title}</h4>
                          {getRiskBadge(riskLevel)}
                        </div>
                        <p className="text-sm text-muted-foreground">{pdi.user_name}</p>
                      </div>

                      <div className="hidden sm:flex items-center gap-6">
                        <div className="text-center">
                          <p className="text-lg font-bold">{pdi.goals_count}</p>
                          <p className="text-xs text-muted-foreground">Metas</p>
                        </div>
                        
                        <div className="w-32">
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span>Progresso</span>
                            <span className="font-medium">{pdi.overall_progress}%</span>
                          </div>
                          <Progress value={pdi.overall_progress} className="h-2" />
                        </div>

                        {(pdi.stagnant_goals > 0 || pdi.overdue_goals > 0) && (
                          <div className="flex items-center gap-2 text-sm">
                            {pdi.overdue_goals > 0 && (
                              <span className="flex items-center gap-1 text-red-500">
                                <Clock className="h-3 w-3" />
                                {pdi.overdue_goals} atrasada(s)
                              </span>
                            )}
                            {pdi.stagnant_goals > 0 && (
                              <span className="flex items-center gap-1 text-amber-500">
                                <AlertTriangle className="h-3 w-3" />
                                {pdi.stagnant_goals} parada(s)
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      <Button variant="ghost" size="icon">
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Mobile stats */}
                    <div className="sm:hidden mt-4 pt-4 border-t">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <span className="text-sm">{pdi.goals_count} metas</span>
                          {pdi.overdue_goals > 0 && (
                            <span className="text-xs text-red-500">{pdi.overdue_goals} atrasada(s)</span>
                          )}
                        </div>
                        <span className="font-medium">{pdi.overall_progress}%</span>
                      </div>
                      <Progress value={pdi.overall_progress} className="h-2 mt-2" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
