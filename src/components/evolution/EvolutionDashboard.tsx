/**
 * EvolutionDashboard - Dashboard unificado de evolução
 * Hub inteligente com alertas proativos, status de saúde e CTAs claros
 */

import { motion } from "framer-motion";
import {
  Brain,
  Target,
  Users,
  Calendar,
  TrendingUp,
  Zap,
  Award,
  ArrowRight,
  Sparkles,
  Clock,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  Gamepad2,
  GraduationCap,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useSkillImpact, SourceType } from "@/hooks/useSkillImpact";
import { useSkillProgress } from "@/hooks/useSkillProgress";
import { useEvolutionAlerts } from "@/hooks/useEvolutionAlerts";
import { ContextualAssessmentsPanel } from "./ContextualAssessmentsPanel";
import { EvolutionAlertsPanel } from "./EvolutionAlertsPanel";
import { EvolutionStatusIndicator } from "./EvolutionStatusIndicator";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useNavigate } from "react-router-dom";

export type EvolutionTab = "overview" | "cognitive" | "assessments" | "pdi" | "one-on-one" | "profile" | "commitments";

interface EvolutionDashboardProps {
  onTabChange: (tab: EvolutionTab) => void;
}

// Mapeamento de source_type para labels e ícones
const SOURCE_CONFIG: Record<SourceType, { label: string; icon: typeof Brain; color: string }> = {
  game: { label: "Jogo", icon: Zap, color: "text-yellow-500" },
  cognitive_test: { label: "Teste Mental", icon: Brain, color: "text-purple-500" },
  feedback_360: { label: "Feedback", icon: Users, color: "text-blue-500" },
  pdi_goal: { label: "Meta PDI", icon: Target, color: "text-green-500" },
  one_on_one: { label: "1:1", icon: Calendar, color: "text-orange-500" },
  training: { label: "Treinamento", icon: Award, color: "text-pink-500" },
  challenge: { label: "Desafio", icon: Sparkles, color: "text-cyan-500" },
};

