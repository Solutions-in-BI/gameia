/**
 * PlanBillingSettings - Configurações de plano, billing e limites
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  CreditCard, 
  Calendar, 
  Users, 
  Zap, 
  Crown,
  AlertTriangle,
  CheckCircle2,
  Clock,
  TrendingUp,
  Shield,
  Sparkles,
  ArrowUpRight,
  RefreshCw
} from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { usePlanLimits } from "@/hooks/usePlanLimits";
import { useOrganization } from "@/hooks/useOrganization";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format, differenceInDays, isPast, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

const PLAN_COLORS: Record<string, string> = {
  free: "from-slate-500 to-slate-600",
  starter: "from-blue-500 to-blue-600",
  business: "from-purple-500 to-purple-600",
  enterprise: "from-amber-500 to-amber-600",
};

const PLAN_ICONS: Record<string, typeof Crown> = {
  free: Zap,
  starter: TrendingUp,
  business: Shield,
  enterprise: Crown,
};

export function PlanBillingSettings() {
  const navigate = useNavigate();
  const { subscription, currentPlan, plans, isLoading, cancelSubscription, isCanceling } = useSubscription();
  const { limits, getUsageStats, checkMemberLimit } = usePlanLimits();
  const { members } = useOrganization();
  
  const usageStats = getUsageStats();
  const memberLimit = checkMemberLimit();
  
  const planSlug = currentPlan?.slug || "free";
  const PlanIcon = PLAN_ICONS[planSlug] || Zap;
  
  // Calculate days until expiration
  const expiresAt = subscription?.expires_at ? new Date(subscription.expires_at) : null;
  const daysUntilExpiration = expiresAt ? differenceInDays(expiresAt, new Date()) : null;
  const isExpired = expiresAt ? isPast(expiresAt) : false;
  const isExpiringSoon = daysUntilExpiration !== null && daysUntilExpiration <= 7 && daysUntilExpiration > 0;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-32 bg-muted/50 rounded-xl animate-pulse" />
        <div className="h-48 bg-muted/50 rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="font-display font-bold text-foreground">Plano e Faturamento</h3>
        <p className="text-sm text-muted-foreground">
          Gerencie sua assinatura, visualize limites e histórico de uso
        </p>
      </div>

      {/* Current Plan Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "relative overflow-hidden rounded-2xl p-6",
          "bg-gradient-to-br",
          PLAN_COLORS[planSlug]
        )}
      >
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2" />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <PlanIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-white">
                  Plano {currentPlan?.name || "Gratuito"}
                </h4>
                <p className="text-white/80 text-sm">
                  {subscription?.billing_cycle === "yearly" ? "Anual" : "Mensal"}
                </p>
              </div>
            </div>
            <Badge 
              variant={subscription?.status === "active" ? "default" : "destructive"}
              className="bg-white/20 text-white border-white/30 backdrop-blur-sm"
            >
              {subscription?.status === "active" ? "Ativo" : subscription?.status === "trial" ? "Trial" : "Inativo"}
            </Badge>
          </div>

          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-white/70 text-xs mb-1">
                <Calendar className="w-3 h-3" />
                Início
              </div>
              <p className="text-white font-medium text-sm">
                {subscription?.started_at 
                  ? format(new Date(subscription.started_at), "dd/MM/yyyy", { locale: ptBR })
                  : "—"
                }
              </p>
            </div>
            <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-white/70 text-xs mb-1">
                <Clock className="w-3 h-3" />
                Expira em
              </div>
              <p className={cn(
                "font-medium text-sm",
                isExpired ? "text-red-200" : isExpiringSoon ? "text-yellow-200" : "text-white"
              )}>
                {expiresAt 
                  ? format(expiresAt, "dd/MM/yyyy", { locale: ptBR })
                  : "Nunca"
                }
              </p>
            </div>
            <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-white/70 text-xs mb-1">
                <CreditCard className="w-3 h-3" />
                Valor
              </div>
              <p className="text-white font-medium text-sm">
                {currentPlan?.price_monthly 
                  ? `R$ ${subscription?.billing_cycle === "yearly" 
                      ? (currentPlan.price_yearly / 12).toFixed(0) 
                      : currentPlan.price_monthly}/mês`
                  : "Gratuito"
                }
              </p>
            </div>
            <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-white/70 text-xs mb-1">
                <Users className="w-3 h-3" />
                Membros
              </div>
              <p className="text-white font-medium text-sm">
                {memberLimit.current} / {memberLimit.limit === Infinity ? "∞" : memberLimit.limit}
              </p>
            </div>
          </div>

          {/* Expiration Warning */}
          {(isExpired || isExpiringSoon) && (
            <div className={cn(
              "mt-4 p-3 rounded-xl flex items-center gap-3",
              isExpired ? "bg-red-500/30" : "bg-yellow-500/30"
            )}>
              <AlertTriangle className="w-5 h-5 text-white" />
              <p className="text-white text-sm flex-1">
                {isExpired 
                  ? "Seu plano expirou. Renove para manter o acesso completo."
                  : `Seu plano expira em ${daysUntilExpiration} dias. Renove para não perder o acesso.`
                }
              </p>
              <Button size="sm" variant="secondary" className="shrink-0">
                <RefreshCw className="w-4 h-4 mr-2" />
                Renovar
              </Button>
            </div>
          )}
        </div>
      </motion.div>

      {/* Usage Stats */}
      <div className="grid sm:grid-cols-2 gap-4">
        {/* Member Usage */}
        <div className="p-4 rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium text-sm">Membros</span>
            </div>
            <Badge variant={memberLimit.percentage >= 80 ? "destructive" : "secondary"}>
              {memberLimit.current} / {memberLimit.limit === Infinity ? "∞" : memberLimit.limit}
            </Badge>
          </div>
          <Progress 
            value={memberLimit.percentage} 
            className={cn(
              "h-2",
              memberLimit.percentage >= 80 && "bg-destructive/20"
            )}
          />
          {memberLimit.percentage >= 80 && (
            <p className="text-xs text-destructive mt-2 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              {memberLimit.percentage >= 100 
                ? "Limite atingido! Faça upgrade para adicionar mais membros."
                : "Você está perto do limite de membros."
              }
            </p>
          )}
        </div>

        {/* Features */}
        <div className="p-4 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium text-sm">Recursos do Plano</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <FeatureItem label="Analytics" enabled={usageStats.features.analytics} />
            <FeatureItem label="API Access" enabled={usageStats.features.apiAccess} />
            <FeatureItem label="SSO" enabled={usageStats.features.sso} />
            <FeatureItem label="IA Avançada" enabled={usageStats.features.aiScenarios} />
          </div>
        </div>
      </div>

      {/* Plan Limits */}
      <div className="p-4 rounded-xl border border-border bg-card">
        <h4 className="font-medium mb-4 flex items-center gap-2">
          <Shield className="w-4 h-4 text-muted-foreground" />
          Limites do Plano
        </h4>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <LimitItem 
            label="Membros" 
            value={limits.maxMembers === -1 ? "Ilimitado" : limits.maxMembers.toString()} 
          />
          <LimitItem 
            label="Jogos" 
            value={limits.maxGames === -1 ? "Ilimitado" : limits.maxGames.toString()} 
          />
          <LimitItem 
            label="Simulador de Vendas" 
            value={limits.hasSalesSimulator ? "Incluído" : "Não incluído"}
            included={limits.hasSalesSimulator}
          />
          <LimitItem 
            label="Cenários com IA" 
            value={limits.hasAiScenarios ? "Incluído" : "Não incluído"}
            included={limits.hasAiScenarios}
          />
        </div>
      </div>

      <Separator />

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button 
          onClick={() => navigate("/subscription")}
          className="flex-1 sm:flex-none"
        >
          <ArrowUpRight className="w-4 h-4 mr-2" />
          {planSlug === "free" ? "Fazer Upgrade" : "Alterar Plano"}
        </Button>
        
        {subscription && subscription.status === "active" && planSlug !== "free" && (
          <Button 
            variant="outline" 
            onClick={() => cancelSubscription()}
            disabled={isCanceling}
          >
            Cancelar Assinatura
          </Button>
        )}
      </div>

      {/* Available Plans Preview */}
      <div className="space-y-4">
        <h4 className="font-medium text-sm text-muted-foreground">Outros Planos Disponíveis</h4>
        <div className="grid sm:grid-cols-3 gap-3">
          {plans
            .filter(p => p.slug !== planSlug && p.slug !== "free")
            .slice(0, 3)
            .map(plan => {
              const PIcon = PLAN_ICONS[plan.slug] || Zap;
              return (
                <button
                  key={plan.id}
                  onClick={() => navigate("/subscription")}
                  className="p-4 rounded-xl border border-border bg-card hover:border-primary/50 transition-all text-left group"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className={cn(
                      "p-1.5 rounded-lg bg-gradient-to-br",
                      PLAN_COLORS[plan.slug]
                    )}>
                      <PIcon className="w-3 h-3 text-white" />
                    </div>
                    <span className="font-medium text-sm">{plan.name}</span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {plan.description}
                  </p>
                  <p className="text-sm font-medium text-primary mt-2 group-hover:underline">
                    R$ {plan.price_monthly}/mês
                  </p>
                </button>
              );
            })}
        </div>
      </div>
    </div>
  );
}

function FeatureItem({ label, enabled }: { label: string; enabled: boolean }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {enabled ? (
        <CheckCircle2 className="w-4 h-4 text-green-500" />
      ) : (
        <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30" />
      )}
      <span className={cn(enabled ? "text-foreground" : "text-muted-foreground")}>
        {label}
      </span>
    </div>
  );
}

function LimitItem({ 
  label, 
  value, 
  included 
}: { 
  label: string; 
  value: string; 
  included?: boolean;
}) {
  return (
    <div className="text-center p-3 rounded-lg bg-muted/50">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className={cn(
        "font-medium text-sm",
        included === false && "text-muted-foreground"
      )}>
        {value}
      </p>
    </div>
  );
}
