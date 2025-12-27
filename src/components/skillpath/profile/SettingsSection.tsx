/**
 * Componente de Configurações do Usuário
 */

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Settings,
  Bell,
  Volume2,
  Moon,
  Sun,
  Monitor,
  Mail,
  Calendar,
  Globe,
  ChevronRight,
  Flame,
  Gift,
  Zap,
} from "lucide-react";
import { usePreferences } from "@/hooks/usePreferences";
import { useTheme } from "@/hooks/useTheme";
import { useStreak } from "@/hooks/useStreak";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { StreakModal } from "@/components/game/common/StreakModal";

// Recompensas por dia de streak
const STREAK_REWARDS = [
  { day: 1, coins: 10, xp: 5 },
  { day: 2, coins: 15, xp: 10 },
  { day: 3, coins: 25, xp: 15 },
  { day: 4, coins: 35, xp: 20 },
  { day: 5, coins: 50, xp: 30 },
  { day: 6, coins: 75, xp: 40 },
  { day: 7, coins: 100, xp: 50 },
];

export function SettingsSection() {
  const { preferences, isLoading, isSaving, updatePreference } = usePreferences();
  const { isDark, toggleTheme } = useTheme();
  const { streak, canClaimToday, isAtRisk, claimDailyReward, getTodayReward } = useStreak();
  const [streakModalOpen, setStreakModalOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="gameia-card p-4 animate-pulse">
            <div className="h-6 bg-muted rounded w-1/3 mb-2" />
            <div className="h-4 bg-muted rounded w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  const themeOptions = [
    { value: 'system', label: 'Sistema', icon: Monitor },
    { value: 'light', label: 'Claro', icon: Sun },
    { value: 'dark', label: 'Escuro', icon: Moon },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Streak Diário */}
      <div className="gameia-card p-6 bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/30">
        <h3 className="font-display font-bold text-foreground mb-4 flex items-center gap-2">
          <Flame className="w-5 h-5 text-orange-500" />
          Streak Diário
        </h3>
        
        <div className="space-y-4">
          {/* Streak stats */}
          <div className="flex items-center justify-between p-4 bg-background/50 rounded-xl">
            <div className="flex items-center gap-4">
              <motion.div
                className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center"
                animate={{ scale: streak.currentStreak > 0 ? [1, 1.05, 1] : 1 }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <Flame className="w-7 h-7 text-white" />
              </motion.div>
              <div>
                <div className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                  {streak.currentStreak} dias
                </div>
                <div className="text-sm text-muted-foreground">
                  Recorde: {streak.longestStreak} dias
                </div>
              </div>
            </div>
            
            <button
              onClick={() => setStreakModalOpen(true)}
              className="px-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 rounded-lg font-medium text-sm transition-all"
            >
              Ver detalhes
            </button>
          </div>

          {/* Weekly progress mini */}
          <div className="grid grid-cols-7 gap-2">
            {STREAK_REWARDS.map((reward, index) => {
              const isCompleted = index < streak.currentStreak;
              const isCurrent = index === streak.currentStreak;
              const isBonus = index === 6;

              return (
                <div
                  key={index}
                  className={cn(
                    "aspect-square rounded-lg flex flex-col items-center justify-center text-xs font-bold transition-all",
                    isCompleted
                      ? "bg-gradient-to-br from-orange-500 to-red-500 text-white"
                      : isCurrent && canClaimToday
                        ? "bg-orange-500/20 border-2 border-orange-500 text-orange-400"
                        : "bg-muted/30 text-muted-foreground"
                  )}
                >
                  {isCompleted ? "✓" : isBonus ? <Gift className="w-3 h-3" /> : index + 1}
                </div>
              );
            })}
          </div>

          {/* Claim button */}
          {canClaimToday && (
            <motion.button
              onClick={() => setStreakModalOpen(true)}
              className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-bold flex items-center justify-center gap-2"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <Zap className="w-5 h-5" />
              Resgatar: +{getTodayReward().coins} moedas +{getTodayReward().xp} XP
            </motion.button>
          )}

          {isAtRisk && (
            <motion.div
              className="text-center text-sm text-red-400 font-medium"
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              ⚠️ Jogue hoje para não perder seu streak!
            </motion.div>
          )}
        </div>
      </div>

      {/* Aparência */}
      <div className="gameia-card p-6">
        <h3 className="font-display font-bold text-foreground mb-4 flex items-center gap-2">
          <Moon className="w-5 h-5 text-primary" />
          Aparência
        </h3>
        
        <div className="grid grid-cols-3 gap-3">
          {themeOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                updatePreference('dark_mode_preference', option.value as any);
                if (option.value === 'dark' && !isDark) toggleTheme();
                if (option.value === 'light' && isDark) toggleTheme();
              }}
              className={cn(
                "p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2",
                preferences?.dark_mode_preference === option.value
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-primary/50"
              )}
            >
              <option.icon className="w-6 h-6" />
              <span className="text-sm font-medium">{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Notificações */}
      <div className="gameia-card p-6">
        <h3 className="font-display font-bold text-foreground mb-4 flex items-center gap-2">
          <Bell className="w-5 h-5 text-primary" />
          Notificações
        </h3>
        
        <div className="space-y-4">
          <SettingRow
            icon={Bell}
            label="Notificações push"
            description="Receber notificações no navegador"
            checked={preferences?.notifications_enabled ?? true}
            onChange={(val) => updatePreference('notifications_enabled', val)}
            disabled={isSaving}
          />
          <SettingRow
            icon={Mail}
            label="E-mails de atividade"
            description="Receber atualizações por e-mail"
            checked={preferences?.email_notifications ?? true}
            onChange={(val) => updatePreference('email_notifications', val)}
            disabled={isSaving}
          />
          <SettingRow
            icon={Calendar}
            label="Resumo semanal"
            description="Relatório semanal de progresso"
            checked={preferences?.weekly_summary ?? true}
            onChange={(val) => updatePreference('weekly_summary', val)}
            disabled={isSaving}
          />
        </div>
      </div>

      {/* Som */}
      <div className="gameia-card p-6">
        <h3 className="font-display font-bold text-foreground mb-4 flex items-center gap-2">
          <Volume2 className="w-5 h-5 text-primary" />
          Som
        </h3>
        
        <SettingRow
          icon={Volume2}
          label="Efeitos sonoros"
          description="Sons de feedback nos jogos"
          checked={preferences?.sound_enabled ?? true}
          onChange={(val) => updatePreference('sound_enabled', val)}
          disabled={isSaving}
        />
      </div>

      {/* Idioma */}
      <div className="gameia-card p-6">
        <h3 className="font-display font-bold text-foreground mb-4 flex items-center gap-2">
          <Globe className="w-5 h-5 text-primary" />
          Idioma
        </h3>
        
        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🇧🇷</span>
            <div>
              <div className="font-medium text-foreground">Português (Brasil)</div>
              <div className="text-xs text-muted-foreground">Idioma atual</div>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </div>
      </div>

      {/* Streak Modal */}
      <StreakModal
        isOpen={streakModalOpen}
        onClose={() => setStreakModalOpen(false)}
        currentStreak={streak.currentStreak}
        longestStreak={streak.longestStreak}
        canClaim={canClaimToday}
        isAtRisk={isAtRisk}
        onClaim={claimDailyReward}
      />
    </motion.div>
  );
}

interface SettingRowProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}

function SettingRow({ icon: Icon, label, description, checked, onChange, disabled }: SettingRowProps) {
  return (
    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <div>
          <div className="font-medium text-foreground">{label}</div>
          <div className="text-xs text-muted-foreground">{description}</div>
        </div>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} disabled={disabled} />
    </div>
  );
}
