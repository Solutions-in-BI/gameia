/**
 * Página de Treinamentos - Design Premium
 */

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  BookOpen, 
  Play, 
  Clock, 
  Trophy,
  ChevronRight,
  CheckCircle,
  GraduationCap,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PageHeader } from "@/components/game/common/PageHeader";

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
  thumbnail_url: string | null;
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

const DIFFICULTY_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  beginner: { label: "Iniciante", color: "text-emerald-600", bg: "bg-emerald-500/10" },
  intermediate: { label: "Intermediário", color: "text-amber-600", bg: "bg-amber-500/10" },
  advanced: { label: "Avançado", color: "text-orange-600", bg: "bg-orange-500/10" },
  expert: { label: "Expert", color: "text-red-600", bg: "bg-red-500/10" },
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
      <div className="min-h-screen bg-background">
        <PageHeader 
          title="Treinamentos" 
          subtitle="Carregando..."
          icon={<GraduationCap className="w-5 h-5 text-primary" />}
        />
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <PageHeader 
        title="Treinamentos" 
        subtitle="Desenvolva suas habilidades"
        icon={<GraduationCap className="w-5 h-5 text-primary" />}
      />
      
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-emerald-600">{completedCount}</div>
                <div className="text-xs text-muted-foreground">Concluídos</div>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                <Play className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-amber-600">{inProgressCount}</div>
                <div className="text-xs text-muted-foreground">Em progresso</div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Empty State */}
        {trainings.length === 0 ? (
          <div className="text-center py-16 px-4 rounded-2xl border border-border bg-card">
            <BookOpen className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Nenhum treinamento disponível
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Os treinamentos da sua organização aparecerão aqui.
            </p>
          </div>
        ) : (
          /* Training Cards - Premium Design */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {trainings.map((training, index) => {
              const progress = getTrainingProgress(training.id);
              const trainingModules = getTrainingModules(training.id);
              const isCompleted = !!progress?.completed_at;
              const progressPercent = progress?.progress_percent || 0;
              const difficulty = DIFFICULTY_CONFIG[training.difficulty] || DIFFICULTY_CONFIG.beginner;

              return (
                <motion.button
                  key={training.id}
                  onClick={() => setSelectedTraining(training)}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{ y: -4 }}
                  className={cn(
                    "relative flex flex-col rounded-2xl border text-left transition-all overflow-hidden group",
                    isCompleted
                      ? "border-emerald-500/30 bg-card"
                      : "border-border hover:border-primary/40 bg-card"
                  )}
                >
                  {/* Image/Cover Area */}
                  <div className="relative aspect-video overflow-hidden">
                    {training.thumbnail_url ? (
                      <img 
                        src={training.thumbnail_url} 
                        alt={training.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div 
                        className="w-full h-full flex items-center justify-center"
                        style={{ 
                          background: `linear-gradient(135deg, ${training.color}30 0%, ${training.color}10 100%)` 
                        }}
                      >
                        <span className="text-5xl opacity-80">{training.icon}</span>
                      </div>
                    )}
                    
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
                    
                    {/* Completed Badge */}
                    {isCompleted && (
                      <div className="absolute top-3 right-3">
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500 text-white text-xs font-medium">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Concluído
                        </div>
                      </div>
                    )}
                    
                    {/* Difficulty Badge */}
                    <div className="absolute top-3 left-3">
                      <span className={cn(
                        "px-2.5 py-1 rounded-full text-xs font-medium",
                        difficulty.bg, difficulty.color
                      )}>
                        {difficulty.label}
                      </span>
                    </div>
                    
                    {/* Progress on image */}
                    {progressPercent > 0 && !isCompleted && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted/50">
                        <div 
                          className="h-full bg-primary transition-all"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4 flex flex-col flex-1">
                    {/* Title */}
                    <h3 className="font-semibold text-foreground line-clamp-1 mb-1.5">
                      {training.name}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3 flex-1">
                      {training.description}
                    </p>

                    {/* Meta Info */}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{training.estimated_hours}h</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>{trainingModules.length} módulos</span>
                      </div>
                      <div className="flex items-center gap-1 text-primary">
                        <Trophy className="w-3.5 h-3.5" />
                        <span>+{training.xp_reward} XP</span>
                      </div>
                    </div>

                    {/* Progress text */}
                    {progressPercent > 0 && !isCompleted && (
                      <div className="text-xs text-primary font-medium mb-2">
                        {progressPercent}% concluído
                      </div>
                    )}

                    {/* CTA */}
                    <div className="flex items-center justify-between pt-3 border-t border-border/50">
                      <span className="text-sm font-medium text-primary">
                        {isCompleted ? "Revisar" : progressPercent > 0 ? "Continuar" : "Começar"}
                      </span>
                      <ChevronRight className="w-4 h-4 text-primary" />
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        )}
      </div>

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
  const difficulty = DIFFICULTY_CONFIG[training.difficulty] || DIFFICULTY_CONFIG.beginner;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg p-0 overflow-hidden">
        {/* Cover Image */}
        <div className="relative aspect-video">
          {training.thumbnail_url ? (
            <img 
              src={training.thumbnail_url} 
              alt={training.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div 
              className="w-full h-full flex items-center justify-center"
              style={{ 
                background: `linear-gradient(135deg, ${training.color}40 0%, ${training.color}15 100%)` 
              }}
            >
              <span className="text-6xl">{training.icon}</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
          
          {/* Difficulty badge */}
          <div className="absolute top-4 left-4">
            <span className={cn(
              "px-2.5 py-1 rounded-full text-xs font-medium",
              difficulty.bg, difficulty.color
            )}>
              {difficulty.label}
            </span>
          </div>
        </div>

        <DialogHeader className="px-6 -mt-8 relative">
          <DialogTitle className="text-xl">{training.name}</DialogTitle>
          <DialogDescription className="sr-only">
            Detalhes do treinamento {training.name}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[50vh]">
          <div className="space-y-5 px-6 pb-6">
            {/* Description */}
            <p className="text-muted-foreground text-sm">{training.description}</p>

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
              <h3 className="font-semibold text-foreground text-sm">
                Módulos ({modules.length})
              </h3>
              {modules.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nenhum módulo disponível.
                </p>
              ) : (
                <div className="space-y-2">
                  {modules.map((module, idx) => (
                    <div
                      key={module.id}
                      className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border/50"
                    >
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-foreground text-sm">{module.name}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-2">
                          <Clock className="w-3 h-3" />
                          <span>{module.time_minutes} min</span>
                          <span>•</span>
                          <span>+{module.xp_reward} XP</span>
                        </div>
                      </div>
                      <Play className="w-4 h-4 text-primary" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Rewards */}
            <div className="space-y-3">
              <h3 className="font-semibold text-foreground text-sm">Recompensas</h3>
              <div className="flex gap-3">
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-primary/10 border border-primary/20">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="font-bold text-primary text-sm">+{training.xp_reward} XP</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <span>🪙</span>
                  <span className="font-bold text-amber-600 text-sm">+{training.coins_reward}</span>
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
                  Continuar
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
