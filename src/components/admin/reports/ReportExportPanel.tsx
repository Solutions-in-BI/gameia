/**
 * Painel de exportação de relatórios
 */

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Download,
  FileSpreadsheet,
  FileText,
  FileJson,
  Loader2,
  CheckCircle2,
  Calendar,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import type { OrgTeam } from "@/hooks/useOrgTeams";

export type ExportFormat = "csv" | "json" | "xlsx";

interface ExportConfig {
  format: ExportFormat;
  teamFilter: string;
  period: string;
  includeCharts: boolean;
}

interface ReportExportPanelProps {
  reportTitle: string;
  teams: OrgTeam[];
  onExport: (config: ExportConfig) => Promise<void>;
  isExporting: boolean;
}

export function ReportExportPanel({
  reportTitle,
  teams,
  onExport,
  isExporting,
}: ReportExportPanelProps) {
  const [format, setFormat] = useState<ExportFormat>("csv");
  const [teamFilter, setTeamFilter] = useState("all");
  const [period, setPeriod] = useState("30d");
  const [includeCharts, setIncludeCharts] = useState(false);
  const [lastExport, setLastExport] = useState<string | null>(null);

  const handleExport = async () => {
    await onExport({ format, teamFilter, period, includeCharts });
    setLastExport(new Date().toLocaleTimeString("pt-BR"));
  };

  const formatOptions = [
    { value: "csv", label: "CSV", icon: FileSpreadsheet, desc: "Planilhas" },
    { value: "json", label: "JSON", icon: FileJson, desc: "Dados estruturados" },
  ];

  const periodOptions = [
    { value: "7d", label: "Últimos 7 dias" },
    { value: "30d", label: "Últimos 30 dias" },
    { value: "90d", label: "Últimos 90 dias" },
    { value: "all", label: "Todo o período" },
  ];

  return (
    <div className="rounded-xl border bg-card p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold flex items-center gap-2">
            <Download className="h-5 w-5 text-primary" />
            Exportar Relatório
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {reportTitle}
          </p>
        </div>
        {lastExport && (
          <Badge variant="secondary" className="gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Último: {lastExport}
          </Badge>
        )}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Formato */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground flex items-center gap-1">
            <FileText className="h-3 w-3" />
            Formato
          </Label>
          <div className="flex gap-2">
            {formatOptions.map((opt) => {
              const Icon = opt.icon;
              const isSelected = format === opt.value;
              return (
                <Button
                  key={opt.value}
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  className="flex-1 gap-1"
                  onClick={() => setFormat(opt.value as ExportFormat)}
                >
                  <Icon className="h-4 w-4" />
                  {opt.label}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Período */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            Período
          </Label>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {periodOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Filtro de Equipe */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground flex items-center gap-1">
            <Filter className="h-3 w-3" />
            Equipe
          </Label>
          <Select value={teamFilter} onValueChange={setTeamFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Todas" />
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

        {/* Ação */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground invisible">Ação</Label>
          <Button
            onClick={handleExport}
            disabled={isExporting}
            className="w-full gap-2"
          >
            {isExporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            {isExporting ? "Exportando..." : "Exportar Agora"}
          </Button>
        </div>
      </div>

      {/* Filtros ativos */}
      <div className="flex flex-wrap gap-2 pt-2 border-t">
        <span className="text-xs text-muted-foreground">Filtros ativos:</span>
        <Badge variant="outline" className="text-xs">
          {periodOptions.find((p) => p.value === period)?.label}
        </Badge>
        <Badge variant="outline" className="text-xs">
          {teamFilter === "all"
            ? "Todas as equipes"
            : teamFilter === "none"
            ? "Sem equipe"
            : teams.find((t) => t.id === teamFilter)?.name}
        </Badge>
        <Badge variant="outline" className="text-xs uppercase">
          {format}
        </Badge>
      </div>
    </div>
  );
}
