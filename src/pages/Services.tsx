/**
 * Serviços - Página de módulos e funcionalidades (Atualizada)
 * Detalhamento dos jogos e recursos da plataforma
 */

import { useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  Gamepad2,
  MessageSquare,
  Brain,
  Mail,
  Trophy,
  Target,
  Users,
  BarChart3,
  Zap,
  Shield,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Play,
  TrendingUp,
  GraduationCap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SEOHead, SEO_CONFIG, SocialProof, TestimonialCard, CommercialFAQ } from "@/components/marketing";
import { useTracking } from "@/hooks/useTracking";

const mainModules = [
  {
    id: "quiz",
    icon: Gamepad2,
    title: "Quiz Master",
    subtitle: "Conhecimento Gamificado",
    description: "Quizzes competitivos com múltiplas categorias, modos de jogo e sistema de apostas entre colegas.",
    stats: "95% de engajamento",
    features: [
      "Categorias personalizáveis",
      "Modo duelo 1v1",
      "Sistema de apostas com coins",
      "Rankings e ligas",
      "Perguntas adaptativas",
    ],
    gradient: "from-violet-500 to-purple-600",
  },
  {
    id: "sales",
    icon: MessageSquare,
    title: "Simulador de Vendas",
    subtitle: "Conversas com IA",
    description: "Pratique técnicas de vendas conversando com clientes virtuais que respondem de forma realista usando IA.",
    stats: "+32% em conversão",
    features: [
      "Personas de clientes variadas",
      "Cenários por produto/serviço",
      "Feedback em tempo real",
      "Métricas de rapport",
      "Diferentes níveis de dificuldade",
    ],
    gradient: "from-emerald-500 to-teal-600",
  },
  {
    id: "decision",
    icon: Brain,
    title: "Cenários de Decisão",
    subtitle: "Pensamento Estratégico",
    description: "Situações complexas do dia a dia corporativo que testam tomada de decisão, priorização e resolução de problemas.",
    stats: "87% de precisão",
    features: [
      "Cenários baseados em casos reais",
      "Múltiplas ramificações",
      "Análise de consequências",
      "Score de qualidade de decisão",
      "Geração de cenários com IA",
    ],
    gradient: "from-blue-500 to-cyan-600",
  },
  {
    id: "outreach",
    icon: Mail,
    title: "Cold Outreach",
    subtitle: "Prospecção Efetiva",
    description: "Treine abordagens de prospecção em diferentes canais: email, LinkedIn, WhatsApp e chamadas telefônicas.",
    stats: "+45% em respostas",
    features: [
      "Templates por canal",
      "Análise de copy",
      "Scripts de ligação",
      "Objeções frequentes",
      "Métricas de conversão",
    ],
    gradient: "from-amber-500 to-orange-600",
  },
];

const platformFeatures = [
  {
    icon: Trophy,
    title: "Sistema de Conquistas",
    description: "Badges, títulos e recompensas que motivam a progressão contínua.",
  },
  {
    icon: Target,
    title: "Árvore de Skills",
    description: "Visualização clara do progresso e próximos passos de desenvolvimento.",
  },
  {
    icon: Users,
    title: "Competição Social",
    description: "Rankings, ligas semanais e desafios em equipe.",
  },
  {
    icon: BarChart3,
    title: "Analytics Executivo",
    description: "Dashboard com métricas de competências, engajamento e ROI.",
  },
  {
    icon: Zap,
    title: "Gamificação Completa",
    description: "XP, coins, streaks, níveis e todo o sistema de progressão.",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "SSO, LGPD, API, webhooks e integrações corporativas.",
  },
];

const RESULTS = [
  { value: "300%", label: "Aumento no engajamento", description: "vs. treinamentos tradicionais" },
  { value: "45%", label: "Redução no turnover", description: "nos primeiros 12 meses" },
  { value: "60%", label: "Menor tempo de onboarding", description: "para novos colaboradores" },
  { value: "32%", label: "Aumento em vendas", description: "após 90 dias de uso" },
];

