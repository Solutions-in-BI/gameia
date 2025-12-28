/**
 * Página de Treinamentos - Conteúdo educacional separado de insígnias
 * Cursos, módulos e materiais de aprendizado
 */

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  BookOpen, 
  Play, 
  Clock, 
  Trophy,
  ChevronRight,
  Lock,
  CheckCircle,
  GraduationCap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Training {
  id: string;
  training_key: string;
  name: string;
  description: string | null;
  category: string;
  difficulty: string;
  icon: string;
  color: string;
  estimated_hours: number;
  xp_reward: number;
  coins_reward: number;
}

interface TrainingModule {
  id: string;
  training_id: string;
  module_key: string;
  name: string;
  description: string | null;
  content_type: string;
  order_index: number;
  xp_reward: number;
  time_minutes: number;
}

interface UserTrainingProgress {
  training_id: string;
  progress_percent: number;
  completed_at: string | null;
}

interface TrainingsPageProps {
  onBack?: () => void;
}

const DIFFICULTY_LABELS: Record<string, { label: string; color: string }> = {
  beginner: { label: "Iniciante", color: "text-emerald-500 bg-emerald-500/10" },
  intermediate: { label: "Intermediário", color: "text-amber-500 bg-amber-500/10" },
  advanced: { label: "Avançado", color: "text-orange-500 bg-orange-500/10" },
  expert: { label: "Expert", color: "text-red-500 bg-red-500/10" },
};

export function TrainingsPage({ onBack }: TrainingsPageProps) {
  const { user } = useAuth();
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [modules, setModules] = useState<TrainingModule[]>([]);
  const [userProgress, setUserProgress] = useState<UserTrainingProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTraining, setSelectedTraining] = useState<Training | null>(null);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const [trainingsRes, modulesRes] = await Promise.all([
          supabase.from("trainings").select("*").eq("is_active", true).order("display_order"),
          supabase.from("training_modules").select("*").order("order_index"),
        ]);

        setTrainings((trainingsRes.data || []) as Training[]);
        setModules((modulesRes.data || []) as TrainingModule[]);

        if (user) {
          const { data: progressData } = await supabase
            .from("user_training_progress")
            .select("training_id, progress_percent, completed_at")
            .eq("user_id", user.id);
          setUserProgress((progressData || []) as UserTrainingProgress[]);
        }
      } catch (err) {
        console.error("Error fetching trainings:", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [user]);

  const getTrainingProgress = (trainingId: string) => {
    return userProgress.find((p) => p.training_id === trainingId);
  };

  const getTrainingModules = (trainingId: string) => {
    return modules.filter((m) => m.training_id === trainingId);
  };

  const completedCount = userProgress.filter((p) => p.completed_at).length;
  const inProgressCount = userProgress.filter((p) => !p.completed_at && p.progress_percent > 0).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-primary" />
            Treinamentos
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Desenvolva suas habilidades com cursos interativos
          </p>
        </div>
        <div className="flex gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-emerald-500">{completedCount}</div>
            <div className="text-xs text-muted-foreground">Concluídos</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-amber-500">{inProgressCount}</div>
            <div className="text-xs text-muted-foreground">Em progresso</div>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {trainings.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-2xl border border-border bg-card/50">
          <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Nenhum treinamento disponível
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Os treinamentos da sua organização aparecerão aqui.
            Entre em contato com seu administrador para adicionar conteúdo.
          </p>
        </div>
      ) : (
        /* Training Cards */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {trainings.map((training) => {
            const progress = getTrainingProgress(training.id);
            const trainingModules = getTrainingModules(training.id);
            const isCompleted = !!progress?.completed_at;
            const progressPercent = progress?.progress_percent || 0;

            return (
              <motion.button
                key={training.id}
                onClick={() => setSelectedTraining(training)}
                whileHover={{ y: -4 }}
                className={cn(
                  "relative flex flex-col p-5 rounded-2xl border text-left transition-all",
                  isCompleted
                    ? "border-emerald-500/30 bg-emerald-500/5"
                    : "border-border hover:border-primary/50 bg-card"
                )}
              >
                {/* Completed Badge */}
                {isCompleted && (
                  <div className="absolute top-3 right-3">
                    <CheckCircle className="w-6 h-6 text-emerald-500" />
                  </div>
                )}

                {/* Icon & Title */}
                <div className="flex items-start gap-3 mb-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                    style={{ backgroundColor: `${training.color}20` }}
                  >
                    {training.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground line-clamp-1">{training.name}</h3>
                    <div className={cn(
                      "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-1",
                      DIFFICULTY_LABELS[training.difficulty]?.color || "text-muted-foreground bg-muted"
                    )}>
                      {DIFFICULTY_LABELS[training.difficulty]?.label || training.difficulty}
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
                  {training.description}
                </p>

                {/* Meta Info */}
                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{training.estimated_hours}h</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>{trainingModules.length} módulos</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Trophy className="w-3.5 h-3.5 text-primary" />
                    <span>+{training.xp_reward} XP</span>
                  </div>
                </div>

                {/* Progress Bar */}
                {progressPercent > 0 && !isCompleted && (
                  <div className="space-y-1">
                    <Progress value={progressPercent} className="h-1.5" />
                    <div className="text-xs text-muted-foreground text-right">
                      {progressPercent}% concluído
                    </div>
                  </div>
                )}

                {/* CTA */}
                <div className="flex items-center justify-between mt-2 pt-3 border-t border-border/50">
                  <span className="text-sm font-medium text-primary">
                    {isCompleted ? "Revisar" : progressPercent > 0 ? "Continuar" : "Começar"}
                  </span>
                  <ChevronRight className="w-4 h-4 text-primary" />
                </div>
              </motion.button>
            );
          })}
        </div>
      )}

      {/* Training Detail Modal */}
      <TrainingDetailModal
        training={selectedTraining}
        modules={selectedTraining ? getTrainingModules(selectedTraining.id) : []}
        progress={selectedTraining ? getTrainingProgress(selectedTraining.id) : undefined}
        isOpen={!!selectedTraining}
        onClose={() => setSelectedTraining(null)}
      />
    </div>
  );
}

