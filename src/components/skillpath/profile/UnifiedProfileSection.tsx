/**
 * Seção: Perfil Unificado
 * Integra estatísticas de todas as áreas
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  User, 
  Trophy, 
  Award,
  Settings,
  LogOut,
  BarChart3,
  Target,
  Flame,
  Coins,
  Crown,
  Medal,
  TrendingUp
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLevel } from "@/hooks/useLevel";
import { useAchievements } from "@/hooks/useAchievements";
import { useMarketplace } from "@/hooks/useMarketplace";
import { useStreak } from "@/hooks/useStreak";
import { AchievementsList } from "@/components/game/common/AchievementsList";
import { cn } from "@/lib/utils";

type ProfileTab = "overview" | "achievements" | "stats";

export function UnifiedProfileSection() {
  const { profile, user, signOut, isAuthenticated } = useAuth();
  const { level, xp, progress, levelInfo } = useLevel();
  const { getAchievementsWithStatus, getProgress, stats } = useAchievements();
  const { coins } = useMarketplace();
  const { streak } = useStreak();
  const [activeTab, setActiveTab] = useState<ProfileTab>("overview");

  const achievements = getAchievementsWithStatus();
  const progress = getProgress();

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
          <User className="w-10 h-10 text-primary" />
        </div>
        <h2 className="text-2xl font-display font-bold text-foreground mb-2">
          Seu Perfil
        </h2>
        <p className="text-muted-foreground max-w-md mb-6">
          Faça login para acessar seu perfil completo com conquistas e estatísticas.
        </p>
      </div>
    );
  }

  const handleLogout = async () => {
    await signOut();
  };

  const tabs = [
    { id: "overview" as const, label: "Visão Geral", icon: User },
    { id: "achievements" as const, label: "Conquistas", icon: Trophy },
    { id: "stats" as const, label: "Estatísticas", icon: BarChart3 },
  ];

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="skillpath-card p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          {/* Avatar */}
          <div className="relative">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary via-accent to-secondary flex items-center justify-center">
              <span className="text-4xl font-bold text-primary-foreground font-display">
                {profile?.nickname?.charAt(0).toUpperCase() || "?"}
              </span>
            </div>
            <div className="absolute -bottom-2 -right-2 bg-skillpath-warning text-foreground px-3 py-1 rounded-full text-sm font-bold shadow-lg">
              Nv. {level}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground mb-1">
              {profile?.nickname || "Usuário"}
            </h1>
            <p className="text-muted-foreground text-sm mb-4">
              {user?.email}
            </p>

            {/* XP Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Nível {level}</span>
                <span className="text-foreground font-medium">{xp.toLocaleString()} XP</span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 sm:gap-6">
            <QuickStat icon={Coins} value={coins} label="Moedas" color="warning" />
            <QuickStat icon={Flame} value={streak.currentStreak} label="Streak" color="secondary" />
            <QuickStat icon={Trophy} value={progress.unlocked} label="Conquistas" color="primary" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm whitespace-nowrap transition-all",
              activeTab === tab.id
                ? "bg-primary/10 text-primary"
                : "bg-card border border-border text-muted-foreground hover:text-foreground"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Summary Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <SummaryCard 
              icon={Target}
              label="Jogos Jogados"
              value={stats.totalGamesPlayed}
              trend="+5 esta semana"
              color="primary"
            />
            <SummaryCard 
              icon={Award}
              label="Conquistas"
              value={`${progress.unlocked}/${progress.total}`}
              trend={`${progress.percentage}% completo`}
              color="secondary"
            />
            <SummaryCard 
              icon={Flame}
              label="Maior Streak"
              value={streak.longestStreak}
              trend={`Atual: ${streak.currentStreak}`}
              color="warning"
            />
            <SummaryCard 
              icon={TrendingUp}
              label="XP Total"
              value={xp.toLocaleString()}
              trend={`Nível ${level}`}
              color="accent"
            />
          </div>

          {/* Recent Achievements */}
          <div className="skillpath-card p-6">
            <h3 className="font-display font-bold text-foreground mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-skillpath-warning" />
              Conquistas Recentes
            </h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {achievements.filter(a => a.isUnlocked).slice(0, 4).map(achievement => (
                <div 
                  key={achievement.id}
                  className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl"
                >
                  <span className="text-2xl">{achievement.icon}</span>
                  <div>
                    <div className="font-medium text-foreground text-sm">{achievement.name}</div>
                    <div className="text-xs text-muted-foreground">{achievement.description}</div>
                  </div>
                </div>
              ))}
            </div>
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

      {activeTab === "achievements" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Progress */}
          <div className="skillpath-card p-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-muted-foreground">Progresso Geral</span>
              <span className="text-foreground font-semibold">
                {progress.unlocked}/{progress.total}
              </span>
            </div>
            <div className="progress-bar h-3">
              <div 
                className="progress-fill" 
                style={{ width: `${progress.percentage}%` }} 
              />
            </div>
          </div>

          {/* Categories */}
          <AchievementsList
            title="🎮 Geral"
            achievements={achievements.filter(a => a.category === "general")}
          />
          <AchievementsList
            title="🧠 Quiz & Decisões"
            achievements={achievements.filter(a => a.category === "memory")}
          />
        </motion.div>
      )}

      {activeTab === "stats" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <StatDetailCard label="Total de Jogos" value={stats.totalGamesPlayed} />
            <StatDetailCard label="Quiz - Melhor Score" value={stats.memoryGamesPlayed} />
            <StatDetailCard label="Cenários Completados" value={stats.snakeGamesPlayed} />
            <StatDetailCard label="XP Total" value={xp} />
            <StatDetailCard label="Moedas Acumuladas" value={coins} />
            <StatDetailCard label="Dias de Streak" value={streak.longestStreak} />
          </div>
        </motion.div>
      )}
    </div>
  );
}

interface QuickStatProps {
  icon: React.ComponentType<{ className?: string }>;
  value: number;
  label: string;
  color: "primary" | "secondary" | "warning";
}

function QuickStat({ icon: Icon, value, label, color }: QuickStatProps) {
  const colorClasses = {
    primary: "text-primary",
    secondary: "text-secondary",
    warning: "text-skillpath-warning",
  };

  return (
    <div className="text-center">
      <Icon className={cn("w-5 h-5 mx-auto mb-1", colorClasses[color])} />
      <div className="text-xl font-display font-bold text-foreground">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

interface SummaryCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  trend: string;
  color: "primary" | "secondary" | "accent" | "warning";
}

function SummaryCard({ icon: Icon, label, value, trend, color }: SummaryCardProps) {
  const colorClasses = {
    primary: "text-primary bg-primary/10",
    secondary: "text-secondary bg-secondary/10",
    accent: "text-accent bg-accent/10",
    warning: "text-skillpath-warning bg-skillpath-warning/10",
  };

  return (
    <div className="stat-card-skillpath">
      <div className={cn(
        "w-10 h-10 rounded-xl flex items-center justify-center mb-3",
        colorClasses[color]
      )}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="text-2xl font-display font-bold text-foreground">{value}</div>
      <div className="text-xs text-muted-foreground mt-1">{trend}</div>
    </div>
  );
}

interface StatDetailCardProps {
  label: string;
  value: number;
}

function StatDetailCard({ label, value }: StatDetailCardProps) {
  return (
    <div className="stat-card-skillpath">
      <div className="text-sm text-muted-foreground mb-1">{label}</div>
      <div className="text-2xl font-display font-bold text-foreground">
        {value.toLocaleString()}
      </div>
    </div>
  );
}