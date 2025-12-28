/**
 * TrainingDetail - Página de detalhe do treinamento
 */

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Play,
  CheckCircle,
  Lock,
  Clock,
  Trophy,
  Award,
  BookOpen,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

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
  certificate_enabled: boolean;
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
  coins_reward: number;
  time_minutes: number;
  is_preview: boolean;
}

interface UserModuleProgress {
  module_id: string;
  completed_at: string | null;
}

interface UserTrainingProgress {
  training_id: string;
  progress_percent: number;
  completed_at: string | null;
}

const DIFFICULTY_LABELS: Record<string, { label: string; color: string }> = {
  beginner: { label: "Iniciante", color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/30" },
  intermediate: { label: "Intermediário", color: "text-amber-500 bg-amber-500/10 border-amber-500/30" },
  advanced: { label: "Avançado", color: "text-orange-500 bg-orange-500/10 border-orange-500/30" },
  expert: { label: "Expert", color: "text-red-500 bg-red-500/10 border-red-500/30" },
};

const CONTENT_TYPE_LABELS: Record<string, string> = {
  video: "Vídeo",
  text: "Texto",
  quiz: "Quiz",
  pdf: "PDF",
  link: "Link",
};

export default function TrainingDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [training, setTraining] = useState<Training | null>(null);
  const [modules, setModules] = useState<TrainingModule[]>([]);
  const [moduleProgress, setModuleProgress] = useState<UserModuleProgress[]>([]);
  const [trainingProgress, setTrainingProgress] = useState<UserTrainingProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!id) return;
      setIsLoading(true);

      try {
        const [trainingRes, modulesRes] = await Promise.all([
          supabase.from("trainings").select("*").eq("id", id).single(),
          supabase
            .from("training_modules")
            .select("*")
            .eq("training_id", id)
            .order("order_index"),
        ]);

        if (trainingRes.data) setTraining(trainingRes.data as Training);
        if (modulesRes.data) setModules(modulesRes.data as TrainingModule[]);

        if (user) {
          const [progressRes, moduleProgressRes] = await Promise.all([
            supabase
              .from("user_training_progress")
              .select("*")
              .eq("user_id", user.id)
              .eq("training_id", id)
              .maybeSingle(),
            supabase
              .from("user_module_progress")
              .select("module_id, completed_at")
              .eq("user_id", user.id),
          ]);

          if (progressRes.data) setTrainingProgress(progressRes.data as UserTrainingProgress);
          if (moduleProgressRes.data) setModuleProgress(moduleProgressRes.data as UserModuleProgress[]);
        }
      } catch (err) {
        console.error("Error fetching training:", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [id, user]);

  const isModuleCompleted = (moduleId: string) => {
    return moduleProgress.some((p) => p.module_id === moduleId && p.completed_at);
  };

  const isModuleLocked = (index: number) => {
    if (index === 0) return false;
    const module = modules[index];
    if (module?.is_preview) return false;
    const prevModule = modules[index - 1];
    return prevModule && !isModuleCompleted(prevModule.id);
  };

  const getNextModule = () => {
    for (let i = 0; i < modules.length; i++) {
      if (!isModuleCompleted(modules[i].id) && !isModuleLocked(i)) {
        return modules[i];
      }
    }
    return modules[0];
  };

  const handleStartModule = (moduleId: string) => {
    navigate(`/app/trainings/${id}/module/${moduleId}`);
  };

  const handleContinue = () => {
    const nextModule = getNextModule();
    if (nextModule) {
      handleStartModule(nextModule.id);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <Skeleton className="h-8 w-32 mb-6" />
        <Skeleton className="h-48 w-full rounded-2xl mb-6" />
        <Skeleton className="h-24 w-full rounded-xl mb-4" />
        <Skeleton className="h-24 w-full rounded-xl mb-4" />
        <Skeleton className="h-24 w-full rounded-xl" />
      </div>
    );
  }

  if (!training) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-xl font-semibold">Treinamento não encontrado</h1>
          <Button className="mt-4" onClick={() => navigate("/app")}>
            Voltar
          </Button>
        </div>
      </div>
    );
  }

  const isCompleted = !!trainingProgress?.completed_at;
  const progressPercent = trainingProgress?.progress_percent || 0;
  const completedModulesCount = moduleProgress.filter((p) =>
    modules.some((m) => m.id === p.module_id && p.completed_at)
  ).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header with back button */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/app")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <span className="font-medium text-foreground truncate">{training.name}</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Training Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-2xl overflow-hidden"
          style={{ backgroundColor: `${training.color}15` }}
        >
          <div className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row gap-6">
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl flex-shrink-0"
                style={{ backgroundColor: `${training.color}30` }}
              >
                {training.icon}
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <Badge
                    variant="outline"
                    className={cn(
                      "border",
                      DIFFICULTY_LABELS[training.difficulty]?.color
                    )}
                  >
                    {DIFFICULTY_LABELS[training.difficulty]?.label || training.difficulty}
                  </Badge>
                  <Badge variant="secondary">{training.category}</Badge>
                  {isCompleted && (
                    <Badge className="bg-emerald-500 text-white">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Concluído
                    </Badge>
                  )}
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                  {training.name}
                </h1>
                <p className="text-muted-foreground">{training.description}</p>

                {/* Meta */}
                <div className="flex flex-wrap gap-4 mt-4 text-sm">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>{training.estimated_hours}h estimadas</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <BookOpen className="w-4 h-4" />
                    <span>{modules.length} módulos</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress */}
            {progressPercent > 0 && (
              <div className="mt-6 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {completedModulesCount}/{modules.length} módulos concluídos
                  </span>
                  <span className="font-bold" style={{ color: training.color }}>
                    {progressPercent}%
                  </span>
                </div>
                <Progress value={progressPercent} className="h-2" />
              </div>
            )}

            {/* CTA */}
            <Button
              size="lg"
              className="w-full sm:w-auto mt-6"
              onClick={handleContinue}
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
        </motion.div>

        {/* Rewards Section */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl border border-primary/30 bg-primary/5 text-center">
            <Trophy className="w-6 h-6 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold text-primary">+{training.xp_reward}</div>
            <div className="text-xs text-muted-foreground">XP ao concluir</div>
          </div>
          <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 text-center">
            <span className="text-2xl">🪙</span>
            <div className="text-2xl font-bold text-amber-500">+{training.coins_reward}</div>
            <div className="text-xs text-muted-foreground">Moedas</div>
          </div>
          {training.certificate_enabled && (
            <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 text-center col-span-2 sm:col-span-1">
              <Award className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
              <div className="text-sm font-bold text-emerald-500">Certificado</div>
              <div className="text-xs text-muted-foreground">Ao completar</div>
            </div>
          )}
        </div>

        {/* Modules List */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">
            Módulos ({modules.length})
          </h2>

          <div className="space-y-3">
            {modules.map((module, idx) => {
              const completed = isModuleCompleted(module.id);
              const locked = isModuleLocked(idx);

              return (
                <motion.button
                  key={module.id}
                  onClick={() => !locked && handleStartModule(module.id)}
                  disabled={locked}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={cn(
                    "w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left",
                    completed
                      ? "border-emerald-500/30 bg-emerald-500/5"
                      : locked
                      ? "border-border bg-muted/30 opacity-60 cursor-not-allowed"
                      : "border-border hover:border-primary/50 bg-card"
                  )}
                >
                  {/* Index */}
                  <div
                    className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center font-bold",
                      completed
                        ? "bg-emerald-500 text-white"
                        : locked
                        ? "bg-muted text-muted-foreground"
                        : "bg-primary/10 text-primary"
                    )}
                  >
                    {completed ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : locked ? (
                      <Lock className="w-4 h-4" />
                    ) : (
                      idx + 1
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-foreground truncate">
                        {module.name}
                      </h3>
                      {module.is_preview && (
                        <Badge variant="secondary" className="text-xs">
                          Preview
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                      <span>{CONTENT_TYPE_LABELS[module.content_type]}</span>
                      <span>•</span>
                      <span>{module.time_minutes} min</span>
                      <span>•</span>
                      <span>+{module.xp_reward} XP</span>
                    </div>
                  </div>

                  {/* Action */}
                  {!locked && (
                    <ChevronRight
                      className={cn(
                        "w-5 h-5 flex-shrink-0",
                        completed ? "text-emerald-500" : "text-primary"
                      )}
                    />
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}