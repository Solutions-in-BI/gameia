import { RotateCcw } from "lucide-react";
import { GameLayout } from "../common/GameLayout";
import { GameButton } from "../common/GameButton";
import { MemoryCard } from "./MemoryCard";
import { MemoryStats } from "./MemoryStats";
import { DifficultySelector } from "./DifficultySelector";
import { WinModal } from "./WinModal";
import { useMemoryGame } from "@/hooks/useMemoryGame";

/**
 * ===========================================
 * COMPONENTE: MemoryGame
 * ===========================================
 * 
 * Componente principal do jogo da memória.
 * A lógica está no hook useMemoryGame, aqui só tem UI.
 * 
 * Isso segue o padrão "Smart/Dumb Components":
 * - Hook (smart): contém a lógica
 * - Componente (dumb): apenas renderiza
 */

interface MemoryGameProps {
  onBack: () => void;
}

export function MemoryGame({ onBack }: MemoryGameProps) {
  const {
    cards,
    moves,
    time,
    hasWon,
    isNewRecord,
    difficulty,
    bestScore,
    gridCols,
    canFlip,
    handleCardClick,
    changeDifficulty,
    resetGame,
  } = useMemoryGame("easy");

  return (
    <GameLayout title="Jogo da Memória" subtitle="Encontre todos os pares!">
      {/* Controles */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
        <DifficultySelector 
          difficulty={difficulty} 
          onSelect={changeDifficulty} 
        />
        
        <div className="flex gap-3">
          <GameButton variant="secondary" icon={RotateCcw} onClick={resetGame}>
            Reiniciar
          </GameButton>
          <GameButton variant="muted" onClick={onBack}>
            Voltar ao Menu
          </GameButton>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="mb-8">
        <MemoryStats moves={moves} time={time} bestScore={bestScore} />
      </div>

      {/* Tabuleiro */}
      <div className={`grid ${gridCols} gap-3 md:gap-4 max-w-2xl mx-auto`}>
        {cards.map((card, index) => (
          <div
            key={card.id}
            className="animate-scale-in"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <MemoryCard
              emoji={card.emoji}
              isFlipped={card.isFlipped}
              isMatched={card.isMatched}
              onClick={() => handleCardClick(card.id)}
              disabled={!canFlip}
            />
          </div>
        ))}
      </div>

      {/* Modal de Vitória */}
      {hasWon && (
        <WinModal
          moves={moves}
          time={time}
          isNewRecord={isNewRecord}
          onPlayAgain={resetGame}
        />
      )}
    </GameLayout>
  );
}

// Export default para manter compatibilidade
export default MemoryGame;
