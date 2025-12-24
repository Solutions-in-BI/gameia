import { useState, useEffect } from "react";
import { RotateCcw } from "lucide-react";
import { GameLayout } from "../common/GameLayout";
import { GameButton } from "../common/GameButton";
import { MemoryCard } from "./MemoryCard";
import { MemoryStats } from "./MemoryStats";
import { DifficultySelector } from "./DifficultySelector";
import { WinModal } from "./WinModal";
import { AchievementToast } from "../common/AchievementToast";
import { CoinAnimation } from "../common/CoinAnimation";
import { useMemoryGame } from "@/hooks/useMemoryGame";
import { useAchievements } from "@/hooks/useAchievements";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMarketplace } from "@/hooks/useMarketplace";
import { useLevel } from "@/hooks/useLevel";
import { useStreak } from "@/hooks/useStreak";

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
  const { addGameXP } = useLevel();
  const { recordPlay } = useStreak();

  const [unlockedAchievement, setUnlockedAchievement] = useState<string | null>(null);
  const [hasCheckedAchievements, setHasCheckedAchievements] = useState(false);
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [showCoinAnimation, setShowCoinAnimation] = useState(false);

  useEffect(() => {
    if (hasWon && !hasCheckedAchievements) {
      setHasCheckedAchievements(true);
      
      checkAndUnlock({ game: "memory", moves, time, difficulty }).then((unlocked) => {
        if (unlocked.length > 0) setUnlockedAchievement(unlocked[0]);
      });

      // Registra play para streak
      recordPlay();

      // Adiciona XP
      if (isAuthenticated) {
        const score = difficulty === "hard" ? 150 : difficulty === "medium" ? 100 : 50;
        addGameXP(score);
      }

      // Adiciona moedas baseado na dificuldade
      const difficultyBonus = difficulty === "hard" ? 15 : difficulty === "medium" ? 10 : 5;
      if (isAuthenticated) {
        setCoinsEarned(difficultyBonus);
        setShowCoinAnimation(true);
        addCoins(difficultyBonus);
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
    setShowCoinAnimation(false);
    setCoinsEarned(0);
    resetGame();
  };

  return (
    <GameLayout title="Jogo da Memória" subtitle="Encontre todos os pares!" onBack={onBack}>
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

      <AchievementToast achievementId={unlockedAchievement} onClose={() => setUnlockedAchievement(null)} />
      
      <CoinAnimation
        amount={coinsEarned}
        trigger={showCoinAnimation}
        onComplete={() => setShowCoinAnimation(false)}
      />
    </GameLayout>
  );
}
