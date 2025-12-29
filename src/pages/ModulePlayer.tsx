/**
 * ModulePlayer - Player de módulo de treinamento com Step Engine
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Clock,
  Trophy,
  ExternalLink,
  FileText,
  Loader2,
  Target,
  Brain,
  Gamepad2,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import confetti from "canvas-confetti";
import type { EnhancedTrainingModule, StepResult } from "@/types/training";

// Step Components
import { ContentStep } from "@/components/game/trainings/steps/ContentStep";
import { ArenaGameStep } from "@/components/game/trainings/steps/ArenaGameStep";
import { ReflectionStep } from "@/components/game/trainings/steps/ReflectionStep";
import { PracticalChallengeStep } from "@/components/game/trainings/steps/PracticalChallengeStep";

interface Training {
  id: string;
  name: string;
  icon: string;
  color: string;
  xp_reward: number;
  coins_reward: number;
  certificate_enabled: boolean;
}

interface TrainingModule {
  id: string;
  training_id: string;
  module_key: string;
  name: string;
  description: string | null;
  content_type: string;
  step_type: string | null;
  step_config: Record<string, unknown> | null;
  video_url: string | null;
  content_data: Record<string, unknown> | null;
  order_index: number;
  xp_reward: number;
  coins_reward: number;
  time_minutes: number;
  requires_completion: boolean;
  is_optional: boolean | null;
  is_checkpoint: boolean | null;
  min_score: number | null;
  skill_ids: string[] | null;
}

interface UserModuleProgress {
  module_id: string;
  completed_at: string | null;
  score: number | null;
}

const STEP_ICONS: Record<string, React.ElementType> = {
  content: FileText,
  quiz: Target,
  arena_game: Gamepad2,
  cognitive_test: Brain,
  practical_challenge: Target,
  simulation: Gamepad2,
  reflection: MessageSquare,
  video: Play,
  text: FileText,
  pdf: FileText,
  link: ExternalLink,
};

const STEP_LABELS: Record<string, string> = {
  content: "Conteúdo",
  quiz: "Quiz",
  arena_game: "Jogo",
  cognitive_test: "Teste Cognitivo",
  practical_challenge: "Desafio Prático",
  simulation: "Simulação",
  reflection: "Reflexão",
  video: "Vídeo",
  text: "Texto",
  pdf: "PDF",
  link: "Link Externo",
};

export default function ModulePlayer() {
  const { trainingId, moduleId } = useParams<{
    trainingId: string;
    moduleId: string;
  }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);

  const [training, setTraining] = useState<Training | null>(null);
  const [modules, setModules] = useState<TrainingModule[]>([]);
  const [currentModule, setCurrentModule] = useState<TrainingModule | null>(null);
  const [moduleProgress, setModuleProgress] = useState<UserModuleProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCompleting, setIsCompleting] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [completionData, setCompletionData] = useState<{
    xp: number;
    coins: number;
    score?: number;
    isTrainingComplete: boolean;
    trainingXP?: number;
    trainingCoins?: number;
  } | null>(null);

  // Video state
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);

  useEffect(() => {
    async function fetchData() {
      if (!trainingId || !moduleId) return;
      setIsLoading(true);

      try {
        const [trainingRes, modulesRes] = await Promise.all([
          supabase.from("trainings").select("*").eq("id", trainingId).single(),
          supabase
            .from("training_modules")
            .select("*")
            .eq("training_id", trainingId)
            .order("order_index"),
        ]);

        if (trainingRes.data) setTraining(trainingRes.data as Training);
        if (modulesRes.data) {
          setModules(modulesRes.data as TrainingModule[]);
          const current = (modulesRes.data as TrainingModule[]).find(
            (m) => m.id === moduleId
          );
          setCurrentModule(current || null);
        }

        if (user) {
          const { data: progressData } = await supabase
            .from("user_module_progress")
            .select("module_id, completed_at, score")
            .eq("user_id", user.id);
          if (progressData) setModuleProgress(progressData as UserModuleProgress[]);

          // Mark as started
          await supabase.from("user_module_progress").upsert(
            {
              user_id: user.id,
              module_id: moduleId,
              started_at: new Date().toISOString(),
            },
            { onConflict: "user_id,module_id" }
          );
        }
      } catch (err) {
        console.error("Error fetching module:", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [trainingId, moduleId, user]);

  const isModuleCompleted = (modId: string) => {
    return moduleProgress.some((p) => p.module_id === modId && p.completed_at);
  };

  const currentIndex = modules.findIndex((m) => m.id === moduleId);
  const hasNext = currentIndex < modules.length - 1;
  const hasPrev = currentIndex > 0;
  const isCurrentCompleted = isModuleCompleted(moduleId || "");

  // Get step type - prioritize step_type, fallback to content_type
  const getStepType = (module: TrainingModule) => {
    return module.step_type || module.content_type || "content";
  };

  const handleStepComplete = useCallback(async (result: StepResult) => {
    if (!user || !currentModule || !training) return;
    setIsCompleting(true);

    try {
      // Check if checkpoint validation passed
      if (currentModule.is_checkpoint && currentModule.min_score) {
        if ((result.score || 0) < currentModule.min_score) {
          toast.error(`Score mínimo não atingido: ${currentModule.min_score}%`);
          setIsCompleting(false);
          return;
        }
      }

      // Update module progress
      const { error: progressError } = await supabase.from("user_module_progress").upsert(
        {
          user_id: user.id,
          module_id: currentModule.id,
          completed_at: new Date().toISOString(),
          score: result.score || null,
          passed_validation: result.passed || null,
          time_spent_seconds: result.timeSpent || 0,
          metadata: result.metadata || null,
        } as any,
        { onConflict: "user_id,module_id" }
      );
      
      if (progressError) console.error("Progress error:", progressError);

      // Update profiles with XP and coins
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .single();

      if (profile) {
        await supabase.from("user_xp_history").insert({
          user_id: user.id,
          xp_earned: currentModule.xp_reward,
          coins_earned: currentModule.coins_reward,
          source: "training_module",
          source_id: currentModule.id,
        });
      }

      // Calculate training progress
      const updatedProgress = [
        ...moduleProgress.filter((p) => p.module_id !== currentModule.id),
        { module_id: currentModule.id, completed_at: new Date().toISOString(), score: result.score || null },
      ];
      setModuleProgress(updatedProgress);

      const completedCount = modules.filter((m) =>
        updatedProgress.some((p) => p.module_id === m.id && p.completed_at)
      ).length;
      const progressPercent = Math.round((completedCount / modules.length) * 100);
      const isTrainingComplete = completedCount === modules.length;

      // Update training progress
      await supabase.from("user_training_progress").upsert(
        {
          user_id: user.id,
          training_id: training.id,
          progress_percent: progressPercent,
          completed_at: isTrainingComplete ? new Date().toISOString() : null,
          average_score: result.score,
        },
        { onConflict: "user_id,training_id" }
      );

      // Log analytics event
      await supabase.from("training_analytics").insert({
        training_id: training.id,
        module_id: currentModule.id,
        user_id: user.id,
        event_type: "module_completed",
        score: result.score || null,
        time_spent_seconds: result.timeSpent || null,
        metadata: result.metadata || null,
      } as any);

      // If training complete, award bonus
      if (isTrainingComplete) {
        await supabase.from("user_xp_history").insert({
          user_id: user.id,
          xp_earned: training.xp_reward,
          coins_earned: training.coins_reward,
          source: "training_complete",
          source_id: training.id,
        });

        if (training.certificate_enabled) {
          await supabase.from("training_certificates").insert({
            user_id: user.id,
            training_id: training.id,
            certificate_number: `CERT-${Date.now()}-${Math.random()
              .toString(36)
              .substr(2, 6)
              .toUpperCase()}`,
          });
        }

        await supabase.from("training_analytics").insert({
          training_id: training.id,
          user_id: user.id,
          event_type: "training_completed",
        } as any);
      }

      // Show completion modal
      setCompletionData({
        xp: currentModule.xp_reward,
        coins: currentModule.coins_reward,
        score: result.score,
        isTrainingComplete,
        trainingXP: isTrainingComplete ? training.xp_reward : undefined,
        trainingCoins: isTrainingComplete ? training.coins_reward : undefined,
      });
      setShowCompletionModal(true);

      if (isTrainingComplete) {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      }
    } catch (err) {
      console.error("Error completing module:", err);
      toast.error("Erro ao completar módulo");
    } finally {
      setIsCompleting(false);
    }
  }, [user, currentModule, training, modules, moduleProgress]);

  const handleCompleteModule = async () => {
    await handleStepComplete({ completed: true, passed: true, timeSpent: 0 });
  };

  const handleNext = () => {
    if (hasNext) {
      const nextModule = modules[currentIndex + 1];
      navigate(`/app/trainings/${trainingId}/module/${nextModule.id}`);
    } else {
      navigate(`/app/trainings/${trainingId}`);
    }
  };

  const handlePrev = () => {
    if (hasPrev) {
      const prevModule = modules[currentIndex - 1];
      navigate(`/app/trainings/${trainingId}/module/${prevModule.id}`);
    }
  };

  const handleVideoTimeUpdate = () => {
    if (videoRef.current) {
      const progress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setVideoProgress(progress);
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        videoRef.current.requestFullscreen();
      }
    }
  };

  // Convert to EnhancedTrainingModule for step components
  const getEnhancedModule = (): EnhancedTrainingModule | null => {
    if (!currentModule) return null;
    return {
      ...currentModule,
      step_type: getStepType(currentModule) as EnhancedTrainingModule["step_type"],
      step_config: (currentModule.step_config || {}) as any,
      validation_criteria: null as any,
      is_optional: currentModule.is_optional || false,
      is_checkpoint: currentModule.is_checkpoint || false,
      min_score: currentModule.min_score || null,
      skill_ids: currentModule.skill_ids || [],
      thumbnail_url: currentModule.video_url || null,
      is_preview: false,
    } as EnhancedTrainingModule;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <Skeleton className="h-8 w-64 mb-6" />
        <Skeleton className="aspect-video w-full rounded-2xl mb-6" />
        <Skeleton className="h-24 w-full rounded-xl" />
      </div>
    );
  }

  if (!currentModule || !training) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-xl font-semibold">Módulo não encontrado</h1>
          <Button className="mt-4" onClick={() => navigate("/app")}>
            Voltar
          </Button>
        </div>
      </div>
    );
  }

  const stepType = getStepType(currentModule);
  const StepIcon = STEP_ICONS[stepType] || FileText;
  const enhancedModule = getEnhancedModule();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(`/app/trainings/${trainingId}`)}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <div className="text-sm text-muted-foreground">{training.name}</div>
              <div className="font-medium text-foreground flex items-center gap-2">
                <StepIcon className="w-4 h-4" />
                {currentIndex + 1}. {currentModule.name}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="hidden sm:flex">
              {STEP_LABELS[stepType] || stepType}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {currentIndex + 1} / {modules.length}
            </span>
          </div>
        </div>
        <Progress value={((currentIndex + 1) / modules.length) * 100} className="h-1" />
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Render step based on type */}
        {stepType === "video" && currentModule.video_url && (
          <div className="relative rounded-2xl overflow-hidden bg-black aspect-video">
            <video
              ref={videoRef}
              src={currentModule.video_url}
              className="w-full h-full"
              onTimeUpdate={handleVideoTimeUpdate}
              onLoadedMetadata={(e) =>
                setVideoDuration((e.target as HTMLVideoElement).duration)
              }
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={() => setIsPlaying(false)}
            />
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
              <Progress value={videoProgress} className="h-1 mb-3" />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={togglePlay}>
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  </Button>
                  <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={toggleMute}>
                    {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </Button>
                  <span className="text-sm text-white/80">
                    {Math.floor((videoProgress / 100) * videoDuration)}s / {Math.floor(videoDuration)}s
                  </span>
                </div>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={toggleFullscreen}>
                  <Maximize className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Content step types */}
        {(stepType === "content" || stepType === "text" || stepType === "pdf" || stepType === "link") && enhancedModule && (
          <ContentStep
            module={enhancedModule}
            onComplete={handleStepComplete}
            onCancel={() => navigate(`/app/trainings/${trainingId}`)}
          />
        )}

        {/* Arena game step */}
        {(stepType === "arena_game" || stepType === "simulation" || stepType === "quiz") && enhancedModule && (
          <ArenaGameStep
            module={enhancedModule}
            onComplete={handleStepComplete}
            onCancel={() => navigate(`/app/trainings/${trainingId}`)}
          />
        )}

        {/* Reflection step */}
        {stepType === "reflection" && enhancedModule && (
          <ReflectionStep
            module={enhancedModule}
            onComplete={handleStepComplete}
            onCancel={() => navigate(`/app/trainings/${trainingId}`)}
            isSubmitting={isCompleting}
          />
        )}

        {/* Practical challenge step */}
        {stepType === "practical_challenge" && enhancedModule && (
          <PracticalChallengeStep
            module={enhancedModule}
            onComplete={handleStepComplete}
            onCancel={() => navigate(`/app/trainings/${trainingId}`)}
            isSubmitting={isCompleting}
          />
        )}

        {/* Module Info */}
        <div className="p-6 rounded-2xl border border-border bg-card">
          <div className="flex items-start gap-4">
            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
              currentModule.is_checkpoint ? "bg-amber-500/10" : "bg-primary/10"
            )}>
              <StepIcon className={cn(
                "w-6 h-6",
                currentModule.is_checkpoint ? "text-amber-500" : "text-primary"
              )} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                {currentModule.is_checkpoint && (
                  <Badge className="text-xs bg-amber-500/10 text-amber-500 border-amber-500/20">
                    Checkpoint
                  </Badge>
                )}
                {currentModule.is_optional && (
                  <Badge variant="secondary" className="text-xs">Opcional</Badge>
                )}
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">{currentModule.name}</h2>
              {currentModule.description && (
                <p className="text-muted-foreground">{currentModule.description}</p>
              )}
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4 mt-4 text-sm">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>{currentModule.time_minutes} min</span>
            </div>
            <div className="flex items-center gap-1.5 text-primary">
              <Trophy className="w-4 h-4" />
              <span>+{currentModule.xp_reward} XP</span>
            </div>
            {currentModule.coins_reward > 0 && (
              <div className="flex items-center gap-1.5 text-amber-500">
                <span>🪙</span>
                <span>+{currentModule.coins_reward}</span>
              </div>
            )}
            {currentModule.min_score && (
              <div className="flex items-center gap-1.5 text-amber-600">
                <Target className="w-4 h-4" />
                <span>Mínimo: {currentModule.min_score}%</span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-4">
          <Button variant="outline" onClick={handlePrev} disabled={!hasPrev} className="flex-1 sm:flex-none">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Anterior
          </Button>

          <div className="flex-1 flex justify-center">
            {!isCurrentCompleted && stepType === "video" && (
              <Button onClick={handleCompleteModule} disabled={isCompleting} className="w-full sm:w-auto">
                {isCompleting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4 mr-2" />
                )}
                Marcar como Concluído
              </Button>
            )}
            {isCurrentCompleted && (
              <div className="flex items-center gap-2 text-emerald-500">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">Concluído</span>
              </div>
            )}
          </div>

          <Button
            variant={hasNext ? "default" : "outline"}
            onClick={handleNext}
            className="flex-1 sm:flex-none"
          >
            {hasNext ? "Próximo" : "Voltar ao Treinamento"}
            {hasNext && <ArrowRight className="w-4 h-4 ml-2" />}
          </Button>
        </div>
      </div>

      {/* Completion Modal */}
      <Dialog open={showCompletionModal} onOpenChange={setShowCompletionModal}>
        <DialogContent className="text-center">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {completionData?.isTrainingComplete ? "🎉 Treinamento Concluído!" : "✨ Módulo Concluído!"}
            </DialogTitle>
            <DialogDescription>
              {completionData?.isTrainingComplete
                ? "Parabéns! Você completou todo o treinamento!"
                : "Excelente trabalho! Continue assim!"}
            </DialogDescription>
          </DialogHeader>

          <div className="py-6 space-y-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-20 h-20 mx-auto rounded-full bg-primary/20 flex items-center justify-center"
            >
              <CheckCircle className="w-10 h-10 text-primary" />
            </motion.div>

            <div className="flex justify-center gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-center"
              >
                <div className="text-3xl font-bold text-primary">+{completionData?.xp || 0}</div>
                <div className="text-sm text-muted-foreground">XP</div>
              </motion.div>
              {(completionData?.coins || 0) > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-center"
                >
                  <div className="text-3xl font-bold text-amber-500">+{completionData?.coins}</div>
                  <div className="text-sm text-muted-foreground">Moedas</div>
                </motion.div>
              )}
              {completionData?.score !== undefined && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-center"
                >
                  <div className="text-3xl font-bold text-emerald-500">{completionData.score}%</div>
                  <div className="text-sm text-muted-foreground">Score</div>
                </motion.div>
              )}
            </div>

            {completionData?.isTrainingComplete && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="pt-4 border-t border-border"
              >
                <div className="text-sm text-muted-foreground mb-2">Bônus do Treinamento</div>
                <div className="flex justify-center gap-4">
                  <span className="text-primary font-bold">+{completionData.trainingXP} XP</span>
                  <span className="text-amber-500 font-bold">+{completionData.trainingCoins} 🪙</span>
                </div>
              </motion.div>
            )}
          </div>

          <Button onClick={handleNext} className="w-full">
            {hasNext ? "Próximo Módulo" : "Voltar ao Treinamento"}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
