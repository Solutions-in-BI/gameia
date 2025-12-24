/**
 * Componente de seleção de categorias do Quiz
 */

import { motion } from "framer-motion";
import { QuizCategory } from "@/hooks/useQuizGame";

interface QuizCategoriesProps {
  categories: QuizCategory[];
  onSelect: (categoryId: string) => void;
  isLoading: boolean;
}

export function QuizCategories({ categories, onSelect, isLoading }: QuizCategoriesProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {categories.map((category, index) => (
        <motion.button
          key={category.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          onClick={() => onSelect(category.id)}
          disabled={isLoading}
          className="p-6 rounded-xl border-2 border-border/50 bg-card/50 backdrop-blur-sm
                     hover:border-primary/50 hover:bg-card/80 transition-all duration-300
                     text-left group disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            borderColor: `${category.color}30`,
          }}
        >
          <div className="flex items-start gap-4">
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl
                         transition-transform duration-300 group-hover:scale-110"
              style={{
                backgroundColor: `${category.color}20`,
              }}
            >
              {category.icon}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-foreground mb-1">
                {category.name}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {category.description}
              </p>
            </div>
          </div>
        </motion.button>
      ))}
    </div>
  );
}
