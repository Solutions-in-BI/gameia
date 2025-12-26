/**
 * Seção: Currículo Vivo
 * Perfil profissional que evolui com competências demonstradas
 */

import { motion } from "framer-motion";
import { 
  FileUser, 
  Trophy, 
  TrendingUp, 
  Award,
  Star,
  Target,
  Briefcase,
  GraduationCap,
  Zap
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLevel } from "@/hooks/useLevel";
import { useAchievements } from "@/hooks/useAchievements";
import { useSkillTree } from "@/hooks/useSkillTree";

export function CurriculumSection() {
  const { profile, isAuthenticated } = useAuth();
  const { level, xp, progress: levelProgress, levelInfo } = useLevel();
  const { getProgress } = useAchievements();
  const { skills } = useSkillTree();

  const achievementProgress = getProgress();
  const unlockedSkills = skills.filter(s => s.isUnlocked).length;
  const masteredSkills = skills.filter(s => s.masteryLevel >= 3).length;

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
          <FileUser className="w-10 h-10 text-primary" />
        </div>
        <h2 className="text-2xl font-display font-bold text-foreground mb-2">
          Seu Currículo Vivo
        </h2>
        <p className="text-muted-foreground max-w-md mb-6">
          Faça login para visualizar seu perfil profissional que evolui com suas conquistas e competências demonstradas.
        </p>
        <button className="btn-primary-gameia">
          Criar minha conta
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header do Currículo */}
      <div className="gameia-card p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          {/* Avatar e Nível */}
          <div className="relative">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center level-ring">
              <span className="text-4xl font-bold text-primary-foreground font-display">
                {profile?.nickname?.charAt(0).toUpperCase() || "?"}
              </span>
            </div>
            <div className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-bold">
              Nv. {level}
            </div>
          </div>

          {/* Info Principal */}
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground mb-1">
              {profile?.nickname || "Profissional"}
            </h1>
            <p className="text-muted-foreground mb-4">
              Membro desde {new Date(profile?.created_at || Date.now()).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
            </p>

            {/* Barra de XP */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Experiência</span>
                <span className="text-foreground font-medium">{xp.toLocaleString()} XP</span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${levelProgress}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid de Métricas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
          icon={Zap}
          label="XP Total"
          value={xp.toLocaleString()}
          color="primary"
        />
        <MetricCard 
          icon={Award}
          label="Conquistas"
          value={`${achievementProgress.unlocked}/${achievementProgress.total}`}
          color="secondary"
        />
        <MetricCard 
          icon={Target}
          label="Skills Ativas"
          value={unlockedSkills}
          color="accent"
        />
        <MetricCard 
          icon={Star}
          label="Dominadas"
          value={masteredSkills}
          color="warning"
        />
      </div>

      {/* Competências Destacadas */}
      <div className="gameia-card p-6">
        <h3 className="text-lg font-display font-bold text-foreground mb-4 flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-primary" />
          Competências Demonstradas
        </h3>

        <div className="grid gap-4">
          {skills.filter(s => s.isUnlocked).slice(0, 4).map((skill, index) => (
            <motion.div
              key={skill.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-4 p-4 bg-muted/30 rounded-xl"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl">
                {skill.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-foreground truncate">{skill.name}</span>
                  {skill.masteryLevel >= 3 && (
                    <span className="px-2 py-0.5 bg-secondary/20 text-secondary text-xs rounded-full">
                      Mestre
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full transition-all duration-500"
                      style={{ width: `${skill.progress}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    Nível {skill.masteryLevel}/5
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {skills.filter(s => s.isUnlocked).length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p>Complete quizzes e cenários para desbloquear competências</p>
          </div>
        )}
      </div>

      {/* Histórico de Evolução */}
      <div className="gameia-card p-6">
        <h3 className="text-lg font-display font-bold text-foreground mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-secondary" />
          Evolução Recente
        </h3>

        <div className="space-y-3">
          <TimelineItem 
            icon="🎯"
            title="Skill de Marketing desbloqueada"
            description="Completou 5 cenários de decisão"
            time="Hoje"
          />
          <TimelineItem 
            icon="🏆"
            title="Conquista: Estudante Dedicado"
            description="10 dias consecutivos de atividade"
            time="Ontem"
          />
          <TimelineItem 
            icon="⬆️"
            title={`Subiu para Nível ${level}`}
            description={`${xp.toLocaleString()} XP acumulados`}
            time="3 dias atrás"
          />
        </div>
      </div>
    </div>
  );
}

interface MetricCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  color: "primary" | "secondary" | "accent" | "warning";
}

function MetricCard({ icon: Icon, label, value, color }: MetricCardProps) {
  const colorClasses = {
    primary: "text-primary bg-primary/10",
    secondary: "text-secondary bg-secondary/10",
    accent: "text-accent bg-accent/10",
    warning: "text-gameia-warning bg-gameia-warning/10",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="stat-card-gameia"
    >
      <div className={`w-10 h-10 rounded-xl ${colorClasses[color]} flex items-center justify-center mb-3`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="text-2xl font-display font-bold text-foreground">{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </motion.div>
  );
}

interface TimelineItemProps {
  icon: string;
  title: string;
  description: string;
  time: string;
}

function TimelineItem({ icon, title, description, time }: TimelineItemProps) {
  return (
    <div className="flex items-start gap-4 p-3 rounded-xl hover:bg-muted/30 transition-colors">
      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-lg shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-foreground text-sm">{title}</div>
        <div className="text-xs text-muted-foreground">{description}</div>
      </div>
      <div className="text-xs text-muted-foreground whitespace-nowrap">{time}</div>
    </div>
  );
}