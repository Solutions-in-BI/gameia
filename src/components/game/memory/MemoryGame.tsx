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
import { useGameRewards } from "@/hooks/useGameRewards";

/**
 * ===========================================
 * COMPONENTE: MemoryGame
 * ===========================================
 * 
 * Jogo da Memória - Ganha XP e Moedas!
 * Menos movimentos = mais recompensas
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
  const { completeGame } = useGameRewards();

  const [hasSavedScore, setHasSavedScore] = useState(false);

  useEffect(() => {
    if (hasWon && !hasSavedScore) {
      setHasSavedScore(true);
      
      // Calcula score baseado em moves (menos = melhor)
      // Inversão: moves baixos geram score alto
      const pairsCount = cards.length / 2;
      const perfectMoves = pairsCount; // Mínimo teórico
      const efficiency = Math.max(0, 100 - ((moves - perfectMoves) / pairsCount) * 50);
      const score = Math.round(efficiency * (difficulty === "hard" ? 3 : difficulty === "medium" ? 2 : 1));
      
      // Aplica recompensas via useGameRewards
      completeGame({
        gameType: "memory",
        score,
        difficulty,
        timeSpentSeconds: time,
        metadata: { moves, pairs: pairsCount, efficiency }
      });

      // Salva no leaderboard
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
  }, [hasWon, moves, difficulty, hasSavedScore, isAuthenticated, profile, addScore, toast, completeGame, cards.length, time]);

  const handleReset = () => {
    setHasSavedScore(false);
    resetGame();
  };

  return (
    <GameLayout title="Jogo da Memória" subtitle="Complete os pares para ganhar XP!" onBack={onBack}>
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
