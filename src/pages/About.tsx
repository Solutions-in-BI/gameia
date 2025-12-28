/**
 * Sobre - Página institucional
 * Missão, visão e valores da GAMEIA
 */

import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Target,
  Eye,
  Heart,
  Users,
  Lightbulb,
  Rocket,
  Award,
  ArrowRight,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const values = [
  {
    icon: Heart,
    title: "Paixão por Pessoas",
    description: "Acreditamos que o desenvolvimento humano é a chave para o sucesso organizacional.",
  },
  {
    icon: Lightbulb,
    title: "Inovação Constante",
    description: "Buscamos sempre novas formas de tornar o aprendizado mais efetivo e engajador.",
  },
  {
    icon: Users,
    title: "Colaboração",
    description: "Trabalhamos junto com nossos clientes para criar soluções que realmente funcionam.",
  },
  {
    icon: Award,
    title: "Excelência",
    description: "Comprometimento com a qualidade em tudo que fazemos, do código ao suporte.",
  },
];

const timeline = [
  {
    year: "2021",
    title: "O Início",
    description: "Nascemos com a missão de revolucionar treinamentos corporativos através da gamificação.",
  },
  {
    year: "2022",
    title: "Primeiros Clientes",
    description: "Conquistamos nossos primeiros 50 clientes e validamos nossa proposta de valor.",
  },
  {
    year: "2023",
    title: "Expansão",
    description: "Lançamos novos módulos com IA e expandimos para toda América Latina.",
  },
  {
    year: "2024",
    title: "Enterprise",
    description: "Grandes corporações adotam a plataforma. +500 empresas confiam na GAMEIA.",
  },
];

const whyGamification = [
  "Aumenta retenção de conhecimento em até 90%",
  "Reduz tempo de treinamento em 40%",
  "Melhora engajamento dos colaboradores",
  "Fornece métricas precisas de desenvolvimento",
  "Cria cultura de aprendizado contínuo",
  "Acelera onboarding de novos funcionários",
];

const About = () => {
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
              Sobre Nós
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6"
            >
              Transformando o futuro do{" "}
              <span className="text-primary">aprendizado corporativo</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-muted-foreground max-w-2xl mx-auto"
            >
              Somos uma empresa de tecnologia apaixonada por criar experiências 
              de aprendizado que engajam, desenvolvem e transformam pessoas.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="p-8 rounded-2xl bg-background border border-border"
            >
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 mb-6">
                <Target className="h-7 w-7 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-4">Nossa Missão</h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Democratizar o acesso a treinamentos de alta qualidade através da gamificação, 
                tornando o desenvolvimento profissional uma experiência envolvente e efetiva 
                para empresas de todos os tamanhos.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="p-8 rounded-2xl bg-background border border-border"
            >
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 mb-6">
                <Eye className="h-7 w-7 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-4">Nossa Visão</h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Ser a plataforma líder em gamificação corporativa na América Latina, 
                reconhecida por transformar a forma como empresas desenvolvem seus talentos 
                e alcançam resultados extraordinários.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold mb-4"
            >
              Nossos <span className="text-primary">Valores</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-muted-foreground text-lg max-w-2xl mx-auto"
            >
              Os princípios que guiam nossas decisões e moldam nossa cultura
            </motion.p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-6 rounded-2xl bg-muted/30 border border-border text-center hover:border-primary/30 transition-colors"
              >
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 mb-4">
                  <value.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{value.title}</h3>
                <p className="text-sm text-muted-foreground">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 md:py-32 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold mb-4"
            >
              Nossa <span className="text-primary">Jornada</span>
            </motion.h2>
          </div>

          <div className="max-w-3xl mx-auto">
            {timeline.map((item, index) => (
              <motion.div
                key={item.year}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex gap-6 mb-8 last:mb-0"
              >
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
                    {item.year}
                  </div>
                  {index < timeline.length - 1 && (
                    <div className="w-0.5 h-full bg-border mt-2" />
                  )}
                </div>
                <div className="pb-8">
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Gamification */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4"
              >
                Por que Gamificação?
              </motion.span>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-3xl md:text-4xl font-bold mb-6"
              >
                A ciência por trás do <span className="text-primary">engajamento</span>
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="text-muted-foreground text-lg mb-8"
              >
                Gamificação utiliza elementos de jogos para criar experiências de aprendizado 
                mais envolventes. Quando aprendemos de forma divertida, nosso cérebro libera 
                dopamina, criando associações positivas e melhorando a retenção.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
              >
                <Button size="lg" asChild className="gap-2">
                  <Link to="/demo">
                    Agendar Demo
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="p-8 rounded-2xl bg-muted/30 border border-border"
            >
              <h3 className="text-xl font-semibold mb-6">Benefícios Comprovados</h3>
              <ul className="space-y-4">
                {whyGamification.map((item, index) => (
                  <motion.li
                    key={item}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                    <span>{item}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-primary/10 via-background to-primary/5">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto"
          >
            <Rocket className="h-12 w-12 text-primary mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Faça parte dessa transformação
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Junte-se a centenas de empresas que já estão revolucionando 
              seus programas de treinamento.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="gap-2">
                <Link to="/auth?tab=signup">
                  <Sparkles className="h-5 w-5" />
                  Começar Grátis
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/servicos">Conhecer Serviços</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
