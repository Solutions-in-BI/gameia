import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { 
  Trophy, Users, Brain, Target, Zap, BarChart3, 
  Gamepad2, Award, TrendingUp, Shield, Clock, Star,
  ChevronRight, Play, CheckCircle2, Sparkles, ArrowRight
} from "lucide-react";
import { Logo } from "@/components/common/Logo";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const features = [
  {
    icon: Gamepad2,
    title: "Jogos Gamificados",
    description: "Quiz, Simulações de Vendas, Cenários de Decisão e mais para engajar sua equipe",
    color: "from-indigo-500 to-purple-500"
  },
  {
    icon: Brain,
    title: "Desenvolvimento de Skills",
    description: "Árvore de competências personalizável para rastrear o crescimento dos colaboradores",
    color: "from-cyan-500 to-blue-500"
  },
  {
    icon: BarChart3,
    title: "Analytics Avançados",
    description: "Dashboards executivos com métricas de ROI e relatórios de competências",
    color: "from-emerald-500 to-teal-500"
  },
  {
    icon: Trophy,
    title: "Competição Saudável",
    description: "Leaderboards, badges e insígnias para motivar performance contínua",
    color: "from-amber-500 to-orange-500"
  },
  {
    icon: Users,
    title: "Gestão de Times",
    description: "Organize equipes, acompanhe progresso e compare performance entre áreas",
    color: "from-pink-500 to-rose-500"
  },
  {
    icon: Shield,
    title: "Enterprise Ready",
    description: "Segurança corporativa, SSO, white-label e integrações personalizadas",
    color: "from-violet-500 to-purple-500"
  }
];

const benefits = [
  { value: "78%", label: "Aumento no engajamento", icon: TrendingUp },
  { value: "3x", label: "Mais retenção de conhecimento", icon: Brain },
  { value: "45%", label: "Redução no turnover", icon: Users },
  { value: "2h", label: "Implementação rápida", icon: Clock }
];

const games = [
  { name: "Quiz Master", description: "Perguntas por categoria com competição real-time", icon: "🧠", gradient: "from-purple-500/20 to-indigo-500/20" },
  { name: "Simulador de Vendas", description: "Treine conversas com IA e técnicas de negociação", icon: "💼", gradient: "from-blue-500/20 to-cyan-500/20" },
  { name: "Cenários de Decisão", description: "Desenvolva pensamento crítico e liderança", icon: "🎯", gradient: "from-amber-500/20 to-orange-500/20" },
  { name: "Cold Outreach", description: "Pratique prospecção via email e LinkedIn", icon: "📧", gradient: "from-emerald-500/20 to-teal-500/20" }
];

const testimonials = [
  {
    quote: "O GAMEIA transformou nosso onboarding. Novos vendedores atingem quota 40% mais rápido.",
    author: "Maria Silva",
    role: "VP de Vendas",
    company: "TechCorp Brasil",
    avatar: "MS"
  },
  {
    quote: "Finalmente conseguimos medir o ROI real dos nossos treinamentos corporativos.",
    author: "Carlos Santos",
    role: "Head de RH",
    company: "Grupo Inovação",
    avatar: "CS"
  },
  {
    quote: "A gamificação aumentou a participação nas trilhas de aprendizado em 300%.",
    author: "Ana Oliveira",
    role: "L&D Manager",
    company: "FinanceBank",
    avatar: "AO"
  }
];

// Floating shapes component
const FloatingShapes = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <motion.div
      animate={{ 
        y: [0, -20, 0],
        rotate: [0, 5, 0]
      }}
      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      className="absolute top-20 left-[10%] w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 blur-sm"
    />
    <motion.div
      animate={{ 
        y: [0, 20, 0],
        rotate: [0, -5, 0]
      }}
      transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      className="absolute top-40 right-[15%] w-12 h-12 rounded-full bg-gradient-to-br from-accent/20 to-primary/20 blur-sm"
    />
    <motion.div
      animate={{ 
        y: [0, -15, 0],
        x: [0, 10, 0]
      }}
      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      className="absolute bottom-32 left-[20%] w-20 h-20 rounded-3xl bg-gradient-to-br from-secondary/15 to-accent/15 blur-sm"
    />
    <motion.div
      animate={{ 
        scale: [1, 1.1, 1],
        opacity: [0.3, 0.5, 0.3]
      }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      className="absolute top-1/2 right-[8%] w-24 h-24 rounded-full bg-gradient-to-br from-primary/10 to-transparent blur-md"
    />
  </div>
);

