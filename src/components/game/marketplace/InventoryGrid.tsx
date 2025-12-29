/**
 * InventoryGrid - Reorganizado por tipo funcional
 * Vestíveis | Vantagens Disponíveis | Vantagens Ativas | Benefícios | Pendentes | Histórico
 */

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { 
  Package, Check, Sparkles, Clock, Zap, Gift, AlertTriangle, 
  Shirt, History, Hourglass, HandHeart 
} from "lucide-react";
import { InventoryItem, MarketplaceItem } from "@/hooks/useMarketplace";
import { RarityBadge } from "./RarityBadge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { BoostActivationModal } from "./BoostActivationModal";
import { ExperienceRequestModal } from "./ExperienceRequestModal";
import { useBoosts } from "@/hooks/useBoosts";
import { useExperiences } from "@/hooks/useExperiences";
import { formatDistanceToNow, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";

interface InventoryGridProps {
  inventory: InventoryItem[];
  onToggleEquip: (inventoryId: string, category: string) => void;
}

// Functional group configuration
const GROUP_CONFIG = {
  equipped: { 
    icon: Shirt, 
    label: "Equipados", 
    description: "Itens ativos no seu perfil",
    color: "text-primary" 
  },
  equippable: { 
    icon: Sparkles, 
    label: "Vestíveis", 
    description: "Personalize seu perfil",
    color: "text-pink-500" 
  },
  boostsAvailable: { 
    icon: Zap, 
    label: "Vantagens Disponíveis", 
    description: "Ative para multiplicar seus ganhos",
    color: "text-amber-500" 
  },
  boostsActive: { 
    icon: Zap, 
    label: "Vantagens Ativas", 
    description: "Multiplicadores em uso",
    color: "text-green-500" 
  },
  benefitsAvailable: { 
    icon: Gift, 
    label: "Benefícios Disponíveis", 
    description: "Solicite uso ao seu gestor",
    color: "text-cyan-500" 
  },
  pending: { 
    icon: Hourglass, 
    label: "Aguardando Aprovação", 
    description: "Pendentes de liberação",
    color: "text-amber-500" 
  },
  history: { 
    icon: History, 
    label: "Histórico", 
    description: "Itens usados ou expirados",
    color: "text-muted-foreground" 
  },
};

export function InventoryGrid({ inventory, onToggleEquip }: InventoryGridProps) {
  const [selectedBoostItem, setSelectedBoostItem] = useState<InventoryItem | null>(null);
  const [selectedExperienceItem, setSelectedExperienceItem] = useState<InventoryItem | null>(null);
  
  const { activateBoost } = useBoosts();
  const { requestExperience } = useExperiences();

  // Group items by functional type
  const groupedItems = useMemo(() => {
    const groups: Record<string, InventoryItem[]> = {
      equipped: [],
      equippable: [],
      boostsAvailable: [],
      boostsActive: [],
      benefitsAvailable: [],
      pending: [],
      history: [],
    };

    inventory.forEach((inv) => {
      if (!inv.item) return;

      const isExpired = inv.expires_at && new Date(inv.expires_at) < new Date();
      const isUsed = inv.status === "used";
      const isPending = inv.approval_status === "pending";
      const hasActiveBoost = inv.boost_active_until && new Date(inv.boost_active_until) > new Date();
      const isEquippable = ["avatar", "frame", "banner", "title", "pet", "mascot"].includes(inv.item.category);
      const isBoost = inv.item.item_type === "boost" || inv.item.category === "boost";
      // Benefits include experiences, learning, and anything that requires approval
      const isBenefit = inv.item.requires_approval || 
        ["experience", "benefit", "reward", "gift", "learning"].includes(inv.item.category) ||
        inv.item.item_type === "experience";

      // Classify into groups
      if (isExpired || isUsed) {
        groups.history.push(inv);
      } else if (isPending) {
        groups.pending.push(inv);
      } else if (inv.is_equipped && isEquippable) {
        groups.equipped.push(inv);
      } else if (hasActiveBoost) {
        groups.boostsActive.push(inv);
      } else if (isBoost) {
        groups.boostsAvailable.push(inv);
      } else if (isBenefit) {
        groups.benefitsAvailable.push(inv);
      } else if (isEquippable) {
        groups.equippable.push(inv);
      } else {
        // Non-equippable cosmetic items go to benefits as a fallback
        groups.benefitsAvailable.push(inv);
      }
    });

    return groups;
  }, [inventory]);

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

  if (inventory.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-16 bg-card/50 rounded-2xl border border-border"
      >
        <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 2, repeat: Infinity }}>
          <Package className="w-16 h-16 mx-auto text-muted-foreground/30" />
        </motion.div>
        <p className="text-lg font-medium text-muted-foreground mt-4">Seu inventário está vazio</p>
        <p className="text-sm text-muted-foreground/70 mt-1">Compre itens na loja para personalizá-los aqui!</p>
      </motion.div>
    );
  }

  // Order to display groups
  const groupOrder: (keyof typeof GROUP_CONFIG)[] = [
    "equipped",
    "equippable", 
    "boostsActive",
    "boostsAvailable",
    "benefitsAvailable",
    "pending",
    "history",
  ];

  return (
    <>
      <div className="space-y-6">
        {groupOrder.map((groupKey) => {
          const items = groupedItems[groupKey];
          if (items.length === 0) return null;

          const config = GROUP_CONFIG[groupKey];
          const Icon = config.icon;

          return (
            <motion.div
              key={groupKey}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Icon className={cn("w-5 h-5", config.color)} />
                <div>
                  <h3 className="font-semibold text-sm">{config.label}</h3>
                  <p className="text-xs text-muted-foreground">{config.description}</p>
                </div>
                <span className="text-xs text-muted-foreground ml-2">({items.length})</span>
                <div className="flex-1 h-px bg-border ml-2" />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {items.map((inv, index) => inv.item && (
                  <InventoryCard
                    key={inv.id}
                    inventoryItem={inv}
                    item={inv.item}
                    groupKey={groupKey}
                    isEquipped={inv.is_equipped}
                    onToggle={() => onToggleEquip(inv.id, inv.item!.category)}
                    onActivateBoost={() => setSelectedBoostItem(inv)}
                    onRequestExperience={() => setSelectedExperienceItem(inv)}
                    index={index}
                  />
                ))}
              </div>
            </motion.div>
          );
        })}
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
  groupKey: string;
  isEquipped: boolean;
  onToggle: () => void;
  onActivateBoost: () => void;
  onRequestExperience: () => void;
  index: number;
}

