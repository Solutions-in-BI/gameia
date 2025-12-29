/**
 * InsigniasSubtab - Subtab de Insígnias na aba Evolução
 * Exibe todas as insígnias organizadas por categoria com progresso
 */

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Award,
  Star,
  Lock,
  CheckCircle2,
  Filter,
  Sparkles,
  Trophy,
  Target,
  Zap,
  Flame,
  Brain,
  Users,
  Gamepad2,
} from "lucide-react";
import { useInsignias, type InsigniaWithProgress } from "@/hooks/useInsignias";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const CATEGORY_CONFIG: Record<
  string,
  { label: string; icon: typeof Award; color: string }
> = {
  xp: { label: "Experiência", icon: Zap, color: "text-yellow-500" },
  skill: { label: "Skills", icon: Target, color: "text-blue-500" },
  streak: { label: "Sequência", icon: Flame, color: "text-orange-500" },
  game: { label: "Jogos", icon: Gamepad2, color: "text-purple-500" },
  social: { label: "Social", icon: Users, color: "text-pink-500" },
  cognitive: { label: "Cognitivo", icon: Brain, color: "text-cyan-500" },
  special: { label: "Especial", icon: Trophy, color: "text-amber-500" },
};

const STAR_COLORS = [
  "text-gray-400", // 1 star
  "text-green-500", // 2 stars
  "text-blue-500", // 3 stars
  "text-purple-500", // 4 stars
  "text-amber-500", // 5 stars
];

