/**
 * ModulePlayer - Player de módulo de treinamento com Step Engine
 * Layout premium estilo Hotmart/Kiwify com sidebar fixa
 */

import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FileText, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import type { EnhancedTrainingModule, StepResult } from "@/types/training";

// New Premium Components
import { 
  TrainingPlayerLayout,
  TrainingContentArea,
  TrainingCompletionScreen,
  type Training as TrainingType,
  type TrainingModule as TrainingModuleType,
  type ModuleProgress as ModuleProgressType
} from "@/components/trainings";

// Step Components
import { ContentStep } from "@/components/game/trainings/steps/ContentStep";
import { ArenaGameStep } from "@/components/game/trainings/steps/ArenaGameStep";
import { ReflectionStep } from "@/components/game/trainings/steps/ReflectionStep";
import { PracticalChallengeStep } from "@/components/game/trainings/steps/PracticalChallengeStep";

interface Training {
  id: string;
  name: string;
  description: string | null;
  icon: string;
  color: string;
  thumbnail_url: string | null;
  xp_reward: number;
  coins_reward: number;
  certificate_enabled: boolean;
  insignia_reward_id: string | null;
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
  is_preview: boolean | null;
  min_score: number | null;
  skill_ids: string[] | null;
}

interface UserModuleProgress {
  module_id: string;
  is_completed: boolean;
  completed_at: string | null;
  score: number | null;
  time_spent_seconds: number;
}

