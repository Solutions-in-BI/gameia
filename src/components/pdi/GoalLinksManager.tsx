/**
 * GoalLinksManager - Gerenciador de vínculos de uma meta
 * Exibe e gerencia treinamentos, jogos, desafios vinculados
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BookOpen, Gamepad2, Trophy, Brain, 
  ChevronDown, ChevronUp, Check, Clock,
  ExternalLink, Loader2
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

interface DevelopmentGoal {
  id: string;
  linked_training_ids?: string[];
  linked_challenge_ids?: string[];
  linked_cognitive_test_ids?: string[];
  related_games?: string[];
}

interface GoalLinksManagerProps {
  goal: DevelopmentGoal;
  userId: string;
  compact?: boolean;
}

interface LinkedItem {
  id: string;
  name: string;
  type: "training" | "challenge" | "cognitive_test" | "game";
  completed: boolean;
  progress?: number;
  link?: string;
}

const TYPE_CONFIG = {
  training: {
    icon: BookOpen,
    label: "Treinamento",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  challenge: {
    icon: Trophy,
    label: "Desafio",
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
  },
  cognitive_test: {
    icon: Brain,
    label: "Teste Cognitivo",
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
  },
  game: {
    icon: Gamepad2,
    label: "Jogo",
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
  },
};

export function GoalLinksManager({ goal, userId, compact = false }: GoalLinksManagerProps) {
  const [expanded, setExpanded] = useState(!compact);

  // Buscar detalhes dos itens vinculados
  const { data: linkedItems = [], isLoading } = useQuery({
    queryKey: ["goal-linked-items", goal.id],
    queryFn: async () => {
      const items: LinkedItem[] = [];

      // Buscar treinamentos
      if (goal.linked_training_ids?.length) {
        const { data: trainings } = await supabase
          .from("trainings")
          .select("id, title")
          .in("id", goal.linked_training_ids);

        // Buscar progresso do usuário
        const { data: progress } = await supabase
          .from("user_training_progress")
          .select("training_id, completed_at, progress_percentage")
          .eq("user_id", userId)
          .in("training_id", goal.linked_training_ids);

        const progressMap = new Map(progress?.map(p => [p.training_id, p]) || []);

        trainings?.forEach(t => {
          const userProgress = progressMap.get(t.id);
          items.push({
            id: t.id,
            name: t.title,
            type: "training",
            completed: !!userProgress?.completed_at,
            progress: userProgress?.progress_percentage || 0,
            link: `/app/trainings/${t.id}`,
          });
        });
      }

      // Buscar desafios
      if (goal.linked_challenge_ids?.length) {
        const { data: challenges } = await supabase
          .from("commitments")
          .select("id, name, status")
          .in("id", goal.linked_challenge_ids);

        const { data: participation } = await supabase
          .from("commitment_participants")
          .select("commitment_id, individual_progress")
          .eq("user_id", userId)
          .in("commitment_id", goal.linked_challenge_ids);

        const participationMap = new Map(participation?.map(p => [p.commitment_id, p]) || []);

        challenges?.forEach(c => {
          const userPart = participationMap.get(c.id);
          items.push({
            id: c.id,
            name: c.name,
            type: "challenge",
            completed: c.status === "completed" || (userPart?.individual_progress || 0) >= 100,
            progress: userPart?.individual_progress || 0,
            link: `/app/challenges/${c.id}`,
          });
        });
      }

      // Buscar testes cognitivos
      if (goal.linked_cognitive_test_ids?.length) {
        const { data: tests } = await supabase
          .from("cognitive_tests")
          .select("id, name")
          .in("id", goal.linked_cognitive_test_ids);

        const { data: sessions } = await supabase
          .from("cognitive_test_sessions")
          .select("test_id, status, score")
          .eq("user_id", userId)
          .in("test_id", goal.linked_cognitive_test_ids)
          .eq("status", "completed");

        const completedTests = new Set(sessions?.map(s => s.test_id) || []);

        tests?.forEach(t => {
          items.push({
            id: t.id,
            name: t.name,
            type: "cognitive_test",
            completed: completedTests.has(t.id),
            link: `/app/cognitive-tests/${t.id}`,
          });
        });
      }

      // Jogos (não têm link direto no banco)
      if (goal.related_games?.length) {
        const gameNames: Record<string, string> = {
          negotiation_arena: "Arena de Negociação",
          prioritization_game: "Jogo de Priorização",
          memory_match: "Memory Match",
          sales_pitch: "Sales Pitch",
          decision_maker: "Decision Maker",
        };

        goal.related_games.forEach(gameId => {
          items.push({
            id: gameId,
            name: gameNames[gameId] || gameId,
            type: "game",
            completed: false, // Jogos não têm "conclusão" definitiva
            link: `/app/arena`,
          });
        });
      }

      return items;
    },
  });

  const completedCount = linkedItems.filter(i => i.completed).length;
  const totalCount = linkedItems.length;
  const overallProgress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  if (totalCount === 0) {
    return null;
  }

  return (
    <div className="rounded-lg border border-border/50 bg-muted/20">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-3 text-left hover:bg-muted/40 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="flex -space-x-1">
            {Object.entries(TYPE_CONFIG).map(([type, config]) => {
              const hasType = linkedItems.some(i => i.type === type);
              if (!hasType) return null;
              const Icon = config.icon;
              return (
                <div
                  key={type}
                  className={cn("w-6 h-6 rounded-full flex items-center justify-center", config.bgColor)}
                >
                  <Icon className={cn("h-3 w-3", config.color)} />
                </div>
              );
            })}
          </div>
          <div>
            <span className="text-sm font-medium">
              {completedCount}/{totalCount} atividades
            </span>
            <Progress value={overallProgress} className="h-1 w-20 mt-1" />
          </div>
        </div>
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-3 pt-0 space-y-2">
              {isLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : (
                linkedItems.map((item) => {
                  const config = TYPE_CONFIG[item.type];
                  const Icon = config.icon;

                  return (
                    <div
                      key={`${item.type}-${item.id}`}
                      className="flex items-center gap-3 p-2 rounded-lg bg-background/50"
                    >
                      <div className={cn("p-1.5 rounded", config.bgColor)}>
                        <Icon className={cn("h-3.5 w-3.5", config.color)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge
                            variant={item.completed ? "default" : "secondary"}
                            className="text-xs h-5"
                          >
                            {item.completed ? (
                              <>
                                <Check className="h-3 w-3 mr-1" />
                                Concluído
                              </>
                            ) : (
                              <>
                                <Clock className="h-3 w-3 mr-1" />
                                {item.progress !== undefined ? `${item.progress}%` : "Pendente"}
                              </>
                            )}
                          </Badge>
                        </div>
                      </div>
                      {item.link && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          asChild
                        >
                          <Link to={item.link}>
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                        </Button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
