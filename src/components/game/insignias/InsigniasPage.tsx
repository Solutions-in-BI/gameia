/**
 * Página de Insígnias - Sistema de progressão por estrelas
 * Separado de Treinamentos
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Star, 
  Crown, 
  Shield, 
  Hexagon, 
  Zap, 
  Rocket, 
  Target, 
  Trophy,
  Lock,
  Check,
  ChevronRight,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useInsignias, InsigniaWithProgress } from "@/hooks/useInsignias";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

// Category configuration
const CATEGORIES = [
  { id: "vendas", label: "Vendas", icon: "💼", color: "from-emerald-500 to-emerald-600" },
  { id: "lideranca", label: "Liderança", icon: "👑", color: "from-violet-500 to-purple-600" },
  { id: "decisao", label: "Decisões", icon: "🧠", color: "from-amber-500 to-orange-600" },
  { id: "comunicacao", label: "Comunicação", icon: "💬", color: "from-cyan-500 to-blue-600" },
  { id: "geral", label: "Especiais", icon: "✨", color: "from-pink-500 to-rose-600" },
];

// Shape icon mapping
const SHAPE_ICONS: Record<string, React.ElementType> = {
  star: Star,
  crown: Crown,
  shield: Shield,
  hexagon: Hexagon,
  bolt: Zap,
  rocket: Rocket,
  target: Target,
  trophy: Trophy,
};

interface InsigniasPageProps {
  onBack?: () => void;
}

export function InsigniasPage({ onBack }: InsigniasPageProps) {
  const { insignias, isLoading, getInsigniasByCategory } = useInsignias();
  const [selectedCategory, setSelectedCategory] = useState("vendas");
  const [selectedInsignia, setSelectedInsignia] = useState<InsigniaWithProgress | null>(null);

  const categoryInsignias = getInsigniasByCategory(selectedCategory);
  const unlockedCount = insignias.filter((i) => i.isUnlocked).length;
  const totalCount = insignias.length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Trophy className="w-6 h-6 text-primary" />
            Insígnias
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Conquiste insígnias de 1 a 5 estrelas em cada categoria
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-primary">{unlockedCount}/{totalCount}</div>
          <div className="text-xs text-muted-foreground">Conquistadas</div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {CATEGORIES.map((cat) => {
          const catInsignias = getInsigniasByCategory(cat.id);
          const catUnlocked = catInsignias.filter((i) => i.isUnlocked).length;
          
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all",
                selectedCategory === cat.id
                  ? `bg-gradient-to-r ${cat.color} text-white shadow-lg`
                  : "bg-card border border-border hover:border-primary/50"
              )}
            >
              <span className="text-lg">{cat.icon}</span>
              <span className="font-medium">{cat.label}</span>
              <span className={cn(
                "text-xs px-1.5 py-0.5 rounded-full",
                selectedCategory === cat.id
                  ? "bg-white/20"
                  : "bg-muted text-muted-foreground"
              )}>
                {catUnlocked}/{catInsignias.length}
              </span>
            </button>
          );
        })}
      </div>

      {/* Star Level Progression */}
      <div className="grid grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map((starLevel) => {
          const levelInsignias = categoryInsignias.filter((i) => i.star_level === starLevel);
          const unlocked = levelInsignias.some((i) => i.isUnlocked);
          const insignia = levelInsignias[0];

          if (!insignia) {
            return (
              <div
                key={starLevel}
                className="flex flex-col items-center p-4 rounded-2xl border border-border/50 bg-muted/30"
              >
                <div className="flex gap-0.5 mb-2">
                  {Array.from({ length: starLevel }).map((_, i) => (
                    <Star key={i} className="w-3 h-3 text-muted-foreground" />
                  ))}
                </div>
                <Lock className="w-8 h-8 text-muted-foreground" />
                <span className="text-xs text-muted-foreground mt-2">Em breve</span>
              </div>
            );
          }

          return (
            <InsigniaCard
              key={starLevel}
              insignia={insignia}
              onClick={() => setSelectedInsignia(insignia)}
            />
          );
        })}
      </div>

      {/* All Insignias in Category */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">
          Todas as Insígnias de {CATEGORIES.find((c) => c.id === selectedCategory)?.label}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categoryInsignias.map((insignia) => (
            <InsigniaListItem
              key={insignia.id}
              insignia={insignia}
              onClick={() => setSelectedInsignia(insignia)}
            />
          ))}
        </div>
      </div>

      {/* Detail Modal */}
      <InsigniaDetailModal
        insignia={selectedInsignia}
        isOpen={!!selectedInsignia}
        onClose={() => setSelectedInsignia(null)}
      />
    </div>
  );
}

