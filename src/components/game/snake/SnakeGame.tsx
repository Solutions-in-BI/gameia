import { useState, useEffect } from "react";
import { RotateCcw, Trophy, Zap } from "lucide-react";
import { GameLayout } from "../common/GameLayout";
import { GameButton } from "../common/GameButton";
import { StatCard } from "../common/StatCard";
import { SnakeBoard } from "./SnakeBoard";
import { MobileControls } from "./MobileControls";
import { GameOverlay } from "./GameOverlay";
import { useSnakeGame } from "@/hooks/useSnakeGame";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useStreak } from "@/hooks/useStreak";
import { useActivityLog } from "@/hooks/useActivityLog";
import { OPPOSITE_DIRECTIONS } from "@/constants/game";
import { Direction } from "@/types/game";

/**
 * ===========================================
 * COMPONENTE: SnakeGame
 * ===========================================
 * 
 * Jogo Snake para RECREAÇÃO apenas.
 * NÃO gera XP nem Moedas - apenas diversão!
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

  const { addScore } = useLeaderboard("snake");
  const { profile, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const { recordPlay } = useStreak();
  const { logGamePlayed } = useActivityLog();

  const [hasSavedScore, setHasSavedScore] = useState(false);

  // Salva score quando game over (apenas recorde, sem XP/Coins)
  useEffect(() => {
    if (isGameOver && score > 0 && !hasSavedScore) {
      setHasSavedScore(true);
      
      // Registra play para streak
      recordPlay();
      
      // Registra atividade no log
      logGamePlayed("snake", score);

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
      }
    }
  }, [isGameOver, score, hasSavedScore, isAuthenticated, profile, addScore, toast, recordPlay, logGamePlayed]);

  const handleReset = () => {
    setHasSavedScore(false);
    resetGame();
  };

  const handleMobileDirection = (dir: Direction) => {
    if (OPPOSITE_DIRECTIONS[dir] !== direction) {
      changeDirection(dir);
      startGame();
    }
  };

  return (
    <GameLayout 
      title="Snake" 
      subtitle="Jogo recreativo - apenas diversão!"
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
    </GameLayout>
  );
}

export default SnakeGame;
