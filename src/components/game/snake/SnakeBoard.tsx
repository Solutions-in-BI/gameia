import { Position } from "@/types/game";

/**
 * ===========================================
 * COMPONENTE: SnakeBoard
 * ===========================================
 * 
 * Renderiza o tabuleiro do jogo Snake.
 * Cada célula pode ser: vazia, cabeça, corpo ou comida.
 */

interface SnakeBoardProps {
  snake: Position[];
  food: Position;
  gridSize: number;
}

export function SnakeBoard({ snake, food, gridSize }: SnakeBoardProps) {
  return (
    <div 
      className="grid bg-card border-2 border-border rounded-xl overflow-hidden"
      style={{ 
        gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
        aspectRatio: "1",
      }}
    >
      {Array.from({ length: gridSize * gridSize }).map((_, index) => {
        const x = index % gridSize;
        const y = Math.floor(index / gridSize);
        
        const isHead = snake[0]?.x === x && snake[0]?.y === y;
        const isBody = snake.slice(1).some(seg => seg.x === x && seg.y === y);
        const isFood = food.x === x && food.y === y;

        return (
          <div
            key={index}
            className={`
              aspect-square transition-all duration-75
              ${isHead ? "bg-primary rounded-sm scale-110 shadow-[0_0_10px_hsl(var(--primary)/0.8)]" : ""}
              ${isBody ? "bg-primary/70 rounded-sm" : ""}
              ${isFood ? "bg-secondary rounded-full animate-pulse-glow" : ""}
              ${!isHead && !isBody && !isFood ? "bg-muted/20" : ""}
            `}
          />
        );
      })}
    </div>
  );
}
