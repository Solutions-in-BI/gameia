import { LeaderboardEntry } from "@/types/leaderboard";
import { cn } from "@/lib/utils";

interface UserRankInfo {
  entry: LeaderboardEntry;
  position: number;
}

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  isLoading: boolean;
  gameType: "memory" | "snake" | "dino";
  highlightName?: string;
  userRank?: UserRankInfo | null;
}

export function LeaderboardTable({ 
  entries, 
  isLoading, 
  gameType,
  highlightName,
  userRank 
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
      case 1: return "🥇";
      case 2: return "🥈";
      case 3: return "🥉";
      default: return `${position}º`;
    }
  };

  // Verifica se o usuário está fora do top 10
  const showUserRank = userRank && userRank.position > 10;

  return (
    <div className="space-y-2">
      {entries.map((entry, index) => (
        <div
          key={entry.id}
          className={cn(
            "flex items-center gap-4 p-3 rounded-lg border transition-all",
            (highlightName && entry.player_name === highlightName) || 
            (userRank && entry.user_id === userRank.entry.user_id)
              ? "bg-primary/20 border-primary/50"
              : "bg-card/50 border-border/50"
          )}
        >
          <div className="w-10 text-center text-xl">
            {getMedalEmoji(index + 1)}
          </div>
          
          <div className="flex-1 font-medium text-foreground truncate">
            {entry.player_name}
          </div>
          
          <div className="text-right">
            <span className="text-lg font-bold text-primary">
              {entry.score}
            </span>
            <span className="text-sm text-muted-foreground ml-1">
              {gameType === "memory" ? "mov" : "pts"}
            </span>
          </div>
        </div>
      ))}

      {/* Separador e posição do usuário fora do top 10 */}
      {showUserRank && (
        <>
          <div className="flex items-center gap-2 py-2">
            <div className="flex-1 border-t border-dashed border-border/50" />
            <span className="text-xs text-muted-foreground">sua posição</span>
            <div className="flex-1 border-t border-dashed border-border/50" />
          </div>
          
          <div className="flex items-center gap-4 p-3 rounded-lg border bg-primary/10 border-primary/30">
            <div className="w-10 text-center text-lg font-bold text-primary">
              {userRank.position}º
            </div>
            
            <div className="flex-1 font-medium text-foreground truncate">
              {userRank.entry.player_name}
              <span className="ml-2 text-xs text-primary">(você)</span>
            </div>
            
            <div className="text-right">
              <span className="text-lg font-bold text-primary">
                {userRank.entry.score}
              </span>
              <span className="text-sm text-muted-foreground ml-1">
                {gameType === "memory" ? "mov" : "pts"}
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
