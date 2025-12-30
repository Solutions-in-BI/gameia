/**
 * SkillRecommendations - Recomendações automáticas para evoluir uma skill
 * Mostra jogos, treinamentos e desafios sugeridos
 */

import { motion } from "framer-motion";
import {
  Gamepad2,
  GraduationCap,
  Target,
  ArrowRight,
  Sparkles,
  Clock,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface Recommendation {
  id: string;
  type: "game" | "training" | "challenge";
  title: string;
  description?: string;
  xpReward?: number;
  duration?: string;
  difficulty?: string;
  skillImpact?: number;
}

interface SkillRecommendationsProps {
  skillId: string;
  skillName: string;
  relatedGames?: string[];
  daysSinceLastActivity?: number;
  isStagnant?: boolean;
  compact?: boolean;
}

const TYPE_CONFIG = {
  game: {
    icon: Gamepad2,
    label: "Jogo",
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    route: "/app/arena"
  },
  training: {
    icon: GraduationCap,
    label: "Treinamento",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    route: "/app/development"
  },
  challenge: {
    icon: Target,
    label: "Desafio",
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    route: "/app/evolution"
  }
};

export function SkillRecommendations({
  skillId,
  skillName,
  relatedGames = [],
  daysSinceLastActivity = 0,
  isStagnant = false,
  compact = false
}: SkillRecommendationsProps) {
  const navigate = useNavigate();

  // Generate recommendations based on skill and related games
  const recommendations: Recommendation[] = [
    // Games from related_games
    ...relatedGames.slice(0, 2).map((game, i) => ({
      id: `game-${i}`,
      type: "game" as const,
      title: formatGameName(game),
      description: `Jogue para evoluir ${skillName}`,
      xpReward: 50 + Math.floor(Math.random() * 50),
      duration: "5-10 min",
      skillImpact: 15
    })),
    // Training suggestion
    {
      id: "training-1",
      type: "training" as const,
      title: `Treinamento de ${skillName}`,
      description: "Complete módulos para ganhar XP",
      xpReward: 100,
      duration: "15-30 min",
      skillImpact: 25
    },
    // Challenge suggestion
    {
      id: "challenge-1",
      type: "challenge" as const,
      title: `Desafio de ${skillName}`,
      description: "Aceite um desafio para acelerar evolução",
      xpReward: 200,
      duration: "1-7 dias",
      skillImpact: 40
    }
  ];

  const displayRecommendations = compact 
    ? recommendations.slice(0, 2) 
    : recommendations;

  if (displayRecommendations.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {/* Stagnation Alert */}
      {isStagnant && daysSinceLastActivity > 14 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30"
        >
          <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
          <p className="text-xs text-amber-600 dark:text-amber-400">
            Esta skill não evolui há <strong>{daysSinceLastActivity} dias</strong>. 
            Escolha uma atividade abaixo para retomar!
          </p>
        </motion.div>
      )}

      {/* Recommendations */}
      <div className={cn(
        "grid gap-2",
        compact ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2"
      )}>
        {displayRecommendations.map((rec, index) => {
          const config = TYPE_CONFIG[rec.type];
          const Icon = config.icon;

          return (
            <motion.div
              key={rec.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <button
                onClick={() => navigate(config.route)}
                className={cn(
                  "w-full p-3 rounded-lg border text-left transition-all",
                  "hover:shadow-md hover:scale-[1.02]",
                  "bg-card border-border/50 hover:border-primary/30"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className={cn("p-2 rounded-lg", config.bgColor)}>
                    <Icon className={cn("w-4 h-4", config.color)} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm truncate">
                        {rec.title}
                      </span>
                      <Badge variant="outline" className={cn("text-[10px]", config.color)}>
                        {config.label}
                      </Badge>
                    </div>
                    
                    {rec.description && !compact && (
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {rec.description}
                      </p>
                    )}

                    <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
                      {rec.xpReward && (
                        <span className="flex items-center gap-1 text-primary">
                          <Sparkles className="w-3 h-3" />
                          +{rec.xpReward} XP
                        </span>
                      )}
                      {rec.duration && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {rec.duration}
                        </span>
                      )}
                      {rec.skillImpact && (
                        <span className="flex items-center gap-1 text-green-500">
                          <TrendingUp className="w-3 h-3" />
                          +{rec.skillImpact}%
                        </span>
                      )}
                    </div>
                  </div>

                  <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
                </div>
              </button>
            </motion.div>
          );
        })}
      </div>

      {!compact && (
        <div className="text-center pt-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-muted-foreground"
            onClick={() => navigate("/app/arena")}
          >
            Ver todas as atividades
            <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}

// Helper to format game type keys to readable names
function formatGameName(gameKey: string): string {
  const gameNames: Record<string, string> = {
    quiz: "Quiz de Conhecimento",
    memory: "Jogo da Memória",
    snake: "Snake Corporativo",
    trivia: "Trivia Empresarial",
    word_guess: "Adivinha a Palavra",
    decision: "Tomada de Decisão",
    leadership: "Simulador de Liderança",
    communication: "Desafio de Comunicação"
  };

  return gameNames[gameKey.toLowerCase()] || 
    gameKey.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
}
