import { useState, useEffect } from "react";
import { RotateCcw, Trophy, Zap } from "lucide-react";
import { GameLayout } from "../common/GameLayout";
import { GameButton } from "../common/GameButton";
import { StatCard } from "../common/StatCard";
import { SnakeBoard } from "./SnakeBoard";
import { MobileControls } from "./MobileControls";
import { GameOverlay } from "./GameOverlay";
import { AchievementToast } from "../common/AchievementToast";
import { CoinAnimation } from "../common/CoinAnimation";
import { useSnakeGame } from "@/hooks/useSnakeGame";
import { useAchievements } from "@/hooks/useAchievements";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMarketplace } from "@/hooks/useMarketplace";
import { OPPOSITE_DIRECTIONS } from "@/constants/game";
import { Direction } from "@/types/game";

/**
 * ===========================================
 * COMPONENTE: SnakeGame
 * ===========================================
 * 
 * Componente principal do jogo Snake.
 * Integrado com conquistas e ranking online.
 */

interface SnakeGameProps {
  onBack: () => void;
}

export function SnakeGame({ onBack }: SnakeGameProps) {
  const {
    snake,
    food,
    direction,
    isPlaying,
    isGameOver,
    score,
    bestScore,
    gridSize,
    changeDirection,
    startGame,
    resetGame,
  } = useSnakeGame();

  const { checkAndUnlock } = useAchievements();
  const { addScore } = useLeaderboard("snake");
  const { profile, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const { addCoins } = useMarketplace();

  // Estado para toasts e animações
  const [unlockedAchievement, setUnlockedAchievement] = useState<string | null>(null);
  const [hasCheckedAchievements, setHasCheckedAchievements] = useState(false);
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [showCoinAnimation, setShowCoinAnimation] = useState(false);

  // Verifica conquistas e salva score quando game over
  useEffect(() => {
    if (isGameOver && score > 0 && !hasCheckedAchievements) {
      setHasCheckedAchievements(true);
      
      checkAndUnlock({
        game: "snake",
        score,
      }).then((unlocked) => {
        if (unlocked.length > 0) {
          setUnlockedAchievement(unlocked[0]);
        }
      });

      // Adiciona moedas baseado na pontuação
      const earnedCoins = Math.floor(score / 10);
      if (earnedCoins > 0 && isAuthenticated) {
        setCoinsEarned(earnedCoins);
        setShowCoinAnimation(true);
        addCoins(earnedCoins);
      }

      if (isAuthenticated && profile && score >= 30) {
        addScore({
          player_name: profile.nickname,
          user_id: profile.id,
          game_type: "snake",
          score,
        }).then((result) => {
          if (result.success) {
            toast({
              title: "Score salvo!",
              description: `${score} pontos salvos no ranking.`,
            });
          }
        });
      } else if (score >= 30 && !isAuthenticated) {
        toast({
          title: "Faça login para salvar",
          description: "Crie uma conta para competir no ranking!",
        });
      }
    }
  }, [isGameOver, score, checkAndUnlock, hasCheckedAchievements, isAuthenticated, profile, addScore, toast]);

  // Reset do estado quando reinicia
  const handleReset = () => {
    setHasCheckedAchievements(false);
    setShowCoinAnimation(false);
    setCoinsEarned(0);
    resetGame();
  };

  // Handler para controles mobile (valida direção oposta)
  const handleMobileDirection = (dir: Direction) => {
    if (OPPOSITE_DIRECTIONS[dir] !== direction) {
      changeDirection(dir);
      startGame();
    }
  };

  return (
    <GameLayout 
      title="Snake" 
      subtitle="Use as setas ou WASD para mover"
      maxWidth="2xl"
      onBack={onBack}
    >
      {/* Estatísticas */}
      <div className="grid grid-cols-2 gap-3 mb-4 max-w-sm mx-auto">
        <StatCard 
          icon={Zap} 
          label="Pontos" 
          value={score} 
          iconColor="text-primary" 
        />
        <StatCard 
          icon={Trophy} 
          label="Recorde" 
          value={bestScore} 
          iconColor="text-secondary" 
        />
      </div>

      {/* Tabuleiro */}
      <div className="relative mx-auto mb-4" style={{ width: "min(100%, 400px)" }}>
        <SnakeBoard snake={snake} food={food} gridSize={gridSize} />
        
        <GameOverlay
          isPlaying={isPlaying}
          isGameOver={isGameOver}
          score={score}
          isNewRecord={score >= bestScore && score > 0}
          onRestart={handleReset}
        />
      </div>

      {/* Controles Mobile */}
      <MobileControls onDirectionChange={handleMobileDirection} />

      {/* Barra de Ações */}
      <div className="flex justify-center gap-3 mt-4">
        <GameButton variant="muted" icon={RotateCcw} onClick={handleReset}>
          Reiniciar
        </GameButton>
      </div>

      {/* Toast de Conquista */}
      <AchievementToast
        achievementId={unlockedAchievement}
        onClose={() => setUnlockedAchievement(null)}
      />

      {/* Animação de Moedas */}
      <CoinAnimation
        amount={coinsEarned}
        trigger={showCoinAnimation}
        onComplete={() => setShowCoinAnimation(false)}
      />
    </GameLayout>
  );
}

// Export default para manter compatibilidade
export default SnakeGame;
