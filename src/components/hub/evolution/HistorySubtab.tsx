/**
 * HistorySubtab - Histórico Inteligente com Consequências
 * Mostra skill impactada, resultado (meta atingida ou não), impacto na evolução
 * e interpretação automática para cada item
 */

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { 
  History, 
  Brain, 
  GraduationCap, 
  Gamepad2, 
  Target,
  Sparkles,
  Coins,
  Calendar,
  CheckCircle2,
  XCircle,
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  Award,
  Flame,
  Clock
} from "lucide-react";
import { HubCard, HubEmptyState } from "../common";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { formatDistanceToNow, format, startOfWeek, endOfWeek, subWeeks, isWithinInterval } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

type HistoryFilter = "all" | "training" | "cognitive_test" | "game" | "challenge";

const FILTER_CONFIG: Record<HistoryFilter, { label: string; icon: React.ElementType; color: string }> = {
  all: { label: "Todos", icon: History, color: "text-foreground" },
  training: { label: "Treinamentos", icon: GraduationCap, color: "text-blue-500" },
  cognitive_test: { label: "Testes", icon: Brain, color: "text-emerald-500" },
  game: { label: "Jogos", icon: Gamepad2, color: "text-purple-500" },
  challenge: { label: "Desafios", icon: Target, color: "text-orange-500" },
};

interface HistoryItem {
  id: string;
  source_type: string;
  xp_earned: number;
  coins_earned: number;
  performance_score: number | null;
  target_score: number | null;
  target_met: boolean;
  created_at: string;
  metadata: { title?: string; skill_name?: string; skill_id?: string } | null;
}

