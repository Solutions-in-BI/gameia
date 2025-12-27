import { useState, useEffect } from "react";
import { RotateCcw, Trophy, Pause, Play, Layers } from "lucide-react";
import { GameLayout } from "../common/GameLayout";
import { GameButton } from "../common/GameButton";
import { StatCard } from "../common/StatCard";
import { useTetrisGame } from "@/hooks/useTetrisGame";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useStreak } from "@/hooks/useStreak";
import { BOARD_WIDTH, BOARD_HEIGHT, CELL_SIZE, TETROMINOES, TETROMINO_COLORS, TetrominoType } from "@/constants/tetris";

/**
 * ===========================================
 * COMPONENTE: TetrisGame
 * ===========================================
 * 
 * Jogo Tetris para RECREAÇÃO apenas.
 * NÃO gera XP nem Moedas - apenas diversão!
 */

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
  
  const { addScore } = useLeaderboard("tetris");
  const { profile, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const { recordPlay } = useStreak();

  const [hasSavedScore, setHasSavedScore] = useState(false);

  useEffect(() => {
    if (isGameOver && score > 0 && !hasSavedScore) {
      setHasSavedScore(true);
      
      // Registra play para streak
      recordPlay();

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
  }, [isGameOver, score, hasSavedScore, isAuthenticated, profile, addScore, toast, recordPlay]);

  const handleReset = () => {
    resetGame();
    setHasSavedScore(false);
  };

  return (
    <GameLayout title="Tetris" subtitle="Jogo recreativo - apenas diversão!" onBack={onBack}>
      {/* Estatísticas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-4">
        <StatCard icon={Trophy} label="Pontos" value={score} iconColor="text-primary" />
        <StatCard icon={Layers} label="Nível" value={level} iconColor="text-secondary" />
        <StatCard icon={Trophy} label="Linhas" value={linesCleared} iconColor="text-primary" />
        <StatCard icon={Trophy} label="Recorde" value={bestScore} iconColor="text-secondary" />
      </div>

      {/* Área Principal do Jogo */}
      <div className="flex flex-col items-center gap-4 mb-4">
        <div className="flex justify-center gap-4">
          {/* Tabuleiro */}
          <div 
            className="border-2 border-border rounded-lg overflow-hidden bg-background shadow-lg"
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

          {/* Painel Lateral */}
          <div className="flex flex-col gap-3">
            <div className="bg-card border border-border rounded-lg p-3 shadow-sm">
              <p className="text-xs text-muted-foreground mb-2 text-center font-medium">Próxima</p>
              <NextPiecePreview type={nextPiece} />
            </div>
            
            {/* Botão de Pause durante jogo */}
            {isPlaying && !isGameOver && !isPaused && (
              <GameButton variant="secondary" icon={Pause} onClick={togglePause} size="sm">
                Pausar
              </GameButton>
            )}
          </div>
        </div>

        {/* Overlays de Estado */}
        {!isPlaying && !isGameOver && (
          <div className="text-center py-4">
            <GameButton variant="primary" onClick={startGame} size="lg">
              🎮 Iniciar Jogo
            </GameButton>
          </div>
        )}

        {isPaused && (
          <div className="text-center py-4 animate-fade-in">
            <div className="bg-card/90 border border-border rounded-xl p-6 shadow-lg">
              <p className="text-2xl font-display text-foreground mb-4">⏸️ Pausado</p>
              <GameButton variant="primary" icon={Play} onClick={togglePause}>
                Continuar
              </GameButton>
            </div>
          </div>
        )}

        {isGameOver && (
          <div className="text-center py-4 animate-fade-in">
            <div className="bg-card/90 border border-border rounded-xl p-6 shadow-lg">
              <p className="text-2xl font-display text-destructive mb-2">Game Over!</p>
              <p className="text-foreground mb-4">Pontuação: <span className="font-bold text-primary">{score}</span></p>
              <GameButton variant="primary" onClick={handleReset}>
                🔄 Jogar Novamente
              </GameButton>
            </div>
          </div>
        )}
      </div>

      {/* Instruções */}
      <div className="bg-muted/50 rounded-lg p-3 mb-4">
        <p className="text-center text-muted-foreground text-xs sm:text-sm">
          ← → mover • ↑ rotacionar • ↓ soft drop • ESPAÇO hard drop • P pausar
        </p>
      </div>

      {/* Barra de Ações */}
      <div className="flex justify-center gap-3">
        <GameButton variant="muted" icon={RotateCcw} onClick={handleReset}>
          Reiniciar
        </GameButton>
      </div>
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
