/**
 * Componente de métricas de aprendizado e evolução
 */

import { Zap, Coins, GraduationCap, TrendingUp, Gamepad2 } from "lucide-react";
import { MetricCard } from "./MetricCard";
import { LearningMetrics as LearningMetricsType } from "@/hooks/useOrgMetrics";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";

interface Props {
  metrics: LearningMetricsType | null;
  isLoading: boolean;
}

export function LearningMetrics({ metrics, isLoading }: Props) {
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
        <GraduationCap className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
        <p className="text-muted-foreground">
          Sem dados de aprendizado disponíveis
        </p>
      </div>
    );
  }

  const sourceColors = [
    "hsl(var(--primary))",
    "hsl(var(--secondary))",
    "hsl(var(--accent))",
    "hsl(142 76% 36%)",
    "hsl(38 92% 50%)",
  ];

  const sourceLabels: Record<string, string> = {
    quiz: "Quiz",
    decision_game: "Decisões",
    challenge: "Desafios",
    streak: "Streak",
    trail: "Trilhas",
    sales_game: "Vendas",
  };

  const chartData = (metrics.top_sources || []).map((s, i) => ({
    name: sourceLabels[s.source] || s.source,
    xp: s.total_xp,
    count: s.count,
    color: sourceColors[i % sourceColors.length],
  }));

  return (
    <div className="space-y-6">
      {/* Cards principais */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          icon={Zap}
          label="XP Total Acumulado"
          value={metrics.total_xp.toLocaleString()}
          subValue="no período selecionado"
          color="primary"
        />
        <MetricCard
          icon={TrendingUp}
          label="XP Médio por Usuário"
          value={metrics.avg_xp_per_user.toLocaleString()}
          color="secondary"
        />
        <MetricCard
          icon={Coins}
          label="Moedas Ganhas"
          value={metrics.total_coins.toLocaleString()}
          color="warning"
        />
        <MetricCard
          icon={GraduationCap}
          label="Aprendizes Ativos"
          value={metrics.active_learners}
          subValue="usuários com XP no período"
          color="success"
        />
      </div>

      {/* Gráfico de fontes de XP */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h4 className="font-semibold text-foreground mb-4">
          Fontes de XP
        </h4>
        {chartData.length > 0 ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical">
                <XAxis
                  type="number"
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  axisLine={{ stroke: "hsl(var(--border))" }}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  axisLine={{ stroke: "hsl(var(--border))" }}
                  width={80}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                  formatter={(value: number, name: string) => [
                    `${value.toLocaleString()} XP`,
                    "Total",
                  ]}
                />
                <Bar dataKey="xp" radius={[0, 4, 4, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="text-center py-8">
            <Gamepad2 className="w-10 h-10 mx-auto mb-2 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">
              Nenhuma atividade registrada ainda
            </p>
          </div>
        )}
      </div>

      {/* Detalhes por fonte */}
      {chartData.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-6">
          <h4 className="font-semibold text-foreground mb-4">
            Detalhamento por Atividade
          </h4>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {chartData.map((source, i) => (
              <div
                key={source.name}
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/30"
              >
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: source.color }}
                />
                <div className="flex-1">
                  <p className="font-medium text-foreground">{source.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {source.xp.toLocaleString()} XP • {source.count} atividades
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
