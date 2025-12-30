/**
 * DevelopmentTab - Tab "Desenvolvimento" do hub
 * Aprendizado estruturado: Jornadas, Treinamentos, Certificados
 * Sub-navegação via sidebar lateral (não mais tabs internas)
 */

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  GraduationCap, 
  Route, 
  Award,
  BookOpen,
  Clock,
  CheckCircle2,
  Play,
  TrendingUp,
} from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { HubHeader, HubCard, HubButton, HubEmptyState } from "../common";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ExperienceCard } from "@/components/arena/ExperienceCard";
import { JourneyCard } from "@/components/arena/JourneyCard";
import { useTrainings } from "@/hooks/useTrainings";
import { useTrainingJourneys } from "@/hooks/useTrainingJourneys";
import { useOrganization } from "@/hooks/useOrganization";

type DevelopmentSubtab = "journeys" | "trainings" | "certificates";

export function DevelopmentTab() {
  const [searchParams] = useSearchParams();
  const subtab = (searchParams.get("tab") as DevelopmentSubtab) || "journeys";
  const { currentOrg } = useOrganization();
  
  // Data hooks
  const { trainings, getTrainingProgress, isLoading: trainingsLoading } = useTrainings(currentOrg?.id);
  const { 
    journeys, 
    userProgress: journeyUserProgress, 
    getCompletionPercentage,
    isLoading: journeysLoading 
  } = useTrainingJourneys(currentOrg?.id);

  // Filter active journeys
  const activeJourneys = journeys.filter(j => j.is_active);
  
  // Get started/in-progress journeys
  const inProgressJourneys = activeJourneys.filter(j => {
    const progress = journeyUserProgress.find(p => p.journey_id === j.id);
    return progress && progress.status === 'in_progress';
  });

  // Get completed trainings count
  const completedTrainings = trainings.filter(t => {
    const progress = getTrainingProgress(t.id);
    return progress?.progress_percent === 100;
  });

  // Mock certificates (would come from DB)
  const certificates = completedTrainings.filter(t => t.certificate_enabled);

  const renderContent = () => {
    switch (subtab) {
      case "journeys":
        return <JourneysSection 
          journeys={activeJourneys}
          inProgressJourneys={inProgressJourneys}
          journeyUserProgress={journeyUserProgress}
          getCompletionPercentage={getCompletionPercentage}
          isLoading={journeysLoading}
        />;
      case "trainings":
        return <TrainingsSection 
          trainings={trainings}
          getTrainingProgress={getTrainingProgress}
          isLoading={trainingsLoading}
        />;
      case "certificates":
        return <CertificatesSection certificates={certificates} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <HubHeader
        title="Desenvolvimento"
        subtitle="Aprendizado estruturado para evoluir suas competências"
        icon={GraduationCap}
      />

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard 
          icon={Route} 
          label="Jornadas" 
          value={activeJourneys.length}
          sublabel={inProgressJourneys.length > 0 ? `${inProgressJourneys.length} em andamento` : undefined}
          color="primary"
        />
        <StatCard 
          icon={GraduationCap} 
          label="Treinamentos" 
          value={trainings.length}
          sublabel={`${completedTrainings.length} concluídos`}
          color="blue"
        />
        <StatCard 
          icon={Award} 
          label="Certificados" 
          value={certificates.length}
          color="amber"
        />
        <StatCard 
          icon={TrendingUp} 
          label="Progresso Geral" 
          value={`${Math.round((completedTrainings.length / Math.max(trainings.length, 1)) * 100)}%`}
          color="emerald"
        />
      </div>

      {/* Content - No more internal subtabs, controlled by sidebar */}
      <div>{renderContent()}</div>
    </div>
  );
}

// Stats Card Component
function StatCard({ 
  icon: Icon, 
  label, 
  value, 
  sublabel,
  color = "primary" 
}: { 
  icon: React.ElementType; 
  label: string; 
  value: string | number;
  sublabel?: string;
  color?: "primary" | "blue" | "amber" | "emerald";
}) {
  const colorClasses = {
    primary: "text-primary bg-primary/10",
    blue: "text-blue-500 bg-blue-500/10",
    amber: "text-amber-500 bg-amber-500/10",
    emerald: "text-emerald-500 bg-emerald-500/10",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <HubCard className="p-4">
        <div className="flex items-center gap-3">
          <div className={cn("p-2 rounded-lg", colorClasses[color])}>
            <Icon className="w-4 h-4" />
          </div>
          <div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
            {sublabel && (
              <p className="text-xs text-muted-foreground/70">{sublabel}</p>
            )}
          </div>
        </div>
      </HubCard>
    </motion.div>
  );
}

// Journeys Section
function JourneysSection({ 
  journeys, 
  inProgressJourneys,
  journeyUserProgress, 
  getCompletionPercentage,
  isLoading 
}: {
  journeys: any[];
  inProgressJourneys: any[];
  journeyUserProgress: any[];
  getCompletionPercentage: (id: string) => number;
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1,2,3].map(i => (
          <div key={i} className="h-48 bg-muted/50 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (journeys.length === 0) {
    return (
      <HubEmptyState
        icon={Route}
        title="Nenhuma jornada disponível"
        description="Novas jornadas de desenvolvimento serão adicionadas em breve"
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* In Progress Journeys Highlight */}
      {inProgressJourneys.length > 0 && (
        <section className="space-y-3">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Play className="w-5 h-5 text-primary" />
            Continuar Jornada
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {inProgressJourneys.slice(0, 2).map((journey, index) => {
              const progress = getCompletionPercentage(journey.id);
              const userProgress = journeyUserProgress.find(p => p.journey_id === journey.id);
              
              return (
                <motion.div
                  key={journey.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <HubCard 
                    className="p-4 border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent cursor-pointer hover:border-primary/40 transition-colors"
                    onClick={() => window.location.href = `/app/journeys/${journey.id}`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold">{journey.name}</h4>
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {journey.description}
                          </p>
                        </div>
                        <Badge variant="secondary" className="shrink-0">
                          {userProgress?.trainings_completed || 0}/{journey.total_trainings} módulos
                        </Badge>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Progresso</span>
                          <span>{Math.round(progress)}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                      
                      <HubButton size="sm" className="w-full">
                        <Play className="w-3 h-3 mr-1" />
                        Continuar
                      </HubButton>
                    </div>
                  </HubCard>
                </motion.div>
              );
            })}
          </div>
        </section>
      )}

      {/* All Journeys */}
      <section className="space-y-3">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Route className="w-5 h-5 text-primary" />
          Todas as Jornadas
          <Badge variant="outline">{journeys.length}</Badge>
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {journeys.map((journey, index) => {
            const progress = getCompletionPercentage(journey.id);
            const userProgress = journeyUserProgress.find(p => p.journey_id === journey.id);
            const isStarted = !!userProgress;
            const isCompleted = userProgress?.status === 'completed';
            
            return (
              <motion.div
                key={journey.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
              >
                <JourneyCard
                  id={journey.id}
                  name={journey.name}
                  description={journey.description || undefined}
                  category={journey.category || "geral"}
                  level={journey.level || "Iniciante"}
                  trainingsCount={journey.total_trainings || 0}
                  completedTrainings={userProgress?.trainings_completed || 0}
                  progress={progress}
                  xpReward={journey.bonus_xp || 0}
                  coinsReward={journey.bonus_coins || 0}
                  hasCertificate={journey.generates_certificate || false}
                  hasInsignia={!!journey.bonus_insignia_id}
                  estimatedHours={journey.total_estimated_hours || undefined}
                  thumbnail={journey.thumbnail_url || undefined}
                  isStarted={isStarted}
                  isCompleted={isCompleted}
                  isFeatured={false}
                  onClick={() => window.location.href = `/app/journeys/${journey.id}`}
                />
              </motion.div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

// Trainings Section
function TrainingsSection({ 
  trainings, 
  getTrainingProgress,
  isLoading 
}: {
  trainings: any[];
  getTrainingProgress: (id: string) => any;
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1,2,3,4,5,6].map(i => (
          <div key={i} className="h-40 bg-muted/50 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (trainings.length === 0) {
    return (
      <HubEmptyState
        icon={GraduationCap}
        title="Nenhum treinamento disponível"
        description="Novos treinamentos serão adicionados em breve"
      />
    );
  }

  // Separate in-progress and available
  const inProgress = trainings.filter(t => {
    const progress = getTrainingProgress(t.id);
    return progress && progress.progress_percent > 0 && progress.progress_percent < 100;
  });

  const available = trainings.filter(t => {
    const progress = getTrainingProgress(t.id);
    return !progress || progress.progress_percent === 0;
  });

  const completed = trainings.filter(t => {
    const progress = getTrainingProgress(t.id);
    return progress?.progress_percent === 100;
  });

  return (
    <div className="space-y-6">
      {/* In Progress */}
      {inProgress.length > 0 && (
        <section className="space-y-3">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-500" />
            Em Andamento
            <Badge variant="secondary">{inProgress.length}</Badge>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {inProgress.map((training, index) => {
              const progress = getTrainingProgress(training.id);
              return (
                <motion.div
                  key={training.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <ExperienceCard
                    id={training.id}
                    type="training"
                    title={training.name}
                    description={training.description || "Desenvolva novas competências"}
                    thumbnail={training.thumbnail_url || undefined}
                    skills={[training.category || "Desenvolvimento"]}
                    duration={training.estimated_hours ? `${training.estimated_hours}h` : undefined}
                    difficulty={(training.difficulty as "easy" | "medium" | "hard") || "medium"}
                    xpReward={training.xp_reward || 100}
                    coinsReward={training.coins_reward || 50}
                    progress={progress?.progress_percent}
                    onClick={() => window.location.href = `/app/trainings/${training.id}`}
                  />
                </motion.div>
              );
            })}
          </div>
        </section>
      )}

      {/* Available */}
      {available.length > 0 && (
        <section className="space-y-3">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-500" />
            Disponíveis
            <Badge variant="outline">{available.length}</Badge>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {available.map((training, index) => (
              <motion.div
                key={training.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
              >
                <ExperienceCard
                  id={training.id}
                  type="training"
                  title={training.name}
                  description={training.description || "Desenvolva novas competências"}
                  thumbnail={training.thumbnail_url || undefined}
                  skills={[training.category || "Desenvolvimento"]}
                  duration={training.estimated_hours ? `${training.estimated_hours}h` : undefined}
                  difficulty={(training.difficulty as "easy" | "medium" | "hard") || "medium"}
                  xpReward={training.xp_reward || 100}
                  coinsReward={training.coins_reward || 50}
                  onClick={() => window.location.href = `/app/trainings/${training.id}`}
                />
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Completed */}
      {completed.length > 0 && (
        <section className="space-y-3">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            Concluídos
            <Badge variant="outline">{completed.length}</Badge>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {completed.map((training, index) => (
              <motion.div
                key={training.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
              >
                <ExperienceCard
                  id={training.id}
                  type="training"
                  title={training.name}
                  description={training.description || "Desenvolva novas competências"}
                  thumbnail={training.thumbnail_url || undefined}
                  skills={[training.category || "Desenvolvimento"]}
                  duration={training.estimated_hours ? `${training.estimated_hours}h` : undefined}
                  difficulty={(training.difficulty as "easy" | "medium" | "hard") || "medium"}
                  xpReward={training.xp_reward || 100}
                  coinsReward={training.coins_reward || 50}
                  isCompleted
                  onClick={() => window.location.href = `/app/trainings/${training.id}`}
                />
              </motion.div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

// Certificates Section
function CertificatesSection({ certificates }: { certificates: any[] }) {
  if (certificates.length === 0) {
    return (
      <HubEmptyState
        icon={Award}
        title="Nenhum certificado obtido"
        description="Complete treinamentos com certificação para obtê-los"
      />
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {certificates.map((cert, index) => (
        <motion.div
          key={cert.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.03 }}
        >
          <HubCard className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-amber-500/10">
                <Award className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <h4 className="font-medium">{cert.name}</h4>
                <p className="text-sm text-muted-foreground">Certificado obtido</p>
              </div>
            </div>
          </HubCard>
        </motion.div>
      ))}
    </div>
  );
}
