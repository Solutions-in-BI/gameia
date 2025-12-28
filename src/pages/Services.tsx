/**
 * Serviços - Página de módulos e funcionalidades
 * Detalhamento dos jogos e recursos da plataforma
 */

import { motion } from "framer-motion";
import { Link } from "react-router-dom";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const mainModules = [
  {
    id: "quiz",
    icon: Gamepad2,
    title: "Quiz Master",
    subtitle: "Conhecimento Gamificado",
    description: "Quizzes competitivos com múltiplas categorias, modos de jogo e sistema de apostas entre colegas.",
    features: [
      "Categorias personalizáveis",
      "Modo duelo 1v1",
      "Sistema de apostas com coins",
      "Rankings e ligas",
      "Perguntas adaptativas",
    ],
    gradient: "from-violet-500 to-purple-600",
    color: "violet",
  },
  {
    id: "sales",
    icon: MessageSquare,
    title: "Simulador de Vendas",
    subtitle: "Conversas com IA",
    description: "Pratique técnicas de vendas conversando com clientes virtuais que respondem de forma realista usando IA.",
    features: [
      "Personas de clientes variadas",
      "Cenários por produto/serviço",
      "Feedback em tempo real",
      "Métricas de rapport",
      "Diferentes níveis de dificuldade",
    ],
    gradient: "from-emerald-500 to-teal-600",
    color: "emerald",
  },
  {
    id: "decision",
    icon: Brain,
    title: "Cenários de Decisão",
    subtitle: "Pensamento Estratégico",
    description: "Situações complexas do dia a dia corporativo que testam tomada de decisão, priorização e resolução de problemas.",
    features: [
      "Cenários baseados em casos reais",
      "Múltiplas ramificações",
      "Análise de consequências",
      "Score de qualidade de decisão",
      "Geração de cenários com IA",
    ],
    gradient: "from-blue-500 to-cyan-600",
    color: "blue",
  },
  {
    id: "outreach",
    icon: Mail,
    title: "Cold Outreach",
    subtitle: "Prospecção Efetiva",
    description: "Treine abordagens de prospecção em diferentes canais: email, LinkedIn, WhatsApp e chamadas telefônicas.",
    features: [
      "Templates por canal",
      "Análise de copy",
      "Scripts de ligação",
      "Objeções frequentes",
      "Métricas de conversão",
    ],
    gradient: "from-amber-500 to-orange-600",
    color: "amber",
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

const useCases = [
  {
    title: "Onboarding",
    description: "Acelere a integração de novos colaboradores com trilhas gamificadas.",
    icon: "🚀",
  },
  {
    title: "Vendas",
    description: "Desenvolva técnicas de negociação e fechamento com simulações.",
    icon: "💼",
  },
  {
    title: "Compliance",
    description: "Torne treinamentos obrigatórios em experiências engajadoras.",
    icon: "📋",
  },
  {
    title: "Liderança",
    description: "Prepare gestores com cenários de tomada de decisão.",
    icon: "👔",
  },
  {
    title: "Atendimento",
    description: "Treine equipes de suporte com simulações de clientes.",
    icon: "🎧",
  },
  {
    title: "Produto",
    description: "Ensine características e diferenciais de forma interativa.",
    icon: "📦",
  },
];

const Services = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6"
            >
              Nossos Serviços
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6"
            >
              Módulos que <span className="text-primary">transformam</span> aprendizado
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8"
            >
              Conheça cada jogo e funcionalidade da plataforma GAMEIA. 
              Tudo pensado para maximizar engajamento e resultados.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button size="lg" asChild className="gap-2">
                <Link to="/demo">
                  <Play className="h-5 w-5" />
                  Ver Demo
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/planos">Ver Planos</Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Main Modules */}
      <section id="jogos" className="py-20 md:py-32 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold mb-4"
            >
              Jogos & <span className="text-primary">Simulações</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-muted-foreground text-lg max-w-2xl mx-auto"
            >
              Módulos gamificados que cobrem desde conhecimento técnico até soft skills
            </motion.p>
          </div>

          <div className="space-y-8">
            {mainModules.map((module, index) => (
              <motion.div
                key={module.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-8 rounded-3xl bg-background border border-border hover:border-primary/30 transition-all"
              >
                <div className="grid lg:grid-cols-2 gap-8 items-center">
                  <div className={index % 2 === 1 ? "lg:order-2" : ""}>
                    <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-r ${module.gradient} mb-4`}>
                      <module.icon className="h-7 w-7 text-white" />
                    </div>
                    <span className="text-sm text-primary font-medium">{module.subtitle}</span>
                    <h3 className="text-2xl md:text-3xl font-bold mt-2 mb-4">{module.title}</h3>
                    <p className="text-muted-foreground text-lg mb-6">{module.description}</p>
                    <Button asChild className="gap-2">
                      <Link to="/demo">
                        Experimentar
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                  
                  <div className={`p-6 rounded-2xl bg-muted/50 ${index % 2 === 1 ? "lg:order-1" : ""}`}>
                    <h4 className="font-semibold mb-4">Recursos Inclusos</h4>
                    <ul className="space-y-3">
                      {module.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-3">
                          <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Features */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold mb-4"
            >
              Recursos da <span className="text-primary">Plataforma</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-muted-foreground text-lg max-w-2xl mx-auto"
            >
              Além dos jogos, uma infraestrutura completa de gamificação
            </motion.p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {platformFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-6 rounded-2xl bg-muted/30 border border-border hover:border-primary/30 transition-colors"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20 md:py-32 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold mb-4"
            >
              Casos de <span className="text-primary">Uso</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-muted-foreground text-lg max-w-2xl mx-auto"
            >
              Aplicações práticas da plataforma em diferentes contextos
            </motion.p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {useCases.map((useCase, index) => (
              <motion.div
                key={useCase.title}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-6 rounded-2xl bg-background border border-border hover:border-primary/30 hover:scale-105 transition-all duration-300"
              >
                <span className="text-4xl mb-4 block">{useCase.icon}</span>
                <h3 className="text-lg font-semibold mb-2">{useCase.title}</h3>
                <p className="text-sm text-muted-foreground">{useCase.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center p-8 md:p-12 rounded-3xl bg-gradient-to-br from-primary/10 via-background to-primary/5 border border-primary/20"
          >
            <Sparkles className="h-12 w-12 text-primary mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Pronto para experimentar?
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Agende uma demonstração personalizada e veja como a GAMEIA 
              pode transformar seus treinamentos.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="gap-2">
                <Link to="/auth?tab=signup">
                  <Sparkles className="h-5 w-5" />
                  Começar Trial Grátis
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="gap-2">
                <Link to="/demo">
                  <Play className="h-5 w-5" />
                  Agendar Demo
                </Link>
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
