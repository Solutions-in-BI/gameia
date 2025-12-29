import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Swords, Gamepad2, BookOpen, Brain, Target, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAchievements } from "@/hooks/useAchievements";
import { useTrainings } from "@/hooks/useTrainings";
import { useCognitiveTests } from "@/hooks/useCognitiveTests";
import { useCommitments } from "@/hooks/useCommitments";
import { useOrganization } from "@/hooks/useOrganization";

export function ArenaTab() {
  const navigate = useNavigate();
  const { stats } = useAchievements();
  const { userProgress } = useTrainings();
  const { currentOrg } = useOrganization();
  const { mySessions } = useCognitiveTests();
  const { commitments } = useCommitments(currentOrg?.id);

  const totalGames = stats.totalGamesPlayed || 0;
  const completedTrainings = userProgress.filter(p => p.completed_at).length;
  const completedTests = mySessions?.filter(s => s.status === "completed").length || 0;
  const participatedCommitments = commitments.length;

  const arenaStats = [
    { 
      icon: Gamepad2, 
      label: "Jogos Concluídos", 
      value: totalGames,
      color: "text-primary",
      bgColor: "bg-primary/10"
    },
    { 
      icon: BookOpen, 
      label: "Treinamentos", 
      value: completedTrainings,
      color: "text-secondary",
      bgColor: "bg-secondary/10"
    },
    { 
      icon: Brain, 
      label: "Testes Cognitivos", 
      value: completedTests,
      color: "text-accent",
      bgColor: "bg-accent/10"
    },
    { 
      icon: Target, 
      label: "Compromissos", 
      value: participatedCommitments,
      color: "text-gameia-success",
      bgColor: "bg-gameia-success/10"
    },
  ];

  const gameRecords = [
    { game: "Snake", best: stats.snakeBestScore || 0, played: stats.snakeGamesPlayed || 0 },
    { game: "Dino", best: stats.dinoBestScore || 0, played: stats.dinoGamesPlayed || 0 },
    { game: "Tetris", best: stats.tetrisBestScore || 0, played: stats.tetrisGamesPlayed || 0 },
    { game: "Memória", best: Object.values(stats.memoryBestMoves || {}).length, played: stats.memoryGamesPlayed || 0 },
  ];

  return (
    <div className="space-y-6">
      {/* Resumo de Atividade */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {arenaStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="surface p-4"
            >
              <div className={`w-10 h-10 rounded-lg ${stat.bgColor} flex items-center justify-center mb-3`}>
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Performance nos Jogos */}
      <div className="surface p-5">
        <h3 className="text-sm font-medium text-muted-foreground mb-4 flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          Performance nos Jogos
        </h3>
        
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {gameRecords.map((record, index) => (
            <motion.div
              key={record.game}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="p-4 rounded-lg bg-muted/30"
            >
              <p className="font-medium">{record.game}</p>
              <div className="mt-2 space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Melhor:</span>
                  <span className="font-medium">{record.best.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Jogados:</span>
                  <span>{record.played}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="surface-elevated p-6 text-center"
      >
        <Swords className="h-12 w-12 text-primary mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Continue sua jornada!</h3>
        <p className="text-muted-foreground mb-4">
          Explore jogos, treinamentos e desafios para evoluir suas skills.
        </p>
        <Button onClick={() => navigate("/app?tab=arena")} className="gap-2">
          <Swords className="h-4 w-4" />
          Ir para Arena
        </Button>
      </motion.div>
    </div>
  );
}
