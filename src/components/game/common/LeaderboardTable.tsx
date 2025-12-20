import { LeaderboardEntry } from "@/types/leaderboard";
import { cn } from "@/lib/utils";

/**
 * ===========================================
 * COMPONENTE: LeaderboardTable
 * ===========================================
 * 
 * Tabela de ranking com top 10 jogadores.
 */

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  isLoading: boolean;
  gameType: "memory" | "snake";
  highlightName?: string;
}

export function LeaderboardTable({ 
  entries, 
  isLoading, 
  gameType,
  highlightName 
}: LeaderboardTableProps) {
  if (isLoading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Carregando ranking...
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Nenhum score registrado ainda. Seja o primeiro!
      </div>
    );
  }

  const getMedalEmoji = (position: number) => {
    switch (position) {
      case 0: return "🥇";
      case 1: return "🥈";
      case 2: return "🥉";
      default: return `${position + 1}º`;
    }
  };

  return (
    <div className="space-y-2">
      {entries.map((entry, index) => (
        <div
          key={entry.id}
          className={cn(
            "flex items-center gap-4 p-3 rounded-lg border transition-all",
            highlightName && entry.player_name === highlightName
              ? "bg-primary/20 border-primary/50"
              : "bg-card/50 border-border/50"
          )}
        >
          <div className="w-10 text-center text-xl">
            {getMedalEmoji(index)}
          </div>
          
          <div className="flex-1 font-medium text-foreground truncate">
            {entry.player_name}
          </div>
          
          <div className="text-right">
            <span className="text-lg font-bold text-primary">
              {entry.score}
            </span>
            <span className="text-sm text-muted-foreground ml-1">
              {gameType === "memory" ? "movimentos" : "pts"}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
