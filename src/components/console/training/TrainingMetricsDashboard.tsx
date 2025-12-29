/**
 * TrainingMetricsDashboard - Dashboard de métricas de treinamentos
 * Para visualização no Console e Manage
 */

import { useState } from "react";
import { motion } from "framer-motion";
import {
  GraduationCap,
  Users,
  Clock,
  TrendingUp,
  Target,
  Award,
  BarChart3,
  PieChart,
  Calendar,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTrainings } from "@/hooks/useTrainings";
import { useOrgTrainingConfig } from "@/hooks/useOrgTrainingConfig";
import { useOrganization } from "@/hooks/useOrganization";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart as RechartsPie,
  Pie,
  Cell,
} from "recharts";

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ElementType;
  color: string;
  subtitle?: string;
}

function MetricCard({ title, value, change, icon: Icon, color, subtitle }: MetricCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>
          <div className={cn("p-2.5 rounded-xl", color)}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
        {change !== undefined && (
          <div className="flex items-center gap-1 mt-3 text-sm">
            {change >= 0 ? (
              <>
                <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                <span className="text-emerald-500">+{change}%</span>
              </>
            ) : (
              <>
                <ArrowDownRight className="w-4 h-4 text-red-500" />
                <span className="text-red-500">{change}%</span>
              </>
            )}
            <span className="text-muted-foreground ml-1">vs mês anterior</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

const CHART_COLORS = ["hsl(var(--primary))", "hsl(var(--secondary))", "#10b981", "#f59e0b", "#ef4444"];

export function TrainingMetricsDashboard() {
  const { currentOrg } = useOrganization();
  const { trainings, userProgress, isLoading: trainingsLoading } = useTrainings(currentOrg?.id);
  const { analytics, getTrainingMetrics, isLoading: configLoading } = useOrgTrainingConfig(currentOrg?.id);

  const [period, setPeriod] = useState<"7d" | "30d" | "90d">("30d");

  const isLoading = trainingsLoading || configLoading;

  // Calculate aggregate metrics
  const totalCompletions = analytics.filter((a) => a.event_type === "training_completed").length;
  const totalStarts = analytics.filter((a) => a.event_type === "training_started").length;
  const completionRate = totalStarts > 0 ? Math.round((totalCompletions / totalStarts) * 100) : 0;
  const uniqueUsers = new Set(analytics.map((a) => a.user_id)).size;
  const totalTimeMinutes = Math.round(
    analytics.reduce((acc, a) => acc + (a.time_spent_seconds || 0), 0) / 60
  );
  const avgScore = analytics
    .filter((a) => a.score !== null)
    .reduce((acc, a, _, arr) => acc + (a.score || 0) / arr.length, 0);

  // Prepare chart data
  const trainingCompletionData = trainings.slice(0, 6).map((t) => {
    const metrics = getTrainingMetrics(t.id);
    return {
      name: t.name.length > 15 ? t.name.slice(0, 15) + "..." : t.name,
      completions: metrics.completions,
      starts: metrics.starts,
      rate: metrics.completionRate,
    };
  });

  const categoryDistribution = trainings.reduce((acc, t) => {
    const cat = t.category || "Outros";
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const categoryData = Object.entries(categoryDistribution).map(([name, value]) => ({
    name,
    value,
  }));

  const difficultyData = [
    { name: "Iniciante", value: trainings.filter((t) => t.difficulty === "beginner").length },
    { name: "Intermediário", value: trainings.filter((t) => t.difficulty === "intermediate").length },
    { name: "Avançado", value: trainings.filter((t) => t.difficulty === "advanced").length },
    { name: "Expert", value: trainings.filter((t) => t.difficulty === "expert").length },
  ].filter((d) => d.value > 0);

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
            <BarChart3 className="w-6 h-6 text-primary" />
            Métricas de Treinamentos
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Análise de desempenho e engajamento
          </p>
        </div>
        <Select value={period} onValueChange={(v) => setPeriod(v as "7d" | "30d" | "90d")}>
          <SelectTrigger className="w-40">
            <Calendar className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Últimos 7 dias</SelectItem>
            <SelectItem value="30d">Últimos 30 dias</SelectItem>
            <SelectItem value="90d">Últimos 90 dias</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total de Conclusões"
          value={totalCompletions}
          change={12}
          icon={Award}
          color="bg-primary/10 text-primary"
        />
        <MetricCard
          title="Taxa de Conclusão"
          value={`${completionRate}%`}
          change={5}
          icon={Target}
          color="bg-emerald-500/10 text-emerald-500"
        />
        <MetricCard
          title="Usuários Ativos"
          value={uniqueUsers}
          change={8}
          icon={Users}
          color="bg-blue-500/10 text-blue-500"
        />
        <MetricCard
          title="Tempo Total"
          value={`${totalTimeMinutes}min`}
          subtitle={`Média: ${uniqueUsers > 0 ? Math.round(totalTimeMinutes / uniqueUsers) : 0}min/usuário`}
          icon={Clock}
          color="bg-amber-500/10 text-amber-500"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Completions by Training */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              Conclusões por Treinamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trainingCompletionData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={100}
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={11}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="completions" fill="hsl(var(--primary))" radius={4} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <PieChart className="w-4 h-4 text-primary" />
              Distribuição por Categoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center">
              <ResponsiveContainer width="50%" height="100%">
                <RechartsPie>
                  <Pie
                    data={categoryData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={false}
                  >
                    {categoryData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                </RechartsPie>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {categoryData.map((cat, idx) => (
                  <div key={cat.name} className="flex items-center gap-2 text-sm">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }}
                    />
                    <span className="text-muted-foreground">{cat.name}</span>
                    <span className="font-medium ml-auto">{cat.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Trainings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            Top Treinamentos por Engajamento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {trainings.slice(0, 5).map((training, idx) => {
              const metrics = getTrainingMetrics(training.id);
              return (
                <div
                  key={training.id}
                  className="flex items-center gap-4 p-3 rounded-xl border border-border hover:bg-muted/50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">
                    {idx + 1}
                  </div>
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                    style={{ backgroundColor: `${training.color}20` }}
                  >
                    {training.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{training.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {metrics.completions} conclusões • {metrics.completionRate}% taxa
                    </p>
                  </div>
                  <div className="w-24">
                    <Progress value={metrics.completionRate} className="h-2" />
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Difficulty Distribution */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {difficultyData.map((diff, idx) => (
          <Card key={diff.name}>
            <CardContent className="p-4 text-center">
              <Badge
                variant="outline"
                className={cn(
                  "mb-2",
                  idx === 0 && "border-emerald-500 text-emerald-500",
                  idx === 1 && "border-amber-500 text-amber-500",
                  idx === 2 && "border-orange-500 text-orange-500",
                  idx === 3 && "border-red-500 text-red-500"
                )}
              >
                {diff.name}
              </Badge>
              <p className="text-2xl font-bold">{diff.value}</p>
              <p className="text-xs text-muted-foreground">treinamentos</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
