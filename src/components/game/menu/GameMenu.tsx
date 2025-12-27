import { useState } from "react";
import { Gamepad2, Brain, Trophy, LogIn, LogOut, User, ShoppingBag, Coins, Flame, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { GameType } from "@/types/game";
import { useAchievements } from "@/hooks/useAchievements";
import { useAuth } from "@/hooks/useAuth";
import { useMarketplace } from "@/hooks/useMarketplace";
import { useLevel } from "@/hooks/useLevel";
import { useStreak } from "@/hooks/useStreak";
import { ThemeToggle } from "../common/ThemeToggle";
import { LevelBadge } from "../common/LevelBadge";
import { WeeklyChallenge, SAMPLE_CHALLENGES } from "../common/WeeklyChallenge";
import { DailyStreak } from "../common/DailyStreak";
import { FriendsPage } from "../friends/FriendsPage";

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
    id: "quiz" as const,
    title: "Quiz Battle",
    description: "Teste seus conhecimentos em marketing, projetos e mais!",
    icon: Brain,
    colorClass: "primary",
    tags: ["Educativo", "Apostas"],
  },
  {
    id: "memory" as const,
    title: "Jogo da Memória",
    description: "Encontre todos os pares de cartas. Teste sua memória!",
    icon: Brain,
    colorClass: "secondary",
    tags: ["3 dificuldades", "Recordes"],
  },
  {
    id: "snake" as const,
    title: "Snake",
    description: "Controle a cobra e colete comida. Jogo clássico!",
    icon: Gamepad2,
    colorClass: "primary",
    tags: ["Velocidade crescente", "Recorde"],
  },
  {
    id: "dino" as const,
    title: "Dino Runner",
    description: "Pule e abaixe para desviar dos obstáculos!",
    icon: Gamepad2,
    colorClass: "secondary",
    tags: ["Pássaros voadores", "Abaixar"],
  },
  {
    id: "tetris" as const,
    title: "Tetris",
    description: "Encaixe as peças e limpe linhas. Clássico eterno!",
    icon: Gamepad2,
    colorClass: "primary",
    tags: ["Níveis", "Hard drop"],
  },
];

