import { motion } from "framer-motion";
import { Check, Lock, Sparkles } from "lucide-react";
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

const RARITY_STYLES = {
  common: {
    badge: "bg-muted text-muted-foreground",
    border: "border-border",
    label: "Comum",
  },
  uncommon: {
    badge: "bg-green-500/10 text-green-600",
    border: "border-green-500/20",
    label: "Incomum",
  },
  rare: {
    badge: "bg-blue-500/10 text-blue-600",
    border: "border-blue-500/30",
    label: "Raro",
  },
  epic: {
    badge: "bg-purple-500/10 text-purple-600",
    border: "border-purple-500/30",
    label: "Épico",
  },
  legendary: {
    badge: "bg-amber-500/10 text-amber-600",
    border: "border-amber-500/30",
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
  const styles = RARITY_STYLES[item.rarity as keyof typeof RARITY_STYLES] || RARITY_STYLES.common;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.03 }}
      whileHover={{ y: -3 }}
      className="group"
    >
      <div
        className={cn(
          "relative rounded-lg border bg-card p-4 transition-all h-full flex flex-col",
          styles.border,
          owned && "opacity-70"
        )}
      >
        {/* Featured indicator */}
        {item.is_featured && !owned && (
          <div className="absolute -top-2 left-3">
            <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-primary text-primary-foreground">
              Destaque
            </span>
          </div>
        )}

        {/* Owned indicator */}
        {owned && (
          <div className="absolute top-2 right-2">
            <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
              <Check className="w-3 h-3 text-white" />
            </div>
          </div>
        )}

        {/* Limited stock */}
        {item.is_limited_edition && item.stock !== null && !owned && (
          <div className="absolute top-2 right-2">
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-red-500/10 text-red-600">
              {item.stock} left
            </span>
          </div>
        )}

        {/* Item Icon */}
        <div className="text-4xl text-center py-4 group-hover:scale-105 transition-transform">
          {item.icon}
        </div>

        {/* Item Info */}
        <div className="text-center space-y-1.5 flex-1">
          <h3 className="font-medium text-sm line-clamp-1">{item.name}</h3>
          <span className={cn("inline-block text-[10px] px-2 py-0.5 rounded-full font-medium", styles.badge)}>
            {styles.label}
          </span>
          {item.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {item.description}
            </p>
          )}
        </div>

        {/* Price/Action */}
        <div className="mt-3 pt-3 border-t border-border">
          {owned ? (
            <div className="flex items-center justify-center gap-1.5 text-green-600 text-sm py-2">
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
                "w-full text-sm",
                canAfford
                  ? "bg-amber-500/10 text-amber-600 hover:bg-amber-500/20"
                  : "text-muted-foreground"
              )}
            >
              {canAfford ? (
                <span className="flex items-center gap-1.5">
                  <span>🪙</span>
                  <span>{item.price.toLocaleString("pt-BR")}</span>
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
    </motion.div>
  );
}
