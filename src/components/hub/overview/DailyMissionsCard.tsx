/**
 * DailyMissionsCard - Card de missões diárias no HubOverview
 */

import { motion } from "framer-motion";
import {
  Target,
  Check,
  Flame,
  Brain,
  Gamepad2,
  Trophy,
  Medal,
  Clock,
  Sparkles,
} from "lucide-react";
import { useDailyMissions, type DailyMission } from "@/hooks/useDailyMissions";
import { HubCard, HubCardHeader } from "../common";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<string, typeof Target> = {
  target: Target,
  flame: Flame,
  brain: Brain,
  "gamepad-2": Gamepad2,
  trophy: Trophy,
  medal: Medal,
};

export function DailyMissionsCard() {
  const {
    missions,
    isLoading,
    completedCount,
    totalCount,
    totalXpAvailable,
    totalCoinsAvailable,
    claimMission,
  } = useDailyMissions();

  if (isLoading) {
    return (
      <HubCard>
        <HubCardHeader title="Missões Diárias" description="Carregando..." />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </HubCard>
    );
  }

  if (missions.length === 0) {
    return (
      <HubCard>
        <HubCardHeader
          title="Missões Diárias"
          description="Nenhuma missão disponível"
        />
        <div className="text-center py-6 text-muted-foreground">
          <Clock className="w-10 h-10 mx-auto mb-2" />
          <p className="text-sm">Novas missões amanhã!</p>
        </div>
      </HubCard>
    );
  }

  const handleClaim = async (mission: DailyMission) => {
    if (mission.current_value >= mission.target_value && !mission.is_completed) {
      await claimMission(mission.id);
    }
  };

  // Get time until midnight for countdown
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  const hoursRemaining = Math.floor((midnight.getTime() - now.getTime()) / (1000 * 60 * 60));
  const minutesRemaining = Math.floor(
    ((midnight.getTime() - now.getTime()) % (1000 * 60 * 60)) / (1000 * 60)
  );

  return (
    <HubCard>
      <HubCardHeader
        title="Missões Diárias"
        description={`${completedCount}/${totalCount} completas`}
        action={
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              <Sparkles className="w-3 h-3 mr-1" />
              {totalXpAvailable} XP
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {hoursRemaining}h {minutesRemaining}m
            </Badge>
          </div>
        }
      />

      <div className="space-y-3">
        {missions.map((mission, index) => {
          const Icon = ICON_MAP[mission.icon] || Target;
          const progress = Math.round(
            (mission.current_value / mission.target_value) * 100
          );
          const isComplete = mission.current_value >= mission.target_value;
          const isClaimed = mission.is_completed;

          return (
            <motion.div
              key={mission.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                "relative p-3 rounded-lg border transition-all",
                mission.is_bonus
                  ? "border-primary/50 bg-primary/5"
                  : "border-border/30 bg-muted/20",
                isClaimed && "opacity-60"
              )}
            >
              {mission.is_bonus && (
                <Badge
                  className="absolute -top-2 right-2 text-xs bg-primary text-primary-foreground"
                >
                  BÔNUS
                </Badge>
              )}

              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "p-2 rounded-lg",
                    isClaimed
                      ? "bg-gameia-success/20 text-gameia-success"
                      : mission.is_bonus
                      ? "bg-primary/20 text-primary"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {isClaimed ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Icon className="w-4 h-4" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p
                      className={cn(
                        "font-medium text-sm truncate",
                        isClaimed && "line-through text-muted-foreground"
                      )}
                    >
                      {mission.title}
                    </p>
                    <span className="text-xs text-muted-foreground flex-shrink-0">
                      {mission.current_value}/{mission.target_value}
                    </span>
                  </div>

                  {mission.description && (
                    <p className="text-xs text-muted-foreground truncate">
                      {mission.description}
                    </p>
                  )}

                  <div className="flex items-center gap-2 mt-1">
                    <Progress
                      value={progress}
                      className={cn("h-1.5 flex-1", isClaimed && "bg-gameia-success/30")}
                    />
                    <span className="text-xs font-medium text-primary">
                      +{mission.xp_reward} XP
                    </span>
                  </div>
                </div>

                {isComplete && !isClaimed && (
                  <Button
                    size="sm"
                    variant="default"
                    className="flex-shrink-0"
                    onClick={() => handleClaim(mission)}
                  >
                    <Check className="w-3 h-3 mr-1" />
                    Resgatar
                  </Button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Summary footer */}
      {completedCount === totalCount && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-4 p-3 rounded-lg bg-gameia-success/10 border border-gameia-success/30 text-center"
        >
          <Trophy className="w-6 h-6 mx-auto mb-1 text-gameia-success" />
          <p className="font-semibold text-gameia-success">Todas Completas!</p>
          <p className="text-xs text-muted-foreground">
            Volte amanhã para novas missões
          </p>
        </motion.div>
      )}
    </HubCard>
  );
}
