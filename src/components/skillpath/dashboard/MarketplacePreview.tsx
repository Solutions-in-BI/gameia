/**
 * Preview da loja - itens em destaque
 */

import { motion } from "framer-motion";
import { 
  ShoppingBag, 
  Coins,
  Sparkles,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface MarketplaceItem {
  id: string;
  name: string;
  icon: string;
  price: number;
  rarity: string;
  category: string;
}

interface MarketplacePreviewProps {
  items: MarketplaceItem[];
  coins: number;
  onPurchase: (itemId: string) => Promise<{ success: boolean }>;
  onViewAll: () => void;
}

const RARITY_COLORS = {
  common: "border-gray-400/30 bg-gray-500/10",
  uncommon: "border-green-400/30 bg-green-500/10",
  rare: "border-blue-400/30 bg-blue-500/10",
  epic: "border-purple-400/30 bg-purple-500/10",
  legendary: "border-yellow-400/30 bg-yellow-500/10",
};

const RARITY_LABELS = {
  common: "Comum",
  uncommon: "Incomum",
  rare: "Raro",
  epic: "Épico",
  legendary: "Lendário",
};

export function MarketplacePreview({ 
  items, 
  coins, 
  onPurchase, 
  onViewAll 
}: MarketplacePreviewProps) {
  // Pega 4 itens em destaque (mix de raridades)
  const featuredItems = items
    .sort((a, b) => {
      const rarityOrder = ["legendary", "epic", "rare", "uncommon", "common"];
      return rarityOrder.indexOf(a.rarity) - rarityOrder.indexOf(b.rarity);
    })
    .slice(0, 4);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-primary" />
          Loja
        </h2>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-sm font-medium text-warning">
            <Coins className="w-4 h-4" />
            {coins.toLocaleString()}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={onViewAll}
            className="text-muted-foreground hover:text-foreground"
          >
            Ver tudo
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {featuredItems.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className={cn(
              "relative p-4 rounded-2xl border backdrop-blur-sm",
              "hover:scale-[1.02] transition-all duration-200",
              RARITY_COLORS[item.rarity as keyof typeof RARITY_COLORS] || RARITY_COLORS.common
            )}
          >
            {/* Rarity indicator */}
            {item.rarity !== "common" && (
              <div className="absolute top-2 right-2">
                <Sparkles className={cn(
                  "w-4 h-4",
                  item.rarity === "legendary" && "text-yellow-400",
                  item.rarity === "epic" && "text-purple-400",
                  item.rarity === "rare" && "text-blue-400",
                  item.rarity === "uncommon" && "text-green-400",
                )} />
              </div>
            )}

            {/* Icon */}
            <div className="text-4xl mb-3 text-center">{item.icon}</div>

            {/* Info */}
            <div className="text-center">
              <div className="font-medium text-sm text-foreground truncate">{item.name}</div>
              <div className="text-xs text-muted-foreground capitalize">
                {RARITY_LABELS[item.rarity as keyof typeof RARITY_LABELS] || item.rarity}
              </div>
            </div>

            {/* Price */}
            <Button
              size="sm"
              variant={coins >= item.price ? "default" : "outline"}
              disabled={coins < item.price}
              onClick={() => onPurchase(item.id)}
              className="w-full mt-3 text-xs"
            >
              <Coins className="w-3 h-3 mr-1" />
              {item.price}
            </Button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
