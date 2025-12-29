/**
 * CommitmentsSection - Seção completa de compromissos
 * Com filtros, grid de cards e estado vazio
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Filter, Handshake } from "lucide-react";
import { cn } from "@/lib/utils";
import { Commitment } from "@/hooks/useCommitments";
import { CommitmentCard } from "./CommitmentCard";
import { CommitmentEmptyState } from "./CommitmentEmptyState";
import { HubButton } from "@/components/hub/common";

type CommitmentFilter = "all" | "active" | "mine" | "completed";

interface CommitmentsSectionProps {
  commitments: Commitment[];
  isLoading: boolean;
  canCreate: boolean;
  onCreateClick: () => void;
  onCommitmentClick: (commitment: Commitment) => void;
  userId?: string;
}

const FILTERS: { id: CommitmentFilter; label: string }[] = [
  { id: "all", label: "Todos" },
  { id: "active", label: "Ativos" },
  { id: "mine", label: "Meus" },
  { id: "completed", label: "Encerrados" },
];

export function CommitmentsSection({
  commitments,
  isLoading,
  canCreate,
  onCreateClick,
  onCommitmentClick,
  userId,
}: CommitmentsSectionProps) {
  const [filter, setFilter] = useState<CommitmentFilter>("active");

  const filteredCommitments = commitments.filter(c => {
    switch (filter) {
      case "active":
        return c.status === "active";
      case "mine":
        return c.is_participating;
      case "completed":
        return c.status === "completed" || c.status === "failed";
      default:
        return true;
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-10 bg-muted/50 rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-64 bg-muted/30 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
          <Filter className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          {FILTERS.map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all",
                filter === f.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {canCreate && (
          <HubButton
            onClick={onCreateClick}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Novo Compromisso
          </HubButton>
        )}
      </div>

      {/* Content */}
      {filteredCommitments.length === 0 ? (
        <CommitmentEmptyState 
          filter={filter} 
          canCreate={canCreate}
          onCreateClick={onCreateClick}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCommitments.map((commitment, index) => (
            <motion.div
              key={commitment.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <CommitmentCard
                commitment={commitment}
                onClick={() => onCommitmentClick(commitment)}
              />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

// Compact version for Arena highlight
interface CommitmentsHighlightProps {
  commitments: Commitment[];
  onCommitmentClick: (commitment: Commitment) => void;
  onViewAllClick: () => void;
}

export function CommitmentsHighlight({
  commitments,
  onCommitmentClick,
  onViewAllClick,
}: CommitmentsHighlightProps) {
  const activeCommitments = commitments
    .filter(c => c.status === "active")
    .slice(0, 3);

  if (activeCommitments.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Handshake className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Compromissos Ativos</h3>
        </div>
        <button
          onClick={onViewAllClick}
          className="text-sm text-primary hover:underline"
        >
          Ver todos
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {activeCommitments.map(commitment => (
          <CommitmentCard
            key={commitment.id}
            commitment={commitment}
            variant="compact"
            onClick={() => onCommitmentClick(commitment)}
          />
        ))}
      </div>
    </motion.div>
  );
}
