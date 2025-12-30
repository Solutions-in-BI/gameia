/**
 * MeetingPreparationCard - Card de preparação para reunião 1:1
 * Mostra leitura rápida da evolução e sugestões de pauta
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Brain,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Trophy,
  Target,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  Sparkles,
  MessageSquare,
  Clipboard,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSkillTree } from "@/hooks/useSkillTree";
import { usePDI } from "@/hooks/usePDI";

interface MeetingPreparationCardProps {
  userId: string;
  onSelectTopic?: (topic: string) => void;
}

interface EvolutionSnapshot {
  weeklyXP: number;
  weeklyXPChange: number;
  activeStreak: number;
  strongSkills: Array<{ name: string; progress: number }>;
  weakSkills: Array<{ name: string; progress: number; daysSinceActivity: number }>;
  recentAchievements: Array<{ title: string; type: string }>;
  pendingGoals: Array<{ title: string; progress: number; isOverdue: boolean }>;
}

export function MeetingPreparationCard({ userId, onSelectTopic }: MeetingPreparationCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [snapshot, setSnapshot] = useState<EvolutionSnapshot | null>(null);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  
  const { skills } = useSkillTree();
  const { myPlans, getGoalsForPlan } = usePDI();

  useEffect(() => {
    async function fetchSnapshot() {
      setIsLoading(true);
      try {
        // Buscar XP da última semana
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        
        const { data: events } = await supabase
          .from("core_events")
          .select("xp_earned, created_at, event_type, metadata")
          .eq("user_id", userId)
          .gte("created_at", weekAgo.toISOString());

        const weeklyXP = events?.reduce((sum, e) => sum + (e.xp_earned || 0), 0) || 0;

        // Buscar XP da semana anterior para comparação
        const twoWeeksAgo = new Date();
        twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
        
        const { data: prevEvents } = await supabase
          .from("core_events")
          .select("xp_earned")
          .eq("user_id", userId)
          .gte("created_at", twoWeeksAgo.toISOString())
          .lt("created_at", weekAgo.toISOString());

        const prevWeeklyXP = prevEvents?.reduce((sum, e) => sum + (e.xp_earned || 0), 0) || 0;
        const weeklyXPChange = prevWeeklyXP > 0 
          ? Math.round(((weeklyXP - prevWeeklyXP) / prevWeeklyXP) * 100)
          : 0;

        // Buscar streak
        const { data: streakData } = await supabase
          .from("user_streaks")
          .select("current_streak")
          .eq("user_id", userId)
          .single();

        // Identificar skills fortes e fracas
        const sortedSkills = [...(skills || [])].sort((a, b) => (b.xpEarned || 0) - (a.xpEarned || 0));
        const strongSkills = sortedSkills.slice(0, 3).map(s => ({
          name: s.name,
          progress: s.progress || 0,
        }));
        
        const weakSkills = sortedSkills.slice(-3).reverse().map(s => ({
          name: s.name,
          progress: s.progress || 0,
          daysSinceActivity: 7, // Placeholder
        }));

        // Buscar conquistas recentes
        const { data: achievements } = await supabase
          .from("user_badges")
          .select("badges(name)")
          .eq("user_id", userId)
          .order("earned_at", { ascending: false })
          .limit(3);

        const recentAchievements = achievements?.map(a => ({
          title: (a.badges as any)?.name || "Conquista",
          type: "badge",
        })) || [];

        // Buscar metas PDI pendentes
        const activePlan = myPlans.find(p => p.status === "active");
        let pendingGoals: Array<{ title: string; progress: number; isOverdue: boolean }> = [];
        
        if (activePlan) {
          const goals = await getGoalsForPlan(activePlan.id);
          pendingGoals = goals
            .filter(g => g.status !== "completed")
            .slice(0, 3)
            .map(g => ({
              title: g.title,
              progress: g.progress,
              isOverdue: g.target_date ? new Date(g.target_date) < new Date() : false,
            }));
        }

        setSnapshot({
          weeklyXP,
          weeklyXPChange,
          activeStreak: streakData?.current_streak || 0,
          strongSkills,
          weakSkills,
          recentAchievements,
          pendingGoals,
        });
      } catch (error) {
        console.error("Error fetching evolution snapshot:", error);
      } finally {
        setIsLoading(false);
      }
    }

    if (userId) {
      fetchSnapshot();
    }
  }, [userId, skills, myPlans, getGoalsForPlan]);

  const suggestedTopics = [
    ...(snapshot?.weeklyXPChange && snapshot.weeklyXPChange > 20 
      ? [`Reconhecer evolução de ${snapshot.weeklyXPChange}% esta semana`] 
      : []),
    ...(snapshot?.weakSkills.filter(s => s.daysSinceActivity > 7).map(s => 
      `Discutir plano para evoluir ${s.name}`
    ) || []),
    ...(snapshot?.pendingGoals.filter(g => g.isOverdue).map(g => 
      `Revisar meta atrasada: ${g.title}`
    ) || []),
    ...(snapshot?.recentAchievements.slice(0, 1).map(a => 
      `Celebrar conquista: ${a.title}`
    ) || []),
    ...(snapshot?.activeStreak && snapshot.activeStreak >= 7 
      ? [`Reconhecer streak de ${snapshot.activeStreak} dias`] 
      : []),
  ].slice(0, 5);

  const toggleTopic = (topic: string) => {
    setSelectedTopics(prev => 
      prev.includes(topic) 
        ? prev.filter(t => t !== topic)
        : [...prev, topic]
    );
    onSelectTopic?.(topic);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
        <CardHeader 
          className="cursor-pointer py-3"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Brain className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  Preparação para Reunião
                  <Badge variant="secondary" className="text-xs">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Automático
                  </Badge>
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  Leitura rápida da evolução do colaborador
                </p>
              </div>
            </div>
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            )}
          </div>
        </CardHeader>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <CardContent className="pt-0 space-y-4">
                {isLoading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                ) : snapshot && (
                  <>
                    {/* Resumo rápido */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="p-3 rounded-lg bg-background border">
                        <div className="flex items-center gap-2 mb-1">
                          <Sparkles className="w-4 h-4 text-primary" />
                          <span className="text-xs text-muted-foreground">XP Semanal</span>
                        </div>
                        <p className="text-lg font-bold">{snapshot.weeklyXP}</p>
                        {snapshot.weeklyXPChange !== 0 && (
                          <div className={`flex items-center text-xs ${snapshot.weeklyXPChange > 0 ? "text-green-600" : "text-red-500"}`}>
                            {snapshot.weeklyXPChange > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            <span>{snapshot.weeklyXPChange > 0 ? "+" : ""}{snapshot.weeklyXPChange}%</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="p-3 rounded-lg bg-background border">
                        <div className="flex items-center gap-2 mb-1">
                          <Target className="w-4 h-4 text-orange-500" />
                          <span className="text-xs text-muted-foreground">Streak</span>
                        </div>
                        <p className="text-lg font-bold">{snapshot.activeStreak} dias</p>
                      </div>

                      <div className="p-3 rounded-lg bg-background border">
                        <div className="flex items-center gap-2 mb-1">
                          <TrendingUp className="w-4 h-4 text-green-500" />
                          <span className="text-xs text-muted-foreground">Pontos Fortes</span>
                        </div>
                        <p className="text-sm font-medium truncate">
                          {snapshot.strongSkills[0]?.name || "-"}
                        </p>
                      </div>

                      <div className="p-3 rounded-lg bg-background border">
                        <div className="flex items-center gap-2 mb-1">
                          <AlertTriangle className="w-4 h-4 text-yellow-500" />
                          <span className="text-xs text-muted-foreground">Atenção</span>
                        </div>
                        <p className="text-sm font-medium truncate">
                          {snapshot.weakSkills[0]?.name || "-"}
                        </p>
                      </div>
                    </div>

                    {/* Sugestões de pauta */}
                    {suggestedTopics.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Lightbulb className="w-4 h-4 text-yellow-500" />
                          <span className="text-sm font-medium">Sugestões de Pauta</span>
                        </div>
                        <div className="space-y-2">
                          {suggestedTopics.map((topic, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-3 p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                              onClick={() => toggleTopic(topic)}
                            >
                              <Checkbox 
                                checked={selectedTopics.includes(topic)}
                                onCheckedChange={() => toggleTopic(topic)}
                              />
                              <span className="text-sm flex-1">{topic}</span>
                              <MessageSquare className="w-4 h-4 text-muted-foreground" />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Metas pendentes */}
                    {snapshot.pendingGoals.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Clipboard className="w-4 h-4 text-blue-500" />
                          <span className="text-sm font-medium">Metas PDI em Andamento</span>
                        </div>
                        <div className="space-y-1">
                          {snapshot.pendingGoals.map((goal, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm">
                              <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                              <span className={goal.isOverdue ? "text-red-500" : ""}>
                                {goal.title}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {goal.progress}%
                              </Badge>
                              {goal.isOverdue && (
                                <Badge variant="destructive" className="text-xs">
                                  Atrasada
                                </Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Conquistas recentes */}
                    {snapshot.recentAchievements.length > 0 && (
                      <div className="flex items-center gap-2 pt-2 border-t">
                        <Trophy className="w-4 h-4 text-yellow-500" />
                        <span className="text-xs text-muted-foreground">
                          Conquistas recentes:{" "}
                          {snapshot.recentAchievements.map(a => a.title).join(", ")}
                        </span>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}
