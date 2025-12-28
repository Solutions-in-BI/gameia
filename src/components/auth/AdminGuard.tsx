/**
 * Guard para proteger rotas administrativas
 * Verifica se o usuário tem permissão de admin
 */

import { ReactNode, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useRoles } from "@/hooks/useRoles";
import { useOrganization } from "@/hooks/useOrganization";
import { Shield, AlertTriangle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { GameButton } from "@/components/game/common/GameButton";

interface AdminGuardProps {
  children: ReactNode;
  requiredRole?: "admin" | "manager" | "super_admin";
  fallbackPath?: string;
}

export function AdminGuard({
  children,
  requiredRole = "admin",
  fallbackPath = "/",
}: AdminGuardProps) {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { hasRole, hasAnyAdminRole, isLoading: rolesLoading } = useRoles();
  const { currentOrg, isAdmin: isOrgAdmin } = useOrganization();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);

  useEffect(() => {
    if (authLoading || rolesLoading) return;

    if (!isAuthenticated) {
      navigate("/auth");
      return;
    }

    // Check access based on required role
    let access = false;

    if (requiredRole === "super_admin") {
      access = hasRole("super_admin");
    } else if (requiredRole === "admin") {
      // Check both new roles system and legacy org admin
      access = hasAnyAdminRole(currentOrg?.id) || isOrgAdmin;
    } else if (requiredRole === "manager") {
      access = hasRole("manager", currentOrg?.id) || hasAnyAdminRole(currentOrg?.id) || isOrgAdmin;
    }

    setHasAccess(access);
  }, [
    isAuthenticated,
    authLoading,
    rolesLoading,
    hasRole,
    hasAnyAdminRole,
    currentOrg,
    isOrgAdmin,
    requiredRole,
    navigate,
  ]);

  // Loading state
  if (authLoading || rolesLoading || hasAccess === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
          <p className="text-muted-foreground">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  // Access denied
  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full text-center space-y-6"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-destructive/10">
            <Shield className="w-10 h-10 text-destructive" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-foreground">Acesso Restrito</h1>
            <p className="text-muted-foreground">
              Você não tem permissão para acessar esta área.
              {requiredRole === "super_admin" && " Apenas super administradores podem acessar."}
              {requiredRole === "admin" && " Apenas administradores da organização podem acessar."}
              {requiredRole === "manager" && " Apenas gerentes ou administradores podem acessar."}
            </p>
          </div>

          <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-600 dark:text-amber-400 text-left">
                Se você acredita que deveria ter acesso, entre em contato com o administrador da sua organização.
              </p>
            </div>
          </div>

          <div className="flex gap-3 justify-center">
            <GameButton variant="secondary" onClick={() => navigate(-1)}>
              Voltar
            </GameButton>
            <GameButton variant="primary" onClick={() => navigate(fallbackPath)}>
              Ir para Home
            </GameButton>
          </div>
        </motion.div>
      </div>
    );
  }

  // Access granted
  return <>{children}</>;
}
