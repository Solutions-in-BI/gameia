/**
 * GoalProgressHistory - Histórico de progresso automático de uma meta
 * Mostra como o progresso foi calculado ao longo do tempo
 */

import { motion } from "framer-motion";
import { 
  BookOpen, Gamepad2, Trophy, Brain, 
  TrendingUp, Clock, Sparkles, User
} from "lucide-react";
import { useGoalProgress } from "@/hooks/useGoalProgress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

const SOURCE_CONFIG: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  training: { icon: BookOpen, color: "text-blue-500", label: "Treinamento" },
  module: { icon: BookOpen, color: "text-blue-400", label: "Módulo" },
  game: { icon: Gamepad2, color: "text-emerald-500", label: "Jogo" },
  challenge: { icon: Trophy, color: "text-amber-500", label: "Desafio" },
  cognitive_test: { icon: Brain, color: "text-purple-500", label: "Teste Cognitivo" },
  manual_checkin: { icon: User, color: "text-primary", label: "Check-in" },
  manager_adjustment: { icon: User, color: "text-orange-500", label: "Ajuste do Gestor" },
};

interface GoalProgressHistoryProps {
  goalId: string;
  maxHeight?: string;
}

export function GoalProgressHistory({ goalId, maxHeight = "300px" }: GoalProgressHistoryProps) {
  const { progressHistory, historyLoading } = useGoalProgress(goalId);

  if (historyLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-pulse flex items-center gap-2 text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span className="text-sm">Carregando histórico...</span>
        </div>
      </div>
    );
  }

  if (progressHistory.length === 0) {
    return (
      <div className="text-center py-8">
        <Sparkles className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
        <p className="text-sm text-muted-foreground">
          Nenhum progresso automático registrado ainda.
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Complete treinamentos ou jogos vinculados para ver o histórico aqui.
        </p>
      </div>
    );
  }

  return (
    <ScrollArea style={{ maxHeight }} className="pr-4">
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />

        <div className="space-y-4">
          {progressHistory.map((event, index) => {
            const config = SOURCE_CONFIG[event.source_type] || SOURCE_CONFIG.manual_checkin;
            const Icon = config.icon;
            const eventDate = event.created_at;

            return (
              <motion.div
                key={`${event.goal_id}-${eventDate || index}-${index}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="relative pl-10"
              >
                {/* Timeline dot */}
                <div className={cn(
                  "absolute left-2.5 top-2 w-3 h-3 rounded-full border-2 border-background",
                  event.progress_delta > 0 ? "bg-primary" : "bg-muted"
                )} />

                <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "p-1.5 rounded",
                      event.progress_delta > 0 ? "bg-primary/10" : "bg-muted"
                    )}>
                      <Icon className={cn("h-3.5 w-3.5", config.color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium">
                          {event.source_name || config.label}
                        </span>
                        <Badge 
                          variant={event.progress_delta > 0 ? "default" : "secondary"}
                          className="text-xs"
                        >
                          <TrendingUp className="h-3 w-3 mr-1" />
                          +{event.progress_delta}%
                        </Badge>
                        {event.xp_earned && event.xp_earned > 0 && (
                          <Badge variant="outline" className="text-xs">
                            +{event.xp_earned} XP
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <span>
                          {event.progress_before}% → {event.progress_after}%
                        </span>
                        {eventDate && (
                          <>
                            <span>•</span>
                            <span>
                              {formatDistanceToNow(new Date(eventDate), {
                                addSuffix: true,
                                locale: ptBR,
                              })}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </ScrollArea>
  );
}
