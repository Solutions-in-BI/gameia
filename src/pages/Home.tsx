/**
 * Home - Página Principal Institucional (Atualizada)
 * Site completo da GAMEIA
 */

import { useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  Trophy,
  Target,
  Users,
  BarChart3,
  Gamepad2,
  Brain,
  Zap,
  Shield,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Play,
  TrendingUp,
  Award,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeroCarousel } from "@/components/home/HeroCarousel";
import { TestimonialsCarousel } from "@/components/home/TestimonialsCarousel";
import { SEOHead, SEO_CONFIG, SocialProof } from "@/components/marketing";
import { useTracking } from "@/hooks/useTracking";

// Estatísticas de benefícios
const stats = [
  { value: "+78%", label: "Engajamento", icon: TrendingUp, color: "text-emerald-500" },
  { value: "3x", label: "Retenção de Conhecimento", icon: Brain, color: "text-violet-500" },
  { value: "-45%", label: "Turnover", icon: Users, color: "text-blue-500" },
  { value: "92%", label: "Satisfação", icon: Award, color: "text-amber-500" },
];

// Features principais
const features = [
  {
    icon: Gamepad2,
    title: "Jogos Gamificados",
    description: "Quizzes, simulações e desafios que transformam aprendizado em diversão competitiva.",
    gradient: "from-violet-500 to-purple-600",
  },
  {
    icon: Brain,
    title: "IA Adaptativa",
    description: "Cenários e perguntas que se adaptam ao nível e progresso de cada colaborador.",
    gradient: "from-blue-500 to-cyan-600",
  },
  {
    icon: Target,
    title: "Skills Tracking",
    description: "Árvore de habilidades com progressão visual e metas claras de desenvolvimento.",
    gradient: "from-emerald-500 to-teal-600",
  },
  {
    icon: BarChart3,
    title: "Analytics Avançado",
    description: "Dashboard executivo com métricas de competências, engajamento e ROI.",
    gradient: "from-orange-500 to-amber-600",
  },
  {
    icon: Users,
    title: "Competição Social",
    description: "Rankings, ligas, apostas entre colegas e desafios em equipe.",
    gradient: "from-pink-500 to-rose-600",
  },
  {
    icon: Shield,
    title: "Enterprise Ready",
    description: "SSO, API, webhooks, LGPD compliant e integrações com seu stack.",
    gradient: "from-slate-500 to-zinc-600",
  },
];

// Jogos/Módulos
const games = [
  {
    title: "Quiz Master",
    description: "Quizzes competitivos com múltiplas categorias e modos de jogo.",
    icon: "🎯",
    color: "bg-violet-500/10 border-violet-500/20",
  },
  {
    title: "Simulador de Vendas",
    description: "Conversas realistas com clientes virtuais powered by AI.",
    icon: "💼",
    color: "bg-emerald-500/10 border-emerald-500/20",
  },
  {
    title: "Cenários de Decisão",
    description: "Situações complexas que testam tomada de decisão estratégica.",
    icon: "🧠",
    color: "bg-blue-500/10 border-blue-500/20",
  },
  {
    title: "Cold Outreach",
    description: "Pratique abordagens de prospecção em diferentes canais.",
    icon: "📧",
    color: "bg-amber-500/10 border-amber-500/20",
  },
];

// Planos resumidos
const plans = [
  {
    name: "Free",
    price: "R$ 0",
    description: "Para experimentar a plataforma",
    features: ["Até 5 usuários", "Quizzes básicos", "Ranking limitado"],
    cta: "Começar Grátis",
    highlighted: false,
  },
  {
    name: "Starter",
    price: "R$ 29",
    period: "/usuário/mês",
    description: "Para times pequenos",
    features: ["Até 50 usuários", "Todos os jogos", "Analytics básico", "Suporte por email"],
    cta: "Iniciar Trial",
    highlighted: false,
  },
  {
    name: "Business",
    price: "R$ 49",
    period: "/usuário/mês",
    description: "Para empresas em crescimento",
    features: ["Usuários ilimitados", "IA avançada", "API + Webhooks", "SSO", "Suporte prioritário"],
    cta: "Falar com Vendas",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "Para grandes corporações",
    features: ["Tudo do Business", "Deploy dedicado", "SLA garantido", "Customização total"],
    cta: "Contato",
    highlighted: false,
  },
];

