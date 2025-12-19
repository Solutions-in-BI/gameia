import { RotateCcw } from "lucide-react";
import { GameLayout } from "../common/GameLayout";
import { GameButton } from "../common/GameButton";
import { StatCard } from "../common/StatCard";
import { SnakeBoard } from "./SnakeBoard";
import { MobileControls } from "./MobileControls";
import { GameOverlay } from "./GameOverlay";
import { useSnakeGame } from "@/hooks/useSnakeGame";
import { Trophy, Zap } from "lucide-react";
import { OPPOSITE_DIRECTIONS } from "@/constants/game";
import { Direction } from "@/types/game";

/**
 * ===========================================
 * COMPONENTE: SnakeGame
 * ===========================================
 * 
 * Componente principal do jogo Snake.
 * A lógica está no hook useSnakeGame.
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
          onRestart={resetGame}
        />
      </div>

      {/* Controles Mobile */}
      <MobileControls onDirectionChange={handleMobileDirection} />

      {/* Botões de Ação */}
      <div className="flex justify-center gap-4">
        <GameButton variant="secondary" icon={RotateCcw} onClick={resetGame}>
          Reiniciar
        </GameButton>
        <GameButton variant="muted" onClick={onBack}>
          Voltar ao Menu
        </GameButton>
      </div>
    </GameLayout>
  );
}

// Export default para manter compatibilidade
export default SnakeGame;
