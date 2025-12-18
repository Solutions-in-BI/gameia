import { Trophy, RotateCcw, Star } from "lucide-react";

interface WinModalProps {
  moves: number;
  time: number;
  isNewRecord: boolean;
  onPlayAgain: () => void;
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const WinModal = ({ moves, time, isNewRecord, onPlayAgain }: WinModalProps) => {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in p-4">
      <div className="bg-card border-2 border-primary/30 rounded-2xl p-8 max-w-sm w-full text-center animate-scale-in"
           style={{ boxShadow: 'var(--shadow-glow-primary)' }}>
        <div className="mb-6">
          <div className="w-20 h-20 mx-auto bg-primary/20 rounded-full flex items-center justify-center mb-4 animate-float">
            <Trophy className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-3xl font-display font-bold text-foreground neon-text mb-2">
            Parabéns!
          </h2>
          <p className="text-muted-foreground">Você completou o jogo!</p>
        </div>

        {isNewRecord && (
          <div className="mb-6 flex items-center justify-center gap-2 text-game-warning">
            <Star className="w-5 h-5 fill-current" />
            <span className="font-display font-bold">Novo Recorde!</span>
            <Star className="w-5 h-5 fill-current" />
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-muted/30 rounded-xl p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Movimentos</p>
            <p className="text-2xl font-display font-bold text-secondary">{moves}</p>
          </div>
          <div className="bg-muted/30 rounded-xl p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Tempo</p>
            <p className="text-2xl font-display font-bold text-primary">{formatTime(time)}</p>
          </div>
        </div>

        <button
          onClick={onPlayAgain}
          className="btn-primary-game w-full flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-5 h-5" />
          Jogar Novamente
        </button>
      </div>
    </div>
  );
};

export default WinModal;