export function GameMenu({ onSelectGame, onOpenProfile, onOpenMarketplace }: GameMenuProps) {
  const navigate = useNavigate();
  const { getProgress } = useAchievements();
  const { user, profile, isAuthenticated, signOut } = useAuth();
  const { coins } = useMarketplace();
  const { level, xp } = useLevel();
  const { streak, canClaimToday, claimDailyReward } = useStreak();
  const [showFriends, setShowFriends] = useState(false);
  const progress = getProgress();

  const displayName = profile?.nickname || user?.email?.split("@")[0] || "Conta";
  const avatarInitial = displayName.charAt(0).toUpperCase() || "G";

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-6 px-4 relative">
      {/* Header Actions */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        {isAuthenticated ? (
          <>
            {/* Level Badge */}
            <LevelBadge level={level} xp={xp} size="md" showProgress />
            
            <button
              type="button"
              onClick={onOpenProfile}
              className="flex items-center gap-2 bg-card border border-border rounded-xl px-3 py-2 hover:bg-muted transition-all hover:scale-105 shadow-sm"
              title="Ver Perfil"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-sm font-bold text-primary-foreground">
                {avatarInitial}
              </div>
              <span className="text-sm font-medium text-foreground hidden sm:inline">{displayName}</span>
            </button>
            <button
              type="button"
              onClick={() => setShowFriends(true)}
              className="p-2.5 rounded-xl bg-card border border-border hover:bg-muted transition-all hover:scale-105 shadow-sm"
              title="Amigos"
            >
              <Users size={18} className="text-primary" />
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="p-2.5 rounded-xl bg-card border border-border hover:bg-muted transition-all hover:scale-105 shadow-sm"
              title="Sair"
            >
              <LogOut size={18} className="text-muted-foreground" />
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => navigate("/auth")}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-medium 
                       hover:opacity-90 transition-all hover:scale-105 shadow-sm"
          >
            <LogIn size={16} />
            <span>Entrar</span>
          </button>
        )}
        <ThemeToggle />
      </div>

      <div className="w-full max-w-4xl mx-auto text-center">
        {/* Header */}
        <header className="mb-6 animate-fade-in">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-bold text-foreground mb-2 neon-text">
            Game Zone
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            {isAuthenticated ? `Olá, ${displayName}! Escolha um jogo` : "Escolha um jogo para jogar"}
          </p>
        </header>

        {/* Ações Rápidas */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-6 animate-fade-in" style={{ animationDelay: "50ms" }}>
          <button
            onClick={onOpenProfile}
            className="flex items-center gap-2 bg-card border-2 border-border rounded-xl px-3 sm:px-4 py-2 
                       transition-all hover:border-primary/50 hover:scale-105 shadow-sm"
          >
            <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            <span className="text-foreground font-medium text-xs sm:text-sm">Conquistas</span>
            <span className="bg-primary/20 text-primary text-xs px-2 py-0.5 rounded-full">
              {progress.unlocked}/{progress.total}
            </span>
          </button>
          
          <button
            onClick={onOpenMarketplace}
            className="flex items-center gap-2 bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border-2 border-yellow-500/30 rounded-xl px-3 sm:px-4 py-2 
                       transition-all hover:border-yellow-500/50 hover:scale-105 shadow-sm"
          >
            <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />
            <span className="text-yellow-500 font-medium text-xs sm:text-sm">Loja</span>
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
              className="flex items-center gap-2 bg-primary/10 border-2 border-primary/30 rounded-xl px-3 sm:px-4 py-2 
                         transition-all hover:border-primary hover:scale-105 shadow-sm"
            >
              <User className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              <span className="text-primary font-medium text-xs sm:text-sm">Criar Conta</span>
            </button>
          )}
        </div>

        {/* Grid de Jogos */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          {GAMES.map((game, index) => (
            <GameCard
              key={game.id}
              {...game}
              onClick={() => onSelectGame(game.id)}
              delay={100 * (index + 1)}
            />
          ))}
        </div>

        {/* Streak Diário e Desafios (apenas para logados) */}
        {isAuthenticated && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
            {/* Streak Diário */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <DailyStreak
                currentStreak={streak.currentStreak}
                longestStreak={streak.longestStreak}
                lastPlayedAt={streak.lastPlayedAt || undefined}
                canClaimToday={canClaimToday}
                onClaim={claimDailyReward}
              />
            </motion.div>

            {/* Desafios Semanais */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <WeeklyChallenge challenges={SAMPLE_CHALLENGES} />
            </motion.div>
          </div>
        )}
      </div>

      {/* Modal de Amigos */}
      <FriendsPage isOpen={showFriends} onClose={() => setShowFriends(false)} />
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
      className="group relative bg-card border-2 border-border rounded-2xl p-4 sm:p-5 
                 transition-all duration-300 hover:border-primary/50 hover:scale-[1.02] hover:shadow-lg
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
        <div className="w-12 h-12 sm:w-14 sm:h-14 mb-3 rounded-xl bg-primary/15 flex items-center justify-center 
                        group-hover:bg-primary/25 transition-colors shadow-sm">
          <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
        </div>
        
        {/* Título */}
        <h2 className="text-base sm:text-lg font-display font-bold text-foreground mb-1 text-center leading-tight">
          {title}
        </h2>
        
        {/* Descrição */}
        <p className="text-muted-foreground text-xs sm:text-sm text-center flex-1 leading-relaxed line-clamp-2">
          {description}
        </p>
        
        {/* Tags */}
        <div className="mt-3 flex flex-wrap justify-center gap-1.5">
          {tags.map(tag => (
            <span 
              key={tag}
              className="px-2 py-0.5 bg-muted rounded-full text-[10px] sm:text-xs text-muted-foreground whitespace-nowrap"
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
