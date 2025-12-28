import { motion } from "framer-motion";
import { Check, ShoppingCart, Lock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RarityBadge, Rarity, getRarityOrder } from "./RarityBadge";
import { cn } from "@/lib/utils";

interface MarketplaceItem {
  id: string;
  name: string;
  description: string | null;
  icon: string;
  price: number;
  rarity: string;
  stock: number | null;
  is_featured: boolean;
  is_limited_edition: boolean;
}

interface MarketplaceItemCardProps {
  item: MarketplaceItem;
  isOwned: boolean;
  canAfford: boolean;
  onPurchase: () => void;
}

export function MarketplaceItemCard({ item, isOwned, canAfford, onPurchase }: MarketplaceItemCardProps) {
  const rarityOrder = getRarityOrder(item.rarity);
  
  // Background glow based on rarity
  const rarityGlow = {
    legendary: "before:bg-gradient-to-br before:from-amber-500/20 before:via-orange-500/10 before:to-transparent",
    epic: "before:bg-gradient-to-br before:from-purple-500/15 before:via-purple-500/5 before:to-transparent",
    rare: "before:bg-gradient-to-br before:from-blue-500/10 before:via-blue-500/5 before:to-transparent",
    uncommon: "",
    common: "",
  }[item.rarity] || "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card 
        className={cn(
          "relative overflow-hidden transition-all cursor-pointer group",
          "before:absolute before:inset-0 before:pointer-events-none",
          rarityGlow,
          isOwned && "ring-2 ring-green-500/50 bg-green-500/5",
          item.is_featured && "ring-2 ring-amber-500/50",
        )}
      >
        {/* Featured Badge */}
        {item.is_featured && !isOwned && (
          <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold py-1 px-2 text-center z-10">
            ⭐ Em Destaque
          </div>
        )}

        {/* Limited Edition Badge */}
        {item.is_limited_edition && item.stock !== null && (
          <div className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold py-1 px-2 rounded-bl z-10">
            🔥 {item.stock} restantes
          </div>
        )}

        {/* Owned Overlay */}
        {isOwned && (
          <div className="absolute top-2 right-2 z-10 bg-green-500 text-white rounded-full p-1">
            <Check className="h-4 w-4" />
          </div>
        )}

        <CardContent className={cn("p-4", item.is_featured && !isOwned && "pt-8")}>
          {/* Icon with hover animation */}
          <motion.div 
            className="text-center mb-3"
            whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
            transition={{ duration: 0.3 }}
          >
            <span className={cn(
              "text-5xl inline-block",
              rarityOrder >= 4 && "drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]",
              rarityOrder >= 5 && "drop-shadow-[0_0_12px_rgba(245,158,11,0.6)] animate-pulse",
            )}>
              {item.icon}
            </span>
          </motion.div>

          {/* Item Info */}
          <div className="text-center space-y-2">
            <h3 className="font-bold text-foreground line-clamp-1">{item.name}</h3>
            <RarityBadge rarity={item.rarity as Rarity} size="sm" />
            
            {item.description && (
              <p className="text-xs text-muted-foreground line-clamp-2 min-h-[2.5rem]">
                {item.description}
              </p>
            )}
          </div>

          {/* Price and Action */}
          <div className="mt-4 space-y-2">
            <div className="text-center">
              <span className="text-lg font-bold text-amber-500">
                🪙 {item.price.toLocaleString("pt-BR")}
              </span>
            </div>

            {isOwned ? (
              <Button 
                variant="outline" 
                className="w-full bg-green-500/10 text-green-500 border-green-500/30"
                disabled
              >
                <Check className="h-4 w-4 mr-2" />
                Adquirido
              </Button>
            ) : canAfford ? (
              <Button 
                onClick={onPurchase}
                className="w-full gap-2 group-hover:bg-primary/90"
              >
                <ShoppingCart className="h-4 w-4" />
                Comprar
              </Button>
            ) : (
              <Button 
                variant="outline" 
                className="w-full text-muted-foreground"
                disabled
              >
                <Lock className="h-4 w-4 mr-2" />
                Moedas insuficientes
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
