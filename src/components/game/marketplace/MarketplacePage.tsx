import { useState } from "react";
import { ArrowLeft, Coins, ShoppingBag, Package, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { GameLayout } from "../common/GameLayout";
import { GameButton } from "../common/GameButton";
import { useMarketplace, MarketplaceItem } from "@/hooks/useMarketplace";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

interface MarketplacePageProps {
  onBack: () => void;
}

type Tab = "shop" | "inventory";
type Category = "all" | "avatar" | "frame" | "effect" | "banner" | "boost";

const CATEGORY_LABELS: Record<Category, { label: string; icon: string }> = {
  all: { label: "Todos", icon: "🛒" },
  avatar: { label: "Avatares", icon: "😎" },
  frame: { label: "Molduras", icon: "🖼️" },
  effect: { label: "Efeitos", icon: "✨" },
  banner: { label: "Banners", icon: "🎨" },
  boost: { label: "Boosts", icon: "🚀" },
};

const RARITY_COLORS = {
  common: "border-muted-foreground/30 bg-muted/20",
  rare: "border-blue-500/50 bg-blue-500/10",
  epic: "border-purple-500/50 bg-purple-500/10",
  legendary: "border-yellow-500/50 bg-yellow-500/10",
};

const RARITY_LABELS = {
  common: "Comum",
  rare: "Raro",
  epic: "Épico",
  legendary: "Lendário",
};

export function MarketplacePage({ onBack }: MarketplacePageProps) {
  const [activeTab, setActiveTab] = useState<Tab>("shop");
  const [category, setCategory] = useState<Category>("all");
  
  const { items, inventory, coins, isLoading, purchaseItem, toggleEquip } = useMarketplace();
  const { isAuthenticated } = useAuth();

  const filteredItems = category === "all" 
    ? items 
    : items.filter(item => item.category === category);

  const ownedIds = new Set(inventory.map(inv => inv.item_id));

  return (
    <GameLayout title="Marketplace" subtitle="Compre itens especiais com suas moedas" onBack={onBack}>
      {/* Header com moedas */}
      <div className="flex flex-wrap justify-center items-center gap-4 mb-6">
        <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border border-yellow-500/30 rounded-xl px-5 py-3 shadow-sm">
          <Coins className="w-6 h-6 text-yellow-500" />
          <span className="text-2xl font-bold text-yellow-500">{coins.toLocaleString()}</span>
          <span className="text-sm text-yellow-500/70">moedas</span>
        </div>

        {!isAuthenticated && (
          <p className="text-sm text-muted-foreground text-center">Faça login para comprar e ganhar moedas</p>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 max-w-md mx-auto">
        <button
          onClick={() => setActiveTab("shop")}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 font-medium transition-all",
            activeTab === "shop"
              ? "bg-primary/10 border-primary text-primary shadow-sm"
              : "bg-card border-border text-muted-foreground hover:border-primary/50"
          )}
        >
          <ShoppingBag className="w-5 h-5" />
          Loja
        </button>
        <button
          onClick={() => setActiveTab("inventory")}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 font-medium transition-all",
            activeTab === "inventory"
              ? "bg-primary/10 border-primary text-primary shadow-sm"
              : "bg-card border-border text-muted-foreground hover:border-primary/50"
          )}
        >
          <Package className="w-5 h-5" />
          Inventário
          {inventory.length > 0 && (
            <span className="bg-primary/20 text-primary text-xs px-2 py-0.5 rounded-full">
              {inventory.length}
            </span>
          )}
        </button>
      </div>

      {activeTab === "shop" ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Filtros */}
          <div className="flex flex-wrap justify-center gap-2 mb-4">
            {(Object.keys(CATEGORY_LABELS) as Category[]).map(cat => {
              const { label, icon } = CATEGORY_LABELS[cat];
              return (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={cn(
                    "px-3 py-2 rounded-lg border text-sm font-medium transition-all flex items-center gap-1.5",
                    category === cat
                      ? "bg-primary/20 border-primary text-primary"
                      : "bg-card border-border text-muted-foreground hover:border-primary/50"
                  )}
                >
                  <span>{icon}</span>
                  <span className="hidden sm:inline">{label}</span>
                </button>
              );
            })}
          </div>

          {/* Grid de itens */}
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Carregando...</div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum item nesta categoria
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {filteredItems.map(item => (
                <ItemCard
                  key={item.id}
                  item={item}
                  owned={ownedIds.has(item.id)}
                  canAfford={coins >= item.price}
                  onPurchase={() => purchaseItem(item.id)}
                />
              ))}
            </div>
          )}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {inventory.length === 0 ? (
            <div className="text-center py-12 bg-card/50 rounded-xl border border-border">
              <Package className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground font-medium">Seu inventário está vazio</p>
              <p className="text-sm text-muted-foreground/70 mt-1">Compre itens na loja!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {inventory.map(inv => inv.item && (
                <InventoryCard
                  key={inv.id}
                  item={inv.item}
                  isEquipped={inv.is_equipped}
                  onToggle={() => toggleEquip(inv.id, inv.item!.category)}
                />
              ))}
            </div>
          )}
        </motion.div>
      )}
    </GameLayout>
  );
}

