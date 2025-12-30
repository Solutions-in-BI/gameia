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
  Target,
  Award,
  Package,
  Sparkles,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const inventoryResult = await (supabase as any)
        .from("user_inventory")
        .select("item_id")
        .eq("organization_id", currentOrg.id);

      const inventoryData: Array<{ item_id: string }> = inventoryResult.data || [];

      if (inventoryData && inventoryData.length > 0) {
        // Contar itens por ID
        const itemCounts = new Map<string, number>();
        inventoryData.forEach((inv) => {
          itemCounts.set(inv.item_id, (itemCounts.get(inv.item_id) || 0) + 1);
        });

        // Buscar detalhes dos itens
        const itemIds = Array.from(itemCounts.keys());
        const itemsResponse = await supabase
          .from("marketplace_items")
          .select("id, name, icon, category")
          .in("id", itemIds);

        const itemDetails = itemsResponse.data as Array<{
          id: string;
          name: string;
          icon: string | null;
          category: string;
        }> | null;

        const stats: ItemStats[] = (itemDetails || []).map((item) => ({
          item_id: item.id,
          item_name: item.name,
          item_icon: item.icon || "📦",
          category: item.category,
          unlock_count: itemCounts.get(item.id) || 0,
        })).sort((a, b) => b.unlock_count - a.unlock_count).slice(0, 10);

        setItemStats(stats);

        // Calcular categoria mais popular
        const categoryCounts = new Map<string, number>();
        stats.forEach(item => {
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
      const challengesResponse = await supabase
        .from("commitments")
        .select("id, name, reward_items")
        .eq("organization_id", currentOrg.id)
        .eq("status", "completed")
        .limit(10);

      const challenges = challengesResponse.data as Array<{
        id: string;
        name: string;
        reward_items: unknown;
      }> | null;

      if (challenges) {
        const challengesWithItems = challenges.filter(c => {
          const items = c.reward_items;
          return Array.isArray(items) && items.length > 0;
        });

        const stats = challengesWithItems.map((c) => ({
          challenge_id: c.id,
          challenge_name: c.name,
          items_granted: Array.isArray(c.reward_items) ? (c.reward_items as unknown[]).length : 0,
          participants: 0,
          completion_rate: 100,
        }));
        setChallengeStats(stats);
        setSummary(prev => ({
          ...prev,
          totalChallengesWithItems: challengesWithItems.length,
          avgItemsPerChallenge: stats.length > 0 
            ? Math.round(stats.reduce((sum, s) => sum + s.items_granted, 0) / stats.length * 10) / 10
            : 0,
        }));
      }

      // 3. Buscar top performers
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const performersResponse = await (supabase as any)
        .from("user_inventory")
        .select("user_id")
        .eq("organization_id", currentOrg.id);

      const performers: Array<{ user_id: string }> = performersResponse.data || [];

      if (performers.length > 0) {
        const userCounts = new Map<string, number>();
        performers.forEach((p) => {
          userCounts.set(p.user_id, (userCounts.get(p.user_id) || 0) + 1);
        });

        // Buscar perfis dos usuários
        const userIds = Array.from(userCounts.keys()).slice(0, 10);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const profilesResponse = await (supabase as any)
          .from("profiles")
          .select("id, nickname, avatar_url")
          .in("id", userIds);

        const profiles: Array<{ id: string; nickname: string; avatar_url: string | null }> = profilesResponse.data || [];

        const topPerfs: TopPerformer[] = profiles.map(p => ({
          user_id: p.id,
          nickname: p.nickname || "Usuário",
          avatar_url: p.avatar_url,
          items_earned: userCounts.get(p.id) || 0,
          xp_earned: 0,
        })).sort((a, b) => b.items_earned - a.items_earned).slice(0, 5);

        setTopPerformers(topPerfs);
      }

      // 4. Dados de engajamento ao longo do tempo
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const engagementResponse = await (supabase as any)
        .from("user_inventory")
        .select("purchased_at")
        .eq("organization_id", currentOrg.id)
        .gte("purchased_at", thirtyDaysAgo);

      const engagementRaw: Array<{ purchased_at: string | null }> = engagementResponse.data || [];

      if (engagementRaw) {
        const dailyCounts = new Map<string, number>();
        engagementRaw.forEach((item) => {
          if (item.purchased_at) {
            const date = new Date(item.purchased_at).toISOString().split("T")[0];
            dailyCounts.set(date, (dailyCounts.get(date) || 0) + 1);
          }
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
