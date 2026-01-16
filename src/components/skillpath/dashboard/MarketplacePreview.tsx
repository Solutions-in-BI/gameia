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

import { RARITY_COLORS, ITEM_BEHAVIOR_COLORS, getRarityColors, getItemBehaviorColors } from "@/constants/colors";

// Map rarity to border/bg classes
const getRarityClasses = (rarity: string) => {
  const colors = getRarityColors(rarity);
  if (rarity === 'common') return "border-muted bg-muted/10";
  return `border-${rarity === 'legendary' ? 'primary' : rarity === 'epic' ? 'secondary' : rarity === 'rare' ? 'gameia-info' : 'gameia-success'}/30 ${colors.bg}`;
};

const BEHAVIOR_CONFIG = {
  equippable: { icon: Shirt, label: "Equipável", color: `${ITEM_BEHAVIOR_COLORS.equippable.text} ${ITEM_BEHAVIOR_COLORS.equippable.bg}` },
  consumable: { icon: Zap, label: "Vantagem", color: `${ITEM_BEHAVIOR_COLORS.consumable.text} ${ITEM_BEHAVIOR_COLORS.consumable.bg}` },
  redeemable: { icon: Gift, label: "Benefício", color: `${ITEM_BEHAVIOR_COLORS.redeemable.text} ${ITEM_BEHAVIOR_COLORS.redeemable.bg}` },
  permanent: { icon: GraduationCap, label: "Curso", color: `${ITEM_BEHAVIOR_COLORS.permanent.text} ${ITEM_BEHAVIOR_COLORS.permanent.bg}` },
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
                getRarityClasses(item.rarity)
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
                    getRarityColors(item.rarity).text
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