export default function ModulePlayer() {
  const { trainingId, moduleId } = useParams<{
    trainingId: string;
    moduleId: string;
  }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [training, setTraining] = useState<Training | null>(null);
  const [modules, setModules] = useState<TrainingModule[]>([]);
  const [currentModule, setCurrentModule] = useState<TrainingModule | null>(null);
  const [moduleProgress, setModuleProgress] = useState<UserModuleProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCompleting, setIsCompleting] = useState(false);
  const [showCompletionScreen, setShowCompletionScreen] = useState(false);
  const [completionData, setCompletionData] = useState<{
    totalXP: number;
    totalCoins: number;
    totalTime: number;
    avgScore?: number;
    modulesCompleted: number;
  } | null>(null);

  // Video progress state
  const [videoProgress, setVideoProgress] = useState(0);
  const [canCompleteVideo, setCanCompleteVideo] = useState(false);

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
            .select("module_id, completed_at, score, time_spent_seconds")
            .eq("user_id", user.id);
          
          if (progressData) {
            setModuleProgress(progressData.map(p => ({
              module_id: p.module_id,
              is_completed: !!p.completed_at,
              completed_at: p.completed_at,
              score: p.score,
              time_spent_seconds: p.time_spent_seconds || 0
            })));
          }

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
    return moduleProgress.some((p) => p.module_id === modId && p.is_completed);
  };

  const isModuleLocked = (modId: string) => {
    const moduleIndex = modules.findIndex(m => m.id === modId);
    if (moduleIndex <= 0) return false;
    
    const module = modules[moduleIndex];
    if (module.is_preview) return false;

    const prevModule = modules[moduleIndex - 1];
    const prevProgress = moduleProgress.find(p => p.module_id === prevModule.id);
    
    if (!prevProgress?.is_completed) return true;

    if (prevModule.min_score && prevProgress.score !== null && prevProgress.score !== undefined) {
      if (prevProgress.score < prevModule.min_score) return true;
    }

    return false;
  };

  const currentIndex = modules.findIndex((m) => m.id === moduleId);
  const hasNext = currentIndex < modules.length - 1;
  const hasPrev = currentIndex > 0;
  const isCurrentCompleted = isModuleCompleted(moduleId || "");
  const isLastModule = currentIndex === modules.length - 1;

  const getStepType = (module: TrainingModule) => {
    return module.step_type || module.content_type || "content";
  };

  const handleStepComplete = useCallback(async (result: StepResult) => {
    if (!user || !currentModule || !training) return;
    setIsCompleting(true);

    try {
      // Check checkpoint validation
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

      // Award XP and coins
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

      // Update local progress state
      const updatedProgress = [
        ...moduleProgress.filter((p) => p.module_id !== currentModule.id),
        { 
          module_id: currentModule.id, 
          is_completed: true,
          completed_at: new Date().toISOString(), 
          score: result.score || null,
          time_spent_seconds: result.timeSpent || 0
        },
      ];
      setModuleProgress(updatedProgress);

      // Calculate training progress
      const completedCount = modules.filter((m) =>
        updatedProgress.some((p) => p.module_id === m.id && p.is_completed)
      ).length;
      const progressPercent = Math.round((completedCount / modules.length) * 100);
      const isTrainingComplete = completedCount === modules.length;

      // Update training progress in DB
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

      // Log analytics
      await supabase.from("training_analytics").insert({
        training_id: training.id,
        module_id: currentModule.id,
        user_id: user.id,
        event_type: "module_completed",
        score: result.score || null,
        time_spent_seconds: result.timeSpent || null,
        metadata: result.metadata || null,
      } as any);

      // If training complete, show completion screen
      if (isTrainingComplete) {
        // Award training bonus
        await supabase.from("user_xp_history").insert({
          user_id: user.id,
          xp_earned: training.xp_reward,
          coins_earned: training.coins_reward,
          source: "training_complete",
          source_id: training.id,
        });

        // Generate certificate using the new function
        if (training.certificate_enabled) {
          try {
            const { data: certResult, error: certError } = await supabase.rpc('issue_certificate', {
              p_user_id: user.id,
              p_training_id: training.id
            });
            
            if (certError) {
              console.error("Certificate error:", certError);
            } else {
              const result = certResult as { success?: boolean; verification_code?: string } | null;
              if (result?.success) {
                toast.success("🏆 Certificado emitido!", {
                  description: `Código: ${result.verification_code}`,
                });
              }
            }
          } catch (certErr) {
            console.error("Certificate generation error:", certErr);
          }
        }

        await supabase.from("training_analytics").insert({
          training_id: training.id,
          user_id: user.id,
          event_type: "training_completed",
        } as any);

        // Calculate totals for completion screen
        const totalXP = modules.reduce((sum, m) => sum + m.xp_reward, 0) + training.xp_reward;
        const totalCoins = modules.reduce((sum, m) => sum + m.coins_reward, 0) + training.coins_reward;
        const totalTime = modules.reduce((sum, m) => sum + m.time_minutes, 0);
        const scores = updatedProgress.filter(p => p.score !== null).map(p => p.score as number);
        const avgScore = scores.length > 0 
          ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
          : undefined;

        setCompletionData({
          totalXP,
          totalCoins,
          totalTime,
          avgScore,
          modulesCompleted: completedCount,
        });
        setShowCompletionScreen(true);
      } else {
        // Show toast and confetti for module completion
        toast.success("Módulo concluído!", {
          description: `+${currentModule.xp_reward} XP, +${currentModule.coins_reward} moedas`,
        });
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
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

  const handleModuleSelect = (modId: string) => {
    if (!isModuleLocked(modId)) {
      navigate(`/app/trainings/${trainingId}/module/${modId}`);
    }
  };

  const handleNext = () => {
    if (hasNext && !isModuleLocked(modules[currentIndex + 1].id)) {
      navigate(`/app/trainings/${trainingId}/module/${modules[currentIndex + 1].id}`);
    } else if (!hasNext) {
      navigate(`/trainings/${trainingId}`);
    }
  };

  const handlePrev = () => {
    if (hasPrev) {
      navigate(`/app/trainings/${trainingId}/module/${modules[currentIndex - 1].id}`);
    }
  };

  const handleVideoProgress = (progress: number, duration: number) => {
    setVideoProgress(progress);
    // Allow completion when video is 90% watched
    if (progress >= 90) {
      setCanCompleteVideo(true);
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
      is_preview: currentModule.is_preview || false,
    } as EnhancedTrainingModule;
  };

  // Show completion screen
  if (showCompletionScreen && completionData && training) {
    return (
      <TrainingCompletionScreen
        trainingName={training.name}
        trainingIcon={training.icon}
        trainingColor={training.color}
        totalXP={completionData.totalXP}
        totalCoins={completionData.totalCoins}
        totalTimeMinutes={completionData.totalTime}
        averageScore={completionData.avgScore}
        modulesCompleted={completionData.modulesCompleted}
        certificateEnabled={training.certificate_enabled}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex">
        <div className="w-80 border-r border-border p-4 hidden lg:block">
          <Skeleton className="h-12 w-full mb-4" />
          <Skeleton className="h-2 w-full mb-6" />
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map(i => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        </div>
        <div className="flex-1 p-6">
          <Skeleton className="h-8 w-64 mb-6" />
          <Skeleton className="aspect-video w-full rounded-2xl mb-6" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (!currentModule || !training) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-xl font-semibold">Módulo não encontrado</h1>
          <Button className="mt-4" onClick={() => navigate("/trainings")}>
            Voltar
          </Button>
        </div>
      </div>
    );
  }

  const stepType = getStepType(currentModule);
  const enhancedModule = getEnhancedModule();

  // Convert to layout types
  const layoutTraining: TrainingType = {
    id: training.id,
    name: training.name,
    description: training.description,
    icon: training.icon,
    color: training.color,
    thumbnail_url: training.thumbnail_url,
    xp_reward: training.xp_reward,
    coins_reward: training.coins_reward,
    certificate_enabled: training.certificate_enabled,
  };

  const layoutModules: TrainingModuleType[] = modules.map(m => ({
    id: m.id,
    name: m.name,
    description: m.description,
    order_index: m.order_index,
    content_type: m.content_type,
    step_type: m.step_type || undefined,
    time_minutes: m.time_minutes,
    xp_reward: m.xp_reward,
    coins_reward: m.coins_reward,
    is_checkpoint: m.is_checkpoint || undefined,
    min_score: m.min_score,
    is_preview: m.is_preview || undefined,
  }));

  const layoutProgress: ModuleProgressType[] = moduleProgress.map(p => ({
    module_id: p.module_id,
    is_completed: p.is_completed,
    score: p.score,
    time_spent_seconds: p.time_spent_seconds,
  }));

  // Determine if can complete based on step type
  const canComplete = (() => {
    if (isCurrentCompleted) return false;
    if (stepType === 'video') return canCompleteVideo;
    // Other step types handle their own completion
    if (['content', 'text', 'pdf', 'link', 'arena_game', 'quiz', 'reflection', 'practical_challenge', 'simulation', 'cognitive_test'].includes(stepType)) {
      return false; // These have their own completion buttons
    }
    return true;
  })();

  return (
    <TrainingPlayerLayout
      training={layoutTraining}
      modules={layoutModules}
      currentModule={layoutModules[currentIndex] || null}
      moduleProgress={layoutProgress}
      onModuleSelect={handleModuleSelect}
      onPrevious={handlePrev}
      onNext={handleNext}
      onComplete={handleCompleteModule}
      canComplete={canComplete}
      isCompleting={isCompleting}
    >
      <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
        {/* Video Content */}
        {stepType === "video" && currentModule.video_url && (
          <TrainingContentArea
            module={{
              id: currentModule.id,
              name: currentModule.name,
              description: currentModule.description,
              order_index: currentModule.order_index,
              content_type: 'video',
              time_minutes: currentModule.time_minutes,
              xp_reward: currentModule.xp_reward,
              coins_reward: currentModule.coins_reward,
              is_checkpoint: currentModule.is_checkpoint || false,
            }}
            contentData={{ video_url: currentModule.video_url, content_type: 'video' }}
            videoUrl={currentModule.video_url}
            onVideoProgress={handleVideoProgress}
            onContentComplete={() => setCanCompleteVideo(true)}
          />
        )}

        {/* Content step types */}
        {(stepType === "content" || stepType === "text" || stepType === "pdf" || stepType === "link") && enhancedModule && (
          <ContentStep
            module={enhancedModule}
            onComplete={handleStepComplete}
            onCancel={() => navigate(`/trainings/${trainingId}`)}
          />
        )}

        {/* Arena game step */}
        {(stepType === "arena_game" || stepType === "simulation" || stepType === "quiz") && enhancedModule && (
          <ArenaGameStep
            module={enhancedModule}
            onComplete={handleStepComplete}
            onCancel={() => navigate(`/trainings/${trainingId}`)}
          />
        )}

        {/* Reflection step */}
        {stepType === "reflection" && enhancedModule && (
          <ReflectionStep
            module={enhancedModule}
            onComplete={handleStepComplete}
            onCancel={() => navigate(`/trainings/${trainingId}`)}
            isSubmitting={isCompleting}
          />
        )}

        {/* Practical challenge step */}
        {stepType === "practical_challenge" && enhancedModule && (
          <PracticalChallengeStep
            module={enhancedModule}
            onComplete={handleStepComplete}
            onCancel={() => navigate(`/trainings/${trainingId}`)}
            isSubmitting={isCompleting}
          />
        )}
      </div>
    </TrainingPlayerLayout>
  );
}
