import { Timer, Zap, Trophy } from "lucide-react";

interface GameStatsProps {
  moves: number;
  time: number;
  bestScore: number | null;
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const GameStats = ({ moves, time, bestScore }: GameStatsProps) => {
  return (
    <div className="flex flex-wrap gap-3 md:gap-4 justify-center">
      <div className="stat-card flex items-center gap-3">
        <Zap className="w-5 h-5 text-secondary" />
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Movimentos</p>
          <p className="text-xl font-display font-bold text-foreground">{moves}</p>
        </div>
      </div>
      
      <div className="stat-card flex items-center gap-3">
        <Timer className="w-5 h-5 text-primary animate-pulse-glow" />
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Tempo</p>
          <p className="text-xl font-display font-bold text-foreground">{formatTime(time)}</p>
        </div>
      </div>

      {bestScore !== null && (
        <div className="stat-card flex items-center gap-3">
          <Trophy className="w-5 h-5 text-game-warning" />
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Recorde</p>
            <p className="text-xl font-display font-bold text-foreground">{bestScore}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameStats;
