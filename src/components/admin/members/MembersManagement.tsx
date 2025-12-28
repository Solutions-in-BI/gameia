/**
 * Aba de Membros Melhorada com Filtros e Métricas Detalhadas
 */

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Crown,
  Shield,
  User,
  Flame,
  Zap,
  Activity,
  Calendar,
  MoreHorizontal,
  UserMinus,
  UserCog,
  Mail,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import type { MemberWithMetrics } from "@/hooks/useOrgMetrics";
import type { OrgTeam } from "@/hooks/useOrgTeams";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface MembersManagementProps {
  members: MemberWithMetrics[];
  teams: OrgTeam[];
  isLoading: boolean;
  onChangeRole?: (userId: string, newRole: string) => void;
  onMoveToTeam?: (userId: string, teamId: string | null) => void;
}

export function MembersManagement({
  members,
  teams,
  isLoading,
  onChangeRole,
  onMoveToTeam,
}: MembersManagementProps) {
  const [search, setSearch] = useState("");
  const [teamFilter, setTeamFilter] = useState<string>("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"xp" | "streak" | "activity" | "name">("xp");
  const [expandedMember, setExpandedMember] = useState<string | null>(null);
  const [selectedMember, setSelectedMember] = useState<MemberWithMetrics | null>(null);

  // Filtrar e ordenar membros
  const filteredMembers = useMemo(() => {
    let result = [...members];

    // Filtro de busca
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(
        (m) =>
          m.nickname.toLowerCase().includes(searchLower) ||
          m.team_name?.toLowerCase().includes(searchLower)
      );
    }

    // Filtro de equipe
    if (teamFilter !== "all") {
      if (teamFilter === "none") {
        result = result.filter((m) => !m.team_id);
      } else {
        result = result.filter((m) => m.team_id === teamFilter);
      }
    }

    // Filtro de cargo
    if (roleFilter !== "all") {
      result = result.filter((m) => m.org_role === roleFilter);
    }

    // Ordenação
    result.sort((a, b) => {
      switch (sortBy) {
        case "xp":
          return b.total_xp - a.total_xp;
        case "streak":
          return b.current_streak - a.current_streak;
        case "activity":
          return b.activities_week - a.activities_week;
        case "name":
          return a.nickname.localeCompare(b.nickname);
        default:
          return 0;
      }
    });

    return result;
  }, [members, search, teamFilter, roleFilter, sortBy]);

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "owner":
        return <Crown className="h-4 w-4 text-amber-500" />;
      case "admin":
        return <Shield className="h-4 w-4 text-primary" />;
      default:
        return <User className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "owner":
        return "Dono";
      case "admin":
        return "Admin";
      case "manager":
        return "Gestor";
      default:
        return "Membro";
    }
  };

  const getActivityLevel = (activities: number) => {
    if (activities >= 10) return { label: "Muito Ativo", color: "bg-green-500" };
    if (activities >= 5) return { label: "Ativo", color: "bg-primary" };
    if (activities >= 1) return { label: "Moderado", color: "bg-amber-500" };
    return { label: "Inativo", color: "bg-muted" };
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="h-20 rounded-xl bg-muted/50 animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou equipe..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={teamFilter} onValueChange={setTeamFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Equipe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as equipes</SelectItem>
            <SelectItem value="none">Sem equipe</SelectItem>
            {teams.map((team) => (
              <SelectItem key={team.id} value={team.id}>
                {team.icon} {team.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder="Cargo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os cargos</SelectItem>
            <SelectItem value="owner">Dono</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="manager">Gestor</SelectItem>
            <SelectItem value="member">Membro</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder="Ordenar" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="xp">Maior XP</SelectItem>
            <SelectItem value="streak">Maior Streak</SelectItem>
            <SelectItem value="activity">Mais Ativo</SelectItem>
            <SelectItem value="name">Nome A-Z</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Resumo */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Mostrando {filteredMembers.length} de {members.length} membros
        </span>
        <span>
          XP Total: {filteredMembers.reduce((sum, m) => sum + m.total_xp, 0).toLocaleString("pt-BR")}
        </span>
      </div>

      {/* Lista de Membros */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filteredMembers.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <User className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-muted-foreground">Nenhum membro encontrado</p>
            </motion.div>
          ) : (
            filteredMembers.map((member) => {
              const isExpanded = expandedMember === member.user_id;
              const activityLevel = getActivityLevel(member.activities_week);

              return (
                <motion.div
                  key={member.user_id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="rounded-xl border bg-card overflow-hidden"
                >
                  {/* Header do Card */}
                  <div
                    className="p-4 cursor-pointer hover:bg-muted/30 transition-colors"
                    onClick={() =>
                      setExpandedMember(isExpanded ? null : member.user_id)
                    }
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={member.avatar_url || undefined} />
                          <AvatarFallback>
                            {member.nickname.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-foreground">
                              {member.nickname}
                            </span>
                            {getRoleIcon(member.org_role)}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            {member.team_name ? (
                              <Badge variant="outline" className="text-xs">
                                {member.team_name}
                              </Badge>
                            ) : (
                              <span>Sem equipe</span>
                            )}
                            <span>•</span>
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium text-white ${activityLevel.color}`}>
                              {activityLevel.label}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="hidden sm:flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <Flame className="h-4 w-4 text-orange-500" />
                            <span>{member.current_streak}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Zap className="h-4 w-4 text-primary" />
                            <span>{member.total_xp.toLocaleString("pt-BR")}</span>
                          </div>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Detalhes Expandidos */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t bg-muted/20"
                      >
                        <div className="p-4 space-y-4">
                          {/* Métricas */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <div className="p-3 rounded-lg bg-card border">
                              <p className="text-xs text-muted-foreground">Streak</p>
                              <p className="text-lg font-bold text-orange-500">
                                🔥 {member.current_streak} dias
                              </p>
                            </div>
                            <div className="p-3 rounded-lg bg-card border">
                              <p className="text-xs text-muted-foreground">XP Total</p>
                              <p className="text-lg font-bold text-primary">
                                ⚡ {member.total_xp.toLocaleString("pt-BR")}
                              </p>
                            </div>
                            <div className="p-3 rounded-lg bg-card border">
                              <p className="text-xs text-muted-foreground">Atividades (7d)</p>
                              <p className="text-lg font-bold text-foreground">
                                📊 {member.activities_week}
                              </p>
                            </div>
                            <div className="p-3 rounded-lg bg-card border">
                              <p className="text-xs text-muted-foreground">Entrada</p>
                              <p className="text-sm font-medium text-foreground">
                                📅 {format(new Date(member.joined_at), "dd MMM yyyy", { locale: ptBR })}
                              </p>
                            </div>
                          </div>

                          {/* Ações */}
                          <div className="flex flex-wrap gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedMember(member)}
                            >
                              <UserCog className="h-4 w-4 mr-1" />
                              Ver Perfil Completo
                            </Button>
                            {onMoveToTeam && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    Mover para equipe
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                  <DropdownMenuItem
                                    onClick={() => onMoveToTeam(member.user_id, null)}
                                  >
                                    Remover da equipe
                                  </DropdownMenuItem>
                                  {teams.map((team) => (
                                    <DropdownMenuItem
                                      key={team.id}
                                      onClick={() => onMoveToTeam(member.user_id, team.id)}
                                    >
                                      {team.icon} {team.name}
                                    </DropdownMenuItem>
                                  ))}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      {/* Modal de Perfil Detalhado */}
      <Dialog open={!!selectedMember} onOpenChange={() => setSelectedMember(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Perfil do Membro</DialogTitle>
          </DialogHeader>
          {selectedMember && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedMember.avatar_url || undefined} />
                  <AvatarFallback className="text-xl">
                    {selectedMember.nickname.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-lg">{selectedMember.nickname}</h3>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    {getRoleIcon(selectedMember.org_role)}
                    {getRoleLabel(selectedMember.org_role)}
                    {selectedMember.team_name && ` • ${selectedMember.team_name}`}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">XP Total</span>
                    <span className="font-medium">{selectedMember.total_xp.toLocaleString("pt-BR")}</span>
                  </div>
                  <Progress value={Math.min((selectedMember.total_xp / 10000) * 100, 100)} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground">Streak Atual</p>
                    <p className="text-xl font-bold">{selectedMember.current_streak} 🔥</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground">Esta Semana</p>
                    <p className="text-xl font-bold">{selectedMember.activities_week} ações</p>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground">
                  Membro desde {format(new Date(selectedMember.joined_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
