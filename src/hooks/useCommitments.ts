/**
 * Hook para gerenciar Compromissos da organização
 * Suporta escopos: team (equipe) e global
 * Suporta fontes: internal (automático) e external (manual)
 */

import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export type CommitmentScope = "team" | "global";
export type CommitmentSource = "internal" | "external";
export type CommitmentStatus = "draft" | "active" | "completed" | "failed" | "cancelled";
export type CommitmentRewardType = "coins" | "xp" | "both" | "insignia";

export interface Commitment {
  id: string;
  organization_id: string;
  team_id: string | null;
  created_by: string;
  name: string;
  description: string;
  scope: CommitmentScope;
  source: CommitmentSource;
  starts_at: string;
  ends_at: string;
  success_criteria: string;
  target_value: number;
  current_value: number;
  metric_type: string;
  reward_type: CommitmentRewardType;
  coins_reward: number;
  xp_reward: number;
  insignia_id: string | null;
  auto_enroll: boolean;
  max_participants: number | null;
  status: CommitmentStatus;
  created_at: string;
  updated_at: string;
  // Joined data
  team?: { name: string; icon: string; color: string };
  creator?: { nickname: string; avatar_url: string | null };
  participants_count?: number;
  is_participating?: boolean;
}

export interface CommitmentParticipant {
  id: string;
  commitment_id: string;
  user_id: string;
  joined_at: string;
  individual_progress: number;
  contributed: boolean;
  reward_claimed: boolean;
  profile?: { nickname: string; avatar_url: string | null };
}

export interface CommitmentProgressLog {
  id: string;
  commitment_id: string;
  logged_by: string;
  previous_value: number | null;
  new_value: number;
  change_amount: number | null;
  note: string | null;
  source: string;
  created_at: string;
  logger?: { nickname: string };
}

export interface CreateCommitmentData {
  name: string;
  description: string;
  scope: CommitmentScope;
  source: CommitmentSource;
  team_id?: string | null;
  starts_at: string;
  ends_at: string;
  success_criteria: string;
  target_value: number;
  metric_type: string;
  reward_type: CommitmentRewardType;
  coins_reward?: number;
  xp_reward?: number;
  insignia_id?: string | null;
  auto_enroll?: boolean;
  max_participants?: number | null;
}

// Internal metric types that can be tracked automatically
export const INTERNAL_METRICS = [
  { id: "engagement", label: "Engajamento (%)", description: "Percentual de dias ativos no período" },
  { id: "streak", label: "Streak Médio", description: "Média de dias consecutivos dos participantes" },
  { id: "xp_total", label: "XP Total", description: "XP acumulado pela equipe no período" },
  { id: "challenges_completed", label: "Desafios Concluídos", description: "Número de desafios finalizados" },
  { id: "arena_games", label: "Jogos na Arena", description: "Quantidade de jogos jogados" },
  { id: "trainings_completed", label: "Treinamentos", description: "Treinamentos finalizados" },
] as const;