interface InsigniaCardProps {
  insignia: InsigniaWithProgress;
  onClick: () => void;
}

function InsigniaCard({ insignia, onClick }: InsigniaCardProps) {
  const ShapeIcon = SHAPE_ICONS[insignia.shape] || Star;
  
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={cn(
        "relative flex flex-col items-center p-4 rounded-2xl border transition-all",
        insignia.isUnlocked
          ? "border-primary/50 bg-gradient-to-b from-primary/10 to-transparent shadow-lg shadow-primary/20"
          : "border-border/50 bg-card/50 hover:border-primary/30"
      )}
    >
      {/* Stars */}
      <div className="flex gap-0.5 mb-2">
        {Array.from({ length: insignia.star_level }).map((_, i) => (
          <Star
            key={i}
            className={cn(
              "w-3 h-3",
              insignia.isUnlocked ? "text-amber-400 fill-amber-400" : "text-muted-foreground"
            )}
          />
        ))}
      </div>

      {/* Icon */}
      <div
        className={cn(
          "w-16 h-16 rounded-2xl flex items-center justify-center text-2xl mb-2",
          insignia.isUnlocked
            ? "bg-gradient-to-br from-primary/30 to-accent/30"
            : "bg-muted/50"
        )}
        style={{ 
          borderColor: insignia.isUnlocked ? insignia.color : undefined,
          borderWidth: insignia.isUnlocked ? 2 : 0
        }}
      >
        {insignia.isUnlocked ? (
          insignia.icon
        ) : (
          <Lock className="w-6 h-6 text-muted-foreground" />
        )}
      </div>

      {/* Name */}
      <span className={cn(
        "text-xs font-medium text-center line-clamp-2",
        insignia.isUnlocked ? "text-foreground" : "text-muted-foreground"
      )}>
        {insignia.name}
      </span>

      {/* Progress */}
      {!insignia.isUnlocked && (
        <div className="w-full mt-2">
          <Progress value={insignia.progress} className="h-1" />
          <span className="text-[10px] text-muted-foreground">{Math.round(insignia.progress)}%</span>
        </div>
      )}

      {/* Unlocked Badge */}
      {insignia.isUnlocked && (
        <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
          <Check className="w-3 h-3 text-white" />
        </div>
      )}
    </motion.button>
  );
}

interface InsigniaListItemProps {
  insignia: InsigniaWithProgress;
  onClick: () => void;
}

function InsigniaListItem({ insignia, onClick }: InsigniaListItemProps) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ x: 4 }}
      className={cn(
        "flex items-center gap-4 p-4 rounded-xl border transition-all text-left w-full",
        insignia.isUnlocked
          ? "border-primary/30 bg-primary/5"
          : "border-border hover:border-primary/30"
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          "w-14 h-14 rounded-xl flex items-center justify-center text-2xl flex-shrink-0",
          insignia.isUnlocked
            ? "bg-gradient-to-br from-primary/20 to-accent/20"
            : "bg-muted"
        )}
      >
        {insignia.isUnlocked ? insignia.icon : <Lock className="w-5 h-5 text-muted-foreground" />}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={cn(
            "font-semibold",
            insignia.isUnlocked ? "text-foreground" : "text-muted-foreground"
          )}>
            {insignia.name}
          </span>
          <div className="flex gap-0.5">
            {Array.from({ length: insignia.star_level }).map((_, i) => (
              <Star
                key={i}
                className={cn(
                  "w-3 h-3",
                  insignia.isUnlocked ? "text-amber-400 fill-amber-400" : "text-muted-foreground"
                )}
              />
            ))}
          </div>
        </div>
        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
          {insignia.description}
        </p>
        
        {!insignia.isUnlocked && (
          <div className="mt-2">
            <Progress value={insignia.progress} className="h-1.5" />
          </div>
        )}
      </div>

      <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
    </motion.button>
  );
}

interface InsigniaDetailModalProps {
  insignia: InsigniaWithProgress | null;
  isOpen: boolean;
  onClose: () => void;
}

