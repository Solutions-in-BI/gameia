/**
 * Hub de jogos - Cards visuais com dificuldade, jogadores, tempo, XP e moedas
 * Design moderno inspirado na referência com gradientes e ícones grandes
 */

import { motion } from "framer-motion";
import { 
  Gamepad2, 
  Brain, 
  Zap, 
  Dices, 
  Trophy,
  Play,
  Users,
  Clock,
  Star,
  Coins,
  GraduationCap,
  TrendingUp,
  Lightbulb,
  Target,
  Briefcase,
  Puzzle,
  MessageSquare,
  Car
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export type GameDifficulty = "easy" | "medium" | "hard";

export interface Game {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  difficulty: GameDifficulty;
  players: string; // ex: "1-4", "2-6"
  duration: string; // ex: "10 min", "20 min"
  xpReward: number;
  coinsReward: number;
  gradient: string;
  featured?: boolean;
}

interface GameHubProps {
  stats?: {
    snake_best_score?: number;
    snake_games_played?: number;
    memory_games_played?: number;
    tetris_best_score?: number;
    tetris_games_played?: number;
    dino_best_score?: number;
    dino_games_played?: number;
  };
  onSelectGame: (game: string) => void;
}

// Estilos por dificuldade
const DIFFICULTY_STYLES: Record<GameDifficulty, { label: string; color: string }> = {
  easy: { label: "EASY", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
  medium: { label: "MEDIUM", color: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
  hard: { label: "HARD", color: "bg-rose-500/20 text-rose-400 border-rose-500/30" },
};

// Jogos Empresariais
const ENTERPRISE_GAMES: Game[] = [
  {
    id: "quiz",
    name: "Quiz Master",
    description: "Teste seus conhecimentos sobre a empresa, produtos e cultura organizacional",
    icon: <Brain className="w-16 h-16" />,
    difficulty: "easy",
    players: "1-4",
    duration: "10 min",
    xpReward: 150,
    coinsReward: 50,
    gradient: "from-pink-500/30 to-purple-600/30",
    featured: true,
  },
  {
    id: "decisions",
    name: "Desafio de Vendas",
    description: "Simule negociações e feche o maior número de vendas possível",
    icon: <Briefcase className="w-16 h-16" />,
    difficulty: "medium",
    players: "1-2",
    duration: "15 min",
    xpReward: 300,
    coinsReward: 100,
    gradient: "from-amber-500/30 to-orange-600/30",
  },
  {
    id: "escape",
    name: "Escape Room Virtual",
    description: "Resolva enigmas em equipe para escapar antes do tempo acabar",
    icon: <Puzzle className="w-16 h-16" />,
    difficulty: "hard",
    players: "4-8",
    duration: "30 min",
    xpReward: 500,
    coinsReward: 200,
    gradient: "from-purple-500/30 to-pink-600/30",
  },
  {
    id: "projects",
    name: "Corrida de Projetos",
    description: "Gerencie recursos e complete o projeto antes da concorrência",
    icon: <Car className="w-16 h-16" />,
    difficulty: "medium",
    players: "2-6",
    duration: "20 min",
    xpReward: 350,
    coinsReward: 120,
    gradient: "from-cyan-500/30 to-blue-600/30",
  },
  {
    id: "brainstorm",
    name: "Brainstorm Battle",
    description: "Competição de ideias criativas com votação em tempo real",
    icon: <Lightbulb className="w-16 h-16" />,
    difficulty: "easy",
    players: "3-10",
    duration: "25 min",
    xpReward: 200,
    coinsReward: 80,
    gradient: "from-emerald-500/30 to-teal-600/30",
  },
  {
    id: "leader",
    name: "Líder Supremo",
    description: "Simulador de liderança com desafios de gestão de equipe",
    icon: <Target className="w-16 h-16" />,
    difficulty: "hard",
    players: "1",
    duration: "45 min",
    xpReward: 600,
    coinsReward: 250,
    gradient: "from-indigo-500/30 to-violet-600/30",
  },
];

// Jogos Casuais/Recreação
const CASUAL_GAMES: Game[] = [
  {
    id: "snake",
    name: "Snake",
    description: "Colete pontos e cresça sem bater nas paredes",
    icon: <Gamepad2 className="w-12 h-12" />,
    difficulty: "easy",
    players: "1",
    duration: "5 min",
    xpReward: 50,
    coinsReward: 20,
    gradient: "from-green-500/30 to-emerald-600/30",
  },
  {
    id: "tetris",
    name: "Tetris",
    description: "Encaixe as peças e limpe linhas",
    icon: <Dices className="w-12 h-12" />,
    difficulty: "medium",
    players: "1",
    duration: "10 min",
    xpReward: 80,
    coinsReward: 30,
    gradient: "from-cyan-500/30 to-blue-600/30",
  },
  {
    id: "dino",
    name: "Dino Run",
    description: "Corra e pule obstáculos no deserto",
    icon: <Zap className="w-12 h-12" />,
    difficulty: "easy",
    players: "1",
    duration: "5 min",
    xpReward: 40,
    coinsReward: 15,
    gradient: "from-orange-500/30 to-amber-600/30",
  },
  {
    id: "memory",
    name: "Memória",
    description: "Encontre os pares de cartas",
    icon: <Brain className="w-12 h-12" />,
    difficulty: "easy",
    players: "1",
    duration: "5 min",
    xpReward: 60,
    coinsReward: 25,
    gradient: "from-purple-500/30 to-pink-600/30",
  },
];

export function GameHub({ stats, onSelectGame }: GameHubProps) {
  return (
    <div className="space-y-8">
      {/* Jogos Empresariais */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
          Jogos Empresariais
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ENTERPRISE_GAMES.map((game, index) => (
            <EnterpriseGameCard
              key={game.id}
              game={game}
              onClick={() => onSelectGame(game.id)}
              delay={index * 0.05}
            />
          ))}
        </div>
      </div>

      {/* Jogos Casuais */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-foreground">Recreação</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {CASUAL_GAMES.map((game, index) => (
            <CasualGameCard
              key={game.id}
              game={game}
              bestScore={
                game.id === "snake" ? stats?.snake_best_score :
                game.id === "tetris" ? stats?.tetris_best_score :
                game.id === "dino" ? stats?.dino_best_score : undefined
              }
              gamesPlayed={
                game.id === "snake" ? stats?.snake_games_played :
                game.id === "tetris" ? stats?.tetris_games_played :
                game.id === "dino" ? stats?.dino_games_played :
                game.id === "memory" ? stats?.memory_games_played : undefined
              }
              onClick={() => onSelectGame(game.id)}
              delay={0.3 + index * 0.05}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

interface EnterpriseGameCardProps {
  game: Game;
  onClick: () => void;
  delay?: number;
}

function EnterpriseGameCard({ game, onClick, delay = 0 }: EnterpriseGameCardProps) {
  const diffStyle = DIFFICULTY_STYLES[game.difficulty];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="group"
    >
      <div className={cn(
        "relative overflow-hidden rounded-2xl border border-border/50",
        "bg-gradient-to-br",
        game.gradient,
        "hover:border-primary/50 transition-all duration-300"
      )}>
        {/* Icon Area */}
        <div className="h-32 flex items-center justify-center text-foreground/80 group-hover:scale-110 transition-transform duration-300">
          {game.icon}
        </div>

        {/* Content */}
        <div className="p-4 bg-card/90 backdrop-blur-sm space-y-3">
          {/* Title & Difficulty */}
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg text-foreground">{game.name}</h3>
            <span className={cn(
              "px-2 py-0.5 rounded-full text-[10px] font-bold border",
              diffStyle.color
            )}>
              {diffStyle.label}
            </span>
          </div>

          {/* Description */}
          <p className="text-sm text-muted-foreground line-clamp-2">
            {game.description}
          </p>

          {/* Stats */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              {game.players}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {game.duration}
            </span>
          </div>

          {/* Rewards */}
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1 text-amber-400">
              <Star className="w-3.5 h-3.5" />
              +{game.xpReward} XP
            </span>
            <span className="flex items-center gap-1 text-emerald-400">
              <Coins className="w-3.5 h-3.5" />
              +{game.coinsReward} Moedas
            </span>
          </div>

          {/* Play Button */}
          <Button
            onClick={onClick}
            className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-white font-semibold gap-2"
          >
            <Play className="w-4 h-4" />
            JOGAR AGORA
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

interface CasualGameCardProps {
  game: Game;
  bestScore?: number;
  gamesPlayed?: number;
  onClick: () => void;
  delay?: number;
}

function CasualGameCard({ game, bestScore, gamesPlayed, onClick, delay = 0 }: CasualGameCardProps) {
  return (
    <motion.button
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "relative p-4 rounded-xl border border-border/50",
        "bg-gradient-to-br",
        game.gradient,
        "hover:border-primary/50 transition-all duration-300",
        "flex flex-col items-center text-center"
      )}
    >
      {/* Icon */}
      <div className="mb-2 text-foreground/80">
        {game.icon}
      </div>

      {/* Name */}
      <h3 className="font-semibold text-foreground">{game.name}</h3>

      {/* Stats */}
      {(bestScore !== undefined && bestScore > 0) && (
        <div className="flex items-center gap-1 text-xs text-amber-400 mt-1">
          <Trophy className="w-3 h-3" />
          {bestScore}
        </div>
      )}

      {/* Rewards */}
      <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-2">
        <span>+{game.xpReward} XP</span>
        <span>+{game.coinsReward} 🪙</span>
      </div>
    </motion.button>
  );
}
