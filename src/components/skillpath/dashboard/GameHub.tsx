/**
 * Hub de jogos unificado - acesso rápido a todos os jogos
 */

import { motion } from "framer-motion";
import { 
  Gamepad2, 
  Brain, 
  Zap, 
  Dices, 
  Trophy,
  Play,
  Star,
  TrendingUp
} from "lucide-react";
import { cn } from "@/lib/utils";

interface GameCardProps {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  description: string;
  bestScore?: number;
  gamesPlayed?: number;
  onClick: () => void;
}

function GameCard({ name, icon, color, description, bestScore, gamesPlayed, onClick }: GameCardProps) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "relative p-4 rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm",
        "hover:bg-card hover:border-primary/30 hover:shadow-lg transition-all duration-300",
        "flex flex-col items-start gap-3 text-left w-full"
      )}
    >
      {/* Icon */}
      <div className={cn(
        "w-12 h-12 rounded-xl flex items-center justify-center",
        color
      )}>
        {icon}
      </div>

      {/* Info */}
      <div className="flex-1">
        <h3 className="font-semibold text-foreground">{name}</h3>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>

      {/* Stats */}
      {(bestScore !== undefined || gamesPlayed !== undefined) && (
        <div className="flex items-center gap-3 text-xs text-muted-foreground w-full">
          {bestScore !== undefined && bestScore > 0 && (
            <span className="flex items-center gap-1">
              <Trophy className="w-3 h-3 text-warning" />
              {bestScore}
            </span>
          )}
          {gamesPlayed !== undefined && gamesPlayed > 0 && (
            <span className="flex items-center gap-1">
              <Play className="w-3 h-3" />
              {gamesPlayed}x
            </span>
          )}
        </div>
      )}

      {/* Play indicator */}
      <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <Play className="w-4 h-4 text-primary fill-primary" />
      </div>
    </motion.button>
  );
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

export function GameHub({ stats, onSelectGame }: GameHubProps) {
  const games = [
    {
      id: "snake",
      name: "Snake",
      icon: <Gamepad2 className="w-6 h-6 text-green-400" />,
      color: "bg-green-500/20",
      description: "Colete pontos e cresça",
      bestScore: stats?.snake_best_score,
      gamesPlayed: stats?.snake_games_played,
    },
    {
      id: "memory",
      name: "Memória",
      icon: <Brain className="w-6 h-6 text-purple-400" />,
      color: "bg-purple-500/20",
      description: "Encontre os pares",
      gamesPlayed: stats?.memory_games_played,
    },
    {
      id: "tetris",
      name: "Tetris",
      icon: <Dices className="w-6 h-6 text-cyan-400" />,
      color: "bg-cyan-500/20",
      description: "Encaixe as peças",
      bestScore: stats?.tetris_best_score,
      gamesPlayed: stats?.tetris_games_played,
    },
    {
      id: "dino",
      name: "Dino Run",
      icon: <Zap className="w-6 h-6 text-orange-400" />,
      color: "bg-orange-500/20",
      description: "Corra e pule obstáculos",
      bestScore: stats?.dino_best_score,
      gamesPlayed: stats?.dino_games_played,
    },
    {
      id: "quiz",
      name: "Quiz",
      icon: <Star className="w-6 h-6 text-yellow-400" />,
      color: "bg-yellow-500/20",
      description: "Teste conhecimentos",
    },
    {
      id: "decisions",
      name: "Decisões",
      icon: <TrendingUp className="w-6 h-6 text-blue-400" />,
      color: "bg-blue-500/20",
      description: "Simulador empresarial",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Gamepad2 className="w-5 h-5 text-primary" />
          Centro de Jogos
        </h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {games.map((game, i) => (
          <motion.div
            key={game.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <GameCard
              {...game}
              onClick={() => onSelectGame(game.id)}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
