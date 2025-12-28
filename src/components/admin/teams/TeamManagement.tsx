import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Plus, Users, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOrgTeams, type OrgTeam } from "@/hooks/useOrgTeams";
import { supabase } from "@/integrations/supabase/client";
import { TeamCard } from "./TeamCard";
import { TeamFormModal } from "./TeamFormModal";
import { TeamMembersModal } from "./TeamMembersModal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Member {
  user_id: string;
  nickname: string;
  avatar_url: string | null;
  org_role: string;
  team_id: string | null;
  team_name?: string | null;
}

interface TeamManagementProps {
  orgId: string;
}

export function TeamManagement({ orgId }: TeamManagementProps) {
  const { teams, isLoading, createTeam, updateTeam, deleteTeam, assignMemberToTeam, fetchTeams } = useOrgTeams(orgId);
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  
  // Modal states
  const [formOpen, setFormOpen] = useState(false);
  const [membersModalOpen, setMembersModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<OrgTeam | null>(null);
  const [teamToDelete, setTeamToDelete] = useState<string | null>(null);

  // Fetch all members
  const fetchMembers = useCallback(async () => {
    if (!orgId) return;
    
    setIsLoadingMembers(true);
    try {
      const { data, error } = await supabase
        .from("organization_members")
        .select(`
          user_id,
          org_role,
          team_id,
          profiles!inner(nickname, avatar_url),
          organization_teams(name)
        `)
        .eq("organization_id", orgId);

      if (error) throw error;

      const formatted = (data || []).map((m: any) => ({
        user_id: m.user_id,
        nickname: m.profiles?.nickname || "Usuário",
        avatar_url: m.profiles?.avatar_url,
        org_role: m.org_role || "member",
        team_id: m.team_id,
        team_name: m.organization_teams?.name,
      }));

      setMembers(formatted);
    } catch (error) {
      console.error("Error fetching members:", error);
    } finally {
      setIsLoadingMembers(false);
    }
  }, [orgId]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  // Handlers
  const handleCreateTeam = () => {
    setSelectedTeam(null);
    setFormOpen(true);
  };

  const handleEditTeam = (team: OrgTeam) => {
    setSelectedTeam(team);
    setFormOpen(true);
  };

  const handleManageMembers = (team: OrgTeam) => {
    setSelectedTeam(team);
    setMembersModalOpen(true);
  };

  const handleDeleteClick = (teamId: string) => {
    setTeamToDelete(teamId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (teamToDelete) {
      await deleteTeam(teamToDelete);
      setDeleteDialogOpen(false);
      setTeamToDelete(null);
    }
  };

  const handleFormSubmit = async (data: Partial<OrgTeam>) => {
    if (data.id) {
      await updateTeam(data.id, data);
    } else {
      await createTeam(data);
    }
    fetchTeams();
  };

  const handleAssignMember = async (userId: string, teamId: string | null) => {
    await assignMemberToTeam(userId, teamId);
    await fetchMembers();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Equipes</h2>
          <p className="text-sm text-muted-foreground">
            Organize seus colaboradores em equipes
          </p>
        </div>
        <Button onClick={handleCreateTeam}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Equipe
        </Button>
      </div>

      {/* Teams grid */}
      {teams.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center rounded-xl border border-dashed py-12"
        >
          <Users className="h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-medium">Nenhuma equipe criada</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Crie sua primeira equipe para organizar os membros
          </p>
          <Button className="mt-4" onClick={handleCreateTeam}>
            <Plus className="mr-2 h-4 w-4" />
            Criar primeira equipe
          </Button>
        </motion.div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {teams.map((team) => (
            <TeamCard
              key={team.id}
              team={team}
              onEdit={handleEditTeam}
              onDelete={handleDeleteClick}
              onManageMembers={handleManageMembers}
            />
          ))}
        </div>
      )}

      {/* Stats */}
      {teams.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border bg-card p-4">
            <p className="text-sm text-muted-foreground">Total de equipes</p>
            <p className="text-2xl font-bold">{teams.length}</p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <p className="text-sm text-muted-foreground">Membros em equipes</p>
            <p className="text-2xl font-bold">
              {members.filter((m) => m.team_id).length}
            </p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <p className="text-sm text-muted-foreground">Sem equipe</p>
            <p className="text-2xl font-bold">
              {members.filter((m) => !m.team_id).length}
            </p>
          </div>
        </div>
      )}

      {/* Modals */}
      <TeamFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        team={selectedTeam}
        members={members}
        onSubmit={handleFormSubmit}
      />

      <TeamMembersModal
        open={membersModalOpen}
        onOpenChange={setMembersModalOpen}
        team={selectedTeam}
        allMembers={members}
        onAssign={handleAssignMember}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir equipe?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Os membros da equipe serão desvinculados, mas não removidos da organização.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
