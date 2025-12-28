import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Check, X, Zap, Building2, Rocket, Crown, ArrowLeft } from "lucide-react";
import { Logo } from "@/components/common/Logo";
import { motion } from "framer-motion";
import { useState } from "react";
import { cn } from "@/lib/utils";

const plans = [
  {
    name: "Free",
    description: "Para experimentar a plataforma",
    price: { monthly: 0, yearly: 0 },
    icon: Zap,
    color: "text-muted-foreground",
    bgColor: "bg-muted/50",
    features: [
      { text: "Até 5 usuários", included: true },
      { text: "3 quizzes por mês", included: true },
      { text: "Jogos básicos", included: true },
      { text: "Leaderboard simples", included: true },
      { text: "Relatórios básicos", included: false },
      { text: "Simulador de vendas", included: false },
      { text: "Suporte prioritário", included: false },
      { text: "White-label", included: false },
    ],
    cta: "Começar Grátis",
    popular: false
  },
  {
    name: "Starter",
    description: "Para pequenas equipes",
    price: { monthly: 299, yearly: 249 },
    icon: Rocket,
    color: "text-secondary",
    bgColor: "bg-secondary/10",
    features: [
      { text: "Até 25 usuários", included: true },
      { text: "Quizzes ilimitados", included: true },
      { text: "Todos os jogos", included: true },
      { text: "Leaderboards por time", included: true },
      { text: "Relatórios básicos", included: true },
      { text: "Simulador de vendas", included: true },
      { text: "Suporte por email", included: true },
      { text: "White-label", included: false },
    ],
    cta: "Começar Trial",
    popular: false
  },
  {
    name: "Business",
    description: "Para empresas em crescimento",
    price: { monthly: 799, yearly: 649 },
    icon: Building2,
    color: "text-primary",
    bgColor: "bg-primary/10",
    features: [
      { text: "Até 100 usuários", included: true },
      { text: "Quizzes ilimitados", included: true },
      { text: "Todos os jogos + IA", included: true },
      { text: "Gestão de times completa", included: true },
      { text: "Analytics avançados", included: true },
      { text: "API de integração", included: true },
      { text: "Suporte prioritário", included: true },
      { text: "Customização de marca", included: true },
    ],
    cta: "Começar Trial",
    popular: true
  },
  {
    name: "Enterprise",
    description: "Para grandes corporações",
    price: { monthly: null, yearly: null },
    icon: Crown,
    color: "text-accent",
    bgColor: "bg-accent/10",
    features: [
      { text: "Usuários ilimitados", included: true },
      { text: "Tudo do Business", included: true },
      { text: "SSO / SAML", included: true },
      { text: "Conteúdo customizado", included: true },
      { text: "Relatório executivo C-Level", included: true },
      { text: "Webhooks e integrações", included: true },
      { text: "SLA garantido", included: true },
      { text: "White-label completo", included: true },
    ],
    cta: "Falar com Vendas",
    popular: false
  }
];

const faqs = [
  {
    question: "O trial é realmente gratuito?",
    answer: "Sim! Você tem 14 dias para testar todas as funcionalidades do plano Business sem precisar cadastrar cartão de crédito."
  },
  {
    question: "Posso mudar de plano depois?",
    answer: "Claro! Você pode fazer upgrade ou downgrade a qualquer momento. A cobrança será proporcional ao período restante."
  },
  {
    question: "Como funciona o pagamento?",
    answer: "Aceitamos cartão de crédito, boleto e PIX. Para planos anuais, oferecemos desconto de até 20%."
  },
  {
    question: "Vocês oferecem desconto para ONGs ou startups?",
    answer: "Sim! Entre em contato conosco para conhecer nossos programas especiais para organizações sem fins lucrativos e startups early-stage."
  }
];

export default function Pricing() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 w-full bg-background/80 backdrop-blur-md border-b border-border z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/landing" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Link>
            <Logo size="md" />
          </div>
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

      {/* Hero */}
      <section className="pt-32 pb-16 px-4 mesh-background">
        <div className="container mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Planos para todos os{" "}
              <span className="text-gradient">tamanhos de equipe</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Comece grátis e escale conforme sua empresa cresce
            </p>

            {/* Billing Toggle */}
            <div className="inline-flex items-center gap-3 p-1 rounded-full bg-muted">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-colors",
                  billingCycle === 'monthly' 
                    ? "bg-card text-foreground shadow-sm" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Mensal
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2",
                  billingCycle === 'yearly' 
                    ? "bg-card text-foreground shadow-sm" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Anual
                <span className="px-2 py-0.5 rounded-full bg-gameia-success/20 text-gameia-success text-xs">
                  -20%
                </span>
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="relative"
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                    Mais Popular
                  </div>
                )}
                
                <Card className={cn(
                  "gameia-card p-6 h-full flex flex-col",
                  plan.popular && "border-primary ring-2 ring-primary/20"
                )}>
                  <div className={cn("inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4", plan.bgColor)}>
                    <plan.icon className={cn("h-6 w-6", plan.color)} />
                  </div>
                  
                  <h3 className="text-xl font-bold">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
                  
                  <div className="mb-6">
                    {plan.price.monthly !== null ? (
                      <>
                        <span className="text-4xl font-bold">
                          R${billingCycle === 'yearly' ? plan.price.yearly : plan.price.monthly}
                        </span>
                        <span className="text-muted-foreground">/mês</span>
                        {billingCycle === 'yearly' && plan.price.yearly > 0 && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Cobrado anualmente
                          </p>
                        )}
                      </>
                    ) : (
                      <span className="text-2xl font-bold">Sob consulta</span>
                    )}
                  </div>
                  
                  <ul className="space-y-3 mb-6 flex-grow">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-2">
                        {feature.included ? (
                          <Check className="h-5 w-5 text-gameia-success shrink-0 mt-0.5" />
                        ) : (
                          <X className="h-5 w-5 text-muted-foreground/50 shrink-0 mt-0.5" />
                        )}
                        <span className={cn(
                          "text-sm",
                          !feature.included && "text-muted-foreground/50"
                        )}>
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                  
                  <Link to={plan.name === 'Enterprise' ? '/demo' : '/demo'}>
                    <Button 
                      className={cn(
                        "w-full",
                        plan.popular ? "btn-primary-gameia" : ""
                      )}
                      variant={plan.popular ? "default" : "outline"}
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 bg-card">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-3xl font-bold text-center mb-12">
            Perguntas Frequentes
          </h2>
          
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="gameia-card p-6">
                  <h3 className="font-semibold mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ainda tem dúvidas?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Agende uma demonstração gratuita e veja o GAMEIA em ação
          </p>
          <Link to="/demo">
            <Button size="lg" className="btn-primary-gameia text-lg px-8">
              Agendar Demo Gratuita
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="container mx-auto text-center text-muted-foreground text-sm">
          © {new Date().getFullYear()} GAMEIA. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
}
