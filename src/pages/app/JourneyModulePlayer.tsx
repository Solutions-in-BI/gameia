/**
 * JourneyModulePlayer - Player de módulo dentro do contexto da Jornada
 * Integra com sidebar da jornada e navegação hierárquica
 */

import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Menu, 
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Route
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useJourneyProgress } from "@/hooks/useJourneyProgress";
import { usePlayerRewards } from "@/hooks/usePlayerRewards";
import { JourneySidebar } from "@/components/journeys/JourneySidebar";
import { Breadcrumb, buildJourneyBreadcrumbs } from "@/components/common/Breadcrumb";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

// Import step components
import { ContentStep } from "@/components/game/trainings/steps/ContentStep";
import { ArenaGameStep } from "@/components/game/trainings/steps/ArenaGameStep";
import { ReflectionStep } from "@/components/game/trainings/steps/ReflectionStep";
import { PracticalChallengeStep } from "@/components/game/trainings/steps/PracticalChallengeStep";
import { GuidedReadingStep } from "@/components/game/trainings/steps/GuidedReadingStep";
import { AIReflectionStep } from "@/components/game/trainings/steps/AIReflectionStep";
import { RoutineApplicationStep } from "@/components/game/trainings/steps/RoutineApplicationStep";
import { ValidationStep } from "@/components/game/trainings/steps/ValidationStep";

interface Module {
  id: string;
  name: string;
  description: string | null;
  content_type: string | null;
  video_url: string | null;
  step_type: string | null;
  step_config: any;
  xp_reward: number;
  coins_reward: number;
  order_index: number;
}

interface Training {
  id: string;
  name: string;
  description: string | null;
}

interface Journey {
  id: string;
  name: string;
  bonus_xp: number;
  bonus_coins: number;
  generates_certificate: boolean;
  bonus_insignia_id: string | null;
}

