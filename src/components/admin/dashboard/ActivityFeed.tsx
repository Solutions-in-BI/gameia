/**
 * Feed de Atividades Recentes
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  Gamepad2,
  Trophy,
  Flame,
  Zap,
  Target,
  Award,
  MessageSquare,
  Clock,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ActivityItem {
  id: string;
  user_id: string;
  activity_type: string;
  game_type: string | null;
  xp_earned: number;
  coins_earned: number;
  score: number;
  created_at: string;
  nickname?: string;
  avatar_url?: string | null;
}

interface ActivityFeedProps {
  orgId: string;
  limit?: number;
}

export function ActivityFeed({ orgId, limit = 10 }: ActivityFeedProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
  }, [orgId]);

  const fetchActivities = async () => {
    try {
      const { data, error } = await supabase
        .from("user_activity_log")
        .select(`
          id,
          user_id,
          activity_type,
          game_type,
          xp_earned,
          coins_earned,
          metadata,
          created_at,
          profiles!inner(nickname, avatar_url)
        `)
        .eq("organization_id", orgId)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;

      const formatted = (data || []).map((a: any) => {
        const metadata = a.metadata as Record<string, unknown> | null;
        return {
          id: a.id,
          user_id: a.user_id,
          activity_type: a.activity_type,
          game_type: a.game_type,
          xp_earned: a.xp_earned || 0,
          coins_earned: a.coins_earned || 0,
          score: (metadata?.score as number) || 0,
          created_at: a.created_at,
          nickname: a.profiles?.nickname,
          avatar_url: a.profiles?.avatar_url,
        };
      });

      setActivities(formatted);
    } catch (error) {
      console.error("Error fetching activities:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getActivityIcon = (type: string, gameType?: string | null) => {
    switch (type) {
      case "game_played":
        return <Gamepad2 className="h-4 w-4 text-primary" />;
      case "quiz_completed":
        return <Target className="h-4 w-4 text-secondary" />;
      case "decision_made":
        return <MessageSquare className="h-4 w-4 text-accent" />;
      case "badge_earned":
        return <Award className="h-4 w-4 text-amber-500" />;
      case "level_up":
        return <Trophy className="h-4 w-4 text-amber-500" />;
      case "streak_recorded":
        return <Flame className="h-4 w-4 text-orange-500" />;
      default:
        return <Activity className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getActivityLabel = (type: string, gameType?: string | null) => {
    switch (type) {
      case "game_played":
        const gameNames: Record<string, string> = {
          snake: "Snake",
          dino: "Dino Runner",
          tetris: "Tetris",
          memory: "Memória",
          quiz: "Quiz",
          decision: "Decisão",
          sales: "Vendas",
        };
        return `Jogou ${gameNames[gameType || ""] || gameType}`;
      case "quiz_completed":
        return "Completou um quiz";
      case "decision_made":
        return "Tomou uma decisão";
      case "badge_earned":
        return "Ganhou uma insígnia";
      case "level_up":
        return "Subiu de nível";
      case "streak_recorded":
        return "Registrou streak";
      case "sales_session":
        return "Sessão de vendas";
      default:
        return "Atividade registrada";
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-16 rounded-lg bg-muted/50 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-8">
        <Activity className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground">
          Nenhuma atividade recente
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <AnimatePresence mode="popLayout">
        {activities.map((activity, index) => (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
          >
            <Avatar className="h-8 w-8">
              <AvatarImage src={activity.avatar_url || undefined} />
              <AvatarFallback className="text-xs">
                {activity.nickname?.charAt(0).toUpperCase() || "?"}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                {getActivityIcon(activity.activity_type, activity.game_type)}
                <span className="font-medium text-sm text-foreground truncate">
                  {activity.nickname}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {getActivityLabel(activity.activity_type, activity.game_type)}
                {activity.score > 0 && ` • ${activity.score} pts`}
              </p>
            </div>

            <div className="text-right flex-shrink-0">
              {activity.xp_earned > 0 && (
                <div className="flex items-center gap-1 text-xs text-primary">
                  <Zap className="h-3 w-3" />
                  +{activity.xp_earned}
                </div>
              )}
              <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDistanceToNow(new Date(activity.created_at), {
                  addSuffix: true,
                  locale: ptBR,
                })}
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
