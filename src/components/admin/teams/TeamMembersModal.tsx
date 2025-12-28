import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserPlus, UserMinus, Search, Crown } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { OrgTeam } from "@/hooks/useOrgTeams";

interface Member {
  user_id: string;
  nickname: string;
  avatar_url: string | null;
  org_role: string;
  team_id: string | null;
  team_name?: string | null;
}

interface TeamMembersModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  team: OrgTeam | null;
  allMembers: Member[];
  onAssign: (userId: string, teamId: string | null) => void;
}

export function TeamMembersModal({
  open,
  onOpenChange,
  team,
  allMembers,
  onAssign,
}: TeamMembersModalProps) {
  const [search, setSearch] = useState("");

  const teamMembers = allMembers.filter((m) => m.team_id === team?.id);
  const availableMembers = allMembers.filter(
    (m) => m.team_id !== team?.id && 
    m.nickname.toLowerCase().includes(search.toLowerCase())
  );

  if (!team) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-2xl">{team.icon}</span>
            Membros de {team.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current members */}
          <div>
            <h4 className="mb-2 text-sm font-medium text-muted-foreground">
              Membros atuais ({teamMembers.length})
            </h4>
            <ScrollArea className="h-[150px]">
              <div className="space-y-2">
                <AnimatePresence mode="popLayout">
                  {teamMembers.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4 text-center">
                      Nenhum membro nesta equipe
                    </p>
                  ) : (
                    teamMembers.map((member) => (
                      <motion.div
                        key={member.user_id}
                        layout
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="flex items-center justify-between rounded-lg border bg-card p-2"
                      >
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={member.avatar_url || undefined} />
                            <AvatarFallback>
                              {member.nickname.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{member.nickname}</p>
                            <p className="text-xs text-muted-foreground capitalize">
                              {member.org_role}
                            </p>
                          </div>
                          {team.manager_id === member.user_id && (
                            <Crown className="h-4 w-4 text-amber-500" />
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onAssign(member.user_id, null)}
                        >
                          <UserMinus className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>
            </ScrollArea>
          </div>

          {/* Add members */}
          <div>
            <h4 className="mb-2 text-sm font-medium text-muted-foreground">
              Adicionar membros
            </h4>
            <div className="relative mb-2">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <ScrollArea className="h-[150px]">
              <div className="space-y-2">
                {availableMembers.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">
                    {search ? "Nenhum membro encontrado" : "Todos os membros já estão em equipes"}
                  </p>
                ) : (
                  availableMembers.map((member) => (
                    <motion.div
                      key={member.user_id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center justify-between rounded-lg border p-2"
                    >
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={member.avatar_url || undefined} />
                          <AvatarFallback>
                            {member.nickname.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{member.nickname}</p>
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-muted-foreground capitalize">
                              {member.org_role}
                            </span>
                            {member.team_name && (
                              <Badge variant="outline" className="text-[10px] h-4">
                                {member.team_name}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onAssign(member.user_id, team.id)}
                      >
                        <UserPlus className="h-4 w-4 mr-1" />
                        Adicionar
                      </Button>
                    </motion.div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
