/**
 * Componente de configurações de notificações
 */

import { Bell, Mail, Trophy, Target, Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useNotificationPreferences } from '@/hooks/useNotificationPreferences';
import { Skeleton } from '@/components/ui/skeleton';

export function NotificationSettings() {
  const { preferences, isLoading, updatePreferences, isUpdating } = useNotificationPreferences();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  const emailSettings = [
    {
      key: 'email_streak_reminder' as const,
      label: 'Lembrete de Streak',
      description: 'Receba um email quando seu streak estiver em risco',
      icon: <Bell className="h-4 w-4 text-orange-500" />,
    },
    {
      key: 'email_weekly_summary' as const,
      label: 'Resumo Semanal',
      description: 'Relatório semanal com seu progresso e estatísticas',
      icon: <Mail className="h-4 w-4 text-blue-500" />,
    },
  ];

  const pushSettings = [
    {
      key: 'push_achievements' as const,
      label: 'Conquistas',
      description: 'Notificações quando desbloquear badges ou conquistas',
      icon: <Trophy className="h-4 w-4 text-yellow-500" />,
    },
    {
      key: 'push_challenges' as const,
      label: 'Desafios',
      description: 'Alertas sobre novos desafios e missões disponíveis',
      icon: <Target className="h-4 w-4 text-green-500" />,
    },
    {
      key: 'push_friends' as const,
      label: 'Amigos',
      description: 'Solicitações de amizade e atividades de amigos',
      icon: <Users className="h-4 w-4 text-purple-500" />,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notificações
        </CardTitle>
        <CardDescription>
          Gerencie suas preferências de notificações
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Email Notifications */}
        <div>
          <h4 className="text-sm font-medium mb-4 flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Notificações por Email
          </h4>
          <div className="space-y-4">
            {emailSettings.map((setting) => (
              <div key={setting.key} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                    {setting.icon}
                  </div>
                  <div>
                    <Label htmlFor={setting.key} className="font-medium">
                      {setting.label}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {setting.description}
                    </p>
                  </div>
                </div>
                <Switch
                  id={setting.key}
                  checked={preferences[setting.key]}
                  onCheckedChange={(checked) => 
                    updatePreferences({ [setting.key]: checked })
                  }
                  disabled={isUpdating}
                />
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Push Notifications */}
        <div>
          <h4 className="text-sm font-medium mb-4 flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notificações In-App
          </h4>
          <div className="space-y-4">
            {pushSettings.map((setting) => (
              <div key={setting.key} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                    {setting.icon}
                  </div>
                  <div>
                    <Label htmlFor={setting.key} className="font-medium">
                      {setting.label}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {setting.description}
                    </p>
                  </div>
                </div>
                <Switch
                  id={setting.key}
                  checked={preferences[setting.key]}
                  onCheckedChange={(checked) => 
                    updatePreferences({ [setting.key]: checked })
                  }
                  disabled={isUpdating}
                />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
