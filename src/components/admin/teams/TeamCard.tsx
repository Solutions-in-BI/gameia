import { motion } from "framer-motion";
import { Users, Settings, Crown, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { OrgTeam } from "@/hooks/useOrgTeams";

interface TeamCardProps {
  team: OrgTeam;
  onEdit: (team: OrgTeam) => void;
  onDelete: (teamId: string) => void;
  onManageMembers: (team: OrgTeam) => void;
}

export function TeamCard({ team, onEdit, onDelete, onManageMembers }: TeamCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative rounded-xl border bg-card p-5 shadow-sm transition-all hover:shadow-md"
      style={{ borderLeftColor: team.color, borderLeftWidth: "4px" }}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-lg text-2xl"
            style={{ backgroundColor: `${team.color}20` }}
          >
            {team.icon}
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{team.name}</h3>
            {team.description && (
              <p className="text-sm text-muted-foreground line-clamp-1">
                {team.description}
              </p>
            )}
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(team)}>
              <Settings className="mr-2 h-4 w-4" />
              Editar equipe
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onManageMembers(team)}>
              <Users className="mr-2 h-4 w-4" />
              Gerenciar membros
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => onDelete(team.id)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Excluir equipe
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Stats */}
      <div className="mt-4 flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>{team.members_count || 0} membros</span>
        </div>
        
        {team.manager && (
          <div className="flex items-center gap-2">
            <Crown className="h-4 w-4 text-amber-500" />
            <Avatar className="h-5 w-5">
              <AvatarImage src={team.manager.avatar_url || undefined} />
              <AvatarFallback className="text-[10px]">
                {team.manager.nickname?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-muted-foreground">
              {team.manager.nickname}
            </span>
          </div>
        )}
      </div>

      {/* Quick action */}
      <Button
        variant="outline"
        size="sm"
        className="mt-4 w-full"
        onClick={() => onManageMembers(team)}
      >
        <Users className="mr-2 h-4 w-4" />
        Ver membros
      </Button>
    </motion.div>
  );
}
