import { cn } from "@/lib/utils";

export type Difficulty = "easy" | "medium" | "hard";

interface DifficultySelectorProps {
  difficulty: Difficulty;
  onSelect: (difficulty: Difficulty) => void;
}

const difficulties: { value: Difficulty; label: string; pairs: number }[] = [
  { value: "easy", label: "Fácil", pairs: 6 },
  { value: "medium", label: "Médio", pairs: 8 },
  { value: "hard", label: "Difícil", pairs: 12 },
];

const DifficultySelector = ({ difficulty, onSelect }: DifficultySelectorProps) => {
  return (
    <div className="flex gap-2 md:gap-3">
      {difficulties.map((diff) => (
        <button
          key={diff.value}
          onClick={() => onSelect(diff.value)}
          className={cn(
            "px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300",
            "border-2",
            difficulty === diff.value
              ? "bg-primary/20 border-primary text-primary shadow-[0_0_15px_hsl(var(--primary)/0.3)]"
              : "bg-card/50 border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
          )}
        >
          <span className="font-display">{diff.label}</span>
          <span className="block text-xs opacity-70">{diff.pairs} pares</span>
        </button>
      ))}
    </div>
  );
};

export default DifficultySelector;
