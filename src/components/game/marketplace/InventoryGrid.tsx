import { useState } from "react";
import { motion } from "framer-motion";
import { Package, Gamepad2, Check, Sparkles, Clock, Zap, Gift, AlertTriangle } from "lucide-react";
import { InventoryItem, MarketplaceItem } from "@/hooks/useMarketplace";
import { RarityBadge } from "./RarityBadge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { BoostActivationModal } from "./BoostActivationModal";
import { ExperienceRequestModal } from "./ExperienceRequestModal";
import { useBoosts } from "@/hooks/useBoosts";
import { useExperiences } from "@/hooks/useExperiences";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

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
  reward: "Recompensa",
  experience: "Experiência",
  learning: "Aprendizado",
  gift: "Presente",
  benefit: "Benefício",
};

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  active: { label: "Ativo", color: "bg-green-500/20 text-green-400", icon: <Check className="w-3 h-3" /> },
  pending_approval: { label: "Aguardando", color: "bg-amber-500/20 text-amber-400", icon: <Clock className="w-3 h-3" /> },
  used: { label: "Usado", color: "bg-muted text-muted-foreground", icon: <Check className="w-3 h-3" /> },
  expired: { label: "Expirado", color: "bg-red-500/20 text-red-400", icon: <AlertTriangle className="w-3 h-3" /> },
};

export function InventoryGrid({ inventory, onToggleEquip }: InventoryGridProps) {
  const [selectedBoostItem, setSelectedBoostItem] = useState<InventoryItem | null>(null);
  const [selectedExperienceItem, setSelectedExperienceItem] = useState<InventoryItem | null>(null);
  
  const { activateBoost } = useBoosts();
  const { requestExperience } = useExperiences();

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

  // Transform inventory item to modal format
  const getBoostModalItem = (inv: InventoryItem | null) => {
    if (!inv?.item) return null;
    return {
      id: inv.id,
      item: {
        name: inv.item.name,
        icon: inv.item.icon,
        boost_type: inv.item.boost_type || "xp_multiplier",
        boost_value: inv.item.boost_value || 1.5,
        boost_duration_hours: inv.item.boost_duration_hours || 24,
      },
      uses_remaining: inv.uses_remaining ?? null,
    };
  };

  const getExperienceModalItem = (inv: InventoryItem | null) => {
    if (!inv?.item) return null;
    return {
      id: inv.id,
      item: {
        name: inv.item.name,
        icon: inv.item.icon,
        description: inv.item.description,
        usage_instructions: inv.item.usage_instructions,
      },
    };
  };

  return (
    <>
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
                  inventoryItem={inv}
                  item={inv.item}
                  isEquipped={inv.is_equipped}
                  onToggle={() => onToggleEquip(inv.id, inv.item!.category)}
                  onActivateBoost={() => setSelectedBoostItem(inv)}
                  onRequestExperience={() => setSelectedExperienceItem(inv)}
                  index={index}
                />
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modals */}
      <BoostActivationModal
        isOpen={!!selectedBoostItem}
        onClose={() => setSelectedBoostItem(null)}
        item={getBoostModalItem(selectedBoostItem)}
        onActivate={activateBoost}
      />

      <ExperienceRequestModal
        isOpen={!!selectedExperienceItem}
        onClose={() => setSelectedExperienceItem(null)}
        item={getExperienceModalItem(selectedExperienceItem)}
        onRequest={requestExperience}
      />
    </>
  );
}

interface InventoryCardProps {
  inventoryItem: InventoryItem;
  item: MarketplaceItem;
  isEquipped: boolean;
  onToggle: () => void;
  onActivateBoost: () => void;
  onRequestExperience: () => void;
  index: number;
}

