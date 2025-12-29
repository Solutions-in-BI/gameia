import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { 
  ArrowRight,
  TrendingUp,
  Users,
  Briefcase,
  GraduationCap,
  Target,
  MessageSquare,
  CheckCircle2,
  BarChart3,
  Clock,
  Trophy,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SEOHead, SEO_CONFIG, TestimonialCard } from "@/components/marketing";
import { useTracking } from "@/hooks/useTracking";
import { Header, Footer } from "@/components/layout";

const USE_CASES = {
  vendas: {
    icon: Target,
    title: "Vendas",
    subtitle: "Aumente conversão e acelere ramp-up",
    problem: "Times comerciais demoram meses para atingir produtividade máxima, técnicas de vendas são esquecidas após treinamentos tradicionais, e não há forma de praticar antes de falar com clientes reais.",
    solution: "Simuladores de vendas com IA que permitem praticar roleplay ilimitado, cold outreach treinado com feedback em tempo real, e quizzes de produto/técnicas com rankings motivacionais.",
    benefits: [
      { value: "+32%", label: "Aumento em conversão", description: "após 90 dias de uso" },
      { value: "50%", label: "Menos tempo de ramp-up", description: "para novos vendedores" },
      { value: "+45%", label: "Taxa de resposta", description: "em prospecção ativa" },
    ],
    features: [
      "Simulador de vendas com personas IA customizáveis",
      "Prática de cold call e cold email com scoring",
      "Quizzes de produto, objeções e técnicas",
      "Rankings por equipe e individual",
      "Métricas de competências comerciais",
    ],
    testimonial: {
      quote: "Nosso time comercial aumentou a taxa de conversão em 32% após 3 meses. O simulador de vendas virou parte da rotina diária.",
      author: "Carlos Mendes",
      role: "Diretor Comercial",
      company: "TechCorp Brasil",
    },
  },
  operacoes: {
    icon: Briefcase,
    title: "Operações",
    subtitle: "Compliance, processos e melhoria contínua",
    problem: "Treinamentos de compliance são tediosos e esquecidos rapidamente, processos operacionais têm alta taxa de erro, e é difícil manter equipes atualizadas com mudanças.",
    solution: "Quizzes gamificados de compliance com certificação automática, simulações de processos com cenários de decisão, e trilhas de atualização contínua com notificações inteligentes.",
    benefits: [
      { value: "95%", label: "Taxa de conclusão", description: "vs 15% em e-learning tradicional" },
      { value: "-60%", label: "Erros operacionais", description: "após implementação" },
      { value: "100%", label: "Conformidade", description: "em auditorias" },
    ],
    features: [
      "Quizzes de compliance com certificação automática",
      "Cenários de decisão para processos críticos",
      "Trilhas de atualização contínua",
      "Alertas de vencimento de certificações",
      "Relatórios para auditoria e compliance",
    ],
    testimonial: {
      quote: "Zeramos as não-conformidades em auditoria. A gamificação transformou compliance de obrigação em engajamento.",
      author: "Fernanda Costa",
      role: "Gerente de Compliance",
      company: "Banco Digital SA",
    },
  },
  lideranca: {
    icon: Users,
    title: "Liderança",
    subtitle: "Desenvolva gestores e tomada de decisão",
    problem: "Líderes são promovidos sem preparo, tomada de decisão é inconsistente, e programas de liderança tradicionais são caros e pouco práticos.",
    solution: "Cenários de decisão baseados em situações reais de gestão, feedback 360 gamificado, trilhas de desenvolvimento de liderança com mentoria IA, e simulações de gestão de conflitos.",
    benefits: [
      { value: "87%", label: "Precisão em decisões", description: "após treinamento" },
      { value: "+40%", label: "Engajamento de equipes", description: "lideradas por usuários" },
      { value: "3x", label: "Mais feedback", description: "dado e recebido" },
    ],
    features: [
      "Cenários de decisão de gestão",
      "Avaliação 360 gamificada",
      "Simulações de conversas difíceis",
      "Trilhas de liderança personalizadas",
      "Mentoria IA para desenvolvimento",
    ],
    testimonial: {
      quote: "Os cenários de decisão mudaram a forma como nossos gerentes pensam. Vemos decisões mais consistentes e alinhadas.",
      author: "Roberto Almeida",
      role: "VP de RH",
      company: "Indústria Nacional",
    },
  },
  onboarding: {
    icon: GraduationCap,
    title: "Onboarding",
    subtitle: "Acelere integração e reduza turnover",
    problem: "Novos colaboradores demoram semanas para se tornarem produtivos, onboarding é burocrático e desengajante, e turnover nos primeiros meses é alto.",
    solution: "Jornadas de onboarding gamificadas com badges e progressão, quizzes de cultura e processos, trilhas personalizadas por cargo e área, e acompanhamento de progresso em tempo real.",
    benefits: [
      { value: "60%", label: "Menos tempo", description: "para produtividade máxima" },
      { value: "45%", label: "Menos turnover", description: "nos primeiros 12 meses" },
      { value: "98%", label: "Satisfação", description: "com o onboarding" },
    ],
    features: [
      "Trilhas de onboarding por cargo/área",
      "Quizzes de cultura e valores",
      "Badges de marcos importantes",
      "Integração com sistemas de RH",
      "Dashboard de progresso para gestores",
    ],
    testimonial: {
      quote: "O onboarding que levava 45 dias agora leva 18. Novos colaboradores chegam produtivos e engajados desde o primeiro dia.",
      author: "Ana Paula Silva",
      role: "Head de RH",
      company: "Varejo Plus",
    },
  },
};

