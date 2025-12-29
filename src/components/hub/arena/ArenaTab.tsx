/**
 * ArenaTab - Tab "Arena" do hub
 * Jogos, desafios, quizzes com filtros e jogo recomendado em destaque
 */

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Gamepad2,
  Zap,
  Brain,
  MessageSquare,
  Sparkles,
  Play,
  Star,
  Trophy,
  Filter,
  Grid3X3,
  Puzzle,
  Car,
  Lightbulb,
  Target,
} from "lucide-react";
import { HubCard, HubCardHeader, HubEmptyState, HubButton, HubHeader } from "../common";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useSkillProgress } from "@/hooks/useSkillProgress";

// Games data
import { SnakeGame } from "@/components/game/snake/SnakeGame";
import { MemoryGame } from "@/components/game/memory/MemoryGame";
import { TetrisGame } from "@/components/game/tetris/TetrisGame";
import { DinoGame } from "@/components/game/dino/DinoGame";
import { QuizMasterGame } from "@/components/game/enterprise/QuizMasterGame";
import { DecisionGame } from "@/components/game/enterprise/DecisionGame";
import { AIScenarioGame } from "@/components/game/enterprise/AIScenarioGame";
import { SalesGame } from "@/components/game/sales/SalesGame";
import { ComingSoonGame } from "@/components/game/enterprise/ComingSoonGame";

type GameFilter = "all" | "enterprise" | "casual" | "quizzes" | "scenarios";
type ActiveGame = string | null;

const GAME_FILTERS: { id: GameFilter; label: string }[] = [
  { id: "all", label: "Todos" },
  { id: "enterprise", label: "Empresariais" },
  { id: "quizzes", label: "Quizzes" },
  { id: "scenarios", label: "Cenários" },
  { id: "casual", label: "Recreativos" },
];

interface GameItem {
  id: string;
  name: string;
  description: string;
  icon: typeof Gamepad2;
  category: GameFilter;
  skills: string[];
  xpReward: number;
  difficulty: "easy" | "medium" | "hard";
  isNew?: boolean;
  isRecommended?: boolean;
}

const GAMES: GameItem[] = [
  {
    id: "quiz",
    name: "Quiz Master",
    description: "Teste seus conhecimentos em diversas categorias",
    icon: Brain,
    category: "quizzes",
    skills: ["Conhecimento Técnico", "Raciocínio Lógico"],
    xpReward: 50,
    difficulty: "medium",
  },
  {
    id: "decisions",
    name: "Decisões Estratégicas",
    description: "Tome decisões difíceis em cenários realistas",
    icon: Target,
    category: "scenarios",
    skills: ["Tomada de Decisão", "Pensamento Crítico"],
    xpReward: 75,
    difficulty: "hard",
    isRecommended: true,
  },
  {
    id: "sales",
    name: "Desafio de Vendas",
    description: "Pratique técnicas de vendas com IA",
    icon: MessageSquare,
    category: "enterprise",
    skills: ["Comunicação", "Negociação", "Vendas"],
    xpReward: 100,
    difficulty: "hard",
  },
  {
    id: "ai-game",
    name: "Cenários com IA",
    description: "Resolva problemas complexos gerados por IA",
    icon: Sparkles,
    category: "scenarios",
    skills: ["Resolução de Problemas", "Criatividade"],
    xpReward: 80,
    difficulty: "hard",
    isNew: true,
  },
  {
    id: "memory",
    name: "Jogo da Memória",
    description: "Treine sua memória encontrando pares",
    icon: Grid3X3,
    category: "casual",
    skills: ["Memória", "Concentração"],
    xpReward: 25,
    difficulty: "easy",
  },
  {
    id: "snake",
    name: "Snake Game",
    description: "Clássico jogo da cobrinha",
    icon: Gamepad2,
    category: "casual",
    skills: ["Reflexos", "Coordenação"],
    xpReward: 20,
    difficulty: "medium",
  },
  {
    id: "tetris",
    name: "Tetris",
    description: "Encaixe as peças e faça linhas",
    icon: Puzzle,
    category: "casual",
    skills: ["Raciocínio Espacial", "Velocidade"],
    xpReward: 30,
    difficulty: "medium",
  },
  {
    id: "dino",
    name: "Dino Run",
    description: "Pule os obstáculos e sobreviva",
    icon: Zap,
    category: "casual",
    skills: ["Reflexos", "Timing"],
    xpReward: 15,
    difficulty: "easy",
  },
];

const COMING_SOON_GAMES = [
  {
    id: "escape",
    name: "Escape Room Virtual",
    icon: Puzzle,
    description: "Resolva enigmas em equipe",
  },
  {
    id: "projects",
    name: "Corrida de Projetos",
    icon: Car,
    description: "Gerencie recursos e complete projetos",
  },
  {
    id: "brainstorm",
    name: "Brainstorm Battle",
    icon: Lightbulb,
    description: "Competição de ideias criativas",
  },
];

