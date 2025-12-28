import { motion } from "framer-motion";
import { Briefcase, Gamepad2, Filter, ArrowDownAZ, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

export type CategorySection = "enterprise" | "recreation";
export type Category = "all" | "avatar" | "frame" | "effect" | "banner" | "boost" | "title" | "pet";
export type SortOption = "rarity" | "price_asc" | "price_desc" | "name";

// Enterprise categories (always available)
export const ENTERPRISE_CATEGORIES: { key: Category; label: string; icon: string }[] = [
  { key: "all", label: "Todos", icon: "🛒" },
  { key: "avatar", label: "Avatares", icon: "😎" },
  { key: "frame", label: "Molduras", icon: "🖼️" },
  { key: "banner", label: "Banners", icon: "🎨" },
  { key: "title", label: "Títulos", icon: "📜" },
  { key: "pet", label: "Pets", icon: "🐾" },
];

// Recreation categories (for casual games only)
export const RECREATION_CATEGORIES: { key: Category; label: string; icon: string }[] = [
  { key: "all", label: "Todos", icon: "🎮" },
  { key: "effect", label: "Efeitos", icon: "✨" },
  { key: "boost", label: "Boosts", icon: "🚀" },
];

interface CategoryFiltersProps {
  section: CategorySection;
  category: Category;
  sortBy: SortOption;
  onSectionChange: (section: CategorySection) => void;
  onCategoryChange: (category: Category) => void;
  onSortChange: (sort: SortOption) => void;
}

export function CategoryFilters({
  section,
  category,
  sortBy,
  onSectionChange,
  onCategoryChange,
  onSortChange,
}: CategoryFiltersProps) {
  const currentCategories = section === "enterprise" ? ENTERPRISE_CATEGORIES : RECREATION_CATEGORIES;

  const handleSectionChange = (newSection: CategorySection) => {
    onSectionChange(newSection);
    onCategoryChange("all");
  };

  return (
    <div className="space-y-4 mb-6">
      {/* Section Toggle */}
      <div className="flex justify-center">
        <div className="inline-flex p-1 bg-card rounded-2xl border border-border">
          <motion.button
            onClick={() => handleSectionChange("enterprise")}
            className={cn(
              "relative flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all",
              section === "enterprise" ? "text-primary" : "text-muted-foreground hover:text-foreground"
            )}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {section === "enterprise" && (
              <motion.div
                layoutId="section-indicator"
                className="absolute inset-0 bg-primary/10 border border-primary/30 rounded-xl"
                transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
              />
            )}
            <Briefcase className="w-4 h-4 relative z-10" />
            <span className="relative z-10 hidden sm:inline">Gamificação</span>
          </motion.button>

          <motion.button
            onClick={() => handleSectionChange("recreation")}
            className={cn(
              "relative flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all",
              section === "recreation" ? "text-cyan-500" : "text-muted-foreground hover:text-foreground"
            )}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {section === "recreation" && (
              <motion.div
                layoutId="section-indicator"
                className="absolute inset-0 bg-cyan-500/10 border border-cyan-500/30 rounded-xl"
                transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
              />
            )}
            <Gamepad2 className="w-4 h-4 relative z-10" />
            <span className="relative z-10 hidden sm:inline">Recreação</span>
          </motion.button>
        </div>
      </div>

      {/* Category chips */}
      <div className="flex flex-wrap justify-center gap-2">
        {currentCategories.map((cat, index) => (
          <motion.button
            key={cat.key}
            onClick={() => onCategoryChange(cat.key)}
            className={cn(
              "relative px-3 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5",
              category === cat.key
                ? section === "enterprise"
                  ? "text-primary"
                  : "text-cyan-500"
                : "text-muted-foreground hover:text-foreground"
            )}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {category === cat.key && (
              <motion.div
                layoutId="category-indicator"
                className={cn(
                  "absolute inset-0 rounded-xl border",
                  section === "enterprise" 
                    ? "bg-primary/10 border-primary/30" 
                    : "bg-cyan-500/10 border-cyan-500/30"
                )}
                transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
              />
            )}
            <span className="relative z-10 text-lg">{cat.icon}</span>
            <span className="relative z-10 hidden sm:inline">{cat.label}</span>
          </motion.button>
        ))}
      </div>

      {/* Sort options */}
      <div className="flex justify-center gap-2">
        <div className="inline-flex items-center gap-1 p-1 bg-card rounded-lg border border-border text-xs">
          <Filter className="w-3 h-3 text-muted-foreground ml-2" />
          <button
            onClick={() => onSortChange("rarity")}
            className={cn(
              "px-2 py-1 rounded transition-colors",
              sortBy === "rarity" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <TrendingUp className="w-3 h-3 inline mr-1" />
            Raridade
          </button>
          <button
            onClick={() => onSortChange("price_asc")}
            className={cn(
              "px-2 py-1 rounded transition-colors",
              sortBy === "price_asc" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            💰 Menor
          </button>
          <button
            onClick={() => onSortChange("price_desc")}
            className={cn(
              "px-2 py-1 rounded transition-colors",
              sortBy === "price_desc" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            💰 Maior
          </button>
          <button
            onClick={() => onSortChange("name")}
            className={cn(
              "px-2 py-1 rounded transition-colors",
              sortBy === "name" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <ArrowDownAZ className="w-3 h-3 inline mr-1" />
            Nome
          </button>
        </div>
      </div>
    </div>
  );
}
