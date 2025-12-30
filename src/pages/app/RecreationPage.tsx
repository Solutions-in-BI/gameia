import { useState } from "react";
import { ArrowLeft, Gamepad2, Coffee, Brain, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

// Games
import SnakeGame from "@/components/game/snake/SnakeGame";
import TetrisGame from "@/components/game/tetris/TetrisGame";
import DinoGame from "@/components/game/dino/DinoGame";
import { MemoryGame } from "@/components/game/memory/MemoryGame";

type RecreationalGame = "snake" | "tetris" | "dino" | "memory" | null;

const RECREATIONAL_GAMES = [
  {
    id: "memory" as const,
    name: "Jogo da Memória",
    description: "Treine sua memória de trabalho",
    icon: Brain,
    gradient: "from-purple-500/20 to-pink-500/20",
    iconColor: "text-purple-400"
  },
  {
    id: "snake" as const,
    name: "Snake",
    description: "Clássico jogo da cobrinha",
    icon: Zap,
    gradient: "from-green-500/20 to-emerald-500/20",
    iconColor: "text-green-400"
  },
  {
    id: "tetris" as const,
    name: "Tetris",
    description: "Encaixe as peças",
    icon: Gamepad2,
    gradient: "from-blue-500/20 to-cyan-500/20",
    iconColor: "text-blue-400"
  },
  {
    id: "dino" as const,
    name: "Dino Run",
    description: "Pule os obstáculos",
    icon: Zap,
    gradient: "from-orange-500/20 to-amber-500/20",
    iconColor: "text-orange-400"
  }
];

export default function RecreationPage() {
  const navigate = useNavigate();
  const [activeGame, setActiveGame] = useState<RecreationalGame>(null);

  const handleBack = () => {
    if (activeGame) {
      setActiveGame(null);
    } else {
      navigate("/app");
    }
  };

  // Render active game
  if (activeGame === "snake") return <SnakeGame onBack={handleBack} />;
  if (activeGame === "tetris") return <TetrisGame onBack={handleBack} />;
  if (activeGame === "dino") return <DinoGame onBack={handleBack} />;
  if (activeGame === "memory") return <MemoryGame onBack={handleBack} />;

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <Coffee className="h-5 w-5 text-muted-foreground" />
              <h1 className="text-2xl font-bold">Área de Recreação</h1>
            </div>
            <p className="text-muted-foreground text-sm mt-1">
              Jogos para momentos de pausa — sem impacto nas competências
            </p>
          </div>
        </div>

        {/* Info Banner */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-muted/50 border border-border rounded-lg p-4 mb-8"
        >
          <p className="text-sm text-muted-foreground">
            ☕ Estes jogos são apenas para diversão e não geram XP, moedas ou 
            impactam seu desenvolvimento profissional. Aproveite a pausa!
          </p>
        </motion.div>

        {/* Games Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {RECREATIONAL_GAMES.map((game, index) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                className="cursor-pointer hover:border-primary/50 transition-all group overflow-hidden"
                onClick={() => setActiveGame(game.id)}
              >
                <CardContent className="p-4 flex flex-col items-center text-center">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${game.gradient} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                    <game.icon className={`h-7 w-7 ${game.iconColor}`} />
                  </div>
                  <h3 className="font-semibold text-sm">{game.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {game.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
