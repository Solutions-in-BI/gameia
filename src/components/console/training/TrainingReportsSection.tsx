/**
 * TrainingReportsSection - Relatórios de treinamentos com exportação
 */

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Download,
  Filter,
  Calendar,
  Users,
  GraduationCap,
  Clock,
  Target,
  Award,
  FileSpreadsheet,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTrainings } from "@/hooks/useTrainings";
import { useOrgTrainingConfig } from "@/hooks/useOrgTrainingConfig";
import { useOrganization } from "@/hooks/useOrganization";
import { useOrgMetrics } from "@/hooks/useOrgMetrics";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import * as XLSX from "xlsx";

type ReportType = "completion" | "progress" | "performance" | "time";

interface ReportConfig {
  id: ReportType;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
}

const REPORT_TYPES: ReportConfig[] = [
  {
    id: "completion",
    title: "Conclusões",
    description: "Treinamentos concluídos por período",
    icon: Award,
    color: "bg-emerald-500/10 text-emerald-500",
  },
  {
    id: "progress",
    title: "Progresso",
    description: "Status de andamento por pessoa",
    icon: Target,
    color: "bg-blue-500/10 text-blue-500",
  },
  {
    id: "performance",
    title: "Desempenho",
    description: "Scores e notas por treinamento",
    icon: GraduationCap,
    color: "bg-purple-500/10 text-purple-500",
  },
  {
    id: "time",
    title: "Tempo",
    description: "Tempo dedicado por treinamento",
    icon: Clock,
    color: "bg-amber-500/10 text-amber-500",
  },
];

