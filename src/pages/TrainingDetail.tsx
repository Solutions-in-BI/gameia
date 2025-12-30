/**
 * TrainingDetail - Página de detalhe do treinamento
 * UI moderna e elegante com animações suaves
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
  Star,
  Coins,
  Award,
  BookOpen,
  ChevronRight,
  Sparkles,
  GraduationCap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Breadcrumb } from "@/components/common/Breadcrumb";
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

const DIFFICULTY_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  beginner: { label: "Iniciante", color: "text-emerald-600", bg: "bg-emerald-500/10" },
  intermediate: { label: "Intermediário", color: "text-amber-600", bg: "bg-amber-500/10" },
  advanced: { label: "Avançado", color: "text-orange-600", bg: "bg-orange-500/10" },
  expert: { label: "Expert", color: "text-red-600", bg: "bg-red-500/10" },
};

const CONTENT_TYPE_ICONS: Record<string, string> = {
  video: "🎬",
  text: "📖",
  quiz: "❓",
  pdf: "📄",
  link: "🔗",
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
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-md border-b">
          <div className="max-w-5xl mx-auto px-4 py-4">
            <Skeleton className="h-5 w-48" />
          </div>
        </div>
        <div className="max-w-5xl mx-auto px-4 py-8">
          <Skeleton className="h-64 w-full rounded-2xl mb-8" />
          <div className="grid grid-cols-3 gap-4 mb-8">
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
          </div>
          <Skeleton className="h-20 w-full rounded-xl mb-3" />
          <Skeleton className="h-20 w-full rounded-xl mb-3" />
          <Skeleton className="h-20 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (!training) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4"
        >
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto">
            <BookOpen className="w-10 h-10 text-muted-foreground" />
          </div>
          <h1 className="text-xl font-semibold">Treinamento não encontrado</h1>
          <p className="text-muted-foreground">O treinamento que você procura não existe.</p>
          <Button onClick={() => navigate("/app/development")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para Desenvolvimento
          </Button>
        </motion.div>
      </div>
    );
  }

  const isCompleted = !!trainingProgress?.completed_at;
  const progressPercent = trainingProgress?.progress_percent || 0;
  const completedModulesCount = moduleProgress.filter((p) =>
    modules.some((m) => m.id === p.module_id && p.completed_at)
  ).length;
  const difficultyConfig = DIFFICULTY_CONFIG[training.difficulty] || DIFFICULTY_CONFIG.beginner;
  const totalDuration = modules.reduce((acc, m) => acc + m.time_minutes, 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      {/* Compact Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-md border-b">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/app/development")}
              className="shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <Breadcrumb 
              items={[
                { label: "Desenvolvimento", href: "/app/development" },
                { label: training.name, isCurrent: true }
              ]} 
              className="flex-1 min-w-0"
            />
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl border bg-card"
        >
          {/* Gradient Accent */}
          <div 
            className="absolute inset-0 opacity-5"
            style={{ 
              background: `linear-gradient(135deg, ${training.color} 0%, transparent 50%)` 
            }}
          />
          
          <div className="relative p-6 md:p-8">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Icon */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="w-24 h-24 rounded-2xl flex items-center justify-center text-5xl shrink-0 shadow-lg"
                style={{ backgroundColor: `${training.color}20` }}
              >
                {training.icon}
              </motion.div>

              {/* Content */}
              <div className="flex-1 space-y-4">
                {/* Badges */}
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className={cn("border-0", difficultyConfig.bg, difficultyConfig.color)}>
                    {difficultyConfig.label}
                  </Badge>
                  <Badge variant="secondary">{training.category}</Badge>
                  {isCompleted && (
                    <Badge className="bg-emerald-500/10 text-emerald-600 border-0">
                      <CheckCircle className="w-3.5 h-3.5 mr-1" />
                      Concluído
                    </Badge>
                  )}
                </div>

                {/* Title & Description */}
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold">{training.name}</h1>
                  {training.description && (
                    <p className="text-muted-foreground mt-2 leading-relaxed">
                      {training.description}
                    </p>
                  )}
                </div>

                {/* Meta Info */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    <span>{totalDuration} min</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4" />
                    <span>{modules.length} módulos</span>
                  </div>
                  {training.estimated_hours > 0 && (
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4" />
                      <span>~{training.estimated_hours}h para dominar</span>
                    </div>
                  )}
                </div>

                {/* Progress Bar (if started) */}
                {progressPercent > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">
                        {completedModulesCount} de {modules.length} módulos
                      </span>
                      <span className="font-semibold" style={{ color: training.color }}>
                        {progressPercent}%
                      </span>
                    </div>
                    <Progress value={progressPercent} className="h-2" />
                  </div>
                )}

                {/* CTA Button */}
                <Button
                  size="lg"
                  onClick={handleContinue}
                  className="gap-2 shadow-lg"
                  style={{ 
                    backgroundColor: training.color,
                    color: 'white'
                  }}
                >
                  {isCompleted ? (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Revisar Treinamento
                    </>
                  ) : progressPercent > 0 ? (
                    <>
                      <Play className="w-5 h-5" />
                      Continuar de onde parou
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5" />
                      Iniciar Treinamento
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Rewards Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="grid grid-cols-2 md:grid-cols-3 gap-4"
        >
          {/* XP Reward */}
          <div className="p-5 rounded-xl border bg-card hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <Star className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <div className="text-2xl font-bold text-amber-500">+{training.xp_reward}</div>
                <div className="text-sm text-muted-foreground">XP de experiência</div>
              </div>
            </div>
          </div>

          {/* Coins Reward */}
          <div className="p-5 rounded-xl border bg-card hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                <Coins className="w-6 h-6 text-yellow-500" />
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-600">+{training.coins_reward}</div>
                <div className="text-sm text-muted-foreground">Moedas</div>
              </div>
            </div>
          </div>

          {/* Certificate */}
          {training.certificate_enabled && (
            <div className="p-5 rounded-xl border bg-card hover:shadow-md transition-shadow col-span-2 md:col-span-1">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <Award className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <div className="text-lg font-bold text-blue-600">Certificado</div>
                  <div className="text-sm text-muted-foreground">Ao concluir todos os módulos</div>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Modules List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Conteúdo do Treinamento</h2>
            <span className="text-sm text-muted-foreground">
              {completedModulesCount}/{modules.length} concluídos
            </span>
          </div>

          <div className="space-y-3">
            {modules.map((module, idx) => {
              const completed = isModuleCompleted(module.id);
              const locked = isModuleLocked(idx);
              const contentIcon = CONTENT_TYPE_ICONS[module.content_type] || "📚";

              return (
                <motion.button
                  key={module.id}
                  onClick={() => !locked && handleStartModule(module.id)}
                  disabled={locked}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 + idx * 0.05 }}
                  className={cn(
                    "w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left group",
                    completed
                      ? "border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10"
                      : locked
                      ? "border-border bg-muted/30 opacity-60 cursor-not-allowed"
                      : "border-border bg-card hover:border-primary/40 hover:shadow-md"
                  )}
                >
                  {/* Module Number */}
                  <div
                    className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg shrink-0 transition-transform group-hover:scale-105",
                      completed
                        ? "bg-emerald-500 text-white"
                        : locked
                        ? "bg-muted text-muted-foreground"
                        : "bg-primary/10 text-primary"
                    )}
                  >
                    {completed ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : locked ? (
                      <Lock className="w-5 h-5" />
                    ) : (
                      idx + 1
                    )}
                  </div>

                  {/* Module Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{contentIcon}</span>
                      <h3 className="font-medium truncate">{module.name}</h3>
                      {module.is_preview && (
                        <Badge variant="outline" className="text-xs shrink-0">
                          Prévia
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {module.time_minutes} min
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5" />
                        +{module.xp_reward} XP
                      </span>
                      {module.coins_reward > 0 && (
                        <span className="flex items-center gap-1">
                          <Coins className="w-3.5 h-3.5" />
                          +{module.coins_reward}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Arrow */}
                  {!locked && (
                    <ChevronRight
                      className={cn(
                        "w-5 h-5 shrink-0 transition-transform group-hover:translate-x-1",
                        completed ? "text-emerald-500" : "text-primary"
                      )}
                    />
                  )}
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
