/**
 * Página para aceitar convite via link
 * Rota: /invite/:code
 */

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Building2, Check, AlertTriangle, LogIn, Loader2, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useOrgInvites } from "@/hooks/useOrgInvites";
import { supabase } from "@/integrations/supabase/client";

export default function InvitePage() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { acceptInvite, isLoading } = useOrgInvites();
  
  const [inviteInfo, setInviteInfo] = useState<{
    valid: boolean;
    organization_name?: string;
    organization_id?: string;
    role?: string;
    error?: string;
    ssoBlocked?: boolean;
    allowedDomains?: string[];
  } | null>(null);
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Verifica info do convite (sem aceitar)
  useEffect(() => {
    if (!code) return;

    const checkInvite = async () => {
      try {
        const { data, error } = await supabase
          .from("organization_invites")
          .select(`
            id,
            role,
            expires_at,
            used_at,
            organization_id,
            organizations (name)
          `)
          .eq("invite_code", code)
          .maybeSingle();

        if (error || !data) {
          setInviteInfo({ valid: false, error: "Convite não encontrado" });
          return;
        }

        if (data.used_at) {
          setInviteInfo({ valid: false, error: "Este convite já foi usado" });
          return;
        }

        if (new Date(data.expires_at) < new Date()) {
          setInviteInfo({ valid: false, error: "Este convite expirou" });
          return;
        }

        setInviteInfo({
          valid: true,
          organization_name: (data.organizations as any)?.name,
          organization_id: data.organization_id,
          role: data.role,
        });
      } catch (err) {
        console.error("Erro ao verificar convite:", err);
        setInviteInfo({ valid: false, error: "Erro ao verificar convite" });
      }
    };

    checkInvite();
  }, [code]);

  // Verifica SSO quando usuário está autenticado
  useEffect(() => {
    if (!isAuthenticated || !user?.email || !inviteInfo?.organization_id || !inviteInfo.valid) return;

    const checkSSO = async () => {
      try {
        const { data: ssoConfig } = await supabase
          .from("organization_sso_config")
          .select("*")
          .eq("organization_id", inviteInfo.organization_id)
          .maybeSingle();

        if (!ssoConfig || !ssoConfig.is_enabled || !ssoConfig.require_domain_match) {
          return; // SSO não habilitado, permite qualquer email
        }

        const userDomain = user.email!.toLowerCase().split("@")[1];
        const allowedDomains = (ssoConfig.allowed_domains as string[]) || [];
        
        if (!allowedDomains.includes(userDomain)) {
          setInviteInfo(prev => prev ? {
            ...prev,
            ssoBlocked: true,
            allowedDomains,
          } : null);
        }
      } catch (err) {
        console.error("Erro ao verificar SSO:", err);
      }
    };

    checkSSO();
  }, [isAuthenticated, user?.email, inviteInfo?.organization_id, inviteInfo?.valid]);

  // Aceita o convite
  const handleAccept = async () => {
    if (!code) return;
    
    const result = await acceptInvite(code);
    
    if (result.success) {
      setAccepted(true);
      setTimeout(() => {
        navigate("/", { replace: true });
      }, 2000);
    } else {
      setError(result.error || "Erro ao aceitar convite");
    }
  };

  // Loading inicial
  if (authLoading || !inviteInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Verificando convite...</p>
        </div>
      </div>
    );
  }

  // Convite inválido
  if (!inviteInfo.valid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md p-8 rounded-2xl bg-card border border-border text-center"
        >
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-destructive" />
          </div>
          <h1 className="text-xl font-semibold text-foreground mb-2">
            Convite Inválido
          </h1>
          <p className="text-muted-foreground mb-6">
            {inviteInfo.error}
          </p>
          <Button onClick={() => navigate("/")} className="w-full">
            Voltar ao Início
          </Button>
        </motion.div>
      </div>
    );
  }

  // Não autenticado
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md p-8 rounded-2xl bg-card border border-border text-center"
        >
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-xl font-semibold text-foreground mb-2">
            Você foi convidado!
          </h1>
          <p className="text-muted-foreground mb-2">
            Para entrar em <span className="font-medium text-foreground">{inviteInfo.organization_name}</span>
          </p>
          <p className="text-sm text-muted-foreground/70 mb-6">
            Faça login ou crie uma conta para aceitar o convite
          </p>
          <Button 
            onClick={() => navigate(`/auth?redirect=/invite/${code}`)} 
            className="w-full"
          >
            <LogIn className="w-4 h-4 mr-2" />
            Fazer Login
          </Button>
        </motion.div>
      </div>
    );
  }

  // SSO bloqueado - email não permitido
  if (inviteInfo.ssoBlocked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md p-8 rounded-2xl bg-card border border-border text-center"
        >
          <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-amber-500" />
          </div>
          <h1 className="text-xl font-semibold text-foreground mb-2">
            Acesso Restrito por SSO
          </h1>
          <p className="text-muted-foreground mb-4">
            A organização <span className="font-medium text-foreground">{inviteInfo.organization_name}</span> requer email corporativo.
          </p>
          <div className="p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground mb-4">
            <p className="font-medium mb-1">Domínios permitidos:</p>
            {inviteInfo.allowedDomains?.map(domain => (
              <span key={domain} className="inline-block px-2 py-1 bg-primary/10 text-primary rounded mr-1 mt-1">
                @{domain}
              </span>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mb-6">
            Seu email: <span className="font-mono">{user?.email}</span>
          </p>
          <Button onClick={() => navigate("/")} className="w-full">
            Voltar ao Início
          </Button>
        </motion.div>
      </div>
    );
  }

  // Aceito com sucesso
  if (accepted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md p-8 rounded-2xl bg-card border border-border text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4"
          >
            <Check className="w-8 h-8 text-green-500" />
          </motion.div>
          <h1 className="text-xl font-semibold text-foreground mb-2">
            Bem-vindo à equipe! 🎉
          </h1>
          <p className="text-muted-foreground">
            Você agora faz parte de <span className="font-medium text-foreground">{inviteInfo.organization_name}</span>
          </p>
          <p className="text-sm text-muted-foreground/70 mt-4">
            Redirecionando...
          </p>
        </motion.div>
      </div>
    );
  }

  // Confirmar aceitação
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md p-8 rounded-2xl bg-card border border-border text-center"
      >
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Building2 className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-xl font-semibold text-foreground mb-2">
          Aceitar Convite
        </h1>
        <p className="text-muted-foreground mb-2">
          Você foi convidado para entrar em
        </p>
        <p className="text-lg font-medium text-foreground mb-1">
          {inviteInfo.organization_name}
        </p>
        <p className="text-sm text-muted-foreground/70 mb-6">
          Como <span className="capitalize">{inviteInfo.role}</span>
        </p>

        {error && (
          <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm mb-4">
            {error}
          </div>
        )}

        <div className="space-y-3">
          <Button 
            onClick={handleAccept} 
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Entrando...
              </>
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" />
                Aceitar Convite
              </>
            )}
          </Button>
          <Button 
            variant="outline" 
            onClick={() => navigate("/")}
            className="w-full"
          >
            Recusar
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
