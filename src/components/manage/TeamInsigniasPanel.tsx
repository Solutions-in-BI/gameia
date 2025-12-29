/**
 * TeamInsigniasPanel - Visão gerencial de insígnias da equipe
 */

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Award,
  Star,
  Users,
  TrendingUp,
  Crown,
  Target,
  Heart,
  Zap,
  Sparkles,
  ChevronDown,
  ChevronRight,
  Search,
  Filter,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useOrganization } from "@/hooks/useOrganization";
import { useOrgTeams } from "@/hooks/useOrgTeams";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { INSIGNIA_TYPE_CONFIG, InsigniaType } from "@/types/insignias";
import { Skeleton } from "@/components/ui/skeleton";

interface MemberInsignia {
  user_id: string;
  nickname: string;
  avatar_url: string | null;
  team_name: string | null;
  insignias_count: number;
  recent_insignias: {
    id: string;
    icon: string;
    name: string;
    unlocked_at: string;
  }[];
}

interface TeamInsigniaStats {
  team_id: string;
  team_name: string;
  member_count: number;
  total_insignias: number;
  avg_per_member: number;
  top_members: MemberInsignia[];
}

const TYPE_ICONS: Record<InsigniaType, typeof Award> = {
  skill: Target,
  behavior: Heart,
  impact: Zap,
  leadership: Crown,
  special: Sparkles,
};

