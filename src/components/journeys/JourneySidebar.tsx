/**
 * JourneySidebar - Navegação hierárquica da Jornada
 * Exibe estrutura de treinamentos e módulos com estados visuais
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Route, 
  ChevronRight, 
  ChevronDown,
  Lock,
  CheckCircle2,
  Circle,
  Play,
  GraduationCap,
  Trophy,
  Award,
  Star,
  Coins
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface Module {
  id: string;
  title: string;
  isCompleted: boolean;
  isLocked: boolean;
  isCurrent: boolean;
  duration?: string;
}

interface Training {
  id: string;
  name: string;
  modules: Module[];
  isCompleted: boolean;
  isLocked: boolean;
  isCurrent: boolean;
  progress: number;
}

interface JourneySidebarProps {
  journeyName: string;
  journeyDescription?: string;
  progress: number;
  completedTrainings: number;
  totalTrainings: number;
  trainings: Training[];
  xpReward?: number;
  coinsReward?: number;
  hasCertificate?: boolean;
  hasInsignia?: boolean;
  currentTrainingId?: string;
  currentModuleId?: string;
  onModuleClick?: (trainingId: string, moduleId: string) => void;
  onTrainingClick?: (trainingId: string) => void;
}

export function JourneySidebar({
  journeyName,
  journeyDescription,
  progress,
  completedTrainings,
  totalTrainings,
  trainings,
  xpReward = 0,
  coinsReward = 0,
  hasCertificate = false,
  hasInsignia = false,
  currentTrainingId,
  currentModuleId,
  onModuleClick,
  onTrainingClick,
}: JourneySidebarProps) {
  const [expandedTrainings, setExpandedTrainings] = useState<string[]>(
    currentTrainingId ? [currentTrainingId] : []
  );

  const toggleTraining = (trainingId: string) => {
    setExpandedTrainings(prev => 
      prev.includes(trainingId) 
        ? prev.filter(id => id !== trainingId)
        : [...prev, trainingId]
    );
  };

  return (
    <div className="flex flex-col h-full bg-card border-r">
      {/* Journey Header */}
      <div className="p-4 border-b space-y-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <Route className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold truncate">{journeyName}</h2>
            <p className="text-xs text-muted-foreground">
              {completedTrainings} de {totalTrainings} treinamentos
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Progresso geral</span>
            <span className="font-medium">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Rewards Preview */}
        <div className="flex flex-wrap gap-1.5">
          {xpReward > 0 && (
            <Badge variant="outline" className="text-xs gap-1 bg-amber-500/10 text-amber-600 border-amber-500/30">
              <Star className="w-3 h-3" />
              {xpReward} XP
            </Badge>
          )}
          {coinsReward > 0 && (
            <Badge variant="outline" className="text-xs gap-1 bg-yellow-500/10 text-yellow-600 border-yellow-500/30">
              <Coins className="w-3 h-3" />
              {coinsReward}
            </Badge>
          )}
          {hasCertificate && (
            <Badge variant="outline" className="text-xs gap-1 bg-blue-500/10 text-blue-600 border-blue-500/30">
              <Award className="w-3 h-3" />
              Certificado
            </Badge>
          )}
          {hasInsignia && (
            <Badge variant="outline" className="text-xs gap-1 bg-purple-500/10 text-purple-600 border-purple-500/30">
              <Trophy className="w-3 h-3" />
              Insígnia
            </Badge>
          )}
        </div>
      </div>

      {/* Trainings List */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {trainings.map((training, index) => {
            const isExpanded = expandedTrainings.includes(training.id);
            const StatusIcon = training.isCompleted 
              ? CheckCircle2 
              : training.isLocked 
                ? Lock 
                : training.isCurrent 
                  ? Play 
                  : Circle;
            
            const statusColor = training.isCompleted
              ? "text-emerald-500"
              : training.isLocked
                ? "text-muted-foreground/50"
                : training.isCurrent
                  ? "text-primary"
                  : "text-muted-foreground";

            return (
              <div key={training.id} className="space-y-0.5">
                {/* Training Item */}
                <button
                  onClick={() => {
                    if (!training.isLocked) {
                      toggleTraining(training.id);
                      onTrainingClick?.(training.id);
                    }
                  }}
                  disabled={training.isLocked}
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-left transition-all",
                    "hover:bg-muted/50",
                    training.isLocked && "opacity-50 cursor-not-allowed",
                    training.isCurrent && "bg-primary/5 border border-primary/20"
                  )}
                >
                  {/* Number Badge */}
                  <div className={cn(
                    "flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium shrink-0",
                    training.isCompleted && "bg-emerald-500 text-white",
                    training.isCurrent && "bg-primary text-primary-foreground",
                    training.isLocked && "bg-muted text-muted-foreground",
                    !training.isCompleted && !training.isCurrent && !training.isLocked && "bg-muted text-foreground"
                  )}>
                    {training.isCompleted ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      index + 1
                    )}
                  </div>

                  {/* Training Info */}
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "text-sm font-medium truncate",
                      training.isLocked && "text-muted-foreground"
                    )}>
                      {training.name}
                    </p>
                    {!training.isCompleted && !training.isLocked && (
                      <div className="flex items-center gap-2 mt-0.5">
                        <Progress value={training.progress} className="h-1 flex-1" />
                        <span className="text-xs text-muted-foreground">
                          {Math.round(training.progress)}%
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Expand Icon */}
                  {!training.isLocked && training.modules.length > 0 && (
                    <motion.div
                      animate={{ rotate: isExpanded ? 90 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </motion.div>
                  )}

                  {/* Lock Icon */}
                  {training.isLocked && (
                    <Lock className="w-4 h-4 text-muted-foreground/50" />
                  )}
                </button>

                {/* Modules List */}
                <AnimatePresence>
                  {isExpanded && !training.isLocked && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="pl-10 pr-2 py-1 space-y-0.5">
                        {training.modules.map((module) => {
                          const ModuleIcon = module.isCompleted 
                            ? CheckCircle2 
                            : module.isLocked 
                              ? Lock 
                              : module.isCurrent 
                                ? Play 
                                : Circle;

                          return (
                            <button
                              key={module.id}
                              onClick={() => !module.isLocked && onModuleClick?.(training.id, module.id)}
                              disabled={module.isLocked}
                              className={cn(
                                "w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left text-sm transition-all",
                                "hover:bg-muted/50",
                                module.isLocked && "opacity-50 cursor-not-allowed",
                                module.isCurrent && "bg-primary/10 text-primary font-medium",
                                currentModuleId === module.id && "ring-1 ring-primary"
                              )}
                            >
                              <ModuleIcon className={cn(
                                "w-3.5 h-3.5 shrink-0",
                                module.isCompleted && "text-emerald-500",
                                module.isCurrent && "text-primary",
                                module.isLocked && "text-muted-foreground/50"
                              )} />
                              <span className="truncate flex-1">{module.title}</span>
                              {module.duration && (
                                <span className="text-xs text-muted-foreground">
                                  {module.duration}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