export function InsigniasSubtab() {
  const { insignias, userInsignias, isLoading, toggleDisplayInsignia } =
    useInsignias();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedInsignia, setSelectedInsignia] =
    useState<InsigniaWithProgress | null>(null);

  // Group insignias by category
  const categories = useMemo(() => {
    const grouped: Record<string, InsigniaWithProgress[]> = {};
    insignias.forEach((insignia) => {
      if (!grouped[insignia.category]) {
        grouped[insignia.category] = [];
      }
      grouped[insignia.category].push(insignia);
    });
    return grouped;
  }, [insignias]);

  // Stats
  const unlockedCount = insignias.filter((i) => i.isUnlocked).length;
  const totalCount = insignias.length;
  const displayedCount = userInsignias.filter((ui) => ui.is_displayed).length;

  // Filter by selected category
  const filteredInsignias = selectedCategory
    ? categories[selectedCategory] || []
    : insignias;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium">Desbloqueadas</span>
          </div>
          <p className="text-2xl font-bold">
            {unlockedCount}
            <span className="text-muted-foreground text-lg">/{totalCount}</span>
          </p>
        </div>

        <div className="p-4 rounded-xl bg-muted/30 border border-border/30">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <span className="text-sm font-medium">Em Destaque</span>
          </div>
          <p className="text-2xl font-bold">{displayedCount}</p>
        </div>

        <div className="p-4 rounded-xl bg-muted/30 border border-border/30">
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-5 h-5 text-purple-500" />
            <span className="text-sm font-medium">Épicas+</span>
          </div>
          <p className="text-2xl font-bold">
            {insignias.filter((i) => i.isUnlocked && i.star_level >= 4).length}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-muted/30 border border-border/30">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-5 h-5 text-green-500" />
            <span className="text-sm font-medium">Próxima</span>
          </div>
          <p className="text-lg font-bold truncate">
            {insignias.find((i) => !i.isUnlocked && i.progress > 50)?.name ||
              "—"}
          </p>
        </div>
      </div>

      {/* Category Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <Button
          variant={selectedCategory === null ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedCategory(null)}
        >
          <Filter className="w-3 h-3 mr-1" />
          Todas
        </Button>
        {Object.entries(CATEGORY_CONFIG).map(([key, config]) => {
          const count = categories[key]?.length || 0;
          if (count === 0) return null;
          const Icon = config.icon;
          return (
            <Button
              key={key}
              variant={selectedCategory === key ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(key)}
            >
              <Icon className={cn("w-3 h-3 mr-1", config.color)} />
              {config.label}
              <Badge variant="secondary" className="ml-1 text-xs">
                {count}
              </Badge>
            </Button>
          );
        })}
      </div>

      {/* Insignias Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredInsignias.map((insignia, index) => (
            <InsigniaCard
              key={insignia.id}
              insignia={insignia}
              index={index}
              onClick={() => setSelectedInsignia(insignia)}
            />
          ))}
        </AnimatePresence>
      </div>

      {filteredInsignias.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Award className="w-12 h-12 mx-auto mb-3" />
          <p>Nenhuma insígnia nesta categoria</p>
        </div>
      )}

      {/* Insignia Detail Modal */}
      <Dialog
        open={!!selectedInsignia}
        onOpenChange={(open) => !open && setSelectedInsignia(null)}
      >
        <DialogContent className="max-w-md">
          {selectedInsignia && (
            <InsigniaDetail
              insignia={selectedInsignia}
              onToggleDisplay={() => {
                toggleDisplayInsignia(selectedInsignia.id);
              }}
              isDisplayed={
                userInsignias.find(
                  (ui) => ui.insignia_id === selectedInsignia.id
                )?.is_displayed || false
              }
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Insignia Card Component
function InsigniaCard({
  insignia,
  index,
  onClick,
}: {
  insignia: InsigniaWithProgress;
  index: number;
  onClick: () => void;
}) {
  const starColor = STAR_COLORS[insignia.star_level - 1] || STAR_COLORS[0];

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ delay: index * 0.02 }}
      whileHover={{ scale: 1.05, y: -4 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={cn(
        "relative p-4 rounded-xl border transition-all aspect-square flex flex-col items-center justify-center gap-2",
        insignia.isUnlocked
          ? "bg-gradient-to-br from-primary/10 to-accent/10 border-primary/30 hover:border-primary/50"
          : "bg-muted/30 border-border/30 hover:border-border/50"
      )}
    >
      {/* Lock overlay for locked insignias */}
      {!insignia.isUnlocked && (
        <div className="absolute inset-0 bg-background/60 backdrop-blur-[1px] rounded-xl flex items-center justify-center">
          <Lock className="w-5 h-5 text-muted-foreground" />
        </div>
      )}

      {/* Star rating */}
      <div className="flex items-center gap-0.5">
        {Array.from({ length: insignia.star_level }).map((_, i) => (
          <Star
            key={i}
            className={cn("w-3 h-3 fill-current", starColor)}
          />
        ))}
      </div>

      {/* Icon - using emoji or icon name */}
      <div
        className={cn(
          "text-3xl",
          !insignia.isUnlocked && "opacity-40 grayscale"
        )}
      >
        {insignia.icon.length <= 2 ? insignia.icon : "🏅"}
      </div>

      {/* Name */}
      <p
        className={cn(
          "text-xs font-medium text-center line-clamp-2",
          !insignia.isUnlocked && "text-muted-foreground"
        )}
      >
        {insignia.name}
      </p>

      {/* Progress bar for locked */}
      {!insignia.isUnlocked && insignia.progress > 0 && (
        <Progress value={insignia.progress} className="h-1 w-full absolute bottom-2 left-2 right-2 mx-auto" style={{ width: 'calc(100% - 16px)' }} />
      )}

      {/* Unlocked badge */}
      {insignia.isUnlocked && (
        <CheckCircle2 className="absolute top-2 right-2 w-4 h-4 text-gameia-success" />
      )}
    </motion.button>
  );
}

// Insignia Detail Component
function InsigniaDetail({
  insignia,
  onToggleDisplay,
  isDisplayed,
}: {
  insignia: InsigniaWithProgress;
  onToggleDisplay: () => void;
  isDisplayed: boolean;
}) {
  const starColor = STAR_COLORS[insignia.star_level - 1] || STAR_COLORS[0];
  const categoryConfig = CATEGORY_CONFIG[insignia.category] || {
    label: insignia.category,
    icon: Award,
    color: "text-muted-foreground",
  };
  const CategoryIcon = categoryConfig.icon;

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <span className="text-3xl">
            {insignia.icon.length <= 2 ? insignia.icon : "🏅"}
          </span>
          {insignia.name}
        </DialogTitle>
      </DialogHeader>

      <div className="space-y-4">
        {/* Star rating */}
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={cn(
                "w-5 h-5",
                i < insignia.star_level
                  ? `fill-current ${starColor}`
                  : "text-muted-foreground/30"
              )}
            />
          ))}
          <Badge variant="outline" className="ml-2">
            <CategoryIcon className={cn("w-3 h-3 mr-1", categoryConfig.color)} />
            {categoryConfig.label}
          </Badge>
        </div>

        {/* Description */}
        {insignia.description && (
          <p className="text-muted-foreground">{insignia.description}</p>
        )}

        {/* Status */}
        {insignia.isUnlocked ? (
          <div className="p-3 rounded-lg bg-gameia-success/10 border border-gameia-success/30">
            <div className="flex items-center gap-2 text-gameia-success">
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-medium">Desbloqueada!</span>
            </div>
            {insignia.unlockedAt && (
              <p className="text-xs text-muted-foreground mt-1">
                Em{" "}
                {new Date(insignia.unlockedAt).toLocaleDateString("pt-BR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Progresso</span>
              <span className="text-sm text-muted-foreground">
                {Math.round(insignia.progress)}%
              </span>
            </div>
            <Progress value={insignia.progress} className="h-2" />

            {/* Requirements breakdown */}
            <div className="space-y-2 text-sm">
              {insignia.progressDetails.xp.required > 0 && (
                <RequirementRow
                  label="XP Total"
                  current={insignia.progressDetails.xp.current}
                  required={insignia.progressDetails.xp.required}
                  met={insignia.progressDetails.xp.met}
                />
              )}
              {insignia.progressDetails.skill.required > 0 && (
                <RequirementRow
                  label="Nível de Skill"
                  current={insignia.progressDetails.skill.current}
                  required={insignia.progressDetails.skill.required}
                  met={insignia.progressDetails.skill.met}
                />
              )}
              {insignia.progressDetails.streak.required > 0 && (
                <RequirementRow
                  label="Dias de Streak"
                  current={insignia.progressDetails.streak.current}
                  required={insignia.progressDetails.streak.required}
                  met={insignia.progressDetails.streak.met}
                />
              )}
              {insignia.progressDetails.gameScore.required > 0 && (
                <RequirementRow
                  label="Score em Jogo"
                  current={insignia.progressDetails.gameScore.current}
                  required={insignia.progressDetails.gameScore.required}
                  met={insignia.progressDetails.gameScore.met}
                />
              )}
            </div>
          </div>
        )}

        {/* Rewards */}
        {(insignia.xp_reward > 0 || insignia.coins_reward > 0) && (
          <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/30">
            <span className="text-sm text-muted-foreground">Recompensas:</span>
            {insignia.xp_reward > 0 && (
              <Badge variant="secondary">
                <Zap className="w-3 h-3 mr-1" />
                {insignia.xp_reward} XP
              </Badge>
            )}
            {insignia.coins_reward > 0 && (
              <Badge variant="outline">{insignia.coins_reward} 🪙</Badge>
            )}
          </div>
        )}

        {/* Toggle display button */}
        {insignia.isUnlocked && (
          <Button
            variant={isDisplayed ? "default" : "outline"}
            className="w-full"
            onClick={onToggleDisplay}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {isDisplayed ? "Em Destaque" : "Destacar no Perfil"}
          </Button>
        )}
      </div>
    </>
  );
}

// Requirement Row Component
function RequirementRow({
  label,
  current,
  required,
  met,
}: {
  label: string;
  current: number;
  required: number;
  met: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <span className={met ? "text-gameia-success" : "text-foreground"}>
          {current}/{required}
        </span>
        {met && <CheckCircle2 className="w-4 h-4 text-gameia-success" />}
      </div>
    </div>
  );
}
