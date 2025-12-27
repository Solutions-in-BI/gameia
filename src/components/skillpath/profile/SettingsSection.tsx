/**
 * Componente de Configurações do Usuário
 */

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
} from "lucide-react";
import { usePreferences } from "@/hooks/usePreferences";
import { useTheme } from "@/hooks/useTheme";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

export function SettingsSection() {
  const { preferences, isLoading, isSaving, updatePreference } = usePreferences();
  const { isDark, toggleTheme } = useTheme();

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
