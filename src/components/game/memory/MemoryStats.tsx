import { Timer, Zap, Trophy } from "lucide-react";
import { StatCard } from "../common/StatCard";
import { formatTime } from "@/utils/time";

/**
 * ===========================================
 * COMPONENTE: MemoryStats
 * ===========================================
 * 
 * Exibe as estatísticas do jogo da memória:
 * - Movimentos
 * - Tempo
 * - Recorde (se existir)
 */

interface MemoryStatsProps {
  moves: number;
  time: number;
  bestScore: number | null;
}

export function MemoryStats({ moves, time, bestScore }: MemoryStatsProps) {
  return (
    <div className="flex flex-wrap gap-3 md:gap-4 justify-center">
      <StatCard 
        icon={Zap} 
        label="Movimentos" 
        value={moves} 
        iconColor="text-secondary" 
      />
      
      <StatCard 
        icon={Timer} 
        label="Tempo" 
        value={formatTime(time)} 
        iconColor="text-primary"
        iconAnimation="animate-pulse-glow" 
      />

      {bestScore !== null && (
        <StatCard 
          icon={Trophy} 
          label="Recorde" 
          value={bestScore} 
          iconColor="text-game-warning" 
        />
      )}
    </div>
  );
}
