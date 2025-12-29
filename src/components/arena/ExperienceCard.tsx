/**
 * ExperienceCard - Card unificado para experiências na Arena
 * Usado para Jogos, Treinamentos, Testes Cognitivos, Desafios e Simulações
 */

import { cn } from "@/lib/utils";
import { 
  Gamepad2, GraduationCap, Brain, Target, MessageSquare, 
  Clock, ChevronRight, Sparkles, Lock, CheckCircle2, Play
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RewardBadge } from "@/components/rewards/RewardBadge";
import type { RewardRule } from "@/hooks/useRewardEngine";
import { motion } from "framer-motion";

export type ExperienceType = 'game' | 'training' | 'cognitive_test' | 'challenge' | 'simulation';

interface ExperienceCardProps {
  id: string;
  type: ExperienceType;
  title: string;
  description: string;
  thumbnail?: string;
  icon?: React.ReactNode;
  skills?: string[];
  duration?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  rewardRules?: RewardRule[];
  xpReward?: number;
  coinsReward?: number;
  targetPercent?: number;
  progress?: number;
  isCompleted?: boolean;
  isLocked?: boolean;
  isNew?: boolean;
  isFeatured?: boolean;
  onClick?: () => void;
  variant?: 'default' | 'compact' | 'featured';
  className?: string;
}

const TYPE_CONFIG: Record<ExperienceType, { 
  label: string; 
  icon: React.ReactNode; 
  color: string;
  bgColor: string;
}> = {
  game: {
    label: 'Jogo',
    icon: <Gamepad2 className="w-3.5 h-3.5" />,
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-500/10'
  },
  training: {
    label: 'Treinamento',
    icon: <GraduationCap className="w-3.5 h-3.5" />,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-500/10'
  },
  cognitive_test: {
    label: 'Teste',
    icon: <Brain className="w-3.5 h-3.5" />,
    color: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-500/10'
  },
  challenge: {
    label: 'Desafio',
    icon: <Target className="w-3.5 h-3.5" />,
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-500/10'
  },
  simulation: {
    label: 'Simulação',
    icon: <MessageSquare className="w-3.5 h-3.5" />,
    color: 'text-pink-600 dark:text-pink-400',
    bgColor: 'bg-pink-500/10'
  }
};

const DIFFICULTY_CONFIG = {
  easy: { label: 'Fácil', color: 'text-green-600 bg-green-500/10' },
  medium: { label: 'Médio', color: 'text-amber-600 bg-amber-500/10' },
  hard: { label: 'Difícil', color: 'text-red-600 bg-red-500/10' }
};

