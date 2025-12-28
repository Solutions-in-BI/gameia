/**
 * Página dedicada de Skills do usuário
 * Fase 4: Experiência do Usuário
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, Target, TrendingUp, Lock, ChevronRight, 
  Gamepad2, Award, Zap, Filter 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSkillProgress, SkillWithProgress } from "@/hooks/useSkillProgress";
import { SkillDetailModal } from "./SkillDetailModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CATEGORY_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  comunicacao: { label: "Comunicação", icon: <Sparkles className="w-4 h-4" />, color: "text-cyan-400" },
  lideranca: { label: "Liderança", icon: <Target className="w-4 h-4" />, color: "text-pink-400" },
  tecnico: { label: "Técnico", icon: <Zap className="w-4 h-4" />, color: "text-purple-400" },
  vendas: { label: "Vendas", icon: <TrendingUp className="w-4 h-4" />, color: "text-green-400" },
  analise: { label: "Análise", icon: <Award className="w-4 h-4" />, color: "text-amber-400" },
};

export function SkillsPage() {
  const { skills, isLoading, error } = useSkillProgress();
  const [selectedSkill, setSelectedSkill] = useState<SkillWithProgress | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Flatten skills with children
  const allSkills = skills.flatMap((s) => [s, ...s.children]);
  
  // Get unique categories
  const categories = [...new Set(allSkills.map((s) => s.category).filter(Boolean))] as string[];
  
  // Filter skills
  const filteredSkills = categoryFilter === "all" 
    ? allSkills 
    : allSkills.filter((s) => s.category === categoryFilter);

  // Stats
  const totalSkills = allSkills.length;
  const unlockedSkills = allSkills.filter((s) => s.userProgress?.is_unlocked).length;
  const masteredSkills = allSkills.filter((s) => s.userProgress?.mastery_level && s.userProgress.mastery_level >= 5).length;
  const totalXP = allSkills.reduce((sum, s) => sum + (s.userProgress?.total_xp || 0), 0);

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
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
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
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

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={<Target className="w-5 h-5 text-cyan-400" />}
          label="Desbloqueadas"
          value={`${unlockedSkills}/${totalSkills}`}
          color="cyan"
        />
        <StatCard
          icon={<Award className="w-5 h-5 text-purple-400" />}
          label="Maestria"
          value={masteredSkills.toString()}
          color="purple"
        />
        <StatCard
          icon={<Zap className="w-5 h-5 text-amber-400" />}
          label="XP Total"
          value={totalXP.toLocaleString()}
          color="amber"
        />
        <StatCard
          icon={<TrendingUp className="w-5 h-5 text-green-400" />}
          label="Progresso"
          value={`${Math.round((unlockedSkills / totalSkills) * 100)}%`}
          color="green"
        />
      </div>

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
          <span className={cn("font-medium", mastery >= 5 ? "text-amber-400" : "text-foreground")}>
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