export function HistorySubtab() {
  const [filter, setFilter] = useState<HistoryFilter>("all");
  const { user } = useAuth();

  // Fetch reward history
  const { data: rewardHistory = [], isLoading } = useQuery({
    queryKey: ["reward-history-detailed", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('reward_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      return (data || []) as HistoryItem[];
    },
    enabled: !!user?.id
  });

  // Fetch activity log as fallback
  const { data: activityLog = [] } = useQuery({
    queryKey: ["activity-log-detailed", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('user_activity_log')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id && rewardHistory.length === 0
  });

  // Combine and normalize data
  const historyItems: HistoryItem[] = useMemo(() => {
    if (rewardHistory.length > 0) return rewardHistory;
    
    return activityLog.map((a: any) => ({
      id: a.id,
      source_type: a.game_type || a.activity_type || "unknown",
      xp_earned: a.xp_earned || 0,
      coins_earned: a.coins_earned || 0,
      performance_score: a.score || null,
      target_score: null,
      target_met: true,
      created_at: a.created_at,
      metadata: a.metadata
    }));
  }, [rewardHistory, activityLog]);

  // Filter items
  const filteredItems = useMemo(() => {
    if (filter === "all") return historyItems;
    
    return historyItems.filter(item => {
      const sourceType = item.source_type?.toLowerCase() || "";
      return sourceType.includes(filter) || sourceType === filter;
    });
  }, [historyItems, filter]);

  // Calculate period summary
  const periodSummary = useMemo(() => {
    const now = new Date();
    const thisWeekStart = startOfWeek(now, { weekStartsOn: 1 });
    const thisWeekEnd = endOfWeek(now, { weekStartsOn: 1 });
    const lastWeekStart = subWeeks(thisWeekStart, 1);
    const lastWeekEnd = subWeeks(thisWeekEnd, 1);

    const thisWeekItems = historyItems.filter(item => 
      isWithinInterval(new Date(item.created_at), { start: thisWeekStart, end: thisWeekEnd })
    );
    
    const lastWeekItems = historyItems.filter(item => 
      isWithinInterval(new Date(item.created_at), { start: lastWeekStart, end: lastWeekEnd })
    );

    const thisWeekXP = thisWeekItems.reduce((sum, item) => sum + (item.xp_earned || 0), 0);
    const lastWeekXP = lastWeekItems.reduce((sum, item) => sum + (item.xp_earned || 0), 0);
    const thisWeekCoins = thisWeekItems.reduce((sum, item) => sum + (item.coins_earned || 0), 0);
    
    const xpChange = lastWeekXP > 0 ? ((thisWeekXP - lastWeekXP) / lastWeekXP) * 100 : 0;
    const activityChange = lastWeekItems.length > 0 
      ? ((thisWeekItems.length - lastWeekItems.length) / lastWeekItems.length) * 100 
      : 0;

    const goalsMetThisWeek = thisWeekItems.filter(i => i.target_met !== false).length;
    const totalGoalsThisWeek = thisWeekItems.filter(i => i.target_score !== null).length;

    return {
      thisWeekXP,
      lastWeekXP,
      thisWeekCoins,
      thisWeekActivities: thisWeekItems.length,
      lastWeekActivities: lastWeekItems.length,
      xpChange,
      activityChange,
      goalsMetThisWeek,
      totalGoalsThisWeek,
      mostActiveType: getMostActiveType(thisWeekItems)
    };
  }, [historyItems]);

  // Group by date
  const groupedByDate = useMemo(() => {
    return filteredItems.reduce((acc, item) => {
      const date = format(new Date(item.created_at), 'yyyy-MM-dd');
      if (!acc[date]) acc[date] = [];
      acc[date].push(item);
      return acc;
    }, {} as Record<string, HistoryItem[]>);
  }, [filteredItems]);

  const getSourceConfig = (sourceType: string) => {
    const type = sourceType?.toLowerCase() || "";
    if (type.includes("training") || type.includes("module")) return FILTER_CONFIG.training;
    if (type.includes("cognitive") || type.includes("test")) return FILTER_CONFIG.cognitive_test;
    if (type.includes("game") || type.includes("quiz") || type.includes("memory") || type.includes("snake")) return FILTER_CONFIG.game;
    if (type.includes("challenge") || type.includes("commitment")) return FILTER_CONFIG.challenge;
    return FILTER_CONFIG.all;
  };

  // Get interpretation for an item
  const getInterpretation = (item: HistoryItem): { text: string; type: "positive" | "neutral" | "negative" } => {
    const score = item.performance_score;
    const target = item.target_score;
    const xp = item.xp_earned;

    if (score !== null && target !== null) {
      if (score >= target) {
        if (score >= 90) return { text: "Excelente! Acima da média", type: "positive" };
        return { text: "Meta atingida", type: "positive" };
      } else {
        const diff = target - score;
        if (diff <= 10) return { text: "Quase lá! Continue praticando", type: "neutral" };
        return { text: "Precisa de mais prática", type: "negative" };
      }
    }

    if (xp >= 100) return { text: "Grande conquista!", type: "positive" };
    if (xp >= 50) return { text: "Bom progresso", type: "positive" };
    return { text: "Atividade registrada", type: "neutral" };
  };

  return (
    <div className="space-y-6">
      {/* Period Summary */}
      <Card className="bg-gradient-to-r from-primary/5 to-transparent border-primary/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary" />
            Resumo da Semana
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <SummaryCard
              label="XP Ganho"
              value={periodSummary.thisWeekXP.toLocaleString()}
              change={periodSummary.xpChange}
              icon={Sparkles}
              iconColor="text-primary"
            />
            <SummaryCard
              label="Atividades"
              value={periodSummary.thisWeekActivities.toString()}
              change={periodSummary.activityChange}
              icon={Flame}
              iconColor="text-orange-500"
            />
            <SummaryCard
              label="Moedas"
              value={periodSummary.thisWeekCoins.toLocaleString()}
              icon={Coins}
              iconColor="text-amber-500"
            />
            <SummaryCard
              label="Metas Atingidas"
              value={periodSummary.totalGoalsThisWeek > 0 
                ? `${periodSummary.goalsMetThisWeek}/${periodSummary.totalGoalsThisWeek}`
                : "—"
              }
              icon={Target}
              iconColor="text-green-500"
            />
          </div>
          
          {periodSummary.mostActiveType && (
            <div className="mt-3 pt-3 border-t border-border/50">
              <p className="text-xs text-muted-foreground">
                Tipo mais ativo: <span className="font-medium text-foreground">{periodSummary.mostActiveType}</span>
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Filters */}
      <Tabs value={filter} onValueChange={(v) => setFilter(v as HistoryFilter)}>
        <TabsList className="w-full justify-start overflow-x-auto bg-muted/40 p-1 h-auto">
          {Object.entries(FILTER_CONFIG).map(([key, config]) => (
            <TabsTrigger
              key={key}
              value={key}
              className="flex items-center gap-1.5 px-3 py-2 data-[state=active]:bg-background whitespace-nowrap"
            >
              <config.icon className={cn("w-4 h-4", config.color)} />
              <span>{config.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* History List */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-muted/50 animate-pulse" />
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <HubEmptyState
          icon={History}
          title="Nenhuma atividade encontrada"
          description="Complete treinamentos, testes ou jogos para ver seu histórico aqui"
        />
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedByDate).map(([date, items]) => {
            const dayXP = items.reduce((sum, i) => sum + (i.xp_earned || 0), 0);
            const dayCoins = items.reduce((sum, i) => sum + (i.coins_earned || 0), 0);
            
            return (
              <div key={date} className="space-y-3">
                {/* Date Header with Day Summary */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span className="font-medium text-foreground">
                      {format(new Date(date), "d 'de' MMMM", { locale: ptBR })}
                    </span>
                    <span className="text-xs">({items.length} atividades)</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    {dayXP > 0 && (
                      <span className="flex items-center gap-1 text-primary">
                        <Sparkles className="w-3 h-3" />
                        +{dayXP} XP
                      </span>
                    )}
                    {dayCoins > 0 && (
                      <span className="flex items-center gap-1 text-amber-500">
                        <Coins className="w-3 h-3" />
                        +{dayCoins}
                      </span>
                    )}
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-2">
                  {items.map((item, index) => {
                    const config = getSourceConfig(item.source_type);
                    const Icon = config.icon;
                    const interpretation = getInterpretation(item);
                    const skillName = item.metadata?.skill_name;

                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                      >
                        <HubCard className="p-4">
                          <div className="flex items-start gap-4">
                            {/* Status Icon */}
                            <div className={cn(
                              "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                              item.target_met !== false 
                                ? "bg-green-500/10" 
                                : "bg-amber-500/10"
                            )}>
                              {item.target_met !== false ? (
                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                              ) : (
                                <XCircle className="w-5 h-5 text-amber-500" />
                              )}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-medium text-foreground truncate">
                                  {item.metadata?.title || config.label}
                                </span>
                                <Badge variant="outline" className={cn("text-xs shrink-0", config.color)}>
                                  <Icon className="w-3 h-3 mr-1" />
                                  {config.label}
                                </Badge>
                                {skillName && (
                                  <Badge variant="secondary" className="text-xs">
                                    {skillName}
                                  </Badge>
                                )}
                              </div>
                              
                              {/* Metrics Row */}
                              <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {formatDistanceToNow(new Date(item.created_at), { 
                                    addSuffix: true, 
                                    locale: ptBR 
                                  })}
                                </span>
                                {item.performance_score !== null && (
                                  <>
                                    <span>•</span>
                                    <span className="font-medium">
                                      Score: {item.performance_score}%
                                    </span>
                                  </>
                                )}
                                {item.target_score && (
                                  <>
                                    <span>•</span>
                                    <span className={item.target_met ? "text-green-500" : "text-amber-500"}>
                                      Meta: {item.target_score}%
                                    </span>
                                  </>
                                )}
                              </div>

                              {/* Interpretation */}
                              <div className={cn(
                                "mt-2 text-xs font-medium",
                                interpretation.type === "positive" && "text-green-500",
                                interpretation.type === "neutral" && "text-muted-foreground",
                                interpretation.type === "negative" && "text-amber-500"
                              )}>
                                {interpretation.type === "positive" && "✓ "}
                                {interpretation.type === "negative" && "⚠ "}
                                {interpretation.text}
                              </div>
                            </div>

                            {/* Rewards */}
                            <div className="flex flex-col items-end gap-1 shrink-0">
                              {item.xp_earned > 0 && (
                                <div className="flex items-center gap-1 text-primary">
                                  <Sparkles className="w-4 h-4" />
                                  <span className="text-sm font-bold">+{item.xp_earned}</span>
                                </div>
                              )}
                              {item.coins_earned > 0 && (
                                <div className="flex items-center gap-1 text-amber-500">
                                  <Coins className="w-4 h-4" />
                                  <span className="text-sm font-medium">+{item.coins_earned}</span>
                                </div>
                              )}
                              {item.xp_earned === 0 && item.coins_earned === 0 && (
                                <span className="text-xs text-muted-foreground">—</span>
                              )}
                            </div>
                          </div>
                        </HubCard>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Helper Components
function SummaryCard({ 
  label, 
  value, 
  change, 
  icon: Icon, 
  iconColor 
}: { 
  label: string; 
  value: string; 
  change?: number; 
  icon: React.ElementType; 
  iconColor: string;
}) {
  const showChange = change !== undefined && change !== 0;
  const isPositive = (change || 0) > 0;

  return (
    <div className="p-3 rounded-lg bg-background/50 border border-border/50">
      <div className="flex items-center gap-2 mb-1">
        <Icon className={cn("w-4 h-4", iconColor)} />
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-xl font-bold">{value}</span>
        {showChange && (
          <span className={cn(
            "text-xs flex items-center",
            isPositive ? "text-green-500" : "text-red-500"
          )}>
            {isPositive ? (
              <ArrowUpRight className="w-3 h-3" />
            ) : (
              <ArrowDownRight className="w-3 h-3" />
            )}
            {Math.abs(Math.round(change!))}%
          </span>
        )}
      </div>
    </div>
  );
}

function getMostActiveType(items: HistoryItem[]): string | null {
  if (items.length === 0) return null;
  
  const counts: Record<string, number> = {};
  items.forEach(item => {
    const type = item.source_type?.toLowerCase() || "unknown";
    counts[type] = (counts[type] || 0) + 1;
  });

  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  if (sorted.length === 0) return null;

  const typeKey = sorted[0][0];
  if (typeKey.includes("training")) return "Treinamentos";
  if (typeKey.includes("cognitive") || typeKey.includes("test")) return "Testes";
  if (typeKey.includes("game")) return "Jogos";
  if (typeKey.includes("challenge")) return "Desafios";
  return typeKey;
}
