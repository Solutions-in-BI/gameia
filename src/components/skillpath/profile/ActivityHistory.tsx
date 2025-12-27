/**
 * Componente de Histórico de Atividades
 */

import { motion } from "framer-motion";
import { History, Coins, Zap, Clock } from "lucide-react";
import { useActivities } from "@/hooks/useActivities";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export function ActivityHistory() {
  const { activities, isLoading, getActivityIcon, getActivityLabel } = useActivities();

  if (isLoading) {
    return (
      <div className="gameia-card p-6">
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-4 animate-pulse">
              <div className="w-12 h-12 bg-muted rounded-xl" />
              <div className="flex-1">
                <div className="h-4 bg-muted rounded w-1/2 mb-2" />
                <div className="h-3 bg-muted rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="gameia-card p-12 text-center">
        <History className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
        <h3 className="font-display font-bold text-foreground mb-2">
          Nenhuma atividade ainda
        </h3>
        <p className="text-muted-foreground text-sm">
          Suas atividades aparecerão aqui conforme você usa a plataforma.
        </p>
      </div>
    );
  }

  // Group activities by date
  const groupedActivities = activities.reduce((groups, activity) => {
    const date = new Date(activity.created_at).toLocaleDateString('pt-BR');
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(activity);
    return groups;
  }, {} as Record<string, typeof activities>);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {Object.entries(groupedActivities).map(([date, dayActivities], groupIndex) => (
        <div key={date} className="gameia-card p-6">
          <h3 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            {date === new Date().toLocaleDateString('pt-BR') ? 'Hoje' : date}
          </h3>
          
          <div className="space-y-3">
            {dayActivities.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: (groupIndex * 0.1) + (index * 0.05) }}
                className="flex items-center gap-4 p-3 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl">
                  {getActivityIcon(activity.activity_type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-foreground truncate">
                    {getActivityLabel(activity.activity_type)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(activity.created_at), {
                      addSuffix: true,
                      locale: ptBR,
                    })}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {activity.xp_earned > 0 && (
                    <div className="flex items-center gap-1 text-sm font-medium text-primary">
                      <Zap className="w-4 h-4" />
                      +{activity.xp_earned}
                    </div>
                  )}
                  {activity.coins_earned > 0 && (
                    <div className="flex items-center gap-1 text-sm font-medium text-gameia-warning">
                      <Coins className="w-4 h-4" />
                      +{activity.coins_earned}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ))}
    </motion.div>
  );
}
