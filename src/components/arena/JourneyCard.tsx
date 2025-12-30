/**
 * JourneyCard - Card de Jornada de Treinamento na Arena
 * Visual diferenciado com badge de jornada e progresso de etapas
 */

import { motion } from "framer-motion";
import { 
  Route, 
  Trophy, 
  Star, 
  Clock, 
  Users, 
  ChevronRight,
  GraduationCap,
  Award,
  Coins,
  Sparkles,
  Lock,
  CheckCircle2,
  Play
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface JourneyCardProps {
  id: string;
  name: string;
  description?: string;
  category: string;
  level: string;
  trainingsCount: number;
  completedTrainings?: number;
  progress?: number;
  xpReward?: number;
  coinsReward?: number;
  hasCertificate?: boolean;
  hasInsignia?: boolean;
  estimatedHours?: number;
  thumbnail?: string;
  isStarted?: boolean;
  isCompleted?: boolean;
  isFeatured?: boolean;
  onClick?: () => void;
}

const LEVEL_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  iniciante: { bg: "bg-emerald-500/10", text: "text-emerald-600", border: "border-emerald-500/30" },
  intermediario: { bg: "bg-amber-500/10", text: "text-amber-600", border: "border-amber-500/30" },
  avancado: { bg: "bg-rose-500/10", text: "text-rose-600", border: "border-rose-500/30" },
};

const CATEGORY_ICONS: Record<string, string> = {
  vendas: "💼",
  lideranca: "👑",
  comunicacao: "🗣️",
  tecnico: "⚙️",
  onboarding: "🚀",
  compliance: "📋",
  geral: "📚",
};

export function JourneyCard({
  id,
  name,
  description,
  category,
  level,
  trainingsCount,
  completedTrainings = 0,
  progress = 0,
  xpReward = 0,
  coinsReward = 0,
  hasCertificate = false,
  hasInsignia = false,
  estimatedHours,
  thumbnail,
  isStarted = false,
  isCompleted = false,
  isFeatured = false,
  onClick,
}: JourneyCardProps) {
  const levelKey = level?.toLowerCase() || "iniciante";
  const levelColors = LEVEL_COLORS[levelKey] || LEVEL_COLORS.iniciante;
  const categoryIcon = CATEGORY_ICONS[category?.toLowerCase()] || "📚";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className={cn(
        "group relative cursor-pointer rounded-xl border overflow-hidden transition-all duration-300",
        isFeatured 
          ? "bg-gradient-to-br from-primary/5 via-background to-secondary/5 border-primary/30 hover:border-primary/50 shadow-lg"
          : "bg-card border-border hover:border-primary/30 hover:shadow-md",
        isCompleted && "border-emerald-500/30 bg-emerald-500/5"
      )}
    >
      {/* Featured Badge */}
      {isFeatured && (
        <div className="absolute top-3 left-3 z-10">
          <Badge className="bg-primary text-primary-foreground gap-1">
            <Sparkles className="w-3 h-3" />
            Destaque
          </Badge>
        </div>
      )}

      {/* Completed Badge */}
      {isCompleted && (
        <div className="absolute top-3 right-3 z-10">
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500 text-white text-xs font-medium">
            <CheckCircle2 className="w-3 h-3" />
            Concluída
          </div>
        </div>
      )}

      {/* Thumbnail or Gradient Header */}
      <div className={cn(
        "h-24 relative overflow-hidden",
        thumbnail ? "" : "bg-gradient-to-br from-primary/20 via-primary/10 to-secondary/20"
      )}>
        {thumbnail ? (
          <img src={thumbnail} alt={name} className="w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Route className="w-12 h-12 text-primary/30" />
          </div>
        )}
        
        {/* Journey Type Badge */}
        <div className="absolute bottom-2 left-3">
          <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm gap-1">
            <Route className="w-3 h-3" />
            Jornada
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">{categoryIcon}</span>
            <Badge 
              variant="outline" 
              className={cn("text-xs", levelColors.bg, levelColors.text, levelColors.border)}
            >
              {level}
            </Badge>
          </div>
          <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">
            {name}
          </h3>
          {description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
              {description}
            </p>
          )}
        </div>

        {/* Stats Row */}
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <GraduationCap className="w-4 h-4" />
            <span>{trainingsCount} treinamentos</span>
          </div>
          {estimatedHours && (
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{estimatedHours}h</span>
            </div>
          )}
        </div>

        {/* Progress */}
        {isStarted && !isCompleted && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Progresso</span>
              <span className="font-medium">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {completedTrainings} de {trainingsCount} concluídos
            </p>
          </div>
        )}

        {/* Rewards */}
        <div className="flex items-center gap-2 flex-wrap">
          {xpReward > 0 && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-amber-500/10 text-amber-600 text-xs font-medium">
              <Star className="w-3 h-3" />
              {xpReward} XP
            </div>
          )}
          {coinsReward > 0 && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-yellow-500/10 text-yellow-600 text-xs font-medium">
              <Coins className="w-3 h-3" />
              {coinsReward}
            </div>
          )}
          {hasCertificate && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-blue-500/10 text-blue-600 text-xs font-medium">
              <Award className="w-3 h-3" />
              Certificado
            </div>
          )}
          {hasInsignia && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-purple-500/10 text-purple-600 text-xs font-medium">
              <Trophy className="w-3 h-3" />
              Insígnia
            </div>
          )}
        </div>

        {/* CTA */}
        <Button 
          variant={isCompleted ? "outline" : isStarted ? "default" : "default"}
          size="sm" 
          className="w-full gap-2"
        >
          {isCompleted ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              Ver Conquistas
            </>
          ) : isStarted ? (
            <>
              <Play className="w-4 h-4" />
              Continuar Jornada
            </>
          ) : (
            <>
              <Route className="w-4 h-4" />
              Iniciar Jornada
            </>
          )}
          <ChevronRight className="w-4 h-4 ml-auto" />
        </Button>
      </div>
    </motion.div>
  );
}
