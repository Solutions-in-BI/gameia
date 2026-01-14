/**
 * EnhancedItemCard - Card de item com badges claros de tipo, regras e estado
 */

import { forwardRef } from "react";
import { motion } from "framer-motion";
import { 
  Check, Lock, Sparkles, Star, Zap, Gift, Clock, Award, 
  Shirt, Package, HandHeart, Crown, ShieldCheck 
} from "lucide-react";
import { MarketplaceItem } from "@/hooks/useMarketplace";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { RARITY_COLORS } from "@/constants/colors";

interface EnhancedItemCardProps {
  item: MarketplaceItem;
  owned: boolean;
  canAfford: boolean;
  onPurchase: () => void;
  index?: number;
}

// Behavior type configuration (functional type)
const BEHAVIOR_CONFIG = {
  equippable: { icon: Shirt, label: "Equipável", color: "text-accent bg-accent/10" },
  consumable: { icon: Zap, label: "Consumível", color: "text-primary bg-primary/10" },
  redeemable: { icon: HandHeart, label: "Benefício real", color: "text-gameia-success bg-gameia-success/10" },
  permanent: { icon: Crown, label: "Permanente", color: "text-gameia-info bg-gameia-info/10" },
};

// Item type display configuration
const ITEM_TYPE_CONFIG = {
  cosmetic: { icon: Sparkles, label: "Personalização", color: "text-accent" },
  boost: { icon: Zap, label: "Vantagem", color: "text-primary" },
  experience: { icon: Gift, label: "Experiência", color: "text-gameia-success" },
  functional: { icon: Star, label: "Funcional", color: "text-accent" },
};

// Determine behavior type from item
function getBehaviorType(item: MarketplaceItem): keyof typeof BEHAVIOR_CONFIG {
  // Check explicit behavior_type first
  const explicitBehavior = (item as any).behavior_type;
  if (explicitBehavior && BEHAVIOR_CONFIG[explicitBehavior as keyof typeof BEHAVIOR_CONFIG]) {
    return explicitBehavior as keyof typeof BEHAVIOR_CONFIG;
  }
  
  // Infer from category/item_type
  if (["avatar", "frame", "banner", "title", "pet", "mascot"].includes(item.category)) {
    return "equippable";
  }
  if (item.item_type === "boost" || item.category === "boost") {
    return "consumable";
  }
  if (item.requires_approval || ["experience", "benefit", "reward", "gift"].includes(item.category)) {
    return "redeemable";
  }
  if (item.category === "learning") {
    return "permanent";
  }
  return "consumable";
}

export const EnhancedItemCard = forwardRef<HTMLDivElement, EnhancedItemCardProps>(
  function EnhancedItemCard({ item, owned, canAfford, onPurchase, index = 0 }, ref) {
    const rarityKey = item.rarity as keyof typeof RARITY_COLORS || 'common';
    const rarityConfig = RARITY_COLORS[rarityKey] || RARITY_COLORS.common;
    const behaviorType = getBehaviorType(item);
    const behaviorConfig = BEHAVIOR_CONFIG[behaviorType];
    const typeConfig = ITEM_TYPE_CONFIG[(item.item_type || "cosmetic") as keyof typeof ITEM_TYPE_CONFIG] || ITEM_TYPE_CONFIG.cosmetic;
    
    const isLegendary = item.rarity === "legendary";
    const isBoost = item.item_type === "boost" || item.category === "boost";
    const hasExpiration = item.expires_after_purchase !== null && item.expires_after_purchase > 0;
    const requiresApproval = item.requires_approval;
    const isSingleUse = item.max_uses === 1;
    
    const BehaviorIcon = behaviorConfig.icon;

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: index * 0.03 }}
        whileHover={{ y: -4 }}
        className="group"
      >
      <div className={cn(
        "relative rounded-xl border bg-card overflow-hidden transition-all h-full flex flex-col",
        rarityConfig.border, rarityConfig.glow, owned && "opacity-70"
      )}>
        {/* Image/Icon Area */}
        <div className="relative aspect-square overflow-hidden bg-muted/30">
          {item.image_url ? (
            <img src={item.image_url} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted/50 to-muted">
              <span className="text-5xl group-hover:scale-110 transition-transform">{item.icon}</span>
            </div>
          )}
          
          {isLegendary && !owned && <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent pointer-events-none" />}
          
          {/* TOP LEFT: Behavior type badge (mandatory) */}
          <div className="absolute top-2 left-2">
            <span className={cn(
              "flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full backdrop-blur-sm",
              behaviorConfig.color
            )}>
              <BehaviorIcon className="w-3 h-3" />
              {behaviorConfig.label}
            </span>
          </div>

          {/* TOP RIGHT: Ownership or stock indicator */}
          {owned ? (
            <div className="absolute top-2 right-2">
              <div className="w-6 h-6 rounded-full bg-gameia-success flex items-center justify-center shadow-lg">
                <Check className="w-3.5 h-3.5 text-white" />
              </div>
            </div>
          ) : item.is_limited_edition && item.stock !== null ? (
            <div className="absolute top-2 right-2">
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-destructive/90 text-white">
                {item.stock} restantes
              </span>
            </div>
          ) : item.is_featured ? (
            <div className="absolute top-2 right-2">
              <span className="flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-primary text-primary-foreground">
                <Star className="w-3 h-3" /> Destaque
              </span>
            </div>
          ) : null}

          {/* BOTTOM LEFT: Rarity badge */}
          <div className="absolute bottom-2 left-2">
            <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium backdrop-blur-sm", rarityConfig.bgSubtle, rarityConfig.text)}>
              {rarityConfig.label}
            </span>
          </div>

          {/* BOTTOM RIGHT: Boost value if applicable */}
          {isBoost && item.boost_value && !owned && (
            <div className="absolute bottom-2 right-2">
              <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/90 text-primary-foreground">
                +{Math.round((item.boost_value - 1) * 100)}%
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-3 flex flex-col flex-1">
          <h3 className="font-medium text-sm line-clamp-1 mb-1">{item.name}</h3>
          
          {/* Rule badges (clear indicators) */}
          <div className="flex flex-wrap gap-1 mb-2">
            {isSingleUse && (
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                Uso único
              </span>
            )}
            {hasExpiration && (
              <span className="flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded bg-gameia-warning/10 text-gameia-warning">
                <Clock className="w-2.5 h-2.5" />
                Expira em {item.expires_after_purchase}d
              </span>
            )}
            {requiresApproval && (
              <span className="flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded bg-gameia-info/10 text-gameia-info">
                <ShieldCheck className="w-2.5 h-2.5" />
                Requer aprovação
              </span>
            )}
          </div>
          
          {item.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 mb-3 flex-1">{item.description}</p>
          )}

          <div className="mt-auto pt-2 border-t border-border/50">
            {owned ? (
              <div className="flex items-center justify-center gap-1.5 text-gameia-success text-sm py-1.5">
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
                    ? "bg-primary/10 text-primary hover:bg-primary/20" 
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
});
