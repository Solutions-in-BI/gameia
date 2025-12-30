/**
 * AssessmentHistoryTab - Histórico de Avaliações e Evolução Visual
 * O usuário visualiza sua evolução ao longo do tempo
 * Comparação consigo mesmo (nunca com outros)
 */

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  Brain,
  Target,
  MessageSquare,
  Users,
  Filter,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { format, subDays, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface AssessmentHistoryItem {
  id: string;
  context_type: string;
  context_id: string | null;
  total_score: number | null;
  skills_impacted: string[] | null;
  completed_at: string;
  responses: Record<string, unknown>;
}

interface EvolutionDataPoint {
  date: string;
  score: number;
  assessments: number;
}

const ASSESSMENT_TYPE_CONFIG: Record<string, {
  label: string;
  icon: React.ElementType;
  color: string;
}> = {
  training: { label: 'Treinamento', icon: Target, color: 'text-blue-600' },
  game: { label: 'Simulação', icon: Brain, color: 'text-purple-600' },
  challenge: { label: 'Desafio', icon: TrendingUp, color: 'text-amber-600' },
  self_assessment: { label: 'Autoavaliação', icon: Sparkles, color: 'text-primary' },
  manager: { label: 'Gestor', icon: Users, color: 'text-emerald-600' },
  '360': { label: 'Feedback 360', icon: MessageSquare, color: 'text-rose-600' },
};

export function AssessmentHistoryTab() {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Fetch assessment history
  const { data: assessments, isLoading } = useQuery({
    queryKey: ['assessment-history', user?.id, timeRange],
    queryFn: async () => {
      if (!user?.id) return [];

      let query = supabase
        .from('contextual_assessment_responses')
        .select('*')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false });

      // Apply time range filter
      if (timeRange !== 'all') {
        const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
        const startDate = subDays(new Date(), days).toISOString();
        query = query.gte('completed_at', startDate);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as AssessmentHistoryItem[];
    },
    enabled: !!user?.id,
  });

  // Calculate evolution data for chart
  const evolutionData = useMemo(() => {
    if (!assessments?.length) return [];

    const grouped = assessments.reduce((acc, assessment) => {
      const date = format(new Date(assessment.completed_at), 'dd/MM');
      if (!acc[date]) {
        acc[date] = { scores: [], count: 0 };
      }
      if (assessment.total_score) {
        acc[date].scores.push(assessment.total_score);
      }
      acc[date].count++;
      return acc;
    }, {} as Record<string, { scores: number[]; count: number }>);

    return Object.entries(grouped)
      .map(([date, { scores, count }]) => ({
        date,
        score: scores.length > 0
          ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
          : 0,
        assessments: count,
      }))
      .reverse();
  }, [assessments]);

  // Filter assessments by type
  const filteredAssessments = useMemo(() => {
    if (!assessments) return [];
    if (typeFilter === 'all') return assessments;
    return assessments.filter(a => a.context_type === typeFilter);
  }, [assessments, typeFilter]);

  // Calculate stats
  const stats = useMemo(() => {
    if (!assessments?.length) return null;

    const scores = assessments
      .filter(a => a.total_score !== null)
      .map(a => a.total_score as number);

    if (scores.length === 0) return null;

    const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    const recentScores = scores.slice(0, 5);
    const olderScores = scores.slice(5, 10);
    
    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (recentScores.length > 0 && olderScores.length > 0) {
      const recentAvg = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;
      const olderAvg = olderScores.reduce((a, b) => a + b, 0) / olderScores.length;
      const diff = recentAvg - olderAvg;
      if (diff > 5) trend = 'up';
      else if (diff < -5) trend = 'down';
    }

    return {
      total: assessments.length,
      avgScore,
      trend,
      highestScore: Math.max(...scores),
      lowestScore: Math.min(...scores),
    };
  }, [assessments]);

  const TrendIcon = stats?.trend === 'up' ? TrendingUp : stats?.trend === 'down' ? TrendingDown : Minus;
  const trendColor = stats?.trend === 'up' ? 'text-emerald-600' : stats?.trend === 'down' ? 'text-rose-600' : 'text-muted-foreground';

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{stats?.total || 0}</div>
            <p className="text-xs text-muted-foreground">Avaliações</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">{stats?.avgScore || 0}</span>
              <TrendIcon className={cn("h-4 w-4", trendColor)} />
            </div>
            <p className="text-xs text-muted-foreground">Score Médio</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-emerald-600">{stats?.highestScore || 0}</div>
            <p className="text-xs text-muted-foreground">Maior Score</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-amber-600">{stats?.lowestScore || 0}</div>
            <p className="text-xs text-muted-foreground">Menor Score</p>
          </CardContent>
        </Card>
      </div>

      {/* Evolution Chart */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">Sua Evolução</CardTitle>
            <Select value={timeRange} onValueChange={(v) => setTimeRange(v as typeof timeRange)}>
              <SelectTrigger className="w-[120px] h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">7 dias</SelectItem>
                <SelectItem value="30d">30 dias</SelectItem>
                <SelectItem value="90d">90 dias</SelectItem>
                <SelectItem value="all">Todo período</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {evolutionData.length > 0 ? (
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={evolutionData}>
                  <defs>
                    <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10 }}
                    className="text-muted-foreground"
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fontSize: 10 }}
                    className="text-muted-foreground"
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const data = payload[0].payload as EvolutionDataPoint;
                      return (
                        <div className="bg-popover border rounded-lg p-2 shadow-lg">
                          <p className="text-xs font-medium">{data.date}</p>
                          <p className="text-sm">Score: <span className="font-bold">{data.score}</span></p>
                          <p className="text-xs text-muted-foreground">{data.assessments} avaliações</p>
                        </div>
                      );
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    fill="url(#scoreGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
              Nenhuma avaliação no período selecionado
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assessment History List */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">Histórico</CardTitle>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[140px] h-8 text-xs">
                <Filter className="h-3 w-3 mr-1" />
                <SelectValue placeholder="Filtrar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                {Object.entries(ASSESSMENT_TYPE_CONFIG).map(([key, config]) => (
                  <SelectItem key={key} value={key}>{config.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px]">
            <div className="space-y-2">
              {filteredAssessments.map((assessment) => {
                const config = ASSESSMENT_TYPE_CONFIG[assessment.context_type] || ASSESSMENT_TYPE_CONFIG.training;
                const Icon = config.icon;

                return (
                  <motion.div
                    key={assessment.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 p-3 rounded-lg border hover:border-primary/30 transition-colors cursor-pointer"
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center bg-muted",
                      config.color
                    )}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px]">
                          {config.label}
                        </Badge>
                        {assessment.total_score !== null && (
                          <Badge 
                            variant="secondary" 
                            className={cn(
                              "text-[10px]",
                              assessment.total_score >= 80 ? "bg-emerald-500/10 text-emerald-600" :
                              assessment.total_score >= 60 ? "bg-amber-500/10 text-amber-600" :
                              "bg-rose-500/10 text-rose-600"
                            )}
                          >
                            {Math.round(assessment.total_score)}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(assessment.completed_at), "dd 'de' MMM 'às' HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </motion.div>
                );
              })}

              {filteredAssessments.length === 0 && (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  Nenhuma avaliação encontrada
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