interface ItemCardProps {
  item: MarketplaceItem;
  owned: boolean;
  canAfford: boolean;
  onPurchase: () => void;
}

function ItemCard({ item, owned, canAfford, onPurchase }: ItemCardProps) {
  return (
    <div className={cn(
      "relative bg-card border-2 rounded-xl p-4 transition-all",
      RARITY_COLORS[item.rarity as keyof typeof RARITY_COLORS] || RARITY_COLORS.common
    )}>
      {/* Badge de raridade */}
      <div className="absolute top-2 right-2">
        <span className={cn(
          "text-xs px-2 py-0.5 rounded-full",
          item.rarity === "legendary" && "bg-yellow-500/20 text-yellow-500",
          item.rarity === "epic" && "bg-purple-500/20 text-purple-500",
          item.rarity === "rare" && "bg-blue-500/20 text-blue-500",
          item.rarity === "common" && "bg-muted text-muted-foreground"
        )}>
          {RARITY_LABELS[item.rarity as keyof typeof RARITY_LABELS]}
        </span>
      </div>

      {/* Ícone */}
      <div className="text-5xl text-center mb-3 mt-2">
        {item.icon}
      </div>

      {/* Info */}
      <h3 className="font-medium text-foreground text-center text-sm mb-1">{item.name}</h3>
      <p className="text-xs text-muted-foreground text-center mb-3 line-clamp-2">{item.description}</p>

      {/* Preço/Ação */}
      {owned ? (
        <div className="flex items-center justify-center gap-1 text-green-500 text-sm">
          <Sparkles className="w-4 h-4" />
          <span>Adquirido</span>
        </div>
      ) : (
        <button
          onClick={onPurchase}
          disabled={!canAfford}
          className={cn(
            "w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all",
            canAfford
              ? "bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30"
              : "bg-muted text-muted-foreground cursor-not-allowed"
          )}
        >
          <Coins className="w-4 h-4" />
          {item.price.toLocaleString()}
        </button>
      )}
    </div>
  );
}

interface InventoryCardProps {
  item: MarketplaceItem;
  isEquipped: boolean;
  onToggle: () => void;
}

function InventoryCard({ item, isEquipped, onToggle }: InventoryCardProps) {
  return (
    <div className={cn(
      "relative bg-card border-2 rounded-xl p-4 transition-all",
      isEquipped ? "border-primary bg-primary/5" : "border-border"
    )}>
      {isEquipped && (
        <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
          Equipado
        </div>
      )}

      <div className="text-5xl text-center mb-3 mt-2">
        {item.icon}
      </div>

      <h3 className="font-medium text-foreground text-center text-sm mb-3">{item.name}</h3>

      <button
        onClick={onToggle}
        className={cn(
          "w-full py-2 rounded-lg text-sm font-medium transition-all",
          isEquipped
            ? "bg-muted text-muted-foreground"
            : "bg-primary/20 text-primary hover:bg-primary/30"
        )}
      >
        {isEquipped ? "Desequipar" : "Equipar"}
      </button>
    </div>
  );
}