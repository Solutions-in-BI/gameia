/**
 * JourneyPlayerPage - Página de consumo da Jornada
 * Layout 2 colunas estilo Hotmart/Kiwify
 */

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Route, 
  ArrowLeft, 
  Menu,
  Play,
  ChevronRight,
  GraduationCap,
  Clock,
  Star,
  Coins,
  Trophy,
  Award
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useJourneyProgress } from "@/hooks/useJourneyProgress";
import { JourneySidebar } from "@/components/journeys/JourneySidebar";
import { JourneyCompletionScreen } from "@/components/journeys/JourneyCompletionScreen";
import { Breadcrumb, buildJourneyBreadcrumbs } from "@/components/common/Breadcrumb";
import { ContextualGuidanceBar } from "@/components/common/ContextualGuidanceBar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";

interface Journey {
  id: string;
  name: string;
  description: string | null;
  category: string;
  level: string;
  bonus_xp: number;
  bonus_coins: number;
  generates_certificate: boolean;
  bonus_insignia_id: string | null;
  thumbnail_url: string | null;
}

interface TrainingWithModules {
  id: string;
  name: string;
  description: string | null;
  modules: {
    id: string;
    name: string;
    order_index: number;
  }[];
}

export default function JourneyPlayerPage() {
  const { journeyId } = useParams<{ journeyId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { progress, isLoading: progressLoading, startJourney, canAccessTraining } = useJourneyProgress(journeyId);
  
  const [journey, setJourney] = useState<Journey | null>(null);
  const [trainingsWithModules, setTrainingsWithModules] = useState<TrainingWithModules[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);

  // Fetch journey data
  useEffect(() => {
    async function fetchJourney() {
      if (!journeyId) return;

      try {
        // Fetch journey
        const { data: journeyData, error: journeyError } = await supabase
          .from("training_journeys")
          .select("id, name, description, category, level, bonus_xp, bonus_coins, generates_certificate, bonus_insignia_id, thumbnail_url")
          .eq("id", journeyId)
          .maybeSingle();

        if (journeyError) throw journeyError;
        if (!journeyData) {
          setIsLoading(false);
          return;
        }
        setJourney(journeyData);

        // Fetch journey trainings with modules
        const { data: jtData, error: jtError } = await supabase
          .from("journey_trainings")
          .select(`
            training_id,
            order_index,
            trainings (
              id,
              name,
              description,
              training_modules (
                id,
                name,
                order_index
              )
            )
          `)
          .eq("journey_id", journeyId)
          .order("order_index");

        if (jtError) throw jtError;

        const trainings = (jtData || []).map(jt => {
          const training = jt.trainings as any;
          return {
            id: training?.id || jt.training_id,
            name: training?.name || "Treinamento",
            description: training?.description || null,
            modules: (training?.training_modules || [])
              .sort((a: any, b: any) => a.order_index - b.order_index)
              .map((m: any) => ({
                id: m.id,
                name: m.name,
                order_index: m.order_index,
              })),
          };
        });

        setTrainingsWithModules(trainings);
      } catch (err) {
        console.error("Error fetching journey:", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchJourney();
  }, [journeyId]);

  // Check if journey is completed
  useEffect(() => {
    if (progress?.isCompleted) {
      setShowCompletion(true);
    }
  }, [progress?.isCompleted]);

  // Build sidebar trainings data
  const sidebarTrainings = trainingsWithModules.map((training, index) => {
    const progressData = progress?.trainings?.find(t => t.trainingId === training.id);
    
    return {
      id: training.id,
      name: training.name,
      isCompleted: progressData?.isCompleted || false,
      isLocked: progressData?.isLocked || false,
      isCurrent: progressData?.isCurrent || false,
      progress: progressData ? 
        (progressData.completedModules / progressData.modulesCount) * 100 : 0,
      modules: training.modules.map((module, mIndex) => ({
        id: module.id,
        title: module.name,
        isCompleted: false,
        isLocked: mIndex > 0,
        isCurrent: mIndex === 0 && progressData?.isCurrent,
        duration: "5 min",
      })),
    };
  });

  // Handle module click
  const handleModuleClick = (trainingId: string, moduleId: string) => {
    if (canAccessTraining(trainingId)) {
      navigate(`/app/journeys/${journeyId}/training/${trainingId}/module/${moduleId}`);
    }
  };

  // Handle training click
  const handleTrainingClick = (trainingId: string) => {
    if (canAccessTraining(trainingId)) {
      const training = trainingsWithModules.find(t => t.id === trainingId);
      if (training && training.modules.length > 0) {
        navigate(`/app/journeys/${journeyId}/training/${trainingId}/module/${training.modules[0].id}`);
      }
    }
  };

  // Handle start journey
  const handleStartJourney = async () => {
    const success = await startJourney();
    if (success && trainingsWithModules.length > 0 && trainingsWithModules[0].modules.length > 0) {
      const firstTraining = trainingsWithModules[0];
      const firstModule = firstTraining.modules[0];
      navigate(`/app/journeys/${journeyId}/training/${firstTraining.id}/module/${firstModule.id}`);
    }
  };

  // Show completion screen
  if (showCompletion && journey) {
    return (
      <JourneyCompletionScreen
        journeyName={journey.name}
        journeyDescription={journey.description || undefined}
        category={journey.category}
        level={journey.level}
        trainingsCompleted={progress?.completedTrainings || 0}
        totalXpEarned={journey.bonus_xp}
        totalCoinsEarned={journey.bonus_coins}
        rewards={[
          { type: "xp", label: "XP", value: journey.bonus_xp },
          { type: "coins", label: "Moedas", value: journey.bonus_coins },
          ...(journey.generates_certificate ? [{ type: "certificate" as const, label: "Certificado" }] : []),
          ...(journey.bonus_insignia_id ? [{ type: "insignia" as const, label: "Insígnia" }] : []),
        ]}
      />
    );
  }

  // Loading state
  if (isLoading || progressLoading) {
    return (
      <div className="flex h-screen">
        <div className="w-80 border-r p-4 space-y-4 hidden lg:block">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
        <div className="flex-1 p-6">
          <Skeleton className="h-8 w-64 mb-6" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!journey) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center space-y-4">
          <Route className="w-16 h-16 text-muted-foreground mx-auto" />
          <h2 className="text-xl font-semibold">Jornada não encontrada</h2>
          <Button onClick={() => navigate("/app/arena")}>
            Voltar para Arena
          </Button>
        </div>
      </div>
    );
  }

  // Not started - show landing page
  if (!progress?.isStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        {/* Header */}
        <div className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="container max-w-6xl mx-auto px-4 py-4">
            <Breadcrumb items={buildJourneyBreadcrumbs(journey.name, journey.id)} />
          </div>
        </div>

        {/* Hero */}
        <div className="container max-w-4xl mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-6"
          >
            {/* Journey Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary">
              <Route className="w-4 h-4" />
              <span className="text-sm font-medium">Jornada de Treinamento</span>
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold">{journey.name}</h1>
            
            {/* Description */}
            {journey.description && (
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {journey.description}
              </p>
            )}

            {/* Meta */}
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Badge variant="outline" className="gap-1">
                {journey.category}
              </Badge>
              <Badge variant="outline" className="gap-1">
                {journey.level}
              </Badge>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <GraduationCap className="w-4 h-4" />
                {trainingsWithModules.length} treinamentos
              </div>
            </div>

            {/* Rewards */}
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-600">
                <Star className="w-4 h-4" />
                <span className="font-medium">{journey.bonus_xp} XP</span>
              </div>
              <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-yellow-500/10 text-yellow-600">
                <Coins className="w-4 h-4" />
                <span className="font-medium">{journey.bonus_coins} moedas</span>
              </div>
              {journey.generates_certificate && (
                <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-600">
                  <Award className="w-4 h-4" />
                  <span className="font-medium">Certificado</span>
                </div>
              )}
              {journey.bonus_insignia_id && (
                <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-purple-500/10 text-purple-600">
                  <Trophy className="w-4 h-4" />
                  <span className="font-medium">Insígnia</span>
                </div>
              )}
            </div>

            {/* Start Button */}
            <Button size="lg" onClick={handleStartJourney} className="gap-2 mt-4">
              <Play className="w-5 h-5" />
              Iniciar Jornada
            </Button>
          </motion.div>

          {/* Trainings Preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-16 space-y-4"
          >
            <h2 className="text-xl font-semibold text-center">O que você vai aprender</h2>
            
            <div className="space-y-3">
              {trainingsWithModules.map((training, index) => (
                <div
                  key={training.id}
                  className="flex items-center gap-4 p-4 rounded-xl bg-card border"
                >
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted font-semibold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{training.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {training.modules.length} módulos
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Started - show player layout
  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-80 shrink-0">
        <JourneySidebar
          journeyName={journey.name}
          journeyDescription={journey.description || undefined}
          progress={progress?.progressPercent || 0}
          completedTrainings={progress?.completedTrainings || 0}
          totalTrainings={progress?.totalTrainings || 0}
          trainings={sidebarTrainings}
          xpReward={journey.bonus_xp}
          coinsReward={journey.bonus_coins}
          hasCertificate={journey.generates_certificate}
          hasInsignia={!!journey.bonus_insignia_id}
          currentTrainingId={progress?.currentTrainingId || undefined}
          onModuleClick={handleModuleClick}
          onTrainingClick={handleTrainingClick}
        />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="p-0 w-80">
          <JourneySidebar
            journeyName={journey.name}
            journeyDescription={journey.description || undefined}
            progress={progress?.progressPercent || 0}
            completedTrainings={progress?.completedTrainings || 0}
            totalTrainings={progress?.totalTrainings || 0}
            trainings={sidebarTrainings}
            xpReward={journey.bonus_xp}
            coinsReward={journey.bonus_coins}
            hasCertificate={journey.generates_certificate}
            hasInsignia={!!journey.bonus_insignia_id}
            currentTrainingId={progress?.currentTrainingId || undefined}
            onModuleClick={(tid, mid) => {
              handleModuleClick(tid, mid);
              setSidebarOpen(false);
            }}
            onTrainingClick={(tid) => {
              handleTrainingClick(tid);
              setSidebarOpen(false);
            }}
          />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="border-b bg-background px-4 py-3 space-y-2">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>
            
            <Breadcrumb 
              items={buildJourneyBreadcrumbs(journey.name, journey.id)} 
              className="flex-1"
            />

            <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/app/arena")}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Sair</span>
          </Button>
          </div>
          
          {/* Barra de Orientação Contextual */}
          <ContextualGuidanceBar
            context={{
              section: "Desenvolvimento",
              category: "Jornada",
              item: journey.name
            }}
            skillsImpacted={[journey.category]}
            nextStep={progress?.currentTrainingId ? {
              label: "Continuar treinamento atual",
              href: `/app/journeys/${journeyId}/training/${progress.currentTrainingId}/module/first`,
              type: "training" as const,
            } : undefined}
            compact
          />
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-2xl mx-auto text-center space-y-6 py-12">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <Route className="w-8 h-8 text-primary" />
            </div>
            
            <div>
              <h2 className="text-2xl font-bold mb-2">Continue sua jornada</h2>
              <p className="text-muted-foreground">
                Você está em {progress?.progressPercent}% do caminho. 
                Selecione um treinamento na barra lateral para continuar.
              </p>
            </div>

            {progress?.currentTrainingId && (
              <Button
                size="lg"
                onClick={() => {
                  const training = trainingsWithModules.find(t => t.id === progress.currentTrainingId);
                  if (training && training.modules.length > 0) {
                    handleModuleClick(training.id, training.modules[0].id);
                  }
                }}
                className="gap-2"
              >
                <Play className="w-5 h-5" />
                Continuar de onde parou
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
