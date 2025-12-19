import { Trophy, RotateCcw, Star } from "lucide-react";
import { GameButton } from "../common/GameButton";
import { formatTime } from "@/utils/time";

/**
 * ===========================================
 * COMPONENTE: WinModal
 * ===========================================
 * 
 * Modal exibido quando o jogador vence.
 * Mostra estatísticas finais e opção de jogar novamente.
 */

interface WinModalProps {
  moves: number;
  time: number;
  isNewRecord: boolean;
  onPlayAgain: () => void;
}

export function WinModal({ moves, time, isNewRecord, onPlayAgain }: WinModalProps) {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in p-4">
      <div 
        className="bg-card border-2 border-primary/30 rounded-2xl p-8 max-w-sm w-full text-center animate-scale-in"
        style={{ boxShadow: 'var(--shadow-glow-primary)' }}
      >
        {/* Ícone e Título */}
        <div className="mb-6">
          <div className="w-20 h-20 mx-auto bg-primary/20 rounded-full flex items-center justify-center mb-4 animate-float">
            <Trophy className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-3xl font-display font-bold text-foreground neon-text mb-2">
            Parabéns!
          </h2>
          <p className="text-muted-foreground">Você completou o jogo!</p>
        </div>

        {/* Indicador de Novo Recorde */}
        {isNewRecord && (
          <div className="mb-6 flex items-center justify-center gap-2 text-game-warning">
            <Star className="w-5 h-5 fill-current" />
            <span className="font-display font-bold">Novo Recorde!</span>
            <Star className="w-5 h-5 fill-current" />
          </div>
        )}

        {/* Estatísticas Finais */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-muted/30 rounded-xl p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
              Movimentos
            </p>
            <p className="text-2xl font-display font-bold text-secondary">{moves}</p>
          </div>
          <div className="bg-muted/30 rounded-xl p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
              Tempo
            </p>
            <p className="text-2xl font-display font-bold text-primary">
              {formatTime(time)}
            </p>
          </div>
        </div>

        {/* Botão Jogar Novamente */}
        <GameButton 
          variant="primary" 
          icon={RotateCcw} 
          onClick={onPlayAgain}
          fullWidth
        >
          Jogar Novamente
        </GameButton>
      </div>
    </div>
  );
}
