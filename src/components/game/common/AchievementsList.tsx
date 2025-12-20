import { cn } from "@/lib/utils";

/**
 * ===========================================
 * COMPONENTE: AchievementsList
 * ===========================================
 * 
 * Lista de conquistas com progresso visual.
 */

interface AchievementWithStatus {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  isUnlocked: boolean;
  unlockedAt?: string;
}

interface AchievementsListProps {
  achievements: AchievementWithStatus[];
  title?: string;
}

export function AchievementsList({ achievements, title }: AchievementsListProps) {
  return (
    <div className="space-y-4">
      {title && (
        <h3 className="text-lg font-bold text-foreground">{title}</h3>
      )}
      
      <div className="grid gap-3">
        {achievements.map((achievement) => (
          <div
            key={achievement.id}
            className={cn(
              "flex items-center gap-4 p-4 rounded-xl border transition-all",
              achievement.isUnlocked
                ? "bg-primary/10 border-primary/30"
                : "bg-muted/30 border-border/50 opacity-60"
            )}
          >
            <div className={cn(
              "text-3xl",
              !achievement.isUnlocked && "grayscale"
            )}>
              {achievement.icon}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground">
                  {achievement.name}
                </span>
                {achievement.isUnlocked && (
                  <span className="text-xs text-primary">✓</span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {achievement.description}
              </p>
            </div>

            {achievement.isUnlocked && achievement.unlockedAt && (
              <div className="text-xs text-muted-foreground">
                {new Date(achievement.unlockedAt).toLocaleDateString()}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
