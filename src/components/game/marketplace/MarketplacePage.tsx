import { useState, useMemo } from "react";
import { ShoppingBag, Package } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { GameLayout } from "../common/GameLayout";
import { useMarketplace } from "@/hooks/useMarketplace";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

// New components
import { MarketplaceHeader } from "./MarketplaceHeader";
import { FeaturedCarousel } from "./FeaturedCarousel";
import { CategoryFilters, CategorySection, Category, SortOption, ENTERPRISE_CATEGORIES, RECREATION_CATEGORIES } from "./CategoryFilters";
import { EnhancedItemCard } from "./EnhancedItemCard";
import { InventoryGrid } from "./InventoryGrid";

interface MarketplacePageProps {
  onBack: () => void;
}

type Tab = "shop" | "inventory";

export function MarketplacePage({ onBack }: MarketplacePageProps) {
  const [activeTab, setActiveTab] = useState<Tab>("shop");
  const [categorySection, setCategorySection] = useState<CategorySection>("enterprise");
  const [category, setCategory] = useState<Category>("all");
  const [sortBy, setSortBy] = useState<SortOption>("rarity");
  
  const { items, inventory, coins, isLoading, purchaseItem, toggleEquip, featuredItems } = useMarketplace();
  const { isAuthenticated } = useAuth();

  // Enterprise/Recreation category mapping
  const enterpriseCategories = ["avatar", "frame", "banner", "title", "pet"];
  const recreationCategories = ["effect", "boost"];

  // Filter and sort items
  const filteredItems = useMemo(() => {
    let filtered = items.filter(item => {
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

    // Sort items
    const rarityOrder = { common: 1, uncommon: 2, rare: 3, epic: 4, legendary: 5 };
    
    switch (sortBy) {
      case "rarity":
        filtered.sort((a, b) => {
          const aRarity = rarityOrder[a.rarity as keyof typeof rarityOrder] || 1;
          const bRarity = rarityOrder[b.rarity as keyof typeof rarityOrder] || 1;
          return bRarity - aRarity; // Higher rarity first
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

  return (
    <GameLayout 
      title="Loja" 
      subtitle="" 
      onBack={onBack}
    >
      {/* Custom Hero Header */}
      <MarketplaceHeader coins={coins} isAuthenticated={isAuthenticated} />

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6 max-w-md mx-auto">
        <motion.button
          onClick={() => setActiveTab("shop")}
          className={cn(
            "relative flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-all overflow-hidden",
            activeTab === "shop"
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground"
          )}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {activeTab === "shop" && (
            <motion.div
              layoutId="tab-indicator"
              className="absolute inset-0 bg-primary/10 border-2 border-primary rounded-xl"
              transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
            />
          )}
          <ShoppingBag className="w-5 h-5 relative z-10" />
          <span className="relative z-10">Loja</span>
        </motion.button>

        <motion.button
          onClick={() => setActiveTab("inventory")}
          className={cn(
            "relative flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-all overflow-hidden",
            activeTab === "inventory"
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground"
          )}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {activeTab === "inventory" && (
            <motion.div
              layoutId="tab-indicator"
              className="absolute inset-0 bg-primary/10 border-2 border-primary rounded-xl"
              transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
            />
          )}
          <Package className="w-5 h-5 relative z-10" />
          <span className="relative z-10">Inventário</span>
          {inventory.length > 0 && (
            <motion.span 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="relative z-10 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full ml-1"
            >
              {inventory.length}
            </motion.span>
          )}
        </motion.button>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === "shop" ? (
          <motion.div
            key="shop"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
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

            {/* Items Grid */}
            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {[...Array(10)].map((_, i) => (
                  <div 
                    key={i} 
                    className="h-64 rounded-2xl bg-card/50 border border-border animate-pulse"
                  />
                ))}
              </div>
            ) : filteredItems.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-16 bg-card/50 rounded-2xl border border-border"
              >
                <Package className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
                <p className="text-lg font-medium text-muted-foreground">
                  {categorySection === "enterprise" 
                    ? "Nenhum item de gamificação nesta categoria" 
                    : "Nenhum item de recreação nesta categoria"}
                </p>
                <p className="text-sm text-muted-foreground/70 mt-1">
                  Volte mais tarde para novos itens!
                </p>
              </motion.div>
            ) : (
              <motion.div 
                className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
                layout
              >
                {filteredItems.map((item, index) => (
                  <EnhancedItemCard
                    key={item.id}
                    item={item}
                    owned={ownedIds.has(item.id)}
                    canAfford={coins >= item.price}
                    onPurchase={() => purchaseItem(item.id)}
                    isRecreation={categorySection === "recreation"}
                    index={index}
                  />
                ))}
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="inventory"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <InventoryGrid
              inventory={inventory}
              onToggleEquip={toggleEquip}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </GameLayout>
  );
}
