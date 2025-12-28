/**
 * Aba de Relatórios com Exportação - Versão Aprimorada
 */

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  TrendingUp,
  Users,
  Trophy,
  Calendar,
  Target,
  Brain,
  Gamepad2,
  BarChart3,
  PieChart,
  Activity,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import type { MemberWithMetrics } from "@/hooks/useOrgMetrics";
import type { OrgTeam } from "@/hooks/useOrgTeams";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { ReportCard } from "./ReportCard";
import { ReportDataTable } from "./ReportDataTable";
import { ReportPreviewChart } from "./ReportPreviewChart";
import { ReportExportPanel, ExportFormat } from "./ReportExportPanel";

interface ReportsPageProps {
  members: MemberWithMetrics[];
  teams: OrgTeam[];
  orgName: string;
}

type ReportType =
  | "engagement"
  | "team-performance"
  | "member-ranking"
  | "activity-log"
  | "competency"
  | "game-stats";

interface ReportDefinition {
  id: ReportType;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  category: string;
}

export function ReportsPage({ members, teams, orgName }: ReportsPageProps) {
  const [selectedReport, setSelectedReport] = useState<ReportType>("engagement");
  const [isExporting, setIsExporting] = useState(false);

  const reports: ReportDefinition[] = [
    {
      id: "engagement",
      title: "Relatório de Engajamento",
      description: "Métricas de DAU, WAU, MAU e taxa de atividade por período",
      icon: TrendingUp,
      category: "Engajamento",
    },
    {
      id: "team-performance",
      title: "Performance por Equipe",
      description: "Comparativo de XP, streaks e atividades entre equipes",
      icon: Users,
      category: "Equipes",
    },
    {
      id: "member-ranking",
      title: "Ranking de Membros",
      description: "Classificação dos membros por XP, streak ou atividades",
      icon: Trophy,
      category: "Membros",
    },
    {
      id: "activity-log",
      title: "Log de Atividades",
      description: "Histórico detalhado de ações e interações dos membros",
      icon: Calendar,
      category: "Atividades",
    },
    {
      id: "competency",
      title: "Competências",
      description: "Avaliação de skills e progresso de competências",
      icon: Brain,
      category: "Aprendizado",
    },
    {
      id: "game-stats",
      title: "Estatísticas de Jogos",
      description: "Performance nos jogos e distribuição de pontuações",
      icon: Gamepad2,
      category: "Gamificação",
    },
  ];

  const selectedReportDef = reports.find((r) => r.id === selectedReport)!;

  // Generate report data based on selected report
  const reportData = useMemo(() => {
    const filterByTeam = (data: MemberWithMetrics[], teamId: string) => {
      if (teamId === "all") return data;
      if (teamId === "none") return data.filter((m) => !m.team_id);
      return data.filter((m) => m.team_id === teamId);
    };

    switch (selectedReport) {
      case "engagement": {
        const activeMembers = members.filter((m) => m.activities_week > 0);
        const totalXP = members.reduce((sum, m) => sum + m.total_xp, 0);
        const avgStreak =
          members.reduce((sum, m) => sum + m.current_streak, 0) /
          Math.max(members.length, 1);

        return {
          summary: {
            total_members: members.length,
            active_members: activeMembers.length,
            engagement_rate: ((activeMembers.length / Math.max(members.length, 1)) * 100).toFixed(1),
            total_xp: totalXP,
            avg_streak: avgStreak.toFixed(1),
            total_activities: members.reduce((sum, m) => sum + m.activities_week, 0),
          },
          chartData: [
            { name: "Ativos", value: activeMembers.length },
            { name: "Inativos", value: members.length - activeMembers.length },
          ],
          tableData: members.map((m) => ({
            nickname: m.nickname,
            team: m.team_name || "Sem equipe",
            status: m.activities_week > 0 ? "Ativo" : "Inativo",
            activities: m.activities_week,
            streak: m.current_streak,
          })),
        };
      }

      case "team-performance": {
        const teamData = teams.map((team) => {
          const teamMembers = members.filter((m) => m.team_id === team.id);
          const totalXP = teamMembers.reduce((sum, m) => sum + m.total_xp, 0);
          const avgStreak =
            teamMembers.reduce((sum, m) => sum + m.current_streak, 0) /
            Math.max(teamMembers.length, 1);
          return {
            name: team.name,
            members: teamMembers.length,
            total_xp: totalXP,
            avg_xp: Math.round(totalXP / Math.max(teamMembers.length, 1)),
            avg_streak: Number(avgStreak.toFixed(1)),
            activities: teamMembers.reduce((sum, m) => sum + m.activities_week, 0),
          };
        });

        // Add "Sem equipe" group
        const noTeamMembers = members.filter((m) => !m.team_id);
        if (noTeamMembers.length > 0) {
          const totalXP = noTeamMembers.reduce((sum, m) => sum + m.total_xp, 0);
          teamData.push({
            name: "Sem equipe",
            members: noTeamMembers.length,
            total_xp: totalXP,
            avg_xp: Math.round(totalXP / noTeamMembers.length),
            avg_streak: Number(
              (noTeamMembers.reduce((sum, m) => sum + m.current_streak, 0) /
                noTeamMembers.length).toFixed(1)
            ),
            activities: noTeamMembers.reduce((sum, m) => sum + m.activities_week, 0),
          });
        }

        return {
          chartData: teamData.map((t) => ({ name: t.name, value: t.total_xp })),
          tableData: teamData,
        };
      }

      case "member-ranking": {
        const ranked = [...members]
          .sort((a, b) => b.total_xp - a.total_xp)
          .map((m, i) => ({
            rank: i + 1,
            nickname: m.nickname,
            team: m.team_name || "Sem equipe",
            role: m.org_role,
            xp: m.total_xp,
            streak: m.current_streak,
            activities: m.activities_week,
            joined: format(new Date(m.joined_at), "dd/MM/yyyy"),
          }));

        return {
          chartData: ranked.slice(0, 10).map((m) => ({
            name: m.nickname.slice(0, 10),
            value: m.xp,
          })),
          tableData: ranked,
        };
      }

      case "activity-log": {
        const activityData = members.map((m) => ({
          nickname: m.nickname,
          team: m.team_name || "Sem equipe",
          activities_week: m.activities_week,
          streak: m.current_streak,
          status: m.activities_week > 0 ? "Ativo" : "Inativo",
          engagement:
            m.activities_week > 10
              ? "Alto"
              : m.activities_week > 5
              ? "Médio"
              : m.activities_week > 0
              ? "Baixo"
              : "Nenhum",
        }));

        const engagementDist = {
          Alto: activityData.filter((a) => a.engagement === "Alto").length,
          Médio: activityData.filter((a) => a.engagement === "Médio").length,
          Baixo: activityData.filter((a) => a.engagement === "Baixo").length,
          Nenhum: activityData.filter((a) => a.engagement === "Nenhum").length,
        };

        return {
          chartData: Object.entries(engagementDist).map(([name, value]) => ({
            name,
            value,
          })),
          tableData: activityData.sort((a, b) => b.activities_week - a.activities_week),
        };
      }

      case "competency": {
        // Simulated competency data based on XP distribution
        const xpTiers = [
          { name: "Expert (10k+)", min: 10000, max: Infinity },
          { name: "Avançado (5k-10k)", min: 5000, max: 10000 },
          { name: "Intermediário (1k-5k)", min: 1000, max: 5000 },
          { name: "Iniciante (0-1k)", min: 0, max: 1000 },
        ];

        const tierData = xpTiers.map((tier) => ({
          name: tier.name,
          value: members.filter(
            (m) => m.total_xp >= tier.min && m.total_xp < tier.max
          ).length,
        }));

        const tableData = members.map((m) => {
          const tier = xpTiers.find(
            (t) => m.total_xp >= t.min && m.total_xp < t.max
          );
          return {
            nickname: m.nickname,
            team: m.team_name || "Sem equipe",
            xp: m.total_xp,
            tier: tier?.name || "Iniciante",
            streak: m.current_streak,
            progress: Math.min(100, Math.round((m.total_xp / 10000) * 100)),
          };
        });

        return {
          chartData: tierData,
          tableData: tableData.sort((a, b) => b.xp - a.xp),
        };
      }

      case "game-stats": {
        // Game stats based on activities and streaks
        const gameData = members.map((m) => ({
          nickname: m.nickname,
          team: m.team_name || "Sem equipe",
          total_xp: m.total_xp,
          streak: m.current_streak,
          activities: m.activities_week,
          score_estimate: Math.round(m.total_xp * 0.1 + m.current_streak * 50),
        }));

        const streakDist = [
          { name: "0 dias", value: members.filter((m) => m.current_streak === 0).length },
          { name: "1-7 dias", value: members.filter((m) => m.current_streak >= 1 && m.current_streak <= 7).length },
          { name: "8-30 dias", value: members.filter((m) => m.current_streak >= 8 && m.current_streak <= 30).length },
          { name: "30+ dias", value: members.filter((m) => m.current_streak > 30).length },
        ];

        return {
          chartData: streakDist,
          tableData: gameData.sort((a, b) => b.score_estimate - a.score_estimate),
        };
      }

      default:
        return { chartData: [], tableData: [] };
    }
  }, [selectedReport, members, teams]);

  // Get columns for table based on report type
  const tableColumns = useMemo(() => {
    switch (selectedReport) {
      case "engagement":
        return [
          { key: "nickname", label: "Membro" },
          { key: "team", label: "Equipe" },
          { key: "status", label: "Status" },
          { key: "activities", label: "Atividades", align: "right" as const },
          { key: "streak", label: "Streak", align: "right" as const },
        ];

      case "team-performance":
        return [
          { key: "name", label: "Equipe" },
          { key: "members", label: "Membros", align: "right" as const },
          {
            key: "total_xp",
            label: "XP Total",
            align: "right" as const,
            format: (v: number) => v.toLocaleString("pt-BR"),
          },
          {
            key: "avg_xp",
            label: "XP Médio",
            align: "right" as const,
            format: (v: number) => v.toLocaleString("pt-BR"),
          },
          { key: "avg_streak", label: "Streak Médio", align: "right" as const },
          { key: "activities", label: "Atividades", align: "right" as const },
        ];

      case "member-ranking":
        return [
          { key: "rank", label: "#", align: "center" as const },
          { key: "nickname", label: "Membro" },
          { key: "team", label: "Equipe" },
          { key: "role", label: "Cargo" },
          {
            key: "xp",
            label: "XP",
            align: "right" as const,
            format: (v: number) => v.toLocaleString("pt-BR"),
          },
          { key: "streak", label: "Streak", align: "right" as const },
          { key: "joined", label: "Entrou em" },
        ];

      case "activity-log":
        return [
          { key: "nickname", label: "Membro" },
          { key: "team", label: "Equipe" },
          { key: "activities_week", label: "Atividades", align: "right" as const },
          { key: "streak", label: "Streak", align: "right" as const },
          { key: "engagement", label: "Engajamento" },
          { key: "status", label: "Status" },
        ];

      case "competency":
        return [
          { key: "nickname", label: "Membro" },
          { key: "team", label: "Equipe" },
          { key: "tier", label: "Nível" },
          {
            key: "xp",
            label: "XP",
            align: "right" as const,
            format: (v: number) => v.toLocaleString("pt-BR"),
          },
          { key: "streak", label: "Streak", align: "right" as const },
          {
            key: "progress",
            label: "Progresso",
            align: "right" as const,
            format: (v: number) => `${v}%`,
          },
        ];

      case "game-stats":
        return [
          { key: "nickname", label: "Membro" },
          { key: "team", label: "Equipe" },
          {
            key: "total_xp",
            label: "XP Total",
            align: "right" as const,
            format: (v: number) => v.toLocaleString("pt-BR"),
          },
          { key: "streak", label: "Streak", align: "right" as const },
          { key: "activities", label: "Atividades", align: "right" as const },
          {
            key: "score_estimate",
            label: "Score",
            align: "right" as const,
            format: (v: number) => v.toLocaleString("pt-BR"),
          },
        ];

      default:
        return [];
    }
  }, [selectedReport]);

  // Export handler
  const handleExport = async (config: {
    format: ExportFormat;
    teamFilter: string;
    period: string;
  }) => {
    setIsExporting(true);

    try {
      const timestamp = new Date().toISOString().split("T")[0];
      let filteredMembers = [...members];

      if (config.teamFilter !== "all") {
        if (config.teamFilter === "none") {
          filteredMembers = members.filter((m) => !m.team_id);
        } else {
          filteredMembers = members.filter((m) => m.team_id === config.teamFilter);
        }
      }

      const filename = `${selectedReport}_${orgName.replace(/\s+/g, "_")}_${timestamp}`;
      const data = reportData.tableData;

      if (config.format === "csv") {
        const headers = tableColumns.map((c) => c.label);
        const keys = tableColumns.map((c) => c.key);
        const csvRows = [headers.join(",")];

        data.forEach((row: Record<string, any>) => {
          const values = keys.map((key) => {
            const value = row[key] ?? "";
            return typeof value === "string" && value.includes(",")
              ? `"${value}"`
              : value;
          });
          csvRows.push(values.join(","));
        });

        downloadFile(csvRows.join("\n"), `${filename}.csv`, "text/csv;charset=utf-8");
      } else {
        downloadFile(
          JSON.stringify({ report: selectedReport, data, generated_at: timestamp }, null, 2),
          `${filename}.json`,
          "application/json"
        );
      }

      toast.success("Relatório exportado com sucesso!");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Erro ao exportar relatório");
    } finally {
      setIsExporting(false);
    }
  };

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const chartType =
    selectedReport === "team-performance" || selectedReport === "member-ranking"
      ? "bar"
      : selectedReport === "engagement" ||
        selectedReport === "activity-log" ||
        selectedReport === "competency" ||
        selectedReport === "game-stats"
      ? "pie"
      : "area";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Relatórios
          </h2>
          <p className="text-sm text-muted-foreground">
            Gere e exporte relatórios detalhados da organização
          </p>
        </div>
      </div>

      {/* Report Selection Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {reports.map((report) => (
          <ReportCard
            key={report.id}
            id={report.id}
            title={report.title}
            description={report.description}
            icon={report.icon}
            category={report.category}
            isSelected={selectedReport === report.id}
            onClick={() => setSelectedReport(report.id)}
          />
        ))}
      </div>

      {/* Export Panel */}
      <ReportExportPanel
        reportTitle={selectedReportDef.title}
        teams={teams}
        onExport={handleExport}
        isExporting={isExporting}
      />

      {/* Report Preview */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedReport}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="space-y-4"
        >
          <Tabs defaultValue="chart" className="w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Prévia: {selectedReportDef.title}</h3>
              <TabsList>
                <TabsTrigger value="chart" className="gap-1">
                  <PieChart className="h-4 w-4" />
                  Gráfico
                </TabsTrigger>
                <TabsTrigger value="table" className="gap-1">
                  <Activity className="h-4 w-4" />
                  Tabela
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="chart" className="mt-0">
              <div className="rounded-xl border bg-card p-6">
                <ReportPreviewChart
                  type={chartType}
                  data={reportData.chartData}
                />
              </div>
            </TabsContent>

            <TabsContent value="table" className="mt-0">
              <div className="rounded-xl border bg-card p-6">
                <ReportDataTable
                  columns={tableColumns}
                  data={reportData.tableData}
                  maxRows={15}
                />
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </AnimatePresence>

      {/* Summary Stats */}
      {selectedReport === "engagement" && reportData.summary && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Object.entries(reportData.summary).map(([key, value]) => (
            <div key={key} className="rounded-lg border bg-card p-4 text-center">
              <p className="text-2xl font-bold text-primary">
                {typeof value === "number" ? value.toLocaleString("pt-BR") : value}
                {key === "engagement_rate" && "%"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {key === "total_members" && "Total de Membros"}
                {key === "active_members" && "Membros Ativos"}
                {key === "engagement_rate" && "Taxa de Engajamento"}
                {key === "total_xp" && "XP Total"}
                {key === "avg_streak" && "Streak Médio"}
                {key === "total_activities" && "Atividades (7d)"}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
