/**
 * ExperienceCard - Card unificado para experiências na Arena
 * Usado para Jogos, Treinamentos, Testes Cognitivos, Desafios e Simulações
 */

import { useState } from "react";
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

import { getSourceTypeColors, getDifficultyColors } from "@/constants/colors";

const TYPE_CONFIG: Record<ExperienceType, { 
  label: string; 
  icon: React.ReactNode; 
  color: string;
  bgColor: string;
}> = {
  game: {
    label: 'Jogo',
    icon: <Gamepad2 className="w-3.5 h-3.5" />,
    color: getSourceTypeColors('game').text,
    bgColor: getSourceTypeColors('game').bg
  },
  training: {
    label: 'Treinamento',
    icon: <GraduationCap className="w-3.5 h-3.5" />,
    color: getSourceTypeColors('training').text,
    bgColor: getSourceTypeColors('training').bg
  },
  cognitive_test: {
    label: 'Teste',
    icon: <Brain className="w-3.5 h-3.5" />,
    color: getSourceTypeColors('cognitive_test').text,
    bgColor: getSourceTypeColors('cognitive_test').bg
  },
  challenge: {
    label: 'Desafio',
    icon: <Target className="w-3.5 h-3.5" />,
    color: getSourceTypeColors('challenge').text,
    bgColor: getSourceTypeColors('challenge').bg
  },
  simulation: {
    label: 'Simulação',
    icon: <MessageSquare className="w-3.5 h-3.5" />,
    color: 'text-accent',
    bgColor: 'bg-accent/10'
  }
};

const DIFFICULTY_CONFIG = {
  easy: { label: 'Fácil', color: `${getDifficultyColors('easy').text} ${getDifficultyColors('easy').bg}` },
  medium: { label: 'Médio', color: `${getDifficultyColors('medium').text} ${getDifficultyColors('medium').bg}` },
  hard: { label: 'Difícil', color: `${getDifficultyColors('hard').text} ${getDifficultyColors('hard').bg}` }
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
  // Image error states for fallback handling - must be at top level
  const [imgError, setImgError] = useState(false);
  
  const typeConfig = TYPE_CONFIG[type] || TYPE_CONFIG.game;

  const difficultyKey =
    difficulty && Object.prototype.hasOwnProperty.call(DIFFICULTY_CONFIG, difficulty)
      ? (difficulty as keyof typeof DIFFICULTY_CONFIG)
      : undefined;
  const difficultyConfig = difficultyKey ? DIFFICULTY_CONFIG[difficultyKey] : undefined;

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
          "relative overflow-hidden rounded-xl border bg-gradient-to-br from-card to-muted/30",
          "cursor-pointer transition-all hover:shadow-lg hover:border-primary/50",
          className
        )}
        onClick={onClick}
      >
        <div className="flex flex-col sm:flex-row">
          {/* Thumbnail/Gradient - Fixed height with fallback */}
          <div className="sm:w-40 h-28 sm:h-auto relative shrink-0 bg-muted overflow-hidden">
            {thumbnail && !imgError ? (
              <img 
                src={thumbnail} 
                alt={title} 
                className="w-full h-full object-cover"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/20 via-primary/10 to-transparent flex items-center justify-center">
                <span className={cn("text-3xl", typeConfig.color)}>{typeConfig.icon}</span>
              </div>
            )}
            
            {/* Badge de tipo */}
            <div className="absolute top-3 left-3">
              <Badge className={cn(typeConfig.bgColor, typeConfig.color, "border-0 text-xs")}>
                {typeConfig.icon}
                <span className="ml-1">{typeConfig.label}</span>
              </Badge>
            </div>

            {/* Badge featured mobile */}
            {isFeatured && (
              <div className="absolute top-3 right-3 sm:hidden">
                <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 text-xs">
                  ⭐ Recomendado
                </Badge>
              </div>
            )}
          </div>

          {/* Conteúdo */}
          <div className="flex-1 p-4 flex flex-col justify-between gap-3">
            <div>
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-lg font-bold line-clamp-1">{title}</h3>
                {isFeatured && (
                  <Badge className="hidden sm:flex bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 text-xs shrink-0">
                    ⭐ Recomendado
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{description}</p>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t">
              <div className="flex items-center gap-3 text-sm">
                {duration && (
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="w-3.5 h-3.5" />
                    {duration}
                  </span>
                )}
                {difficultyConfig && (
                  <Badge variant="outline" className={cn("text-xs", difficultyConfig.color)}>
                    {difficultyConfig.label}
                  </Badge>
                )}
                <RewardBadge 
                  xp={totalXp} 
                  coins={totalCoins}
                  size="sm"
                  showCondition={false}
                />
              </div>
              <Button size="sm" className="gap-1">
                <Play className="w-4 h-4" />
                Jogar
              </Button>
            </div>
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
        "group relative overflow-hidden rounded-xl border bg-card transition-all cursor-pointer h-full flex flex-col",
        isLocked ? "opacity-60" : "hover:shadow-lg hover:border-primary/40",
        isCompleted && "ring-2 ring-green-500/20",
        className
      )}
      onClick={isLocked ? undefined : onClick}
    >
      {/* Progress overlay */}
      {progress !== undefined && progress > 0 && progress < 100 && (
        <div className="absolute top-0 left-0 right-0 h-1 z-10">
          <Progress value={progress} className="h-1 rounded-none" />
        </div>
      )}

      {/* Thumbnail - Always rendered with fixed height */}
      <div className="h-32 sm:h-36 relative overflow-hidden bg-muted shrink-0">
        {thumbnail && !imgError ? (
          <img 
            src={thumbnail} 
            alt={title} 
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className={cn(
            "w-full h-full flex items-center justify-center",
            "bg-gradient-to-br from-primary/15 via-primary/5 to-transparent"
          )}>
            <span className={cn("text-4xl opacity-70", typeConfig.color)}>
              {icon || typeConfig.icon}
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
        
        {/* Badges on thumbnail */}
        {isNew && (
          <div className="absolute top-2 right-2">
            <Badge className="bg-primary text-primary-foreground text-[10px]">Novo</Badge>
          </div>
        )}
      </div>

      <div className="p-4 space-y-3 flex-1 flex flex-col">
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
        </div>

        {/* Título e descrição */}
        <div className="flex-1">
          <h3 className="font-semibold line-clamp-1">{title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">{description}</p>
        </div>

        {/* Skills - fixed height area */}
        {skills.length > 0 && (
          <div className="flex flex-wrap gap-1 min-h-[24px] max-h-[24px] overflow-hidden">
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

        {/* Footer - always at bottom */}
        <div className="flex items-center justify-between pt-2 border-t mt-auto">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {duration && (
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {duration}
              </span>
            )}
            {difficultyConfig && (
              <span
                className={cn(
                  "px-1.5 py-0.5 rounded text-[10px]",
                  difficultyConfig.color
                )}
              >
                {difficultyConfig.label}
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
