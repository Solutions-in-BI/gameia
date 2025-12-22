/**
 * Componente para exibir e selecionar títulos
 */

import { cn } from "@/lib/utils";
import { GameTitle, RARITY_COLORS, RARITY_LABELS } from "@/constants/titles";
import { Check, Lock } from "lucide-react";

interface TitleWithStatus extends GameTitle {
  isUnlocked: boolean;
  unlockedAt?: string;
}

interface TitlesSelectorProps {
  titles: TitleWithStatus[];
  selectedTitleId: string | null;
  onSelect: (titleId: string | null) => void;
  filter?: "all" | "unlocked" | "locked";
}

export function TitlesSelector({ 
  titles, 
  selectedTitleId, 
  onSelect,
  filter = "all" 
}: TitlesSelectorProps) {
  const filteredTitles = titles.filter(t => {
    if (filter === "unlocked") return t.isUnlocked;
    if (filter === "locked") return !t.isUnlocked;
    return true;
  });

  const categories = [
    { id: "general", label: "🎮 Geral" },
    { id: "snake", label: "🐍 Snake" },
    { id: "dino", label: "🦖 Dino" },
    { id: "tetris", label: "🧱 Tetris" },
    { id: "memory", label: "🧠 Memória" },
  ];

  return (
    <div className="space-y-4">
      {categories.map(category => {
        const categoryTitles = filteredTitles.filter(t => t.category === category.id);
        if (categoryTitles.length === 0) return null;

        return (
          <div key={category.id}>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">
              {category.label}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {categoryTitles.map(title => (
                <TitleCard
                  key={title.id}
                  title={title}
                  isSelected={selectedTitleId === title.id}
                  onSelect={() => {
                    if (title.isUnlocked) {
                      onSelect(selectedTitleId === title.id ? null : title.id);
                    }
                  }}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

interface TitleCardProps {
  title: TitleWithStatus;
  isSelected: boolean;
  onSelect: () => void;
}

function TitleCard({ title, isSelected, onSelect }: TitleCardProps) {
  const rarity = RARITY_COLORS[title.rarity];

  return (
    <button
      onClick={onSelect}
      disabled={!title.isUnlocked}
      className={cn(
        "relative flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left",
        title.isUnlocked
          ? isSelected
            ? `${rarity.border} ${rarity.bg} ring-2 ring-offset-2 ring-offset-background ring-primary`
            : `${rarity.border} ${rarity.bg} hover:scale-[1.02]`
          : "border-border/30 bg-muted/20 opacity-60 cursor-not-allowed"
      )}
    >
      {/* Ícone */}
      <div className="text-2xl">
        {title.isUnlocked ? title.icon : <Lock className="w-5 h-5 text-muted-foreground" />}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={cn(
            "font-medium truncate",
            title.isUnlocked ? "text-foreground" : "text-muted-foreground"
          )}>
            {title.name}
          </span>
          <span className={cn(
            "text-xs px-1.5 py-0.5 rounded",
            rarity.bg,
            rarity.text
          )}>
            {RARITY_LABELS[title.rarity]}
          </span>
        </div>
        <p className="text-xs text-muted-foreground truncate">
          {title.description}
        </p>
      </div>

      {/* Check se selecionado */}
      {isSelected && title.isUnlocked && (
        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
          <Check className="w-3 h-3 text-primary-foreground" />
        </div>
      )}
    </button>
  );
}

// Componente para exibir o título atual no perfil
interface CurrentTitleBadgeProps {
  title: GameTitle | null;
  size?: "sm" | "md" | "lg";
}

export function CurrentTitleBadge({ title, size = "md" }: CurrentTitleBadgeProps) {
  if (!title) return null;

  const rarity = RARITY_COLORS[title.rarity];
  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-3 py-1",
    lg: "text-base px-4 py-1.5",
  };

  return (
    <div className={cn(
      "inline-flex items-center gap-1.5 rounded-full font-medium",
      rarity.bg,
      rarity.border,
      rarity.text,
      sizeClasses[size]
    )}>
      <span>{title.icon}</span>
      <span>{title.name}</span>
    </div>
  );
}
