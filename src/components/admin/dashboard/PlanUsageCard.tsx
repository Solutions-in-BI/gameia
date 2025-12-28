import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Crown, Users, TrendingUp, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePlanLimits } from '@/hooks/usePlanLimits';

export function PlanUsageCard() {
  const { getUsageStats, isLoading } = usePlanLimits();

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardHeader className="pb-2">
          <div className="h-5 w-32 bg-muted rounded" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="h-4 w-full bg-muted rounded" />
          <div className="h-2 w-full bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  const stats = getUsageStats();

  const planColors: Record<string, string> = {
    free: 'text-slate-500',
    starter: 'text-blue-500',
    business: 'text-purple-500',
    enterprise: 'text-amber-500',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="overflow-hidden">
        <div className={`h-1 bg-gradient-to-r ${
          stats.planSlug === 'free' ? 'from-slate-400 to-slate-500' :
          stats.planSlug === 'starter' ? 'from-blue-400 to-blue-500' :
          stats.planSlug === 'business' ? 'from-purple-400 to-purple-500' :
          'from-amber-400 to-amber-500'
        }`} />
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Crown className={`h-4 w-4 ${planColors[stats.planSlug]}`} />
              Plano {stats.planName}
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/subscription">Upgrade</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Members Usage */}
          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Users className="h-3.5 w-3.5" />
                Membros
              </span>
              <span className="font-medium">
                {stats.members.used} / {stats.members.limit}
              </span>
            </div>
            <div className="relative">
              <Progress 
                value={stats.members.percentage} 
                className={`h-2 ${stats.members.isAtLimit ? '[&>div]:bg-destructive' : stats.members.isNearLimit ? '[&>div]:bg-amber-500' : ''}`}
              />
            </div>
            {stats.members.isNearLimit && !stats.members.isAtLimit && (
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                Próximo do limite
              </p>
            )}
            {stats.members.isAtLimit && (
              <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                Limite atingido
              </p>
            )}
          </div>

          {/* Features */}
          <div className="flex flex-wrap gap-1.5">
            {stats.features.analytics && (
              <Badge variant="secondary" className="text-xs">
                <TrendingUp className="h-3 w-3 mr-1" />
                Analytics
              </Badge>
            )}
            {stats.features.salesSimulator && (
              <Badge variant="secondary" className="text-xs">
                Simulador Vendas
              </Badge>
            )}
            {stats.features.aiScenarios && (
              <Badge variant="secondary" className="text-xs">
                Game IA
              </Badge>
            )}
            {stats.features.apiAccess && (
              <Badge variant="secondary" className="text-xs">
                API
              </Badge>
            )}
            {stats.features.sso && (
              <Badge variant="secondary" className="text-xs">
                SSO
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
