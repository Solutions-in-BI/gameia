import { motion } from "framer-motion";
import { Check, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useTracking } from "@/hooks/useTracking";

interface PlanFeature {
  name: string;
  starter: boolean | string;
  pro: boolean | string;
  enterprise: boolean | string;
}

const FEATURES: PlanFeature[] = [
  { name: "Usuários ativos", starter: "Até 25", pro: "Até 200", enterprise: "Ilimitado" },
  { name: "Quizzes e jogos", starter: true, pro: true, enterprise: true },
  { name: "Simulador de vendas", starter: false, pro: true, enterprise: true },
  { name: "Cenários de decisão", starter: false, pro: true, enterprise: true },
  { name: "Trilhas personalizadas", starter: "3 trilhas", pro: "Ilimitadas", enterprise: "Ilimitadas" },
  { name: "Relatórios básicos", starter: true, pro: true, enterprise: true },
  { name: "Relatórios avançados", starter: false, pro: true, enterprise: true },
  { name: "API de integração", starter: false, pro: false, enterprise: true },
  { name: "SSO (SAML/OAuth)", starter: false, pro: false, enterprise: true },
  { name: "Suporte", starter: "Email", pro: "Chat + Email", enterprise: "Dedicado 24/7" },
  { name: "SLA garantido", starter: false, pro: "99.5%", enterprise: "99.9%" },
  { name: "Onboarding dedicado", starter: false, pro: true, enterprise: true },
  { name: "Customização visual", starter: false, pro: true, enterprise: true },
  { name: "Ambiente dedicado", starter: false, pro: false, enterprise: true },
];

const PLANS = [
  {
    id: "starter",
    name: "Starter",
    description: "Para equipes iniciando com gamificação",
    price: { monthly: 290, yearly: 232 },
    popular: false,
    cta: "Começar grátis",
    ctaVariant: "outline" as const,
  },
  {
    id: "pro",
    name: "Pro",
    description: "Para empresas que querem resultados",
    price: { monthly: 790, yearly: 632 },
    popular: true,
    cta: "Iniciar teste grátis",
    ctaVariant: "default" as const,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "Para grandes organizações",
    price: { monthly: null, yearly: null },
    popular: false,
    cta: "Falar com vendas",
    ctaVariant: "outline" as const,
  },
];

interface PricingTableProps {
  billingCycle?: "monthly" | "yearly";
  showComparison?: boolean;
  className?: string;
}

export function PricingTable({ 
  billingCycle = "monthly", 
  showComparison = false,
  className = "" 
}: PricingTableProps) {
  const navigate = useNavigate();
  const { trackPlanClick, trackDemoClick } = useTracking();

  const handlePlanClick = (planId: string) => {
    trackPlanClick(planId);
    if (planId === "enterprise") {
      navigate("/contato");
    } else {
      navigate("/demo");
    }
  };

  return (
    <div className={className}>
      {/* Pricing Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        {PLANS.map((plan, index) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className={`relative rounded-2xl border p-6 ${
              plan.popular 
                ? "border-primary bg-primary/5 shadow-lg shadow-primary/10" 
                : "border-border bg-card"
            }`}
          >
            {plan.popular && (
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">
                <Sparkles className="w-3 h-3 mr-1" />
                Mais popular
              </Badge>
            )}
            
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-foreground mb-2">{plan.name}</h3>
              <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
              
              {plan.price.monthly ? (
                <div>
                  <span className="text-4xl font-bold text-foreground">
                    R$ {billingCycle === "yearly" ? plan.price.yearly : plan.price.monthly}
                  </span>
                  <span className="text-muted-foreground">/mês</span>
                  {billingCycle === "yearly" && (
                    <p className="text-sm text-primary mt-1">
                      Economia de 20% no plano anual
                    </p>
                  )}
                </div>
              ) : (
                <div>
                  <span className="text-2xl font-bold text-foreground">Personalizado</span>
                  <p className="text-sm text-muted-foreground mt-1">
                    Preço sob consulta
                  </p>
                </div>
              )}
            </div>

            <Button 
              className="w-full mb-6" 
              variant={plan.ctaVariant}
              size="lg"
              onClick={() => handlePlanClick(plan.id)}
            >
              {plan.cta}
            </Button>

            <ul className="space-y-3">
              {FEATURES.slice(0, 6).map((feature) => {
                const value = feature[plan.id as keyof typeof feature];
                const hasFeature = value !== false;
                
                return (
                  <li key={feature.name} className="flex items-start gap-2">
                    {hasFeature ? (
                      <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    ) : (
                      <X className="w-5 h-5 text-muted-foreground/50 shrink-0 mt-0.5" />
                    )}
                    <span className={hasFeature ? "text-foreground" : "text-muted-foreground/50"}>
                      {typeof value === "string" ? value : feature.name}
                    </span>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        ))}
      </div>

      {/* Comparison Table */}
      {showComparison && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="overflow-x-auto"
        >
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-4 px-4 text-foreground font-semibold">Recurso</th>
                <th className="text-center py-4 px-4 text-foreground font-semibold">Starter</th>
                <th className="text-center py-4 px-4 text-foreground font-semibold bg-primary/5">Pro</th>
                <th className="text-center py-4 px-4 text-foreground font-semibold">Enterprise</th>
              </tr>
            </thead>
            <tbody>
              {FEATURES.map((feature, index) => (
                <tr key={feature.name} className={index % 2 === 0 ? "bg-muted/30" : ""}>
                  <td className="py-3 px-4 text-foreground">{feature.name}</td>
                  {["starter", "pro", "enterprise"].map((planId) => {
                    const value = feature[planId as keyof typeof feature];
                    return (
                      <td 
                        key={planId} 
                        className={`text-center py-3 px-4 ${planId === "pro" ? "bg-primary/5" : ""}`}
                      >
                        {typeof value === "boolean" ? (
                          value ? (
                            <Check className="w-5 h-5 text-primary mx-auto" />
                          ) : (
                            <X className="w-5 h-5 text-muted-foreground/50 mx-auto" />
                          )
                        ) : (
                          <span className="text-foreground">{value}</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )}
    </div>
  );
}