export function TrainingReportsSection() {
  const { currentOrg } = useOrganization();
  const { trainings, userProgress, isLoading: trainingsLoading } = useTrainings(currentOrg?.id);
  const { analytics, getTrainingMetrics } = useOrgTrainingConfig(currentOrg?.id);
  const { membersWithMetrics, isLoading: membersLoading } = useOrgMetrics(currentOrg?.id || "");

  const [selectedReport, setSelectedReport] = useState<ReportType>("completion");
  const [selectedTraining, setSelectedTraining] = useState<string>("all");
  const [period, setPeriod] = useState<"7d" | "30d" | "90d" | "all">("30d");
  const [isExporting, setIsExporting] = useState(false);

  const isLoading = trainingsLoading || membersLoading;

  // Filter analytics by period
  const filteredAnalytics = useMemo(() => {
    const now = new Date();
    const cutoff = period === "all" ? null : new Date(
      period === "7d" ? now.getTime() - 7 * 24 * 60 * 60 * 1000 :
      period === "30d" ? now.getTime() - 30 * 24 * 60 * 60 * 1000 :
      now.getTime() - 90 * 24 * 60 * 60 * 1000
    );

    return analytics.filter((a) => {
      if (cutoff && new Date(a.created_at) < cutoff) return false;
      if (selectedTraining !== "all" && a.training_id !== selectedTraining) return false;
      return true;
    });
  }, [analytics, period, selectedTraining]);

  // Build report data based on type
  const reportData = useMemo(() => {
    switch (selectedReport) {
      case "completion": {
        const completions = filteredAnalytics.filter((a) => a.event_type === "training_completed");
        return completions.map((c) => {
          const training = trainings.find((t) => t.id === c.training_id);
          const member = membersWithMetrics.find((m) => m.user_id === c.user_id);
          return {
            id: c.id,
            trainingName: training?.name || "Desconhecido",
            userName: member?.nickname || "Usuário",
            completedAt: format(new Date(c.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR }),
            score: c.score ? `${c.score}%` : "-",
          };
        });
      }
      
      case "progress": {
        const progressData: {
          id: string;
          userName: string;
          trainingName: string;
          progress: number;
          status: string;
          startedAt: string;
        }[] = [];
        
        membersWithMetrics.forEach((member) => {
          trainings.forEach((training) => {
            const progress = userProgress.find(
              (p) => p.user_id === member.user_id && p.training_id === training.id
            );
            if (progress) {
              progressData.push({
                id: `${member.user_id}-${training.id}`,
                userName: member.nickname || "Usuário",
                trainingName: training.name,
                progress: progress.progress_percent,
                status: progress.completed_at ? "Concluído" : progress.progress_percent > 0 ? "Em Progresso" : "Não Iniciado",
                startedAt: progress.started_at ? format(new Date(progress.started_at), "dd/MM/yyyy", { locale: ptBR }) : "-",
              });
            }
          });
        });
        
        return progressData;
      }
      
      case "performance": {
        return trainings.map((t) => {
          const metrics = getTrainingMetrics(t.id);
          const trainingAnalytics = filteredAnalytics.filter((a) => a.training_id === t.id);
          const scores = trainingAnalytics.filter((a) => a.score !== null).map((a) => a.score!);
          const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
          
          return {
            id: t.id,
            trainingName: t.name,
            completions: metrics.completions,
            avgScore: avgScore > 0 ? `${avgScore}%` : "-",
            completionRate: `${metrics.completionRate}%`,
            difficulty: t.difficulty,
          };
        });
      }
      
      case "time": {
        return trainings.map((t) => {
          const trainingAnalytics = filteredAnalytics.filter((a) => a.training_id === t.id);
          const totalSeconds = trainingAnalytics.reduce((acc, a) => acc + (a.time_spent_seconds || 0), 0);
          const avgSeconds = trainingAnalytics.length > 0 ? totalSeconds / trainingAnalytics.length : 0;
          
          return {
            id: t.id,
            trainingName: t.name,
            totalTime: `${Math.round(totalSeconds / 60)} min`,
            avgTime: `${Math.round(avgSeconds / 60)} min`,
            estimatedTime: `${t.estimated_hours * 60} min`,
            sessions: trainingAnalytics.length,
          };
        });
      }
      
      default:
        return [];
    }
  }, [selectedReport, filteredAnalytics, trainings, membersWithMetrics, userProgress, getTrainingMetrics]);

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      const ws = XLSX.utils.json_to_sheet(reportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Relatório");
      
      const fileName = `relatorio-treinamentos-${selectedReport}-${format(new Date(), "yyyy-MM-dd")}.xlsx`;
      XLSX.writeFile(wb, fileName);
      
      toast.success("Relatório exportado com sucesso!");
    } catch (error) {
      toast.error("Erro ao exportar relatório");
    } finally {
      setIsExporting(false);
    }
  };

  const currentReportConfig = REPORT_TYPES.find((r) => r.id === selectedReport)!;

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
            <FileText className="w-6 h-6 text-primary" />
            Relatórios de Treinamentos
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Exporte dados de conclusões, progresso e desempenho
          </p>
        </div>
        <Button onClick={handleExport} disabled={isExporting || reportData.length === 0} className="gap-2">
          {isExporting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <FileSpreadsheet className="w-4 h-4" />
          )}
          Exportar Excel
        </Button>
      </div>

      {/* Report Type Selection */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {REPORT_TYPES.map((report) => {
          const Icon = report.icon;
          const isSelected = selectedReport === report.id;
          
          return (
            <motion.button
              key={report.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedReport(report.id)}
              className={cn(
                "p-4 rounded-xl border text-left transition-all",
                isSelected
                  ? "border-primary bg-primary/5 shadow-md"
                  : "border-border bg-card hover:border-primary/50"
              )}
            >
              <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center mb-3", report.color)}>
                <Icon className="w-5 h-5" />
              </div>
              <h3 className={cn("font-semibold", isSelected && "text-primary")}>{report.title}</h3>
              <p className="text-xs text-muted-foreground mt-1">{report.description}</p>
            </motion.button>
          );
        })}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <Select value={period} onValueChange={(v) => setPeriod(v as typeof period)}>
              <SelectTrigger className="w-full sm:w-48">
                <Calendar className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Últimos 7 dias</SelectItem>
                <SelectItem value="30d">Últimos 30 dias</SelectItem>
                <SelectItem value="90d">Últimos 90 dias</SelectItem>
                <SelectItem value="all">Todo o período</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={selectedTraining} onValueChange={setSelectedTraining}>
              <SelectTrigger className="w-full sm:w-64">
                <GraduationCap className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os treinamentos</SelectItem>
                {trainings.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.icon} {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <currentReportConfig.icon className="w-4 h-4" />
              {currentReportConfig.title}
            </CardTitle>
            <Badge variant="outline">{reportData.length} registros</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {reportData.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhum dado encontrado para os filtros selecionados.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {selectedReport === "completion" && (
                      <>
                        <TableHead>Treinamento</TableHead>
                        <TableHead>Usuário</TableHead>
                        <TableHead>Data de Conclusão</TableHead>
                        <TableHead>Score</TableHead>
                      </>
                    )}
                    {selectedReport === "progress" && (
                      <>
                        <TableHead>Usuário</TableHead>
                        <TableHead>Treinamento</TableHead>
                        <TableHead>Progresso</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Início</TableHead>
                      </>
                    )}
                    {selectedReport === "performance" && (
                      <>
                        <TableHead>Treinamento</TableHead>
                        <TableHead>Conclusões</TableHead>
                        <TableHead>Score Médio</TableHead>
                        <TableHead>Taxa de Conclusão</TableHead>
                        <TableHead>Dificuldade</TableHead>
                      </>
                    )}
                    {selectedReport === "time" && (
                      <>
                        <TableHead>Treinamento</TableHead>
                        <TableHead>Tempo Total</TableHead>
                        <TableHead>Tempo Médio</TableHead>
                        <TableHead>Estimado</TableHead>
                        <TableHead>Sessões</TableHead>
                      </>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.slice(0, 20).map((row: any) => (
                    <TableRow key={row.id}>
                      {selectedReport === "completion" && (
                        <>
                          <TableCell className="font-medium">{row.trainingName}</TableCell>
                          <TableCell>{row.userName}</TableCell>
                          <TableCell>{row.completedAt}</TableCell>
                          <TableCell>{row.score}</TableCell>
                        </>
                      )}
                      {selectedReport === "progress" && (
                        <>
                          <TableCell className="font-medium">{row.userName}</TableCell>
                          <TableCell>{row.trainingName}</TableCell>
                          <TableCell>{row.progress}%</TableCell>
                          <TableCell>
                            <Badge variant={row.status === "Concluído" ? "default" : "secondary"}>
                              {row.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{row.startedAt}</TableCell>
                        </>
                      )}
                      {selectedReport === "performance" && (
                        <>
                          <TableCell className="font-medium">{row.trainingName}</TableCell>
                          <TableCell>{row.completions}</TableCell>
                          <TableCell>{row.avgScore}</TableCell>
                          <TableCell>{row.completionRate}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{row.difficulty}</Badge>
                          </TableCell>
                        </>
                      )}
                      {selectedReport === "time" && (
                        <>
                          <TableCell className="font-medium">{row.trainingName}</TableCell>
                          <TableCell>{row.totalTime}</TableCell>
                          <TableCell>{row.avgTime}</TableCell>
                          <TableCell>{row.estimatedTime}</TableCell>
                          <TableCell>{row.sessions}</TableCell>
                        </>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {reportData.length > 20 && (
                <p className="text-sm text-muted-foreground text-center mt-4">
                  Mostrando 20 de {reportData.length} registros. Exporte para ver todos.
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
