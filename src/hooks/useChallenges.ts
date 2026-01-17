/**
 * Hook unificado para Desafios (antigo Commitments + MonthlyGoals)
 * 
 * Princípio fundamental: "Desafio não é conteúdo. Desafio é execução com prazo e consequência."
 * 
 * Suporta:
 * - Escopos: personal (individual), team e global
 * - Fontes: internal (automático) e external (manual)
 * - Origens: training, journey, pdi, assessment, manager, system
 * - Tipos: practical, cognitive, performance, consistency, team, strategic
 * - Comprovações: checkin, text, file, link, metric
 * - Sistema de Torcida (supporters)
 */

import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import type { 
  ChallengeType, 
  ChallengeOrigin, 
  ProofType 
} from "@/constants/challengeTypes";

// Re-export types from constants
export type { ChallengeType, ChallengeOrigin, ProofType } from "@/constants/challengeTypes";

export type ChallengeScope = "personal" | "team" | "global";
export type ChallengeSource = "internal" | "external";
export type ChallengeStatus = "draft" | "active" | "completed" | "failed" | "cancelled";
export type ChallengeRewardType = "coins" | "xp" | "both" | "insignia";

export interface Challenge {
  id: string;
  organization_id: string;
  team_id: string | null;
  created_by: string;
  name: string;
  description: string;
  scope: ChallengeScope;
  source: ChallengeSource;
  starts_at: string;
  ends_at: string;
  success_criteria: string;
  target_value: number;
  current_value: number;
  metric_type: string;
  reward_type: ChallengeRewardType;
  coins_reward: number;
  xp_reward: number;
  insignia_id: string | null;
  auto_enroll: boolean;
  max_participants: number | null;
  status: ChallengeStatus;
  icon: string;
  supporter_multiplier: number;
  total_staked: number;
  supporters_count: number;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  // New fields for Challenge System 2.0
  challenge_type: ChallengeType;
  origin_source: ChallengeOrigin;
  origin_id: string | null;
  proof_type: ProofType;
  diamonds_reward: number;
  context_why: string | null;
  is_overdue: boolean;
  skill_ids: string[];
  // Joined data
  team?: { name: string; icon: string; color: string };
  creator?: { nickname: string; avatar_url: string | null };
  participants_count?: number;
  is_participating?: boolean;
  is_supporting?: boolean;
  my_stake?: number;
}

export interface ChallengeParticipant {
  id: string;
  commitment_id: string;
  user_id: string;
  joined_at: string;
  individual_progress: number;
  contributed: boolean;
  reward_claimed: boolean;
  profile?: { nickname: string; avatar_url: string | null };
}

export interface ChallengeSupporter {
  id: string;
  commitment_id: string;
  supporter_id: string;
  coins_staked: number;
  created_at: string;
  reward_claimed: boolean;
  profile?: { nickname: string; avatar_url: string | null };
}

export interface CreateChallengeData {
  name: string;
  description: string;
  scope: ChallengeScope;
  source: ChallengeSource;
  team_id?: string | null;
  starts_at: string;
  ends_at: string;
  success_criteria: string;
  target_value: number;
  metric_type: string;
  reward_type: ChallengeRewardType;
  coins_reward?: number;
  xp_reward?: number;
  insignia_id?: string | null;
  auto_enroll?: boolean;
  max_participants?: number | null;
  icon?: string;
  reward_items?: Array<{
    item_id?: string;
    category?: string;
    unlock_mode: 'auto_unlock' | 'enable_purchase';
  }>;
  evolution_template_id?: string;
  // New fields for Challenge System 2.0
  challenge_type?: ChallengeType;
  origin_source?: ChallengeOrigin;
  origin_id?: string | null;
  proof_type?: ProofType;
  diamonds_reward?: number;
  context_why?: string;
  skill_ids?: string[];
}

// Interface for challenge proofs/evidence
export interface ChallengeProof {
  id: string;
  commitment_id: string;
  user_id: string;
  proof_type: ProofType;
  content: string | null;
  file_url: string | null;
  submitted_at: string;
  approved_at: string | null;
  approved_by: string | null;
}

