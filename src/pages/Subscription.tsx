import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Crown, Zap, Building2, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { Logo } from '@/components/common/Logo';

const planIcons: Record<string, React.ReactNode> = {
  free: <Zap className="h-6 w-6" />,
  starter: <Zap className="h-6 w-6" />,
  business: <Crown className="h-6 w-6" />,
  enterprise: <Building2 className="h-6 w-6" />,
};

const planColors: Record<string, string> = {
  free: 'from-slate-500 to-slate-600',
  starter: 'from-blue-500 to-blue-600',
  business: 'from-purple-500 to-purple-600',
  enterprise: 'from-amber-500 to-amber-600',
};

export default function Subscription() {
  const { user, isLoading: authLoading } = useAuth();
  const { plans, currentPlan, subscription, subscribe, isSubscribing, isLoading } = useSubscription();
  const [isYearly, setIsYearly] = useState(false);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const handleSubscribe = (planId: string) => {
    subscribe({ planId, billingCycle: isYearly ? 'yearly' : 'monthly' });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Link>
          </div>
          <Logo />
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        {/* Current Plan Banner */}
        {currentPlan && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-4 rounded-lg bg-primary/10 border border-primary/20"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Seu plano atual</p>
                <p className="text-lg font-semibold">{currentPlan.name}</p>
              </div>
              {subscription && (
                <Badge variant="outline" className="text-primary border-primary">
                  {subscription.status === 'active' ? 'Ativo' : subscription.status}
                </Badge>
              )}
            </div>
          </motion.div>
        )}

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Escolha seu Plano
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            Desbloqueie todo o potencial da sua equipe com recursos avançados de gamificação e analytics
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-3">
            <span className={!isYearly ? 'text-foreground font-medium' : 'text-muted-foreground'}>
              Mensal
            </span>
            <Switch checked={isYearly} onCheckedChange={setIsYearly} />
            <span className={isYearly ? 'text-foreground font-medium' : 'text-muted-foreground'}>
              Anual
            </span>
            {isYearly && (
              <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                Economize 20%
              </Badge>
            )}
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {plans.map((plan, index) => {
            const isCurrentPlan = currentPlan?.id === plan.id;
            const price = isYearly ? plan.price_yearly : plan.price_monthly;
            const isEnterprise = plan.slug === 'enterprise';

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card 
                  className={`relative h-full flex flex-col ${
                    isCurrentPlan ? 'ring-2 ring-primary' : ''
                  } ${plan.slug === 'business' ? 'border-primary/50' : ''}`}
                >
                  {plan.slug === 'business' && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground">
                        Mais Popular
                      </Badge>
                    </div>
                  )}

                  <CardHeader className="text-center pb-4">
                    <div className={`w-12 h-12 mx-auto rounded-lg bg-gradient-to-br ${planColors[plan.slug]} flex items-center justify-center text-white mb-3`}>
                      {planIcons[plan.slug]}
                    </div>
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                  </CardHeader>

                  <CardContent className="flex-1 flex flex-col">
                    {/* Price */}
                    <div className="text-center mb-6">
                      {isEnterprise ? (
                        <p className="text-2xl font-bold">Sob consulta</p>
                      ) : (
                        <>
                          <span className="text-4xl font-bold">
                            R${price}
                          </span>
                          <span className="text-muted-foreground">
                            /{isYearly ? 'ano' : 'mês'}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Features */}
                    <ul className="space-y-3 flex-1 mb-6">
                      {(plan.features as string[]).map((feature, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA */}
                    {isCurrentPlan ? (
                      <Button variant="outline" disabled className="w-full">
                        Plano Atual
                      </Button>
                    ) : isEnterprise ? (
                      <Button asChild variant="outline" className="w-full">
                        <Link to="/demo">Falar com Vendas</Link>
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleSubscribe(plan.id)}
                        disabled={isSubscribing}
                        className={`w-full ${plan.slug === 'business' ? 'bg-primary' : ''}`}
                        variant={plan.slug === 'business' ? 'default' : 'outline'}
                      >
                        {isSubscribing ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          'Selecionar Plano'
                        )}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Info */}
        <p className="text-center text-sm text-muted-foreground mt-8">
          Todos os planos incluem 14 dias de teste grátis. Cancele a qualquer momento.
        </p>
      </main>
    </div>
  );
}
