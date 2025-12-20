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
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║                          useMemoryGame                                     ║
 * ╠═══════════════════════════════════════════════════════════════════════════╣
 * ║ Hook que encapsula TODA a lógica do Jogo da Memória.                      ║
 * ║                                                                           ║
 * ║ RESPONSABILIDADES:                                                        ║
 * ║ - Gerenciar cartas (criar, embaralhar, virar)                            ║
 * ║ - Comparar pares de cartas                                               ║
 * ║ - Contar movimentos e tempo                                              ║
 * ║ - Detectar vitória                                                        ║
 * ║ - Persistir recordes por dificuldade                                     ║
 * ║                                                                           ║
 * ║ USO:                                                                      ║
 * ║ const { cards, moves, handleCardClick } = useMemoryGame("easy");         ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */

export function useMemoryGame(initialDifficulty: Difficulty = "easy") {
  // ═══════════════════════════════════════════════════════════════════════════
  // ESTADO DO JOGO
  // ═══════════════════════════════════════════════════════════════════════════
  
  /** Dificuldade atual: "easy" | "medium" | "hard" */
  const [difficulty, setDifficulty] = useState<Difficulty>(initialDifficulty);
  
  /**
   * Array de cartas no tabuleiro.
   * Cada carta tem: id, emoji, isFlipped (virada?), isMatched (encontrou par?)
   */
  const [cards, setCards] = useState<Card[]>([]);
  
  /**
   * IDs das cartas atualmente viradas (máx 2).
   * Usado para comparar se formam um par.
   */
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  
  /** Contagem de movimentos (1 movimento = virar 2 cartas) */
  const [moves, setMoves] = useState(0);
  
  /** Indica se o jogador venceu (todas as cartas matched) */
  const [hasWon, setHasWon] = useState(false);
  
  /** Indica se bateu o recorde nesta partida */
  const [isNewRecord, setIsNewRecord] = useState(false);

  // ═══════════════════════════════════════════════════════════════════════════
  // TIMER E PERSISTÊNCIA
  // ═══════════════════════════════════════════════════════════════════════════
  
  /**
   * Hook de cronômetro.
   * Inicia quando vira a primeira carta, para quando ganha.
   */
  const { time, isRunning, start, stop, reset: resetTimer } = useTimer();

  /**
   * Recordes por dificuldade salvos no localStorage.
   * Formato: { easy: 8, medium: null, hard: 15 }
   * null = ainda não jogou nessa dificuldade
   */
  const [bestScores, setBestScores] = useLocalStorage<BestScores>(
    MEMORY_STORAGE_KEY,
    { easy: null, medium: null, hard: null }
  );

  // Busca configuração da dificuldade atual (quantidade de pares, grid)
  const difficultyConfig = DIFFICULTY_CONFIGS.find(d => d.value === difficulty)!;

  // ═══════════════════════════════════════════════════════════════════════════
  // INICIALIZAÇÃO DO JOGO
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Inicializa ou reinicia o jogo.
   * 
   * ALGORITMO:
   * 1. Pega quantidade de pares da dificuldade atual
   * 2. Seleciona emojis aleatórios
   * 3. Duplica cada emoji (para formar pares)
   * 4. Embaralha todas as cartas
   * 5. Reseta estados (moves, timer, etc)
   */
  const initializeGame = useCallback(() => {
    const pairsCount = difficultyConfig.pairs;
    
    // Seleciona emojis aleatórios para esta partida
    const selectedEmojis = shuffleArray(MEMORY_EMOJIS).slice(0, pairsCount);
    
    // Cria pares: duplica cada emoji e cria objetos Card
    const cardPairs: Card[] = [...selectedEmojis, ...selectedEmojis].map((emoji, index) => ({
      id: index,
      emoji,
      isFlipped: false,  // Começa virada para baixo
      isMatched: false,  // Ainda não encontrou par
    }));
    
    // Embaralha e define como estado
    setCards(shuffleArray(cardPairs));
    setFlippedCards([]);
    setMoves(0);
    setHasWon(false);
    setIsNewRecord(false);
    resetTimer();
  }, [difficultyConfig.pairs, resetTimer]);

  // Inicializa quando monta ou quando muda dificuldade
  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  // ═══════════════════════════════════════════════════════════════════════════
  // LÓGICA DE COMPARAÇÃO DE CARTAS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Efeito que compara as cartas quando 2 estão viradas.
   * 
   * ALGORITMO:
   * 1. Espera ter exatamente 2 cartas viradas
   * 2. Busca os objetos Card correspondentes
   * 3. Compara os emojis
   * 4. Se iguais: marca como matched
   * 5. Se diferentes: desvira após delay
   * 6. Limpa array de flippedCards
   */
  useEffect(() => {
    // Só executa quando temos exatamente 2 cartas viradas
    if (flippedCards.length !== 2) return;

    const [firstId, secondId] = flippedCards;
    const firstCard = cards.find(c => c.id === firstId);
    const secondCard = cards.find(c => c.id === secondId);

    if (!firstCard || !secondCard) return;

    // Verifica se é um par (mesmo emoji)
    const isMatch = firstCard.emoji === secondCard.emoji;
    
    // Delay diferente para par encontrado vs não encontrado
    const delay = isMatch ? CARD_FLIP_DELAY.match : CARD_FLIP_DELAY.noMatch;

    setTimeout(() => {
      setCards(prev => prev.map(card => {
        // Só modifica as cartas que foram viradas
        if (card.id === firstId || card.id === secondId) {
          return isMatch 
            ? { ...card, isMatched: true }  // Par! Marca como encontrado
            : { ...card, isFlipped: false }; // Não é par, desvira
        }
        return card;
      }));
      setFlippedCards([]); // Limpa para permitir novas jogadas
    }, delay);
  }, [flippedCards, cards]);

  // ═══════════════════════════════════════════════════════════════════════════
  // DETECÇÃO DE VITÓRIA
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Efeito que verifica se o jogador ganhou.
   * Ganha quando TODAS as cartas estão matched.
   */
  useEffect(() => {
    if (cards.length === 0) return;
    
    const allMatched = cards.every(card => card.isMatched);
    
    if (allMatched) {
      setHasWon(true);
      stop(); // Para o timer

      // Verifica se bateu recorde
      const currentBest = bestScores[difficulty];
      if (currentBest === null || moves < currentBest) {
        setBestScores({ ...bestScores, [difficulty]: moves });
        setIsNewRecord(true);
      }
    }
  }, [cards, moves, difficulty, bestScores, setBestScores, stop]);

  // ═══════════════════════════════════════════════════════════════════════════
  // HANDLER DE CLIQUE EM CARTA
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Lida com o clique em uma carta.
   * 
   * REGRAS:
   * 1. Ignora se já tem 2 cartas viradas (aguardando comparação)
   * 2. Ignora se carta já está virada ou matched
   * 3. Inicia timer no primeiro clique
   * 4. Vira a carta
   * 5. Incrementa movimentos quando vira a segunda carta
   */
  const handleCardClick = useCallback((id: number) => {
    // Já tem 2 viradas? Aguarda comparação
    if (flippedCards.length >= 2) return;
    
    // Carta já está virada ou matched? Ignora
    const card = cards.find(c => c.id === id);
    if (!card || card.isFlipped || card.isMatched) return;
    
    // Inicia timer no primeiro clique do jogo
    if (!isRunning) {
      start();
    }

    // Vira a carta
    setCards(prev => prev.map(c => 
      c.id === id ? { ...c, isFlipped: true } : c
    ));
    
    setFlippedCards(prev => [...prev, id]);
    
    // Incrementa movimentos quando vira a segunda carta
    if (flippedCards.length === 1) {
      setMoves(prev => prev + 1);
    }
  }, [cards, flippedCards.length, isRunning, start]);

  /**
   * Muda a dificuldade (reinicia o jogo automaticamente).
   */
  const changeDifficulty = useCallback((newDifficulty: Difficulty) => {
    setDifficulty(newDifficulty);
  }, []);

  // ═══════════════════════════════════════════════════════════════════════════
  // RETORNO DO HOOK
  // ═══════════════════════════════════════════════════════════════════════════

  return {
    // ═══ ESTADO (para renderizar) ═══
    cards,
    moves,
    time,
    hasWon,
    isNewRecord,
    difficulty,
    bestScore: bestScores[difficulty],
    gridCols: difficultyConfig.gridCols,  // Classes CSS do grid
    canFlip: flippedCards.length < 2,     // Pode clicar?
    
    // ═══ AÇÕES (para interagir) ═══
    handleCardClick,
    changeDifficulty,
    resetGame: initializeGame,
  };
}
