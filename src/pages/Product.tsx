import { useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  ArrowRight,
  Play,
  CheckCircle2,
  Zap,
  Brain,
  Target,
  Trophy,
  Users,
  BarChart3,
  MessageSquare,
  Gamepad2,
  Clock,
  Shield,
  Sparkles,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { SEOHead, SEO_CONFIG, SocialProof, TestimonialCard } from "@/components/marketing";
import { useTracking } from "@/hooks/useTracking";
import { Header, Footer } from "@/components/layout";

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Configure sua plataforma",
    description: "Setup em menos de 1 dia. Personalize visual, trilhas e conteúdo com arrastar-e-soltar.",
    icon: Zap,
  },
  {
    step: "02",
    title: "Convide sua equipe",
    description: "Integre via SSO ou convite por email. Onboarding guiado para cada colaborador.",
    icon: Users,
  },
  {
    step: "03",
    title: "Acompanhe resultados",
    description: "Dashboards em tempo real com métricas de engajamento e competências.",
    icon: BarChart3,
  },
  {
    step: "04",
    title: "Escale o sucesso",
    description: "Replique trilhas de sucesso e expanda para novos times automaticamente.",
    icon: Trophy,
  },
];

const COMPARISON = {
  before: [
    "Treinamentos chatos com 15% de conclusão",
    "Sem métricas de desenvolvimento real",
    "Onboarding de 45+ dias",
    "Turnover alto nos primeiros meses",
    "Investimento sem ROI mensurável",
  ],
  after: [
    "Experiências engajantes com 95% de conclusão",
    "Analytics de competências em tempo real",
    "Onboarding em 18 dias ou menos",
    "45% menos turnover no primeiro ano",
    "ROI de 340% nos primeiros 6 meses",
  ],
};

const INTEGRATIONS = [
  "Azure AD", "Google Workspace", "Okta", "SAML 2.0", "Slack", "Teams", "Webhooks", "REST API"
];

export default function Product() {
  const navigate = useNavigate();
  const { trackPageView, trackDemoClick, trackCTAClick } = useTracking();

  useEffect(() => {
    trackPageView("product");
  }, [trackPageView]);

  const handleDemoClick = () => {
    trackDemoClick("product_hero");
    navigate("/demo");
  };

  const handleContactClick = () => {
    trackCTAClick("contact", "product");
    navigate("/contato");
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead {...SEO_CONFIG.product} />
      <Header />

      {/* Hero Section */}
      <section className="pt-24 pb-16 md:pt-32 md:pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Badge variant="secondary" className="mb-4">
                <Sparkles className="w-3 h-3 mr-1" />
                Plataforma líder em gamificação corporativa
              </Badge>
              
              <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
                Transforme treinamentos em{" "}
                <span className="text-primary">resultados mensuráveis</span>
              </h1>
              
              <p className="text-lg text-muted-foreground mb-8">
                Plataforma completa de gamificação que aumenta engajamento em 300%, 
                reduz turnover em 45% e entrega ROI de 340% nos primeiros 6 meses.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Button size="lg" onClick={handleDemoClick} className="gap-2">
                  Ver demo gratuita
                  <ArrowRight className="w-4 h-4" />
                </Button>
                <Button size="lg" variant="outline" onClick={handleContactClick}>
                  Falar com vendas
                </Button>
              </div>

              <SocialProof variant="compact" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="relative"
            >
              {/* Placeholder for product demo/video */}
              <div className="aspect-video rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center overflow-hidden">
                <div className="text-center p-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 text-primary mb-4 cursor-pointer hover:scale-110 transition-transform">
                    <Play className="w-8 h-8 ml-1" />
                  </div>
                  <p className="text-muted-foreground">Veja a plataforma em ação</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <Badge variant="outline" className="mb-4">Como funciona</Badge>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Operacional em menos de 1 semana
            </h2>
            <p className="text-muted-foreground">
              Setup simples, resultados rápidos
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {HOW_IT_WORKS.map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-6 h-full relative">
                  <div className="text-5xl font-bold text-primary/10 absolute top-4 right-4">
                    {item.step}
                  </div>
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-4">
                    <item.icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Before/After Comparison */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Antes vs Depois do GAMEIA
            </h2>
            <p className="text-muted-foreground">
              A transformação que sua empresa pode alcançar
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Card className="p-6 border-destructive/20 bg-destructive/5">
                <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-destructive"></span>
                  Antes
                </h3>
                <ul className="space-y-4">
                  {COMPARISON.before.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="w-5 h-5 rounded-full bg-destructive/20 text-destructive flex items-center justify-center text-xs shrink-0 mt-0.5">✕</span>
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Card className="p-6 border-primary/20 bg-primary/5">
                <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary"></span>
                  Depois
                </h3>
                <ul className="space-y-4">
                  {COMPARISON.after.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <Badge variant="outline" className="mb-4">Integrações</Badge>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Conecta com suas ferramentas
            </h2>
            <p className="text-muted-foreground">
              SSO, APIs e webhooks para integrar com seu ecossistema
            </p>
          </motion.div>

          <div className="flex flex-wrap justify-center gap-4">
            {INTEGRATIONS.map((integration, index) => (
              <motion.div
                key={integration}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
              >
                <Badge variant="secondary" className="px-4 py-2 text-sm">
                  {integration}
                </Badge>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <SocialProof variant="stats" className="mb-12" />
          <SocialProof variant="logos" />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center p-8 md:p-12 rounded-2xl bg-gradient-to-br from-primary to-primary-glow text-white"
          >
            <h2 className="text-2xl md:text-4xl font-bold mb-4">
              Pronto para ver resultados reais?
            </h2>
            <p className="text-white/80 mb-8 max-w-xl mx-auto">
              Agende uma demo personalizada e descubra como a GAMEIA pode transformar 
              seus treinamentos em resultados mensuráveis.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" onClick={handleDemoClick} className="gap-2">
                Ver demo gratuita
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate("/planos")} className="bg-transparent border-white/30 text-white hover:bg-white/10">
                Ver planos e preços
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
