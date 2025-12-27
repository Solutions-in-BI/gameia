/**
 * Hub de jogos - separado em Treinamento Corporativo vs Recreação
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
  TrendingUp,
  GraduationCap,
  BarChart3,
  Target,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";

interface GameCardProps {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  description: string;
  skill?: string;
  bestScore?: number;
  gamesPlayed?: number;
  onClick: () => void;
  featured?: boolean;
}

function GameCard({ name, icon, color, description, skill, bestScore, gamesPlayed, onClick, featured }: GameCardProps) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "relative p-4 rounded-2xl border bg-card/50 backdrop-blur-sm",
        "hover:bg-card hover:shadow-lg transition-all duration-300",
        "flex flex-col items-start gap-3 text-left w-full group",
        featured 
          ? "border-primary/40 hover:border-primary/60 ring-1 ring-primary/20" 
          : "border-border/50 hover:border-primary/30"
      )}
    >
      {/* Featured badge */}
      {featured && (
        <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-[10px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          RH
        </div>
      )}

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
        {skill && (
          <span className="inline-flex items-center gap-1 mt-1.5 text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
            <Target className="w-3 h-3" />
            {skill}
          </span>
        )}
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
  // Jogos de Treinamento Corporativo - geram dados úteis para RH/gestão
  const trainingGames = [
    {
      id: "decisions",
      name: "Simulador de Decisões",
      icon: <TrendingUp className="w-6 h-6 text-blue-400" />,
      color: "bg-blue-500/20",
      description: "Tome decisões empresariais reais",
      skill: "Tomada de Decisão",
      featured: true,
    },
    {
      id: "quiz",
      name: "Quiz Empresarial",
      icon: <GraduationCap className="w-6 h-6 text-emerald-400" />,
      color: "bg-emerald-500/20",
      description: "Teste conhecimentos corporativos",
      skill: "Conhecimento Técnico",
      featured: true,
    },
    {
      id: "memory",
      name: "Memória Estratégica",
      icon: <Brain className="w-6 h-6 text-purple-400" />,
      color: "bg-purple-500/20",
      description: "Treine foco e concentração",
      skill: "Memória & Foco",
      gamesPlayed: stats?.memory_games_played,
      featured: true,
    },
  ];

  // Jogos de Recreação - engajamento e diversão
  const recreationGames = [
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
  ];

  return (
    <div className="space-y-6">
      {/* Treinamento Corporativo */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <BarChart3 className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Treinamento Corporativo</h2>
            <p className="text-xs text-muted-foreground">Jogos que desenvolvem competências e geram métricas para RH</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {trainingGames.map((game, i) => (
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

      {/* Recreação */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
            <Star className="w-4 h-4 text-muted-foreground" />
          </div>
          <div>
            <h2 className="text-base font-medium text-foreground">Recreação</h2>
            <p className="text-xs text-muted-foreground">Jogos casuais para relaxar e ganhar moedas</p>
          </div>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-3 gap-3">
          {recreationGames.map((game, i) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.05 }}
            >
              <GameCard
                {...game}
                onClick={() => onSelectGame(game.id)}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
