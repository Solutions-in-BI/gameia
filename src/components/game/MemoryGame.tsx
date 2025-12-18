import { useState, useEffect, useCallback } from "react";
import { RotateCcw } from "lucide-react";
import GameCard from "./GameCard";
import GameStats from "./GameStats";
import DifficultySelector, { Difficulty } from "./DifficultySelector";
import WinModal from "./WinModal";

const EMOJIS = ["🎮", "🎯", "🎲", "🎪", "🎨", "🎭", "🎵", "🎸", "🚀", "⚡", "🔥", "💎", "🌟", "🎁", "🎈", "🍀"];

interface Card {
  id: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const getPairsCount = (difficulty: Difficulty): number => {
  switch (difficulty) {
    case "easy": return 6;
    case "medium": return 8;
    case "hard": return 12;
  }
};

const getGridCols = (difficulty: Difficulty): string => {
  switch (difficulty) {
    case "easy": return "grid-cols-3 md:grid-cols-4";
    case "medium": return "grid-cols-4";
    case "hard": return "grid-cols-4 md:grid-cols-6";
  }
};

const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

const MemoryGame = () => {
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [time, setTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasWon, setHasWon] = useState(false);
  const [bestScores, setBestScores] = useState<Record<Difficulty, number | null>>({
    easy: null,
    medium: null,
    hard: null,
  });
  const [isNewRecord, setIsNewRecord] = useState(false);

  const initializeGame = useCallback(() => {
    const pairsCount = getPairsCount(difficulty);
    const selectedEmojis = shuffleArray(EMOJIS).slice(0, pairsCount);
    const cardPairs = [...selectedEmojis, ...selectedEmojis].map((emoji, index) => ({
      id: index,
      emoji,
      isFlipped: false,
      isMatched: false,
    }));
    
    setCards(shuffleArray(cardPairs));
    setFlippedCards([]);
    setMoves(0);
    setTime(0);
    setIsPlaying(false);
    setHasWon(false);
    setIsNewRecord(false);
  }, [difficulty]);

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  useEffect(() => {
    const savedScores = localStorage.getItem("memoryGameBestScores");
    if (savedScores) {
      setBestScores(JSON.parse(savedScores));
    }
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && !hasWon) {
      interval = setInterval(() => {
        setTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, hasWon]);

  useEffect(() => {
    if (flippedCards.length === 2) {
      const [first, second] = flippedCards;
      const firstCard = cards.find((c) => c.id === first);
      const secondCard = cards.find((c) => c.id === second);

      if (firstCard && secondCard && firstCard.emoji === secondCard.emoji) {
        setTimeout(() => {
          setCards((prev) =>
            prev.map((card) =>
              card.id === first || card.id === second
                ? { ...card, isMatched: true }
                : card
            )
          );
          setFlippedCards([]);
        }, 500);
      } else {
        setTimeout(() => {
          setCards((prev) =>
            prev.map((card) =>
              card.id === first || card.id === second
                ? { ...card, isFlipped: false }
                : card
            )
          );
          setFlippedCards([]);
        }, 1000);
      }
    }
  }, [flippedCards, cards]);

  useEffect(() => {
    if (cards.length > 0 && cards.every((card) => card.isMatched)) {
      setHasWon(true);
      setIsPlaying(false);

      const currentBest = bestScores[difficulty];
      if (currentBest === null || moves < currentBest) {
        const newBestScores = { ...bestScores, [difficulty]: moves };
        setBestScores(newBestScores);
        localStorage.setItem("memoryGameBestScores", JSON.stringify(newBestScores));
        setIsNewRecord(true);
      }
    }
  }, [cards, moves, difficulty, bestScores]);

  const handleCardClick = (id: number) => {
    if (flippedCards.length >= 2) return;
    
    if (!isPlaying) {
      setIsPlaying(true);
    }

    setCards((prev) =>
      prev.map((card) => (card.id === id ? { ...card, isFlipped: true } : card))
    );
    setFlippedCards((prev) => [...prev, id]);
    
    if (flippedCards.length === 1) {
      setMoves((prev) => prev + 1);
    }
  };

  const handleDifficultyChange = (newDifficulty: Difficulty) => {
    setDifficulty(newDifficulty);
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-2 neon-text">
            Jogo da Memória
          </h1>
          <p className="text-muted-foreground">Encontre todos os pares!</p>
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          <DifficultySelector difficulty={difficulty} onSelect={handleDifficultyChange} />
          
          <button
            onClick={initializeGame}
            className="btn-secondary-game flex items-center gap-2"
          >
            <RotateCcw className="w-5 h-5" />
            Reiniciar
          </button>
        </div>

        {/* Stats */}
        <div className="mb-8">
          <GameStats
            moves={moves}
            time={time}
            bestScore={bestScores[difficulty]}
          />
        </div>

        {/* Game Board */}
        <div className={`grid ${getGridCols(difficulty)} gap-3 md:gap-4 max-w-2xl mx-auto`}>
          {cards.map((card, index) => (
            <div
              key={card.id}
              className="animate-scale-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <GameCard
                emoji={card.emoji}
                isFlipped={card.isFlipped}
                isMatched={card.isMatched}
                onClick={() => handleCardClick(card.id)}
                disabled={flippedCards.length >= 2}
              />
            </div>
          ))}
        </div>

        {/* Win Modal */}
        {hasWon && (
          <WinModal
            moves={moves}
            time={time}
            isNewRecord={isNewRecord}
            onPlayAgain={initializeGame}
          />
        )}
      </div>
    </div>
  );
};

export default MemoryGame;
