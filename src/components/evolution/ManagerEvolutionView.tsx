/**
 * ManagerEvolutionView - Visão do gestor sobre evolução do time
 * Dashboard com métricas, alertas agregados e ações rápidas
 */

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Users,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Target,
  MessageSquare,
  Calendar,
  Trophy,
  MoreVertical,
  Plus,
  Sparkles,
  CheckCircle2,
  Clock,
  ArrowRight,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useOrganization } from "@/hooks/useOrganization";
import { useEvolutionAlerts } from "@/hooks/useEvolutionAlerts";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface TeamMember {
  id: string;
  full_name: string;
  avatar_url: string | null;
  email: string;
  weeklyXP: number;
  xpChange: number;
  activeStreak: number;
  alertCount: number;
  lastActivity: string | null;
}

interface TeamMetrics {
  totalMembers: number;
  avgWeeklyXP: number;
  totalAlerts: number;
  activeStreaks: number;
}

export function ManagerEvolutionView() {
  const { user } = useAuth();
  const { currentOrg } = useOrganization();
  const [isLoading, setIsLoading] = useState(true);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [metrics, setMetrics] = useState<TeamMetrics | null>(null);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  useEffect(() => {
    async function fetchTeamData() {
      if (!user?.id || !currentOrg?.id) return;
      setIsLoading(true);

      try {
        // Buscar membros do time
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, name, avatar_url, email")
          .eq("organization_id", currentOrg.id)
          .neq("id", user.id)
          .limit(20);

        if (!profiles || profiles.length === 0) {
          setTeamMembers([]);
          setMetrics({ totalMembers: 0, avgWeeklyXP: 0, totalAlerts: 0, activeStreaks: 0 });
          setIsLoading(false);
          return;
        }

        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);

        // Para cada membro, buscar métricas
        const membersWithMetrics: TeamMember[] = [];
        
        for (const profile of profiles) {
          // XP da semana
          const { data: events } = await supabase
            .from("core_events")
            .select("xp_earned, created_at")
            .eq("user_id", profile.id)
            .gte("created_at", weekAgo.toISOString());

          const weeklyXP = events?.reduce((sum, e) => sum + (e.xp_earned || 0), 0) || 0;
          const lastActivity = events?.length ? events[events.length - 1].created_at : null;

          // XP da semana anterior
          const twoWeeksAgo = new Date();
          twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
          
          const { data: prevEvents } = await supabase
            .from("core_events")
            .select("xp_earned")
            .eq("user_id", profile.id)
            .gte("created_at", twoWeeksAgo.toISOString())
            .lt("created_at", weekAgo.toISOString());

          const prevWeeklyXP = prevEvents?.reduce((sum, e) => sum + (e.xp_earned || 0), 0) || 0;
          const xpChange = prevWeeklyXP > 0 
            ? Math.round(((weeklyXP - prevWeeklyXP) / prevWeeklyXP) * 100)
            : 0;

          // Streak
          const { data: streakData } = await supabase
            .from("user_streaks")
            .select("current_streak")
            .eq("user_id", profile.id)
            .single();

          // Alertas
          const { count: alertCount } = await supabase
            .from("evolution_alerts")
            .select("*", { count: "exact", head: true })
            .eq("user_id", profile.id)
            .eq("is_dismissed", false);

          membersWithMetrics.push({
            id: profile.id,
            full_name: profile.name || "Sem nome",
            avatar_url: profile.avatar_url,
            email: profile.email || "",
            weeklyXP,
            xpChange,
            activeStreak: streakData?.current_streak || 0,
            alertCount: alertCount || 0,
            lastActivity,
          });
        }

        // Ordenar por alertas e XP
        const sortedMembers = membersWithMetrics.sort((a, b) => {
          if (b.alertCount !== a.alertCount) return b.alertCount - a.alertCount;
          return b.weeklyXP - a.weeklyXP;
        });

        setTeamMembers(sortedMembers);

        // Calcular métricas do time
        const totalAlerts = sortedMembers.reduce((sum, m) => sum + m.alertCount, 0);
        const avgXP = sortedMembers.length > 0
          ? Math.round(sortedMembers.reduce((sum, m) => sum + m.weeklyXP, 0) / sortedMembers.length)
          : 0;
        const activeStreaks = sortedMembers.filter(m => m.activeStreak > 0).length;

        setMetrics({
          totalMembers: sortedMembers.length,
          avgWeeklyXP: avgXP,
          totalAlerts,
          activeStreaks,
        });
      } catch (error) {
        console.error("Error fetching team data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchTeamData();
  }, [user?.id, currentOrg?.id]);

  const handleQuickAction = (action: string, member: TeamMember) => {
    // Placeholder para ações rápidas
    console.log(`Action: ${action} for ${member.full_name}`);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            Evolução do Time
          </h2>
          <p className="text-muted-foreground">
            Acompanhe e apoie o desenvolvimento da sua equipe
          </p>
        </div>
      </div>

      {/* Métricas do Time */}
      {metrics && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{metrics.totalMembers}</p>
                  <p className="text-xs text-muted-foreground">Membros</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-yellow-500/10">
                  <Sparkles className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{metrics.avgWeeklyXP}</p>
                  <p className="text-xs text-muted-foreground">XP Médio/Semana</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-500/10">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{metrics.totalAlerts}</p>
                  <p className="text-xs text-muted-foreground">Alertas Ativos</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{metrics.activeStreaks}</p>
                  <p className="text-xs text-muted-foreground">Streaks Ativos</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Lista do Time */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Membros do Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          {teamMembers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Nenhum membro no time</p>
            </div>
          ) : (
            <ScrollArea className="h-[400px]">
              <div className="space-y-3">
                {teamMembers.map((member, index) => (
                  <motion.div
                    key={member.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-4 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={member.avatar_url || undefined} />
                      <AvatarFallback>
                        {member.full_name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium truncate">{member.full_name}</p>
                        {member.alertCount > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            {member.alertCount} alerta{member.alertCount > 1 ? "s" : ""}
                          </Badge>
                        )}
                        {member.activeStreak >= 7 && (
                          <Badge className="bg-orange-500/10 text-orange-600 text-xs">
                            🔥 {member.activeStreak}d
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Sparkles className="h-3 w-3" />
                          {member.weeklyXP} XP
                          {member.xpChange !== 0 && (
                            <span className={member.xpChange > 0 ? "text-green-600" : "text-red-500"}>
                              ({member.xpChange > 0 ? "+" : ""}{member.xpChange}%)
                            </span>
                          )}
                        </span>
                        {member.lastActivity && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {format(new Date(member.lastActivity), "dd/MM")}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Ações Rápidas */}
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Criar Desafio"
                        onClick={() => handleQuickAction("challenge", member)}
                      >
                        <Target className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Agendar 1:1"
                        onClick={() => handleQuickAction("1on1", member)}
                      >
                        <Calendar className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Feedback"
                        onClick={() => handleQuickAction("feedback", member)}
                      >
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleQuickAction("pdi", member)}>
                            <TrendingUp className="h-4 w-4 mr-2" />
                            Iniciar PDI
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleQuickAction("recognize", member)}>
                            <Trophy className="h-4 w-4 mr-2" />
                            Reconhecer
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setSelectedMember(member)}>
                            <ArrowRight className="h-4 w-4 mr-2" />
                            Ver Detalhes
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Membros que precisam de atenção */}
      {teamMembers.filter(m => m.alertCount > 0 || m.xpChange < -20).length > 0 && (
        <Card className="border-yellow-500/20 bg-yellow-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-700">
              <AlertTriangle className="h-5 w-5" />
              Membros que Precisam de Atenção
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {teamMembers
                .filter(m => m.alertCount > 0 || m.xpChange < -20)
                .slice(0, 5)
                .map(member => (
                  <div key={member.id} className="flex items-center justify-between p-2 rounded bg-background">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={member.avatar_url || undefined} />
                        <AvatarFallback className="text-xs">
                          {member.full_name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">{member.full_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {member.alertCount > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          {member.alertCount} alerta{member.alertCount > 1 ? "s" : ""}
                        </Badge>
                      )}
                      {member.xpChange < -20 && (
                        <Badge variant="outline" className="text-xs text-red-500">
                          <TrendingDown className="h-3 w-3 mr-1" />
                          {member.xpChange}%
                        </Badge>
                      )}
                      <Button size="sm" variant="outline">
                        Agir
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}
