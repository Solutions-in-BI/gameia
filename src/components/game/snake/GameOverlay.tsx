import { GameButton } from "../common/GameButton";

/**
 * ===========================================
 * COMPONENTE: GameOverlay
 * ===========================================
 * 
 * Overlay que aparece sobre o tabuleiro do Snake.
 * - Antes de iniciar: mostra "Pressione para começar"
 * - Game over: mostra pontuação e botão de reiniciar
 */

interface GameOverlayProps {
  isPlaying: boolean;
  isGameOver: boolean;
  score: number;
  isNewRecord: boolean;
  onRestart: () => void;
}

export function GameOverlay({ 
  isPlaying, 
  isGameOver, 
  score, 
  isNewRecord,
  onRestart 
}: GameOverlayProps) {
  // Overlay de início
  if (!isPlaying && !isGameOver) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-xl">
        <p className="text-xl font-display text-foreground animate-pulse-glow">
          Pressione uma seta para começar
        </p>
      </div>
    );
  }

  // Overlay de game over
  if (isGameOver) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/90 rounded-xl animate-fade-in">
        <p className="text-3xl font-display font-bold text-destructive mb-2">
          Game Over!
        </p>
        <p className="text-xl text-foreground mb-4">
          Pontuação: {score}
        </p>
        {isNewRecord && (
          <p className="text-lg text-primary mb-4 animate-celebrate">
            Novo Recorde!
          </p>
        )}
        <GameButton variant="primary" onClick={onRestart}>
          Jogar Novamente
        </GameButton>
      </div>
    );
  }

  return null;
}
