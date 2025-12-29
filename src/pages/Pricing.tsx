import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { 
  ArrowRight, 
  Sparkles,
  Shield,
  Clock,
  Users,
  TrendingUp,
  ChevronRight,
  Building2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { SEOHead, SEO_CONFIG, SocialProof, CommercialFAQ, PricingTable } from "@/components/marketing";
import { useTracking } from "@/hooks/useTracking";
import { Header, Footer } from "@/components/layout";

const GUARANTEES = [
  {
    icon: Clock,
    title: "14 dias grátis",
    description: "Teste completo sem cartão",
  },
  {
    icon: Shield,
    title: "Garantia de 30 dias",
    description: "Dinheiro de volta se não gostar",
  },
  {
    icon: TrendingUp,
    title: "ROI garantido",
    description: "Resultados em 90 dias ou seu dinheiro de volta",
  },
  {
    icon: Users,
    title: "Suporte incluso",
    description: "Onboarding e treinamento gratuitos",
  },
];

export default function Pricing() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const navigate = useNavigate();
  const { trackPageView, trackDemoClick, trackCTAClick } = useTracking();

  useEffect(() => {
    trackPageView("pricing");
  }, [trackPageView]);

  const handleDemoClick = () => {
    trackDemoClick("pricing_hero");
    navigate("/demo");
  };

  const handleContactClick = () => {
    trackCTAClick("contact", "pricing_hero");
    navigate("/contato");
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead {...SEO_CONFIG.pricing} />
      <Header />

      {/* Hero Section */}
      <section className="pt-24 pb-12 md:pt-32 md:pb-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto mb-12"
          >
            <Badge variant="secondary" className="mb-4">
              <Sparkles className="w-3 h-3 mr-1" />
              14 dias grátis • Sem cartão de crédito
            </Badge>
            
            <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
              Planos que cabem no seu{" "}
              <span className="text-primary">orçamento</span>
            </h1>
            
            <p className="text-lg text-muted-foreground mb-8">
              Escolha o plano ideal para sua equipe. Comece grátis e escale conforme cresce.
              <br />
              <strong className="text-foreground">ROI médio de 340%</strong> nos primeiros 6 meses.
            </p>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <span className={billingCycle === "monthly" ? "text-foreground font-medium" : "text-muted-foreground"}>
                Mensal
              </span>
              <Switch
                checked={billingCycle === "yearly"}
                onCheckedChange={(checked) => setBillingCycle(checked ? "yearly" : "monthly")}
              />
              <span className={billingCycle === "yearly" ? "text-foreground font-medium" : "text-muted-foreground"}>
                Anual
              </span>
              {billingCycle === "yearly" && (
                <Badge variant="default" className="bg-primary">
                  20% off
                </Badge>
              )}
            </div>

            {/* Quick CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={handleDemoClick} className="gap-2">
                Ver demo gratuita
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button size="lg" variant="outline" onClick={handleContactClick}>
                Falar com especialista
              </Button>
            </div>
          </motion.div>

          {/* Social Proof */}
          <SocialProof variant="compact" className="mb-12" />
        </div>
      </section>

      {/* Pricing Table */}
      <section className="py-12 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <PricingTable billingCycle={billingCycle} showComparison />
        </div>
      </section>

      {/* Guarantees */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-foreground mb-12">
            Sem riscos. Garantia total.
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {GUARANTEES.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center p-6 rounded-xl bg-card border border-border"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4">
                  <item.icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <CommercialFAQ 
            variant="pricing" 
            title="Perguntas sobre preços e planos"
          />
        </div>
      </section>

      {/* Enterprise CTA */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center p-8 md:p-12 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20"
          >
            <Building2 className="w-12 h-12 text-primary mx-auto mb-4" />
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Precisa de algo personalizado?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Para grandes organizações, oferecemos planos customizados com ambiente dedicado, 
              SLA garantido, integrações personalizadas e suporte 24/7.
            </p>
            <Button size="lg" onClick={handleContactClick} className="gap-2">
              Falar com vendas
              <ChevronRight className="w-4 h-4" />
            </Button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