type UseCaseKey = keyof typeof USE_CASES;

export default function UseCases() {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") as UseCaseKey | null;
  const [activeTab, setActiveTab] = useState<UseCaseKey>(
    initialTab && USE_CASES[initialTab] ? initialTab : "vendas"
  );
  
  const navigate = useNavigate();
  const { trackPageView, trackDemoClick, trackCTAClick } = useTracking();

  useEffect(() => {
    trackPageView("usecases");
  }, [trackPageView]);

  const handleDemoClick = () => {
    trackDemoClick(`usecases_${activeTab}`);
    navigate("/demo");
  };

  const currentCase = USE_CASES[activeTab];
  const CaseIcon = currentCase.icon;

  return (
    <div className="min-h-screen bg-background">
      <SEOHead {...SEO_CONFIG.useCases} />
      <Header />

      {/* Hero Section */}
      <section className="pt-24 pb-12 md:pt-32 md:pb-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <Badge variant="secondary" className="mb-4">
              <Zap className="w-3 h-3 mr-1" />
              Casos de uso reais
            </Badge>
            
            <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
              Como empresas usam{" "}
              <span className="text-primary">GAMEIA</span>
            </h1>
            
            <p className="text-lg text-muted-foreground mb-8">
              Descubra como transformar treinamentos em resultados mensuráveis 
              para vendas, operações, liderança e onboarding.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Tabs Section */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as UseCaseKey)} className="w-full">
            <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full max-w-2xl mx-auto mb-12 h-auto">
              {Object.entries(USE_CASES).map(([key, useCase]) => {
                const Icon = useCase.icon;
                return (
                  <TabsTrigger 
                    key={key} 
                    value={key}
                    className="flex flex-col gap-1 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    <Icon className="w-5 h-5" />
                    <span>{useCase.title}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {Object.entries(USE_CASES).map(([key, useCase]) => (
              <TabsContent key={key} value={key}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Use Case Header */}
                  <div className="text-center mb-12">
                    <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                      {useCase.title}
                    </h2>
                    <p className="text-lg text-muted-foreground">
                      {useCase.subtitle}
                    </p>
                  </div>

                  {/* Problem/Solution */}
                  <div className="grid md:grid-cols-2 gap-8 mb-12">
                    <Card className="p-6 border-destructive/20 bg-destructive/5">
                      <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-destructive"></span>
                        O Problema
                      </h3>
                      <p className="text-muted-foreground">{useCase.problem}</p>
                    </Card>

                    <Card className="p-6 border-primary/20 bg-primary/5">
                      <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-primary"></span>
                        A Solução GAMEIA
                      </h3>
                      <p className="text-foreground">{useCase.solution}</p>
                    </Card>
                  </div>

                  {/* Benefits */}
                  <div className="grid sm:grid-cols-3 gap-6 mb-12">
                    {useCase.benefits.map((benefit, index) => (
                      <motion.div
                        key={benefit.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="text-center p-6 rounded-xl bg-card border border-border"
                      >
                        <div className="text-4xl font-bold text-primary mb-2">
                          {benefit.value}
                        </div>
                        <div className="font-semibold text-foreground mb-1">
                          {benefit.label}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {benefit.description}
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Features */}
                  <Card className="p-6 mb-12">
                    <h3 className="text-lg font-semibold text-foreground mb-6">
                      Funcionalidades para {useCase.title}
                    </h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {useCase.features.map((feature, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                          <span className="text-foreground">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </Card>

                  {/* Testimonial */}
                  <div className="max-w-2xl mx-auto mb-12">
                    <TestimonialCard {...useCase.testimonial} />
                  </div>

                  {/* CTA */}
                  <div className="text-center">
                    <Button size="lg" onClick={handleDemoClick} className="gap-2">
                      Ver demo para {useCase.title}
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>

      {/* All Use Cases CTA */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Não encontrou seu caso de uso?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              A GAMEIA é altamente customizável. Fale com nosso time para 
              descobrir como podemos atender às suas necessidades específicas.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={handleDemoClick} className="gap-2">
                Ver demo gratuita
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate("/contato")}>
                Falar com especialista
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
