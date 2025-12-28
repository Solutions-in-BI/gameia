/**
 * Tabela de membros com métricas
 */

import { useState } from "react";
import { Users, Search, Flame, Zap, Activity, Crown, Shield, User } from "lucide-react";
import { MemberWithMetrics } from "@/hooks/useOrgMetrics";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface Props {
  members: MemberWithMetrics[];
  isLoading: boolean;
}

export function MembersMetricsTable({ members, isLoading }: Props) {
  const [search, setSearch] = useState("");

  const filteredMembers = members.filter(
    (m) =>
      m.nickname.toLowerCase().includes(search.toLowerCase()) ||
      m.team_name?.toLowerCase().includes(search.toLowerCase())
  );

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "owner":
        return <Crown className="w-4 h-4 text-yellow-500" />;
      case "admin":
        return <Shield className="w-4 h-4 text-primary" />;
      default:
        return <User className="w-4 h-4 text-muted-foreground" />;
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

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-16 rounded-xl bg-muted/50 animate-pulse" />
        ))}
      </div>
    );
  }

  if (members.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
        <p className="text-muted-foreground">Nenhum membro encontrado</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Busca */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome ou equipe..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Tabela */}
      <div className="rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/50">
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                  Membro
                </th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                  Equipe
                </th>
                <th className="text-center p-4 text-sm font-medium text-muted-foreground">
                  <div className="flex items-center justify-center gap-1">
                    <Flame className="w-4 h-4" />
                    Streak
                  </div>
                </th>
                <th className="text-center p-4 text-sm font-medium text-muted-foreground">
                  <div className="flex items-center justify-center gap-1">
                    <Zap className="w-4 h-4" />
                    XP Total
                  </div>
                </th>
                <th className="text-center p-4 text-sm font-medium text-muted-foreground">
                  <div className="flex items-center justify-center gap-1">
                    <Activity className="w-4 h-4" />
                    Ativ. Semana
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((member, i) => (
                <tr
                  key={member.user_id}
                  className={cn(
                    "border-t border-border hover:bg-muted/30 transition-colors",
                    i % 2 === 0 && "bg-card"
                  )}
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center overflow-hidden">
                        {member.avatar_url ? (
                          <img
                            src={member.avatar_url}
                            alt={member.nickname}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-primary-foreground font-semibold">
                            {member.nickname.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-foreground">
                            {member.nickname}
                          </span>
                          {getRoleIcon(member.org_role)}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {getRoleLabel(member.org_role)}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-sm text-muted-foreground">
                      {member.team_name || "—"}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Flame
                        className={cn(
                          "w-4 h-4",
                          member.current_streak > 0
                            ? "text-orange-500"
                            : "text-muted-foreground/30"
                        )}
                      />
                      <span
                        className={cn(
                          "font-medium",
                          member.current_streak > 0
                            ? "text-foreground"
                            : "text-muted-foreground"
                        )}
                      >
                        {member.current_streak}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <span className="font-medium text-primary">
                      {member.total_xp.toLocaleString()}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                        member.activities_week > 5
                          ? "bg-green-500/10 text-green-500"
                          : member.activities_week > 0
                          ? "bg-yellow-500/10 text-yellow-500"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {member.activities_week}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Resumo */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {filteredMembers.length} de {members.length} membros
        </span>
        <span>
          XP Total: {members.reduce((acc, m) => acc + m.total_xp, 0).toLocaleString()}
        </span>
      </div>
    </div>
  );
}
