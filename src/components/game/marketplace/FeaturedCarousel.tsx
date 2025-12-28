import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Star, Flame, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { MarketplaceItem } from "@/hooks/useMarketplace";
import { RarityBadge } from "./RarityBadge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FeaturedCarouselProps {
  items: MarketplaceItem[];
  ownedIds: Set<string>;
  coins: number;
  onPurchase: (itemId: string) => void;
}

const RARITY_GLOW = {
  legendary: "shadow-[0_0_40px_rgba(245,158,11,0.3)]",
  epic: "shadow-[0_0_30px_rgba(168,85,247,0.25)]",
  rare: "shadow-[0_0_20px_rgba(59,130,246,0.2)]",
  uncommon: "shadow-[0_0_15px_rgba(34,197,94,0.15)]",
  common: "",
};

const RARITY_BORDER = {
  legendary: "border-amber-500/50 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-yellow-500/10",
  epic: "border-purple-500/50 bg-gradient-to-br from-purple-500/10 via-purple-500/5 to-pink-500/10",
  rare: "border-blue-500/50 bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-cyan-500/10",
  uncommon: "border-green-500/40 bg-gradient-to-br from-green-500/10 via-green-500/5 to-emerald-500/10",
  common: "border-border bg-card",
};

export function FeaturedCarousel({ items, ownedIds, coins, onPurchase }: FeaturedCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-advance carousel
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
    <div className="relative mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
        <h2 className="text-lg font-bold">Em Destaque</h2>
        <div className="flex-1 h-px bg-gradient-to-r from-amber-500/50 to-transparent" />
      </div>

      <div 
        className="relative overflow-hidden rounded-2xl"
        onMouseEnter={() => setIsAutoPlaying(false)}
        onMouseLeave={() => setIsAutoPlaying(true)}
      >
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
          className={cn(
            "relative p-6 md:p-8 border-2 rounded-2xl overflow-hidden",
            RARITY_BORDER[currentItem.rarity as keyof typeof RARITY_BORDER] || RARITY_BORDER.common,
            RARITY_GLOW[currentItem.rarity as keyof typeof RARITY_GLOW] || ""
          )}
        >
          {/* Shimmer for legendary */}
          {currentItem.rarity === "legendary" && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-500/10 to-transparent"
              animate={{ x: ["-100%", "100%"] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
          )}

          <div className="relative flex flex-col md:flex-row items-center gap-6">
            {/* Item Icon */}
            <motion.div
              className="relative"
              animate={{ 
                y: [0, -5, 0],
                rotate: currentItem.rarity === "legendary" ? [0, 2, -2, 0] : 0 
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <span className={cn(
                "text-7xl md:text-8xl inline-block",
                currentItem.rarity === "legendary" && "drop-shadow-[0_0_20px_rgba(245,158,11,0.5)]",
                currentItem.rarity === "epic" && "drop-shadow-[0_0_15px_rgba(168,85,247,0.4)]",
                currentItem.rarity === "rare" && "drop-shadow-[0_0_10px_rgba(59,130,246,0.3)]",
              )}>
                {currentItem.icon}
              </span>

              {/* Sparkle particles for rare+ */}
              {["rare", "epic", "legendary"].includes(currentItem.rarity) && (
                <>
                  <motion.div
                    className="absolute top-0 right-0 w-2 h-2 bg-white rounded-full"
                    animate={{ opacity: [0, 1, 0], scale: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0 }}
                  />
                  <motion.div
                    className="absolute bottom-2 left-0 w-1.5 h-1.5 bg-white rounded-full"
                    animate={{ opacity: [0, 1, 0], scale: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                  />
                  <motion.div
                    className="absolute top-4 -left-2 w-1 h-1 bg-white rounded-full"
                    animate={{ opacity: [0, 1, 0], scale: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                  />
                </>
              )}
            </motion.div>

            {/* Item Info */}
            <div className="flex-1 text-center md:text-left space-y-3">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                {currentItem.is_limited_edition && currentItem.stock !== null && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-500/20 text-red-500 text-xs font-bold">
                    <Flame className="w-3 h-3" />
                    Edição Limitada • {currentItem.stock} restantes
                  </span>
                )}
                <RarityBadge rarity={currentItem.rarity} size="md" />
              </div>

              <h3 className="text-2xl md:text-3xl font-bold">{currentItem.name}</h3>
              
              {currentItem.description && (
                <p className="text-muted-foreground max-w-md">
                  {currentItem.description}
                </p>
              )}

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2">
                <div className="flex items-center gap-2">
                  <span className="text-3xl">🪙</span>
                  <span className="text-2xl font-bold text-amber-500">
                    {currentItem.price.toLocaleString("pt-BR")}
                  </span>
                </div>

                {isOwned ? (
                  <Button variant="outline" className="bg-green-500/10 text-green-500 border-green-500/30" disabled>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Adquirido
                  </Button>
                ) : (
                  <Button 
                    onClick={() => onPurchase(currentItem.id)}
                    disabled={!canAfford}
                    className={cn(
                      "gap-2",
                      canAfford 
                        ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg"
                        : ""
                    )}
                  >
                    {canAfford ? "Comprar Agora" : "Moedas Insuficientes"}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Navigation Arrows */}
        {items.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/80 border border-border hover:bg-background transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/80 border border-border hover:bg-background transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {/* Dots indicator */}
      {items.length > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {items.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                setIsAutoPlaying(false);
                setCurrentIndex(idx);
              }}
              className={cn(
                "h-2 rounded-full transition-all",
                idx === currentIndex 
                  ? "w-6 bg-amber-500" 
                  : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
