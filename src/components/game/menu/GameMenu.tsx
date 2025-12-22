import { Gamepad2, Brain, Trophy, LogIn, LogOut, User, ShoppingBag, Coins } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { GameType } from "@/types/game";
import { useAchievements } from "@/hooks/useAchievements";
import { useAuth } from "@/hooks/useAuth";
import { useMarketplace } from "@/hooks/useMarketplace";
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
  onOpenMarketplace: () => void;
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
    description: "Pule e abaixe para desviar dos obstáculos!",
    icon: Gamepad2,
    colorClass: "primary",
    tags: ["Pássaros voadores", "Abaixar"],
  },
  {
    id: "tetris" as const,
    title: "Tetris",
    description: "Encaixe as peças e limpe linhas. Clássico eterno!",
    icon: Gamepad2,
    colorClass: "secondary",
    tags: ["Níveis", "Hard drop"],
  },
];

export function GameMenu({ onSelectGame, onOpenProfile, onOpenMarketplace }: GameMenuProps) {
  const navigate = useNavigate();
  const { getProgress } = useAchievements();
  const { profile, isAuthenticated, signOut } = useAuth();
  const { coins } = useMarketplace();
  const progress = getProgress();

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-8 px-4 relative">
      {/* Header Actions */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        {isAuthenticated && profile ? (
          <>
            <button
              onClick={onOpenProfile}
              className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-1.5 hover:bg-muted transition-colors"
              title="Ver Perfil"
            >
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-xs font-bold text-primary-foreground">
                {profile.nickname?.charAt(0).toUpperCase() || "?"}
              </div>
              <span className="text-sm font-medium text-foreground">{profile.nickname}</span>
            </button>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg bg-card border border-border hover:bg-muted transition-colors"
              title="Sair"
            >
              <LogOut size={18} className="text-muted-foreground" />
            </button>
          </>
        ) : (
          <button
            onClick={() => navigate("/auth")}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-3 py-1.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <LogIn size={16} />
            <span>Entrar</span>
          </button>
        )}
        <ThemeToggle />
      </div>

      <div className="w-full max-w-4xl mx-auto text-center">
        {/* Header */}
        <header className="mb-8 animate-fade-in">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-bold text-foreground mb-3 neon-text">
            Game Zone
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg">
            {isAuthenticated && profile 
              ? `Olá, ${profile.nickname}! Escolha um jogo para jogar`
              : "Escolha um jogo para jogar"
            }
          </p>
        </header>

        {/* Ações Rápidas */}
        <div className="flex flex-wrap justify-center gap-3 mb-8 animate-fade-in" style={{ animationDelay: "50ms" }}>
          <button
            onClick={onOpenProfile}
            className="flex items-center gap-2 bg-card border-2 border-border rounded-xl px-4 py-2.5 
                       transition-all hover:border-primary/50 hover:scale-105"
          >
            <Trophy className="w-5 h-5 text-primary" />
            <span className="text-foreground font-medium text-sm">Conquistas</span>
            <span className="bg-primary/20 text-primary text-xs px-2 py-0.5 rounded-full">
              {progress.unlocked}/{progress.total}
            </span>
          </button>
          
          <button
            onClick={onOpenMarketplace}
            className="flex items-center gap-2 bg-yellow-500/10 border-2 border-yellow-500/30 rounded-xl px-4 py-2.5 
                       transition-all hover:border-yellow-500/50 hover:scale-105"
          >
            <ShoppingBag className="w-5 h-5 text-yellow-500" />
            <span className="text-yellow-500 font-medium text-sm">Loja</span>
            {isAuthenticated && (
              <span className="flex items-center gap-1 bg-yellow-500/20 text-yellow-500 text-xs px-2 py-0.5 rounded-full">
                <Coins className="w-3 h-3" />
                {coins.toLocaleString()}
              </span>
            )}
          </button>
          
          {!isAuthenticated && (
            <button
              onClick={() => navigate("/auth")}
              className="flex items-center gap-2 bg-primary/10 border-2 border-primary/30 rounded-xl px-4 py-2.5 
                         transition-all hover:border-primary hover:scale-105"
            >
              <User className="w-5 h-5 text-primary" />
              <span className="text-primary font-medium text-sm">Criar Conta</span>
            </button>
          )}
        </div>

        {/* Grid de Jogos - 2x2 responsivo */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
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
