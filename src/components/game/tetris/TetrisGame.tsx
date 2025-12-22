import { useState, useEffect } from "react";
import { RotateCcw, Trophy, Pause, Play, Layers } from "lucide-react";
import { GameLayout } from "../common/GameLayout";
import { GameButton } from "../common/GameButton";
import { StatCard } from "../common/StatCard";
import { AchievementToast } from "../common/AchievementToast";
import { useTetrisGame } from "@/hooks/useTetrisGame";
import { useAchievements } from "@/hooks/useAchievements";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMarketplace } from "@/hooks/useMarketplace";
import { BOARD_WIDTH, BOARD_HEIGHT, CELL_SIZE, TETROMINOES, TETROMINO_COLORS, TetrominoType } from "@/constants/tetris";

interface TetrisGameProps {
  onBack: () => void;
}

export function TetrisGame({ onBack }: TetrisGameProps) {
  const {
    board, nextPiece, isPlaying, isGameOver, isPaused,
    score, level, linesCleared, bestScore,
    startGame, togglePause, resetGame,
    moveLeft, moveRight, rotate, softDrop, hardDrop
  } = useTetrisGame();
  
  const { checkAndUnlock } = useAchievements();
  const { addScore } = useLeaderboard("tetris");
  const { profile, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const { addCoins } = useMarketplace();

  const [unlockedAchievement, setUnlockedAchievement] = useState<string | null>(null);
  const [hasCheckedAchievements, setHasCheckedAchievements] = useState(false);

  useEffect(() => {
    if (isGameOver && score > 0 && !hasCheckedAchievements) {
      setHasCheckedAchievements(true);
      
      checkAndUnlock({ 
        game: "tetris", 
        score, 
        lines: linesCleared, 
        level 
      }).then((unlocked) => {
        if (unlocked.length > 0) setUnlockedAchievement(unlocked[0]);
      });

      // Adiciona moedas baseado na pontuação
      const coinsEarned = Math.floor(score / 50);
      if (coinsEarned > 0 && isAuthenticated) {
        addCoins(coinsEarned);
        toast({ title: `+${coinsEarned} moedas!`, description: "Moedas adicionadas à sua conta." });
      }

      if (isAuthenticated && profile && score >= 500) {
        addScore({
          player_name: profile.nickname,
          user_id: profile.id,
          game_type: "tetris",
          score,
        }).then((result) => {
          if (result.success) {
            toast({ title: "Score salvo!", description: `${score} pontos salvos no ranking.` });
          }
        });
      }
    }
  }, [isGameOver, score, linesCleared, level, hasCheckedAchievements]);

  const handleReset = () => {
    resetGame();
    setHasCheckedAchievements(false);
  };

  return (
    <GameLayout title="Tetris" onBack={onBack}>
      <div className="flex flex-wrap justify-center gap-4 mb-6">
        <StatCard icon={Trophy} label="Pontos" value={score} iconColor="text-primary" />
        <StatCard icon={Layers} label="Nível" value={level} iconColor="text-secondary" />
        <StatCard icon={Trophy} label="Linhas" value={linesCleared} iconColor="text-primary" />
        <StatCard icon={Trophy} label="Recorde" value={bestScore} iconColor="text-secondary" />
      </div>

      <div className="flex justify-center gap-6 mb-6">
        {/* Tabuleiro */}
        <div 
          className="border-2 border-border rounded-lg overflow-hidden bg-background"
          style={{ width: BOARD_WIDTH * CELL_SIZE + 4, height: BOARD_HEIGHT * CELL_SIZE + 4 }}
        >
          <div className="grid" style={{ gridTemplateColumns: `repeat(${BOARD_WIDTH}, ${CELL_SIZE}px)` }}>
            {board.flat().map((cell, i) => (
              <div
                key={i}
                className="border border-border/30"
                style={{
                  width: CELL_SIZE,
                  height: CELL_SIZE,
                  backgroundColor: cell || "transparent",
                }}
              />
            ))}
          </div>
        </div>

        {/* Próxima peça */}
        <div className="flex flex-col gap-4">
          <div className="bg-card border border-border rounded-lg p-3">
            <p className="text-xs text-muted-foreground mb-2 text-center">Próxima</p>
            <NextPiecePreview type={nextPiece} />
          </div>
        </div>
      </div>

      {/* Overlays */}
      {!isPlaying && !isGameOver && (
        <div className="text-center mb-6">
          <GameButton variant="primary" onClick={startGame}>
            Iniciar Jogo
          </GameButton>
        </div>
      )}

      {isPaused && (
        <div className="text-center mb-6">
          <p className="text-xl font-display text-foreground mb-4">⏸️ Pausado</p>
          <GameButton variant="primary" icon={Play} onClick={togglePause}>
            Continuar
          </GameButton>
        </div>
      )}

      {isGameOver && (
        <div className="text-center mb-6">
          <p className="text-2xl font-display text-destructive mb-2">Game Over!</p>
          <p className="text-foreground mb-4">Pontuação: {score}</p>
          <GameButton variant="primary" onClick={handleReset}>
            Jogar Novamente
          </GameButton>
        </div>
      )}

      <p className="text-center text-muted-foreground text-sm mb-4">
        ← → mover • ↑ rotacionar • ↓ soft drop • ESPAÇO hard drop • P pausar
      </p>

      <div className="flex justify-center gap-4">
        {isPlaying && !isGameOver && (
          <GameButton variant="secondary" icon={isPaused ? Play : Pause} onClick={togglePause}>
            {isPaused ? "Continuar" : "Pausar"}
          </GameButton>
        )}
        <GameButton variant="muted" icon={RotateCcw} onClick={handleReset}>
          Reiniciar
        </GameButton>
        <GameButton variant="muted" onClick={onBack}>
          Voltar
        </GameButton>
      </div>

      <AchievementToast achievementId={unlockedAchievement} onClose={() => setUnlockedAchievement(null)} />
    </GameLayout>
  );
}

function NextPiecePreview({ type }: { type: TetrominoType }) {
  const shape = TETROMINOES[type];
  const color = TETROMINO_COLORS[type];
  const size = 16;
  
  return (
    <div className="grid gap-0.5" style={{ gridTemplateColumns: `repeat(${shape[0].length}, ${size}px)` }}>
      {shape.flat().map((cell, i) => (
        <div
          key={i}
          style={{
            width: size,
            height: size,
            backgroundColor: cell ? color : "transparent",
            borderRadius: 2,
          }}
        />
      ))}
    </div>
  );
}

export default TetrisGame;
