/**
 * Seção: Perfil Unificado
 * Integra estatísticas, skills, conquistas - centro completo do usuário
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, 
  Trophy, 
  Award,
  LogOut,
  BarChart3,
  Target,
  Flame,
  Coins,
  Crown,
  Zap,
  Star,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  Lock,
  TrendingUp
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLevel } from "@/hooks/useLevel";
import { useAchievements } from "@/hooks/useAchievements";
import { useMarketplace } from "@/hooks/useMarketplace";
import { useStreak } from "@/hooks/useStreak";
import { useSkillTree } from "@/hooks/useSkillTree";
import { cn } from "@/lib/utils";

type ProfileTab = "overview" | "skills" | "achievements" | "stats";

export function UnifiedProfileSection() {
  const { profile, user, signOut, isAuthenticated } = useAuth();
  const { level, xp, progress: levelProgress, levelInfo } = useLevel();
  const { getAchievementsWithStatus, getProgress, stats } = useAchievements();
  const { coins } = useMarketplace();
  const { streak } = useStreak();
  const { skills } = useSkillTree();
  const [activeTab, setActiveTab] = useState<ProfileTab>("overview");

  const achievements = getAchievementsWithStatus();
  const achievementProgress = getProgress();
  const unlockedSkills = skills.filter((s) => s.isUnlocked);
  const masteredSkills = skills.filter((s) => s.masteryLevel >= 3);

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-6">
          <User className="w-10 h-10 text-primary-foreground" />
        </div>
        <h2 className="text-2xl font-display font-bold text-foreground mb-2">
          Meu Perfil
        </h2>
        <p className="text-muted-foreground max-w-md mb-6">
          Faça login para acessar seu perfil completo com conquistas, skills e estatísticas.
        </p>
      </div>
    );
  }

  const handleLogout = async () => {
    await signOut();
  };

  const tabs = [
    { id: "overview" as const, label: "Visão Geral", icon: BarChart3 },
    { id: "skills" as const, label: "Skills", icon: Target },
    { id: "achievements" as const, label: "Conquistas", icon: Trophy },
    { id: "stats" as const, label: "Estatísticas", icon: TrendingUp },
  ];

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="gameia-card p-6 sm:p-8 overflow-hidden relative">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-primary/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-accent/10 to-transparent rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-6">
            {/* Level Circle */}
            <div className="relative">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary via-accent to-secondary flex items-center justify-center shadow-lg shadow-primary/20">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary-foreground font-display">
                    {level}
                  </div>
                  <div className="text-xs text-primary-foreground/80 font-medium">
                    NÍVEL
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-2 -right-2 px-3 py-1 bg-gameia-warning text-foreground text-xs font-bold rounded-full shadow-lg">
                {levelInfo.icon} {levelInfo.title}
              </div>
            </div>

            {/* Name & XP Progress */}
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground mb-1 truncate">
                {profile?.nickname || "Usuário"}
              </h1>
              <p className="text-muted-foreground text-sm mb-4">
                {user?.email}
              </p>

              {/* XP Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Zap className="w-4 h-4 text-gameia-warning" />
                    Experiência
                  </span>
                  <span className="text-foreground font-semibold">
                    {xp.toLocaleString()} / {levelInfo.xpForNext.toLocaleString()} XP
                  </span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${levelProgress}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <QuickStatBadge icon={Coins} value={coins} label="Moedas" color="warning" />
            <QuickStatBadge icon={Flame} value={streak.currentStreak} label="Streak" color="secondary" />
            <QuickStatBadge icon={Target} value={unlockedSkills.length} label="Skills" color="accent" />
            <QuickStatBadge icon={Trophy} value={achievementProgress.unlocked} label="Conquistas" color="primary" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm whitespace-nowrap transition-all",
              activeTab === tab.id
                ? "bg-primary text-primary-foreground"
                : "bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/50"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === "overview" && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Stats Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                icon={Target}
                label="Jogos Completados"
                value={stats.totalGamesPlayed}
                detail="Total acumulado"
              />
              <StatCard
                icon={Award}
                label="Conquistas"
                value={`${achievementProgress.unlocked}/${achievementProgress.total}`}
                detail={`${achievementProgress.percentage}% completo`}
              />
              <StatCard
                icon={Flame}
                label="Maior Streak"
                value={streak.longestStreak}
                detail={`Atual: ${streak.currentStreak} dias`}
              />
              <StatCard
                icon={Star}
                label="Skills Dominadas"
                value={masteredSkills.length}
                detail={`${unlockedSkills.length} desbloqueadas`}
              />
            </div>

            {/* Recent Skills */}
            <div className="gameia-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-bold text-foreground flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-accent" />
                  Skills Recentes
                </h3>
                <button
                  onClick={() => setActiveTab("skills")}
                  className="text-sm text-primary hover:underline flex items-center gap-1"
                >
                  Ver todas <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {unlockedSkills.length > 0 ? (
                <div className="grid gap-3">
                  {unlockedSkills.slice(0, 4).map((skill, index) => (
                    <SkillProgressItem key={skill.id} skill={skill} index={index} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Complete quizzes e cenários para desbloquear skills</p>
                </div>
              )}
            </div>

            {/* Recent Achievements */}
            <div className="gameia-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-bold text-foreground flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-gameia-warning" />
                  Conquistas Recentes
                </h3>
                <button
                  onClick={() => setActiveTab("achievements")}
                  className="text-sm text-primary hover:underline flex items-center gap-1"
                >
                  Ver todas <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                {achievements.filter(a => a.isUnlocked).slice(0, 4).map(achievement => (
                  <AchievementBadge key={achievement.id} achievement={achievement} />
                ))}
              </div>

              {achievements.filter(a => a.isUnlocked).length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Trophy className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Jogue para desbloquear conquistas!</p>
                </div>
              )}
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-destructive/10 text-destructive font-medium hover:bg-destructive/20 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sair da conta
            </button>
          </motion.div>
        )}

        {activeTab === "skills" && (
          <motion.div
            key="skills"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Skills Progress Bar */}
            <div className="gameia-card p-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-muted-foreground">Progresso em Skills</span>
                <span className="text-foreground font-semibold">
                  {unlockedSkills.length}/{skills.length}
                </span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-accent to-primary rounded-full"
                  style={{ width: `${(unlockedSkills.length / Math.max(skills.length, 1)) * 100}%` }}
                />
              </div>
            </div>

            {/* Skills Grid */}
            <div className="grid gap-4">
              {skills.map((skill, index) => (
                <motion.div
                  key={skill.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    "gameia-card p-4 flex items-center gap-4",
                    !skill.isUnlocked && "opacity-60"
                  )}
                >
                  <div
                    className={cn(
                      "w-14 h-14 rounded-xl flex items-center justify-center text-2xl",
                      skill.isUnlocked
                        ? "bg-gradient-to-br from-primary/20 to-accent/20"
                        : "bg-muted"
                    )}
                  >
                    {skill.isUnlocked ? skill.icon : <Lock className="w-6 h-6 text-muted-foreground" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-foreground truncate">
                        {skill.name}
                      </span>
                      {skill.masteryLevel >= 3 && (
                        <span className="px-2 py-0.5 bg-gameia-warning/20 text-gameia-warning text-xs rounded-full flex items-center gap-1">
                          <Crown className="w-3 h-3" /> Mestre
                        </span>
                      )}
                    </div>
                    {skill.isUnlocked ? (
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${skill.progress}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          Nível {skill.masteryLevel}/5
                        </span>
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        {skill.xp_required} XP necessários para desbloquear
                      </p>
                    )}
                  </div>
                  {skill.isUnlocked && (
                    <CheckCircle2 className="w-5 h-5 text-secondary shrink-0" />
                  )}
                </motion.div>
              ))}

              {skills.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Target className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma skill disponível ainda</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === "achievements" && (
          <motion.div
            key="achievements"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Achievements Progress */}
            <div className="gameia-card p-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-muted-foreground">Progresso Geral</span>
                <span className="text-foreground font-semibold">
                  {achievementProgress.unlocked}/{achievementProgress.total}
                </span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-gameia-warning to-secondary rounded-full"
                  style={{ width: `${achievementProgress.percentage}%` }}
                />
              </div>
            </div>

            {/* Achievements by Category */}
            <AchievementCategory
              title="🎮 Gerais"
              achievements={achievements.filter(a => a.category === "general")}
            />
            <AchievementCategory
              title="🧠 Memória"
              achievements={achievements.filter(a => a.category === "memory")}
            />
            <AchievementCategory
              title="🐍 Snake"
              achievements={achievements.filter(a => a.category === "snake")}
            />
            <AchievementCategory
              title="🦖 Dino"
              achievements={achievements.filter(a => a.category === "dino")}
            />
            <AchievementCategory
              title="🧱 Tetris"
              achievements={achievements.filter(a => a.category === "tetris")}
            />
          </motion.div>
        )}

        {activeTab === "stats" && (
          <motion.div
            key="stats"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <StatDetailCard label="Total de Jogos" value={stats.totalGamesPlayed} />
              <StatDetailCard label="Jogos de Memória" value={stats.memoryGamesPlayed} />
              <StatDetailCard label="Partidas Snake" value={stats.snakeGamesPlayed} />
              <StatDetailCard label="XP Total" value={xp} />
              <StatDetailCard label="Moedas Acumuladas" value={coins} />
              <StatDetailCard label="Dias de Streak" value={streak.longestStreak} />
              <StatDetailCard label="Skills Desbloqueadas" value={unlockedSkills.length} />
              <StatDetailCard label="Skills Dominadas" value={masteredSkills.length} />
              <StatDetailCard label="Conquistas" value={achievementProgress.unlocked} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Sub-components

interface QuickStatBadgeProps {
  icon: React.ComponentType<{ className?: string }>;
  value: number;
  label: string;
  color: "primary" | "secondary" | "accent" | "warning";
}

function QuickStatBadge({ icon: Icon, value, label, color }: QuickStatBadgeProps) {
  const colorClasses = {
    primary: "from-primary/20 to-primary/5 text-primary",
    secondary: "from-secondary/20 to-secondary/5 text-secondary",
    accent: "from-accent/20 to-accent/5 text-accent",
    warning: "from-gameia-warning/20 to-gameia-warning/5 text-gameia-warning",
  };

  return (
    <div className={cn(
      "p-4 rounded-xl bg-gradient-to-br transition-transform hover:scale-105",
      colorClasses[color]
    )}>
      <Icon className="w-5 h-5 mb-2" />
      <div className="text-2xl font-display font-bold text-foreground">
        {value.toLocaleString()}
      </div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  detail: string;
}

function StatCard({ icon: Icon, label, value, detail }: StatCardProps) {
  return (
    <div className="stat-card-gameia">
      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="text-2xl font-display font-bold text-foreground">{value}</div>
      <div className="text-xs text-muted-foreground mt-1">{detail}</div>
    </div>
  );
}

interface SkillProgressItemProps {
  skill: {
    id: string;
    name: string;
    icon: string;
    progress: number;
    masteryLevel: number;
  };
  index: number;
}

function SkillProgressItem({ skill, index }: SkillProgressItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="flex items-center gap-4 p-3 bg-muted/30 rounded-xl"
    >
      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl">
        {skill.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-semibold text-foreground text-sm truncate">
            {skill.name}
          </span>
          {skill.masteryLevel >= 3 && (
            <Crown className="w-4 h-4 text-gameia-warning" />
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full"
              style={{ width: `${skill.progress}%` }}
            />
          </div>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {skill.masteryLevel}/5
          </span>
        </div>
      </div>
    </motion.div>
  );
}

interface AchievementBadgeProps {
  achievement: {
    id: string;
    name: string;
    description: string;
    icon: string;
    isUnlocked: boolean;
  };
}

function AchievementBadge({ achievement }: AchievementBadgeProps) {
  return (
    <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl">
      <span className="text-2xl">{achievement.icon}</span>
      <div className="min-w-0">
        <div className="font-medium text-foreground text-sm truncate">
          {achievement.name}
        </div>
        <div className="text-xs text-muted-foreground truncate">
          {achievement.description}
        </div>
      </div>
    </div>
  );
}

interface AchievementCategoryProps {
  title: string;
  achievements: Array<{
    id: string;
    name: string;
    description: string;
    icon: string;
    isUnlocked: boolean;
  }>;
}

function AchievementCategory({ title, achievements }: AchievementCategoryProps) {
  if (achievements.length === 0) return null;

  const unlocked = achievements.filter(a => a.isUnlocked).length;

  return (
    <div className="gameia-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-bold text-foreground">{title}</h3>
        <span className="text-sm text-muted-foreground">
          {unlocked}/{achievements.length}
        </span>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        {achievements.map(achievement => (
          <div
            key={achievement.id}
            className={cn(
              "flex items-center gap-3 p-3 rounded-xl transition-all",
              achievement.isUnlocked
                ? "bg-muted/30"
                : "bg-muted/10 opacity-50"
            )}
          >
            <span className={cn("text-2xl", !achievement.isUnlocked && "grayscale")}>
              {achievement.icon}
            </span>
            <div className="min-w-0">
              <div className="font-medium text-foreground text-sm truncate">
                {achievement.name}
              </div>
              <div className="text-xs text-muted-foreground truncate">
                {achievement.description}
              </div>
            </div>
            {achievement.isUnlocked && (
              <CheckCircle2 className="w-4 h-4 text-secondary shrink-0 ml-auto" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

interface StatDetailCardProps {
  label: string;
  value: number;
}

function StatDetailCard({ label, value }: StatDetailCardProps) {
  return (
    <div className="stat-card-gameia">
      <div className="text-sm text-muted-foreground mb-1">{label}</div>
      <div className="text-2xl font-display font-bold text-foreground">
        {value.toLocaleString()}
      </div>
    </div>
  );
}
