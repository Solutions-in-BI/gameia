/**
 * ManagerAssessmentsSection - Seção completa de avaliações para gestores
 * Inclui: visão do time, avaliações pendentes, histórico e ações rápidas
 */

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import {
  Users,
  ClipboardCheck,
  History,
  TrendingUp,
  Star,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Target,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useOrganization } from "@/hooks/useOrganization";
import { useAuth } from "@/hooks/useAuth";
import { ManagerAssessmentView } from "@/components/assessments/ManagerAssessmentView";
import { format, formatDistanceToNow, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface TeamMember {
  id: string;
  nickname: string | null;
  avatar_url: string | null;
  job_title: string | null;
  department: string | null;
  lastAssessmentDate: string | null;
  assessmentScore: number | null;
  pendingConsequences: number;
  needsAttention: boolean;
}

interface AssessmentStats {
  totalMembers: number;
  assessedThisMonth: number;
  pendingAssessments: number;
  avgScore: number;
}

export function ManagerAssessmentsSection() {
  const { currentOrg } = useOrganization();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"team" | "pending" | "history">("team");
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [showAssessmentDialog, setShowAssessmentDialog] = useState(false);

  const orgId = currentOrg?.id;
  const managerId = user?.id;

  // Buscar membros do time
  const { data: teamMembers = [], isLoading: membersLoading } = useQuery({
    queryKey: ["manager-team-members", orgId, managerId],
    queryFn: async () => {
      if (!orgId || !managerId) return [];

      // Buscar membros da organização
      const { data: members, error } = await supabase
        .from("organization_members")
        .select(`
          user_id,
          profiles!inner(
            id,
            nickname,
            avatar_url,
            job_title,
            department
          )
        `)
        .eq("organization_id", orgId)
        .neq("user_id", managerId);

      if (error) throw error;
      if (!members) return [];

      // Buscar última avaliação de cada membro
      const userIds = members.map(m => m.user_id);
      const thirtyDaysAgo = subDays(new Date(), 30).toISOString();

      const { data: assessments } = await supabase
        .from("manager_assessments")
        .select("evaluatee_id, created_at, total_score")
        .in("evaluatee_id", userIds)
        .eq("manager_id", managerId)
        .order("created_at", { ascending: false });

      // Buscar consequências pendentes
      const { data: consequences } = await supabase
        .from("assessment_consequences")
        .select("user_id")
        .in("user_id", userIds)
        .eq("status", "pending");

      const assessmentMap = new Map<string, { date: string; score: number }>();
      (assessments || []).forEach((a: any) => {
        if (!assessmentMap.has(a.evaluatee_id)) {
          assessmentMap.set(a.evaluatee_id, {
            date: a.created_at,
            score: a.total_score || 0,
          });
        }
      });

      const consequenceCount = new Map<string, number>();
      (consequences || []).forEach(c => {
        consequenceCount.set(c.user_id, (consequenceCount.get(c.user_id) || 0) + 1);
      });

      return members.map(m => {
        const profile = m.profiles as any;
        const assessment = assessmentMap.get(m.user_id);
        const needsAttention = !assessment || 
          new Date(assessment.date) < new Date(thirtyDaysAgo) ||
          (assessment.score && assessment.score < 60);

        return {
          id: m.user_id,
          nickname: profile?.nickname,
          avatar_url: profile?.avatar_url,
          job_title: profile?.job_title,
          department: profile?.department,
          lastAssessmentDate: assessment?.date || null,
          assessmentScore: assessment?.score || null,
          pendingConsequences: consequenceCount.get(m.user_id) || 0,
          needsAttention,
        } as TeamMember;
      });
    },
    enabled: !!orgId && !!managerId,
  });

  // Buscar estatísticas
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["manager-assessment-stats", orgId, managerId],
    queryFn: async () => {
      if (!orgId || !managerId) return null;

      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { count: totalMembers } = await supabase
        .from("organization_members")
        .select("*", { count: "exact", head: true })
        .eq("organization_id", orgId)
        .neq("user_id", managerId);

      const { data: monthlyAssessments } = await supabase
        .from("manager_assessments")
        .select("evaluatee_id, total_score")
        .eq("manager_id", managerId)
        .gte("created_at", startOfMonth.toISOString());

      const uniqueAssessed = new Set((monthlyAssessments || []).map((a: any) => a.evaluatee_id));
      const scores = (monthlyAssessments || []).map((a: any) => a.total_score || 0).filter(Boolean);
      const avgScore = scores.length > 0 ? scores.reduce((a: number, b: number) => a + b, 0) / scores.length : 0;

      return {
        totalMembers: totalMembers || 0,
        assessedThisMonth: uniqueAssessed.size,
        pendingAssessments: (totalMembers || 0) - uniqueAssessed.size,
        avgScore: Math.round(avgScore),
      } as AssessmentStats;
    },
    enabled: !!orgId && !!managerId,
  });

  // Buscar histórico de avaliações
  const { data: assessmentHistory = [], isLoading: historyLoading } = useQuery({
    queryKey: ["manager-assessment-history", managerId],
    queryFn: async () => {
      if (!managerId) return [];

      const { data, error } = await supabase
        .from("manager_assessments")
        .select(`
          id,
          evaluatee_id,
          total_score,
          created_at,
          strengths,
          development_areas
        `)
        .eq("manager_id", managerId)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      if (!data || data.length === 0) return [];

      // Buscar nomes dos avaliados
      const evaluateeIds = [...new Set(data.map((a: any) => a.evaluatee_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, nickname, avatar_url")
        .in("id", evaluateeIds);

      const profileMap = new Map((profiles || []).map(p => [p.id, p]));

      return data.map((a: any) => ({
        ...a,
        overall_score: a.total_score, // Alias for display
        profile: profileMap.get(a.evaluatee_id),
      }));
    },
    enabled: !!managerId,
  });

  const handleAssessMember = (memberId: string) => {
    setSelectedMember(memberId);
    setShowAssessmentDialog(true);
  };

  const isLoading = membersLoading || statsLoading;

  const needsAttentionMembers = teamMembers.filter(m => m.needsAttention);
  const upToDateMembers = teamMembers.filter(m => !m.needsAttention);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Avaliações & Feedback</h1>
        <p className="text-muted-foreground">Gerencie avaliações da sua equipe</p>
      </div>

      {/* Stats Cards */}
      {statsLoading ? (
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : stats && (
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalMembers}</p>
                  <p className="text-xs text-muted-foreground">Membros do Time</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.assessedThisMonth}</p>
                  <p className="text-xs text-muted-foreground">Avaliados este mês</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10">
                  <Clock className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.pendingAssessments}</p>
                  <p className="text-xs text-muted-foreground">Pendentes</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Star className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.avgScore || '-'}</p>
                  <p className="text-xs text-muted-foreground">Score Médio</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
        <TabsList>
          <TabsTrigger value="team" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Meu Time
            {needsAttentionMembers.length > 0 && (
              <Badge variant="destructive" className="text-xs">
                {needsAttentionMembers.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <ClipboardCheck className="h-4 w-4" />
            Pendentes
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Histórico
          </TabsTrigger>
        </TabsList>

        <TabsContent value="team" className="mt-4">
          {membersLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-20" />)}
            </div>
          ) : teamMembers.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Users className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground">Nenhum membro no time</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Needs Attention */}
              {needsAttentionMembers.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-amber-600">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">Precisam de Atenção</span>
                  </div>
                  <div className="grid gap-3">
                    {needsAttentionMembers.map(member => (
                      <MemberCard
                        key={member.id}
                        member={member}
                        onAssess={() => handleAssessMember(member.id)}
                        highlight
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Up to Date */}
              {upToDateMembers.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-emerald-600">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="text-sm font-medium">Avaliações em Dia</span>
                  </div>
                  <div className="grid gap-3">
                    {upToDateMembers.map(member => (
                      <MemberCard
                        key={member.id}
                        member={member}
                        onAssess={() => handleAssessMember(member.id)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="pending" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="h-4 w-4" />
                Avaliações Pendentes
              </CardTitle>
              <CardDescription>
                Membros que ainda não foram avaliados este mês
              </CardDescription>
            </CardHeader>
            <CardContent>
              {membersLoading ? (
                <div className="space-y-3">
                  {[1, 2].map(i => <Skeleton key={i} className="h-16" />)}
                </div>
              ) : needsAttentionMembers.length === 0 ? (
                <div className="py-8 text-center">
                  <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-emerald-500" />
                  <p className="font-medium">Todas as avaliações em dia!</p>
                  <p className="text-sm text-muted-foreground">
                    Você avaliou todos os membros do time este mês
                  </p>
                </div>
              ) : (
                <ScrollArea className="h-[400px]">
                  <div className="space-y-2">
                    {needsAttentionMembers.map(member => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={member.avatar_url || undefined} />
                            <AvatarFallback>
                              {member.nickname?.slice(0, 2).toUpperCase() || "?"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">{member.nickname || "Sem nome"}</p>
                            <p className="text-xs text-muted-foreground">
                              {member.lastAssessmentDate
                                ? `Última: ${formatDistanceToNow(new Date(member.lastAssessmentDate), {
                                    addSuffix: true,
                                    locale: ptBR,
                                  })}`
                                : "Nunca avaliado"}
                            </p>
                          </div>
                        </div>
                        <Button size="sm" onClick={() => handleAssessMember(member.id)}>
                          Avaliar
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <History className="h-4 w-4" />
                Histórico de Avaliações
              </CardTitle>
            </CardHeader>
            <CardContent>
              {historyLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-16" />)}
                </div>
              ) : assessmentHistory.length === 0 ? (
                <div className="py-8 text-center">
                  <ClipboardCheck className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-muted-foreground">Nenhuma avaliação realizada</p>
                </div>
              ) : (
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {assessmentHistory.map((assessment: any) => (
                      <div
                        key={assessment.id}
                        className="p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={assessment.profile?.avatar_url || undefined} />
                              <AvatarFallback>
                                {assessment.profile?.nickname?.slice(0, 2).toUpperCase() || "?"}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm">
                                {assessment.profile?.nickname || "Colaborador"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(assessment.created_at), "dd 'de' MMMM 'de' yyyy", {
                                  locale: ptBR,
                                })}
                              </p>
                            </div>
                          </div>
                          <Badge
                            variant="secondary"
                            className={cn(
                              "text-sm font-bold",
                              assessment.overall_score >= 80
                                ? "bg-emerald-500/10 text-emerald-600"
                                : assessment.overall_score >= 60
                                ? "bg-amber-500/10 text-amber-600"
                                : "bg-rose-500/10 text-rose-600"
                            )}
                          >
                            {Math.round(assessment.overall_score)}
                          </Badge>
                        </div>
                        {(assessment.strengths?.length > 0 || assessment.development_areas?.length > 0) && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {(assessment.strengths || []).slice(0, 2).map((s: string, i: number) => (
                              <Badge key={i} variant="outline" className="text-[10px] bg-emerald-500/5">
                                <TrendingUp className="h-2 w-2 mr-1" />
                                {s}
                              </Badge>
                            ))}
                            {(assessment.development_areas || []).slice(0, 2).map((d: string, i: number) => (
                              <Badge key={i} variant="outline" className="text-[10px] bg-amber-500/5">
                                <Target className="h-2 w-2 mr-1" />
                                {d}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Assessment Dialog */}
      {selectedMember && (
        <ManagerAssessmentView
          open={showAssessmentDialog}
          onOpenChange={setShowAssessmentDialog}
          evaluateeId={selectedMember}
          onComplete={() => {
            setSelectedMember(null);
          }}
        />
      )}
    </div>
  );
}

// Member Card Component
function MemberCard({
  member,
  onAssess,
  highlight = false,
}: {
  member: TeamMember;
  onAssess: () => void;
  highlight?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "p-4 rounded-lg border transition-colors cursor-pointer hover:bg-muted/50",
        highlight && "border-amber-500/50 bg-amber-500/5"
      )}
      onClick={onAssess}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={member.avatar_url || undefined} />
            <AvatarFallback>
              {member.nickname?.slice(0, 2).toUpperCase() || "?"}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{member.nickname || "Sem nome"}</p>
            <p className="text-sm text-muted-foreground">
              {member.job_title || "Colaborador"}
              {member.department && ` • ${member.department}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {member.assessmentScore !== null && (
            <Badge
              variant="secondary"
              className={cn(
                "text-sm font-bold",
                member.assessmentScore >= 80
                  ? "bg-emerald-500/10 text-emerald-600"
                  : member.assessmentScore >= 60
                  ? "bg-amber-500/10 text-amber-600"
                  : "bg-rose-500/10 text-rose-600"
              )}
            >
              {Math.round(member.assessmentScore)}
            </Badge>
          )}

          {member.pendingConsequences > 0 && (
            <Badge variant="outline" className="text-xs">
              {member.pendingConsequences} ações
            </Badge>
          )}

          <div className="text-xs text-muted-foreground text-right">
            {member.lastAssessmentDate
              ? formatDistanceToNow(new Date(member.lastAssessmentDate), {
                  addSuffix: true,
                  locale: ptBR,
                })
              : "Nunca avaliado"}
          </div>

          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>
    </motion.div>
  );
}
