/**
 * Componente de métricas de decisão e raciocínio
 */

import { Brain, Clock, Target, CheckCircle, Lightbulb } from "lucide-react";
import { MetricCard } from "./MetricCard";
import { DecisionMetrics as DecisionMetricsType } from "@/hooks/useOrgMetrics";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

interface Props {
  metrics: DecisionMetricsType | null;
  isLoading: boolean;
}

export function DecisionMetrics({ metrics, isLoading }: Props) {
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
        <Brain className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
        <p className="text-muted-foreground">
          Sem dados de decisão disponíveis
        </p>
      </div>
    );
  }

  const depthLabels: Record<string, string> = {
    shallow: "Superficial",
    moderate: "Moderado",
    deep: "Profundo",
  };

  const depthColors: Record<string, string> = {
    shallow: "hsl(38 92% 50%)",
    moderate: "hsl(var(--primary))",
    deep: "hsl(142 76% 36%)",
  };

  const pieData = (metrics.by_depth || []).map((d) => ({
    name: depthLabels[d.reasoning_depth] || d.reasoning_depth,
    value: d.count,
    color: depthColors[d.reasoning_depth] || "hsl(var(--muted))",
  }));

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    const mins = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="space-y-6">
      {/* Cards principais */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          icon={Brain}
          label="Total de Decisões"
          value={metrics.total_decisions}
          subValue="cenários analisados"
          color="primary"
        />
        <MetricCard
          icon={Target}
          label="Qualidade Média"
          value={`${metrics.avg_quality_score}%`}
          color="secondary"
        />
        <MetricCard
          icon={Clock}
          label="Tempo Médio"
          value={formatTime(metrics.avg_response_time)}
          subValue="por decisão"
          color="accent"
        />
        <MetricCard
          icon={CheckCircle}
          label="Taxa de Acerto"
          value={`${metrics.optimal_rate}%`}
          subValue="decisões ótimas"
          color="success"
        />
      </div>

      {/* Gráficos */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Profundidade de raciocínio */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h4 className="font-semibold text-foreground mb-4">
            Profundidade de Raciocínio
          </h4>
          {pieData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) => [`${value} decisões`, ""]}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center">
              <div className="text-center">
                <Lightbulb className="w-10 h-10 mx-auto mb-2 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">
                  Nenhum dado de raciocínio ainda
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Indicadores de performance */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h4 className="font-semibold text-foreground mb-4">
            Indicadores de Performance
          </h4>
          <div className="space-y-6">
            {/* Qualidade */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">
                  Qualidade das Decisões
                </span>
                <span className="font-semibold text-foreground">
                  {metrics.avg_quality_score}%
                </span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${metrics.avg_quality_score}%`,
                    backgroundColor:
                      metrics.avg_quality_score >= 70
                        ? "hsl(142 76% 36%)"
                        : metrics.avg_quality_score >= 40
                        ? "hsl(38 92% 50%)"
                        : "hsl(0 84% 60%)",
                  }}
                />
              </div>
            </div>

            {/* Taxa de acerto */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">
                  Decisões Ótimas
                </span>
                <span className="font-semibold text-foreground">
                  {metrics.optimal_rate}%
                </span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${metrics.optimal_rate}%` }}
                />
              </div>
            </div>

            {/* Velocidade */}
            <div className="pt-4 border-t border-border">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-medium text-foreground">
                    {formatTime(metrics.avg_response_time)} em média
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Tempo médio para tomar decisões
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="rounded-xl border border-primary/30 bg-primary/5 p-6">
        <div className="flex items-start gap-3">
          <Lightbulb className="w-5 h-5 text-primary mt-0.5" />
          <div>
            <h4 className="font-semibold text-foreground mb-2">
              Insights de Decisão
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                • {metrics.optimal_rate >= 70
                  ? "Excelente taxa de decisões ótimas! A equipe está demonstrando boa capacidade analítica."
                  : "Há espaço para melhorar a taxa de decisões ótimas. Considere treinamentos focados em análise."}
              </li>
              <li>
                • {metrics.avg_response_time <= 120
                  ? "Tempo de resposta rápido indica boa familiaridade com cenários."
                  : "Decisões mais demoradas podem indicar cenários complexos ou necessidade de mais prática."}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
