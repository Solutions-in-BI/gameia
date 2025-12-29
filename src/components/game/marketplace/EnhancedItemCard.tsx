/**
 * Card de Item do Marketplace - Design Premium com suporte a imagens
 */

import { motion } from "framer-motion";
import { Check, Lock, Sparkles, Star } from "lucide-react";
import { MarketplaceItem } from "@/hooks/useMarketplace";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EnhancedItemCardProps {
  item: MarketplaceItem;
  owned: boolean;
  canAfford: boolean;
  onPurchase: () => void;
  index?: number;
}

const RARITY_CONFIG = {
  common: {
    badge: "bg-muted text-muted-foreground",
    border: "border-border hover:border-muted-foreground/50",
    glow: "",
    label: "Comum",
  },
  uncommon: {
    badge: "bg-green-500/10 text-green-600",
    border: "border-green-500/20 hover:border-green-500/40",
    glow: "",
    label: "Incomum",
  },
  rare: {
    badge: "bg-blue-500/10 text-blue-600",
    border: "border-blue-500/30 hover:border-blue-500/50",
    glow: "shadow-blue-500/10",
    label: "Raro",
  },
  epic: {
    badge: "bg-purple-500/10 text-purple-600",
    border: "border-purple-500/30 hover:border-purple-500/50",
    glow: "shadow-purple-500/20",
    label: "Épico",
  },
  legendary: {
    badge: "bg-amber-500/10 text-amber-600",
    border: "border-amber-500/30 hover:border-amber-500/50",
    glow: "shadow-amber-500/20 shadow-lg",
    label: "Lendário",
  },
};

export function EnhancedItemCard({ 
  item, 
  owned, 
  canAfford, 
  onPurchase, 
  index = 0 
}: EnhancedItemCardProps) {
  const config = RARITY_CONFIG[item.rarity as keyof typeof RARITY_CONFIG] || RARITY_CONFIG.common;
  const isLegendary = item.rarity === "legendary";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.03 }}
      whileHover={{ y: -4 }}
      className="group"
    >
      <div
        className={cn(
          "relative rounded-xl border bg-card overflow-hidden transition-all h-full flex flex-col",
          config.border,
          config.glow,
          owned && "opacity-70"
        )}
      >
        {/* Image/Icon Area */}
        <div className="relative aspect-square overflow-hidden bg-muted/30">
          {item.image_url ? (
            <img 
              src={item.image_url} 
              alt={item.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted/50 to-muted">
              <span className="text-5xl group-hover:scale-110 transition-transform">{item.icon}</span>
            </div>
          )}
          
          {/* Legendary glow effect */}
          {isLegendary && !owned && (
            <div className="absolute inset-0 bg-gradient-to-t from-amber-500/10 to-transparent pointer-events-none" />
          )}
          
          {/* Featured indicator */}
          {item.is_featured && !owned && (
            <div className="absolute top-2 left-2">
              <span className="flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-primary text-primary-foreground">
                <Star className="w-3 h-3" />
                Destaque
              </span>
            </div>
          )}

          {/* Owned indicator */}
          {owned && (
            <div className="absolute top-2 right-2">
              <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg">
                <Check className="w-3.5 h-3.5 text-white" />
              </div>
            </div>
          )}

          {/* Limited stock */}
          {item.is_limited_edition && item.stock !== null && !owned && (
            <div className="absolute top-2 right-2">
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-red-500/90 text-white">
                {item.stock} restantes
              </span>
            </div>
          )}
          
          {/* Rarity badge on image */}
          <div className="absolute bottom-2 left-2">
            <span className={cn(
              "text-[10px] px-2 py-0.5 rounded-full font-medium backdrop-blur-sm",
              config.badge
            )}>
              {config.label}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-3 flex flex-col flex-1">
          <h3 className="font-medium text-sm line-clamp-1 mb-1">{item.name}</h3>
          
          {item.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 mb-3 flex-1">
              {item.description}
            </p>
          )}

          {/* Price/Action */}
          <div className="mt-auto pt-2 border-t border-border/50">
            {owned ? (
              <div className="flex items-center justify-center gap-1.5 text-emerald-600 text-sm py-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span className="font-medium">Adquirido</span>
              </div>
            ) : (
              <Button
                onClick={onPurchase}
                disabled={!canAfford}
                variant="ghost"
                size="sm"
                className={cn(
                  "w-full text-sm h-9",
                  canAfford
                    ? "bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 hover:text-amber-700"
                    : "text-muted-foreground"
                )}
              >
                {canAfford ? (
                  <span className="flex items-center gap-1.5">
                    <span>🪙</span>
                    <span className="font-semibold">{item.price.toLocaleString("pt-BR")}</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5" />
                    <span>{item.price.toLocaleString("pt-BR")}</span>
                  </span>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
