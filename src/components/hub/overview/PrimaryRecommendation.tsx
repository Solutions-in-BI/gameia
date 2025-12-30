/**
 * PrimaryRecommendation - Single focused recommendation component
 * Shows ONE clear next action with reasoning and rewards
 */

import { motion } from "framer-motion";
import { 
  Play, 
  Route, 
  GraduationCap, 
  Gamepad2, 
  Brain,
  Star,
  Coins,
  Award,
  ArrowRight,
  Sparkles,
  TrendingUp
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { HubButton } from "../common";

interface PrimaryRecommendationProps {
  type: "journey" | "training" | "game" | "test" | "challenge";
  title: string;
  subtitle: string;
  description?: string;
  /** Why this is recommended */
  reason: string;
  /** Current progress if applicable */
  progress?: number;
  /** Expected rewards */
  reward: {
    xp?: number;
    coins?: number;
    certificate?: boolean;
    insignia?: string;
  };
  /** Skills that will be developed */
  skills?: string[];
  /** Image/thumbnail */
  thumbnail?: string;
  /** Click handler */
  onClick: () => void;
  className?: string;
}

export function PrimaryRecommendation({
  type,
  title,
  subtitle,
  description,
  reason,
  progress,
  reward,
  skills,
  thumbnail,
  onClick,
  className
}: PrimaryRecommendationProps) {
  const typeConfig = {
    journey: { 
      icon: Route, 
      label: "Jornada", 
      color: "from-primary/20 to-purple-500/10",
      iconColor: "text-primary"
    },
    training: { 
      icon: GraduationCap, 
      label: "Treinamento", 
      color: "from-blue-500/20 to-cyan-500/10",
      iconColor: "text-blue-500"
    },
    game: { 
      icon: Gamepad2, 
      label: "Jogo", 
      color: "from-purple-500/20 to-pink-500/10",
      iconColor: "text-purple-500"
    },
    test: { 
      icon: Brain, 
      label: "Teste Cognitivo", 
      color: "from-emerald-500/20 to-teal-500/10",
      iconColor: "text-emerald-500"
    },
    challenge: { 
      icon: Star, 
      label: "Desafio", 
      color: "from-amber-500/20 to-orange-500/10",
      iconColor: "text-amber-500"
    },
  };

  const config = typeConfig[type];
  const TypeIcon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn(
        "relative overflow-hidden rounded-2xl border-2 border-primary/20 bg-gradient-to-br",
        config.color,
        className
      )}
    >
      {/* Decorative background */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-primary/5 to-transparent rounded-full blur-3xl" />
      
      <div className="relative p-6 md:p-8">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Content */}
          <div className="flex-1 space-y-4">
            {/* Type Badge + Reason */}
            <div className="flex flex-wrap items-center gap-2">
              <Badge 
                variant="secondary" 
                className={cn("gap-1", config.iconColor)}
              >
                <TypeIcon className="w-3 h-3" />
                {config.label}
              </Badge>
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
                {reason}
              </span>
            </div>

            {/* Title */}
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                {title}
              </h2>
              <p className="text-lg text-muted-foreground mt-1">
                {subtitle}
              </p>
            </div>

            {/* Description */}
            {description && (
              <p className="text-sm text-muted-foreground max-w-xl">
                {description}
              </p>
            )}

            {/* Progress (if applicable) */}
            {typeof progress === "number" && progress > 0 && progress < 100 && (
              <div className="space-y-1 max-w-sm">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Seu progresso</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}

            {/* Skills */}
            {skills && skills.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <TrendingUp className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="text-sm text-muted-foreground">Evolui:</span>
                {skills.slice(0, 3).map((skill, i) => (
                  <Badge 
                    key={i} 
                    variant="outline" 
                    className="text-xs bg-background/50"
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            )}

            {/* Rewards */}
            <div className="flex items-center gap-4 flex-wrap">
              {reward.xp && (
                <div className="flex items-center gap-1.5 text-sm">
                  <Star className="w-4 h-4 text-amber-500" />
                  <span className="font-semibold">{reward.xp}</span>
                  <span className="text-muted-foreground">XP</span>
                </div>
              )}
              {reward.coins && (
                <div className="flex items-center gap-1.5 text-sm">
                  <Coins className="w-4 h-4 text-yellow-500" />
                  <span className="font-semibold">{reward.coins}</span>
                  <span className="text-muted-foreground">moedas</span>
                </div>
              )}
              {reward.certificate && (
                <div className="flex items-center gap-1.5 text-sm">
                  <Award className="w-4 h-4 text-blue-500" />
                  <span className="text-muted-foreground">Certificado</span>
                </div>
              )}
              {reward.insignia && (
                <div className="flex items-center gap-1.5 text-sm">
                  <Award className="w-4 h-4 text-purple-500" />
                  <span className="text-muted-foreground">Insígnia</span>
                </div>
              )}
            </div>

            {/* CTA */}
            <HubButton 
              size="lg" 
              onClick={onClick}
              className="gap-2 mt-2"
            >
              <Play className="w-4 h-4" />
              {progress ? "Continuar" : "Começar Agora"}
              <ArrowRight className="w-4 h-4" />
            </HubButton>
          </div>

          {/* Thumbnail */}
          {thumbnail && (
            <div className="shrink-0 w-full md:w-48 lg:w-64">
              <div className="aspect-video md:aspect-square rounded-xl overflow-hidden bg-muted">
                <img 
                  src={thumbnail} 
                  alt={title}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