const TESTIMONIALS = [
  {
    quote: "Nosso time comercial aumentou a taxa de conversão em 32% após 3 meses usando o simulador de vendas.",
    author: "Carlos Mendes",
    role: "Diretor Comercial",
    company: "TechCorp Brasil",
  },
  {
    quote: "O onboarding que levava 45 dias agora leva 18. A gamificação transformou completamente nossa integração.",
    author: "Ana Paula Silva",
    role: "Head de RH",
    company: "Varejo Plus",
  },
  {
    quote: "Finalmente consigo medir o desenvolvimento real das competências do meu time. Os dados são incríveis.",
    author: "Roberto Almeida",
    role: "Gerente de T&D",
    company: "Indústria SA",
  },
];

const Services = () => {
  const navigate = useNavigate();
  const { trackPageView, trackDemoClick, trackCTAClick } = useTracking();

  useEffect(() => {
    trackPageView("services");
  }, [trackPageView]);

  const handleDemoClick = () => {
    trackDemoClick("services_hero");
    navigate("/demo");
  };

  const handleContactClick = () => {
    trackCTAClick("contact", "services");
    navigate("/contato");
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead {...SEO_CONFIG.product} />
      <Header />

      {/* Hero Section */}
      <section className="pt-24 pb-16 md:pt-32 md:pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <Badge variant="secondary" className="mb-4">
              <Zap className="w-3 h-3 mr-1" />
              +150 empresas já transformaram seus treinamentos
            </Badge>
            
            <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
              Treinamentos que{" "}
              <span className="text-primary">geram resultados</span>,
              <br />não apenas certificados
            </h1>
            
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Transforme treinamentos corporativos em experiências engajantes com gamificação 
              inteligente. Aumente engajamento em 300% e reduza turnover em 45%.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button size="lg" onClick={handleDemoClick} className="gap-2">
                Ver demo gratuita
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button size="lg" variant="outline" onClick={handleContactClick}>
                Falar com especialista
              </Button>
            </div>

            <SocialProof variant="compact" />
          </motion.div>
        </div>
      </section>

      {/* Results Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Resultados que nossos clientes alcançam
            </h2>
            <p className="text-muted-foreground">
              Métricas reais de empresas que usam GAMEIA
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {RESULTS.map((result, index) => (
              <motion.div
                key={result.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center p-6 rounded-xl bg-card border border-border"
              >
                <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
                  {result.value}
                </div>
                <div className="font-semibold text-foreground mb-1">{result.label}</div>
                <div className="text-sm text-muted-foreground">{result.description}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Modules */}
      <section id="jogos" className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <Badge variant="outline" className="mb-4">Módulos</Badge>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Jogos & Simulações
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Módulos gamificados que cobrem desde conhecimento técnico até soft skills
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {mainModules.map((module, index) => (
              <motion.div
                key={module.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-6 h-full">
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r ${module.gradient} text-white shrink-0`}>
                      <module.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-xs text-primary font-medium">{module.subtitle}</span>
                      <h3 className="text-xl font-semibold text-foreground">{module.title}</h3>
                    </div>
                  </div>
                  
                  <p className="text-muted-foreground mb-4">{module.description}</p>
                  
                  <Badge variant="secondary" className="mb-4">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    {module.stats}
                  </Badge>

                  <ul className="space-y-2">
                    {module.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Features */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <Badge variant="outline" className="mb-4">Recursos</Badge>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Tudo que você precisa em uma plataforma
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {platformFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center p-6"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4">
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <Badge variant="outline" className="mb-4">Depoimentos</Badge>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              O que nossos clientes dizem
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((testimonial, index) => (
              <TestimonialCard key={index} {...testimonial} />
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <CommercialFAQ variant="general" />
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
              Pronto para transformar seus treinamentos?
            </h2>
            <p className="text-white/80 mb-8 max-w-xl mx-auto">
              Agende uma demo gratuita e descubra como a gamificação pode revolucionar 
              o desenvolvimento da sua equipe.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" onClick={handleDemoClick} className="gap-2">
                Ver demo gratuita
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button size="lg" variant="outline" onClick={handleContactClick} className="bg-transparent border-white/30 text-white hover:bg-white/10">
                Falar com vendas
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Services;
