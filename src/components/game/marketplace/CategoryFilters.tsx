import { motion } from "framer-motion";
import { Briefcase, Gift, Gamepad2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type CategorySection = "rewards" | "customization" | "recreation";
export type Category = "all" | "reward" | "experience" | "learning" | "gift" | "benefit" | "avatar" | "frame" | "banner" | "title" | "pet" | "effect" | "boost";
export type SortOption = "rarity" | "price_asc" | "price_desc" | "name";

// Rewards categories (real benefits)
export const REWARDS_CATEGORIES: { key: Category; label: string }[] = [
  { key: "all", label: "Todos" },
  { key: "reward", label: "Recompensas" },
  { key: "experience", label: "Experiências" },
  { key: "learning", label: "Desenvolvimento" },
  { key: "gift", label: "Presentes" },
  { key: "benefit", label: "Benefícios" },
];

// Customization categories
export const CUSTOMIZATION_CATEGORIES: { key: Category; label: string }[] = [
  { key: "all", label: "Todos" },
  { key: "avatar", label: "Avatares" },
  { key: "frame", label: "Molduras" },
  { key: "banner", label: "Banners" },
  { key: "title", label: "Títulos" },
  { key: "pet", label: "Mascotes" },
];

// Recreation categories
export const RECREATION_CATEGORIES: { key: Category; label: string }[] = [
  { key: "all", label: "Todos" },
  { key: "effect", label: "Efeitos" },
  { key: "boost", label: "Boosts" },
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
  const getCurrentCategories = () => {
    switch (section) {
      case "rewards": return REWARDS_CATEGORIES;
      case "customization": return CUSTOMIZATION_CATEGORIES;
      case "recreation": return RECREATION_CATEGORIES;
    }
  };

  const handleSectionChange = (newSection: CategorySection) => {
    onSectionChange(newSection);
    onCategoryChange("all");
  };

  return (
    <div className="space-y-4 mb-6">
      {/* Section Tabs */}
      <div className="flex justify-center">
        <div className="inline-flex bg-muted/50 rounded-lg p-1 gap-1">
          <button
            onClick={() => handleSectionChange("rewards")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
              section === "rewards" 
                ? "bg-background text-foreground shadow-sm" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Gift className="w-4 h-4" />
            <span className="hidden sm:inline">Benefícios</span>
          </button>
          <button
            onClick={() => handleSectionChange("customization")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
              section === "customization" 
                ? "bg-background text-foreground shadow-sm" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Briefcase className="w-4 h-4" />
            <span className="hidden sm:inline">Personalização</span>
          </button>
          <button
            onClick={() => handleSectionChange("recreation")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
              section === "recreation" 
                ? "bg-background text-foreground shadow-sm" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Gamepad2 className="w-4 h-4" />
            <span className="hidden sm:inline">Jogos</span>
          </button>
        </div>
      </div>

      {/* Category chips */}
      <div className="flex flex-wrap justify-center gap-2">
        {getCurrentCategories().map((cat) => (
          <button
            key={cat.key}
            onClick={() => onCategoryChange(cat.key)}
            className={cn(
              "px-3 py-1.5 rounded-md text-sm font-medium transition-all",
              category === cat.key
                ? "bg-primary text-primary-foreground"
                : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Sort options */}
      <div className="flex justify-center">
        <div className="inline-flex items-center gap-1 text-xs text-muted-foreground">
          <span>Ordenar:</span>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className="bg-transparent border-none text-xs font-medium text-foreground cursor-pointer focus:outline-none"
          >
            <option value="rarity">Raridade</option>
            <option value="price_asc">Menor preço</option>
            <option value="price_desc">Maior preço</option>
            <option value="name">Nome</option>
          </select>
        </div>
      </div>
    </div>
  );
}
