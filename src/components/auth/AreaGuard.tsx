/**
 * AreaGuard - Protege rotas por área de acesso
 * Áreas: app, manage, console
 */

import { ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Shield, AlertTriangle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useAreaPermissions, AppArea } from "@/hooks/useAreaPermissions";
import { Button } from "@/components/ui/button";

interface AreaGuardProps {
  area: AppArea;
  children: ReactNode;
  fallbackPath?: string;
}

export function AreaGuard({ 
  area, 
  children, 
  fallbackPath = "/app" 
}: AreaGuardProps) {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { hasAreaAccess, isLoading: permissionsLoading } = useAreaPermissions();

  const isLoading = authLoading || permissionsLoading;
  const hasAccess = hasAreaAccess(area);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/auth", { replace: true });
    }
  }, [isLoading, isAuthenticated, navigate]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return null;
  }

  // Access denied
  if (!hasAccess) {
    const areaLabels: Record<AppArea, string> = {
      app: "Aplicativo",
      manage: "Gestão",
      console: "Console",
    };

    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="max-w-md w-full mx-4">
          <div className="bg-card border border-border rounded-2xl p-8 text-center shadow-lg">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-destructive/10 flex items-center justify-center">
              <Shield className="h-8 w-8 text-destructive" />
            </div>
            
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Acesso Restrito
            </h1>
            
            <div className="flex items-center justify-center gap-2 text-amber-500 mb-4">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-medium">Permissão Necessária</span>
            </div>
            
            <p className="text-muted-foreground mb-6">
              Você não tem permissão para acessar a área de{" "}
              <span className="font-semibold text-foreground">
                {areaLabels[area]}
              </span>
              . Entre em contato com o administrador da sua organização.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                variant="outline"
                onClick={() => navigate(-1)}
              >
                Voltar
              </Button>
              <Button
                onClick={() => navigate(fallbackPath)}
              >
                Ir para o App
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
