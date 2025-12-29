/**
 * InsigniasSubtab - Subtab de Insígnias V2 na aba Evolução
 * Sistema central de reconhecimento, evolução profissional e leitura gerencial
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
  Crown,
  TrendingUp,
} from "lucide-react";
import { useInsigniasV2, type InsigniaWithStatus, type InsigniaType } from "@/hooks/useInsigniasV2";
import { INSIGNIA_TYPE_CONFIG, INSIGNIA_LEVEL_CONFIG } from "@/types/insignias";
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

// Ícones por tipo de insígnia
const TYPE_ICONS: Record<InsigniaType, typeof Award> = {
  skill: Zap,
  behavior: Flame,
  impact: Trophy,
  leadership: Crown,
  special: Sparkles,
};

// Cores por nível de estrela
const STAR_COLORS = [
  "text-gray-400",     // 1 star
  "text-green-500",    // 2 stars
  "text-blue-500",     // 3 stars
  "text-purple-500",   // 4 stars
  "text-amber-500",    // 5 stars
];

export function InsigniasSubtab() {
  const { 
    insignias, 
    userInsignias, 
    stats,
    isLoading, 
    toggleDisplay,
    getByType,
  } = useInsigniasV2();
  
  const [selectedType, setSelectedType] = useState<InsigniaType | null>(null);
  const [selectedInsignia, setSelectedInsignia] = useState<InsigniaWithStatus | null>(null);

  // Agrupar por tipo
  const groupedByType = useMemo(() => {
    const groups: Record<InsigniaType, InsigniaWithStatus[]> = {
      skill: [],
      behavior: [],
      impact: [],
      leadership: [],
      special: [],
    };
    
    insignias.forEach((ins) => {
      const type = ins.insignia_type as InsigniaType;
      if (groups[type]) {
        groups[type].push(ins);
      }
    });
    
    return groups;
  }, [insignias]);

  // Filtrar por tipo selecionado
  const filteredInsignias = selectedType 
    ? groupedByType[selectedType] 
    : insignias;

  // Próxima insígnia (maior progresso não desbloqueada)
  const nextInsignia = useMemo(() => {
    return insignias
      .filter((i) => !i.unlocked && i.progress > 0)
      .sort((a, b) => b.progress - a.progress)[0];
  }, [insignias]);

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
        <StatCard
          icon={Award}
          label="Conquistadas"
          value={stats?.unlocked || 0}
          subvalue={`/${stats?.total || 0}`}
          color="text-primary"
          gradient="from-primary/10 to-primary/5"
        />
        
        <StatCard
          icon={Sparkles}
          label="Em Destaque"
          value={userInsignias.filter((ui) => ui.is_displayed).length}
          color="text-amber-500"
        />
        
        <StatCard
          icon={Star}
          label="Épicas+"
          value={insignias.filter((i) => i.unlocked && i.star_level >= 4).length}
          color="text-purple-500"
        />
        
        <StatCard
          icon={Target}
          label="Próxima"
          value={nextInsignia?.name || "—"}
          isText
          color="text-green-500"
          progress={nextInsignia?.progress}
        />
      </div>

      {/* Type Filters - Novos tipos V2 */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <Button
          variant={selectedType === null ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedType(null)}
        >
          <Filter className="w-3 h-3 mr-1" />
          Todas
          <Badge variant="secondary" className="ml-1 text-xs">
            {insignias.length}
          </Badge>
        </Button>
        
        {(Object.keys(INSIGNIA_TYPE_CONFIG) as InsigniaType[]).map((type) => {
          const config = INSIGNIA_TYPE_CONFIG[type];
          const count = groupedByType[type]?.length || 0;
          const unlockedCount = groupedByType[type]?.filter((i) => i.unlocked).length || 0;
          if (count === 0) return null;
          
          const Icon = TYPE_ICONS[type];
          
          return (
            <Button
              key={type}
              variant={selectedType === type ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedType(type)}
              className="whitespace-nowrap"
            >
              <Icon className="w-3 h-3 mr-1" />
              {config.label}
              <Badge 
                variant={unlockedCount === count ? "default" : "secondary"} 
                className="ml-1 text-xs"
              >
                {unlockedCount}/{count}
              </Badge>
            </Button>
          );
        })}
      </div>

      {/* Insignias Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredInsignias.map((insignia, index) => (
            <InsigniaCardV2
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
          <Award className="w-12 h-12 mx-auto mb-3 opacity-50" />
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
            <InsigniaDetailV2
              insignia={selectedInsignia}
              onToggleDisplay={() => toggleDisplay(selectedInsignia.id)}
              isDisplayed={
                userInsignias.find((ui) => ui.insignia_id === selectedInsignia.id)?.is_displayed || false
              }
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Stat Card Component
function StatCard({
  icon: Icon,
  label,
  value,
  subvalue,
  color,
  gradient,
  isText,
  progress,
}: {
  icon: typeof Award;
  label: string;
  value: number | string;
  subvalue?: string;
  color: string;
  gradient?: string;
  isText?: boolean;
  progress?: number;
}) {
  return (
    <div className={cn(
      "p-4 rounded-xl border border-border/30",
      gradient ? `bg-gradient-to-br ${gradient} border-primary/20` : "bg-muted/30"
    )}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className={cn("w-5 h-5", color)} />
        <span className="text-sm font-medium">{label}</span>
      </div>
      {isText ? (
        <p className="text-lg font-bold truncate">{value}</p>
      ) : (
        <p className="text-2xl font-bold">
          {value}
          {subvalue && <span className="text-muted-foreground text-lg">{subvalue}</span>}
        </p>
      )}
      {progress !== undefined && progress > 0 && (
        <Progress value={progress} className="h-1 mt-2" />
      )}
    </div>
  );
}

// Insignia Card V2 Component
function InsigniaCardV2({
  insignia,
  index,
  onClick,
}: {
  insignia: InsigniaWithStatus;
  index: number;
  onClick: () => void;
}) {
  const starColor = STAR_COLORS[insignia.star_level - 1] || STAR_COLORS[0];
  const typeConfig = INSIGNIA_TYPE_CONFIG[insignia.insignia_type as InsigniaType];
  const levelConfig = INSIGNIA_LEVEL_CONFIG[insignia.level];

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
        insignia.unlocked
          ? "bg-gradient-to-br from-primary/10 to-accent/10 border-primary/30 hover:border-primary/50"
          : "bg-muted/30 border-border/30 hover:border-border/50"
      )}
    >
      {/* Lock overlay para insígnias bloqueadas */}
      {!insignia.unlocked && (
        <div className="absolute inset-0 bg-background/60 backdrop-blur-[1px] rounded-xl flex items-center justify-center">
          <Lock className="w-5 h-5 text-muted-foreground" />
        </div>
      )}

      {/* Badge de nível para insígnias progressivas */}
      {insignia.insignia_type === 'skill' && insignia.level > 1 && (
        <Badge 
          variant="outline" 
          className="absolute top-1 left-1 text-[10px] px-1 py-0"
        >
          {levelConfig?.badge || `N${insignia.level}`}
        </Badge>
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

      {/* Icon - emoji ou nome do ícone */}
      <div
        className={cn(
          "text-3xl",
          !insignia.unlocked && "opacity-40 grayscale"
        )}
      >
        {insignia.icon?.length <= 2 ? insignia.icon : "🏅"}
      </div>

      {/* Name */}
      <p
        className={cn(
          "text-xs font-medium text-center line-clamp-2",
          !insignia.unlocked && "text-muted-foreground"
        )}
      >
        {insignia.name}
      </p>

      {/* Progress bar para bloqueadas */}
      {!insignia.unlocked && insignia.progress > 0 && (
        <Progress 
          value={insignia.progress} 
          className="h-1 w-full absolute bottom-2 left-2 right-2 mx-auto" 
          style={{ width: 'calc(100% - 16px)' }} 
        />
      )}

      {/* Badge de desbloqueada */}
      {insignia.unlocked && (
        <CheckCircle2 className="absolute top-2 right-2 w-4 h-4 text-green-500" />
      )}
    </motion.button>
  );
}

