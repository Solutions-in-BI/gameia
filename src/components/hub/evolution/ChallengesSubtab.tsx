/**
 * ChallengesSubtab - Subtab de Desafios na Evolução
 * Sistema unificado: pessoal, equipe e global com torcida
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { Target, Coins } from "lucide-react";
import { 
  ChallengesSection, 
  ChallengeDetailModal, 
  CreateChallengeModal,
  SupportChallengeModal,
} from "@/components/challenges";
import { InputProgressModal } from "@/components/commitments/InputProgressModal";
import { useChallenges, Challenge } from "@/hooks/useChallenges";
import { useOrganization } from "@/hooks/useOrganization";
import { useOrgTeams } from "@/hooks/useOrgTeams";
import { useRoles } from "@/hooks/useRoles";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export function ChallengesSubtab() {
  const { user } = useAuth();
  const { currentOrg, isAdmin } = useOrganization();
  const { teams } = useOrgTeams(currentOrg?.id);
  const { isManager } = useRoles();
  
  const { 
    challenges,
    isLoading, 
    updateProgress,
    createChallenge,
    joinChallenge,
    leaveChallenge,
    supportChallenge,
    getSupporters,
  } = useChallenges(currentOrg?.id);

  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInputModal, setShowInputModal] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [userCoins, setUserCoins] = useState(0);

  // Check if user can create challenges
  const canCreateTeam = isManager || isAdmin;
  const canCreateGlobal = isAdmin;
  const canCreate = true; // Everyone can create personal challenges

  // Check if user can manage the selected challenge
  const canManageSelected = selectedChallenge && (
    isAdmin || 
    selectedChallenge.created_by === user?.id ||
    (selectedChallenge.team_id && teams.some(t => t.id === selectedChallenge.team_id && t.manager_id === user?.id))
  );

  const handleChallengeClick = (challenge: Challenge) => {
    setSelectedChallenge(challenge);
    setShowDetailModal(true);
  };

  const handleInputProgress = () => {
    setShowDetailModal(false);
    setShowInputModal(true);
  };

  const handleProgressSubmit = async (challengeId: string, newValue: number, note?: string) => {
    return await updateProgress(challengeId, newValue, note);
  };

  const handleSupportClick = async (challenge: Challenge) => {
    // Fetch user coins
    const { data } = await supabase
      .from("user_stats")
      .select("coins")
      .eq("user_id", user?.id || "")
      .single();
    
    setUserCoins(data?.coins || 0);
    setSelectedChallenge(challenge);
    setShowSupportModal(true);
  };

  const handleSupportSubmit = async (coins: number) => {
    if (!selectedChallenge) return false;
    return await supportChallenge(selectedChallenge.id, coins);
  };

  // Convert challenge to commitment format for InputProgressModal
  const selectedAsCommitment = selectedChallenge ? {
    id: selectedChallenge.id,
    name: selectedChallenge.name,
    current_value: selectedChallenge.current_value,
    target_value: selectedChallenge.target_value,
    source: selectedChallenge.source,
  } : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-xl bg-primary/10">
            <Target className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Desafios</h2>
            <p className="text-sm text-muted-foreground">
              Metas pessoais, de equipe e globais com sistema de torcida
            </p>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <ChallengesSection
        challenges={challenges}
        isLoading={isLoading}
        canCreate={canCreate}
        onCreateClick={() => setShowCreateModal(true)}
        onChallengeClick={handleChallengeClick}
        onJoin={joinChallenge}
        onLeave={leaveChallenge}
        onSupport={handleSupportClick}
        userId={user?.id}
      />

      {/* Detail Modal */}
      <ChallengeDetailModal
        challenge={selectedChallenge}
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        onJoin={() => selectedChallenge && joinChallenge(selectedChallenge.id)}
        onLeave={() => selectedChallenge && leaveChallenge(selectedChallenge.id)}
        onSupport={() => selectedChallenge && handleSupportClick(selectedChallenge)}
        onInputProgress={handleInputProgress}
        canManage={!!canManageSelected}
        getSupporters={getSupporters}
      />

      {/* Create Modal */}
      <CreateChallengeModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={createChallenge}
        teams={teams.map(t => ({ id: t.id, name: t.name, icon: t.icon || "👥" }))}
        canCreateTeam={canCreateTeam}
        canCreateGlobal={canCreateGlobal}
      />

      {/* Support Modal */}
      <SupportChallengeModal
        challenge={selectedChallenge}
        userCoins={userCoins}
        isOpen={showSupportModal}
        onClose={() => setShowSupportModal(false)}
        onSupport={handleSupportSubmit}
      />

      {/* Input Progress Modal */}
      <InputProgressModal
        commitment={selectedAsCommitment as any}
        open={showInputModal}
        onOpenChange={setShowInputModal}
        onSubmit={handleProgressSubmit}
      />
    </div>
  );
}

// Re-export with old name for backward compatibility
export { ChallengesSubtab as CommitmentsSubtab };
