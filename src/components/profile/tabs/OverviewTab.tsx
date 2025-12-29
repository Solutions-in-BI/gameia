import { useAuth } from "@/hooks/useAuth";
import { useLevel } from "@/hooks/useLevel";
import { useStreak } from "@/hooks/useStreak";
import { useMarketplace } from "@/hooks/useMarketplace";
import { useAchievements } from "@/hooks/useAchievements";
import { useSkillTree } from "@/hooks/useSkillTree";
import { useOrganization } from "@/hooks/useOrganization";
import { useRoles } from "@/hooks/useRoles";
import { useTitles } from "@/hooks/useTitles";
import { AdminQuickLinks } from "../common/AdminQuickLinks";
import { Flame, Target, Star, Zap, Building2 } from "lucide-react";
import { motion } from "framer-motion";
import { ACHIEVEMENTS } from "@/constants/achievements";

export function OverviewTab() {
  const { profile } = useAuth();
  const { streak } = useStreak();
  const { coins } = useMarketplace();
  const { unlockedAchievements } = useAchievements();
  const { skills } = useSkillTree();
  const { currentOrg } = useOrganization();
  const { highestRole } = useRoles();
  const { unlockedTitles } = useTitles();

  const hasAdminAccess = highestRole === "super_admin" || highestRole === "admin" || (highestRole as string) === "owner";

  // Top skills (sorted by XP)
  const topSkills = skills
    .filter(s => s.currentXP > 0)
    .sort((a, b) => b.currentXP - a.currentXP)
    .slice(0, 3);

  // Top achievements (most recent 5)
  const recentAchievements = unlockedAchievements
    .sort((a, b) => new Date(b.unlockedAt || 0).getTime() - new Date(a.unlockedAt || 0).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Admin Quick Links - only show if has access */}
      {hasAdminAccess && <AdminQuickLinks />}

      {/* Skills em Foco */}
      <div className="surface p-5">
        <h3 className="text-sm font-medium text-muted-foreground mb-4 flex items-center gap-2">
          <Target className="h-4 w-4" />
          Skills em Foco
        </h3>
        
        {topSkills.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-3">
            {topSkills.map((skill, index) => (
              <motion.div
                key={skill.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
              >
                <div className="text-2xl">{skill.icon}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{skill.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Nível {skill.level} • {skill.currentXP} XP
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            Jogue para desenvolver suas skills!
          </p>
        )}
      </div>

      {/* Conquistas Recentes */}
      <div className="surface p-5">
        <h3 className="text-sm font-medium text-muted-foreground mb-4 flex items-center gap-2">
          <Star className="h-4 w-4" />
          Insígnias Recentes
        </h3>
        
        {recentAchievements.length > 0 ? (
          <div className="flex flex-wrap gap-3">
            {recentAchievements.map((achievement, index) => {
              const achievementDef = ACHIEVEMENTS.find(a => a.id === achievement.achievementId);
              if (!achievementDef) return null;
              
              return (
                <motion.div
                  key={achievement.achievementId}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/5 border border-primary/10"
                  title={achievementDef.description}
                >
                  <span className="text-xl">{achievementDef.icon}</span>
                  <span className="text-sm font-medium">{achievementDef.name}</span>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            Complete jogos para desbloquear conquistas!
          </p>
        )}
      </div>

      {/* Status Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatusCard 
          icon={<Flame className="h-5 w-5 text-orange-500" />}
          label="Streak Atual"
          value={`${streak.currentStreak} dias`}
          sublabel={`Recorde: ${streak.longestStreak} dias`}
        />
        <StatusCard 
          icon={<Zap className="h-5 w-5 text-yellow-500" />}
          label="Moedas"
          value={coins.toLocaleString()}
          sublabel="Disponíveis para gastar"
        />
        <StatusCard 
          icon={<Star className="h-5 w-5 text-primary" />}
          label="Conquistas"
          value={`${unlockedAchievements.length}/${ACHIEVEMENTS.length}`}
          sublabel="Desbloqueadas"
        />
        <StatusCard 
          icon={<Target className="h-5 w-5 text-secondary" />}
          label="Skills"
          value={skills.filter(s => s.currentXP > 0).length.toString()}
          sublabel="Em desenvolvimento"
        />
      </div>

      {/* Organização */}
      {currentOrg && (
        <div className="surface p-5">
          <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Empresa Vinculada
          </h3>
          <div className="flex items-center gap-3">
            {currentOrg.logo_url && (
              <img 
                src={currentOrg.logo_url} 
                alt={currentOrg.name}
                className="w-10 h-10 rounded-lg object-cover"
              />
            )}
            <div>
              <p className="font-medium">{currentOrg.name}</p>
              {currentOrg.slug && (
                <p className="text-xs text-muted-foreground">@{currentOrg.slug}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusCard({ 
  icon, 
  label, 
  value, 
  sublabel 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: string; 
  sublabel: string;
}) {
  return (
    <div className="surface p-4">
      <div className="flex items-center gap-3 mb-2">
        {icon}
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{sublabel}</p>
    </div>
  );
}
