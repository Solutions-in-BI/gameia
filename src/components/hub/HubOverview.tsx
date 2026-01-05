/**
 * HubOverview - Tab "Início" do hub
 * Recomendação principal única + resumo rápido
 */

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  Play,
  TrendingUp,
  Target,
  Flame,
  Award,
  Zap,
  Clock,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Calendar,
  Users,
  Brain,
  ListChecks,
  ChevronRight,
  Route,
  GraduationCap,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { HubCard, HubCardHeader, HubStat, HubEmptyState, HubButton, HubHeader } from "./common";
import { DailyMissionsCard, MonthlyGoalsCard, RecommendationsCarousel, RecommendationItem } from "./overview";
import { RewardBadge } from "@/components/rewards/RewardBadge";
import { NextStepsPanel } from "@/components/next-steps/NextStepsPanel";
import { useStreak } from "@/hooks/useStreak";
import { useLevel } from "@/hooks/useLevel";
import { useSkillProgress } from "@/hooks/useSkillProgress";
import { useSkillImpact, SourceType } from "@/hooks/useSkillImpact";
import { useTrails } from "@/hooks/useTrails";
import { useDailyMissions } from "@/hooks/useDailyMissions";
import { useInsignias } from "@/hooks/useInsignias";
import { useTrainings } from "@/hooks/useTrainings";
import { useCognitiveTests } from "@/hooks/useCognitiveTests";
import { useTrainingJourneys } from "@/hooks/useTrainingJourneys";
import { useOrganization } from "@/hooks/useOrganization";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface HubOverviewProps {
  onNavigate: (tab: string) => void;
}

const SOURCE_CONFIG: Record<SourceType, { label: string; icon: typeof Brain; color: string }> = {
  game: { label: "Jogo", icon: Zap, color: "text-primary" },
  cognitive_test: { label: "Teste Mental", icon: Brain, color: "text-secondary-foreground" },
  feedback_360: { label: "Feedback", icon: Users, color: "text-gameia-info" },
  pdi_goal: { label: "Meta PDI", icon: Target, color: "text-gameia-success" },
  one_on_one: { label: "1:1", icon: Calendar, color: "text-accent" },
  training: { label: "Treinamento", icon: Award, color: "text-primary" },
  challenge: { label: "Desafio", icon: Sparkles, color: "text-gameia-teal" },
};