export function ExperienceCard({
  id,
  type,
  title,
  description,
  thumbnail,
  icon,
  skills = [],
  duration,
  difficulty,
  rewardRules,
  xpReward,
  coinsReward,
  targetPercent,
  progress,
  isCompleted,
  isLocked,
  isNew,
  isFeatured,
  onClick,
  variant = 'default',
  className
}: ExperienceCardProps) {
  const typeConfig = TYPE_CONFIG[type];

  // Calcular reward preview
  const totalXp = xpReward || rewardRules?.reduce((sum, r) => 
    sum + r.baseReward.xp + (r.bonusReward?.xp || 0), 0
  ) || 0;
  const totalCoins = coinsReward || rewardRules?.reduce((sum, r) => 
    sum + r.baseReward.coins + (r.bonusReward?.coins || 0), 0
  ) || 0;
  const hasCondition = rewardRules?.some(r => r.type === 'conditional') || targetPercent !== undefined;
  const conditionText = targetPercent 
    ? `${targetPercent}%+ de acerto` 
    : rewardRules?.find(r => r.target)?.target 
      ? `${(rewardRules.find(r => r.target)!.target! * 100).toFixed(0)}%+ de acerto`
      : undefined;

  if (variant === 'compact') {
    return (
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        disabled={isLocked}
        className={cn(
          "w-full flex items-center gap-3 p-3 rounded-xl border bg-card text-left transition-all",
          isLocked ? "opacity-50 cursor-not-allowed" : "hover:border-primary/50 hover:shadow-md",
          className
        )}
      >
        {/* Ícone */}
        <div className={cn(
          "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
          typeConfig.bgColor
        )}>
          {isLocked ? (
            <Lock className="w-4 h-4 text-muted-foreground" />
          ) : isCompleted ? (
            <CheckCircle2 className="w-4 h-4 text-green-500" />
          ) : icon || typeConfig.icon}
        </div>

        {/* Conteúdo */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium truncate">{title}</span>
            {isNew && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Novo</Badge>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className={typeConfig.color}>{typeConfig.label}</span>
            {duration && (
              <>
                <span>•</span>
                <span className="flex items-center gap-0.5">
                  <Clock className="w-3 h-3" />
                  {duration}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Recompensa */}
        {totalXp > 0 && (
          <RewardBadge 
            xp={totalXp} 
            coins={totalCoins} 
            size="sm"
            showCondition={false}
          />
        )}

        <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
      </motion.button>
    );
  }

  if (variant === 'featured') {
    return (
      <motion.div
        whileHover={{ scale: 1.01 }}
        className={cn(
          "relative overflow-hidden rounded-2xl border bg-gradient-to-br from-card to-muted/30",
          "cursor-pointer transition-all hover:shadow-xl hover:border-primary/50",
          className
        )}
        onClick={onClick}
      >
        {/* Thumbnail ou gradient */}
        <div className="aspect-[21/9] relative">
          {thumbnail ? (
            <img 
              src={thumbnail} 
              alt={title} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className={cn(
              "w-full h-full",
              "bg-gradient-to-br from-primary/20 via-primary/10 to-transparent"
            )} />
          )}
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          
          {/* Badge de tipo */}
          <div className="absolute top-4 left-4">
            <Badge className={cn(typeConfig.bgColor, typeConfig.color, "border-0")}>
              {typeConfig.icon}
              <span className="ml-1">{typeConfig.label}</span>
            </Badge>
          </div>

          {/* Badge featured */}
          {isFeatured && (
            <div className="absolute top-4 right-4">
              <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
                ⭐ Recomendado
              </Badge>
            </div>
          )}
        </div>

        {/* Conteúdo */}
        <div className="p-5 space-y-4">
          <div>
            <h3 className="text-xl font-bold">{title}</h3>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{description}</p>
          </div>

          {/* Meta e info */}
          <div className="flex flex-wrap items-center gap-3 text-sm">
            {duration && (
              <span className="flex items-center gap-1 text-muted-foreground">
                <Clock className="w-4 h-4" />
                {duration}
              </span>
            )}
            {difficulty && (
              <Badge variant="outline" className={DIFFICULTY_CONFIG[difficulty].color}>
                {DIFFICULTY_CONFIG[difficulty].label}
              </Badge>
            )}
            {skills.slice(0, 2).map(skill => (
              <Badge key={skill} variant="secondary" className="text-xs">
                {skill}
              </Badge>
            ))}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-2 border-t">
            <RewardBadge 
              xp={totalXp} 
              coins={totalCoins}
              condition={conditionText}
              size="md"
            />
            <Button size="sm" className="gap-1">
              <Play className="w-4 h-4" />
              Iniciar
            </Button>
          </div>
        </div>
      </motion.div>
    );
  }

  // Default variant
  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className={cn(
        "group relative overflow-hidden rounded-xl border bg-card transition-all cursor-pointer",
        isLocked ? "opacity-60" : "hover:shadow-lg hover:border-primary/40",
        isCompleted && "ring-2 ring-green-500/20",
        className
      )}
      onClick={isLocked ? undefined : onClick}
    >
      {/* Progress overlay */}
      {progress !== undefined && progress > 0 && progress < 100 && (
        <div className="absolute top-0 left-0 right-0 h-1">
          <Progress value={progress} className="h-1 rounded-none" />
        </div>
      )}

      {/* Thumbnail */}
      {thumbnail && (
        <div className="aspect-video relative overflow-hidden">
          <img 
            src={thumbnail} 
            alt={title} 
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        </div>
      )}

      <div className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
              typeConfig.bgColor
            )}>
              {isLocked ? (
                <Lock className="w-4 h-4 text-muted-foreground" />
              ) : isCompleted ? (
                <CheckCircle2 className="w-4 h-4 text-green-500" />
              ) : (
                <span className={typeConfig.color}>{icon || typeConfig.icon}</span>
              )}
            </div>
            <Badge variant="outline" className={cn("text-xs", typeConfig.color)}>
              {typeConfig.label}
            </Badge>
          </div>

          {isNew && (
            <Badge className="bg-primary text-primary-foreground text-[10px]">Novo</Badge>
          )}
        </div>

        {/* Título e descrição */}
        <div>
          <h3 className="font-semibold line-clamp-1">{title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">{description}</p>
        </div>

        {/* Skills */}
        {skills.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {skills.slice(0, 3).map(skill => (
              <Badge key={skill} variant="secondary" className="text-[10px] px-1.5">
                {skill}
              </Badge>
            ))}
            {skills.length > 3 && (
              <Badge variant="secondary" className="text-[10px] px-1.5">
                +{skills.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {duration && (
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {duration}
              </span>
            )}
            {difficulty && (
              <span className={cn("px-1.5 py-0.5 rounded text-[10px]", DIFFICULTY_CONFIG[difficulty].color)}>
                {DIFFICULTY_CONFIG[difficulty].label}
              </span>
            )}
          </div>

          <RewardBadge 
            xp={totalXp} 
            coins={totalCoins}
            condition={conditionText}
            size="sm"
          />
        </div>
      </div>
    </motion.div>
  );
}
