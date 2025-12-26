/**
 * Seção: Gamificação Empresarial
 * Centro de treinamento gamificado
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Gamepad2, 
  Brain, 
  Target, 
  Zap,
  Clock,
  Trophy,
  Flame,
  Award
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useStreak } from "@/hooks/useStreak";
import { EnterpriseQuiz } from "@/components/game/enterprise/EnterpriseQuiz";
import { cn } from "@/lib/utils";

type GameMode = "hub" | "quiz";

const TRAINING_MODULES = [
  {
    id: "quiz" as const,
    title: "Quiz Battle",
    description: "Teste conhecimentos em marketing, projetos e gestão",
    icon: Brain,
    color: "primary",
    tags: ["5 categorias", "Apostas"],
    available: true,
  },
  {
    id: "decisions" as const,
    title: "Simulador de Decisões",
    description: "Cenários reais de negócios para treinar liderança",
    icon: Target,
    color: "accent",
    tags: ["Cenários", "Feedback"],
    available: true,
  },
  {
    id: "blitz" as const,
    title: "Modo Blitz",
    description: "1 minuto, pressão máxima, recompensa maior",
    icon: Zap,
    color: "secondary",
    tags: ["60 segundos", "2x XP"],
    available: true,
  },
  {
    id: "marathon" as const,
    title: "Maratona",
    description: "Sessão longa de aprendizado profundo",
    icon: Clock,
    color: "purple",
    tags: ["30+ perguntas", "Sem limite"],
    available: false,
  },
];

export function GamificationSection() {
  const { isAuthenticated } = useAuth();
  const { streak, canClaimToday, claimDailyReward } = useStreak();
  const [gameMode, setGameMode] = useState<GameMode>("hub");

  if (gameMode === "quiz") {
    return <EnterpriseQuiz onBack={() => setGameMode("hub")} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground mb-1">
            Centro de Treinamento
          </h1>
          <p className="text-muted-foreground">
            Desenvolva habilidades jogando e competindo
          </p>
        </div>

        {isAuthenticated && (
          <div className="flex items-center gap-3">
            {/* Streak Badge */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl border-2",
                streak.currentStreak > 0
                  ? "bg-skillpath-warning/10 border-skillpath-warning/30 text-skillpath-warning"
                  : "bg-muted border-border text-muted-foreground"
              )}
            >
              <Flame className="w-5 h-5" />
              <span className="font-bold">{streak.currentStreak}</span>
              <span className="text-sm hidden sm:inline">dias</span>
            </motion.div>

            {canClaimToday && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={claimDailyReward}
                className="px-4 py-2 rounded-xl bg-secondary text-secondary-foreground font-semibold text-sm"
              >
                Coletar Bônus
              </motion.button>
            )}
          </div>
        )}
      </div>

      {/* Quick Stats */}
      {isAuthenticated && (
        <div className="grid grid-cols-3 gap-4">
          <QuickStat icon={Trophy} label="Vitórias" value="24" />
          <QuickStat icon={Award} label="Precisão" value="78%" />
          <QuickStat icon={Zap} label="XP Hoje" value="+150" />
        </div>
      )}

      {/* Training Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {TRAINING_MODULES.map((module, index) => (
          <TrainingCard
            key={module.id}
            module={module}
            delay={index * 0.1}
            onClick={() => {
              if (module.available) {
                setGameMode("quiz");
              }
            }}
          />
        ))}
      </div>

      {/* Coming Soon Banner */}
      <div className="skillpath-card p-6 bg-gradient-to-r from-accent/5 to-primary/5 border-accent/20">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
            <Gamepad2 className="w-6 h-6 text-accent" />
          </div>
          <div className="flex-1">
            <h3 className="font-display font-bold text-foreground mb-1">
              Novos Modos em Breve
            </h3>
            <p className="text-sm text-muted-foreground">
              Duelos PvP, Torneios Semanais e Desafios de Equipe estão chegando!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

interface QuickStatProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}

function QuickStat({ icon: Icon, label, value }: QuickStatProps) {
  return (
    <div className="stat-card-skillpath text-center">
      <Icon className="w-5 h-5 text-primary mx-auto mb-2" />
      <div className="text-xl font-display font-bold text-foreground">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

interface TrainingCardProps {
  module: typeof TRAINING_MODULES[number];
  delay: number;
  onClick: () => void;
}

function TrainingCard({ module, delay, onClick }: TrainingCardProps) {
  const colorClasses = {
    primary: "group-hover:border-primary/50 group-hover:shadow-primary/10",
    secondary: "group-hover:border-secondary/50 group-hover:shadow-secondary/10",
    accent: "group-hover:border-accent/50 group-hover:shadow-accent/10",
    purple: "group-hover:border-skillpath-purple/50 group-hover:shadow-skillpath-purple/10",
  };

  const iconBgClasses = {
    primary: "bg-primary/10 text-primary",
    secondary: "bg-secondary/10 text-secondary",
    accent: "bg-accent/10 text-accent",
    purple: "bg-skillpath-purple/10 text-skillpath-purple",
  };

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      onClick={onClick}
      disabled={!module.available}
      className={cn(
        "group skillpath-card p-6 text-left w-full transition-all duration-300",
        colorClasses[module.color],
        !module.available && "opacity-60 cursor-not-allowed"
      )}
    >
      <div className="flex items-start gap-4">
        <div className={cn(
          "w-14 h-14 rounded-xl flex items-center justify-center shrink-0",
          iconBgClasses[module.color]
        )}>
          <module.icon className="w-7 h-7" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-display font-bold text-foreground text-lg">
              {module.title}
            </h3>
            {!module.available && (
              <span className="px-2 py-0.5 bg-muted text-muted-foreground text-xs rounded-full">
                Em breve
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            {module.description}
          </p>
          <div className="flex flex-wrap gap-2">
            {module.tags.map(tag => (
              <span 
                key={tag}
                className="px-2 py-1 bg-muted rounded-lg text-xs text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.button>
  );
}