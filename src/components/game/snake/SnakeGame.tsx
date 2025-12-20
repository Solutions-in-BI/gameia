import { useState, useEffect } from "react";
import { RotateCcw, Trophy, Zap } from "lucide-react";
import { GameLayout } from "../common/GameLayout";
import { GameButton } from "../common/GameButton";
import { StatCard } from "../common/StatCard";
import { SnakeBoard } from "./SnakeBoard";
import { MobileControls } from "./MobileControls";
import { GameOverlay } from "./GameOverlay";
import { AchievementToast } from "../common/AchievementToast";
import { SubmitScoreModal } from "../common/SubmitScoreModal";
import { useSnakeGame } from "@/hooks/useSnakeGame";
import { useAchievements } from "@/hooks/useAchievements";
import { useLeaderboard } from "@/hooks/useLeaderboard";
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

  // Estado para toasts e modais
  const [unlockedAchievement, setUnlockedAchievement] = useState<string | null>(null);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasCheckedAchievements, setHasCheckedAchievements] = useState(false);

  // Verifica conquistas quando game over
  useEffect(() => {
    if (isGameOver && score > 0 && !hasCheckedAchievements) {
      const unlocked = checkAndUnlock({
        game: "snake",
        score,
      });

      // Mostra toast da primeira conquista desbloqueada
      if (unlocked.length > 0) {
        setUnlockedAchievement(unlocked[0]);
      }

      setHasCheckedAchievements(true);

      // Mostra modal de score se fez pontos significativos
      if (score >= 30) {
        setTimeout(() => setShowScoreModal(true), 1500);
      }
    }
  }, [isGameOver, score, checkAndUnlock, hasCheckedAchievements]);

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
      game_type: "snake",
      score,
    });
    setIsSubmitting(false);
    setShowScoreModal(false);
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
    >
      {/* Estatísticas */}
      <div className="flex justify-center gap-4 mb-6">
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
      <div className="relative mx-auto mb-6" style={{ width: "min(100%, 400px)" }}>
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

      {/* Botões de Ação */}
      <div className="flex justify-center gap-4">
        <GameButton variant="secondary" icon={RotateCcw} onClick={handleReset}>
          Reiniciar
        </GameButton>
        <GameButton variant="muted" onClick={onBack}>
          Voltar ao Menu
        </GameButton>
      </div>

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
        score={score}
        gameType="snake"
        isSubmitting={isSubmitting}
      />
    </GameLayout>
  );
}

// Export default para manter compatibilidade
export default SnakeGame;