export function HubOverview({ onNavigate }: HubOverviewProps) {
  const navigate = useNavigate();
  const { streak } = useStreak();
  const { level, progress } = useLevel();
  const { skills } = useSkillProgress();
  const { suggestions, evolutionTimeline } = useSkillImpact();
  const { getOverallStats } = useTrails();
  const { completedCount, totalCount } = useDailyMissions();
  const { insignias } = useInsignias();
  const { trainings, getInProgressTrainings } = useTrainings();
  const { tests, mySessions } = useCognitiveTests();
  const { currentOrg } = useOrganization();
  const { journeys, userProgress: journeyUserProgress, getCompletionPercentage } = useTrainingJourneys(currentOrg?.id);

  const trailStats = getOverallStats();
  
  // Find skill with highest level as "skill em foco"
  const topSkill = skills.length > 0 ? skills[0] : null;
  // Find skill with lowest level as "skill a desenvolver"
  const weakestSkill = skills.length > 0 ? skills[skills.length - 1] : null;
  
  // Insignias stats
  const unlockedInsignias = insignias.filter(i => i.isUnlocked).length;

  // Get in-progress training
  const inProgressTrainings = getInProgressTrainings();
  const continueTraining = inProgressTrainings[0];

  // Get in-progress journey
  const inProgressJourneys = journeys.filter(j => {
    const progress = journeyUserProgress.find(p => p.journey_id === j.id);
    return progress && progress.status === 'in_progress';
  });
  const continueJourney = inProgressJourneys[0];

  // Pending actions count
  const pendingActions = suggestions ? (
    (suggestions.pending_tests?.length || 0) +
    (suggestions.pending_feedbacks?.length || 0) +
    (suggestions.pdi_goals_due?.length || 0)
  ) : 0;

  // Build MULTIPLE recommendations for carousel
  const recommendations = useMemo(() => {
    const items: RecommendationItem[] = [];

    // 1. In-progress journey
    if (continueJourney) {
      const prog = getCompletionPercentage(continueJourney.id);
      const userProg = journeyUserProgress.find(p => p.journey_id === continueJourney.id);
      items.push({
        id: `journey-${continueJourney.id}`,
        type: "journey",
        title: continueJourney.name,
        subtitle: `${userProg?.trainings_completed || 0}/${continueJourney.total_trainings} módulos`,
        description: continueJourney.description || undefined,
        reason: "Continue de onde parou",
        progress: prog,
        reward: {
          xp: continueJourney.bonus_xp || 500,
          coins: continueJourney.bonus_coins || 100,
          certificate: continueJourney.generates_certificate,
        },
        skills: [continueJourney.category],
        thumbnail: continueJourney.thumbnail_url || undefined,
        onClick: () => navigate(`/app/journeys/${continueJourney.id}`),
      });
    }

    // 2. In-progress training
    if (continueTraining) {
      items.push({
        id: `training-${continueTraining.id}`,
        type: "training",
        title: continueTraining.name,
        subtitle: "Treinamento em andamento",
        description: continueTraining.description || undefined,
        reason: "Continue seu aprendizado",
        progress: 30,
        reward: {
          xp: continueTraining.xp_reward || 100,
          coins: continueTraining.coins_reward || 50,
        },
        skills: [continueTraining.category],
        thumbnail: continueTraining.thumbnail_url || undefined,
        onClick: () => navigate(`/app/trainings/${continueTraining.id}`),
      });
    }

    // 3. Pending cognitive tests (up to 2)
    const pendingTests = tests.filter(t => 
      !mySessions.some(s => s.test_id === t.id && s.status === "completed")
    ).slice(0, 2);
    
    pendingTests.forEach(test => {
      items.push({
        id: `test-${test.id}`,
        type: "test",
        title: test.name,
        subtitle: "Teste Cognitivo Recomendado",
        description: test.description || "Avalie suas habilidades cognitivas",
        reason: "Descubra seu potencial",
        reward: {
          xp: test.xp_reward || 100,
        },
        skills: [test.test_type],
        onClick: () => onNavigate("arena"),
      });
    });

    // 4. Available journeys (up to 2)
    const availableJourneys = journeys
      .filter(j => j.is_active && !inProgressJourneys.some(ip => ip.id === j.id))
      .slice(0, 2);
    
    availableJourneys.forEach(journey => {
      items.push({
        id: `new-journey-${journey.id}`,
        type: "journey",
        title: journey.name,
        subtitle: `${journey.total_trainings} módulos`,
        description: journey.description || undefined,
        reason: "Comece uma nova jornada",
        reward: {
          xp: journey.bonus_xp || 500,
          coins: journey.bonus_coins || 100,
          certificate: journey.generates_certificate,
        },
        skills: [journey.category],
        thumbnail: journey.thumbnail_url || undefined,
        onClick: () => navigate(`/app/journeys/${journey.id}`),
      });
    });

    // 5. Fallback: Arena games
    if (items.length < 2) {
      items.push({
        id: "arena-fallback",
        type: "game",
        title: "Explore a Arena",
        subtitle: "Jogos que desenvolvem skills",
        description: "Pratique com jogos e testes que evoluem suas competências",
        reason: "Ganhe XP jogando",
        reward: { xp: 50 },
        onClick: () => onNavigate("arena"),
      });
    }

    return items.slice(0, 5); // Max 5 items
  }, [continueJourney, continueTraining, tests, mySessions, journeys, inProgressJourneys, journeyUserProgress, getCompletionPercentage, navigate, onNavigate]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <HubHeader
        title="Início"
        subtitle="Seu próximo passo para evoluir"
        icon={Sparkles}
      />

      {/* Summary Cards - Always visible */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <HubStat
          label="Missões Hoje"
          value={`${completedCount}/${totalCount}`}
          icon={ListChecks}
          iconColor="text-gameia-success"
          onClick={() => {}}
        />
        <HubStat
          label="Streak Atual"
          value={`${streak.currentStreak} dias`}
          icon={Flame}
          iconColor="text-accent"
          onClick={() => {}}
        />
        <HubStat
          label="Insígnias"
          value={`${unlockedInsignias}/${insignias.length}`}
          icon={Award}
          iconColor="text-secondary-foreground"
          onClick={() => onNavigate("evolution")}
        />
        <HubStat
          label="Skill em Foco"
          value={topSkill?.name || "—"}
          icon={Target}
          iconColor="text-primary"
          onClick={() => onNavigate("evolution")}
        />
      </div>

      {/* RECOMMENDATIONS CAROUSEL */}
      <RecommendationsCarousel recommendations={recommendations} />

      {/* Missions and Goals Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DailyMissionsCard />
        <MonthlyGoalsCard />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Próximos Passos - Using new integrated panel */}
        <div className="lg:col-span-2">
          <NextStepsPanel maxItems={5} />
        </div>

        {/* Timeline Recente */}
        <div className="lg:col-span-3">
          <HubCard className="h-full">
            <HubCardHeader 
              title="Atividade Recente" 
              description="Últimas ações que impactaram suas skills"
              action={
                <HubButton 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => onNavigate("evolution")}
                  rightIcon={<ArrowRight className="w-3 h-3" />}
                >
                  Ver tudo
                </HubButton>
              }
            />
            {evolutionTimeline && evolutionTimeline.length > 0 ? (
              <div className="space-y-3">
                {evolutionTimeline.slice(0, 5).map((event, index) => {
                  const config = SOURCE_CONFIG[event.source_type as SourceType];
                  const Icon = config?.icon || Zap;
                  const skill = event.skill as { name: string; icon: string } | null;

                  return (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center gap-3 p-3 rounded-lg border border-border/30 bg-muted/30"
                    >
                      <div className={`p-2 rounded-lg bg-background ${config?.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-sm text-foreground">
                            {config?.label || event.source_type}
                          </span>
                          {skill && (
                            <Badge variant="secondary" className="text-xs">
                              {skill.name}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(event.created_at), {
                            addSuffix: true,
                            locale: ptBR,
                          })}
                        </p>
                      </div>
                      {event.impact_value > 0 && (
                        <Badge variant="outline" className="text-xs text-gameia-success">
                          +{event.impact_value} XP
                        </Badge>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <HubEmptyState
                icon={Clock}
                title="Nenhuma atividade ainda"
                description="Jogue, complete testes ou dê feedbacks para começar!"
                actionLabel="Ir para Arena"
                onAction={() => onNavigate("arena")}
              />
            )}
          </HubCard>
        </div>
      </div>
    </div>
  );
}

// Quick Action Button
function QuickActionButton({
  icon: Icon,
  label,
  description,
  gradient,
  onClick,
}: {
  icon: typeof Play;
  label: string;
  description: string;
  gradient: string;
  onClick: () => void;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`relative overflow-hidden rounded-xl p-4 text-left bg-gradient-to-br ${gradient} text-primary-foreground`}
    >
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-white/20">
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="font-semibold">{label}</p>
          <p className="text-xs opacity-80">{description}</p>
        </div>
      </div>
    </motion.button>
  );
}

// Next Step Item
function NextStepItem({
  icon: Icon,
  iconColor,
  title,
  subtitle,
  progress,
  onClick,
}: {
  icon: typeof Brain;
  iconColor: string;
  title: string;
  subtitle: string;
  progress?: number;
  onClick?: () => void;
}) {
  return (
    <motion.div
      whileHover={{ x: 4 }}
      onClick={onClick}
      className="flex items-center gap-3 p-3 rounded-lg border border-border/30 hover:bg-muted/30 transition-colors cursor-pointer"
    >
      <div className={`p-2 rounded-lg bg-muted ${iconColor}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{title}</p>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
        {progress !== undefined && (
          <Progress value={progress} className="h-1 mt-1" />
        )}
      </div>
      <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
    </motion.div>
  );
}
