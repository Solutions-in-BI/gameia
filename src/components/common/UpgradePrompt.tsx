import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Crown, Zap, ArrowRight, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface UpgradePromptProps {
  variant?: 'inline' | 'modal' | 'card' | 'banner';
  feature?: string;
  currentPlan?: string;
  requiredPlan?: string;
  // For usage limits
  usageType?: 'members' | 'games' | 'storage';
  currentUsage?: number;
  maxUsage?: number;
  onClose?: () => void;
}

export function UpgradePrompt({
  variant = 'card',
  feature,
  currentPlan = 'Gratuito',
  requiredPlan = 'Starter',
  usageType,
  currentUsage,
  maxUsage,
  onClose,
}: UpgradePromptProps) {
  const usageLabels: Record<string, string> = {
    members: 'membros',
    games: 'jogos',
    storage: 'armazenamento',
  };

  const isLimitReached = usageType && currentUsage !== undefined && maxUsage !== undefined;
  const usagePercentage = isLimitReached ? (currentUsage / maxUsage) * 100 : 0;

  if (variant === 'inline') {
    return (
      <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400">
        <Lock className="h-4 w-4 flex-shrink-0" />
        <span className="text-sm">
          {feature ? `${feature} requer ` : 'Recurso requer '}
          <Link to="/subscription" className="font-medium underline hover:no-underline">
            plano {requiredPlan}
          </Link>
        </span>
      </div>
    );
  }

  if (variant === 'banner') {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 rounded-xl bg-gradient-to-r from-primary/10 via-purple-500/10 to-primary/10 border border-primary/20"
      >
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div>
              {isLimitReached ? (
                <>
                  <p className="font-medium">
                    Limite de {usageLabels[usageType]} atingido
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {currentUsage}/{maxUsage} {usageLabels[usageType]} utilizados no plano {currentPlan}
                  </p>
                </>
              ) : (
                <>
                  <p className="font-medium">Desbloqueie {feature}</p>
                  <p className="text-sm text-muted-foreground">
                    Disponível a partir do plano {requiredPlan}
                  </p>
                </>
              )}
            </div>
          </div>
          <Button asChild size="sm" className="gap-2">
            <Link to="/subscription">
              <Crown className="h-4 w-4" />
              Fazer Upgrade
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        {isLimitReached && (
          <div className="mt-3">
            <Progress value={usagePercentage} className="h-2" />
          </div>
        )}
      </motion.div>
    );
  }

  // Default: card variant
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <Card className="overflow-hidden border-primary/20">
        <div className="h-1.5 bg-gradient-to-r from-primary via-purple-500 to-primary" />
        <CardContent className="p-6 text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
            <Crown className="h-8 w-8 text-primary" />
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-1">
              {isLimitReached 
                ? `Limite de ${usageLabels[usageType || '']} Atingido`
                : 'Recurso Premium'
              }
            </h3>
            <p className="text-sm text-muted-foreground">
              {isLimitReached ? (
                <>
                  Você está usando <span className="font-medium text-foreground">{currentUsage}</span> de{' '}
                  <span className="font-medium text-foreground">{maxUsage}</span> {usageLabels[usageType || '']} 
                  permitidos no plano {currentPlan}.
                </>
              ) : (
                <>
                  {feature ? `${feature} está` : 'Este recurso está'} disponível 
                  a partir do plano <span className="font-medium text-foreground">{requiredPlan}</span>.
                </>
              )}
            </p>
          </div>

          {isLimitReached && (
            <div className="space-y-1">
              <Progress value={usagePercentage} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {usagePercentage.toFixed(0)}% utilizado
              </p>
            </div>
          )}

          <div className="pt-2 space-y-2">
            <Button asChild className="w-full gap-2">
              <Link to="/subscription">
                <Zap className="h-4 w-4" />
                Fazer Upgrade Agora
              </Link>
            </Button>
            {onClose && (
              <Button variant="ghost" className="w-full" onClick={onClose}>
                Voltar
              </Button>
            )}
          </div>

          <p className="text-xs text-muted-foreground">
            Desbloqueie recursos avançados e aumente os limites
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Higher-order component to wrap features that require specific plans
interface FeatureGateProps {
  children: React.ReactNode;
  requiredPlan: 'free' | 'starter' | 'business' | 'enterprise';
  feature?: string;
  fallback?: React.ReactNode;
  hasAccess: boolean;
}

export function FeatureGate({ 
  children, 
  requiredPlan, 
  feature,
  fallback,
  hasAccess 
}: FeatureGateProps) {
  if (hasAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  const planNames: Record<string, string> = {
    free: 'Gratuito',
    starter: 'Starter',
    business: 'Business',
    enterprise: 'Enterprise',
  };

  return (
    <UpgradePrompt 
      feature={feature} 
      requiredPlan={planNames[requiredPlan]} 
      variant="card"
    />
  );
}