function InventoryCard({ 
  inventoryItem, 
  item, 
  isEquipped, 
  onToggle, 
  onActivateBoost, 
  onRequestExperience,
  index 
}: InventoryCardProps) {
  const isRecreation = ["effect", "boost"].includes(item.category);
  const isBoost = item.item_type === "boost" || item.category === "boost";
  const isExperience = item.item_type === "experience" || item.requires_approval;
  const status = inventoryItem.status || "active";
  const statusConfig = STATUS_CONFIG[status];

  const isExpiringSoon = inventoryItem.expires_at && 
    new Date(inventoryItem.expires_at) > new Date() &&
    new Date(inventoryItem.expires_at) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const isExpired = inventoryItem.expires_at && new Date(inventoryItem.expires_at) < new Date();
  const hasActiveBoost = inventoryItem.boost_active_until && new Date(inventoryItem.boost_active_until) > new Date();

  const getActionButton = () => {
    if (isExpired || status === "expired" || status === "used") {
      return null;
    }

    if (hasActiveBoost) {
      return (
        <div className="w-full mt-3 text-xs text-center py-2 rounded-lg bg-primary/20 text-primary">
          <Zap className="w-3 h-3 inline mr-1" />
          Ativo até {formatDistanceToNow(new Date(inventoryItem.boost_active_until!), { locale: ptBR, addSuffix: true })}
        </div>
      );
    }

    if (isBoost) {
      return (
        <Button
          variant="ghost"
          size="sm"
          className="w-full mt-3 text-xs bg-amber-500/10 text-amber-500 hover:bg-amber-500/20"
          onClick={(e) => {
            e.stopPropagation();
            onActivateBoost();
          }}
        >
          <Zap className="w-3 h-3 mr-1" />
          Ativar Boost
        </Button>
      );
    }

    if (isExperience) {
      if (inventoryItem.approval_status === "pending") {
        return (
          <div className="w-full mt-3 text-xs text-center py-2 rounded-lg bg-amber-500/20 text-amber-400">
            <Clock className="w-3 h-3 inline mr-1" />
            Solicitado
          </div>
        );
      }
      return (
        <Button
          variant="ghost"
          size="sm"
          className="w-full mt-3 text-xs bg-cyan-500/10 text-cyan-500 hover:bg-cyan-500/20"
          onClick={(e) => {
            e.stopPropagation();
            onRequestExperience();
          }}
        >
          <Gift className="w-3 h-3 mr-1" />
          Solicitar
        </Button>
      );
    }

    // Default equip button for customization items
    return (
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
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -4 }}
      className={cn(
        "relative rounded-xl border-2 p-4 transition-all cursor-pointer group",
        isEquipped 
          ? "border-primary bg-primary/5 shadow-[0_0_20px_hsl(var(--primary)/0.15)]" 
          : isExpired
            ? "border-muted bg-muted/20 opacity-60"
            : isExpiringSoon
              ? "border-amber-500/50 bg-amber-500/5"
              : "border-border bg-card hover:border-primary/50"
      )}
      onClick={!isBoost && !isExperience ? onToggle : undefined}
    >
      {/* Status badge */}
      {status !== "active" && statusConfig && (
        <div className={cn("absolute top-2 right-2 flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full", statusConfig.color)}>
          {statusConfig.icon}
          <span>{statusConfig.label}</span>
        </div>
      )}

      {/* Equipped indicator */}
      {isEquipped && status === "active" && (
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

      {/* Expiration warning */}
      {isExpiringSoon && !isExpired && (
        <div className="absolute top-2 left-2">
          <span className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400">
            <Clock className="w-3 h-3" />
            Expira em breve
          </span>
        </div>
      )}

      {/* Item icon */}
      <motion.div
        className={cn("text-4xl text-center mb-2 mt-2", isExpired && "grayscale")}
        whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
      >
        {item.icon}
      </motion.div>

      {/* Item info */}
      <div className="text-center space-y-1">
        <h4 className="font-medium text-sm line-clamp-1">{item.name}</h4>
        <RarityBadge rarity={item.rarity} size="sm" />
        
        {/* Uses remaining */}
        {inventoryItem.uses_remaining !== undefined && inventoryItem.uses_remaining !== null && item.max_uses && (
          <p className="text-[10px] text-muted-foreground">
            {inventoryItem.uses_remaining}/{item.max_uses} usos
          </p>
        )}
      </div>

      {/* Action button */}
      {getActionButton()}
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
    reward: "🎁",
    experience: "🎯",
    learning: "📚",
    gift: "🎀",
    benefit: "⭐",
  };
  return icons[category] || "📦";
}
