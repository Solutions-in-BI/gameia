import { Gamepad2, Brain, Trophy } from "lucide-react";
import { GameType } from "@/types/game";
import { useAchievements } from "@/hooks/useAchievements";
import { ThemeToggle } from "../common/ThemeToggle";

/**
 * ===========================================
 * COMPONENTE: GameMenu
 * ===========================================
 * 
 * Menu principal para seleção de jogos.
 * Fácil de estender: basta adicionar mais cards ao array.
 */

interface GameMenuProps {
  onSelectGame: (game: Exclude<GameType, "menu">) => void;
  onOpenProfile: () => void;
}

// Configuração dos jogos disponíveis
const GAMES = [
  {
    id: "memory" as const,
    title: "Jogo da Memória",
    description: "Encontre todos os pares de cartas. Teste sua memória!",
    icon: Brain,
    colorClass: "primary",
    tags: ["3 dificuldades", "Recordes"],
  },
  {
    id: "snake" as const,
    title: "Snake",
    description: "Controle a cobra e colete comida. Jogo clássico!",
    icon: Gamepad2,
    colorClass: "secondary",
    tags: ["Velocidade crescente", "Recorde"],
  },
  {
    id: "dino" as const,
    title: "Dino Runner",
    description: "Pule os obstáculos e sobreviva! Estilo Chrome offline.",
    icon: Gamepad2,
    colorClass: "primary",
    tags: ["Endless runner", "Velocidade crescente"],
  },
];

export function GameMenu({ onSelectGame, onOpenProfile }: GameMenuProps) {
  const { getProgress } = useAchievements();
  const progress = getProgress();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-8 px-4 relative">
      {/* Botão de Tema */}
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-4xl mx-auto text-center">
        {/* Header */}
        <header className="mb-10 animate-fade-in">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-bold text-foreground mb-3 neon-text">
            Game Zone
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg">
            Escolha um jogo para jogar
          </p>
        </header>

        {/* Botão de Perfil/Conquistas */}
        <button
          onClick={onOpenProfile}
          className="mb-8 mx-auto flex items-center gap-3 bg-card border-2 border-border rounded-xl px-5 py-2.5 
                     transition-all hover:border-primary/50 hover:scale-105 animate-fade-in"
          style={{ animationDelay: "50ms" }}
        >
          <Trophy className="w-5 h-5 text-primary" />
          <span className="text-foreground font-medium text-sm sm:text-base">Conquistas</span>
          <span className="bg-primary/20 text-primary text-xs sm:text-sm px-2 py-0.5 rounded-full">
            {progress.unlocked}/{progress.total}
          </span>
        </button>

        {/* Grid de Jogos - Responsivo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {GAMES.map((game, index) => (
            <GameCard
              key={game.id}
              {...game}
              onClick={() => onSelectGame(game.id)}
              delay={100 * (index + 1)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// Subcomponente para cada card de jogo
interface GameCardProps {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  colorClass: string;
  tags: string[];
  onClick: () => void;
  delay: number;
}

function GameCard({ 
  title, 
  description, 
  icon: Icon, 
  colorClass, 
  tags, 
  onClick, 
  delay 
}: GameCardProps) {
  return (
    <button
      onClick={onClick}
      className="group relative bg-card border-2 border-border rounded-2xl p-6 
                 transition-all duration-300 hover:border-primary/50 hover:scale-[1.02] 
                 animate-fade-in text-left h-full flex flex-col"
      style={{ 
        animationDelay: `${delay}ms`, 
        boxShadow: "var(--shadow-card)" 
      }}
    >
      {/* Gradient overlay no hover */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent 
                      opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative z-10 flex flex-col items-center flex-1">
        {/* Ícone */}
        <div className="w-14 h-14 mb-4 rounded-xl bg-primary/20 flex items-center justify-center 
                        group-hover:bg-primary/30 transition-colors">
          <Icon className="w-7 h-7 text-primary" />
        </div>
        
        {/* Título */}
        <h2 className="text-xl font-display font-bold text-foreground mb-2 text-center leading-tight">
          {title}
        </h2>
        
        {/* Descrição - altura fixa para alinhamento */}
        <p className="text-muted-foreground text-sm text-center flex-1 leading-relaxed">
          {description}
        </p>
        
        {/* Tags - sempre no fundo */}
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {tags.map(tag => (
            <span 
              key={tag}
              className="px-2.5 py-1 bg-muted rounded-full text-xs text-muted-foreground whitespace-nowrap"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </button>
  );
}

// Export default para manter compatibilidade
export default GameMenu;