// Métricas internas que podem ser rastreadas automaticamente
export const INTERNAL_METRICS = [
  { id: "engagement", label: "Engajamento (%)", description: "Percentual de dias ativos no período" },
  { id: "streak", label: "Streak Médio", description: "Média de dias consecutivos dos participantes" },
  { id: "xp_total", label: "XP Total", description: "XP acumulado pela equipe no período" },
  { id: "challenges_completed", label: "Desafios Concluídos", description: "Número de desafios finalizados" },
  { id: "arena_games", label: "Jogos na Arena", description: "Quantidade de jogos jogados" },
  { id: "trainings_completed", label: "Treinamentos", description: "Treinamentos finalizados" },
] as const;

// Templates para desafios pessoais (migrados de monthly_goals)
export const PERSONAL_CHALLENGE_TEMPLATES = [
  {
    name: "Subir de Nível",
    description: "Alcançar o próximo nível global",
    icon: "trending-up",
    metric_type: "level_up",
    target_value: 1,
    xp_reward: 300,
    coins_reward: 100,
  },
  {
    name: "Colecionador de Insígnias",
    description: "Desbloquear 3 novas insígnias",
    icon: "award",
    metric_type: "unlock_insignias",
    target_value: 3,
    xp_reward: 250,
    coins_reward: 75,
  },
  {
    name: "Sequência Épica",
    description: "Manter streak de 14 dias",
    icon: "flame",
    metric_type: "max_streak",
    target_value: 14,
    xp_reward: 400,
    coins_reward: 150,
  },
  {
    name: "Maratona de Jogos",
    description: "Jogar 30 partidas no mês",
    icon: "gamepad-2",
    metric_type: "games_played",
    target_value: 30,
    xp_reward: 200,
    coins_reward: 80,
  },
  {
    name: "Mestre do XP",
    description: "Ganhar 1000 XP no mês",
    icon: "zap",
    metric_type: "xp_earned",
    target_value: 1000,
    xp_reward: 350,
    coins_reward: 120,
  },
] as const;

