/**
 * HubOverview - Tab "Visão Geral" do hub
 * Quick actions, summary cards, missions, goals, timeline
 */

import { useState } from "react";
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
} from "lucide-react";
import { HubCard, HubCardHeader, HubStat, HubEmptyState, HubButton, HubHeader } from "./common";
import { DailyMissionsCard, MonthlyGoalsCard } from "./overview";
import { useStreak } from "@/hooks/useStreak";
import { useLevel } from "@/hooks/useLevel";
import { useSkillProgress } from "@/hooks/useSkillProgress";
import { useSkillImpact, SourceType } from "@/hooks/useSkillImpact";
import { useTrails } from "@/hooks/useTrails";
import { useDailyMissions } from "@/hooks/useDailyMissions";
import { useInsignias } from "@/hooks/useInsignias";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { HubTab } from "./HubLayout";

interface HubOverviewProps {
  onNavigate: (tab: HubTab) => void;
}

const SOURCE_CONFIG: Record<SourceType, { label: string; icon: typeof Brain; color: string }> = {
  game: { label: "Jogo", icon: Zap, color: "text-yellow-500" },
  cognitive_test: { label: "Teste Mental", icon: Brain, color: "text-purple-500" },
  feedback_360: { label: "Feedback", icon: Users, color: "text-blue-500" },
  pdi_goal: { label: "Meta PDI", icon: Target, color: "text-green-500" },
  one_on_one: { label: "1:1", icon: Calendar, color: "text-orange-500" },
  training: { label: "Treinamento", icon: Award, color: "text-pink-500" },
  challenge: { label: "Desafio", icon: Sparkles, color: "text-cyan-500" },
};

export function HubOverview({ onNavigate }: HubOverviewProps) {
  const { streak } = useStreak();
  const { level, progress } = useLevel();
  const { skills } = useSkillProgress();
  const { suggestions, evolutionTimeline } = useSkillImpact();
  const { getOverallStats } = useTrails();
  const { completedCount, totalCount } = useDailyMissions();
  const { insignias } = useInsignias();

  const trailStats = getOverallStats();
  
  // Find skill with highest level as "skill em foco"
  const topSkill = skills.length > 0 ? skills[0] : null;
  
  // Insignias stats
  const unlockedInsignias = insignias.filter(i => i.isUnlocked).length;

  // Pending actions count
  const pendingActions = suggestions ? (
    (suggestions.pending_tests?.length || 0) +
    (suggestions.pending_feedbacks?.length || 0) +
    (suggestions.pdi_goals_due?.length || 0)
  ) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <HubHeader
        title="Painel"
        subtitle="Seu hub de desenvolvimento e jogos"
        icon={Sparkles}
      />

      {/* Summary Cards - Always visible */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <HubStat
          label="Missões Hoje"
          value={`${completedCount}/${totalCount}`}
          icon={ListChecks}
          iconColor="text-green-500"
          onClick={() => {}}
        />
        <HubStat
          label="Streak Atual"
          value={`${streak.currentStreak} dias`}
          icon={Flame}
          iconColor="text-orange-500"
          onClick={() => {}}
        />
        <HubStat
          label="Insígnias"
          value={`${unlockedInsignias}/${insignias.length}`}
          icon={Award}
          iconColor="text-purple-500"
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

      {/* Quick Actions */}
      <HubCard>
        <HubCardHeader title="Ações Rápidas" description="Continue de onde parou" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <QuickActionButton
            icon={Play}
            label="Continuar"
            description="Retomar último jogo"
            gradient="from-primary to-primary-glow"
            onClick={() => onNavigate("arena")}
          />
          <QuickActionButton
            icon={TrendingUp}
            label="Ver Evolução"
            description="Seu progresso de skills"
            gradient="from-secondary to-gameia-teal"
            onClick={() => onNavigate("evolution")}
          />
          <QuickActionButton
            icon={Target}
            label="Definir Meta"
            description="Meta do mês"
            gradient="from-accent to-gameia-purple"
            onClick={() => onNavigate("caminho")}
          />
        </div>
      </HubCard>

      {/* Missions and Goals Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DailyMissionsCard />
        <MonthlyGoalsCard />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Próximos Passos */}
        <div className="lg:col-span-2">
          <HubCard className="h-full">
            <HubCardHeader 
              title="Próximos Passos" 
              description={pendingActions > 0 ? `${pendingActions} ações pendentes` : "Tudo em dia!"}
              action={
                <Badge variant="outline" className="text-xs">
                  {pendingActions}
                </Badge>
              }
            />
            <div className="space-y-3">
              {/* Testes Pendentes */}
              {suggestions?.pending_tests?.slice(0, 2).map((test) => (
                <NextStepItem
                  key={test.test_id}
                  icon={Brain}
                  iconColor="text-purple-500"
                  title={test.name}
                  subtitle={`+${test.xp_reward} XP`}
                  onClick={() => onNavigate("evolution")}
                />
              ))}

              {/* Feedbacks Pendentes */}
              {suggestions?.pending_feedbacks?.slice(0, 2).map((feedback) => (
                <NextStepItem
                  key={feedback.assessment_id}
                  icon={Users}
                  iconColor="text-blue-500"
                  title={`Feedback: ${feedback.cycle_name}`}
                  subtitle={feedback.relationship}
                  onClick={() => onNavigate("evolution")}
                />
              ))}

              {/* Metas PDI */}
              {suggestions?.pdi_goals_due?.slice(0, 2).map((goal) => (
                <NextStepItem
                  key={goal.goal_id}
                  icon={Target}
                  iconColor="text-green-500"
                  title={goal.title}
                  subtitle={`${goal.progress}% concluído`}
                  progress={goal.progress}
                  onClick={() => onNavigate("evolution")}
                />
              ))}

              {pendingActions === 0 && (
                <div className="text-center py-6 text-muted-foreground">
                  <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-gameia-success" />
                  <p className="font-medium">Tudo em dia!</p>
                  <p className="text-sm">Continue jogando para evoluir</p>
                </div>
              )}
            </div>
          </HubCard>
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
