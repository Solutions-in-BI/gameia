/**
 * RewardAnalyticsDashboard - Dashboard de análise de recompensas para gestores
 */

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useOrganization } from "@/hooks/useOrganization";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Gift,
  Trophy,
  TrendingUp,
  Users,
  Target,
  Award,
  Package,
  Sparkles,
  Coins,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";

interface ItemStats {
  item_id: string;
  item_name: string;
  item_icon: string;
  category: string;
  unlock_count: number;
}

interface ChallengeStats {
  challenge_id: string;
  challenge_name: string;
  items_granted: number;
  participants: number;
  completion_rate: number;
}

interface TopPerformer {
  user_id: string;
  nickname: string;
  avatar_url: string | null;
  items_earned: number;
  xp_earned: number;
}

interface EngagementData {
  date: string;
  items_granted: number;
  challenges_completed: number;
}

const CHART_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export function RewardAnalyticsDashboard() {
  const { currentOrg } = useOrganization();
  const [isLoading, setIsLoading] = useState(true);
  const [itemStats, setItemStats] = useState<ItemStats[]>([]);
  const [challengeStats, setChallengeStats] = useState<ChallengeStats[]>([]);
  const [topPerformers, setTopPerformers] = useState<TopPerformer[]>([]);
  const [engagementData, setEngagementData] = useState<EngagementData[]>([]);
  const [summary, setSummary] = useState({
    totalItemsGranted: 0,
    totalChallengesWithItems: 0,
    avgItemsPerChallenge: 0,
    topCategory: "",
  });

  const fetchAnalytics = useCallback(async () => {
    if (!currentOrg?.id) return;

    setIsLoading(true);
    try {
      // 1. Buscar itens mais desbloqueados
      const { data: inventoryData } = await supabase
        .from("user_inventory")
        .select("item_id")
        .eq("organization_id", currentOrg.id);

      if (inventoryData && inventoryData.length > 0) {
        // Contar itens por ID
        const itemCounts = new Map<string, number>();
        inventoryData.forEach((inv) => {
          itemCounts.set(inv.item_id, (itemCounts.get(inv.item_id) || 0) + 1);
        });

        // Buscar detalhes dos itens
        const itemIds = Array.from(itemCounts.keys());
        const { data: itemDetails } = await supabase
          .from("marketplace_items")
          .select("id, name, icon, category")
          .in("id", itemIds);

        const stats: ItemStats[] = (itemDetails || []).map((item) => ({
          item_id: item.id,
          item_name: item.name,
          item_icon: item.icon,
          category: item.category,
          unlock_count: itemCounts.get(item.id) || 0,
        })).sort((a, b) => b.unlock_count - a.unlock_count).slice(0, 10);

        setItemStats(stats);

        // Calcular categoria mais popular
        const categoryCounts = new Map<string, number>();
        sorted.forEach(item => {
          categoryCounts.set(item.category, (categoryCounts.get(item.category) || 0) + item.unlock_count);
        });
        const topCat = Array.from(categoryCounts.entries())
          .sort((a, b) => b[1] - a[1])[0];
        
        setSummary(prev => ({
          ...prev,
          totalItemsGranted: inventoryData.length,
          topCategory: topCat?.[0] || "N/A",
        }));
      }

      // 2. Buscar desafios que mais geraram recompensas
      const { data: challenges } = await supabase
        .from("commitments")
        .select(`
          id,
          name,
          reward_items,
          commitment_participants(count)
        `)
        .eq("organization_id", currentOrg.id)
        .eq("status", "completed")
        .not("reward_items", "eq", "[]")
        .limit(10);

      if (challenges) {
        const stats = challenges.map((c: any) => ({
          challenge_id: c.id,
          challenge_name: c.name,
          items_granted: Array.isArray(c.reward_items) ? c.reward_items.length : 0,
          participants: c.commitment_participants?.[0]?.count || 0,
          completion_rate: 100,
        }));
        setChallengeStats(stats);
        setSummary(prev => ({
          ...prev,
          totalChallengesWithItems: challenges.length,
          avgItemsPerChallenge: stats.length > 0 
            ? Math.round(stats.reduce((sum, s) => sum + s.items_granted, 0) / stats.length * 10) / 10
            : 0,
        }));
      }

      // 3. Buscar top performers
      const { data: performers } = await supabase
        .from("user_inventory")
        .select(`
          user_id,
          profiles!inner(nickname, avatar_url)
        `)
        .eq("organization_id", currentOrg.id);

      if (performers) {
        const userCounts = new Map<string, TopPerformer>();
        performers.forEach((p: any) => {
          const id = p.user_id;
          const existing = userCounts.get(id);
          if (existing) {
            existing.items_earned++;
          } else {
            userCounts.set(id, {
              user_id: id,
              nickname: p.profiles?.nickname || "Usuário",
              avatar_url: p.profiles?.avatar_url,
              items_earned: 1,
              xp_earned: 0,
            });
          }
        });
        const sorted = Array.from(userCounts.values())
          .sort((a, b) => b.items_earned - a.items_earned)
          .slice(0, 5);
        setTopPerformers(sorted);
      }

      // 4. Dados de engajamento ao longo do tempo
      const { data: engagementRaw } = await supabase
        .from("user_inventory")
        .select("acquired_at")
        .eq("organization_id", currentOrg.id)
        .gte("acquired_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      if (engagementRaw) {
        const dailyCounts = new Map<string, number>();
        engagementRaw.forEach((item: any) => {
          const date = new Date(item.acquired_at).toISOString().split("T")[0];
          dailyCounts.set(date, (dailyCounts.get(date) || 0) + 1);
        });

        const engagement: EngagementData[] = [];
        for (let i = 29; i >= 0; i--) {
          const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
          engagement.push({
            date: date.slice(5), // MM-DD
            items_granted: dailyCounts.get(date) || 0,
            challenges_completed: 0,
          });
        }
        setEngagementData(engagement);
      }

    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setIsLoading(false);
    }
  }, [currentOrg?.id]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Gift className="w-5 h-5 text-primary" />
          Analytics de Recompensas
        </h2>
        <p className="text-sm text-muted-foreground">
          Análise de itens desbloqueados, desafios e engajamento
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Package className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{summary.totalItemsGranted}</p>
                <p className="text-xs text-muted-foreground">Itens Desbloqueados</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Target className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{summary.totalChallengesWithItems}</p>
                <p className="text-xs text-muted-foreground">Desafios com Itens</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Sparkles className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{summary.avgItemsPerChallenge}</p>
                <p className="text-xs text-muted-foreground">Itens/Desafio</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Award className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold capitalize">{summary.topCategory}</p>
                <p className="text-xs text-muted-foreground">Categoria Popular</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="items" className="space-y-4">
        <TabsList>
          <TabsTrigger value="items">Itens Populares</TabsTrigger>
          <TabsTrigger value="challenges">Desafios</TabsTrigger>
          <TabsTrigger value="performers">Top Performers</TabsTrigger>
          <TabsTrigger value="engagement">Engajamento</TabsTrigger>
        </TabsList>

        <TabsContent value="items" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Itens Mais Desbloqueados</CardTitle>
            </CardHeader>
            <CardContent>
              {itemStats.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={itemStats} layout="vertical">
                      <XAxis type="number" />
                      <YAxis 
                        type="category" 
                        dataKey="item_name" 
                        width={120}
                        tick={{ fontSize: 12 }}
                      />
                      <Tooltip />
                      <Bar dataKey="unlock_count" fill="hsl(var(--primary))" radius={4} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  Nenhum dado disponível
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="challenges" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Desafios que Mais Geram Recompensas</CardTitle>
            </CardHeader>
            <CardContent>
              {challengeStats.length > 0 ? (
                <div className="space-y-3">
                  {challengeStats.map((challenge, index) => (
                    <div 
                      key={challenge.challenge_id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{challenge.challenge_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {challenge.participants} participantes
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary">
                          <Gift className="w-3 h-3 mr-1" />
                          {challenge.items_granted} itens
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  Nenhum desafio com itens configurados
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-500" />
                Top Colecionadores
              </CardTitle>
            </CardHeader>
            <CardContent>
              {topPerformers.length > 0 ? (
                <div className="space-y-3">
                  {topPerformers.map((performer, index) => (
                    <div 
                      key={performer.user_id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          index === 0 ? "bg-amber-500/20 text-amber-500" :
                          index === 1 ? "bg-slate-400/20 text-slate-400" :
                          index === 2 ? "bg-orange-500/20 text-orange-500" :
                          "bg-muted"
                        }`}>
                          {index + 1}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-muted overflow-hidden">
                            {performer.avatar_url ? (
                              <img src={performer.avatar_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xs">
                                {performer.nickname.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <span className="font-medium">{performer.nickname}</span>
                        </div>
                      </div>
                      <Badge>
                        <Package className="w-3 h-3 mr-1" />
                        {performer.items_earned} itens
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  Nenhum dado disponível
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Itens Desbloqueados (Últimos 30 dias)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {engagementData.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={engagementData}>
                      <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                      <YAxis />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="items_granted" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  Nenhum dado disponível
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