export function useChallenges(orgId: string | undefined) {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [myChallenges, setMyChallenges] = useState<Challenge[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch all challenges for the organization
  const fetchChallenges = useCallback(async () => {
    if (!orgId) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("commitments")
        .select(`
          *,
          team:organization_teams(name, icon, color)
        `)
        .eq("organization_id", orgId)
        .order("is_featured", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Get participant counts
      const { data: participantCounts } = await supabase
        .from("commitment_participants")
        .select("commitment_id")
        .in("commitment_id", (data || []).map(c => c.id));

      const countMap = new Map<string, number>();
      participantCounts?.forEach(p => {
        countMap.set(p.commitment_id, (countMap.get(p.commitment_id) || 0) + 1);
      });

      // Check user participation
      const { data: myParticipations } = await supabase
        .from("commitment_participants")
        .select("commitment_id")
        .eq("user_id", user?.id || "");

      const participatingIds = new Set(myParticipations?.map(p => p.commitment_id) || []);

      // Check user support
      const { data: mySupports } = await supabase
        .from("challenge_supporters")
        .select("commitment_id, coins_staked")
        .eq("supporter_id", user?.id || "");

      const supportMap = new Map(mySupports?.map(s => [s.commitment_id, s.coins_staked]) || []);

      const enrichedChallenges = (data || []).map(c => ({
        ...c,
        participants_count: countMap.get(c.id) || 0,
        is_participating: participatingIds.has(c.id),
        is_supporting: supportMap.has(c.id),
        my_stake: supportMap.get(c.id) || 0,
      })) as Challenge[];

      setChallenges(enrichedChallenges);
      setMyChallenges(enrichedChallenges.filter(c => 
        c.is_participating || c.created_by === user?.id
      ));
    } catch (error) {
      console.error("Error fetching challenges:", error);
    } finally {
      setIsLoading(false);
    }
  }, [orgId, user?.id]);

  // Create a new challenge
  const createChallenge = useCallback(async (data: CreateChallengeData): Promise<Challenge | null> => {
    if (!orgId || !user?.id) return null;

    try {
      const { data: newChallenge, error } = await supabase
        .from("commitments")
        .insert({
          organization_id: orgId,
          created_by: user.id,
          ...data,
          status: "active",
          icon: data.icon || "target",
        })
        .select()
        .single();

      if (error) throw error;

      // Auto-enroll creator for personal challenges
      if (data.scope === "personal" || data.auto_enroll) {
        await supabase.from("commitment_participants").insert({
          commitment_id: newChallenge.id,
          user_id: user.id,
        });
      }

      toast.success("Desafio criado com sucesso!");
      await fetchChallenges();
      return newChallenge as Challenge;
    } catch (error) {
      console.error("Error creating challenge:", error);
      toast.error("Erro ao criar desafio");
      return null;
    }
  }, [orgId, user?.id, fetchChallenges]);

  // Create personal challenge from template
  const createPersonalChallenge = useCallback(async (
    templateIndex: number,
    endsAt: string
  ): Promise<Challenge | null> => {
    const template = PERSONAL_CHALLENGE_TEMPLATES[templateIndex];
    if (!template) return null;

    return createChallenge({
      name: template.name,
      description: template.description,
      scope: "personal",
      source: "internal",
      starts_at: new Date().toISOString(),
      ends_at: endsAt,
      success_criteria: template.description,
      target_value: template.target_value,
      metric_type: template.metric_type,
      reward_type: "both",
      xp_reward: template.xp_reward,
      coins_reward: template.coins_reward,
      icon: template.icon,
    });
  }, [createChallenge]);

  // Join a challenge
  const joinChallenge = useCallback(async (challengeId: string) => {
    if (!user?.id) return false;

    try {
      const { error } = await supabase.from("commitment_participants").insert({
        commitment_id: challengeId,
        user_id: user.id,
      });

      if (error) throw error;

      toast.success("Você entrou no desafio!");
      await fetchChallenges();
      return true;
    } catch (error) {
      console.error("Error joining challenge:", error);
      toast.error("Erro ao entrar no desafio");
      return false;
    }
  }, [user?.id, fetchChallenges]);

  // Leave a challenge
  const leaveChallenge = useCallback(async (challengeId: string) => {
    if (!user?.id) return false;

    try {
      const { error } = await supabase
        .from("commitment_participants")
        .delete()
        .eq("commitment_id", challengeId)
        .eq("user_id", user.id);

      if (error) throw error;

      toast.success("Você saiu do desafio");
      await fetchChallenges();
      return true;
    } catch (error) {
      console.error("Error leaving challenge:", error);
      toast.error("Erro ao sair do desafio");
      return false;
    }
  }, [user?.id, fetchChallenges]);

  // Support a challenge (Torcida)
  const supportChallenge = useCallback(async (
    challengeId: string,
    coinsToStake: number
  ) => {
    if (!user?.id) return false;

    try {
      const { error } = await supabase.from("challenge_supporters").insert({
        commitment_id: challengeId,
        supporter_id: user.id,
        coins_staked: coinsToStake,
      });

      if (error) throw error;

      toast.success(`🎉 Você apostou ${coinsToStake} moedas!`);
      await fetchChallenges();
      return true;
    } catch (error) {
      console.error("Error supporting challenge:", error);
      toast.error("Erro ao apoiar desafio");
      return false;
    }
  }, [user?.id, fetchChallenges]);

  // Remove support
  const removeSupport = useCallback(async (challengeId: string) => {
    if (!user?.id) return false;

    try {
      const { error } = await supabase
        .from("challenge_supporters")
        .delete()
        .eq("commitment_id", challengeId)
        .eq("supporter_id", user.id);

      if (error) throw error;

      toast.success("Apoio removido");
      await fetchChallenges();
      return true;
    } catch (error) {
      console.error("Error removing support:", error);
      toast.error("Erro ao remover apoio");
      return false;
    }
  }, [user?.id, fetchChallenges]);

  // Update progress (for external challenges)
  const updateProgress = useCallback(async (
    challengeId: string,
    newValue: number,
    note?: string
  ) => {
    if (!user?.id) return false;

    try {
      const { data: challenge } = await supabase
        .from("commitments")
        .select("current_value, target_value")
        .eq("id", challengeId)
        .single();

      const previousValue = challenge?.current_value || 0;

      const { error: updateError } = await supabase
        .from("commitments")
        .update({ current_value: newValue })
        .eq("id", challengeId);

      if (updateError) throw updateError;

      // Log progress
      await supabase.from("commitment_progress_logs").insert({
        commitment_id: challengeId,
        logged_by: user.id,
        previous_value: previousValue,
        new_value: newValue,
        change_amount: newValue - previousValue,
        note,
        source: "manual",
      });

      // Check if completed
      if (challenge && newValue >= challenge.target_value) {
        await supabase
          .from("commitments")
          .update({ status: "completed" })
          .eq("id", challengeId);

        // Distribute rewards via DB function
        await supabase.rpc("distribute_challenge_rewards", {
          p_commitment_id: challengeId,
        });

        // Process item rewards if configured
        const { data: fullChallenge } = await supabase
          .from("commitments")
          .select("reward_items, organization_id")
          .eq("id", challengeId)
          .single();

        if (fullChallenge?.reward_items && Array.isArray(fullChallenge.reward_items) && fullChallenge.reward_items.length > 0) {
          // Import dynamically to avoid circular deps
          for (const rewardConfig of fullChallenge.reward_items as Array<{ item_id?: string; category?: string; unlock_mode: string }>) {
            try {
              const item_id = rewardConfig.item_id;
              const unlock_mode = rewardConfig.unlock_mode || "auto_unlock";
              
              if (item_id && unlock_mode === "auto_unlock") {
                // Add directly to inventory
                await supabase.from("user_inventory").upsert({
                  user_id: user.id,
                  item_id: item_id,
                  purchased_at: new Date().toISOString(),
                  status: "active",
                }, { onConflict: "user_id,item_id" });
              } else if (item_id && unlock_mode === "enable_purchase") {
                // Enable for purchase
                await supabase.from("user_unlocked_items").upsert({
                  user_id: user.id,
                  item_id: item_id,
                  source_type: "challenge",
                  source_id: challengeId,
                  organization_id: fullChallenge.organization_id,
                }, { onConflict: "user_id,item_id" });
              }
            } catch (e) {
              console.error("Error processing item reward:", e);
            }
          }
        }

        toast.success("🏆 Desafio Completado!");
      } else {
        toast.success("Progresso atualizado!");
      }

      await fetchChallenges();
      return true;
    } catch (error) {
      console.error("Error updating progress:", error);
      toast.error("Erro ao atualizar progresso");
      return false;
    }
  }, [user?.id, fetchChallenges]);

  // Get supporters of a challenge
  const getSupporters = useCallback(async (challengeId: string): Promise<ChallengeSupporter[]> => {
    try {
      const { data, error } = await supabase
        .from("challenge_supporters")
        .select(`
          *,
          profile:profiles(nickname, avatar_url)
        `)
        .eq("commitment_id", challengeId)
        .order("coins_staked", { ascending: false });

      if (error) throw error;
      return (data || []) as unknown as ChallengeSupporter[];
    } catch (error) {
      console.error("Error fetching supporters:", error);
      return [];
    }
  }, []);

  // Cancel a challenge
  const cancelChallenge = useCallback(async (challengeId: string) => {
    try {
      const { error } = await supabase
        .from("commitments")
        .update({ status: "cancelled" })
        .eq("id", challengeId);

      if (error) throw error;

      toast.success("Desafio cancelado");
      await fetchChallenges();
      return true;
    } catch (error) {
      console.error("Error cancelling challenge:", error);
      toast.error("Erro ao cancelar desafio");
      return false;
    }
  }, [fetchChallenges]);

  // Submit proof/evidence for a challenge
  const submitProof = useCallback(async (
    challengeId: string,
    proofType: ProofType,
    content?: string,
    fileUrl?: string
  ): Promise<ChallengeProof | null> => {
    if (!user?.id) return null;

    try {
      const { data: proof, error } = await supabase
        .from("challenge_proofs")
        .insert({
          commitment_id: challengeId,
          user_id: user.id,
          proof_type: proofType,
          content,
          file_url: fileUrl,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success("Comprovação enviada com sucesso!");
      return proof as ChallengeProof;
    } catch (error) {
      console.error("Error submitting proof:", error);
      toast.error("Erro ao enviar comprovação");
      return null;
    }
  }, [user?.id]);

  // Get proofs for a challenge
  const getProofs = useCallback(async (challengeId: string): Promise<ChallengeProof[]> => {
    try {
      const { data, error } = await supabase
        .from("challenge_proofs")
        .select("*")
        .eq("commitment_id", challengeId)
        .order("submitted_at", { ascending: false });

      if (error) throw error;
      return (data || []) as ChallengeProof[];
    } catch (error) {
      console.error("Error fetching proofs:", error);
      return [];
    }
  }, []);

  // Approve a proof (for managers)
  const approveProof = useCallback(async (proofId: string): Promise<boolean> => {
    if (!user?.id) return false;

    try {
      const { error } = await supabase
        .from("challenge_proofs")
        .update({
          approved_at: new Date().toISOString(),
          approved_by: user.id,
        })
        .eq("id", proofId);

      if (error) throw error;

      toast.success("Comprovação aprovada!");
      return true;
    } catch (error) {
      console.error("Error approving proof:", error);
      toast.error("Erro ao aprovar comprovação");
      return false;
    }
  }, [user?.id]);

  // Create challenge from training module
  const createFromTraining = useCallback(async (
    moduleId: string,
    moduleName: string,
    trainingId: string,
    daysToComplete: number = 7
  ): Promise<Challenge | null> => {
    const endsAt = new Date();
    endsAt.setDate(endsAt.getDate() + daysToComplete);

    return createChallenge({
      name: `Aplicar: ${moduleName}`,
      description: `Coloque em prática o que você aprendeu no módulo "${moduleName}"`,
      scope: "personal",
      source: "external",
      starts_at: new Date().toISOString(),
      ends_at: endsAt.toISOString(),
      success_criteria: "Aplicar o aprendizado no trabalho",
      target_value: 1,
      metric_type: "completion",
      reward_type: "both",
      coins_reward: 50,
      xp_reward: 100,
      challenge_type: "practical",
      origin_source: "training",
      origin_id: trainingId,
      proof_type: "text",
      context_why: `Você aprendeu "${moduleName}". Agora é hora de aplicar na prática!`,
    });
  }, [createChallenge]);

  // Create challenge from PDI goal
  const createFromPDI = useCallback(async (
    goalId: string,
    goalName: string,
    deadline: string,
    skillIds: string[] = []
  ): Promise<Challenge | null> => {
    return createChallenge({
      name: goalName,
      description: `Desafio vinculado à meta do seu PDI: ${goalName}`,
      scope: "personal",
      source: "external",
      starts_at: new Date().toISOString(),
      ends_at: deadline,
      success_criteria: "Concluir a meta do PDI",
      target_value: 100,
      metric_type: "percentage",
      reward_type: "both",
      coins_reward: 75,
      xp_reward: 150,
      diamonds_reward: 10,
      challenge_type: "strategic",
      origin_source: "pdi",
      origin_id: goalId,
      proof_type: "text",
      skill_ids: skillIds,
      context_why: `Esta meta é parte do seu Plano de Desenvolvimento Individual.`,
    });
  }, [createChallenge]);

  // Fetch on mount
  useEffect(() => {
    fetchChallenges();
  }, [fetchChallenges]);

  // Filter helpers
  const activeChallenges = challenges.filter(c => c.status === "active");
  const completedChallenges = challenges.filter(c => c.status === "completed");
  const personalChallenges = challenges.filter(c => c.scope === "personal" && c.created_by === user?.id);
  const teamChallenges = challenges.filter(c => c.scope === "team");
  const globalChallenges = challenges.filter(c => c.scope === "global");
  const featuredChallenges = challenges.filter(c => c.is_featured && c.status === "active");
  const overdueChallenges = challenges.filter(c => c.is_overdue && c.status === "active");

  // Filter by type
  const getChallengesByType = useCallback((type: ChallengeType) => {
    return challenges.filter(c => c.challenge_type === type);
  }, [challenges]);

  // Filter by origin
  const getChallengesByOrigin = useCallback((origin: ChallengeOrigin) => {
    return challenges.filter(c => c.origin_source === origin);
  }, [challenges]);

  return {
    challenges,
    myChallenges,
    activeChallenges,
    completedChallenges,
    personalChallenges,
    teamChallenges,
    globalChallenges,
    featuredChallenges,
    overdueChallenges,
    isLoading,
    fetchChallenges,
    createChallenge,
    createPersonalChallenge,
    createFromTraining,
    createFromPDI,
    joinChallenge,
    leaveChallenge,
    supportChallenge,
    removeSupport,
    updateProgress,
    getSupporters,
    cancelChallenge,
    submitProof,
    getProofs,
    approveProof,
    getChallengesByType,
    getChallengesByOrigin,
  };
}
