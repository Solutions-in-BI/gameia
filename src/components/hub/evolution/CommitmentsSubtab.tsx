/**
 * CommitmentsSubtab - Subtab de Compromissos na Evolução
 * Mostra compromissos com filtros e histórico
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { Handshake } from "lucide-react";
import { 
  CommitmentsSection, 
  CommitmentDetailModal, 
  CreateCommitmentModal, 
  InputProgressModal 
} from "@/components/commitments";
import { useCommitments, Commitment } from "@/hooks/useCommitments";
import { useOrganization } from "@/hooks/useOrganization";
import { useOrgTeams } from "@/hooks/useOrgTeams";
import { useRoles } from "@/hooks/useRoles";
import { useAuth } from "@/hooks/useAuth";
import { HubHeader } from "../common";

export function CommitmentsSubtab() {
  const { user } = useAuth();
  const { currentOrg, isAdmin } = useOrganization();
  const { teams } = useOrgTeams(currentOrg?.id);
  const { isManager } = useRoles();
  
  const { 
    commitments, 
    isLoading, 
    updateProgress,
    createCommitment 
  } = useCommitments(currentOrg?.id);

  const [selectedCommitment, setSelectedCommitment] = useState<Commitment | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInputModal, setShowInputModal] = useState(false);

  // Check if user can create commitments
  const canCreateTeam = isManager || isAdmin;
  const canCreateGlobal = isAdmin;
  const canCreate = canCreateTeam || canCreateGlobal;

  // Check if user can manage the selected commitment
  const canManageSelected = selectedCommitment && (
    isAdmin || 
    selectedCommitment.created_by === user?.id ||
    (selectedCommitment.team_id && teams.some(t => t.id === selectedCommitment.team_id && t.manager_id === user?.id))
  );

  const handleCommitmentClick = (commitment: Commitment) => {
    setSelectedCommitment(commitment);
    setShowDetailModal(true);
  };

  const handleInputProgress = () => {
    setShowDetailModal(false);
    setShowInputModal(true);
  };

  const handleProgressSubmit = async (commitmentId: string, newValue: number, note?: string) => {
    return await updateProgress(commitmentId, newValue, note);
  };

  

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-xl bg-primary/10">
            <Handshake className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Compromissos</h2>
            <p className="text-sm text-muted-foreground">
              Acordos coletivos de desempenho com incentivos internos
            </p>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <CommitmentsSection
        commitments={commitments}
        isLoading={isLoading}
        canCreate={canCreate}
        onCreateClick={() => setShowCreateModal(true)}
        onCommitmentClick={handleCommitmentClick}
        userId={user?.id}
      />

      {/* Detail Modal */}
      <CommitmentDetailModal
        commitment={selectedCommitment}
        open={showDetailModal}
        onOpenChange={setShowDetailModal}
        orgId={currentOrg?.id || ""}
        onInputProgress={handleInputProgress}
        userId={user?.id}
        canManage={!!canManageSelected}
      />

      {/* Create Modal */}
      <CreateCommitmentModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        teams={teams}
        canCreateGlobal={canCreateGlobal}
        onSubmit={async (data) => {
          await createCommitment(data);
        }}
      />

      {/* Input Progress Modal */}
      <InputProgressModal
        commitment={selectedCommitment}
        open={showInputModal}
        onOpenChange={setShowInputModal}
        onSubmit={handleProgressSubmit}
      />
    </div>
  );
}
