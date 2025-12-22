/**
 * ProfileStats - Estatísticas do jogador
 */

interface StatsData {
  totalGamesPlayed: number;
  snakeBestScore: number;
  dinoBestScore: number;
  tetrisBestScore: number;
  memoryGamesPlayed: number;
}

interface ProgressData {
  unlocked: number;
  total: number;
  percentage: number;
}

interface ProfileStatsProps {
  stats: StatsData;
  progress: ProgressData;
}

export function ProfileStats({ stats, progress }: ProfileStatsProps) {
  return (
    <div className="space-y-4">
      {/* Estatísticas */}
      <div className="bg-card border border-border rounded-xl p-4">
        <h3 className="text-sm font-medium text-muted-foreground mb-3">📊 Estatísticas</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatItem value={stats.totalGamesPlayed} label="Jogos Totais" />
          <StatItem value={stats.snakeBestScore} label="Recorde Snake" />
          <StatItem value={stats.dinoBestScore} label="Recorde Dino" />
          <StatItem value={stats.tetrisBestScore} label="Recorde Tetris" />
        </div>
      </div>

      {/* Progresso Conquistas */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-muted-foreground">Conquistas</span>
          <span className="text-sm font-medium text-foreground">
            {progress.unlocked}/{progress.total}
          </span>
        </div>
        <div className="h-3 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
            style={{ width: `${progress.percentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function StatItem({ value, label }: { value: number; label: string }) {
  return (
    <div className="text-center">
      <p className="text-xl sm:text-2xl font-bold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
