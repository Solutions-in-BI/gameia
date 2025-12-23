/**
 * WeeklyChallenge - Desafios semanais competitivos
 */

import { motion } from "framer-motion";
import { Target, Clock, Trophy, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface Challenge {
  id: string;
  title: string;
  description: string;
  icon: string;
  target: number;
  current: number;
  reward: { coins: number; xp: number };
  expiresAt: string;
  participants?: number;
}

interface WeeklyChallengeProps {
  challenges: Challenge[];
  onClaim?: (challengeId: string) => void;
}

// Desafios exemplo (serão dinâmicos do banco)
export const SAMPLE_CHALLENGES: Challenge[] = [
  {
    id: "weekly_snake",
    title: "Mestre Snake",
    description: "Faça 500 pontos no Snake",
    icon: "🐍",
    target: 500,
    current: 0,
    reward: { coins: 200, xp: 100 },
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    participants: 42,
  },
  {
    id: "weekly_games",
    title: "Jogador Dedicado",
    description: "Complete 10 jogos",
    icon: "🎮",
    target: 10,
    current: 0,
    reward: { coins: 100, xp: 50 },
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    participants: 128,
  },
  {
    id: "weekly_tetris",
    title: "Arquiteto",
    description: "Limpe 50 linhas no Tetris",
    icon: "🧱",
    target: 50,
    current: 0,
    reward: { coins: 150, xp: 75 },
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    participants: 67,
  },
];

export function WeeklyChallenge({ challenges, onClaim }: WeeklyChallengeProps) {
  const formatTimeLeft = (expiresAt: string) => {
    const diff = new Date(expiresAt).getTime() - Date.now();
    const days = Math.floor(diff / (24 * 60 * 60 * 1000));
    const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    
    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-foreground flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          Desafios Semanais
        </h3>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" />
          {challenges.length > 0 && formatTimeLeft(challenges[0].expiresAt)}
        </div>
      </div>

      {challenges.map((challenge) => {
        const progress = Math.min(100, (challenge.current / challenge.target) * 100);
        const isComplete = challenge.current >= challenge.target;

        return (
          <motion.div
            key={challenge.id}
            className={cn(
              "bg-card border rounded-xl p-4 transition-all",
              isComplete 
                ? "border-green-500/50 bg-green-500/5" 
                : "border-border hover:border-primary/50"
            )}
            whileHover={{ scale: 1.01 }}
          >
            <div className="flex items-start gap-3">
              <div className="text-2xl">{challenge.icon}</div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-foreground">{challenge.title}</h4>
                  {isComplete && (
                    <span className="text-xs bg-green-500/20 text-green-500 px-1.5 py-0.5 rounded">
                      Completo!
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-2">{challenge.description}</p>
                
                {/* Barra de progresso */}
                <div className="h-2 bg-muted rounded-full overflow-hidden mb-2">
                  <motion.div
                    className={cn(
                      "h-full rounded-full",
                      isComplete ? "bg-green-500" : "bg-primary"
                    )}
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    {challenge.current}/{challenge.target}
                  </span>
                  <div className="flex items-center gap-3">
                    {challenge.participants && (
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Users className="w-3 h-3" />
                        {challenge.participants}
                      </span>
                    )}
                    <span className="text-primary font-medium">
                      +{challenge.reward.coins}🪙 +{challenge.reward.xp}XP
                    </span>
                  </div>
                </div>
              </div>

              {/* Botão de resgatar */}
              {isComplete && onClaim && (
                <motion.button
                  onClick={() => onClaim(challenge.id)}
                  className="px-3 py-1.5 bg-green-500 text-white rounded-lg text-sm font-medium"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Trophy className="w-4 h-4" />
                </motion.button>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
