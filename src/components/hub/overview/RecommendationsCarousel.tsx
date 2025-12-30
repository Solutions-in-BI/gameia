/**
 * RecommendationsCarousel - Carrossel de recomendações para início
 */

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import useEmblaCarousel from "embla-carousel-react";
import { 
  Play, 
  Route, 
  GraduationCap, 
  Gamepad2, 
  Brain,
  Star,
  Coins,
  Award,
  ArrowRight,
  Sparkles,
  TrendingUp,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

export interface RecommendationItem {
  id: string;
  type: "journey" | "training" | "game" | "test" | "challenge";
  title: string;
  subtitle: string;
  description?: string;
  reason: string;
  progress?: number;
  reward: {
    xp?: number;
    coins?: number;
    certificate?: boolean;
    insignia?: string;
  };
  skills?: string[];
  thumbnail?: string;
  onClick: () => void;
}

interface RecommendationsCarouselProps {
  recommendations: RecommendationItem[];
  className?: string;
}

const TYPE_CONFIG = {
  journey: { 
    icon: Route, 
    label: "Jornada", 
    color: "from-primary/20 to-purple-500/10",
    iconColor: "text-primary"
  },
  training: { 
    icon: GraduationCap, 
    label: "Treinamento", 
    color: "from-blue-500/20 to-cyan-500/10",
    iconColor: "text-blue-500"
  },
  game: { 
    icon: Gamepad2, 
    label: "Jogo", 
    color: "from-purple-500/20 to-pink-500/10",
    iconColor: "text-purple-500"
  },
  test: { 
    icon: Brain, 
    label: "Teste Cognitivo", 
    color: "from-emerald-500/20 to-teal-500/10",
    iconColor: "text-emerald-500"
  },
  challenge: { 
    icon: Star, 
    label: "Desafio", 
    color: "from-amber-500/20 to-orange-500/10",
    iconColor: "text-amber-500"
  },
};

export function RecommendationsCarousel({ 
  recommendations, 
  className 
}: RecommendationsCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: true,
    align: "start"
  });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  // Subscribe to scroll events
  emblaApi?.on("select", onSelect);

  if (recommendations.length === 0) return null;

  return (
    <div className={cn("relative", className)}>
      {/* Carousel Container */}
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-4">
          {recommendations.map((rec) => (
            <RecommendationCard key={rec.id} {...rec} />
          ))}
        </div>
      </div>

      {/* Navigation */}
      {recommendations.length > 1 && (
        <>
          {/* Arrows */}
          <Button
            variant="outline"
            size="icon"
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm z-10 h-8 w-8"
            onClick={scrollPrev}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm z-10 h-8 w-8"
            onClick={scrollNext}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-4">
            {recommendations.map((_, index) => (
              <button
                key={index}
                className={cn(
                  "w-2 h-2 rounded-full transition-all",
                  index === selectedIndex 
                    ? "bg-primary w-6" 
                    : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                )}
                onClick={() => emblaApi?.scrollTo(index)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function RecommendationCard({
  type,
  title,
  subtitle,
  description,
  reason,
  progress,
  reward,
  skills,
  onClick
}: RecommendationItem) {
  const config = TYPE_CONFIG[type];
  const TypeIcon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "flex-[0_0_100%] min-w-0 relative overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-br cursor-pointer",
        config.color
      )}
      onClick={onClick}
    >
      {/* Decorative background */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-primary/5 to-transparent rounded-full blur-3xl" />
      
      <div className="relative p-5">
        <div className="space-y-3">
          {/* Type Badge + Reason */}
          <div className="flex flex-wrap items-center gap-2">
            <Badge 
              variant="secondary" 
              className={cn("gap-1 text-xs", config.iconColor)}
            >
              <TypeIcon className="w-3 h-3" />
              {config.label}
            </Badge>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              {reason}
            </span>
          </div>

          {/* Title */}
          <div>
            <h3 className="text-xl font-bold text-foreground line-clamp-1">
              {title}
            </h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              {subtitle}
            </p>
          </div>

          {/* Description */}
          {description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {description}
            </p>
          )}

          {/* Progress (if applicable) */}
          {typeof progress === "number" && progress > 0 && progress < 100 && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Progresso</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-1.5" />
            </div>
          )}

          {/* Skills */}
          {skills && skills.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span className="text-xs text-muted-foreground">Evolui:</span>
              {skills.slice(0, 2).map((skill, i) => (
                <Badge 
                  key={i} 
                  variant="outline" 
                  className="text-xs bg-background/50"
                >
                  {skill}
                </Badge>
              ))}
            </div>
          )}

          {/* Footer: Rewards + CTA */}
          <div className="flex items-center justify-between pt-3 border-t border-border/30">
            {/* Rewards */}
            <div className="flex items-center gap-3">
              {reward.xp && (
                <div className="flex items-center gap-1 text-sm">
                  <Star className="w-3.5 h-3.5 text-amber-500" />
                  <span className="font-semibold">{reward.xp}</span>
                  <span className="text-muted-foreground text-xs">XP</span>
                </div>
              )}
              {reward.coins && (
                <div className="flex items-center gap-1 text-sm">
                  <Coins className="w-3.5 h-3.5 text-yellow-500" />
                  <span className="font-semibold">{reward.coins}</span>
                </div>
              )}
              {reward.certificate && (
                <Award className="w-4 h-4 text-blue-500" />
              )}
            </div>

            {/* CTA */}
            <Button size="sm" className="gap-1">
              <Play className="w-3.5 h-3.5" />
              {progress ? "Continuar" : "Começar"}
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
