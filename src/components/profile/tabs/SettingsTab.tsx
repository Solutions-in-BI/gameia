import { motion } from "framer-motion";
import { 
  Moon, Sun, Bell, Volume2, Globe, 
  Eye, Sparkles, Shield, Settings
} from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { usePreferences } from "@/hooks/usePreferences";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export function SettingsTab() {
  const { isDark, toggleTheme } = useTheme();
  const { preferences, updatePreference, isLoading } = usePreferences();

  // Simple theme value for display
  const themeValue = isDark ? "dark" : "light";

  return (
    <div className="space-y-6">
      {/* Aparência */}
      <div className="surface p-5">
        <h3 className="text-sm font-medium text-muted-foreground mb-4 flex items-center gap-2">
          <Moon className="h-4 w-4" />
          Aparência
        </h3>
        
        <div className="grid grid-cols-2 gap-3">
          <Label
            htmlFor="theme-light"
            className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
              !isDark ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
            }`}
            onClick={() => isDark && toggleTheme()}
          >
            <Sun className="h-6 w-6" />
            <span className="text-sm">Claro</span>
          </Label>
          
          <Label
            htmlFor="theme-dark"
            className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
              isDark ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
            }`}
            onClick={() => !isDark && toggleTheme()}
          >
            <Moon className="h-6 w-6" />
            <span className="text-sm">Escuro</span>
          </Label>
        </div>
      </div>

      {/* Notificações */}
      <div className="surface p-5">
        <h3 className="text-sm font-medium text-muted-foreground mb-4 flex items-center gap-2">
          <Bell className="h-4 w-4" />
          Notificações
        </h3>
        
        <div className="space-y-4">
          <SettingRow
            icon={Bell}
            label="Notificações"
            description="Receba alertas no app"
            checked={preferences?.notifications_enabled ?? true}
            onCheckedChange={(checked) => updatePreference("notifications_enabled", checked)}
          />
          
          <SettingRow
            icon={Bell}
            label="Notificações por Email"
            description="Receba atualizações por email"
            checked={preferences?.email_notifications ?? true}
            onCheckedChange={(checked) => updatePreference("email_notifications", checked)}
          />
          
          <SettingRow
            icon={Sparkles}
            label="Resumo Semanal"
            description="Receba um resumo da sua semana"
            checked={preferences?.weekly_summary ?? true}
            onCheckedChange={(checked) => updatePreference("weekly_summary", checked)}
          />
        </div>
      </div>

      {/* Sons */}
      <div className="surface p-5">
        <h3 className="text-sm font-medium text-muted-foreground mb-4 flex items-center gap-2">
          <Volume2 className="h-4 w-4" />
          Sons
        </h3>
        
        <SettingRow
          icon={Volume2}
          label="Efeitos Sonoros"
          description="Sons nos jogos e interações"
          checked={preferences?.sound_enabled ?? true}
          onCheckedChange={(checked) => updatePreference("sound_enabled", checked)}
        />
      </div>

      {/* Idioma */}
      <div className="surface p-5">
        <h3 className="text-sm font-medium text-muted-foreground mb-4 flex items-center gap-2">
          <Globe className="h-4 w-4" />
          Idioma
        </h3>
        
        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
          <Globe className="h-5 w-5 text-muted-foreground" />
          <div>
            <p className="font-medium">Português (Brasil)</p>
            <p className="text-xs text-muted-foreground">Idioma padrão do sistema</p>
          </div>
        </div>
      </div>

      {/* Privacidade - Info only since fields don't exist yet */}
      <div className="surface p-5">
        <h3 className="text-sm font-medium text-muted-foreground mb-4 flex items-center gap-2">
          <Shield className="h-4 w-4" />
          Privacidade
        </h3>
        
        <div className="p-4 rounded-lg bg-muted/30 text-center">
          <Shield className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            Suas informações são protegidas e gerenciadas de forma segura.
          </p>
        </div>
      </div>
    </div>
  );
}

function SettingRow({
  icon: Icon,
  label,
  description,
  checked,
  onCheckedChange
}: {
  icon: typeof Bell;
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Icon className="h-5 w-5 text-muted-foreground" />
        <div>
          <p className="font-medium text-sm">{label}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}
