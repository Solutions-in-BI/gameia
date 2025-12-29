/**
 * BadgesShowcase - Exibe insígnias do usuário
 * Agora usa useInsignias (sistema unificado)
 */
import { motion } from "framer-motion";
import { Lock, Award, Star, Sparkles } from "lucide-react";
import { useInsignias } from "@/hooks/useInsignias";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

// Categorias de insígnias
const INSIGNIA_CATEGORIES = [
  { key: "performance", name: "Performance", icon: "🏆" },
  { key: "social", name: "Social", icon: "👥" },
  { key: "learning", name: "Aprendizado", icon: "📚" },
  { key: "streak", name: "Consistência", icon: "🔥" },
];

export function BadgesShowcase() {
  const { insignias, userInsignias, isLoading, getInsigniasByCategory } = useInsignias();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <div className="grid grid-cols-3 gap-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const unlockedCount = userInsignias.length;
  const totalCount = insignias.length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-400" />
          <h3 className="font-semibold">Insígnias</h3>
        </div>
        <div className="text-sm text-muted-foreground">
          {unlockedCount}/{totalCount} desbloqueadas
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <motion.div 
          className="h-full bg-gradient-to-r from-amber-500 to-orange-500"
          initial={{ width: 0 }}
          animate={{ width: `${(unlockedCount / totalCount) * 100}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Category Tabs */}
      <Tabs defaultValue={INSIGNIA_CATEGORIES[0]?.key || 'all'} className="w-full">
        <ScrollArea className="w-full">
          <TabsList className="inline-flex h-auto p-1 bg-muted/50 gap-1 w-max">
            {INSIGNIA_CATEGORIES.map((category) => (
              <TabsTrigger
                key={category.key}
                value={category.key}
                className="px-3 py-1.5 text-xs data-[state=active]:bg-background"
              >
                <span className="mr-1">{category.icon}</span>
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </ScrollArea>

        {INSIGNIA_CATEGORIES.map((category) => {
          const categoryInsignias = getInsigniasByCategory(category.key);
          
          return (
            <TabsContent key={category.key} value={category.key} className="mt-4">
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {categoryInsignias.map((insignia) => {
                  const isUnlocked = insignia.isUnlocked;
                  
                  return (
                    <motion.div
                      key={insignia.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ scale: isUnlocked ? 1.05 : 1 }}
                      className={`
                        relative p-3 rounded-xl border-2 transition-all cursor-pointer
                        ${isUnlocked 
                          ? getStarRarityColor(insignia.star_level)
                          : 'bg-muted/30 border-muted text-muted-foreground/50'
                        }
                      `}
                    >
                      {/* Badge Icon */}
                      <div className="text-center">
                        <div className={`text-3xl mb-1 ${!isUnlocked && 'grayscale opacity-50'}`}>
                          {insignia.icon}
                        </div>
                        <div className={`text-xs font-medium truncate ${!isUnlocked && 'text-muted-foreground/50'}`}>
                          {insignia.name}
                        </div>
                        
                        {/* Star indicator */}
                        <div className="flex justify-center mt-1 gap-0.5">
                          {[...Array(insignia.star_level)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-2 h-2 fill-current ${isUnlocked ? 'text-amber-400' : 'text-muted-foreground/30'}`} 
                            />
                          ))}
                        </div>
                      </div>

                      {/* Lock overlay */}
                      {!isUnlocked && (
                        <div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-xl">
                          <Lock className="w-4 h-4 text-muted-foreground/50" />
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
              
              {categoryInsignias.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Award className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Nenhuma insígnia nesta categoria ainda</p>
                </div>
              )}
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}

function getStarRarityColor(starLevel: number): string {
  switch (starLevel) {
    case 1: return 'text-gray-400 border-gray-400/30 bg-gray-400/10';
    case 2: return 'text-green-400 border-green-400/30 bg-green-400/10';
    case 3: return 'text-blue-400 border-blue-400/30 bg-blue-400/10';
    case 4: return 'text-purple-400 border-purple-400/30 bg-purple-400/10';
    case 5: return 'text-amber-400 border-amber-400/30 bg-amber-400/10';
    default: return 'text-gray-400 border-gray-400/30 bg-gray-400/10';
  }
}
