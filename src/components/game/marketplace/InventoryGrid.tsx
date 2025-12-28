import { motion } from "framer-motion";
import { Package, Gamepad2, Check, Sparkles } from "lucide-react";
import { InventoryItem, MarketplaceItem } from "@/hooks/useMarketplace";
import { RarityBadge } from "./RarityBadge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface InventoryGridProps {
  inventory: InventoryItem[];
  onToggleEquip: (inventoryId: string, category: string) => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  avatar: "Avatar",
  frame: "Moldura",
  effect: "Efeito",
  banner: "Banner",
  boost: "Boost",
  title: "Título",
  pet: "Pet",
};

export function InventoryGrid({ inventory, onToggleEquip }: InventoryGridProps) {
  if (inventory.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-16 bg-card/50 rounded-2xl border border-border"
      >
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Package className="w-16 h-16 mx-auto text-muted-foreground/30" />
        </motion.div>
        <p className="text-lg font-medium text-muted-foreground mt-4">
          Seu inventário está vazio
        </p>
        <p className="text-sm text-muted-foreground/70 mt-1">
          Compre itens na loja para personalizá-los aqui!
        </p>
      </motion.div>
    );
  }

  // Group items by category
  const groupedItems = inventory.reduce((acc, inv) => {
    if (!inv.item) return acc;
    const category = inv.item.category;
    if (!acc[category]) acc[category] = [];
    acc[category].push(inv);
    return acc;
  }, {} as Record<string, InventoryItem[]>);

  return (
    <div className="space-y-6">
      {Object.entries(groupedItems).map(([category, items]) => (
        <motion.div
          key={category}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">{getCategoryIcon(category)}</span>
            <h3 className="font-semibold text-sm">{CATEGORY_LABELS[category] || category}</h3>
            <span className="text-xs text-muted-foreground">({items.length})</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {items.map((inv, index) => inv.item && (
              <InventoryCard
                key={inv.id}
                item={inv.item}
                isEquipped={inv.is_equipped}
                onToggle={() => onToggleEquip(inv.id, inv.item!.category)}
                index={index}
              />
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

interface InventoryCardProps {
  item: MarketplaceItem;
  isEquipped: boolean;
  onToggle: () => void;
  index: number;
}

function InventoryCard({ item, isEquipped, onToggle, index }: InventoryCardProps) {
  const isRecreation = ["effect", "boost"].includes(item.category);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -4 }}
      className={cn(
        "relative rounded-xl border-2 p-4 transition-all cursor-pointer group",
        isEquipped 
          ? "border-primary bg-primary/5 shadow-[0_0_20px_rgba(var(--primary),0.15)]" 
          : "border-border bg-card hover:border-primary/50"
      )}
      onClick={onToggle}
    >
      {/* Equipped indicator */}
      {isEquipped && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-2 -right-2 z-10"
        >
          <div className="bg-primary text-primary-foreground rounded-full p-1.5 shadow-lg">
            <Check className="w-3 h-3" />
          </div>
        </motion.div>
      )}

      {/* Recreation indicator */}
      {isRecreation && (
        <div className="absolute top-2 left-2">
          <span className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-500">
            <Gamepad2 className="w-3 h-3" />
          </span>
        </div>
      )}

      {/* Item icon */}
      <motion.div
        className="text-4xl text-center mb-2 mt-2"
        whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
      >
        {item.icon}
      </motion.div>

      {/* Item info */}
      <div className="text-center space-y-1">
        <h4 className="font-medium text-sm line-clamp-1">{item.name}</h4>
        <RarityBadge rarity={item.rarity} size="sm" />
      </div>

      {/* Equip button */}
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "w-full mt-3 text-xs transition-all",
          isEquipped
            ? "bg-muted text-muted-foreground"
            : "bg-primary/10 text-primary hover:bg-primary/20"
        )}
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
      >
        {isEquipped ? (
          <>Desequipar</>
        ) : (
          <>
            <Sparkles className="w-3 h-3 mr-1" />
            Equipar
          </>
        )}
      </Button>
    </motion.div>
  );
}

function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    avatar: "😎",
    frame: "🖼️",
    effect: "✨",
    banner: "🎨",
    boost: "🚀",
    title: "📜",
    pet: "🐾",
  };
  return icons[category] || "📦";
}
