/**
 * Card da organização/empresa atual
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Building2, 
  Users, 
  Target,
  Plus,
  ChevronRight,
  Trophy,
  Clock,
  CheckCircle2,
  Settings
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Organization, OrganizationChallenge, OrganizationMember } from "@/hooks/useOrganization";

interface OrganizationCardProps {
  organization: Organization | null;
  members: OrganizationMember[];
  challenges: OrganizationChallenge[];
  isAdmin: boolean;
  onCreateOrg: (name: string, slug: string) => Promise<Organization | null>;
  onJoinOrg: (slug: string) => Promise<boolean>;
  onCompleteChallenge: (id: string) => Promise<boolean>;
  onViewAll: () => void;
}

export function OrganizationCard({
  organization,
  members,
  challenges,
  isAdmin,
  onCreateOrg,
  onJoinOrg,
  onCompleteChallenge,
  onViewAll,
}: OrganizationCardProps) {
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [orgName, setOrgName] = useState("");
  const [orgSlug, setOrgSlug] = useState("");
  const [joinSlug, setJoinSlug] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const pendingChallenges = challenges.filter(c => !c.progress || c.progress.status !== "completed");
  const completedChallenges = challenges.filter(c => c.progress?.status === "completed");

  const handleCreate = async () => {
    if (!orgName.trim() || !orgSlug.trim()) return;
    setIsLoading(true);
    await onCreateOrg(orgName, orgSlug);
    setIsLoading(false);
    setShowCreateDialog(false);
    setOrgName("");
    setOrgSlug("");
  };

  const handleJoin = async () => {
    if (!joinSlug.trim()) return;
    setIsLoading(true);
    const success = await onJoinOrg(joinSlug);
    if (success) {
      setShowJoinDialog(false);
      setJoinSlug("");
    }
    setIsLoading(false);
  };

  if (!organization) {
    return (
      <div className="p-6 rounded-2xl bg-card/50 border border-border/50 backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
            <Building2 className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Empresa</h2>
            <p className="text-sm text-muted-foreground">Vincule-se a uma organização</p>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-4">
          Participe de desafios da empresa, ganhe XP e moedas, e acompanhe seu desenvolvimento profissional.
        </p>

        <div className="flex gap-2">
          <Dialog open={showJoinDialog} onOpenChange={setShowJoinDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex-1">
                Entrar em uma
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Entrar em uma Organização</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <Input
                  placeholder="Código da organização (slug)"
                  value={joinSlug}
                  onChange={(e) => setJoinSlug(e.target.value)}
                />
                <Button 
                  onClick={handleJoin} 
                  disabled={isLoading || !joinSlug.trim()}
                  className="w-full"
                >
                  Entrar
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="flex-1">
                <Plus className="w-4 h-4 mr-1" />
                Criar nova
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Organização</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <Input
                  placeholder="Nome da empresa"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                />
                <Input
                  placeholder="Código único (slug)"
                  value={orgSlug}
                  onChange={(e) => setOrgSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"))}
                />
                <Button 
                  onClick={handleCreate} 
                  disabled={isLoading || !orgName.trim() || !orgSlug.trim()}
                  className="w-full"
                >
                  Criar Organização
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Org header */}
      <div 
        onClick={onViewAll}
        className={cn(
          "p-4 rounded-2xl bg-card/50 border border-border/50 backdrop-blur-sm cursor-pointer",
          "hover:bg-card hover:border-primary/30 transition-all"
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              {organization.logo_url ? (
                <img 
                  src={organization.logo_url} 
                  alt={organization.name}
                  className="w-10 h-10 rounded-lg object-cover"
                />
              ) : (
                <Building2 className="w-6 h-6 text-primary" />
              )}
            </div>
            <div>
              <h2 className="font-semibold text-foreground">{organization.name}</h2>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Users className="w-3 h-3" />
                {members.length} membros
                {isAdmin && (
                  <span className="px-1.5 py-0.5 rounded bg-primary/20 text-primary text-xs">
                    Admin
                  </span>
                )}
              </div>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </div>
      </div>

      {/* Challenges */}
      {challenges.length > 0 && (
        <div className="p-4 rounded-2xl bg-card/50 border border-border/50 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-foreground flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" />
              Desafios ({pendingChallenges.length} ativos)
            </h3>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <CheckCircle2 className="w-3 h-3 text-green-500" />
              {completedChallenges.length} completos
            </div>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto">
            {pendingChallenges.slice(0, 3).map((challenge) => (
              <motion.div
                key={challenge.id}
                whileHover={{ scale: 1.01 }}
                className="flex items-center justify-between gap-3 p-3 rounded-xl bg-background/50 border border-border/30"
              >
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-sm text-foreground truncate">
                    {challenge.title}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="text-primary">+{challenge.xp_reward} XP</span>
                    <span className="text-warning">+{challenge.coins_reward} 🪙</span>
                    {challenge.deadline && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(challenge.deadline).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCompleteChallenge(challenge.id);
                  }}
                >
                  Completar
                </Button>
              </motion.div>
            ))}
            {pendingChallenges.length > 3 && (
              <button
                onClick={onViewAll}
                className="w-full text-center text-sm text-primary hover:underline py-2"
              >
                Ver todos os {pendingChallenges.length} desafios
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
