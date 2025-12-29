/**
 * ChallengesSection - Seção unificada de desafios
 * Substitui CommitmentsSection e MonthlyGoalsCard
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Target, 
  Plus, 
  Filter, 
  Trophy, 
  Users, 
  User,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { ChallengeCard } from "./ChallengeCard";
import type { Challenge } from "@/hooks/useChallenges";

interface ChallengesSectionProps {
  challenges: Challenge[];
  isLoading: boolean;
  canCreate: boolean;
  onCreateClick: () => void;
  onChallengeClick: (challenge: Challenge) => void;
  onJoin?: (challengeId: string) => void;
  onLeave?: (challengeId: string) => void;
  onSupport?: (challenge: Challenge) => void;
  userId?: string;
}

type FilterType = "all" | "active" | "mine" | "completed" | "personal" | "team" | "global";

export function ChallengesSection({
  challenges,
  isLoading,
  canCreate,
  onCreateClick,
  onChallengeClick,
  onJoin,
  onLeave,
  onSupport,
  userId,
}: ChallengesSectionProps) {
  const [filter, setFilter] = useState<FilterType>("active");

  const filterChallenges = (items: Challenge[]): Challenge[] => {
    switch (filter) {
      case "active":
        return items.filter(c => c.status === "active");
      case "mine":
        return items.filter(c => c.is_participating || c.created_by === userId);
      case "completed":
        return items.filter(c => c.status === "completed");
      case "personal":
        return items.filter(c => c.scope === "personal" && c.status === "active");
      case "team":
        return items.filter(c => c.scope === "team" && c.status === "active");
      case "global":
        return items.filter(c => c.scope === "global" && c.status === "active");
      default:
        return items;
    }
  };

  const filtered = filterChallenges(challenges);
  const featuredChallenges = challenges.filter(c => c.is_featured && c.status === "active");

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-9 w-24" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">Desafios</h2>
          <Badge variant="secondary" className="text-xs">
            {challenges.filter(c => c.status === "active").length} ativos
          </Badge>
        </div>
        
        {canCreate && (
          <Button onClick={onCreateClick} size="sm">
            <Plus className="w-4 h-4 mr-1" />
            Novo
          </Button>
        )}
      </div>

      {/* Featured challenges */}
      {featuredChallenges.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-amber-400">
            <Sparkles className="w-4 h-4" />
            Em Destaque
          </div>
          {featuredChallenges.slice(0, 2).map(challenge => (
            <ChallengeCard
              key={challenge.id}
              challenge={challenge}
              variant="featured"
              onJoin={() => onJoin?.(challenge.id)}
              onLeave={() => onLeave?.(challenge.id)}
              onSupport={() => onSupport?.(challenge)}
              onView={() => onChallengeClick(challenge)}
            />
          ))}
        </div>
      )}

      {/* Filters */}
      <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterType)}>
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="active" className="text-xs">
            <Target className="w-3 h-3 mr-1" />
            Ativos
          </TabsTrigger>
          <TabsTrigger value="mine" className="text-xs">
            <User className="w-3 h-3 mr-1" />
            Meus
          </TabsTrigger>
          <TabsTrigger value="team" className="text-xs">
            <Users className="w-3 h-3 mr-1" />
            Equipe
          </TabsTrigger>
          <TabsTrigger value="completed" className="text-xs">
            <Trophy className="w-3 h-3 mr-1" />
            Completos
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Challenges list */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8"
            >
              <Target className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-muted-foreground mb-2">
                {filter === "mine" 
                  ? "Você não está participando de nenhum desafio"
                  : filter === "completed"
                  ? "Nenhum desafio completado ainda"
                  : "Nenhum desafio encontrado"}
              </p>
              {canCreate && filter !== "completed" && (
                <Button variant="outline" onClick={onCreateClick} size="sm">
                  <Plus className="w-4 h-4 mr-1" />
                  Criar Desafio
                </Button>
              )}
            </motion.div>
          ) : (
            filtered.map((challenge, index) => (
              <motion.div
                key={challenge.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: index * 0.05 }}
              >
                <ChallengeCard
                  challenge={challenge}
                  onJoin={() => onJoin?.(challenge.id)}
                  onLeave={() => onLeave?.(challenge.id)}
                  onSupport={() => onSupport?.(challenge)}
                  onView={() => onChallengeClick(challenge)}
                  showActions={false}
                />
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* View all link */}
      {filtered.length > 5 && (
        <Button variant="ghost" className="w-full text-muted-foreground">
          Ver todos os desafios
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      )}
    </div>
  );
}

// Compact version for dashboard highlights
export function ChallengesHighlight({
  challenges,
  onChallengeClick,
  onViewAllClick,
}: {
  challenges: Challenge[];
  onChallengeClick: (challenge: Challenge) => void;
  onViewAllClick: () => void;
}) {
  const active = challenges.filter(c => c.status === "active").slice(0, 3);

  if (active.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-primary" />
          <h3 className="font-medium text-sm">Desafios Ativos</h3>
        </div>
        <Button variant="ghost" size="sm" onClick={onViewAllClick}>
          Ver todos
          <ChevronRight className="w-3 h-3 ml-1" />
        </Button>
      </div>

      <div className="space-y-2">
        {active.map(challenge => (
          <ChallengeCard
            key={challenge.id}
            challenge={challenge}
            variant="compact"
            onView={() => onChallengeClick(challenge)}
            showActions={false}
          />
        ))}
      </div>
    </div>
  );
}