export function EvolutionDashboard({ onTabChange }: EvolutionDashboardProps) {
  const navigate = useNavigate();
  const { suggestions, evolutionTimeline, suggestionsLoading, timelineLoading } = useSkillImpact();
  const { skills, isLoading: skillsLoading } = useSkillProgress();
  const { stats: alertStats, unreadAlerts } = useEvolutionAlerts();

  const isLoading = suggestionsLoading || timelineLoading || skillsLoading;

  // Calcular métricas resumidas
  const pendingActions = suggestions ? (
    (suggestions.pending_tests?.length || 0) +
    (suggestions.pending_feedbacks?.length || 0) +
    (suggestions.pdi_goals_due?.length || 0)
  ) : 0;

  const upcomingMeetings = suggestions?.upcoming_1on1s?.length || 0;
  const weakSkillsCount = suggestions?.weak_skills?.length || 0;

  // Calculate weekly stats
  const weeklyXP = evolutionTimeline?.reduce((sum, e) => 
    e.impact_type === "xp_gain" ? sum + (e.impact_value || 0) : sum, 0) || 0;
  const completedThisWeek = evolutionTimeline?.length || 0;
  const activeStreak = 0; // TODO: get from user_streaks

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-24" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-primary" />
            Minha Evolução
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Acompanhe seu desenvolvimento e tome ações baseadas em dados
          </p>
        </div>
      </div>

      {/* Evolution Status Indicator */}
      <EvolutionStatusIndicator
        activeStreak={activeStreak}
        weeklyXP={weeklyXP}
        pendingActions={pendingActions + alertStats.unread}
        weakSkillsCount={weakSkillsCount}
        completedThisWeek={completedThisWeek}
      />

      {/* Proactive Alerts Panel */}
      <EvolutionAlertsPanel maxAlerts={3} />

      {/* Contextual Assessments Panel */}
      <ContextualAssessmentsPanel />
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <QuickActionCard
          icon={Brain}
          title="Desafios Mentais"
          description="Testes cognitivos"
          gradient="from-purple-500 to-violet-600"
          onClick={() => onTabChange("cognitive")}
        />
        <QuickActionCard
          icon={Users}
          title="Feedback"
          description="Avaliações 360°"
          gradient="from-blue-500 to-cyan-600"
          onClick={() => onTabChange("assessments")}
        />
        <QuickActionCard
          icon={Target}
          title="Trilha PDI"
          description="Metas de evolução"
          gradient="from-green-500 to-emerald-600"
          onClick={() => onTabChange("pdi")}
        />
        <QuickActionCard
          icon={Calendar}
          title="1:1 Meetings"
          description="Check-ins com gestor"
          gradient="from-orange-500 to-amber-600"
          onClick={() => onTabChange("one-on-one")}
        />
        <QuickActionCard
          icon={BarChart3}
          title="Meu Perfil"
          description="Análise cognitiva"
          gradient="from-pink-500 to-rose-600"
          onClick={() => onTabChange("profile")}
        />
      </div>

      {/* KPIs Rápidos */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard
          title="Ações Pendentes"
          value={pendingActions}
          icon={AlertCircle}
          color="text-orange-500"
          description={pendingActions > 0 ? "Requerem sua atenção" : "Tudo em dia!"}
        />
        <KPICard
          title="Próximos 1:1"
          value={upcomingMeetings}
          icon={Calendar}
          color="text-blue-500"
          description="Reuniões agendadas"
        />
        <KPICard
          title="Skills em Foco"
          value={weakSkillsCount}
          icon={Target}
          color="text-purple-500"
          description="Para desenvolver"
        />
        <KPICard
          title="Atividades Recentes"
          value={evolutionTimeline?.length || 0}
          icon={Zap}
          color="text-green-500"
          description="Últimos 30 dias"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Próximos Passos */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Próximos Passos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Testes Pendentes */}
            {suggestions?.pending_tests?.map((test) => (
              <NextStepItem
                key={test.test_id}
                icon={Brain}
                iconColor="text-purple-500"
                title={test.name}
                subtitle={`+${test.xp_reward} XP`}
                type="test"
                onClick={() => onTabChange("cognitive")}
              />
            ))}

            {/* Feedbacks Pendentes */}
            {suggestions?.pending_feedbacks?.map((feedback) => (
              <NextStepItem
                key={feedback.assessment_id}
                icon={Users}
                iconColor="text-blue-500"
                title={`Feedback: ${feedback.cycle_name}`}
                subtitle={feedback.relationship}
                type="feedback"
                onClick={() => onTabChange("assessments")}
              />
            ))}

            {/* Metas PDI */}
            {suggestions?.pdi_goals_due?.map((goal) => (
              <NextStepItem
                key={goal.goal_id}
                icon={Target}
                iconColor="text-green-500"
                title={goal.title}
                subtitle={`${goal.progress}% concluído`}
                type="pdi"
                progress={goal.progress}
                onClick={() => onTabChange("pdi")}
              />
            ))}

            {/* 1:1s */}
            {suggestions?.upcoming_1on1s?.map((meeting) => (
              <NextStepItem
                key={meeting.meeting_id}
                icon={Calendar}
                iconColor="text-orange-500"
                title="Reunião 1:1"
                subtitle={format(new Date(meeting.scheduled_at), "dd/MM 'às' HH:mm", { locale: ptBR })}
                type="1on1"
                onClick={() => onTabChange("one-on-one")}
              />
            ))}

            {pendingActions === 0 && upcomingMeetings === 0 && (
              <div className="text-center py-6 text-muted-foreground">
                <CheckCircle2 className="w-12 h-12 mx-auto mb-2 text-green-500" />
                <p>Tudo em dia! 🎉</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Timeline de Evolução */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Timeline de Evolução
            </CardTitle>
          </CardHeader>
          <CardContent>
            {evolutionTimeline && evolutionTimeline.length > 0 ? (
              <div className="space-y-4">
                {evolutionTimeline.map((event, index) => {
                  const config = SOURCE_CONFIG[event.source_type as SourceType];
                  const Icon = config?.icon || Zap;
                  const skill = event.skill as { name: string; icon: string } | null;

                  return (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-start gap-3 pb-4 border-b border-border last:border-0"
                    >
                      <div className={`p-2 rounded-lg bg-muted ${config?.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-foreground">
                            {config?.label || event.source_type}
                          </span>
                          {skill && (
                            <Badge variant="secondary" className="text-xs">
                              {skill.name}
                            </Badge>
                          )}
                          {event.impact_type === "xp_gain" && (
                            <Badge variant="outline" className="text-xs text-green-600">
                              +{event.impact_value} XP
                            </Badge>
                          )}
                          {event.impact_type === "test_score" && (
                            <Badge variant="outline" className="text-xs text-purple-600">
                              Score: {event.impact_value}%
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(event.created_at), {
                            addSuffix: true,
                            locale: ptBR,
                          })}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Nenhuma atividade recente</p>
                <p className="text-sm">Jogue, complete testes ou dê feedbacks para começar!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Skills em Foco */}
      {suggestions?.weak_skills && suggestions.weak_skills.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Skills para Desenvolver
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {suggestions.weak_skills.map((skill) => (
                <motion.div
                  key={skill.skill_id}
                  whileHover={{ scale: 1.02 }}
                  className="p-4 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{skill.skill_name}</span>
                    <Badge variant="outline">Nível {skill.current_level}</Badge>
                  </div>
                  <Progress value={skill.current_level * 20} className="h-2 mb-3" />
                  {skill.suggested_games?.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {skill.suggested_games.slice(0, 2).map((game, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {game}
                        </Badge>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Componentes auxiliares
function KPICard({
  title,
  value,
  icon: Icon,
  color,
  description,
}: {
  title: string;
  value: number;
  icon: typeof Brain;
  color: string;
  description: string;
}) {
  return (
    <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{title}</p>
              <p className="text-3xl font-bold mt-1">{value}</p>
              <p className="text-xs text-muted-foreground mt-1">{description}</p>
            </div>
            <div className={`p-3 rounded-full bg-muted ${color}`}>
              <Icon className="w-6 h-6" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function NextStepItem({
  icon: Icon,
  iconColor,
  title,
  subtitle,
  type,
  progress,
  onClick,
}: {
  icon: typeof Brain;
  iconColor: string;
  title: string;
  subtitle: string;
  type: string;
  progress?: number;
  onClick?: () => void;
}) {
  return (
    <motion.div
      whileHover={{ x: 4 }}
      onClick={onClick}
      className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer"
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
      <ArrowRight className="w-4 h-4 text-muted-foreground" />
    </motion.div>
  );
}

// Quick action cards for navigation
function QuickActionCard({
  icon: Icon,
  title,
  description,
  gradient,
  onClick,
}: {
  icon: typeof Brain;
  title: string;
  description: string;
  gradient: string;
  onClick: () => void;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="cursor-pointer"
    >
      <Card className={`overflow-hidden border-0 bg-gradient-to-br ${gradient} text-white`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white/20">
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold">{title}</p>
              <p className="text-xs opacity-80">{description}</p>
            </div>
            <ArrowRight className="w-4 h-4 ml-auto opacity-70" />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
