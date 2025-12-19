import { useState, useEffect, useCallback } from "react";
import { Card, Difficulty, BestScores } from "@/types/game";
import { 
  MEMORY_EMOJIS, 
  DIFFICULTY_CONFIGS, 
  CARD_FLIP_DELAY,
  MEMORY_STORAGE_KEY 
} from "@/constants/game";
import { shuffleArray } from "@/utils/array";
import { useLocalStorage } from "./useLocalStorage";
import { useTimer } from "./useTimer";

/**
 * ===========================================
 * HOOK: useMemoryGame
 * ===========================================
 * 
 * Hook que encapsula toda a lógica do jogo da memória.
 * Separa a lógica da UI para facilitar testes e manutenção.
 * 
 * @example
 * const {
 *   cards,
 *   moves,
 *   time,
 *   hasWon,
 *   handleCardClick,
 *   resetGame,
 * } = useMemoryGame("easy");
 */

export function useMemoryGame(initialDifficulty: Difficulty = "easy") {
  // Estado do jogo
  const [difficulty, setDifficulty] = useState<Difficulty>(initialDifficulty);
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [hasWon, setHasWon] = useState(false);
  const [isNewRecord, setIsNewRecord] = useState(false);

  // Timer customizado
  const { time, isRunning, start, stop, reset: resetTimer } = useTimer();

  // Recordes persistidos no localStorage
  const [bestScores, setBestScores] = useLocalStorage<BestScores>(
    MEMORY_STORAGE_KEY,
    { easy: null, medium: null, hard: null }
  );

  // Busca a configuração da dificuldade atual
  const difficultyConfig = DIFFICULTY_CONFIGS.find(d => d.value === difficulty)!;

  /**
   * Inicializa/reinicia o jogo
   */
  const initializeGame = useCallback(() => {
    const pairsCount = difficultyConfig.pairs;
    
    // Seleciona emojis aleatórios para esta partida
    const selectedEmojis = shuffleArray(MEMORY_EMOJIS).slice(0, pairsCount);
    
    // Cria pares e embaralha
    const cardPairs: Card[] = [...selectedEmojis, ...selectedEmojis].map((emoji, index) => ({
      id: index,
      emoji,
      isFlipped: false,
      isMatched: false,
    }));
    
    setCards(shuffleArray(cardPairs));
    setFlippedCards([]);
    setMoves(0);
    setHasWon(false);
    setIsNewRecord(false);
    resetTimer();
  }, [difficultyConfig.pairs, resetTimer]);

  // Inicializa quando monta ou muda dificuldade
  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  /**
   * Lógica de comparação de cartas viradas
   */
  useEffect(() => {
    if (flippedCards.length !== 2) return;

    const [firstId, secondId] = flippedCards;
    const firstCard = cards.find(c => c.id === firstId);
    const secondCard = cards.find(c => c.id === secondId);

    if (!firstCard || !secondCard) return;

    const isMatch = firstCard.emoji === secondCard.emoji;
    const delay = isMatch ? CARD_FLIP_DELAY.match : CARD_FLIP_DELAY.noMatch;

    setTimeout(() => {
      setCards(prev => prev.map(card => {
        if (card.id === firstId || card.id === secondId) {
          return isMatch 
            ? { ...card, isMatched: true }
            : { ...card, isFlipped: false };
        }
        return card;
      }));
      setFlippedCards([]);
    }, delay);
  }, [flippedCards, cards]);

  /**
   * Verifica vitória
   */
  useEffect(() => {
    if (cards.length === 0) return;
    
    const allMatched = cards.every(card => card.isMatched);
    
    if (allMatched) {
      setHasWon(true);
      stop();

      // Verifica se é novo recorde
      const currentBest = bestScores[difficulty];
      if (currentBest === null || moves < currentBest) {
        setBestScores({ ...bestScores, [difficulty]: moves });
        setIsNewRecord(true);
      }
    }
  }, [cards, moves, difficulty, bestScores, setBestScores, stop]);

  /**
   * Handler de clique em carta
   */
  const handleCardClick = useCallback((id: number) => {
    // Ignora se já tem 2 cartas viradas
    if (flippedCards.length >= 2) return;
    
    // Inicia timer no primeiro clique
    if (!isRunning) {
      start();
    }

    // Vira a carta
    setCards(prev => prev.map(card => 
      card.id === id ? { ...card, isFlipped: true } : card
    ));
    
    setFlippedCards(prev => [...prev, id]);
    
    // Incrementa movimentos quando vira o segundo card
    if (flippedCards.length === 1) {
      setMoves(prev => prev + 1);
    }
  }, [flippedCards.length, isRunning, start]);

  /**
   * Muda a dificuldade (reinicia o jogo)
   */
  const changeDifficulty = useCallback((newDifficulty: Difficulty) => {
    setDifficulty(newDifficulty);
  }, []);

  return {
    // Estado
    cards,
    moves,
    time,
    hasWon,
    isNewRecord,
    difficulty,
    bestScore: bestScores[difficulty],
    gridCols: difficultyConfig.gridCols,
    canFlip: flippedCards.length < 2,
    
    // Ações
    handleCardClick,
    changeDifficulty,
    resetGame: initializeGame,
  };
}
