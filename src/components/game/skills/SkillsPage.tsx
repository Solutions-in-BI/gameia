/**
 * Página dedicada de Skills do usuário
 * Com recomendações automáticas e alertas de estagnação
 */

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, Target, TrendingUp, Lock, ChevronRight, 
  Gamepad2, Award, Zap, Filter, AlertCircle, Clock,
  TrendingDown, ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSkillProgress, SkillWithProgress } from "@/hooks/useSkillProgress";
import { SkillDetailModal } from "./SkillDetailModal";
import { SkillRecommendations } from "./SkillRecommendations";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { differenceInDays } from "date-fns";

const CATEGORY_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  comunicacao: { label: "Comunicação", icon: <Sparkles className="w-4 h-4" />, color: "text-gameia-info" },
  lideranca: { label: "Liderança", icon: <Target className="w-4 h-4" />, color: "text-accent" },
  tecnico: { label: "Técnico", icon: <Zap className="w-4 h-4" />, color: "text-secondary-foreground" },
  vendas: { label: "Vendas", icon: <TrendingUp className="w-4 h-4" />, color: "text-gameia-success" },
  analise: { label: "Análise", icon: <Award className="w-4 h-4" />, color: "text-primary" },
};

export function SkillsPage() {
  const { skills, isLoading, error } = useSkillProgress();
  const [selectedSkill, setSelectedSkill] = useState<SkillWithProgress | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Flatten skills with children
  const allSkills = useMemo(() => 
    skills.flatMap((s) => [s, ...s.children]),
    [skills]
  );
  
  // Get unique categories
  const categories = useMemo(() => 
    [...new Set(allSkills.map((s) => s.category).filter(Boolean))] as string[],
    [allSkills]
  );
  
  // Filter skills
  const filteredSkills = useMemo(() => 
    categoryFilter === "all" 
      ? allSkills 
      : allSkills.filter((s) => s.category === categoryFilter),
    [allSkills, categoryFilter]
  );

  // Identify stagnant skills (no activity in 14+ days)
  const stagnantSkills = useMemo(() => 
    allSkills.filter((s) => {
      if (!s.userProgress?.last_practiced) return false;
      const daysSince = differenceInDays(new Date(), new Date(s.userProgress.last_practiced));
      return daysSince >= 14 && s.userProgress.is_unlocked;
    }),
    [allSkills]
  );

  // Skills that need attention (low level + unlocked)
  const skillsNeedingAttention = useMemo(() => 
    allSkills.filter((s) => {
      const level = s.userProgress?.current_level || 1;
      return s.userProgress?.is_unlocked && level < 3;
    }).slice(0, 3),
    [allSkills]
  );

  // Stats
  const totalSkills = allSkills.length;
  const unlockedSkills = allSkills.filter((s) => s.userProgress?.is_unlocked).length;
  const masteredSkills = allSkills.filter((s) => s.userProgress?.mastery_level && s.userProgress.mastery_level >= 5).length;
  const totalXP = allSkills.reduce((sum, s) => sum + (s.userProgress?.total_xp || 0), 0);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-muted-foreground">
        <p>Erro ao carregar skills: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gradient">
            Minhas Habilidades
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Desenvolva suas competências jogando e treinando
          </p>
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filtrar" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas Categorias</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {CATEGORY_CONFIG[cat]?.label || cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Stagnation Alert */}
      {stagnantSkills.length > 0 && (
        <Card className="border-gameia-warning/30 bg-gameia-warning/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-gameia-warning shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-gameia-warning">
                  {stagnantSkills.length} skill{stagnantSkills.length > 1 ? "s" : ""} estagnada{stagnantSkills.length > 1 ? "s" : ""}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {stagnantSkills.slice(0, 3).map(s => s.name).join(", ")}
                  {stagnantSkills.length > 3 && ` e mais ${stagnantSkills.length - 3}`}
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                className="shrink-0 border-gameia-warning/30 text-gameia-warning hover:bg-gameia-warning/10"
                onClick={() => setSelectedSkill(stagnantSkills[0])}
              >
                Ver sugestões
                <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={<Target className="w-5 h-5 text-gameia-info" />}
          label="Desbloqueadas"
          value={`${unlockedSkills}/${totalSkills}`}
          color="gameia-info"
        />
        <StatCard
          icon={<Award className="w-5 h-5 text-secondary-foreground" />}
          label="Maestria"
          value={masteredSkills.toString()}
          color="secondary"
        />
        <StatCard
          icon={<Zap className="w-5 h-5 text-primary" />}
          label="XP Total"
          value={totalXP.toLocaleString()}
          color="primary"
        />
        <StatCard
          icon={<TrendingUp className="w-5 h-5 text-gameia-success" />}
          label="Progresso"
          value={`${Math.round((unlockedSkills / totalSkills) * 100)}%`}
          color="gameia-success"
        />
      </div>

      {/* Skills Needing Attention */}
      {skillsNeedingAttention.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              Skills em Foco
              <Badge variant="secondary" className="ml-auto text-xs">
                Recomendadas para você
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {skillsNeedingAttention.map((skill) => {
                const daysSince = skill.userProgress?.last_practiced 
                  ? differenceInDays(new Date(), new Date(skill.userProgress.last_practiced))
                  : null;
                
                return (
                  <button
                    key={skill.id}
                    onClick={() => setSelectedSkill(skill)}
                    className="p-3 rounded-lg border border-border/50 bg-card hover:bg-muted/50 text-left transition-all hover:shadow-md"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{skill.icon || "🎯"}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{skill.name}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <span>Nível {skill.userProgress?.current_level || 1}</span>
                          {daysSince !== null && daysSince >= 14 && (
                            <Badge variant="outline" className="text-gameia-warning text-[10px]">
                              <Clock className="w-3 h-3 mr-1" />
                              {daysSince}d sem atividade
                            </Badge>
                          )}
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <Progress value={skill.progressPercent} className="h-1 mt-2" />
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Skills Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredSkills.map((skill, index) => (
            <SkillCard
              key={skill.id}
              skill={skill}
              index={index}
              onClick={() => setSelectedSkill(skill)}
            />
          ))}
        </AnimatePresence>
      </div>

      {filteredSkills.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          Nenhuma skill encontrada para este filtro.
        </div>
      )}

      {/* Detail Modal */}
      <SkillDetailModal
        skill={selectedSkill}
        isOpen={!!selectedSkill}
        onClose={() => setSelectedSkill(null)}
      />
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "p-4 rounded-xl border bg-card/50 backdrop-blur-sm",
        `border-${color}-500/20`
      )}
    >
      <div className="flex items-center gap-3">
        {icon}
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-lg font-bold">{value}</p>
        </div>
      </div>
    </motion.div>
  );
}

function SkillCard({
  skill,
  index,
  onClick,
}: {
  skill: SkillWithProgress;
  index: number;
  onClick: () => void;
}) {
  const isLocked = !skill.userProgress?.is_unlocked && !skill.is_unlocked_by_default;
  const level = skill.userProgress?.current_level || 1;
  const mastery = skill.userProgress?.mastery_level || 0;
  const categoryConfig = CATEGORY_CONFIG[skill.category || ""] || { label: skill.category, color: "text-primary" };

  return (
    <motion.button
      onClick={onClick}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ delay: index * 0.03 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "relative p-4 rounded-xl border text-left transition-all duration-300",
        "bg-card/80 backdrop-blur-sm hover:shadow-lg",
        isLocked
          ? "border-border/30 opacity-60"
          : "border-border/50 hover:border-primary/50 hover:shadow-primary/10"
      )}
    >
      {/* Lock overlay */}
      {isLocked && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-xl z-10">
          <Lock className="w-6 h-6 text-muted-foreground" />
        </div>
      )}

      {/* Icon */}
      <div className="text-3xl mb-2">{skill.icon || "🎯"}</div>

      {/* Name */}
      <h3 className="font-semibold text-sm line-clamp-1">{skill.name}</h3>

      {/* Category badge */}
      {skill.category && (
        <Badge variant="outline" className={cn("mt-2 text-xs", categoryConfig.color)}>
          {categoryConfig.label}
        </Badge>
      )}

      {/* Level & Progress */}
      <div className="mt-3 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Nível {level}</span>
          <span className={cn("font-medium", mastery >= 5 ? "text-primary" : "text-foreground")}>
            ⭐ {mastery}/5
          </span>
        </div>
        <Progress value={skill.progressPercent} className="h-1.5" />
      </div>

      {/* Related games indicator */}
      {skill.related_games && skill.related_games.length > 0 && (
        <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
          <Gamepad2 className="w-3 h-3" />
          <span>{skill.related_games.length} jogos</span>
        </div>
      )}

      {/* Arrow */}
      <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
    </motion.button>
  );
}
