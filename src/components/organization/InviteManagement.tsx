/**
 * Gerenciamento de convites da organização (para admins)
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Link,
  Copy,
  Check,
  Mail,
  Clock,
  UserPlus,
  Trash2,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useOrgInvites, type OrgInvite } from "@/hooks/useOrgInvites";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

interface InviteManagementProps {
  organizationId: string;
  organizationName: string;
}

function InviteCard({ 
  invite, 
  onRevoke,
  getInviteUrl,
}: { 
  invite: OrgInvite; 
  onRevoke: () => void;
  getInviteUrl: (code: string) => string;
}) {
  const [copied, setCopied] = useState(false);
  const url = getInviteUrl(invite.invite_code);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isActive = !invite.is_expired && !invite.is_used;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className={cn(
        "p-4 rounded-xl border transition-colors",
        isActive 
          ? "bg-card border-border/50" 
          : "bg-muted/30 border-border/30 opacity-60"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Status badges */}
          <div className="flex items-center gap-2 mb-2">
            <Badge variant={isActive ? "default" : "secondary"}>
              {invite.is_used ? "Usado" : invite.is_expired ? "Expirado" : "Ativo"}
            </Badge>
            <Badge variant="outline" className="capitalize">
              {invite.role}
            </Badge>
            {invite.email && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Mail className="w-3 h-3" />
                {invite.email}
              </Badge>
            )}
          </div>

          {/* Code */}
          <div className="flex items-center gap-2 mb-2">
            <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
              {invite.invite_code.substring(0, 16)}...
            </code>
            {isActive && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={handleCopy}
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-green-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </Button>
            )}
          </div>

          {/* Metadata */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Expira {formatDistanceToNow(new Date(invite.expires_at), { 
                addSuffix: true, 
                locale: ptBR 
              })}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {isActive && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => window.open(url, "_blank")}
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={onRevoke}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export function InviteManagement({ 
  organizationId, 
  organizationName,
}: InviteManagementProps) {
  const { toast } = useToast();
  const {
    invites,
    isLoading,
    createInvite,
    revokeInvite,
    fetchInvites,
    getInviteUrl,
  } = useOrgInvites();

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newInviteEmail, setNewInviteEmail] = useState("");
  const [newInviteRole, setNewInviteRole] = useState<"member" | "admin">("member");
  const [newInviteExpiry, setNewInviteExpiry] = useState("7");
  const [createdInvite, setCreatedInvite] = useState<{ code: string; url: string } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchInvites(organizationId);
  }, [organizationId, fetchInvites]);

  const handleCreateInvite = async () => {
    const result = await createInvite({
      organizationId,
      email: newInviteEmail || undefined,
      role: newInviteRole,
      expiresInDays: parseInt(newInviteExpiry),
    });

    if (result) {
      setCreatedInvite(result);
      setNewInviteEmail("");
      fetchInvites(organizationId);
    }
  };

  const handleCopyUrl = async () => {
    if (!createdInvite) return;
    await navigator.clipboard.writeText(createdInvite.url);
    setCopied(true);
    toast({ title: "Link copiado!" });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCloseDialog = () => {
    setShowCreateDialog(false);
    setCreatedInvite(null);
    setNewInviteEmail("");
    setNewInviteRole("member");
    setNewInviteExpiry("7");
  };

  const activeInvites = invites.filter(i => !i.is_expired && !i.is_used);
  const inactiveInvites = invites.filter(i => i.is_expired || i.is_used);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Convites
          </h2>
          <p className="text-sm text-muted-foreground">
            Gerencie convites para {organizationName}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => fetchInvites(organizationId)}
            disabled={isLoading}
          >
            <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
          </Button>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="w-4 h-4 mr-2" />
                Novo Convite
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Convite</DialogTitle>
                <DialogDescription>
                  Gere um link de convite para novos membros
                </DialogDescription>
              </DialogHeader>

              {!createdInvite ? (
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email (opcional)</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="colaborador@empresa.com"
                      value={newInviteEmail}
                      onChange={(e) => setNewInviteEmail(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Se informado, apenas este email poderá usar o convite
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Cargo</Label>
                      <Select 
                        value={newInviteRole} 
                        onValueChange={(v) => setNewInviteRole(v as any)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="member">Membro</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Expira em</Label>
                      <Select 
                        value={newInviteExpiry} 
                        onValueChange={setNewInviteExpiry}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 dia</SelectItem>
                          <SelectItem value="3">3 dias</SelectItem>
                          <SelectItem value="7">7 dias</SelectItem>
                          <SelectItem value="14">14 dias</SelectItem>
                          <SelectItem value="30">30 dias</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button 
                    onClick={handleCreateInvite} 
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? "Criando..." : "Gerar Convite"}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4 pt-4">
                  <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30">
                    <div className="flex items-center gap-2 mb-2">
                      <Check className="w-5 h-5 text-green-500" />
                      <span className="font-medium text-green-600">
                        Convite criado!
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Compartilhe este link com o novo membro:
                    </p>
                    <div className="flex items-center gap-2">
                      <Input
                        readOnly
                        value={createdInvite.url}
                        className="font-mono text-xs"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={handleCopyUrl}
                      >
                        {copied ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <Button 
                    variant="outline" 
                    onClick={handleCloseDialog}
                    className="w-full"
                  >
                    Fechar
                  </Button>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Active invites */}
      {activeInvites.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">
            Ativos ({activeInvites.length})
          </h3>
          <AnimatePresence mode="popLayout">
            {activeInvites.map((invite) => (
              <InviteCard
                key={invite.id}
                invite={invite}
                onRevoke={() => revokeInvite(invite.id)}
                getInviteUrl={getInviteUrl}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Inactive invites */}
      {inactiveInvites.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">
            Expirados/Usados ({inactiveInvites.length})
          </h3>
          <AnimatePresence mode="popLayout">
            {inactiveInvites.slice(0, 5).map((invite) => (
              <InviteCard
                key={invite.id}
                invite={invite}
                onRevoke={() => {}}
                getInviteUrl={getInviteUrl}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Empty state */}
      {invites.length === 0 && !isLoading && (
        <div className="p-8 text-center rounded-xl border border-dashed border-border">
          <Link className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
          <p className="text-muted-foreground">
            Nenhum convite criado ainda
          </p>
          <p className="text-sm text-muted-foreground/70 mt-1">
            Crie um convite para adicionar novos membros
          </p>
        </div>
      )}
    </div>
  );
}
