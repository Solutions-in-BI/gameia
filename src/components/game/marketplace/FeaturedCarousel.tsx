import { forwardRef } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { MarketplaceItem } from "@/hooks/useMarketplace";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FeaturedCarouselProps {
  items: MarketplaceItem[];
  ownedIds: Set<string>;
  coins: number;
  onPurchase: (itemId: string) => void;
}

const RARITY_LABELS: Record<string, string> = {
  common: "Comum",
  uncommon: "Incomum",
  rare: "Raro",
  epic: "Épico",
  legendary: "Lendário",
};

export const FeaturedCarousel = forwardRef<HTMLDivElement, FeaturedCarouselProps>(
  function FeaturedCarousel({ items, ownedIds, coins, onPurchase }, ref) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying || items.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % items.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isAutoPlaying, items.length]);

  if (items.length === 0) return null;

  const prevSlide = () => {
    setIsAutoPlaying(false);
    setCurrentIndex(prev => (prev - 1 + items.length) % items.length);
  };

  const nextSlide = () => {
    setIsAutoPlaying(false);
    setCurrentIndex(prev => (prev + 1) % items.length);
  };

  const currentItem = items[currentIndex];
  const isOwned = ownedIds.has(currentItem.id);
  const canAfford = coins >= currentItem.price;

  return (
    <div ref={ref} className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-amber-500" />
        <h2 className="text-sm font-medium text-muted-foreground">Em destaque</h2>
      </div>

      <div 
        className="relative"
        onMouseEnter={() => setIsAutoPlaying(false)}
        onMouseLeave={() => setIsAutoPlaying(true)}
      >
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-card border border-border rounded-lg p-5"
        >
          <div className="flex flex-col sm:flex-row items-center gap-5">
            {/* Icon */}
            <div className="text-6xl shrink-0">
              {currentItem.icon}
            </div>

            {/* Info */}
            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                <h3 className="text-lg font-semibold">{currentItem.name}</h3>
                <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">
                  {RARITY_LABELS[currentItem.rarity] || currentItem.rarity}
                </span>
              </div>
              
              {currentItem.description && (
                <p className="text-sm text-muted-foreground mb-3">
                  {currentItem.description}
                </p>
              )}

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                <span className="text-lg font-semibold text-amber-600">
                  🪙 {currentItem.price.toLocaleString("pt-BR")}
                </span>

                {isOwned ? (
                  <Button variant="outline" size="sm" disabled className="text-green-600">
                    Adquirido
                  </Button>
                ) : (
                  <Button 
                    size="sm"
                    onClick={() => onPurchase(currentItem.id)}
                    disabled={!canAfford}
                    className={cn(
                      canAfford && "bg-primary hover:bg-primary/90"
                    )}
                  >
                    {canAfford ? "Adquirir" : "Moedas insuficientes"}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Navigation */}
        {items.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-background/90 border border-border hover:bg-muted transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-background/90 border border-border hover:bg-muted transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      {/* Dots */}
      {items.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-3">
          {items.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                setIsAutoPlaying(false);
                setCurrentIndex(idx);
              }}
              className={cn(
                "h-1.5 rounded-full transition-all",
                idx === currentIndex ? "w-4 bg-primary" : "w-1.5 bg-muted-foreground/30"
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
});
