/**
 * Componente de métricas de engajamento (DAU/WAU/MAU)
 */

import { Users, Activity, Flame, TrendingUp, Calendar } from "lucide-react";
import { MetricCard } from "./MetricCard";
import { EngagementMetrics as EngagementMetricsType } from "@/hooks/useOrgMetrics";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

interface Props {
  metrics: EngagementMetricsType | null;
  isLoading: boolean;
}

export function EngagementMetrics({ metrics, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-32 rounded-xl bg-muted/50 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="text-center py-12">
        <Activity className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
        <p className="text-muted-foreground">
          Sem dados de engajamento disponíveis
        </p>
      </div>
    );
  }

  const participationRate =
    metrics.total_members > 0
      ? Math.round((metrics.mau / metrics.total_members) * 100)
      : 0;

  // Dados simulados para o gráfico (em produção viriam da API)
  const chartData = [
    { name: "Seg", dau: Math.round(metrics.dau * 0.8) },
    { name: "Ter", dau: Math.round(metrics.dau * 0.9) },
    { name: "Qua", dau: Math.round(metrics.dau * 1.1) },
    { name: "Qui", dau: Math.round(metrics.dau * 0.95) },
    { name: "Sex", dau: Math.round(metrics.dau * 1.2) },
    { name: "Sáb", dau: Math.round(metrics.dau * 0.4) },
    { name: "Dom", dau: Math.round(metrics.dau * 0.3) },
  ];

  return (
    <div className="space-y-6">
      {/* Cards principais */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          icon={Users}
          label="Usuários Ativos Diários (DAU)"
          value={metrics.dau}
          subValue={`de ${metrics.total_members} membros`}
          color="primary"
        />
        <MetricCard
          icon={Calendar}
          label="Usuários Ativos Semanais (WAU)"
          value={metrics.wau}
          subValue={`${Math.round((metrics.wau / Math.max(metrics.total_members, 1)) * 100)}% do total`}
          color="secondary"
        />
        <MetricCard
          icon={TrendingUp}
          label="Usuários Ativos Mensais (MAU)"
          value={metrics.mau}
          subValue={`${participationRate}% de participação`}
          color="accent"
        />
        <MetricCard
          icon={Flame}
          label="Streak Médio"
          value={`${metrics.avg_streak} dias`}
          subValue={`${metrics.total_activities} atividades no período`}
          color="warning"
        />
      </div>

      {/* Gráfico de atividade */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h4 className="font-semibold text-foreground mb-4">
          Atividade Semanal
        </h4>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorDau" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey="name"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                axisLine={{ stroke: "hsl(var(--border))" }}
              />
              <YAxis
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                axisLine={{ stroke: "hsl(var(--border))" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "hsl(var(--foreground))" }}
              />
              <Area
                type="monotone"
                dataKey="dau"
                stroke="hsl(var(--primary))"
                fillOpacity={1}
                fill="url(#colorDau)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Taxa de engajamento */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-card p-6">
          <h4 className="font-semibold text-foreground mb-2">
            Taxa de Participação
          </h4>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-bold text-primary">
              {participationRate}%
            </span>
            <span className="text-muted-foreground mb-1">dos membros ativos</span>
          </div>
          <div className="mt-4 h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${participationRate}%` }}
            />
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <h4 className="font-semibold text-foreground mb-2">
            Frequência de Uso
          </h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Diário</span>
              <span className="font-medium text-foreground">{metrics.dau} usuários</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Semanal</span>
              <span className="font-medium text-foreground">{metrics.wau} usuários</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Mensal</span>
              <span className="font-medium text-foreground">{metrics.mau} usuários</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
