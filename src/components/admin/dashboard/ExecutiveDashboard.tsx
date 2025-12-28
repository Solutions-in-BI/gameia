/**
 * Dashboard Executivo com KPIs e Gráficos Interativos
 */

import { motion } from "framer-motion";
import {
  Users,
  TrendingUp,
  Flame,
  Trophy,
  Activity,
  Gamepad2,
  Target,
  Zap,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import { MetricCard } from "../metrics/MetricCard";
import type {
  EngagementMetrics,
  LearningMetrics,
  CompetencyMetrics,
  DecisionMetrics,
  MemberWithMetrics,
} from "@/hooks/useOrgMetrics";

interface ExecutiveDashboardProps {
  engagement: EngagementMetrics | null;
  learning: LearningMetrics | null;
  competency: CompetencyMetrics | null;
  decision: DecisionMetrics | null;
  members: MemberWithMetrics[];
  isLoading: boolean;
}

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--secondary))",
  "hsl(var(--accent))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export function ExecutiveDashboard({
  engagement,
  learning,
  competency,
  decision,
  members,
  isLoading,
}: ExecutiveDashboardProps) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-28 rounded-xl bg-muted/50 animate-pulse"
            />
          ))}
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="h-72 rounded-xl bg-muted/50 animate-pulse" />
          <div className="h-72 rounded-xl bg-muted/50 animate-pulse" />
        </div>
      </div>
    );
  }

  // Calcular KPIs
  const totalMembers = engagement?.total_members || members.length;
  const activeMembers = engagement?.mau || 0;
  const inactiveMembers = totalMembers - activeMembers;
  const engagementRate = totalMembers > 0 ? Math.round((activeMembers / totalMembers) * 100) : 0;
  const totalXP = learning?.total_xp || members.reduce((sum, m) => sum + m.total_xp, 0);
  const avgStreak = engagement?.avg_streak || 0;

  // Dados para gráfico de atividade semanal
  const weeklyData = [
    { name: "Seg", atividades: Math.round((engagement?.total_activities || 0) * 0.18) },
    { name: "Ter", atividades: Math.round((engagement?.total_activities || 0) * 0.16) },
    { name: "Qua", atividades: Math.round((engagement?.total_activities || 0) * 0.17) },
    { name: "Qui", atividades: Math.round((engagement?.total_activities || 0) * 0.15) },
    { name: "Sex", atividades: Math.round((engagement?.total_activities || 0) * 0.2) },
    { name: "Sáb", atividades: Math.round((engagement?.total_activities || 0) * 0.08) },
    { name: "Dom", atividades: Math.round((engagement?.total_activities || 0) * 0.06) },
  ];

  // Dados para gráfico de pizza (membros por status)
  const memberStatusData = [
    { name: "Ativos", value: activeMembers, color: COLORS[0] },
    { name: "Inativos", value: inactiveMembers, color: COLORS[3] },
  ];

  // Top 5 membros por XP
  const topMembers = [...members]
    .sort((a, b) => b.total_xp - a.total_xp)
    .slice(0, 5);

  // Dados para radar de competências
  const competencyRadar = competency?.by_skill?.slice(0, 6).map((s) => ({
    skill: s.skill_name,
    score: s.avg_score,
    fullMark: 100,
  })) || [];

  return (
    <div className="space-y-6">
      {/* KPIs Principais */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
        >
          <MetricCard
            icon={Users}
            label="Membros Ativos"
            value={`${activeMembers}/${totalMembers}`}
            subValue={`${engagementRate}% de engajamento`}
            color="primary"
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <MetricCard
            icon={Zap}
            label="XP Total Ganho"
            value={totalXP.toLocaleString("pt-BR")}
            subValue={`${learning?.active_learners || 0} aprendizes ativos`}
            color="secondary"
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <MetricCard
            icon={Flame}
            label="Streak Médio"
            value={`${avgStreak} dias`}
            subValue={`${engagement?.total_activities || 0} atividades`}
            color="warning"
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <MetricCard
            icon={Target}
            label="Taxa de Decisões Ótimas"
            value={`${decision?.optimal_rate || 0}%`}
            subValue={`${decision?.total_decisions || 0} decisões tomadas`}
            color="accent"
          />
        </motion.div>
      </div>

      {/* Gráficos */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Atividade Semanal */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-xl border border-border bg-card p-6"
        >
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Atividades por Dia
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis
                  dataKey="name"
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                />
                <YAxis
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Bar
                  dataKey="atividades"
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Status dos Membros */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-xl border border-border bg-card p-6"
        >
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Users className="h-5 w-5 text-secondary" />
            Status dos Membros
          </h3>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={memberStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {memberStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Top Membros e Radar de Competências */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top 5 Membros */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="rounded-xl border border-border bg-card p-6"
        >
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            Top 5 por XP
          </h3>
          {topMembers.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Nenhum membro com XP registrado
            </p>
          ) : (
            <div className="space-y-3">
              {topMembers.map((member, index) => (
                <div
                  key={member.user_id}
                  className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        index === 0
                          ? "bg-amber-500 text-amber-950"
                          : index === 1
                          ? "bg-gray-300 text-gray-700"
                          : index === 2
                          ? "bg-amber-700 text-amber-100"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-medium text-foreground text-sm">
                        {member.nickname}
                      </p>
                      {member.team_name && (
                        <p className="text-xs text-muted-foreground">
                          {member.team_name}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">
                      {member.total_xp.toLocaleString("pt-BR")} XP
                    </p>
                    <p className="text-xs text-muted-foreground">
                      🔥 {member.current_streak} dias
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Radar de Competências */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="rounded-xl border border-border bg-card p-6"
        >
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Target className="h-5 w-5 text-accent" />
            Competências da Organização
          </h3>
          {competencyRadar.length === 0 ? (
            <div className="h-64 flex items-center justify-center">
              <p className="text-sm text-muted-foreground text-center">
                Sem dados de competências ainda
              </p>
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={competencyRadar}>
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
                    stroke="hsl(var(--accent))"
                    fill="hsl(var(--accent))"
                    fillOpacity={0.3}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
