/**
 * Preview da loja - itens em destaque com hierarquia clara
 */

import { motion } from "framer-motion";
import { 
  ShoppingBag, 
  Coins,
  Sparkles,
  ChevronRight,
  Shirt,
  Zap,
  Gift,
  GraduationCap
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
  item_type?: string;
  behavior_type?: string;
}

interface MarketplacePreviewProps {
  items: MarketplaceItem[];
  coins: number;
  onPurchase: (itemId: string) => Promise<{ success: boolean }>;
  onViewAll: () => void;
}

const RARITY_COLORS = {
  common: "border-muted bg-muted/10",
  uncommon: "border-green-400/30 bg-green-500/10",
  rare: "border-blue-400/30 bg-blue-500/10",
  epic: "border-purple-400/30 bg-purple-500/10",
  legendary: "border-yellow-400/30 bg-yellow-500/10",
};

const BEHAVIOR_CONFIG = {
  equippable: { icon: Shirt, label: "Equipável", color: "text-pink-500 bg-pink-500/10" },
  consumable: { icon: Zap, label: "Vantagem", color: "text-amber-500 bg-amber-500/10" },
  redeemable: { icon: Gift, label: "Benefício", color: "text-emerald-500 bg-emerald-500/10" },
  permanent: { icon: GraduationCap, label: "Curso", color: "text-blue-500 bg-blue-500/10" },
};

function getBehaviorType(item: MarketplaceItem): keyof typeof BEHAVIOR_CONFIG {
  if (item.behavior_type && item.behavior_type in BEHAVIOR_CONFIG) {
    return item.behavior_type as keyof typeof BEHAVIOR_CONFIG;
  }
  const cat = item.category;
  if (["avatar", "frame", "banner", "title", "pet"].includes(cat)) return "equippable";
  if (["boost", "effect"].includes(cat)) return "consumable";
  if (["experience", "benefit", "reward", "gift"].includes(cat)) return "redeemable";
  if (["learning"].includes(cat)) return "permanent";
  return "equippable";
}

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
        {featuredItems.map((item, i) => {
          const behaviorType = getBehaviorType(item);
          const behaviorConfig = BEHAVIOR_CONFIG[behaviorType];
          const BehaviorIcon = behaviorConfig.icon;
          
          return (
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
              {/* Behavior type badge */}
              <div className="absolute top-2 left-2">
                <span className={cn(
                  "flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full",
                  behaviorConfig.color
                )}>
                  <BehaviorIcon className="w-3 h-3" />
                </span>
              </div>

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
              <div className="text-4xl mb-3 text-center mt-4">{item.icon}</div>

              {/* Info */}
              <div className="text-center">
                <div className="font-medium text-sm text-foreground truncate">{item.name}</div>
                <div className="text-xs text-muted-foreground">
                  {behaviorConfig.label}
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
          );
        })}
      </div>
    </div>
  );
}