export function ArenaTab() {
  const [filter, setFilter] = useState<GameFilter>("all");
  const [activeGame, setActiveGame] = useState<ActiveGame>(null);
  const { skills } = useSkillProgress();

  // Find recommended game based on weak skills
  const weakSkills = skills.slice(0, 3).map(s => s.name.toLowerCase());
  const recommendedGame = GAMES.find(g => 
    g.skills.some(s => weakSkills.some(ws => s.toLowerCase().includes(ws)))
  ) || GAMES.find(g => g.isRecommended);

  // Filter games
  const filteredGames = GAMES.filter(g => 
    filter === "all" || g.category === filter
  );

  // Handle back from game
  const handleBack = () => setActiveGame(null);

  // Render active game
  if (activeGame) {
    switch (activeGame) {
      case "snake": return <SnakeGame onBack={handleBack} />;
      case "memory": return <MemoryGame onBack={handleBack} />;
      case "tetris": return <TetrisGame onBack={handleBack} />;
      case "dino": return <DinoGame onBack={handleBack} />;
      case "quiz": return <QuizMasterGame onBack={handleBack} />;
      case "decisions": return <DecisionGame onBack={handleBack} />;
      case "sales": return <SalesGame onBack={handleBack} />;
      case "ai-game": return <AIScenarioGame onBack={handleBack} />;
      case "escape": return <ComingSoonGame onBack={handleBack} gameName="Escape Room Virtual" gameIcon={<Puzzle className="w-12 h-12" />} description="Resolva enigmas em equipe" expectedFeatures={["Puzzles colaborativos", "Chat em tempo real", "Rankings de equipe"]} />;
      case "projects": return <ComingSoonGame onBack={handleBack} gameName="Corrida de Projetos" gameIcon={<Car className="w-12 h-12" />} description="Gerencie recursos e complete projetos" expectedFeatures={["Gestão de recursos", "Simulação de projetos reais"]} />;
      case "brainstorm": return <ComingSoonGame onBack={handleBack} gameName="Brainstorm Battle" gameIcon={<Lightbulb className="w-12 h-12" />} description="Competição de ideias criativas" expectedFeatures={["Geração de ideias", "Votação democrática"]} />;
      default: return null;
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <HubHeader
        title="Arena"
        subtitle="Jogos e desafios que evoluem suas skills"
        icon={Gamepad2}
        actionLabel="Jogar Agora"
        actionIcon={Play}
        onAction={() => recommendedGame && setActiveGame(recommendedGame.id)}
      />

      {/* Recommended Game - Highlight */}
      {recommendedGame && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <HubCard 
            variant="highlight" 
            className="relative overflow-hidden cursor-pointer"
            onClick={() => setActiveGame(recommendedGame.id)}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent pointer-events-none" />
            <div className="flex flex-col md:flex-row md:items-center gap-4 relative">
              <div className="p-4 rounded-xl bg-primary/10">
                <recommendedGame.icon className="w-10 h-10 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Badge className="bg-primary/20 text-primary text-xs">
                    <Star className="w-3 h-3 mr-1" />
                    Recomendado
                  </Badge>
                  {recommendedGame.isNew && (
                    <Badge variant="secondary" className="text-xs">Novo</Badge>
                  )}
                </div>
                <h3 className="text-xl font-bold text-foreground">{recommendedGame.name}</h3>
                <p className="text-sm text-muted-foreground">{recommendedGame.description}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {recommendedGame.skills.map(skill => (
                    <Badge key={skill} variant="outline" className="text-xs">{skill}</Badge>
                  ))}
                </div>
              </div>
              <HubButton 
                size="lg" 
                leftIcon={<Play className="w-4 h-4" />}
              >
                Jogar
              </HubButton>
            </div>
          </HubCard>
        </motion.div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <Filter className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        {GAME_FILTERS.map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all",
              filter === f.id
                ? "bg-primary text-primary-foreground"
                : "bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Games Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredGames.map((game, index) => (
          <motion.div
            key={game.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <GameCard game={game} onClick={() => setActiveGame(game.id)} />
          </motion.div>
        ))}
      </div>

      {/* Coming Soon */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-foreground mb-4">Em Breve</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {COMING_SOON_GAMES.map((game) => (
            <HubCard 
              key={game.id} 
              className="opacity-60 cursor-pointer hover:opacity-80"
              onClick={() => setActiveGame(game.id)}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  <game.icon className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{game.name}</p>
                  <p className="text-xs text-muted-foreground">{game.description}</p>
                </div>
              </div>
            </HubCard>
          ))}
        </div>
      </div>
    </div>
  );
}

// Game Card Component
function GameCard({ game, onClick }: { game: GameItem; onClick: () => void }) {
  const difficultyColors = {
    easy: "text-gameia-success",
    medium: "text-gameia-warning",
    hard: "text-destructive",
  };

  return (
    <HubCard 
      className="cursor-pointer group h-full" 
      onClick={onClick}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-start justify-between mb-3">
          <div className="p-2.5 rounded-xl bg-muted group-hover:bg-primary/10 transition-colors">
            <game.icon className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
          <div className="flex items-center gap-1.5">
            {game.isNew && (
              <Badge variant="secondary" className="text-xs">Novo</Badge>
            )}
            <Badge variant="outline" className={cn("text-xs", difficultyColors[game.difficulty])}>
              {game.difficulty === "easy" ? "Fácil" : game.difficulty === "medium" ? "Médio" : "Difícil"}
            </Badge>
          </div>
        </div>
        
        <h4 className="font-semibold text-foreground mb-1">{game.name}</h4>
        <p className="text-sm text-muted-foreground mb-3 flex-1">{game.description}</p>
        
        <div className="flex items-center justify-between pt-3 border-t border-border/30">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Trophy className="w-3.5 h-3.5" />
            <span>+{game.xpReward} XP</span>
          </div>
          <HubButton size="sm" variant="ghost" rightIcon={<Play className="w-3.5 h-3.5" />}>
            Jogar
          </HubButton>
        </div>
      </div>
    </HubCard>
  );
}
