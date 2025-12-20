import { useState, useEffect } from "react";
import { RotateCcw } from "lucide-react";
import { GameLayout } from "../common/GameLayout";
import { GameButton } from "../common/GameButton";
import { MemoryCard } from "./MemoryCard";
import { MemoryStats } from "./MemoryStats";
import { DifficultySelector } from "./DifficultySelector";
import { WinModal } from "./WinModal";
import { AchievementToast } from "../common/AchievementToast";
import { SubmitScoreModal } from "../common/SubmitScoreModal";
import { useMemoryGame } from "@/hooks/useMemoryGame";
import { useAchievements } from "@/hooks/useAchievements";
import { useLeaderboard } from "@/hooks/useLeaderboard";

/**
 * ===========================================
 * COMPONENTE: MemoryGame
 * ===========================================
 * 
 * Componente principal do jogo da memória.
 * Integrado com conquistas e ranking online.
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

  const { checkAndUnlock } = useAchievements();
  const { addScore } = useLeaderboard("memory", difficulty);

  // Estado para toasts e modais
  const [unlockedAchievement, setUnlockedAchievement] = useState<string | null>(null);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasCheckedAchievements, setHasCheckedAchievements] = useState(false);

  // Verifica conquistas quando ganha
  useEffect(() => {
    if (hasWon && !hasCheckedAchievements) {
      const unlocked = checkAndUnlock({
        game: "memory",
        moves,
        time,
        difficulty,
      });

      // Mostra toast da primeira conquista desbloqueada
      if (unlocked.length > 0) {
        setUnlockedAchievement(unlocked[0]);
      }

      setHasCheckedAchievements(true);
      
      // Mostra modal de score após um delay
      setTimeout(() => setShowScoreModal(true), 1500);
    }
  }, [hasWon, moves, time, difficulty, checkAndUnlock, hasCheckedAchievements]);

  // Reset do estado quando reinicia
  const handleReset = () => {
    setHasCheckedAchievements(false);
    setShowScoreModal(false);
    resetGame();
  };

  // Submete score ao ranking
  const handleSubmitScore = async (playerName: string) => {
    setIsSubmitting(true);
    await addScore({
      player_name: playerName,
      game_type: "memory",
      score: moves,
      difficulty,
    });
    setIsSubmitting(false);
    setShowScoreModal(false);
  };

  return (
    <GameLayout title="Jogo da Memória" subtitle="Encontre todos os pares!">
      {/* Controles */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
        <DifficultySelector 
          difficulty={difficulty} 
          onSelect={changeDifficulty} 
        />
        
        <div className="flex gap-3">
          <GameButton variant="secondary" icon={RotateCcw} onClick={handleReset}>
            Reiniciar
          </GameButton>
          <GameButton variant="muted" onClick={onBack}>
            Voltar ao Menu
          </GameButton>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="mb-8">
        <MemoryStats moves={moves} time={time} bestScore={bestScore} />
      </div>

      {/* Tabuleiro */}
      <div className={`grid ${gridCols} gap-3 md:gap-4 max-w-2xl mx-auto`}>
        {cards.map((card, index) => (
          <div
            key={card.id}
            className="animate-scale-in"
            style={{ animationDelay: `${index * 50}ms` }}
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

      {/* Toast de Conquista */}
      <AchievementToast
        achievementId={unlockedAchievement}
        onClose={() => setUnlockedAchievement(null)}
      />

      {/* Modal de Envio de Score */}
      <SubmitScoreModal
        isOpen={showScoreModal}
        onClose={() => setShowScoreModal(false)}
        onSubmit={handleSubmitScore}
        score={moves}
        gameType="memory"
        isSubmitting={isSubmitting}
      />
    </GameLayout>
  );
}

// Export default para manter compatibilidade
export default MemoryGame;
