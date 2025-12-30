import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { 
  StickyNote, TrendingUp, Users, BookOpen, 
  BarChart3, Award, Target
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useOrganization } from "@/hooks/useOrganization";

interface TrainingNotesMetrics {
  trainingId: string;
  trainingName: string;
  totalNotes: number;
  uniqueUsers: number;
  avgNotesPerUser: number;
  statusBreakdown: {
    draft: number;
    applied: number;
    reviewed: number;
  };
}

export function NotesAnalyticsDashboard() {
  const { currentOrg } = useOrganization();
  const [period, setPeriod] = useState<"7d" | "30d" | "90d">("30d");

  const { data: metrics, isLoading } = useQuery({
    queryKey: ["notes-analytics", currentOrg?.id, period],
    queryFn: async () => {
      if (!currentOrg?.id) return null;

      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      switch (period) {
        case "7d":
          startDate.setDate(startDate.getDate() - 7);
          break;
        case "30d":
          startDate.setDate(startDate.getDate() - 30);
          break;
        case "90d":
          startDate.setDate(startDate.getDate() - 90);
          break;
      }

      // Fetch aggregated notes data (without individual content)
      const { data: notesData, error } = await supabase
        .from("training_notes")
        .select(`
          training_id,
          status,
          user_id,
          training:trainings(id, name)
        `)
        .eq("organization_id", currentOrg.id)
        .gte("created_at", startDate.toISOString())
        .lte("created_at", endDate.toISOString());

      if (error) throw error;

      // Aggregate by training
      const trainingMap = new Map<string, TrainingNotesMetrics>();
      
      notesData?.forEach(note => {
        const trainingId = note.training_id;
        const trainingName = (note.training as any)?.name || "Treinamento";
        
        if (!trainingMap.has(trainingId)) {
          trainingMap.set(trainingId, {
            trainingId,
            trainingName,
            totalNotes: 0,
            uniqueUsers: 0,
            avgNotesPerUser: 0,
            statusBreakdown: { draft: 0, applied: 0, reviewed: 0 },
          });
        }
        
        const metrics = trainingMap.get(trainingId)!;
        metrics.totalNotes++;
        metrics.statusBreakdown[note.status as keyof typeof metrics.statusBreakdown]++;
      });

      // Calculate unique users per training
      const usersByTraining = new Map<string, Set<string>>();
      notesData?.forEach(note => {
        if (!usersByTraining.has(note.training_id)) {
          usersByTraining.set(note.training_id, new Set());
        }
        usersByTraining.get(note.training_id)!.add(note.user_id);
      });

      usersByTraining.forEach((users, trainingId) => {
        const metrics = trainingMap.get(trainingId);
        if (metrics) {
          metrics.uniqueUsers = users.size;
          metrics.avgNotesPerUser = metrics.totalNotes / users.size;
        }
      });

      return {
        trainings: Array.from(trainingMap.values()).sort((a, b) => b.totalNotes - a.totalNotes),
        totalNotes: notesData?.length || 0,
        uniqueUsers: new Set(notesData?.map(n => n.user_id)).size,
        statusTotals: {
          draft: notesData?.filter(n => n.status === "draft").length || 0,
          applied: notesData?.filter(n => n.status === "applied").length || 0,
          reviewed: notesData?.filter(n => n.status === "reviewed").length || 0,
        },
      };
    },
    enabled: !!currentOrg?.id,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (!metrics) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <StickyNote className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            Nenhum dado de anotações encontrado para o período selecionado.
          </p>
        </CardContent>
      </Card>
    );
  }

  const applicationRate = metrics.totalNotes > 0 
    ? Math.round(((metrics.statusTotals.applied + metrics.statusTotals.reviewed) / metrics.totalNotes) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Métricas de Anotações</h3>
          <p className="text-sm text-muted-foreground">
            Dados agregados (sem acesso ao conteúdo individual)
          </p>
        </div>
        <Select value={period} onValueChange={(v) => setPeriod(v as typeof period)}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">7 dias</SelectItem>
            <SelectItem value="30d">30 dias</SelectItem>
            <SelectItem value="90d">90 dias</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <StickyNote className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{metrics.totalNotes}</p>
                <p className="text-sm text-muted-foreground">Total de Anotações</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Users className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{metrics.uniqueUsers}</p>
                <p className="text-sm text-muted-foreground">Usuários Anotando</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Target className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{applicationRate}%</p>
                <p className="text-sm text-muted-foreground">Taxa de Aplicação</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <BarChart3 className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {metrics.uniqueUsers > 0 ? (metrics.totalNotes / metrics.uniqueUsers).toFixed(1) : 0}
                </p>
                <p className="text-sm text-muted-foreground">Média por Usuário</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Distribuição por Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-24 text-sm text-muted-foreground">Rascunhos</div>
              <div className="flex-1">
                <Progress 
                  value={metrics.totalNotes > 0 ? (metrics.statusTotals.draft / metrics.totalNotes) * 100 : 0} 
                  className="h-2"
                />
              </div>
              <div className="w-16 text-right font-medium">{metrics.statusTotals.draft}</div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-24 text-sm text-muted-foreground">Aplicadas</div>
              <div className="flex-1">
                <Progress 
                  value={metrics.totalNotes > 0 ? (metrics.statusTotals.applied / metrics.totalNotes) * 100 : 0}
                  className="h-2 [&>div]:bg-green-500"
                />
              </div>
              <div className="w-16 text-right font-medium">{metrics.statusTotals.applied}</div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-24 text-sm text-muted-foreground">Revisadas</div>
              <div className="flex-1">
                <Progress 
                  value={metrics.totalNotes > 0 ? (metrics.statusTotals.reviewed / metrics.totalNotes) * 100 : 0}
                  className="h-2 [&>div]:bg-blue-500"
                />
              </div>
              <div className="w-16 text-right font-medium">{metrics.statusTotals.reviewed}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Trainings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Treinamentos Mais Anotados</CardTitle>
          <CardDescription>
            Os treinamentos que mais geram engajamento em anotações
          </CardDescription>
        </CardHeader>
        <CardContent>
          {metrics.trainings.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhum dado disponível
            </p>
          ) : (
            <div className="space-y-3">
              {metrics.trainings.slice(0, 5).map((training, i) => (
                <motion.div
                  key={training.trainingId}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-4 p-3 rounded-lg bg-muted/50"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">{i + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{training.trainingName}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{training.uniqueUsers} usuários</span>
                      <span>•</span>
                      <span>{training.avgNotesPerUser.toFixed(1)} notas/usuário</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary" className="font-bold">
                      {training.totalNotes}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">anotações</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Insight Card */}
      <Card className="bg-muted/30 border-dashed">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <Award className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="text-sm font-medium">Insight Gameia</p>
              <p className="text-sm text-muted-foreground mt-1">
                {applicationRate >= 50 
                  ? "Excelente! Sua equipe está aplicando o que aprende. Continue incentivando a prática deliberada."
                  : applicationRate >= 25
                  ? "Bom progresso! Considere criar desafios que incentivem a aplicação do conhecimento anotado."
                  : "Oportunidade: incentive sua equipe a marcar anotações como 'aplicadas' quando usarem o conhecimento no trabalho."}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
