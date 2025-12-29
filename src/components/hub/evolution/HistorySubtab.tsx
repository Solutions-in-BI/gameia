/**
 * HistorySubtab - Histórico de atividades concluídas
 * Mostra treinamentos, testes e jogos finalizados com recompensas
 */

import { useState } from "react";
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
  Filter,
  CheckCircle2
} from "lucide-react";
import { HubCard, HubCardHeader, HubEmptyState } from "../common";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRewardEngine, SourceType } from "@/hooks/useRewardEngine";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { formatDistanceToNow, format } from "date-fns";
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

export function HistorySubtab() {
  const [filter, setFilter] = useState<HistoryFilter>("all");
  const { user } = useAuth();
  const { getRewardHistory } = useRewardEngine();

  // Fetch reward history
  const { data: rewardHistory = [], isLoading } = useQuery({
    queryKey: ["reward-history", user?.id, filter],
    queryFn: async () => {
      if (!user?.id) return [];
      
      let query = supabase
        .from('reward_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (filter !== "all") {
        query = query.eq('source_type', filter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id
  });

  // Fetch activity log as fallback
  const { data: activityLog = [] } = useQuery({
    queryKey: ["activity-log", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('user_activity_log')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id && rewardHistory.length === 0
  });

  // Combine and filter data
  const historyItems = rewardHistory.length > 0 ? rewardHistory : activityLog.map(a => ({
    id: a.id,
    source_type: a.game_type || a.activity_type,
    xp_earned: a.xp_earned,
    coins_earned: a.coins_earned,
    performance_score: null,
    target_score: null,
    target_met: true,
    created_at: a.created_at,
    metadata: a.metadata
  }));

  const filteredItems = filter === "all" 
    ? historyItems 
    : historyItems.filter(item => {
        const sourceType = item.source_type?.toLowerCase() || "";
        return sourceType.includes(filter) || sourceType === filter;
      });

  // Group by date
  const groupedByDate = filteredItems.reduce((acc, item) => {
    const date = format(new Date(item.created_at), 'yyyy-MM-dd');
    if (!acc[date]) acc[date] = [];
    acc[date].push(item);
    return acc;
  }, {} as Record<string, typeof filteredItems>);

  const getSourceConfig = (sourceType: string) => {
    const type = sourceType?.toLowerCase() || "";
    if (type.includes("training") || type.includes("module")) return FILTER_CONFIG.training;
    if (type.includes("cognitive") || type.includes("test")) return FILTER_CONFIG.cognitive_test;
    if (type.includes("game") || type.includes("quiz") || type.includes("memory") || type.includes("snake")) return FILTER_CONFIG.game;
    if (type.includes("challenge") || type.includes("commitment")) return FILTER_CONFIG.challenge;
    return FILTER_CONFIG.all;
  };

  return (
    <div className="space-y-6">
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
            <div key={i} className="h-20 rounded-xl bg-muted/50 animate-pulse" />
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
          {Object.entries(groupedByDate).map(([date, items]) => (
            <div key={date} className="space-y-3">
              {/* Date Header */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>{format(new Date(date), "d 'de' MMMM", { locale: ptBR })}</span>
                <span className="text-xs">({items.length} atividades)</span>
              </div>

              {/* Items */}
              <div className="space-y-2">
                {items.map((item, index) => {
                  const config = getSourceConfig(item.source_type);
                  const Icon = config.icon;
                  const metadata = item.metadata as { title?: string } | null;

                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                    >
                      <HubCard className="p-4">
                        <div className="flex items-center gap-4">
                          {/* Icon */}
                          <div className={cn(
                            "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                            item.target_met !== false ? "bg-green-500/10" : "bg-muted"
                          )}>
                            {item.target_met !== false ? (
                              <CheckCircle2 className="w-5 h-5 text-green-500" />
                            ) : (
                              <Icon className={cn("w-5 h-5", config.color)} />
                            )}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-foreground truncate">
                                {metadata?.title || config.label}
                              </span>
                              <Badge variant="outline" className={cn("text-xs shrink-0", config.color)}>
                                {config.label}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                              <span>
                                {formatDistanceToNow(new Date(item.created_at), { 
                                  addSuffix: true, 
                                  locale: ptBR 
                                })}
                              </span>
                              {item.performance_score !== null && item.performance_score !== undefined && (
                                <>
                                  <span>•</span>
                                  <span>Score: {item.performance_score}%</span>
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
                          </div>

                          {/* Rewards */}
                          <div className="flex items-center gap-3 shrink-0">
                            {item.xp_earned > 0 && (
                              <div className="flex items-center gap-1 text-primary">
                                <Sparkles className="w-4 h-4" />
                                <span className="text-sm font-medium">+{item.xp_earned}</span>
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
          ))}
        </div>
      )}
    </div>
  );
}
