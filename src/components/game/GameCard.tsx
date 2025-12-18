import { cn } from "@/lib/utils";

interface GameCardProps {
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
  onClick: () => void;
  disabled: boolean;
}

const GameCard = ({ emoji, isFlipped, isMatched, onClick, disabled }: GameCardProps) => {
  return (
    <div
      className={cn(
        "game-card aspect-square",
        isFlipped && "flipped",
        isMatched && "matched"
      )}
      onClick={() => !disabled && !isFlipped && !isMatched && onClick()}
    >
      <div className="game-card-inner">
        <div className="game-card-face game-card-back">
          <span className="text-2xl md:text-3xl opacity-30">?</span>
        </div>
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
};

export default GameCard;
