/**
 * Hook para verificar permissões de acesso por área
 * Áreas: app, manage, console
 */

import { useCallback, useMemo } from "react";
import { useRoles, AppRole } from "./useRoles";
import { useOrganization } from "./useOrganization";

export type AppArea = "app" | "manage" | "console";

interface AreaPermissions {
  canAccessApp: boolean;
  canAccessManage: boolean;
  canAccessConsole: boolean;
  hasAreaAccess: (area: AppArea) => boolean;
  isLoading: boolean;
  highestRole: AppRole | null;
}

// Mapeamento de roles para áreas
// Nota: 'owner' será adicionado ao enum via migration, mas por ora
// tratamos no código de forma segura
const AREA_ACCESS_MAP: Record<string, AppArea[]> = {
  super_admin: ["app", "manage", "console"],
  owner: ["app", "manage", "console"],
  admin: ["app", "manage", "console"],
  manager: ["app", "manage"],
  user: ["app"],
};

export function useAreaPermissions(): AreaPermissions {
  const { highestRole, isLoading: rolesLoading } = useRoles();
  const { currentOrg, isLoading: orgLoading } = useOrganization();

  const isLoading = rolesLoading || orgLoading;

  // Verificar acesso a uma área específica
  const hasAreaAccess = useCallback((area: AppArea): boolean => {
    if (!highestRole) return area === "app"; // Usuário sem role tem acesso básico ao app
    
    const allowedAreas = AREA_ACCESS_MAP[highestRole] || ["app"];
    return allowedAreas.includes(area);
  }, [highestRole]);

  // Permissões derivadas
  const permissions = useMemo(() => ({
    canAccessApp: hasAreaAccess("app"),
    canAccessManage: hasAreaAccess("manage"),
    canAccessConsole: hasAreaAccess("console"),
  }), [hasAreaAccess]);

  return {
    ...permissions,
    hasAreaAccess,
    isLoading,
    highestRole,
  };
}
