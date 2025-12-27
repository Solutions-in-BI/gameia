import { useState } from "react";
import { ArrowLeft, Coins, ShoppingBag, Package, Sparkles, Gamepad2, Briefcase } from "lucide-react";
import { motion } from "framer-motion";
import { GameLayout } from "../common/GameLayout";
import { useMarketplace, MarketplaceItem } from "@/hooks/useMarketplace";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

interface MarketplacePageProps {
  onBack: () => void;
}

type Tab = "shop" | "inventory";
type CategorySection = "enterprise" | "recreation";
type Category = "all" | "avatar" | "frame" | "effect" | "banner" | "boost" | "title" | "pet";

// Enterprise categories (always available)
const ENTERPRISE_CATEGORIES: { key: Category; label: string; icon: string }[] = [
  { key: "all", label: "Todos", icon: "🛒" },
  { key: "avatar", label: "Avatares", icon: "😎" },
  { key: "frame", label: "Molduras", icon: "🖼️" },
  { key: "banner", label: "Banners", icon: "🎨" },
  { key: "title", label: "Títulos", icon: "📜" },
  { key: "pet", label: "Pets", icon: "🐾" },
];

// Recreation categories (for casual games only)
const RECREATION_CATEGORIES: { key: Category; label: string; icon: string }[] = [
  { key: "all", label: "Todos", icon: "🎮" },
  { key: "effect", label: "Efeitos", icon: "✨" },
  { key: "boost", label: "Boosts", icon: "🚀" },
];

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
  const [categorySection, setCategorySection] = useState<CategorySection>("enterprise");
  const [category, setCategory] = useState<Category>("all");
  
  const { items, inventory, coins, isLoading, purchaseItem, toggleEquip } = useMarketplace();
  const { isAuthenticated } = useAuth();

  // Filter items based on section and category
  const enterpriseCategories = ["avatar", "frame", "banner", "title", "pet"];
  const recreationCategories = ["effect", "boost"];
  
  const filteredItems = items.filter(item => {
    const isEnterpriseItem = enterpriseCategories.includes(item.category);
    const isRecreationItem = recreationCategories.includes(item.category);
    
    if (categorySection === "enterprise") {
      if (!isEnterpriseItem) return false;
      return category === "all" || item.category === category;
    } else {
      if (!isRecreationItem) return false;
      return category === "all" || item.category === category;
    }
  });

  const ownedIds = new Set(inventory.map(inv => inv.item_id));
  
  const currentCategories = categorySection === "enterprise" ? ENTERPRISE_CATEGORIES : RECREATION_CATEGORIES;

  const handleSectionChange = (section: CategorySection) => {
    setCategorySection(section);
    setCategory("all");
  };

  return (
    <GameLayout 
      title="Loja" 
      subtitle="Personalize sua experiência com itens exclusivos" 
      onBack={onBack}
    >
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

      {/* Tabs Loja/Inventário */}
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
          {/* Section Toggle: Empresarial vs Recreação */}
          <div className="flex justify-center gap-2 mb-4">
            <button
              onClick={() => handleSectionChange("enterprise")}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 font-medium transition-all",
                categorySection === "enterprise"
                  ? "bg-gradient-to-r from-primary/20 to-accent/20 border-primary text-primary shadow-sm"
                  : "bg-card border-border text-muted-foreground hover:border-primary/50"
              )}
            >
              <Briefcase className="w-5 h-5" />
              <div className="text-left">
                <div className="font-semibold">Gamificação</div>
                <div className="text-xs opacity-70">Avatares, Molduras, Títulos...</div>
              </div>
            </button>
            <button
              onClick={() => handleSectionChange("recreation")}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 font-medium transition-all",
                categorySection === "recreation"
                  ? "bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border-cyan-500 text-cyan-500 shadow-sm"
                  : "bg-card border-border text-muted-foreground hover:border-cyan-500/50"
              )}
            >
              <Gamepad2 className="w-5 h-5" />
              <div className="text-left">
                <div className="font-semibold">Recreação</div>
                <div className="text-xs opacity-70">Efeitos e Boosts para jogos</div>
              </div>
            </button>
          </div>

          {/* Category description */}
          <div className={cn(
            "text-center p-3 rounded-xl mb-4",
            categorySection === "enterprise" 
              ? "bg-primary/5 border border-primary/20" 
              : "bg-cyan-500/5 border border-cyan-500/20"
          )}>
            {categorySection === "enterprise" ? (
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Itens de Gamificação</span> - Personalize seu perfil profissional com avatares, molduras, banners, títulos e pets que aparecem em todo o sistema.
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Itens de Recreação</span> - Efeitos visuais e boosts exclusivos para os jogos casuais (Snake, Memory, Tetris, Dino).
              </p>
            )}
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap justify-center gap-2 mb-4">
            {currentCategories.map(cat => (
              <button
                key={cat.key}
                onClick={() => setCategory(cat.key)}
                className={cn(
                  "px-3 py-2 rounded-lg border text-sm font-medium transition-all flex items-center gap-1.5",
                  category === cat.key
                    ? categorySection === "enterprise"
                      ? "bg-primary/20 border-primary text-primary"
                      : "bg-cyan-500/20 border-cyan-500 text-cyan-500"
                    : "bg-card border-border text-muted-foreground hover:border-primary/50"
                )}
              >
                <span>{cat.icon}</span>
                <span className="hidden sm:inline">{cat.label}</span>
              </button>
            ))}
          </div>

          {/* Items Grid */}
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Carregando...</div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-12 bg-card/50 rounded-xl border border-border">
              <Package className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground font-medium">
                {categorySection === "enterprise" 
                  ? "Nenhum item de gamificação nesta categoria" 
                  : "Nenhum item de recreação nesta categoria"}
              </p>
              <p className="text-sm text-muted-foreground/70 mt-1">
                Volte mais tarde para novos itens!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredItems
                .sort((a, b) => {
                  // Ordenar por raridade e preço
                  const rarityOrder = { common: 1, rare: 2, epic: 3, legendary: 4 };
                  const aRarity = rarityOrder[a.rarity as keyof typeof rarityOrder] || 1;
                  const bRarity = rarityOrder[b.rarity as keyof typeof rarityOrder] || 1;
                  if (aRarity !== bRarity) return aRarity - bRarity;
                  return a.price - b.price;
                })
                .map(item => (
                <ItemCard
                  key={item.id}
                  item={item}
                  owned={ownedIds.has(item.id)}
                  canAfford={coins >= item.price}
                  onPurchase={() => purchaseItem(item.id)}
                  isRecreation={categorySection === "recreation"}
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
  isRecreation?: boolean;
}

function ItemCard({ item, owned, canAfford, onPurchase, isRecreation }: ItemCardProps) {
  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      avatar: "😎",
      frame: "🖼️",
      effect: "✨",
      banner: "🎨",
      boost: "🚀",
      title: "📜",
      pet: "🐾",
    };
    return icons[category] || "🛒";
  };

  return (
    <motion.div 
      className={cn(
        "relative bg-card border-2 rounded-xl p-4 transition-all hover:shadow-lg",
        RARITY_COLORS[item.rarity as keyof typeof RARITY_COLORS] || RARITY_COLORS.common,
        owned && "opacity-75"
      )}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Category icon badge */}
      <div className="absolute top-2 left-2">
        <span className={cn(
          "text-xs px-2 py-1 rounded-full flex items-center gap-1",
          isRecreation ? "bg-cyan-500/20 text-cyan-500" : "bg-primary/20 text-primary"
        )}>
          {getCategoryIcon(item.category)}
        </span>
      </div>
      
      {/* Rarity badge */}
      <div className="absolute top-2 right-2">
        <span className={cn(
          "text-xs px-2 py-1 rounded-full font-medium",
          item.rarity === "legendary" && "bg-gradient-to-r from-yellow-500/30 to-amber-500/30 text-yellow-500",
          item.rarity === "epic" && "bg-purple-500/20 text-purple-500",
          item.rarity === "rare" && "bg-blue-500/20 text-blue-500",
          item.rarity === "common" && "bg-muted text-muted-foreground"
        )}>
          {RARITY_LABELS[item.rarity as keyof typeof RARITY_LABELS]}
        </span>
      </div>

      {/* Icon */}
      <div className="text-5xl text-center my-6">
        {item.icon}
      </div>

      {/* Info */}
      <h3 className="font-semibold text-foreground text-center text-sm mb-1 line-clamp-1">{item.name}</h3>
      <p className="text-xs text-muted-foreground text-center mb-4 line-clamp-2 min-h-[2rem]">{item.description}</p>

      {/* Price/Action */}
      {owned ? (
        <div className="flex items-center justify-center gap-1.5 text-emerald-500 text-sm py-2 bg-emerald-500/10 rounded-lg">
          <Sparkles className="w-4 h-4" />
          <span className="font-medium">Adquirido</span>
        </div>
      ) : (
        <button
          onClick={onPurchase}
          disabled={!canAfford}
          className={cn(
            "w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all",
            canAfford
              ? "bg-gradient-to-r from-yellow-500/20 to-amber-500/20 text-yellow-600 hover:from-yellow-500/30 hover:to-amber-500/30 border border-yellow-500/30"
              : "bg-muted text-muted-foreground cursor-not-allowed"
          )}
        >
          <Coins className="w-4 h-4" />
          {item.price.toLocaleString()}
        </button>
      )}
    </motion.div>
  );
}

interface InventoryCardProps {
  item: MarketplaceItem;
  isEquipped: boolean;
  onToggle: () => void;
}

function InventoryCard({ item, isEquipped, onToggle }: InventoryCardProps) {
  const isRecreation = ["effect", "boost"].includes(item.category);
  
  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      avatar: "Avatar",
      frame: "Moldura",
      effect: "Efeito",
      banner: "Banner",
      boost: "Boost",
      title: "Título",
      pet: "Pet",
    };
    return labels[category] || category;
  };

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

      {/* Category badge */}
      <div className="absolute top-2 left-2">
        <span className={cn(
          "text-xs px-2 py-0.5 rounded-full flex items-center gap-1",
          isRecreation ? "bg-cyan-500/20 text-cyan-500" : "bg-muted text-muted-foreground"
        )}>
          {isRecreation && <Gamepad2 className="w-3 h-3" />}
          {getCategoryLabel(item.category)}
        </span>
      </div>

      <div className="text-5xl text-center mb-3 mt-4">
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