// Insignia Detail V2 Component
function InsigniaDetailV2({
  insignia,
  onToggleDisplay,
  isDisplayed,
}: {
  insignia: InsigniaWithStatus;
  onToggleDisplay: () => void;
  isDisplayed: boolean;
}) {
  const starColor = STAR_COLORS[insignia.star_level - 1] || STAR_COLORS[0];
  const typeConfig = INSIGNIA_TYPE_CONFIG[insignia.insignia_type as InsigniaType];
  const levelConfig = INSIGNIA_LEVEL_CONFIG[insignia.level];
  const TypeIcon = TYPE_ICONS[insignia.insignia_type as InsigniaType] || Award;

  // Extrair critérios do criteria_status
  const criteria = insignia.criteria_status?.criteria || [];

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <span className="text-3xl">
            {insignia.icon?.length <= 2 ? insignia.icon : "🏅"}
          </span>
          <div>
            <span>{insignia.name}</span>
            {insignia.insignia_type === 'skill' && insignia.level > 1 && (
              <Badge variant="outline" className="ml-2 text-xs">
                {levelConfig?.label || `Nível ${insignia.level}`}
              </Badge>
            )}
          </div>
        </DialogTitle>
      </DialogHeader>

      <div className="space-y-4">
        {/* Star rating e tipo */}
        <div className="flex items-center gap-1 flex-wrap">
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
          <Badge 
            variant="outline" 
            className={cn("ml-2 bg-gradient-to-r", typeConfig?.color)}
          >
            <TypeIcon className="w-3 h-3 mr-1" />
            {typeConfig?.label || insignia.insignia_type}
          </Badge>
        </div>

        {/* Descrição */}
        {insignia.description && (
          <p className="text-muted-foreground">{insignia.description}</p>
        )}

        {/* Status */}
        {insignia.unlocked ? (
          <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30">
            <div className="flex items-center gap-2 text-green-500">
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-medium">Conquistada!</span>
            </div>
            {insignia.unlocked_at && (
              <p className="text-xs text-muted-foreground mt-1">
                Em{" "}
                {new Date(insignia.unlocked_at).toLocaleDateString("pt-BR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            )}
            {insignia.unlock_message && (
              <p className="text-sm mt-2 italic text-muted-foreground">
                "{insignia.unlock_message}"
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

            {/* Critérios do sistema V2 */}
            {criteria.length > 0 && (
              <div className="space-y-2 text-sm">
                <p className="font-medium text-xs text-muted-foreground uppercase tracking-wider">
                  Critérios
                </p>
                {criteria.map((criterion: any, idx: number) => (
                  <CriterionRow
                    key={idx}
                    description={criterion.description}
                    current={criterion.current}
                    required={criterion.required}
                    met={criterion.met}
                    isRequired={criterion.is_required}
                  />
                ))}
              </div>
            )}

            {/* Pré-requisitos faltantes */}
            {insignia.criteria_status?.prerequisites_missing && 
             insignia.criteria_status?.missing_prerequisites && (
              <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <p className="text-xs text-amber-600 font-medium mb-1">
                  Pré-requisitos necessários:
                </p>
                <div className="flex flex-wrap gap-1">
                  {insignia.criteria_status.missing_prerequisites.map((prereq: any) => (
                    <Badge key={prereq.id} variant="outline" className="text-xs">
                      {prereq.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Recompensas */}
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
        {insignia.unlocked && (
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

// Criterion Row Component
function CriterionRow({
  description,
  current,
  required,
  met,
  isRequired,
}: {
  description: string;
  current: number;
  required: number;
  met: boolean;
  isRequired: boolean;
}) {
  return (
    <div className={cn(
      "flex items-center justify-between p-2 rounded-lg",
      met ? "bg-green-500/5" : "bg-muted/30"
    )}>
      <span className={cn(
        "text-muted-foreground flex-1",
        !isRequired && "italic"
      )}>
        {description}
        {!isRequired && <span className="text-xs ml-1">(opcional)</span>}
      </span>
      <div className="flex items-center gap-2">
        <span className={met ? "text-green-500 font-medium" : "text-foreground"}>
          {Math.round(current)}/{Math.round(required)}
        </span>
        {met && <CheckCircle2 className="w-4 h-4 text-green-500" />}
      </div>
    </div>
  );
}
