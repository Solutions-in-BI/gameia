import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Trophy, Target, Star, Filter, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTrails } from "@/hooks/useTrails";
import { TrailCard } from "./TrailCard";
import { TrailBadge } from "./TrailBadge";
import { TrailDetailModal } from "./TrailDetailModal";
import { cn } from "@/lib/utils";

interface TrailsPageProps {
  onBack?: () => void;
}

const difficultyFilters = [
  { key: "all", label: "Todas" },
  { key: "beginner", label: "Iniciante" },
  { key: "intermediate", label: "Intermediário" },
  { key: "advanced", label: "Avançado" },
  { key: "expert", label: "Expert" },
];

export function TrailsPage({ onBack }: TrailsPageProps) {
  const { trails, missions, isLoading, getTrailProgress, isTrailCompleted, getOverallStats } = useTrails();
  const [selectedTrailId, setSelectedTrailId] = useState<string | null>(null);
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const stats = getOverallStats();

  // Filtrar trilhas
  const filteredTrails = trails.filter(trail => {
    const matchesDifficulty = difficultyFilter === "all" || trail.difficulty === difficultyFilter;
    const matchesSearch = trail.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (trail.description?.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesDifficulty && matchesSearch;
  });

  // Separar trilhas completas das incompletas
  const completedTrails = filteredTrails.filter(t => isTrailCompleted(t.id));
  const inProgressTrails = filteredTrails.filter(t => !isTrailCompleted(t.id));

  const selectedTrail = selectedTrailId ? trails.find(t => t.id === selectedTrailId) : null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onBack && (
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
          )}
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">
              Trilhas de Aprendizado
            </h1>
            <p className="text-muted-foreground text-sm">
              Complete missões e ganhe insígnias exclusivas
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <motion.div
          className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Trophy className="w-6 h-6 text-primary mb-2" />
          <p className="text-2xl font-bold text-foreground">{stats.completedTrails}</p>
          <p className="text-xs text-muted-foreground">Trilhas Completas</p>
        </motion.div>

        <motion.div
          className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20 rounded-xl p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Target className="w-6 h-6 text-emerald-500 mb-2" />
          <p className="text-2xl font-bold text-foreground">{stats.completedMissions}</p>
          <p className="text-xs text-muted-foreground">Missões Concluídas</p>
        </motion.div>

        <motion.div
          className="bg-gradient-to-br from-violet-500/10 to-violet-500/5 border border-violet-500/20 rounded-xl p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Star className="w-6 h-6 text-violet-500 mb-2" />
          <p className="text-2xl font-bold text-foreground">{stats.totalTrails}</p>
          <p className="text-xs text-muted-foreground">Total de Trilhas</p>
        </motion.div>

        <motion.div
          className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-500/20 rounded-xl p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="w-6 h-6 flex items-center justify-center text-amber-500 mb-2 text-lg">
            %
          </div>
          <p className="text-2xl font-bold text-foreground">{stats.percentageComplete}%</p>
          <p className="text-xs text-muted-foreground">Progresso Total</p>
        </motion.div>
      </div>

      {/* Completed Badges Showcase */}
      {completedTrails.length > 0 && (
        <motion.div
          className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border border-primary/20 rounded-xl p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-primary" />
            Suas Insígnias Conquistadas
          </h3>
          <div className="flex flex-wrap gap-4">
            {completedTrails.map((trail) => (
              <TrailBadge
                key={trail.id}
                icon={trail.icon}
                name={trail.name}
                difficulty={trail.difficulty}
                isUnlocked={true}
                size="sm"
                showGlow
                onClick={() => setSelectedTrailId(trail.id)}
              />
            ))}
          </div>
        </motion.div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar trilhas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
          {difficultyFilters.map((filter) => (
            <Button
              key={filter.key}
              variant={difficultyFilter === filter.key ? "default" : "outline"}
              size="sm"
              onClick={() => setDifficultyFilter(filter.key)}
              className="whitespace-nowrap"
            >
              {filter.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Trails Grid */}
      <div className="space-y-4">
        {inProgressTrails.length > 0 && (
          <>
            <h3 className="text-lg font-semibold text-foreground">
              Trilhas Disponíveis
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              {inProgressTrails.map((trail, index) => (
                <motion.div
                  key={trail.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <TrailCard
                    trail={trail}
                    progress={getTrailProgress(trail.id)}
                    isCompleted={false}
                    onClick={() => setSelectedTrailId(trail.id)}
                  />
                </motion.div>
              ))}
            </div>
          </>
        )}

        {completedTrails.length > 0 && (
          <>
            <h3 className="text-lg font-semibold text-foreground mt-6">
              Trilhas Concluídas
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              {completedTrails.map((trail, index) => (
                <motion.div
                  key={trail.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <TrailCard
                    trail={trail}
                    progress={getTrailProgress(trail.id)}
                    isCompleted={true}
                    onClick={() => setSelectedTrailId(trail.id)}
                  />
                </motion.div>
              ))}
            </div>
          </>
        )}

        {filteredTrails.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              Nenhuma trilha encontrada com esses filtros.
            </p>
          </div>
        )}
      </div>

      {/* Trail Detail Modal */}
      <AnimatePresence>
        {selectedTrail && (
          <TrailDetailModal
            trail={selectedTrail}
            missions={missions[selectedTrail.id] || []}
            isOpen={!!selectedTrailId}
            onClose={() => setSelectedTrailId(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
