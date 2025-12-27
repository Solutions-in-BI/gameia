import { motion } from "framer-motion";
import { Lock, Award, Star, Sparkles } from "lucide-react";
import { useBadges } from "@/hooks/useBadges";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

export function BadgesShowcase() {
  const { 
    badges, 
    categories, 
    userBadges, 
    isLoading, 
    isBadgeUnlocked,
    getRarityColor 
  } = useBadges();

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

  const unlockedCount = userBadges.length;
  const totalCount = badges.length;

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
      <Tabs defaultValue={categories[0]?.category_key || 'all'} className="w-full">
        <ScrollArea className="w-full">
          <TabsList className="inline-flex h-auto p-1 bg-muted/50 gap-1 w-max">
            {categories.map((category) => (
              <TabsTrigger
                key={category.category_key}
                value={category.category_key}
                className="px-3 py-1.5 text-xs data-[state=active]:bg-background"
              >
                <span className="mr-1">{category.icon}</span>
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </ScrollArea>

        {categories.map((category) => {
          const categoryBadges = badges.filter(b => b.category_id === category.id);
          
          return (
            <TabsContent key={category.category_key} value={category.category_key} className="mt-4">
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {categoryBadges.map((badge) => {
                  const isUnlocked = isBadgeUnlocked(badge.id);
                  const userBadge = userBadges.find(ub => ub.badge_id === badge.id);
                  
                  return (
                    <motion.div
                      key={badge.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ scale: isUnlocked ? 1.05 : 1 }}
                      className={`
                        relative p-3 rounded-xl border-2 transition-all cursor-pointer
                        ${isUnlocked 
                          ? getRarityColor(badge.rarity)
                          : 'bg-muted/30 border-muted text-muted-foreground/50'
                        }
                      `}
                    >
                      {/* Secret badge indicator */}
                      {badge.is_secret && !isUnlocked && (
                        <div className="absolute top-1 right-1">
                          <Sparkles className="w-3 h-3 text-purple-400" />
                        </div>
                      )}
                      
                      {/* Badge Icon */}
                      <div className="text-center">
                        <div className={`text-3xl mb-1 ${!isUnlocked && 'grayscale opacity-50'}`}>
                          {badge.is_secret && !isUnlocked ? '❓' : badge.icon}
                        </div>
                        <div className={`text-xs font-medium truncate ${!isUnlocked && 'text-muted-foreground/50'}`}>
                          {badge.is_secret && !isUnlocked ? '???' : badge.name}
                        </div>
                        
                        {/* Rarity indicator */}
                        <div className="flex justify-center mt-1 gap-0.5">
                          {[...Array(getRarityStars(badge.rarity))].map((_, i) => (
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

                      {/* Hover tooltip */}
                      {isUnlocked && userBadge && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                          <div className="bg-popover text-popover-foreground text-xs p-2 rounded-lg shadow-lg whitespace-nowrap">
                            <p className="font-medium">{badge.name}</p>
                            <p className="text-muted-foreground">{badge.description}</p>
                            <p className="text-cyan-400 mt-1">
                              Desbloqueado em {new Date(userBadge.unlocked_at).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
              
              {categoryBadges.length === 0 && (
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

function getRarityStars(rarity: string): number {
  switch (rarity) {
    case 'common': return 1;
    case 'uncommon': return 2;
    case 'rare': return 3;
    case 'epic': return 4;
    case 'legendary': return 5;
    default: return 1;
  }
}