const Home = () => {
  const navigate = useNavigate();
  const { trackPageView, trackDemoClick } = useTracking();

  useEffect(() => {
    trackPageView("home");
  }, [trackPageView]);

  const handleDemoClick = () => {
    trackDemoClick("home_cta");
    navigate("/demo");
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead {...SEO_CONFIG.home} />
      <Header />
      
      {/* Hero Section */}
      <HeroCarousel />

      {/* Stats Section */}
      <section className="py-16 md:py-24 border-y border-border bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-muted mb-4`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className={`text-3xl md:text-4xl font-bold ${stat.color} mb-2`}>
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
        
        {/* Social Proof */}
        <SocialProof variant="logos" className="mt-12" />
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4"
            >
              Recursos
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4"
            >
              Tudo que você precisa para{" "}
              <span className="text-primary">gamificar</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-muted-foreground text-lg max-w-2xl mx-auto"
            >
              Uma plataforma completa para transformar treinamentos corporativos em experiências engajadoras
            </motion.p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group p-6 rounded-2xl bg-muted/30 border border-border hover:border-primary/30 transition-all duration-300"
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r ${feature.gradient} mb-4`}>
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Games Section */}
      <section className="py-20 md:py-32 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4"
              >
                Jogos & Simulações
              </motion.span>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-3xl md:text-4xl font-bold mb-4"
              >
                Aprenda jogando, <span className="text-primary">evolua competindo</span>
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="text-muted-foreground text-lg mb-8"
              >
                Módulos gamificados que cobrem desde conhecimento técnico até soft skills, 
                com mecânicas de jogos que mantêm seus colaboradores engajados.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
              >
                <Button size="lg" asChild className="gap-2">
                  <Link to="/servicos">
                    Ver Todos os Módulos
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </motion.div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {games.map((game, index) => (
                <motion.div
                  key={game.title}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-6 rounded-2xl border ${game.color} hover:scale-105 transition-transform duration-300`}
                >
                  <span className="text-4xl mb-4 block">{game.icon}</span>
                  <h3 className="font-semibold text-lg mb-2">{game.title}</h3>
                  <p className="text-sm text-muted-foreground">{game.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <TestimonialsCarousel />

      {/* Pricing Preview Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4"
            >
              Planos
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4"
            >
              Escolha o plano <span className="text-primary">ideal</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-muted-foreground text-lg max-w-2xl mx-auto"
            >
              Do free ao enterprise, temos o plano certo para sua empresa
            </motion.p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`p-6 rounded-2xl border ${
                  plan.highlighted
                    ? "bg-primary/5 border-primary shadow-lg shadow-primary/10"
                    : "bg-muted/30 border-border"
                } relative`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                    Mais Popular
                  </div>
                )}
                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  {plan.period && (
                    <span className="text-muted-foreground text-sm">{plan.period}</span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-6">{plan.description}</p>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  variant={plan.highlighted ? "default" : "outline"}
                  className="w-full"
                  asChild
                >
                  <Link to="/planos">{plan.cta}</Link>
                </Button>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="text-center mt-8"
          >
            <Button variant="link" asChild className="gap-2">
              <Link to="/planos">
                Ver comparação completa de planos
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 md:py-32 bg-gradient-to-br from-primary/10 via-background to-primary/5">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Zap className="h-4 w-4" />
              Comece Hoje
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              Pronto para transformar seus <span className="text-primary">treinamentos</span>?
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Junte-se a centenas de empresas que já estão usando gamificação 
              para desenvolver seus times e aumentar resultados.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="gap-2 text-base">
                <Link to="/auth?tab=signup">
                  <Sparkles className="h-5 w-5" />
                  Começar Trial de 14 Dias
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="gap-2 text-base">
                <Link to="/demo">
                  <Play className="h-5 w-5" />
                  Agendar Demo Personalizada
                </Link>
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-6 flex items-center justify-center gap-2">
              <Clock className="h-4 w-4" />
              Setup em menos de 5 minutos • Não precisa de cartão de crédito
            </p>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
