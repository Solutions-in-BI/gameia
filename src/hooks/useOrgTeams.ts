/**
 * Hook para gerenciar equipes/times da organização
 */

import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface OrgTeam {
  id: string;
  organization_id: string;
  name: string;
  description: string | null;
  manager_id: string | null;
  parent_team_id: string | null;
  color: string;
  icon: string;
  created_at: string;
  updated_at: string;
  manager?: {
    nickname: string;
    avatar_url: string | null;
  };
  members_count?: number;
}

export function useOrgTeams(orgId: string | undefined) {
  const [teams, setTeams] = useState<OrgTeam[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchTeams = useCallback(async () => {
    if (!orgId) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("organization_teams")
        .select(`
          *,
          manager:profiles!organization_teams_manager_id_fkey(nickname, avatar_url)
        `)
        .eq("organization_id", orgId)
        .order("name");

      if (error) throw error;

      // Get member counts
      const { data: memberCounts } = await supabase
        .from("organization_members")
        .select("team_id")
        .eq("organization_id", orgId)
        .not("team_id", "is", null);

      const countMap = new Map<string, number>();
      memberCounts?.forEach((m) => {
        if (m.team_id) {
          countMap.set(m.team_id, (countMap.get(m.team_id) || 0) + 1);
        }
      });

      const teamsWithCounts = (data || []).map((t) => ({
        ...t,
        members_count: countMap.get(t.id) || 0,
      }));

      setTeams(teamsWithCounts);
    } catch (error) {
      console.error("Error fetching teams:", error);
    } finally {
      setIsLoading(false);
    }
  }, [orgId]);

  const createTeam = useCallback(
    async (team: Partial<OrgTeam>) => {
      if (!orgId) return null;

      try {
        const { data, error } = await supabase
          .from("organization_teams")
          .insert({
            organization_id: orgId,
            name: team.name || "Nova Equipe",
            description: team.description,
            manager_id: team.manager_id,
            color: team.color || "#6366f1",
            icon: team.icon || "👥",
          })
          .select()
          .single();

        if (error) throw error;

        setTeams((prev) => [...prev, { ...data, members_count: 0 }]);
        toast.success("Equipe criada com sucesso!");
        return data;
      } catch (error) {
        console.error("Error creating team:", error);
        toast.error("Erro ao criar equipe");
        return null;
      }
    },
    [orgId]
  );

  const updateTeam = useCallback(
    async (teamId: string, updates: Partial<OrgTeam>) => {
      try {
        const { error } = await supabase
          .from("organization_teams")
          .update({
            name: updates.name,
            description: updates.description,
            manager_id: updates.manager_id,
            color: updates.color,
            icon: updates.icon,
          })
          .eq("id", teamId);

        if (error) throw error;

        setTeams((prev) =>
          prev.map((t) => (t.id === teamId ? { ...t, ...updates } : t))
        );
        toast.success("Equipe atualizada!");
      } catch (error) {
        console.error("Error updating team:", error);
        toast.error("Erro ao atualizar equipe");
      }
    },
    []
  );

  const deleteTeam = useCallback(async (teamId: string) => {
    try {
      const { error } = await supabase
        .from("organization_teams")
        .delete()
        .eq("id", teamId);

      if (error) throw error;

      setTeams((prev) => prev.filter((t) => t.id !== teamId));
      toast.success("Equipe removida!");
    } catch (error) {
      console.error("Error deleting team:", error);
      toast.error("Erro ao remover equipe");
    }
  }, []);

  const assignMemberToTeam = useCallback(
    async (userId: string, teamId: string | null) => {
      if (!orgId) return;

      try {
        const { error } = await supabase
          .from("organization_members")
          .update({ team_id: teamId })
          .eq("organization_id", orgId)
          .eq("user_id", userId);

        if (error) throw error;

        await fetchTeams();
        toast.success(teamId ? "Membro atribuído à equipe!" : "Membro removido da equipe!");
      } catch (error) {
        console.error("Error assigning member to team:", error);
        toast.error("Erro ao atribuir membro");
      }
    },
    [orgId, fetchTeams]
  );

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  return {
    teams,
    isLoading,
    fetchTeams,
    createTeam,
    updateTeam,
    deleteTeam,
    assignMemberToTeam,
  };
}