function InsigniaDetailModal({ insignia, isOpen, onClose }: InsigniaDetailModalProps) {
  if (!insignia) return null;

  const requirements: Array<{
    label: string;
    current: number;
    required: number;
    met: boolean;
    icon: string;
    format: (v: number) => string;
  }> = [];

  // XP requirement
  if (insignia.required_xp > 0) {
    requirements.push({
      label: "XP Total",
      ...insignia.progressDetails.xp,
      icon: "⚡",
      format: (v: number) => `${v.toLocaleString()} XP`,
    });
  }

  // Skill requirement
  if (insignia.required_skill_id) {
    requirements.push({
      label: "Nível de Skill",
      current: insignia.progressDetails.skill.current,
      required: insignia.progressDetails.skill.required,
      met: insignia.progressDetails.skill.met,
      icon: "🎯",
      format: (v: number) => `Nível ${v}`,
    });
  }

  // Streak requirement
  if (insignia.required_streak_days > 0) {
    requirements.push({
      label: "Dias de Streak",
      ...insignia.progressDetails.streak,
      icon: "🔥",
      format: (v: number) => `${v} dias`,
    });
  }

  // Game score requirement
  if (insignia.required_game_type) {
    requirements.push({
      label: "Score no Jogo",
      ...insignia.progressDetails.gameScore,
      icon: "🎮",
      format: (v: number) => `${v}%`,
    });
  }

  // Missions requirement
  if (insignia.required_missions_completed > 0) {
    requirements.push({
      label: "Missões Completadas",
      ...insignia.progressDetails.missions,
      icon: "📋",
      format: (v: number) => `${v} missões`,
    });
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div
              className={cn(
                "w-14 h-14 rounded-xl flex items-center justify-center text-3xl",
                insignia.isUnlocked
                  ? "bg-gradient-to-br from-primary/30 to-accent/30"
                  : "bg-muted"
              )}
            >
              {insignia.isUnlocked ? insignia.icon : <Lock className="w-6 h-6 text-muted-foreground" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                {insignia.name}
                {insignia.isUnlocked && (
                  <Sparkles className="w-4 h-4 text-amber-400" />
                )}
              </div>
              <div className="flex gap-0.5 mt-1">
                {Array.from({ length: insignia.star_level }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "w-4 h-4",
                      insignia.isUnlocked ? "text-amber-400 fill-amber-400" : "text-muted-foreground"
                    )}
                  />
                ))}
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-6 py-4">
            {/* Description */}
            <p className="text-muted-foreground">{insignia.description}</p>

            {/* Progress */}
            {!insignia.isUnlocked && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Progresso</span>
                  <span className="font-bold text-primary">{Math.round(insignia.progress)}%</span>
                </div>
                <Progress value={insignia.progress} className="h-2" />
              </div>
            )}

            {/* Requirements */}
            <div className="space-y-3">
              <h3 className="font-semibold text-foreground">Requisitos</h3>
              {requirements.map((req, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border",
                    req.met ? "border-emerald-500/30 bg-emerald-500/5" : "border-border"
                  )}
                >
                  <span className="text-xl">{req.icon}</span>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{req.label}</div>
                    <div className="text-xs text-muted-foreground">
                      {req.format(req.current)} / {req.format(req.required)}
                    </div>
                  </div>
                  {req.met ? (
                    <Check className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <div className="text-xs text-muted-foreground">
                      {Math.round((req.current / req.required) * 100)}%
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Rewards */}
            {(insignia.xp_reward > 0 || insignia.coins_reward > 0) && (
              <div className="space-y-3">
                <h3 className="font-semibold text-foreground">Recompensas</h3>
                <div className="flex gap-4">
                  {insignia.xp_reward > 0 && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 border border-primary/30">
                      <span className="text-lg">⚡</span>
                      <span className="font-bold text-primary">+{insignia.xp_reward} XP</span>
                    </div>
                  )}
                  {insignia.coins_reward > 0 && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/30">
                      <span className="text-lg">🪙</span>
                      <span className="font-bold text-amber-500">+{insignia.coins_reward}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Unlocked Status */}
            {insignia.isUnlocked && insignia.unlockedAt && (
              <div className="text-center py-4 rounded-xl bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/30">
                <Check className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <div className="font-semibold text-emerald-500">Conquistada!</div>
                <div className="text-xs text-muted-foreground">
                  {new Date(insignia.unlockedAt).toLocaleDateString("pt-BR")}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
