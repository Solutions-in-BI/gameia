/**
 * CategoryFilters - Nova hierarquia de 4 camadas
 * Personalização | Vantagens | Desenvolvimento | Experiências
 */

import { motion } from "framer-motion";
import { Palette, Zap, GraduationCap, Gift } from "lucide-react";
import { cn } from "@/lib/utils";

export type CategorySection = "customization" | "advantages" | "development" | "experiences";
export type Category = "all" | "avatar" | "frame" | "banner" | "title" | "pet" | "mascot" | "boost" | "effect" | "learning" | "experience" | "benefit" | "reward" | "gift";
export type SortOption = "rarity" | "price_asc" | "price_desc" | "name";

// Section configuration with icons, labels, and descriptions
export const SECTION_CONFIG: Record<CategorySection, {
  icon: typeof Palette;
  label: string;
  shortLabel: string;
  description: string;
  categories: { key: Category; label: string }[];
}> = {
  customization: {
    icon: Palette,
    label: "Personalização",
    shortLabel: "Perfil",
    description: "Destaque-se com itens exclusivos para seu perfil",
    categories: [
      { key: "all", label: "Todos" },
      { key: "avatar", label: "Avatares" },
      { key: "frame", label: "Molduras" },
      { key: "banner", label: "Banners" },
      { key: "title", label: "Títulos" },
      { key: "pet", label: "Mascotes" },
    ],
  },
  advantages: {
    icon: Zap,
    label: "Vantagens",
    shortLabel: "Boosts",
    description: "Potencialize seus ganhos temporariamente",
    categories: [
      { key: "all", label: "Todos" },
      { key: "boost", label: "Multiplicadores" },
      { key: "effect", label: "Efeitos" },
    ],
  },
  development: {
    icon: GraduationCap,
    label: "Desenvolvimento",
    shortLabel: "Cursos",
    description: "Invista em conhecimento e crescimento",
    categories: [
      { key: "all", label: "Todos" },
      { key: "learning", label: "Cursos" },
    ],
  },
  experiences: {
    icon: Gift,
    label: "Experiências",
    shortLabel: "Benefícios",
    description: "Benefícios reais aprovados pelo seu gestor",
    categories: [
      { key: "all", label: "Todos" },
      { key: "experience", label: "Experiências" },
      { key: "benefit", label: "Benefícios" },
      { key: "reward", label: "Recompensas" },
      { key: "gift", label: "Presentes" },
    ],
  },
};

// Section order for display
export const SECTION_ORDER: CategorySection[] = ["customization", "advantages", "development", "experiences"];

// Category to section mapping
export const CATEGORY_TO_SECTION: Record<string, CategorySection> = {
  avatar: "customization",
  frame: "customization",
  banner: "customization",
  title: "customization",
  pet: "customization",
  mascot: "customization",
  boost: "advantages",
  effect: "advantages",
  learning: "development",
  experience: "experiences",
  benefit: "experiences",
  reward: "experiences",
  gift: "experiences",
};

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
  const currentSection = SECTION_CONFIG[section];

  const handleSectionChange = (newSection: CategorySection) => {
    onSectionChange(newSection);
    onCategoryChange("all");
  };

  return (
    <div className="space-y-4 mb-6">
      {/* Section Tabs */}
      <div className="flex justify-center">
        <div className="inline-flex bg-muted/50 rounded-xl p-1 gap-1">
          {SECTION_ORDER.map((sectionKey) => {
            const config = SECTION_CONFIG[sectionKey];
            const Icon = config.icon;
            const isActive = section === sectionKey;

            return (
              <motion.button
                key={sectionKey}
                onClick={() => handleSectionChange(sectionKey)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "relative flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all",
                  isActive 
                    ? "bg-background text-foreground shadow-sm" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className={cn("w-4 h-4", isActive && "text-primary")} />
                <span className="hidden sm:inline">{config.label}</span>
                <span className="sm:hidden">{config.shortLabel}</span>
                
                {/* Active indicator */}
                {isActive && (
                  <motion.div
                    layoutId="sectionIndicator"
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary"
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Section description */}
      <p className="text-center text-sm text-muted-foreground">
        {currentSection.description}
      </p>

      {/* Category chips */}
      <div className="flex flex-wrap justify-center gap-2">
        {currentSection.categories.map((cat) => (
          <motion.button
            key={cat.key}
            onClick={() => onCategoryChange(cat.key)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={cn(
              "px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
              category === cat.key
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {cat.label}
          </motion.button>
        ))}
      </div>

      {/* Sort options */}
      <div className="flex justify-center">
        <div className="inline-flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-lg">
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
