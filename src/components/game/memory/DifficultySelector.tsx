import { cn } from "@/lib/utils";
import { Difficulty } from "@/types/game";
import { DIFFICULTY_CONFIGS } from "@/constants/game";

/**
 * ===========================================
 * COMPONENTE: DifficultySelector
 * ===========================================
 * 
 * Seletor de dificuldade do jogo da memória.
 * Usa as configurações de DIFFICULTY_CONFIGS.
 */

interface DifficultySelectorProps {
  difficulty: Difficulty;
  onSelect: (difficulty: Difficulty) => void;
}

export function DifficultySelector({ difficulty, onSelect }: DifficultySelectorProps) {
  return (
    <div className="flex gap-2 md:gap-3">
      {DIFFICULTY_CONFIGS.map((config) => {
        const isSelected = difficulty === config.value;
        
        return (
          <button
            key={config.value}
            onClick={() => onSelect(config.value)}
            className={cn(
              "px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300",
              "border-2",
              isSelected
                ? "bg-primary/20 border-primary text-primary shadow-[0_0_15px_hsl(var(--primary)/0.3)]"
                : "bg-card/50 border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
            )}
          >
            <span className="font-display">{config.label}</span>
            <span className="block text-xs opacity-70">{config.pairs} pares</span>
          </button>
        );
      })}
    </div>
  );
}
