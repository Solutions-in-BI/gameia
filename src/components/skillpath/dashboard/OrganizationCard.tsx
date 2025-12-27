/**
 * Card da organização/empresa atual
 * Usuário só entra via convite (email ou link)
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Building2, 
  Users, 
  Target,
  ChevronRight,
  Clock,
  CheckCircle2,
  Link,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Organization, OrganizationChallenge, OrganizationMember } from "@/hooks/useOrganization";

interface OrganizationCardProps {
  organization: Organization | null;
  members: OrganizationMember[];
  challenges: OrganizationChallenge[];
  isAdmin: boolean;
  onCompleteChallenge: (id: string) => Promise<boolean>;
  onViewAll: () => void;
  onRefresh: () => Promise<void>;
}

export function OrganizationCard({
  organization,
  members,
  challenges,
  isAdmin,
  onCompleteChallenge,
  onViewAll,
  onRefresh,
}: OrganizationCardProps) {
  const { toast } = useToast();
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const pendingChallenges = challenges.filter(c => !c.progress || c.progress.status !== "completed");
  const completedChallenges = challenges.filter(c => c.progress?.status === "completed");

  // Aceitar convite por código
  const handleAcceptInvite = async () => {
    if (!inviteCode.trim()) return;
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.rpc('accept_invite', {
        p_invite_code: inviteCode.trim()
      });
      
      if (error) throw error;
      
      const result = data as { success: boolean; error?: string; organization_id?: string };
      
      if (result.success) {
        toast({ title: "Bem-vindo à empresa! 🎉" });
        setShowInviteDialog(false);
        setInviteCode("");
        await onRefresh();
      } else {
        toast({ title: result.error || "Erro ao aceitar convite", variant: "destructive" });
      }
    } catch (err) {
      console.error("Erro ao aceitar convite:", err);
      toast({ title: "Erro ao aceitar convite", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  // Sem organização - mostrar CTA para usar convite
  if (!organization) {
    return (
      <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/5 to-accent/5 border border-border/50 backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
            <Building2 className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Sua Empresa</h2>
            <p className="text-sm text-muted-foreground">Aguardando convite</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-background/50 border border-border/30">
            <Sparkles className="w-5 h-5 text-primary mt-0.5 shrink-0" />
            <div className="text-sm text-muted-foreground">
              <p className="font-medium text-foreground mb-1">Treinamento corporativo</p>
              <p>Receba um convite do RH ou administrador da sua empresa para acessar quizzes, cenários e desafios exclusivos.</p>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => setShowInviteDialog(true)}
          >
            <Link className="w-4 h-4 mr-2" />
            Tenho um código de convite
          </Button>
        </div>

        {/* Dialog para inserir código */}
        <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Usar Código de Convite</DialogTitle>
              <DialogDescription>
                Cole o código que você recebeu por email ou link da sua empresa.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <Input
                placeholder="Ex: a1b2c3d4e5f6..."
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                className="font-mono"
              />
              <Button 
                onClick={handleAcceptInvite} 
                disabled={isLoading || !inviteCode.trim()}
                className="w-full"
              >
                {isLoading ? "Verificando..." : "Entrar na Empresa"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Com organização - mostrar card normal
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
                    <span className="text-gameia-warning">+{challenge.coins_reward} 🪙</span>
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

      {challenges.length === 0 && (
        <div className="p-4 rounded-2xl bg-muted/30 border border-border/30 text-center">
          <Target className="w-8 h-8 mx-auto mb-2 text-muted-foreground opacity-50" />
          <p className="text-sm text-muted-foreground">
            Nenhum desafio ativo no momento
          </p>
        </div>
      )}
    </div>
  );
}
