import { cn } from "@/lib/utils";

/**
 * ===========================================
 * COMPONENTE: MemoryCard
 * ===========================================
 * 
 * Carta individual do jogo da memória.
 * Tem dois lados: frente (emoji) e verso (?).
 * 
 * O CSS da animação de virar está no index.css
 * usando as classes game-card, flipped, matched.
 */

interface MemoryCardProps {
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
  onClick: () => void;
  disabled: boolean;
}

export function MemoryCard({ 
  emoji, 
  isFlipped, 
  isMatched, 
  onClick, 
  disabled 
}: MemoryCardProps) {
  
  const handleClick = () => {
    // Só permite clicar se não estiver desabilitado,
    // não estiver virada e não estiver matched
    if (!disabled && !isFlipped && !isMatched) {
      onClick();
    }
  };

  return (
    <div
      className={cn(
        "game-card aspect-square cursor-pointer",
        isFlipped && "flipped",
        isMatched && "matched"
      )}
      onClick={handleClick}
    >
      <div className="game-card-inner">
        {/* Verso da carta (?) */}
        <div className="game-card-face game-card-back">
          <span className="text-2xl md:text-3xl opacity-30">?</span>
        </div>
        
        {/* Frente da carta (emoji) */}
        <div className="game-card-face game-card-front">
          <span className={cn(
            "text-3xl md:text-4xl transition-transform duration-300",
            isMatched && "animate-celebrate"
          )}>
            {emoji}
          </span>
        </div>
      </div>
    </div>
  );
}
