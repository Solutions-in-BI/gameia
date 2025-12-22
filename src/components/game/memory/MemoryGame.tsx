import { useState, useEffect } from "react";
import { RotateCcw } from "lucide-react";
import { GameLayout } from "../common/GameLayout";
import { GameButton } from "../common/GameButton";
import { MemoryCard } from "./MemoryCard";
import { MemoryStats } from "./MemoryStats";
import { DifficultySelector } from "./DifficultySelector";
import { WinModal } from "./WinModal";
import { AchievementToast } from "../common/AchievementToast";
import { useMemoryGame } from "@/hooks/useMemoryGame";
import { useAchievements } from "@/hooks/useAchievements";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMarketplace } from "@/hooks/useMarketplace";

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
  const { profile, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const { addCoins } = useMarketplace();

  const [unlockedAchievement, setUnlockedAchievement] = useState<string | null>(null);
  const [hasCheckedAchievements, setHasCheckedAchievements] = useState(false);

  useEffect(() => {
    if (hasWon && !hasCheckedAchievements) {
      setHasCheckedAchievements(true);
      
      checkAndUnlock({ game: "memory", moves, time, difficulty }).then((unlocked) => {
        if (unlocked.length > 0) setUnlockedAchievement(unlocked[0]);
      });

      // Adiciona moedas baseado na dificuldade (menos movimentos = mais moedas)
      const difficultyBonus = difficulty === "hard" ? 15 : difficulty === "medium" ? 10 : 5;
      const coinsEarned = difficultyBonus;
      if (isAuthenticated) {
        addCoins(coinsEarned);
        toast({ title: `+${coinsEarned} moedas!`, description: "Vitória! Moedas adicionadas." });
      }

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
      } else {
        toast({ title: "Faça login para salvar", description: "Crie uma conta para competir no ranking!" });
      }
    }
  }, [hasWon, moves, time, difficulty, checkAndUnlock, hasCheckedAchievements, isAuthenticated, profile, addScore, toast]);

  const handleReset = () => {
    setHasCheckedAchievements(false);
    resetGame();
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

      <AchievementToast achievementId={unlockedAchievement} onClose={() => setUnlockedAchievement(null)} />
    </GameLayout>
  );
}

