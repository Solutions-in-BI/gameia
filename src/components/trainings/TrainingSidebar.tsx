import { motion } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { 
  BookOpen, 
  Video, 
  FileText, 
  Gamepad2, 
  Brain, 
  MessageSquare, 
  Target,
  Award,
  Clock
} from "lucide-react";
import { TrainingModuleItem } from "./TrainingModuleItem";
import type { Training, TrainingModule, ModuleProgress } from "./TrainingPlayerLayout";

interface TrainingSidebarProps {
  training: Training;
  modules: TrainingModule[];
  currentModuleId: string | null;
  moduleProgress: ModuleProgress[];
  progressPercent: number;
  completedCount: number;
  onModuleSelect: (moduleId: string) => void;
  isModuleLocked: (moduleId: string) => boolean;
  isModuleCompleted: (moduleId: string) => boolean;
}

const STEP_TYPE_ICONS: Record<string, typeof BookOpen> = {
  content: FileText,
  video: Video,
  quiz: Gamepad2,
  arena_game: Gamepad2,
  cognitive_test: Brain,
  reflection: MessageSquare,
  practical_challenge: Target,
  simulation: Gamepad2,
};

export function TrainingSidebar({
  training,
  modules,
  currentModuleId,
  moduleProgress,
  progressPercent,
  completedCount,
  onModuleSelect,
  isModuleLocked,
  isModuleCompleted,
}: TrainingSidebarProps) {
  const totalXP = modules.reduce((sum, m) => sum + (m.xp_reward || 0), 0);
  const totalTime = modules.reduce((sum, m) => sum + (m.time_minutes || 0), 0);

  const getModuleProgress = (moduleId: string): ModuleProgress | undefined => {
    return moduleProgress.find(p => p.module_id === moduleId);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3 mb-4">
          {training.thumbnail_url ? (
            <img 
              src={training.thumbnail_url} 
              alt={training.name}
              className="w-12 h-12 rounded-lg object-cover"
            />
          ) : (
            <div 
              className="w-12 h-12 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: training.color || 'hsl(var(--primary))' }}
            >
              <BookOpen className="h-6 w-6 text-white" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-sm truncate">{training.name}</h2>
            <p className="text-xs text-muted-foreground">
              {completedCount} de {modules.length} módulos
            </p>
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Progresso</span>
            <span className="font-medium">{progressPercent}%</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Award className="h-3.5 w-3.5 text-amber-500" />
            <span>{totalXP} XP</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            <span>~{totalTime} min</span>
          </div>
        </div>
      </div>

      {/* Modules List */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {modules.map((module, index) => {
            const isLocked = isModuleLocked(module.id);
            const isCompleted = isModuleCompleted(module.id);
            const isCurrent = module.id === currentModuleId;
            const progress = getModuleProgress(module.id);
            const StepIcon = STEP_TYPE_ICONS[module.step_type || module.content_type] || FileText;

            return (
              <TrainingModuleItem
                key={module.id}
                index={index + 1}
                name={module.name}
                duration={module.time_minutes}
                isCheckpoint={module.is_checkpoint}
                isLocked={isLocked}
                isCompleted={isCompleted}
                isCurrent={isCurrent}
                score={progress?.score}
                icon={StepIcon}
                onClick={() => onModuleSelect(module.id)}
              />
            );
          })}
        </div>
      </ScrollArea>

      {/* Footer */}
      {training.certificate_enabled && (
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Award className="h-4 w-4 text-amber-500" />
            <span>Certificado disponível ao concluir</span>
          </div>
        </div>
      )}
    </div>
  );
}
