/**
 * Aba de Relatórios com Exportação
 */

import { useState } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Download,
  Calendar,
  Users,
  TrendingUp,
  Trophy,
  Loader2,
  FileSpreadsheet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import type { MemberWithMetrics } from "@/hooks/useOrgMetrics";
import type { OrgTeam } from "@/hooks/useOrgTeams";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ReportsPageProps {
  members: MemberWithMetrics[];
  teams: OrgTeam[];
  orgName: string;
}

type ReportType = "engagement" | "team-performance" | "member-ranking" | "activity-log";
type ExportFormat = "csv" | "json";

export function ReportsPage({ members, teams, orgName }: ReportsPageProps) {
  const [selectedReport, setSelectedReport] = useState<ReportType>("engagement");
  const [teamFilter, setTeamFilter] = useState<string>("all");
  const [isExporting, setIsExporting] = useState(false);

  const reports = [
    {
      id: "engagement" as const,
      title: "Relatório de Engajamento",
      description: "Métricas de DAU, WAU, MAU e atividades por período",
      icon: TrendingUp,
    },
    {
      id: "team-performance" as const,
      title: "Performance por Equipe",
      description: "Comparativo de XP, streaks e atividades entre equipes",
      icon: Users,
    },
    {
      id: "member-ranking" as const,
      title: "Ranking de Membros",
      description: "Lista ordenada por XP, streak ou atividades",
      icon: Trophy,
    },
    {
      id: "activity-log" as const,
      title: "Log de Atividades",
      description: "Histórico de ações dos membros",
      icon: Calendar,
    },
  ];

  const generateCSV = (data: any[], headers: string[]) => {
    const csvRows = [headers.join(",")];
    
    data.forEach((row) => {
      const values = headers.map((header) => {
        const value = row[header.toLowerCase().replace(/ /g, "_")] ?? "";
        return typeof value === "string" && value.includes(",")
          ? `"${value}"`
          : value;
      });
      csvRows.push(values.join(","));
    });

    return csvRows.join("\n");
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

  const exportReport = async (exportFormat: ExportFormat) => {
    setIsExporting(true);
    
    try {
      const timestamp = exportFormat === "csv"
        ? new Date().toISOString().split("T")[0]
        : new Date().toISOString();

      let filteredMembers = [...members];
      if (teamFilter !== "all") {
        if (teamFilter === "none") {
          filteredMembers = members.filter((m) => !m.team_id);
        } else {
          filteredMembers = members.filter((m) => m.team_id === teamFilter);
        }
      }

      let data: any;
      let filename: string;
      let headers: string[] = [];
      switch (selectedReport) {
        case "engagement":
          data = {
            report_type: "Engajamento",
            organization: orgName,
            generated_at: timestamp,
            total_members: filteredMembers.length,
            active_members: filteredMembers.filter((m) => m.activities_week > 0).length,
            total_xp: filteredMembers.reduce((sum, m) => sum + m.total_xp, 0),
            avg_streak: (
              filteredMembers.reduce((sum, m) => sum + m.current_streak, 0) /
              Math.max(filteredMembers.length, 1)
            ).toFixed(1),
            total_activities_week: filteredMembers.reduce(
              (sum, m) => sum + m.activities_week,
              0
            ),
          };
          filename = `engajamento_${timestamp}`;
          break;

        case "team-performance":
          data = teams.map((team) => {
            const teamMembers = filteredMembers.filter((m) => m.team_id === team.id);
            return {
              team_name: team.name,
              members_count: teamMembers.length,
              total_xp: teamMembers.reduce((sum, m) => sum + m.total_xp, 0),
              avg_xp: Math.round(
                teamMembers.reduce((sum, m) => sum + m.total_xp, 0) /
                  Math.max(teamMembers.length, 1)
              ),
              avg_streak: (
                teamMembers.reduce((sum, m) => sum + m.current_streak, 0) /
                Math.max(teamMembers.length, 1)
              ).toFixed(1),
              activities_week: teamMembers.reduce((sum, m) => sum + m.activities_week, 0),
            };
          });
          headers = ["Team_Name", "Members_Count", "Total_XP", "Avg_XP", "Avg_Streak", "Activities_Week"];
          filename = `performance_equipes_${timestamp}`;
          break;

        case "member-ranking":
          data = filteredMembers
            .sort((a, b) => b.total_xp - a.total_xp)
            .map((m, index) => ({
              rank: index + 1,
              nickname: m.nickname,
              team_name: m.team_name || "Sem equipe",
              role: m.org_role,
              total_xp: m.total_xp,
              current_streak: m.current_streak,
              activities_week: m.activities_week,
              joined_at: format(new Date(m.joined_at), "dd/MM/yyyy"),
            }));
          headers = ["Rank", "Nickname", "Team_Name", "Role", "Total_XP", "Current_Streak", "Activities_Week", "Joined_At"];
          filename = `ranking_membros_${timestamp}`;
          break;

        case "activity-log":
          data = filteredMembers.map((m) => ({
            nickname: m.nickname,
            team_name: m.team_name || "Sem equipe",
            activities_week: m.activities_week,
            current_streak: m.current_streak,
            last_activity: m.activities_week > 0 ? "Ativo" : "Inativo",
          }));
          headers = ["Nickname", "Team_Name", "Activities_Week", "Current_Streak", "Last_Activity"];
          filename = `atividades_${timestamp}`;
          break;
      }

      if (exportFormat === "csv") {
        let csvContent: string;
        if (Array.isArray(data)) {
          csvContent = generateCSV(data, headers);
        } else {
          csvContent = Object.entries(data)
            .map(([key, value]) => `${key},${value}`)
            .join("\n");
        }
        downloadFile(csvContent, `${filename}.csv`, "text/csv;charset=utf-8");
      } else {
        downloadFile(
          JSON.stringify(data, null, 2),
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold">Relatórios</h2>
        <p className="text-sm text-muted-foreground">
          Gere e exporte relatórios da sua organização
        </p>
      </div>

      {/* Filtro de Equipe */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">Filtrar por equipe:</span>
        <Select value={teamFilter} onValueChange={setTeamFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Todas as equipes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as equipes</SelectItem>
            <SelectItem value="none">Sem equipe</SelectItem>
            {teams.map((team) => (
              <SelectItem key={team.id} value={team.id}>
                {team.icon} {team.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Lista de Relatórios */}
      <div className="grid sm:grid-cols-2 gap-4">
        {reports.map((report) => {
          const Icon = report.icon;
          const isSelected = selectedReport === report.id;

          return (
            <motion.div
              key={report.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card
                className={`cursor-pointer transition-all ${
                  isSelected
                    ? "border-primary ring-2 ring-primary/20"
                    : "hover:border-muted-foreground/30"
                }`}
                onClick={() => setSelectedReport(report.id)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg ${
                        isSelected ? "bg-primary/10" : "bg-muted"
                      }`}
                    >
                      <Icon
                        className={`h-5 w-5 ${
                          isSelected ? "text-primary" : "text-muted-foreground"
                        }`}
                      />
                    </div>
                    <CardTitle className="text-base">{report.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>{report.description}</CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Ações de Exportação */}
      <div className="rounded-xl border bg-card p-6">
        <h3 className="font-semibold mb-4">
          Exportar: {reports.find((r) => r.id === selectedReport)?.title}
        </h3>
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={() => exportReport("csv")}
            disabled={isExporting}
            className="gap-2"
          >
            {isExporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileSpreadsheet className="h-4 w-4" />
            )}
            Exportar CSV
          </Button>
          <Button
            variant="outline"
            onClick={() => exportReport("json")}
            disabled={isExporting}
            className="gap-2"
          >
            {isExporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileText className="h-4 w-4" />
            )}
            Exportar JSON
          </Button>
        </div>

        <p className="mt-4 text-xs text-muted-foreground">
          Os relatórios são gerados com base nos dados atuais.
          {teamFilter !== "all" && (
            <>
              {" "}
              Filtro ativo:{" "}
              <span className="font-medium">
                {teamFilter === "none"
                  ? "Sem equipe"
                  : teams.find((t) => t.id === teamFilter)?.name}
              </span>
            </>
          )}
        </p>
      </div>

      {/* Preview dos Dados */}
      <div className="rounded-xl border bg-card p-6">
        <h3 className="font-semibold mb-4">Prévia dos Dados</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-3">Membro</th>
                <th className="text-left py-2 px-3">Equipe</th>
                <th className="text-right py-2 px-3">XP</th>
                <th className="text-right py-2 px-3">Streak</th>
                <th className="text-right py-2 px-3">Atividades</th>
              </tr>
            </thead>
            <tbody>
              {members
                .filter((m) =>
                  teamFilter === "all"
                    ? true
                    : teamFilter === "none"
                    ? !m.team_id
                    : m.team_id === teamFilter
                )
                .slice(0, 5)
                .map((m) => (
                  <tr key={m.user_id} className="border-b border-dashed">
                    <td className="py-2 px-3">{m.nickname}</td>
                    <td className="py-2 px-3 text-muted-foreground">
                      {m.team_name || "-"}
                    </td>
                    <td className="py-2 px-3 text-right font-medium">
                      {m.total_xp.toLocaleString("pt-BR")}
                    </td>
                    <td className="py-2 px-3 text-right">{m.current_streak}</td>
                    <td className="py-2 px-3 text-right">{m.activities_week}</td>
                  </tr>
                ))}
            </tbody>
          </table>
          {members.length > 5 && (
            <p className="text-xs text-muted-foreground mt-2">
              ...e mais {members.length - 5} membros
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
