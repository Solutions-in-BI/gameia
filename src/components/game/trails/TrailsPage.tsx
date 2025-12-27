import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Trophy, Target, Star, Rocket, Award, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTrails } from "@/hooks/useTrails";
import { InsigniaCard } from "./TrailCard";
import { InsigniaBadge } from "./TrailBadge";
import { InsigniaDetailModal } from "./TrailDetailModal";
import { cn } from "@/lib/utils";

interface InsigniasPageProps {
  onBack?: () => void;
}

const difficultyFilters = [
  { key: "all", label: "Todas" },
  { key: "beginner", label: "Iniciante" },
  { key: "intermediate", label: "Intermediário" },
  { key: "advanced", label: "Avançado" },
  { key: "expert", label: "Expert" },
];

// Mapear insígnias para formas únicas
const insigniaShapes: Record<string, "star" | "rocket" | "shield" | "hexagon" | "crown" | "bolt" | "target" | "trophy"> = {
  "fundamentos-vendas": "star",
  "tecnicas-avancadas": "rocket",
  "mestre-vendas": "crown",
  "decisoes-estrategicas": "target",
  "lideranca-essencial": "shield",
  "comunicacao-eficaz": "bolt",
};

export function InsigniasPage({ onBack }: InsigniasPageProps) {
  const { trails: insignias, missions, isLoading, getTrailProgress, isTrailCompleted, getOverallStats } = useTrails();
  const [selectedInsigniaId, setSelectedInsigniaId] = useState<string | null>(null);
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const stats = getOverallStats();

  // Filtrar insígnias
  const filteredInsignias = insignias.filter(insignia => {
    const matchesDifficulty = difficultyFilter === "all" || insignia.difficulty === difficultyFilter;
    const matchesSearch = insignia.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (insignia.description?.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesDifficulty && matchesSearch;
  });

  // Separar insígnias conquistadas das disponíveis
  const unlockedInsignias = filteredInsignias.filter(t => isTrailCompleted(t.id));
  const availableInsignias = filteredInsignias.filter(t => !isTrailCompleted(t.id));

  const selectedInsignia = selectedInsigniaId ? insignias.find(t => t.id === selectedInsigniaId) : null;

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
              Minhas Insígnias
            </h1>
            <p className="text-muted-foreground text-sm">
              Evolua nos jogos empresariais e conquiste insígnias exclusivas
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
          <Award className="w-6 h-6 text-primary mb-2" />
          <p className="text-2xl font-bold text-foreground">{stats.completedTrails}</p>
          <p className="text-xs text-muted-foreground">Insígnias Conquistadas</p>
        </motion.div>

        <motion.div
          className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20 rounded-xl p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Target className="w-6 h-6 text-emerald-500 mb-2" />
          <p className="text-2xl font-bold text-foreground">{stats.completedMissions}</p>
          <p className="text-xs text-muted-foreground">Desafios Vencidos</p>
        </motion.div>

        <motion.div
          className="bg-gradient-to-br from-violet-500/10 to-violet-500/5 border border-violet-500/20 rounded-xl p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Rocket className="w-6 h-6 text-violet-500 mb-2" />
          <p className="text-2xl font-bold text-foreground">{stats.totalTrails}</p>
          <p className="text-xs text-muted-foreground">Insígnias Disponíveis</p>
        </motion.div>

        <motion.div
          className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-500/20 rounded-xl p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Star className="w-6 h-6 text-amber-500 mb-2" />
          <p className="text-2xl font-bold text-foreground">{stats.percentageComplete}%</p>
          <p className="text-xs text-muted-foreground">Evolução Total</p>
        </motion.div>
      </div>

      {/* Insígnias Conquistadas Showcase */}
      {unlockedInsignias.length > 0 && (
        <motion.div
          className="bg-gradient-to-r from-amber-500/5 via-amber-500/10 to-amber-500/5 border border-amber-500/20 rounded-xl p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-500" />
            Suas Insígnias para a Camiseta 🎽
          </h3>
          <div className="flex flex-wrap gap-4">
            {unlockedInsignias.map((insignia) => (
              <InsigniaBadge
                key={insignia.id}
                icon={insignia.icon}
                name={insignia.name}
                shape={insigniaShapes[insignia.trail_key] || "hexagon"}
                difficulty={insignia.difficulty}
                isUnlocked={true}
                size="md"
                showGlow
                onClick={() => setSelectedInsigniaId(insignia.id)}
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
            placeholder="Buscar insígnias..."
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

      {/* Insígnias Grid */}
      <div className="space-y-4">
        {availableInsignias.length > 0 && (
          <>
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Rocket className="w-5 h-5 text-primary" />
              Insígnias para Conquistar
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              {availableInsignias.map((insignia, index) => (
                <motion.div
                  key={insignia.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <InsigniaCard
                    trail={insignia}
                    shape={insigniaShapes[insignia.trail_key] || "hexagon"}
                    progress={getTrailProgress(insignia.id)}
                    isCompleted={false}
                    onClick={() => setSelectedInsigniaId(insignia.id)}
                  />
                </motion.div>
              ))}
            </div>
          </>
        )}

        {unlockedInsignias.length > 0 && (
          <>
            <h3 className="text-lg font-semibold text-foreground mt-6 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              Insígnias Conquistadas
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              {unlockedInsignias.map((insignia, index) => (
                <motion.div
                  key={insignia.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <InsigniaCard
                    trail={insignia}
                    shape={insigniaShapes[insignia.trail_key] || "hexagon"}
                    progress={getTrailProgress(insignia.id)}
                    isCompleted={true}
                    onClick={() => setSelectedInsigniaId(insignia.id)}
                  />
                </motion.div>
              ))}
            </div>
          </>
        )}

        {filteredInsignias.length === 0 && (
          <div className="text-center py-12">
            <Award className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">
              Nenhuma insígnia encontrada com esses filtros.
            </p>
          </div>
        )}
      </div>

      {/* Insignia Detail Modal */}
      <AnimatePresence>
        {selectedInsignia && (
          <InsigniaDetailModal
            trail={selectedInsignia}
            shape={insigniaShapes[selectedInsignia.trail_key] || "hexagon"}
            missions={missions[selectedInsignia.id] || []}
            isOpen={!!selectedInsigniaId}
            onClose={() => setSelectedInsigniaId(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Alias para compatibilidade
export const TrailsPage = InsigniasPage;
