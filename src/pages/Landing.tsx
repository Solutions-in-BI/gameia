import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { 
  Trophy, Users, Brain, Target, Zap, BarChart3, 
  Gamepad2, Award, TrendingUp, Shield, Clock, Star,
  ChevronRight, Play, CheckCircle2
} from "lucide-react";
import { Logo } from "@/components/common/Logo";
import { motion } from "framer-motion";

const features = [
  {
    icon: Gamepad2,
    title: "Jogos Gamificados",
    description: "Quiz, Simulações de Vendas, Cenários de Decisão e mais para engajar sua equipe"
  },
  {
    icon: Brain,
    title: "Desenvolvimento de Skills",
    description: "Árvore de competências personalizável para rastrear o crescimento dos colaboradores"
  },
  {
    icon: BarChart3,
    title: "Analytics Avançados",
    description: "Dashboards executivos com métricas de ROI e relatórios de competências"
  },
  {
    icon: Trophy,
    title: "Competição Saudável",
    description: "Leaderboards, badges e insígnias para motivar performance contínua"
  },
  {
    icon: Users,
    title: "Gestão de Times",
    description: "Organize equipes, acompanhe progresso e compare performance entre áreas"
  },
  {
    icon: Shield,
    title: "Enterprise Ready",
    description: "Segurança corporativa, SSO, white-label e integrações personalizadas"
  }
];

const benefits = [
  { value: "78%", label: "Aumento no engajamento", icon: TrendingUp },
  { value: "3x", label: "Mais retenção de conhecimento", icon: Brain },
  { value: "45%", label: "Redução no turnover", icon: Users },
  { value: "2h", label: "Implementação rápida", icon: Clock }
];

const games = [
  { name: "Quiz Master", description: "Perguntas por categoria com competição real-time", icon: "🧠" },
  { name: "Simulador de Vendas", description: "Treine conversas com IA e técnicas de negociação", icon: "💼" },
  { name: "Cenários de Decisão", description: "Desenvolva pensamento crítico e liderança", icon: "🎯" },
  { name: "Cold Outreach", description: "Pratique prospecção via email e LinkedIn", icon: "📧" }
];

const testimonials = [
  {
    quote: "O GAMEIA transformou nosso onboarding. Novos vendedores atingem quota 40% mais rápido.",
    author: "Maria Silva",
    role: "VP de Vendas",
    company: "TechCorp Brasil"
  },
  {
    quote: "Finalmente conseguimos medir o ROI real dos nossos treinamentos corporativos.",
    author: "Carlos Santos",
    role: "Head de RH",
    company: "Grupo Inovação"
  },
  {
    quote: "A gamificação aumentou a participação nas trilhas de aprendizado em 300%.",
    author: "Ana Oliveira",
    role: "L&D Manager",
    company: "FinanceBank"
  }
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 w-full bg-background/80 backdrop-blur-md border-b border-border z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Logo size="md" />
          <nav className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
              Recursos
            </a>
            <a href="#games" className="text-muted-foreground hover:text-foreground transition-colors">
              Jogos
            </a>
            <a href="#testimonials" className="text-muted-foreground hover:text-foreground transition-colors">
              Cases
            </a>
            <Link to="/pricing" className="text-muted-foreground hover:text-foreground transition-colors">
              Preços
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/auth">
              <Button variant="ghost">Entrar</Button>
            </Link>
            <Link to="/demo">
              <Button className="btn-primary-gameia">
                Agendar Demo
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 mesh-background">
        <div className="container mx-auto max-w-6xl">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Zap className="h-4 w-4" />
              Plataforma de Treinamento Gamificado #1 do Brasil
            </span>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Transforme Treinamentos em{" "}
              <span className="text-gradient">Experiências Engajadoras</span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              O GAMEIA usa gamificação e IA para desenvolver competências, 
              aumentar engajamento e medir o ROI real dos seus programas de capacitação.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/demo">
                <Button size="lg" className="btn-primary-gameia text-lg px-8">
                  <Play className="h-5 w-5 mr-2" />
                  Começar Trial Grátis
                </Button>
              </Link>
              <Link to="/pricing">
                <Button size="lg" variant="outline" className="text-lg px-8">
                  Ver Preços
                  <ChevronRight className="h-5 w-5 ml-1" />
                </Button>
              </Link>
            </div>
            
            <p className="text-sm text-muted-foreground mt-4">
              ✓ 14 dias grátis &nbsp; ✓ Sem cartão de crédito &nbsp; ✓ Setup em 2 horas
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-card border-y border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-4">
                  <benefit.icon className="h-6 w-6" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-gradient mb-2">
                  {benefit.value}
                </div>
                <div className="text-muted-foreground">{benefit.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Tudo que você precisa para{" "}
              <span className="text-gradient">treinar sua equipe</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Uma plataforma completa para criar, gerenciar e medir programas de treinamento gamificados
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="gameia-card p-6 h-full">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-4">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
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
      <section id="testimonials" className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Empresas que{" "}
              <span className="text-gradient">confiam no GAMEIA</span>
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="gameia-card p-6 h-full flex flex-col">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-gameia-warning text-gameia-warning" />
                    ))}
                  </div>
                  <p className="text-foreground mb-6 flex-grow italic">
                    "{testimonial.quote}"
                  </p>
                  <div>
                    <p className="font-semibold">{testimonial.author}</p>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.role} • {testimonial.company}
                    </p>
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
