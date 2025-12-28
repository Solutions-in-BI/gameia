/**
 * Componente de métricas de competência
 */

import { Target, TrendingUp, TrendingDown, Users, Award } from "lucide-react";
import { MetricCard } from "./MetricCard";
import { CompetencyMetrics as CompetencyMetricsType } from "@/hooks/useOrgMetrics";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";

interface Props {
  metrics: CompetencyMetricsType | null;
  isLoading: boolean;
}

export function CompetencyMetrics({ metrics, isLoading }: Props) {
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
        <Target className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
        <p className="text-muted-foreground">
          Sem dados de competência disponíveis
        </p>
      </div>
    );
  }

  const radarData = (metrics.by_skill || []).map((skill) => ({
    skill: skill.skill_name,
    score: skill.avg_score,
    fullMark: 100,
  }));

  return (
    <div className="space-y-6">
      {/* Cards principais */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          icon={Award}
          label="Total de Avaliações"
          value={metrics.total_assessments}
          color="primary"
        />
        <MetricCard
          icon={Target}
          label="Score Médio"
          value={`${metrics.avg_score}%`}
          color="secondary"
        />
        <MetricCard
          icon={TrendingUp}
          label="Em Evolução"
          value={metrics.improving_users}
          subValue="colaboradores melhorando"
          color="success"
        />
        <MetricCard
          icon={TrendingDown}
          label="Em Declínio"
          value={metrics.declining_users}
          subValue="precisam de atenção"
          color="destructive"
        />
      </div>

      {/* Mapa de competências */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Radar Chart */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h4 className="font-semibold text-foreground mb-4">
            Mapa de Competências
          </h4>
          {radarData.length > 0 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis
                    dataKey="skill"
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                  />
                  <PolarRadiusAxis
                    angle={30}
                    domain={[0, 100]}
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                  />
                  <Radar
                    name="Score"
                    dataKey="score"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary))"
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-80 flex items-center justify-center">
              <div className="text-center">
                <Target className="w-10 h-10 mx-auto mb-2 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">
                  Nenhuma skill avaliada ainda
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Lista de skills */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h4 className="font-semibold text-foreground mb-4">
            Competências por Score
          </h4>
          <div className="space-y-3">
            {(metrics.by_skill || []).length > 0 ? (
              metrics.by_skill.map((skill) => (
                <div key={skill.skill_name} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{skill.icon}</span>
                      <span className="font-medium text-foreground text-sm">
                        {skill.skill_name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {skill.users_count} usuários
                      </span>
                      <span className="font-semibold text-foreground">
                        {skill.avg_score}%
                      </span>
                    </div>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${skill.avg_score}%`,
                        backgroundColor:
                          skill.avg_score >= 70
                            ? "hsl(142 76% 36%)"
                            : skill.avg_score >= 40
                            ? "hsl(38 92% 50%)"
                            : "hsl(0 84% 60%)",
                      }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Users className="w-10 h-10 mx-auto mb-2 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">
                  Nenhum usuário avaliado ainda
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Indicadores de risco/oportunidade */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="rounded-xl border border-green-500/30 bg-green-500/5 p-6">
          <div className="flex items-center gap-3 mb-3">
            <TrendingUp className="w-5 h-5 text-green-500" />
            <h4 className="font-semibold text-foreground">
              Talentos em Destaque
            </h4>
          </div>
          <p className="text-3xl font-bold text-green-500">
            {metrics.improving_users}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            colaboradores com tendência de melhora consistente
          </p>
        </div>

        <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-6">
          <div className="flex items-center gap-3 mb-3">
            <TrendingDown className="w-5 h-5 text-red-500" />
            <h4 className="font-semibold text-foreground">
              Atenção Necessária
            </h4>
          </div>
          <p className="text-3xl font-bold text-red-500">
            {metrics.declining_users}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            colaboradores que podem precisar de suporte adicional
          </p>
        </div>
      </div>
    </div>
  );
}
