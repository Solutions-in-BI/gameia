/**
 * DevelopmentTab - Tab "Desenvolvimento" do hub
 * Aprendizado estruturado: Jornadas, Treinamentos, Certificados
 * Sub-navegação via sidebar lateral (não mais tabs internas)
 */

import { useState, useMemo } from "react";
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
  Search,
  Star,
  Medal,
  Users,
} from "lucide-react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { HubCard, HubButton, HubEmptyState } from "../common";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { ExperienceCard } from "@/components/arena/ExperienceCard";
import { JourneyCard } from "@/components/arena/JourneyCard";
import { CertificateTypeCard } from "@/components/certificates/CertificateTypeCard";
import { CertificateDetailDrawer } from "@/components/certificates/CertificateDetailDrawer";
import { UpcomingCertificates } from "@/components/certificates/UpcomingCertificates";
import { useTrainings } from "@/hooks/useTrainings";
import { useTrainingJourneys } from "@/hooks/useTrainingJourneys";
import { useOrganization } from "@/hooks/useOrganization";
import { useCertificates, type CertificateWithDetails } from "@/hooks/useCertificates";

type DevelopmentSubtab = "journeys" | "trainings" | "certificates";

export function DevelopmentTab() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
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
  const { certificates, stats: certStats, isLoading: certificatesLoading } = useCertificates();

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

  // Navigation handlers
  const handleJourneyClick = (journeyId: string) => {
    navigate(`/app/journeys/${journeyId}`);
  };

  const handleTrainingClick = (trainingId: string) => {
    navigate(`/app/trainings/${trainingId}`);
  };

  const renderContent = () => {
    switch (subtab) {
      case "journeys":
        return <JourneysSection 
          journeys={activeJourneys}
          inProgressJourneys={inProgressJourneys}
          journeyUserProgress={journeyUserProgress}
          getCompletionPercentage={getCompletionPercentage}
          isLoading={journeysLoading}
          onJourneyClick={handleJourneyClick}
        />;
      case "trainings":
        return <TrainingsSection 
          trainings={trainings}
          getTrainingProgress={getTrainingProgress}
          isLoading={trainingsLoading}
          onTrainingClick={handleTrainingClick}
        />;
      case "certificates":
        return <CertificatesSection 
          certificates={certificates} 
          stats={certStats}
          isLoading={certificatesLoading}
        />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
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
          value={certStats.total}
          sublabel={certStats.active > 0 ? `${certStats.active} ativos` : undefined}
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
  isLoading,
  onJourneyClick
}: {
  journeys: any[];
  inProgressJourneys: any[];
  journeyUserProgress: any[];
  getCompletionPercentage: (id: string) => number;
  isLoading: boolean;
  onJourneyClick: (journeyId: string) => void;
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
                    onClick={() => onJourneyClick(journey.id)}
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
                  onClick={() => onJourneyClick(journey.id)}
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
  isLoading,
  onTrainingClick
}: {
  trainings: any[];
  getTrainingProgress: (id: string) => any;
  isLoading: boolean;
  onTrainingClick: (trainingId: string) => void;
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
                    onClick={() => onTrainingClick(training.id)}
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
                  onClick={() => onTrainingClick(training.id)}
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
                  onClick={() => onTrainingClick(training.id)}
                />
              </motion.div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

// Certificates Section - Full engine from CertificatesPage
const CERTIFICATE_TYPES = [
  { value: "all", label: "Todos", icon: Award },
  { value: "training", label: "Treinamento", icon: BookOpen },
  { value: "journey", label: "Jornada", icon: Route },
  { value: "skill", label: "Skill", icon: Star },
  { value: "level", label: "Nível", icon: Medal },
  { value: "behavioral", label: "Comportamental", icon: Users },
];

const STATUS_OPTIONS = [
  { value: "all", label: "Todos os Status" },
  { value: "active", label: "Ativos" },
  { value: "pending_approval", label: "Aguardando Aprovação" },
  { value: "expired", label: "Expirados" },
  { value: "revoked", label: "Revogados" },
];

interface CertificatesSectionProps {
  certificates: CertificateWithDetails[];
  stats: { total: number; active: number; expired: number; byCategory: Record<string, number> };
  isLoading: boolean;
}

function CertificatesSection({ certificates, stats, isLoading }: CertificatesSectionProps) {
  const [selectedCertificate, setSelectedCertificate] = useState<CertificateWithDetails | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Filter certificates
  const filteredCertificates = useMemo(() => {
    if (!certificates) return [];
    
    return certificates.filter(cert => {
      const matchesSearch = searchQuery === "" || 
        (cert.metadata?.certificate_name || cert.training?.name || "").toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesType = typeFilter === "all" || 
        (cert as any).certificate_type === typeFilter ||
        (typeFilter === "training" && !(cert as any).certificate_type);
      
      const matchesStatus = statusFilter === "all" || cert.status === statusFilter;
      
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [certificates, searchQuery, typeFilter, statusFilter]);

  // Group certificates by type
  const certificatesByType = useMemo(() => {
    const grouped: Record<string, CertificateWithDetails[]> = {
      training: [],
      journey: [],
      skill: [],
      level: [],
      behavioral: [],
    };
    
    filteredCertificates.forEach(cert => {
      const type = (cert as any).certificate_type || "training";
      if (grouped[type]) {
        grouped[type].push(cert);
      }
    });
    
    return grouped;
  }, [filteredCertificates]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-24 bg-muted/50 rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-48 bg-muted/50 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Award className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats?.total || 0}</p>
                <p className="text-xs text-muted-foreground">Total de Certificados</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats?.active || 0}</p>
                <p className="text-xs text-muted-foreground">Ativos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Clock className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {certificates?.filter(c => (c as any).status === 'pending_approval').length || 0}
                </p>
                <p className="text-xs text-muted-foreground">Aguardando</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <TrendingUp className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {Object.keys(stats?.byCategory || {}).length}
                </p>
                <p className="text-xs text-muted-foreground">Categorias</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar certificados..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                {CERTIFICATE_TYPES.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center gap-2">
                      <type.icon className="w-4 h-4" />
                      {type.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Certificates by Type Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="bg-muted/50 p-1 flex-wrap h-auto gap-1">
          {CERTIFICATE_TYPES.map(type => {
            const count = type.value === "all" 
              ? filteredCertificates.length 
              : certificatesByType[type.value]?.length || 0;
            
            return (
              <TabsTrigger 
                key={type.value} 
                value={type.value}
                className="flex items-center gap-2 data-[state=active]:bg-background"
              >
                <type.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{type.label}</span>
                <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                  {count}
                </Badge>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {/* All Certificates */}
        <TabsContent value="all" className="space-y-6">
          {/* Próximos Certificados */}
          <UpcomingCertificates />

          {/* Lista de Certificados */}
          {filteredCertificates.length === 0 ? (
            <Card className="p-12 text-center">
              <Award className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="font-semibold text-foreground mb-2">Nenhum certificado encontrado</h3>
              <p className="text-sm text-muted-foreground">
                Complete treinamentos, jornadas e desafios para conquistar certificados
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCertificates.map(cert => (
                <CertificateTypeCard 
                  key={cert.id}
                  certificate={cert}
                  onClick={() => setSelectedCertificate(cert)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Type-specific tabs */}
        {CERTIFICATE_TYPES.filter(t => t.value !== "all").map(type => (
          <TabsContent key={type.value} value={type.value} className="space-y-4">
            {certificatesByType[type.value]?.length === 0 ? (
              <Card className="p-12 text-center">
                <type.icon className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="font-semibold text-foreground mb-2">
                  Nenhum certificado de {type.label.toLowerCase()}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {type.value === "training" && "Complete treinamentos para conquistar certificados"}
                  {type.value === "journey" && "Finalize jornadas completas para certificação"}
                  {type.value === "skill" && "Desenvolva skills específicas para receber certificados"}
                  {type.value === "level" && "Evolua de nível para conquistar certificados"}
                  {type.value === "behavioral" && "Obtenha feedback 360 para certificados comportamentais"}
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {certificatesByType[type.value]?.map(cert => (
                  <CertificateTypeCard 
                    key={cert.id}
                    certificate={cert}
                    onClick={() => setSelectedCertificate(cert)}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Detail Drawer */}
      <CertificateDetailDrawer
        certificate={selectedCertificate}
        isOpen={!!selectedCertificate}
        onClose={() => setSelectedCertificate(null)}
      />
    </motion.div>
  );
}