interface TrainingDetailModalProps {
  training: Training | null;
  modules: TrainingModule[];
  progress?: UserTrainingProgress;
  isOpen: boolean;
  onClose: () => void;
}

function TrainingDetailModal({ training, modules, progress, isOpen, onClose }: TrainingDetailModalProps) {
  if (!training) return null;

  const isCompleted = !!progress?.completed_at;
  const progressPercent = progress?.progress_percent || 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
              style={{ backgroundColor: `${training.color}20` }}
            >
              {training.icon}
            </div>
            <div>
              <div>{training.name}</div>
              <div className={cn(
                "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-1",
                DIFFICULTY_LABELS[training.difficulty]?.color || "text-muted-foreground bg-muted"
              )}>
                {DIFFICULTY_LABELS[training.difficulty]?.label || training.difficulty}
              </div>
            </div>
          </DialogTitle>
          <DialogDescription className="sr-only">
            Detalhes e módulos do treinamento {training.name}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-6 py-4">
            {/* Description */}
            <p className="text-muted-foreground">{training.description}</p>

            {/* Progress */}
            {progressPercent > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Progresso</span>
                  <span className="font-bold text-primary">{progressPercent}%</span>
                </div>
                <Progress value={progressPercent} className="h-2" />
              </div>
            )}

            {/* Modules List */}
            <div className="space-y-3">
              <h3 className="font-semibold text-foreground">
                Módulos ({modules.length})
              </h3>
              {modules.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nenhum módulo disponível ainda.
                </p>
              ) : (
                modules.map((module, idx) => (
                  <div
                    key={module.id}
                    className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary/30 transition-all"
                  >
                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-sm font-bold text-muted-foreground">
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-foreground">{module.name}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        <span>{module.time_minutes} min</span>
                        <span>•</span>
                        <span>+{module.xp_reward} XP</span>
                      </div>
                    </div>
                    <Play className="w-4 h-4 text-primary" />
                  </div>
                ))
              )}
            </div>

            {/* Rewards */}
            <div className="space-y-3">
              <h3 className="font-semibold text-foreground">Recompensas ao Concluir</h3>
              <div className="flex gap-4">
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 border border-primary/30">
                  <span className="text-lg">⚡</span>
                  <span className="font-bold text-primary">+{training.xp_reward} XP</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/30">
                  <span className="text-lg">🪙</span>
                  <span className="font-bold text-amber-500">+{training.coins_reward}</span>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <Button 
              className="w-full" 
              size="lg"
              onClick={() => {
                onClose();
                window.location.href = `/app/trainings/${training.id}`;
              }}
            >
              {isCompleted ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Revisar Treinamento
                </>
              ) : progressPercent > 0 ? (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Continuar de onde parei
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Iniciar Treinamento
                </>
              )}
            </Button>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