export function TeamInsigniasPanel() {
  const { currentOrg } = useOrganization();
  const { teams } = useOrgTeams(currentOrg?.id || "");
  const [selectedTeam, setSelectedTeam] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedTeams, setExpandedTeams] = useState<Set<string>>(new Set());

  // Fetch team insignia stats
  const { data: teamStats, isLoading } = useQuery({
    queryKey: ["team-insignias-stats", currentOrg?.id],
    queryFn: async () => {
      if (!currentOrg?.id) return [];

      // Get all members with their insignias
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db = supabase as any;
      const membersResult = await db
        .from("profiles")
        .select("id, nickname, avatar_url")
        .eq("organization_id", currentOrg.id);

      const members = (membersResult.data || []) as { id: string; nickname: string | null; avatar_url: string | null }[];

      if (members.length === 0) return [];

      // Get insignias for each member
      const memberIds = members.map(m => m.id);
      
      type UserInsigniaResult = { 
        user_id: string; 
        unlocked_at: string; 
        insignia: { id: string; icon: string; name: string } | null 
      };
      
      const insigniaResult = await db
        .from("user_insignias")
        .select(`
          user_id,
          unlocked_at,
          insignia:insignias(id, icon, name)
        `)
        .in("user_id", memberIds)
        .order("unlocked_at", { ascending: false });
      
      const userInsignias = (insigniaResult.data || []) as UserInsigniaResult[];

      // Group by member
      const memberInsigniasMap = (userInsignias || []).reduce((acc, ui) => {
        if (!acc[ui.user_id]) {
          acc[ui.user_id] = [];
        }
        const ins = ui.insignia as { id: string; icon: string; name: string } | null;
        if (ins) {
          acc[ui.user_id].push({
            id: ins.id,
            icon: ins.icon,
            name: ins.name,
            unlocked_at: ui.unlocked_at,
          });
        }
        return acc;
      }, {} as Record<string, { id: string; icon: string; name: string; unlocked_at: string }[]>);

      // Build member stats (without team for now - simplified)
      const memberStats: MemberInsignia[] = members.map(m => ({
        user_id: m.id,
        nickname: m.nickname || "Colaborador",
        avatar_url: m.avatar_url,
        team_name: null,
        insignias_count: memberInsigniasMap[m.id]?.length || 0,
        recent_insignias: (memberInsigniasMap[m.id] || []).slice(0, 5),
      }));

      // Group by team
      const teamStatsMap: Record<string, TeamInsigniaStats> = {};
      
      for (const team of teams) {
        const teamMembers = memberStats;
        const totalInsignias = teamMembers.reduce((sum, m) => sum + m.insignias_count, 0);
        
        teamStatsMap[team.id] = {
          team_id: team.id,
          team_name: team.name,
          member_count: teamMembers.length,
          total_insignias: totalInsignias,
          avg_per_member: teamMembers.length > 0 ? totalInsignias / teamMembers.length : 0,
          top_members: teamMembers
            .sort((a, b) => b.insignias_count - a.insignias_count)
            .slice(0, 5),
        };
      }

      // Add "Sem equipe" for members without team
      const noTeamMembers = memberStats.filter(m => !m.team_name);
      if (noTeamMembers.length > 0) {
        const totalInsignias = noTeamMembers.reduce((sum, m) => sum + m.insignias_count, 0);
        teamStatsMap["no-team"] = {
          team_id: "no-team",
          team_name: "Sem Equipe",
          member_count: noTeamMembers.length,
          total_insignias: totalInsignias,
          avg_per_member: noTeamMembers.length > 0 ? totalInsignias / noTeamMembers.length : 0,
          top_members: noTeamMembers
            .sort((a, b) => b.insignias_count - a.insignias_count)
            .slice(0, 5),
        };
      }

      return Object.values(teamStatsMap);
    },
    enabled: !!currentOrg?.id && teams.length > 0,
  });

  // Overall stats
  const overallStats = useMemo(() => {
    if (!teamStats) return { totalInsignias: 0, avgPerMember: 0, topTeam: null };
    
    const totalInsignias = teamStats.reduce((sum, t) => sum + t.total_insignias, 0);
    const totalMembers = teamStats.reduce((sum, t) => sum + t.member_count, 0);
    const avgPerMember = totalMembers > 0 ? totalInsignias / totalMembers : 0;
    const topTeam = teamStats.sort((a, b) => b.avg_per_member - a.avg_per_member)[0] || null;
    
    return { totalInsignias, avgPerMember, topTeam };
  }, [teamStats]);

  // Filter teams
  const filteredTeams = useMemo(() => {
    if (!teamStats) return [];
    return teamStats.filter(t => {
      const matchesTeam = selectedTeam === "all" || t.team_id === selectedTeam;
      const matchesSearch = !searchTerm || 
        t.team_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.top_members.some(m => m.nickname.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesTeam && matchesSearch;
    });
  }, [teamStats, selectedTeam, searchTerm]);

  const toggleTeamExpansion = (teamId: string) => {
    setExpandedTeams(prev => {
      const next = new Set(prev);
      if (next.has(teamId)) {
        next.delete(teamId);
      } else {
        next.add(teamId);
      }
      return next;
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" />
            Insígnias da Equipe
          </h2>
          <p className="text-sm text-muted-foreground">
            Acompanhe o progresso de reconhecimento do seu time
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/20">
              <Award className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">
                {overallStats.totalInsignias}
              </div>
              <div className="text-xs text-muted-foreground">Total de Insígnias</div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/20">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">
                {overallStats.avgPerMember.toFixed(1)}
              </div>
              <div className="text-xs text-muted-foreground">Média por Membro</div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-500/20"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/20">
              <Crown className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <div className="text-lg font-bold text-foreground truncate max-w-[150px]">
                {overallStats.topTeam?.team_name || "-"}
              </div>
              <div className="text-xs text-muted-foreground">Equipe Destaque</div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar equipe ou membro..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={selectedTeam} onValueChange={setSelectedTeam}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Todas equipes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas equipes</SelectItem>
            {teams.map(team => (
              <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Teams List */}
      <div className="space-y-4">
        {filteredTeams.map((team, index) => {
          const isExpanded = expandedTeams.has(team.team_id);
          
          return (
            <motion.div
              key={team.team_id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Collapsible open={isExpanded} onOpenChange={() => toggleTeamExpansion(team.team_id)}>
                <div className="rounded-xl border border-border bg-card overflow-hidden">
                  <CollapsibleTrigger className="w-full">
                    <div className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Users className="w-5 h-5 text-primary" />
                        </div>
                        <div className="text-left">
                          <div className="font-semibold text-foreground">{team.team_name}</div>
                          <div className="text-xs text-muted-foreground">
                            {team.member_count} membros
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <div className="font-bold text-foreground">{team.total_insignias}</div>
                          <div className="text-xs text-muted-foreground">insígnias</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-emerald-500">
                            {team.avg_per_member.toFixed(1)}
                          </div>
                          <div className="text-xs text-muted-foreground">média</div>
                        </div>
                        {isExpanded ? (
                          <ChevronDown className="w-5 h-5 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent>
                    <div className="border-t border-border p-4 bg-muted/30">
                      <h4 className="text-sm font-medium text-muted-foreground mb-3">
                        Top Membros
                      </h4>
                      <div className="space-y-3">
                        {team.top_members.map((member, idx) => (
                          <div
                            key={member.user_id}
                            className="flex items-center justify-between p-3 rounded-lg bg-background border border-border"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-lg font-bold text-muted-foreground w-6">
                                {idx + 1}
                              </span>
                              <Avatar className="w-8 h-8">
                                <AvatarImage src={member.avatar_url || undefined} />
                                <AvatarFallback>
                                  {member.nickname.slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium text-foreground text-sm">
                                  {member.nickname}
                                </div>
                                {member.recent_insignias.length > 0 && (
                                  <div className="flex gap-0.5 mt-0.5">
                                    {member.recent_insignias.slice(0, 4).map((ins) => (
                                      <span key={ins.id} className="text-sm" title={ins.name}>
                                        {ins.icon}
                                      </span>
                                    ))}
                                    {member.recent_insignias.length > 4 && (
                                      <span className="text-xs text-muted-foreground">
                                        +{member.recent_insignias.length - 4}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                            <Badge variant="secondary" className="gap-1">
                              <Award className="w-3 h-3" />
                              {member.insignias_count}
                            </Badge>
                          </div>
                        ))}
                        
                        {team.top_members.length === 0 && (
                          <p className="text-sm text-muted-foreground text-center py-4">
                            Nenhum membro com insígnias ainda
                          </p>
                        )}
                      </div>
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            </motion.div>
          );
        })}

        {filteredTeams.length === 0 && (
          <div className="p-8 text-center text-muted-foreground rounded-xl border border-border">
            Nenhuma equipe encontrada
          </div>
        )}
      </div>
    </div>
  );
}
