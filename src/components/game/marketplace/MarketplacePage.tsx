/**
 * Página do Marketplace - Design Premium
 */

import { useState, useMemo } from "react";
import { ShoppingBag, Package, Store } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useMarketplace } from "@/hooks/useMarketplace";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/game/common/PageHeader";

// Components
import { FeaturedCarousel } from "./FeaturedCarousel";
import { CategoryFilters, CategorySection, Category, SortOption } from "./CategoryFilters";
import { EnhancedItemCard } from "./EnhancedItemCard";
import { InventoryGrid } from "./InventoryGrid";

interface MarketplacePageProps {
  onBack: () => void;
}

type Tab = "shop" | "inventory";

export function MarketplacePage({ onBack }: MarketplacePageProps) {
  const [activeTab, setActiveTab] = useState<Tab>("shop");
  const [categorySection, setCategorySection] = useState<CategorySection>("rewards");
  const [category, setCategory] = useState<Category>("all");
  const [sortBy, setSortBy] = useState<SortOption>("rarity");
  
  const { items, inventory, coins, isLoading, purchaseItem, toggleEquip, featuredItems } = useMarketplace();
  const { isAuthenticated } = useAuth();

  // Category mappings per section
  const sectionCategories: Record<CategorySection, string[]> = {
    rewards: ["reward", "experience", "learning", "gift", "benefit"],
    customization: ["avatar", "frame", "banner", "title", "pet"],
    recreation: ["effect", "boost"],
  };

  // Filter and sort items
  const filteredItems = useMemo(() => {
    const validCategories = sectionCategories[categorySection];
    
    let filtered = items.filter(item => {
      if (!validCategories.includes(item.category)) return false;
      return category === "all" || item.category === category;
    });

    // Sort items
    const rarityOrder = { common: 1, uncommon: 2, rare: 3, epic: 4, legendary: 5 };
    
    switch (sortBy) {
      case "rarity":
        filtered.sort((a, b) => {
          const aRarity = rarityOrder[a.rarity as keyof typeof rarityOrder] || 1;
          const bRarity = rarityOrder[b.rarity as keyof typeof rarityOrder] || 1;
          return bRarity - aRarity;
        });
        break;
      case "price_asc":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price_desc":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "name":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    return filtered;
  }, [items, categorySection, category, sortBy]);

  const ownedIds = useMemo(() => new Set(inventory.map(inv => inv.item_id)), [inventory]);

  // Section description
  const sectionDescriptions: Record<CategorySection, string> = {
    rewards: "Troque suas moedas por benefícios reais",
    customization: "Personalize seu perfil na plataforma",
    recreation: "Itens especiais para os jogos",
  };

  return (
    <div className="min-h-screen bg-background">
      <PageHeader 
        title="Loja de Recompensas" 
        subtitle="Troque suas moedas por benefícios"
        icon={<Store className="w-5 h-5 text-primary" />}
        coins={coins}
        showCoins={isAuthenticated}
      />

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Login prompt */}
        {!isAuthenticated && (
          <div className="mb-6 p-4 rounded-xl bg-muted/50 border border-border text-center">
            <p className="text-sm text-muted-foreground">
              Faça login para comprar e acumular moedas
            </p>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 max-w-sm mx-auto">
          <button
            onClick={() => setActiveTab("shop")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium transition-all",
              activeTab === "shop"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"
            )}
          >
            <ShoppingBag className="w-4 h-4" />
            Loja
          </button>

          <button
            onClick={() => setActiveTab("inventory")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium transition-all",
              activeTab === "inventory"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"
            )}
          >
            <Package className="w-4 h-4" />
            Inventário
            {inventory.length > 0 && (
              <span className={cn(
                "text-xs px-1.5 py-0.5 rounded-full",
                activeTab === "inventory" ? "bg-primary-foreground/20" : "bg-primary/20 text-primary"
              )}>
                {inventory.length}
              </span>
            )}
          </button>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === "shop" ? (
            <motion.div
              key="shop"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="space-y-6"
            >
              {/* Featured Carousel */}
              {featuredItems.length > 0 && (
                <FeaturedCarousel
                  items={featuredItems}
                  ownedIds={ownedIds}
                  coins={coins}
                  onPurchase={purchaseItem}
                />
              )}

              {/* Category Filters */}
              <CategoryFilters
                section={categorySection}
                category={category}
                sortBy={sortBy}
                onSectionChange={setCategorySection}
                onCategoryChange={setCategory}
                onSortChange={setSortBy}
              />

              {/* Section description */}
              <p className="text-center text-sm text-muted-foreground -mt-2">
                {sectionDescriptions[categorySection]}
              </p>

              {/* Items Grid */}
              {isLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="aspect-[3/4] rounded-xl bg-muted animate-pulse" />
                  ))}
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="text-center py-12 bg-card rounded-xl border border-border">
                  <Package className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
                  <p className="text-muted-foreground">
                    Nenhum item disponível nesta categoria
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredItems.map((item, index) => (
                    <EnhancedItemCard
                      key={item.id}
                      item={item}
                      owned={ownedIds.has(item.id)}
                      canAfford={coins >= item.price}
                      onPurchase={() => purchaseItem(item.id)}
                      index={index}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="inventory"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
            >
              <InventoryGrid
                inventory={inventory}
                onToggleEquip={toggleEquip}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
