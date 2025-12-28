import { useState, useEffect } from "react";
import { RotateCcw } from "lucide-react";
import { GameLayout } from "../common/GameLayout";
import { GameButton } from "../common/GameButton";
import { MemoryCard } from "./MemoryCard";
import { MemoryStats } from "./MemoryStats";
import { DifficultySelector } from "./DifficultySelector";
import { WinModal } from "./WinModal";
import { useMemoryGame } from "@/hooks/useMemoryGame";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useStreak } from "@/hooks/useStreak";
import { useActivityLog } from "@/hooks/useActivityLog";

/**
 * ===========================================
 * COMPONENTE: MemoryGame
 * ===========================================
 * 
 * Jogo da Memória para RECREAÇÃO apenas.
 * NÃO gera XP nem Moedas - apenas diversão!
 */

interface MemoryGameProps {
  onBack: () => void;
}

export function MemoryGame({ onBack }: MemoryGameProps) {
  const {
    cards,
    moves,
    time,
    hasWon,
    isNewRecord,
    difficulty,
    bestScore,
    gridCols,
    canFlip,
    handleCardClick,
    changeDifficulty,
    resetGame,
  } = useMemoryGame("easy");

  const { addScore } = useLeaderboard("memory", difficulty);
  const { profile, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const { recordPlay } = useStreak();
  const { logGamePlayed } = useActivityLog();

  const [hasSavedScore, setHasSavedScore] = useState(false);

  useEffect(() => {
    if (hasWon && !hasSavedScore) {
      setHasSavedScore(true);
      
      // Registra play para streak
      recordPlay();
      
      // Registra atividade no log
      logGamePlayed("memory", moves);

      if (isAuthenticated && profile) {
        addScore({
          player_name: profile.nickname,
          user_id: profile.id,
          game_type: "memory",
          score: moves,
          difficulty,
        }).then((result) => {
          if (result.success) {
            toast({ title: "Score salvo!", description: `${moves} movimentos salvos no ranking.` });
          }
        });
      }
    }
  }, [hasWon, moves, difficulty, hasSavedScore, isAuthenticated, profile, addScore, toast, recordPlay, logGamePlayed]);

  const handleReset = () => {
    setHasSavedScore(false);
    resetGame();
  };

  return (
    <GameLayout title="Jogo da Memória" subtitle="Jogo recreativo - apenas diversão!" onBack={onBack}>
      {/* Controles no Topo */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
        <DifficultySelector 
          difficulty={difficulty} 
          onSelect={changeDifficulty} 
        />
        <GameButton variant="muted" icon={RotateCcw} onClick={handleReset} size="sm">
          Reiniciar
        </GameButton>
      </div>

      {/* Estatísticas */}
      <div className="mb-6">
        <MemoryStats moves={moves} time={time} bestScore={bestScore} />
      </div>

      {/* Tabuleiro */}
      <div className={`grid ${gridCols} gap-2 sm:gap-3 max-w-2xl mx-auto mb-6`}>
        {cards.map((card, index) => (
          <div
            key={card.id}
            className="animate-scale-in"
            style={{ animationDelay: `${index * 30}ms` }}
          >
            <MemoryCard
              emoji={card.emoji}
              isFlipped={card.isFlipped}
              isMatched={card.isMatched}
              onClick={() => handleCardClick(card.id)}
              disabled={!canFlip}
            />
          </div>
        ))}
      </div>

      {/* Modal de Vitória */}
      {hasWon && (
        <WinModal
          moves={moves}
          time={time}
          isNewRecord={isNewRecord}
          onPlayAgain={handleReset}
        />
      )}
    </GameLayout>
  );
}