export function useCommitments(orgId: string | undefined) {
  const { user } = useAuth();
  const [commitments, setCommitments] = useState<Commitment[]>([]);
  const [myCommitments, setMyCommitments] = useState<Commitment[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch all commitments for the organization
  const fetchCommitments = useCallback(async () => {
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

      const enrichedCommitments = (data || []).map(c => ({
        ...c,
        participants_count: countMap.get(c.id) || 0,
        is_participating: participatingIds.has(c.id),
      })) as Commitment[];

      setCommitments(enrichedCommitments);
      setMyCommitments(enrichedCommitments.filter(c => c.is_participating));
    } catch (error) {
      console.error("Error fetching commitments:", error);
    } finally {
      setIsLoading(false);
    }
  }, [orgId, user?.id]);

  // Create a new commitment
  const createCommitment = useCallback(async (data: CreateCommitmentData): Promise<Commitment | null> => {
    if (!orgId || !user?.id) return null;

    try {
      const { data: newCommitment, error } = await supabase
        .from("commitments")
        .insert({
          organization_id: orgId,
          created_by: user.id,
          ...data,
          status: "active",
        })
        .select()
        .single();

      if (error) throw error;

      // Auto-enroll creator
      await supabase.from("commitment_participants").insert({
        commitment_id: newCommitment.id,
        user_id: user.id,
      });

      toast.success("Compromisso criado com sucesso!");
      await fetchCommitments();
      return newCommitment as Commitment;
    } catch (error) {
      console.error("Error creating commitment:", error);
      toast.error("Erro ao criar compromisso");
      return null;
    }
  }, [orgId, user?.id, fetchCommitments]);

  // Join a commitment
  const joinCommitment = useCallback(async (commitmentId: string) => {
    if (!user?.id) return false;

    try {
      const { error } = await supabase.from("commitment_participants").insert({
        commitment_id: commitmentId,
        user_id: user.id,
      });

      if (error) throw error;

      toast.success("Você entrou no compromisso!");
      await fetchCommitments();
      return true;
    } catch (error) {
      console.error("Error joining commitment:", error);
      toast.error("Erro ao entrar no compromisso");
      return false;
    }
  }, [user?.id, fetchCommitments]);

  // Leave a commitment
  const leaveCommitment = useCallback(async (commitmentId: string) => {
    if (!user?.id) return false;

    try {
      const { error } = await supabase
        .from("commitment_participants")
        .delete()
        .eq("commitment_id", commitmentId)
        .eq("user_id", user.id);

      if (error) throw error;

      toast.success("Você saiu do compromisso");
      await fetchCommitments();
      return true;
    } catch (error) {
      console.error("Error leaving commitment:", error);
      toast.error("Erro ao sair do compromisso");
      return false;
    }
  }, [user?.id, fetchCommitments]);

  // Update progress (for external commitments)
  const updateProgress = useCallback(async (
    commitmentId: string,
    newValue: number,
    note?: string
  ) => {
    if (!user?.id) return false;

    try {
      // Get current value
      const { data: commitment } = await supabase
        .from("commitments")
        .select("current_value")
        .eq("id", commitmentId)
        .single();

      const previousValue = commitment?.current_value || 0;

      // Update commitment
      const { error: updateError } = await supabase
        .from("commitments")
        .update({ current_value: newValue })
        .eq("id", commitmentId);

      if (updateError) throw updateError;

      // Log progress
      const { error: logError } = await supabase
        .from("commitment_progress_logs")
        .insert({
          commitment_id: commitmentId,
          logged_by: user.id,
          previous_value: previousValue,
          new_value: newValue,
          change_amount: newValue - previousValue,
          note,
          source: "manual",
        });

      if (logError) throw logError;

      toast.success("Progresso atualizado!");
      await fetchCommitments();
      return true;
    } catch (error) {
      console.error("Error updating progress:", error);
      toast.error("Erro ao atualizar progresso");
      return false;
    }
  }, [user?.id, fetchCommitments]);

  // Get participants of a commitment
  const getParticipants = useCallback(async (commitmentId: string): Promise<CommitmentParticipant[]> => {
    try {
      const { data, error } = await supabase
        .from("commitment_participants")
        .select(`
          *,
          profile:profiles(nickname, avatar_url)
        `)
        .eq("commitment_id", commitmentId)
        .order("joined_at");

      if (error) throw error;
      return (data || []) as unknown as CommitmentParticipant[];
    } catch (error) {
      console.error("Error fetching participants:", error);
      return [];
    }
  }, []);

  // Get progress logs of a commitment
  const getProgressLogs = useCallback(async (commitmentId: string): Promise<CommitmentProgressLog[]> => {
    try {
      const { data, error } = await supabase
        .from("commitment_progress_logs")
        .select(`
          *,
          logger:profiles(nickname)
        `)
        .eq("commitment_id", commitmentId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []) as unknown as CommitmentProgressLog[];
    } catch (error) {
      console.error("Error fetching progress logs:", error);
      return [];
    }
  }, []);

  // Cancel a commitment (creator/admin only)
  const cancelCommitment = useCallback(async (commitmentId: string) => {
    try {
      const { error } = await supabase
        .from("commitments")
        .update({ status: "cancelled" })
        .eq("id", commitmentId);

      if (error) throw error;

      toast.success("Compromisso cancelado");
      await fetchCommitments();
      return true;
    } catch (error) {
      console.error("Error cancelling commitment:", error);
      toast.error("Erro ao cancelar compromisso");
      return false;
    }
  }, [fetchCommitments]);

  // Fetch on mount
  useEffect(() => {
    fetchCommitments();
  }, [fetchCommitments]);

  // Filter helpers
  const activeCommitments = commitments.filter(c => c.status === "active");
  const completedCommitments = commitments.filter(c => c.status === "completed");

  return {
    commitments,
    myCommitments,
    activeCommitments,
    completedCommitments,
    isLoading,
    fetchCommitments,
    createCommitment,
    joinCommitment,
    leaveCommitment,
    updateProgress,
    getParticipants,
    getProgressLogs,
    cancelCommitment,
  };
}