export default function Landing() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 0.95]);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Header */}
      <header className="fixed top-0 w-full bg-background/80 backdrop-blur-xl border-b border-border/50 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Logo size="md" />
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Recursos
            </a>
            <a href="#games" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Jogos
            </a>
            <a href="#testimonials" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Cases
            </a>
            <Link to="/pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Preços
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/auth">
              <Button variant="ghost" size="sm">Entrar</Button>
            </Link>
            <Link to="/demo">
              <Button size="sm" className="bg-gradient-to-r from-primary to-secondary text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-shadow">
                <Sparkles className="h-4 w-4 mr-1" />
                Agendar Demo
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section ref={heroRef} className="relative pt-32 pb-24 px-4 overflow-hidden">
        <FloatingShapes />
        
        {/* Gradient orbs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-b from-primary/10 via-primary/5 to-transparent rounded-full blur-3xl pointer-events-none" />
        
        <motion.div 
          style={{ opacity: heroOpacity, scale: heroScale }}
          className="container mx-auto max-w-6xl relative z-10"
        >
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center"
          >
            <motion.span 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8 border border-primary/20"
            >
              <Zap className="h-4 w-4" />
              Plataforma de Treinamento Gamificado #1 do Brasil
              <ChevronRight className="h-4 w-4" />
            </motion.span>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-5xl md:text-7xl font-bold mb-8 leading-[1.1] tracking-tight"
            >
              Transforme Treinamentos em{" "}
              <span className="relative">
                <span className="text-gradient">Experiências</span>
                <motion.span
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ delay: 1, duration: 0.8 }}
                  className="absolute -bottom-2 left-0 h-1 bg-gradient-to-r from-primary to-secondary rounded-full"
                />
              </span>
              <br />
              <span className="text-gradient">Engajadoras</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-10 leading-relaxed"
            >
              O GAMEIA usa gamificação e IA para desenvolver competências, 
              aumentar engajamento e medir o ROI real dos seus programas.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link to="/demo">
                <Button size="lg" className="h-14 px-8 text-lg bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary shadow-xl shadow-primary/30 hover:shadow-primary/40 transition-all group">
                  <Play className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                  Começar Trial Grátis
                </Button>
              </Link>
              <Link to="/pricing">
                <Button size="lg" variant="outline" className="h-14 px-8 text-lg border-2 hover:bg-muted/50 group">
                  Ver Preços
                  <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="flex items-center justify-center gap-6 mt-8 text-sm text-muted-foreground"
            >
              <span className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                14 dias grátis
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                Sem cartão
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                Setup em 2h
              </span>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-b from-card to-background border-y border-border/50 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,hsl(var(--primary)/0.05),transparent_50%)]" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center group"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 text-primary mb-5 group-hover:scale-110 transition-transform duration-300">
                  <benefit.icon className="h-8 w-8" />
                </div>
                <div className="text-4xl md:text-5xl font-bold text-gradient mb-2">
                  {benefit.value}
                </div>
                <div className="text-muted-foreground font-medium">{benefit.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4 relative">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-sm font-medium text-primary mb-4 block"
            >
              RECURSOS
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-5xl font-bold mb-4"
            >
              Tudo que você precisa para{" "}
              <span className="text-gradient">treinar sua equipe</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              viewport={{ once: true }}
              className="text-xl text-muted-foreground max-w-2xl mx-auto"
            >
              Uma plataforma completa para criar, gerenciar e medir programas de treinamento gamificados
            </motion.p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="group relative p-6 h-full border-border/50 hover:border-primary/30 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:shadow-primary/5">
                  <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} text-white mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="h-7 w-7" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Games Section */}
      <section id="games" className="py-20 px-4 bg-card">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Jogos que{" "}
              <span className="text-gradient">desenvolvem competências</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Experiências interativas projetadas para maximizar aprendizado e retenção
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {games.map((game, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="gameia-card p-6 flex items-start gap-4">
                  <div className="text-4xl">{game.icon}</div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{game.name}</h3>
                    <p className="text-muted-foreground">{game.description}</p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <p className="text-muted-foreground mb-4">E muito mais: Memory Game, Snake, Tetris, Trilhas de Aprendizado...</p>
            <Link to="/demo">
              <Button variant="outline" size="lg">
                Ver Todos os Jogos
                <ChevronRight className="h-5 w-5 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-sm font-medium text-primary mb-4 block"
            >
              CASES DE SUCESSO
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-5xl font-bold mb-4"
            >
              Empresas que{" "}
              <span className="text-gradient">confiam no GAMEIA</span>
            </motion.h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                viewport={{ once: true }}
              >
                <Card className="relative p-8 h-full flex flex-col bg-gradient-to-b from-card to-card/50 border-border/50 hover:border-primary/30 transition-all duration-300 group">
                  {/* Quote mark */}
                  <div className="absolute top-6 right-6 text-6xl text-primary/10 font-serif leading-none">"</div>
                  
                  <div className="flex gap-1 mb-6">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  
                  <p className="text-foreground text-lg mb-8 flex-grow leading-relaxed">
                    "{testimonial.quote}"
                  </p>
                  
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-semibold">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <p className="font-semibold">{testimonial.author}</p>
                      <p className="text-sm text-muted-foreground">
                        {testimonial.role} • {testimonial.company}
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 mesh-background">
        <div className="container mx-auto max-w-4xl text-center">
          <Award className="h-16 w-16 text-primary mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Pronto para transformar seu treinamento?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Comece gratuitamente e veja os resultados em semanas, não meses.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/demo">
              <Button size="lg" className="btn-primary-gameia text-lg px-8">
                Começar Trial Grátis
              </Button>
            </Link>
            <Link to="/demo">
              <Button size="lg" variant="outline" className="text-lg px-8">
                Falar com Especialista
              </Button>
            </Link>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-6 mt-8 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-gameia-success" />
              Setup em 2 horas
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-gameia-success" />
              Suporte dedicado
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-gameia-success" />
              Cancele quando quiser
            </span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-card border-t border-border">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <Logo size="md" />
              <p className="text-muted-foreground mt-4">
                Plataforma líder em treinamento gamificado para empresas.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Produto</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground transition-colors">Recursos</a></li>
                <li><a href="#games" className="hover:text-foreground transition-colors">Jogos</a></li>
                <li><Link to="/pricing" className="hover:text-foreground transition-colors">Preços</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Empresa</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Sobre</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
                <li><Link to="/demo" className="hover:text-foreground transition-colors">Contato</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link to="/terms" className="hover:text-foreground transition-colors">Termos de Uso</Link></li>
                <li><Link to="/privacy" className="hover:text-foreground transition-colors">Privacidade</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground text-sm">
            © {new Date().getFullYear()} GAMEIA. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}
