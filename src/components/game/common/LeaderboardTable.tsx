import { LeaderboardEntry } from "@/types/leaderboard";
import { getTitleById, RARITY_COLORS } from "@/constants/titles";
import { cn } from "@/lib/utils";

interface UserRankInfo {
  entry: LeaderboardEntry;
  position: number;
}

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  isLoading: boolean;
  gameType: "memory" | "snake" | "dino" | "tetris";
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
        <LeaderboardRow
          key={entry.id}
          entry={entry}
          position={index + 1}
          gameType={gameType}
          isHighlighted={
            (highlightName && entry.player_name === highlightName) || 
            (userRank && entry.user_id === userRank.entry.user_id)
          }
        />
      ))}

      {/* Separador e posição do usuário fora do top 10 */}
      {showUserRank && (
        <>
          <div className="flex items-center gap-2 py-2">
            <div className="flex-1 border-t border-dashed border-border/50" />
            <span className="text-xs text-muted-foreground">sua posição</span>
            <div className="flex-1 border-t border-dashed border-border/50" />
          </div>
          
          <LeaderboardRow
            entry={userRank.entry}
            position={userRank.position}
            gameType={gameType}
            isHighlighted={true}
            isCurrentUser={true}
          />
        </>
      )}
    </div>
  );
}

// Componente separado para cada linha do ranking
interface LeaderboardRowProps {
  entry: LeaderboardEntry;
  position: number;
  gameType: string;
  isHighlighted?: boolean;
  isCurrentUser?: boolean;
}

function LeaderboardRow({ entry, position, gameType, isHighlighted, isCurrentUser }: LeaderboardRowProps) {
  const getMedalEmoji = (pos: number) => {
    switch (pos) {
      case 1: return "🥇";
      case 2: return "🥈";
      case 3: return "🥉";
      default: return `${pos}º`;
    }
  };

  // Busca título do jogador
  const title = entry.profile?.selected_title ? getTitleById(entry.profile.selected_title) : null;
  const titleRarity = title ? RARITY_COLORS[title.rarity] : null;

  return (
    <div
      className={cn(
        "flex items-center gap-3 p-3 rounded-xl border-2 transition-all",
        isHighlighted
          ? "bg-primary/10 border-primary/50"
          : "bg-card/50 border-border/50 hover:border-border"
      )}
    >
      {/* Posição */}
      <div className="w-10 text-center text-xl font-bold">
        {getMedalEmoji(position)}
      </div>
      
      {/* Avatar */}
      <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
        {entry.profile?.avatar_url ? (
          <img 
            src={entry.profile.avatar_url} 
            alt={entry.player_name} 
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-lg font-bold text-primary">
            {entry.player_name.charAt(0).toUpperCase()}
          </span>
        )}
      </div>
      
      {/* Nome e Título */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-foreground truncate">
            {entry.player_name}
          </span>
          {isCurrentUser && (
            <span className="text-xs text-primary font-medium">(você)</span>
          )}
        </div>
        {title && (
          <div className={cn(
            "inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full mt-0.5",
            titleRarity?.bg,
            titleRarity?.text
          )}>
            <span>{title.icon}</span>
            <span>{title.name}</span>
          </div>
        )}
      </div>
      
      {/* Score */}
      <div className="text-right flex-shrink-0">
        <span className="text-lg font-bold text-primary">
          {entry.score}
        </span>
        <span className="text-sm text-muted-foreground ml-1">
          {gameType === "memory" ? "mov" : "pts"}
        </span>
      </div>
    </div>
  );
}