function InventoryCard({ 
  inventoryItem, 
  item, 
  groupKey,
  isEquipped, 
  onToggle, 
  onActivateBoost, 
  onRequestExperience,
  index 
}: InventoryCardProps) {
  const isBoost = item.item_type === "boost" || item.category === "boost";
  const isBenefit = item.requires_approval || 
    ["experience", "benefit", "reward", "gift", "learning"].includes(item.category) ||
    item.item_type === "experience";
  const isHistory = groupKey === "history";
  const isPending = groupKey === "pending";
  const isActiveBoost = groupKey === "boostsActive";

  const isExpiringSoon = inventoryItem.expires_at && 
    new Date(inventoryItem.expires_at) > new Date() &&
    differenceInDays(new Date(inventoryItem.expires_at), new Date()) <= 7;

  const isExpired = inventoryItem.expires_at && new Date(inventoryItem.expires_at) < new Date();

  const getActionButton = () => {
    if (isHistory) return null;

    if (isActiveBoost && inventoryItem.boost_active_until) {
      return (
        <div className="w-full mt-3 text-xs text-center py-2 rounded-lg bg-green-500/20 text-green-500">
          <Zap className="w-3 h-3 inline mr-1" />
          Ativo {formatDistanceToNow(new Date(inventoryItem.boost_active_until), { locale: ptBR, addSuffix: true })}
        </div>
      );
    }

    if (isPending) {
      return (
        <div className="w-full mt-3 text-xs text-center py-2 rounded-lg bg-amber-500/20 text-amber-400">
          <Clock className="w-3 h-3 inline mr-1" />
          Aguardando aprovação
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
          Ativar
        </Button>
      );
    }

    if (isBenefit) {
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
          <HandHeart className="w-3 h-3 mr-1" />
          Solicitar uso
        </Button>
      );
    }

    // Default equip button
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
        {isEquipped ? "Desequipar" : (
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
      transition={{ delay: index * 0.03 }}
      whileHover={!isHistory ? { y: -4 } : undefined}
      className={cn(
        "relative rounded-xl border-2 p-4 transition-all",
        isEquipped 
          ? "border-primary bg-primary/5 shadow-[0_0_20px_hsl(var(--primary)/0.15)]" 
          : isHistory
            ? "border-muted bg-muted/20 opacity-60"
            : isExpiringSoon
              ? "border-amber-500/50 bg-amber-500/5"
              : isPending
                ? "border-amber-500/30 bg-amber-500/5"
                : isActiveBoost
                  ? "border-green-500/50 bg-green-500/5"
                  : "border-border bg-card hover:border-primary/50 cursor-pointer group"
      )}
      onClick={!isBoost && !isBenefit && !isHistory && !isPending ? onToggle : undefined}
    >
      {/* Status indicators */}
      {isEquipped && (
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-2 -right-2 z-10">
          <div className="bg-primary text-primary-foreground rounded-full p-1.5 shadow-lg">
            <Check className="w-3 h-3" />
          </div>
        </motion.div>
      )}

      {isExpiringSoon && !isExpired && !isHistory && (
        <div className="absolute top-2 left-2">
          <span className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400">
            <Clock className="w-3 h-3" />
            {inventoryItem.expires_at && (
              <>Expira em {differenceInDays(new Date(inventoryItem.expires_at), new Date())}d</>
            )}
          </span>
        </div>
      )}

      {isHistory && (
        <div className="absolute top-2 right-2">
          <span className="flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
            {isExpired ? (
              <><AlertTriangle className="w-2.5 h-2.5" /> Expirado</>
            ) : (
              <><Check className="w-2.5 h-2.5" /> Usado</>
            )}
          </span>
        </div>
      )}

      {/* Item icon */}
      <motion.div
        className={cn("text-4xl text-center mb-2 mt-2", isHistory && "grayscale")}
        whileHover={!isHistory ? { scale: 1.1, rotate: [0, -5, 5, 0] } : undefined}
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