export default function JourneyModulePlayer() {
  const { journeyId, trainingId, moduleId } = useParams<{ 
    journeyId: string; 
    trainingId: string; 
    moduleId: string; 
  }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { awardRewards } = usePlayerRewards();
  const { 
    progress: journeyProgress, 
    completeTraining 
  } = useJourneyProgress(journeyId);

  const [journey, setJourney] = useState<Journey | null>(null);
  const [training, setTraining] = useState<Training | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [currentModule, setCurrentModule] = useState<Module | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [moduleProgress, setModuleProgress] = useState<Record<string, boolean>>({});

  // Fetch data
  useEffect(() => {
    async function fetchData() {
      if (!journeyId || !trainingId || !moduleId || !user) return;

      try {
        setIsLoading(true);

        // Fetch journey
        const { data: journeyData } = await supabase
          .from("training_journeys")
          .select("id, name, bonus_xp, bonus_coins, generates_certificate, bonus_insignia_id")
          .eq("id", journeyId)
          .maybeSingle();

        setJourney(journeyData);

        // Fetch training
        const { data: trainingData } = await supabase
          .from("trainings")
          .select("id, name, description")
          .eq("id", trainingId)
          .maybeSingle();

        setTraining(trainingData);

        // Fetch modules
        const { data: modulesData } = await supabase
          .from("training_modules")
          .select("id, name, description, content_type, video_url, step_type, step_config, xp_reward, coins_reward, order_index")
          .eq("training_id", trainingId)
          .order("order_index");

        const mappedModules = (modulesData || []).map(m => ({
          id: m.id,
          name: m.name,
          description: m.description,
          content_type: m.content_type,
          video_url: m.video_url,
          step_type: m.step_type,
          step_config: m.step_config,
          xp_reward: m.xp_reward,
          coins_reward: m.coins_reward,
          order_index: m.order_index,
        }));

        setModules(mappedModules);

        // Set current module
        const current = mappedModules.find(m => m.id === moduleId);
        setCurrentModule(current || null);

        // Fetch module progress
        const { data: progressData } = await supabase
          .from("user_module_progress")
          .select("module_id, completed_at")
          .eq("user_id", user.id)
          .in("module_id", mappedModules.map(m => m.id));

        const progressMap: Record<string, boolean> = {};
        (progressData || []).forEach(p => {
          if (p.completed_at) {
            progressMap[p.module_id] = true;
          }
        });
        setModuleProgress(progressMap);

      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [journeyId, trainingId, moduleId, user]);

  // Get current module index
  const currentIndex = modules.findIndex(m => m.id === moduleId);
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === modules.length - 1;
  const prevModule = !isFirst ? modules[currentIndex - 1] : null;
  const nextModule = !isLast ? modules[currentIndex + 1] : null;

  // Handle module completion
  const handleCompleteModule = useCallback(async () => {
    if (!currentModule || !user || !trainingId || isCompleting) return;

    try {
      setIsCompleting(true);

      // Mark module as completed
      await supabase
        .from("user_module_progress")
        .upsert({
          module_id: currentModule.id,
          user_id: user.id,
          training_id: trainingId,
          completed_at: new Date().toISOString(),
          score: 100,
        });

      // Award rewards
      if (currentModule.xp_reward > 0 || currentModule.coins_reward > 0) {
        await awardRewards(
          currentModule.xp_reward,
          currentModule.coins_reward,
          "training_module",
          currentModule.id
        );
      }

      // Update local state
      setModuleProgress(prev => ({ ...prev, [currentModule.id]: true }));

      toast.success("Módulo concluído!");

      // Check if training is complete
      const completedCount = Object.keys(moduleProgress).length + 1;
      if (completedCount >= modules.length) {
        // Complete training in journey
        await completeTraining(trainingId);
        
        toast.success("Treinamento concluído!");
        navigate(`/app/journeys/${journeyId}`);
        return;
      }

      // Navigate to next module
      if (nextModule) {
        navigate(`/app/journeys/${journeyId}/training/${trainingId}/module/${nextModule.id}`);
      }

    } catch (err) {
      console.error("Error completing module:", err);
      toast.error("Erro ao completar módulo");
    } finally {
      setIsCompleting(false);
    }
  }, [currentModule, user, trainingId, journeyId, modules, moduleProgress, nextModule, awardRewards, completeTraining, navigate, isCompleting]);

  // Navigate to previous module
  const goToPrev = () => {
    if (prevModule) {
      navigate(`/app/journeys/${journeyId}/training/${trainingId}/module/${prevModule.id}`);
    }
  };

  // Navigate to next module
  const goToNext = () => {
    if (nextModule) {
      navigate(`/app/journeys/${journeyId}/training/${trainingId}/module/${nextModule.id}`);
    }
  };

  // Build sidebar data
  const sidebarTrainings = [{
    id: trainingId || "",
    name: training?.name || "Treinamento",
    isCompleted: false,
    isLocked: false,
    isCurrent: true,
    progress: (Object.keys(moduleProgress).length / modules.length) * 100,
    modules: modules.map(m => ({
      id: m.id,
      title: m.name,
      isCompleted: !!moduleProgress[m.id],
      isLocked: false,
      isCurrent: m.id === moduleId,
      duration: "5 min",
    })),
  }];

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-screen">
        <div className="w-80 border-r p-4 space-y-4 hidden lg:block">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
        <div className="flex-1 p-6">
          <Skeleton className="h-8 w-64 mb-6" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!currentModule || !journey || !training) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center space-y-4">
          <Route className="w-16 h-16 text-muted-foreground mx-auto" />
          <h2 className="text-xl font-semibold">Módulo não encontrado</h2>
          <Button onClick={() => navigate(`/app/journeys/${journeyId}`)}>
            Voltar para Jornada
          </Button>
        </div>
      </div>
    );
  }

  // Determine step type
  const stepType = currentModule.step_type || "content";
  const isModuleCompleted = !!moduleProgress[currentModule.id];

  // Build enhanced module for step components
  const enhancedModule = {
    id: currentModule.id,
    name: currentModule.name,
    title: currentModule.name,
    description: currentModule.description,
    content: currentModule.description || "",
    content_type: currentModule.content_type || "text",
    video_url: currentModule.video_url,
    step_type: currentModule.step_type || "content",
    step_config: currentModule.step_config || {},
    xp_reward: currentModule.xp_reward,
    coins_reward: currentModule.coins_reward,
    sort_order: currentModule.order_index,
    time_minutes: 10,
  };

  // Render step content
  const renderStepContent = () => {
    const handleCancel = () => navigate(`/app/journeys/${journeyId}`);

    switch (stepType) {
      case "arena_game":
        return (
          <ArenaGameStep
            module={enhancedModule as any}
            onComplete={handleCompleteModule}
            onCancel={handleCancel}
          />
        );
      case "reflection":
        return (
          <ReflectionStep
            module={enhancedModule as any}
            onComplete={handleCompleteModule}
            onCancel={handleCancel}
            isSubmitting={isCompleting}
          />
        );
      case "practical_challenge":
        return (
          <PracticalChallengeStep
            module={enhancedModule as any}
            onComplete={handleCompleteModule}
            onCancel={handleCancel}
            isSubmitting={isCompleting}
          />
        );
      case "guided_reading":
        return (
          <GuidedReadingStep
            module={enhancedModule as any}
            onComplete={handleCompleteModule}
          />
        );
      case "ai_reflection":
        return (
          <AIReflectionStep
            module={enhancedModule as any}
            onComplete={handleCompleteModule}
          />
        );
      case "routine_application":
        return (
          <RoutineApplicationStep
            module={enhancedModule as any}
            onComplete={handleCompleteModule}
          />
        );
      case "validation":
        return (
          <ValidationStep
            module={enhancedModule as any}
            onComplete={handleCompleteModule}
          />
        );
      case "content":
      default:
        return (
          <ContentStep
            module={enhancedModule as any}
            onComplete={handleCompleteModule}
            onCancel={handleCancel}
          />
        );
    }
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-80 shrink-0">
        <JourneySidebar
          journeyName={journey.name}
          progress={journeyProgress?.progressPercent || 0}
          completedTrainings={journeyProgress?.completedTrainings || 0}
          totalTrainings={journeyProgress?.totalTrainings || 0}
          trainings={sidebarTrainings}
          xpReward={journey.bonus_xp}
          coinsReward={journey.bonus_coins}
          hasCertificate={journey.generates_certificate}
          hasInsignia={!!journey.bonus_insignia_id}
          currentModuleId={moduleId}
          onModuleClick={(tid, mid) => {
            navigate(`/app/journeys/${journeyId}/training/${tid}/module/${mid}`);
          }}
        />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="p-0 w-80">
          <JourneySidebar
            journeyName={journey.name}
            progress={journeyProgress?.progressPercent || 0}
            completedTrainings={journeyProgress?.completedTrainings || 0}
            totalTrainings={journeyProgress?.totalTrainings || 0}
            trainings={sidebarTrainings}
            xpReward={journey.bonus_xp}
            coinsReward={journey.bonus_coins}
            hasCertificate={journey.generates_certificate}
            hasInsignia={!!journey.bonus_insignia_id}
            currentModuleId={moduleId}
            onModuleClick={(tid, mid) => {
              navigate(`/app/journeys/${journeyId}/training/${tid}/module/${mid}`);
              setSidebarOpen(false);
            }}
          />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="border-b bg-background px-4 py-3 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </Button>
          
          <Breadcrumb 
            items={buildJourneyBreadcrumbs(
              journey.name, 
              journeyId, 
              training.name, 
              trainingId, 
              currentModule.name
            )} 
            className="flex-1"
          />

          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/app/journeys/${journeyId}`)}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Sair</span>
          </Button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          <motion.div
            key={currentModule.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="h-full"
          >
            {renderStepContent()}
          </motion.div>
        </div>

        {/* Navigation Footer */}
        <div className="border-t bg-background px-4 py-3 flex items-center justify-between gap-4">
          <Button
            variant="ghost"
            onClick={goToPrev}
            disabled={isFirst}
            className="gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Anterior
          </Button>

          <div className="text-sm text-muted-foreground">
            {currentIndex + 1} de {modules.length}
          </div>

          {isModuleCompleted ? (
            <Button
              onClick={goToNext}
              disabled={isLast}
              className="gap-2"
            >
              Próximo
              <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              onClick={handleCompleteModule}
              disabled={isCompleting}
              className="gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              {isCompleting ? "Concluindo..." : "Concluir Módulo"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
