/**
 * Hero Carousel Component
 * Carrossel animado para seção hero
 */

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  Play,
  Trophy,
  Target,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";

const slides = [
  {
    id: 1,
    title: "Transforme Treinamentos em Jogos",
    subtitle: "Gamificação Empresarial Inteligente",
    description: "Aumente o engajamento em até 78% e retenha conhecimento 3x mais rápido com nossa plataforma de gamificação corporativa.",
    icon: Trophy,
    gradient: "from-violet-600 via-purple-600 to-indigo-600",
    bgPattern: "radial-gradient(circle at 20% 50%, rgba(139, 92, 246, 0.15) 0%, transparent 50%)",
  },
  {
    id: 2,
    title: "Desenvolva Skills com IA",
    subtitle: "Aprendizado Personalizado",
    description: "Simulações realistas de vendas, cenários de decisão e quizzes adaptativos que evoluem com cada colaborador.",
    icon: Target,
    gradient: "from-emerald-600 via-teal-600 to-cyan-600",
    bgPattern: "radial-gradient(circle at 80% 50%, rgba(20, 184, 166, 0.15) 0%, transparent 50%)",
  },
  {
    id: 3,
    title: "Analytics em Tempo Real",
    subtitle: "Métricas que Importam",
    description: "Dashboard executivo com insights de performance, competências e ROI do seu programa de treinamento.",
    icon: Users,
    gradient: "from-orange-600 via-amber-600 to-yellow-600",
    bgPattern: "radial-gradient(circle at 50% 80%, rgba(245, 158, 11, 0.15) 0%, transparent 50%)",
  },
];

export const HeroCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(0);

  const nextSlide = useCallback(() => {
    setDirection(1);
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, []);

  const prevSlide = useCallback(() => {
    setDirection(-1);
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, []);

  useEffect(() => {
    const interval = setInterval(nextSlide, 6000);
    return () => clearInterval(interval);
  }, [nextSlide]);

  const slide = slides[currentSlide];
  const Icon = slide.icon;

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  };

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Background Pattern */}
      <div 
        className="absolute inset-0 transition-all duration-1000"
        style={{ background: slide.bgPattern }}
      />
      
      {/* Floating Shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className={`absolute top-20 left-10 w-72 h-72 rounded-full bg-gradient-to-r ${slide.gradient} opacity-10 blur-3xl`}
          animate={{ 
            x: [0, 50, 0], 
            y: [0, 30, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className={`absolute bottom-20 right-10 w-96 h-96 rounded-full bg-gradient-to-r ${slide.gradient} opacity-10 blur-3xl`}
          animate={{ 
            x: [0, -30, 0], 
            y: [0, -50, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentSlide}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 },
              }}
              className="text-center lg:text-left"
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${slide.gradient} bg-opacity-10 border border-primary/20 mb-6`}
              >
                <Icon className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">{slide.subtitle}</span>
              </motion.div>

              {/* Title */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6"
              >
                <span className={`bg-gradient-to-r ${slide.gradient} bg-clip-text text-transparent`}>
                  {slide.title}
                </span>
              </motion.h1>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0"
              >
                {slide.description}
              </motion.p>

              {/* CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
              >
                <Button size="lg" asChild className="gap-2 text-base">
                  <Link to="/auth?tab=signup">
                    <Sparkles className="h-5 w-5" />
                    Começar Trial Grátis
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="gap-2 text-base">
                  <Link to="/demo">
                    <Play className="h-5 w-5" />
                    Agendar Demo
                  </Link>
                </Button>
              </motion.div>
            </motion.div>
          </AnimatePresence>

          {/* Visual Element */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="hidden lg:flex items-center justify-center"
          >
            <div className={`relative w-80 h-80 rounded-3xl bg-gradient-to-br ${slide.gradient} p-1`}>
              <div className="w-full h-full rounded-3xl bg-background/90 backdrop-blur-xl flex items-center justify-center">
                <Icon className="h-32 w-32 text-primary/80" />
              </div>
              {/* Floating elements */}
              <motion.div
                className="absolute -top-4 -right-4 w-16 h-16 rounded-2xl bg-primary/20 backdrop-blur-xl flex items-center justify-center"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <span className="text-2xl">🎮</span>
              </motion.div>
              <motion.div
                className="absolute -bottom-4 -left-4 w-20 h-20 rounded-2xl bg-primary/20 backdrop-blur-xl flex items-center justify-center"
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                <span className="text-3xl">🏆</span>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-center lg:justify-start gap-4 mt-12">
          <button
            onClick={prevSlide}
            className="p-2 rounded-full bg-muted/50 hover:bg-muted transition-colors"
            aria-label="Slide anterior"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          
          <div className="flex gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setDirection(index > currentSlide ? 1 : -1);
                  setCurrentSlide(index);
                }}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentSlide
                    ? "w-8 bg-primary"
                    : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                }`}
                aria-label={`Ir para slide ${index + 1}`}
              />
            ))}
          </div>

          <button
            onClick={nextSlide}
            className="p-2 rounded-full bg-muted/50 hover:bg-muted transition-colors"
            aria-label="Próximo slide"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </section>
  );
};
