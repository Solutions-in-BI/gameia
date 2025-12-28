import { motion } from "framer-motion";
import { Check, ShoppingCart, Lock, Sparkles, Flame } from "lucide-react";
import { MarketplaceItem } from "@/hooks/useMarketplace";
import { RarityBadge } from "./RarityBadge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EnhancedItemCardProps {
  item: MarketplaceItem;
  owned: boolean;
  canAfford: boolean;
  onPurchase: () => void;
  isRecreation?: boolean;
  index?: number;
}

const RARITY_STYLES = {
  common: {
    border: "border-border",
    bg: "bg-card",
    glow: "",
    iconGlow: "",
  },
  uncommon: {
    border: "border-green-500/40",
    bg: "bg-gradient-to-b from-green-500/5 to-card",
    glow: "hover:shadow-[0_0_20px_rgba(34,197,94,0.15)]",
    iconGlow: "",
  },
  rare: {
    border: "border-blue-500/40",
    bg: "bg-gradient-to-b from-blue-500/10 to-card",
    glow: "shadow-[0_0_15px_rgba(59,130,246,0.1)] hover:shadow-[0_0_25px_rgba(59,130,246,0.2)]",
    iconGlow: "drop-shadow-[0_0_8px_rgba(59,130,246,0.4)]",
  },
  epic: {
    border: "border-purple-500/50",
    bg: "bg-gradient-to-b from-purple-500/10 to-card",
    glow: "shadow-[0_0_20px_rgba(168,85,247,0.15)] hover:shadow-[0_0_30px_rgba(168,85,247,0.25)]",
    iconGlow: "drop-shadow-[0_0_12px_rgba(168,85,247,0.5)]",
  },
  legendary: {
    border: "border-amber-500/50",
    bg: "bg-gradient-to-b from-amber-500/10 via-orange-500/5 to-card",
    glow: "shadow-[0_0_25px_rgba(245,158,11,0.2)] hover:shadow-[0_0_40px_rgba(245,158,11,0.3)]",
    iconGlow: "drop-shadow-[0_0_15px_rgba(245,158,11,0.6)]",
  },
};

const CATEGORY_ICONS: Record<string, string> = {
  avatar: "😎",
  frame: "🖼️",
  effect: "✨",
  banner: "🎨",
  boost: "🚀",
  title: "📜",
  pet: "🐾",
};

export function EnhancedItemCard({ 
  item, 
  owned, 
  canAfford, 
  onPurchase, 
  isRecreation,
  index = 0 
}: EnhancedItemCardProps) {
  const styles = RARITY_STYLES[item.rarity as keyof typeof RARITY_STYLES] || RARITY_STYLES.common;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ y: -6, scale: 1.02 }}
      className="group"
    >
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl border-2 p-4 transition-all duration-300",
          styles.border,
          styles.bg,
          styles.glow,
          owned && "ring-2 ring-green-500/30 opacity-80"
        )}
      >
        {/* Shimmer effect for legendary */}
        {item.rarity === "legendary" && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-500/10 to-transparent pointer-events-none"
            animate={{ x: ["-100%", "100%"] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
          />
        )}

        {/* Particle effects for epic */}
        {item.rarity === "epic" && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-purple-400 rounded-full"
                style={{ left: `${20 + i * 30}%`, top: "50%" }}
                animate={{
                  y: [0, -40, 0],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.5,
                }}
              />
            ))}
          </div>
        )}

        {/* Category badge */}
        <div className="absolute top-2 left-2 z-10">
          <span className={cn(
            "text-xs px-2 py-1 rounded-full flex items-center gap-1",
            isRecreation ? "bg-cyan-500/20 text-cyan-500" : "bg-primary/10 text-primary"
          )}>
            {CATEGORY_ICONS[item.category] || "🛒"}
          </span>
        </div>

        {/* Featured badge */}
        {item.is_featured && !owned && (
          <div className="absolute top-0 right-0 z-10">
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg">
              ⭐
            </div>
          </div>
        )}

        {/* Limited edition badge */}
        {item.is_limited_edition && item.stock !== null && (
          <div className="absolute top-2 right-2 z-10">
            <span className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-500 font-medium">
              <Flame className="w-3 h-3" />
              {item.stock}
            </span>
          </div>
        )}

        {/* Owned indicator */}
        {owned && (
          <div className="absolute top-2 right-2 z-10 bg-green-500 text-white rounded-full p-1 shadow-lg">
            <Check className="h-3 w-3" />
          </div>
        )}

        {/* Item Icon */}
        <motion.div
          className="relative text-center my-4"
          whileHover={{ scale: 1.15, rotate: [0, -5, 5, 0] }}
          transition={{ duration: 0.3 }}
        >
          <span className={cn(
            "text-5xl lg:text-6xl inline-block transition-all",
            styles.iconGlow,
            item.rarity === "legendary" && "animate-pulse"
          )}>
            {item.icon}
          </span>
        </motion.div>

        {/* Item Info */}
        <div className="text-center space-y-2 relative z-10">
          <h3 className="font-bold text-sm line-clamp-1">{item.name}</h3>
          <RarityBadge rarity={item.rarity} size="sm" />
          {item.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 min-h-[2rem] opacity-0 group-hover:opacity-100 transition-opacity">
              {item.description}
            </p>
          )}
        </div>

        {/* Price/Action */}
        <div className="mt-4 relative z-10">
          {owned ? (
            <div className="flex items-center justify-center gap-1.5 text-green-500 text-sm py-2.5 bg-green-500/10 rounded-xl border border-green-500/20">
              <Sparkles className="w-4 h-4" />
              <span className="font-medium">Adquirido</span>
            </div>
          ) : (
            <Button
              onClick={onPurchase}
              disabled={!canAfford}
              variant="ghost"
              className={cn(
                "w-full rounded-xl font-semibold transition-all",
                canAfford
                  ? "bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-600 hover:from-amber-500/30 hover:to-orange-500/30 border border-amber-500/30"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {canAfford ? (
                <>
                  <span className="mr-1">🪙</span>
                  {item.price.toLocaleString("pt-BR")}
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 mr-1" />
                  {item.price.toLocaleString("pt-BR")}
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
